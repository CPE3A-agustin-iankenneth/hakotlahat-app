'use client';

import { useEffect, useRef, useState } from 'react';
import { Package, AlertCircle, MapPin, Truck, Route, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import {
  Map,
  MapMarker,
  MarkerContent,
  MarkerTooltip,
  MapRoute,
  MapControls,
} from '@/components/ui/map';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { activateDriverSession } from '@/app/drv/actions';

export type PickupRequest = {
  id: string;
  latitude: number;
  longitude: number;
  status: 'pending' | 'scheduled' | 'collected';
  priority_score: number;
  volume_estimate: number | null;
  category: string;
  image_url: string | null;
  created_at: string;
  users: { full_name: string; municipality_id: string } | null;
};

export type DriverSession = {
  id: string;
  status: string;
  current_lat: number | null;
  current_lng: number | null;
  vehicles: { plate_number: string; capacity_volume: number } | null;
} | null;

export type RouteStop = {
  requestId: string;
  order: number;
  lng: number;
  lat: number;
  category: string | null;
  priority_score: number;
  volume_estimate: number | null;
  arrival: number;
};

export type ActiveRoute = {
  id: string;
  optimized_path: {
    coordinates: [number, number][];
    stops?: RouteStop[];
    totalDuration?: number;
    totalDistance?: number;
  } | null;
} | null;

type Props = {
  driverId: string;
  municipalityId: string;
  pickupRequests: PickupRequest[];
  activeRoute: ActiveRoute;
  driverSession: DriverSession;
  availableVehicles?: { id: string; plate_number: string; capacity_volume: number }[];
};

type GpsStatus = 'searching' | 'strong' | 'unavailable';

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatDistance(meters: number): string {
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${meters} m`;
}

export function DriverMapClient({
  driverId,
  municipalityId,
  pickupRequests,
  activeRoute,
  driverSession,
  availableVehicles = [],
}: Props) {
  const supabase = useRef(createClient());
  const sessionIdRef = useRef(driverSession?.id ?? null);

  const [driverLocation, setDriverLocation] = useState<{ lat: number; lng: number } | null>(
    driverSession?.current_lat && driverSession?.current_lng
      ? { lat: driverSession.current_lat, lng: driverSession.current_lng }
      : null
  );
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>('searching');
  const [selectedRequest, setSelectedRequest] = useState<PickupRequest | null>(
    pickupRequests[0] ?? null
  );
  const [isRouteActive, setIsRouteActive] = useState(driverSession?.status === 'ON_ROUTE');
  const [sessionStatus, setSessionStatus] = useState(driverSession?.status ?? 'OFF_DUTY');

  // Route optimization state
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<ActiveRoute>(activeRoute);
  const [routeStops, setRouteStops] = useState<RouteStop[]>(
    activeRoute?.optimized_path?.stops ?? []
  );
  const [collectedIds, setCollectedIds] = useState<string[]>([]);
  const [isCollecting, setIsCollecting] = useState(false);
  const [localRequests, setLocalRequests] = useState<PickupRequest[]>(pickupRequests);

  const vehiclePlate = driverSession?.vehicles?.plate_number ?? 'No vehicle assigned';
  const vehicleCapacity = driverSession?.vehicles?.capacity_volume ?? 0;

  const initialCenter: [number, number] =
    driverSession?.current_lng && driverSession?.current_lat
      ? [driverSession.current_lng, driverSession.current_lat]
      : [121.0, 12.5];
  const initialZoom = driverSession?.current_lat ? 14 : 6;

  // Session activation state
  const [sessionId, setSessionId] = useState<string | null>(driverSession?.id ?? null);
  const [isActivating, setIsActivating] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');

  // Keep sessionIdRef in sync so the GPS watcher persists to newly created sessions
  useEffect(() => { sessionIdRef.current = sessionId; }, [sessionId]);

  // GPS watch + driver_sessions update
  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsStatus('unavailable');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setDriverLocation({ lat: latitude, lng: longitude });
        setGpsStatus('strong');

        if (sessionIdRef.current) {
          await supabase.current
            .from('driver_sessions')
            .update({
              current_lat: latitude,
              current_lng: longitude,
              last_location_update: new Date().toISOString(),
            })
            .eq('id', sessionIdRef.current);
        }
      },
      () => setGpsStatus('unavailable'),
      { enableHighAccuracy: true, maximumAge: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  async function handleActivate() {
    if (!selectedVehicleId) return;
    setIsActivating(true);

    const coords = await new Promise<{ lat: number; lng: number } | null>((resolve) => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });

    const result = await activateDriverSession(
      selectedVehicleId,
      coords?.lat ?? 0,
      coords?.lng ?? 0
    );

    if ('error' in result) {
      toast.error(result.error);
      setIsActivating(false);
      return;
    }

    setSessionId(result.sessionId);
    if (coords) setDriverLocation(coords);
    setIsActivating(false);
  }

  async function toggleRoute() {
    const newStatus = isRouteActive ? 'ON_DUTY' : 'ON_ROUTE';
    setIsRouteActive(!isRouteActive);
    setSessionStatus(newStatus);

    if (sessionIdRef.current) {
      await supabase.current
        .from('driver_sessions')
        .update({ status: newStatus })
        .eq('id', sessionIdRef.current);
    }
  }

  async function optimizeRoute() {
    if (!driverLocation) {
      toast.error('GPS location required to optimize route');
      return;
    }
    if (localRequests.filter(r => r.status === 'pending').length === 0) {
      toast.error('No pending requests to optimize');
      return;
    }

    setIsOptimizing(true);
    try {
      const pendingIds = localRequests
        .filter(r => r.status === 'pending')
        .map(r => r.id);

      const payload = {
        driverLat: driverLocation.lat,
        driverLng: driverLocation.lng,
        vehicleCapacity,
        requestIds: pendingIds,
      };
      console.log('[optimizeRoute] Sending payload:', payload);

      const res = await fetch('/api/optimize-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json() as {
        routeId?: string;
        stops?: RouteStop[];
        totalDuration?: number;
        totalDistance?: number;
        error?: string;
        unassignedCount?: number;
      };

      console.log(`[optimizeRoute] Response ${res.status}:`, data);

      if (!res.ok || data.error) {
        console.error('[optimizeRoute] Error:', data.error);
        toast.error(data.error ?? 'Failed to optimize route');
        return;
      }

      const newRoute: ActiveRoute = {
        id: data.routeId!,
        optimized_path: {
          coordinates: [],
          stops: data.stops,
          totalDuration: data.totalDuration,
          totalDistance: data.totalDistance,
        },
      };
      setCurrentRoute(newRoute);
      setRouteStops(data.stops ?? []);
      setCollectedIds([]);

      // Update local request statuses to scheduled
      const assignedIds = new Set((data.stops ?? []).map(s => s.requestId));
      setLocalRequests(prev =>
        prev.map(r => assignedIds.has(r.id) ? { ...r, status: 'scheduled' as const } : r)
      );

      const summary = data.totalDuration && data.totalDistance
        ? ` — ${formatDuration(data.totalDuration)}, ${formatDistance(data.totalDistance)}`
        : '';
      toast.success(`Route optimized: ${data.stops?.length ?? 0} stops${summary}`);

      if ((data.unassignedCount ?? 0) > 0) {
        toast.warning(`${data.unassignedCount} requests couldn't fit in vehicle capacity`);
      }

      // Start route automatically
      if (!isRouteActive && sessionIdRef.current) {
        setIsRouteActive(true);
        setSessionStatus('ON_ROUTE');
        await supabase.current
          .from('driver_sessions')
          .update({ status: 'ON_ROUTE' })
          .eq('id', sessionIdRef.current);
      }
    } catch {
      toast.error('Network error — please try again');
    } finally {
      setIsOptimizing(false);
    }
  }

  async function markCollected(requestId: string) {
    setIsCollecting(true);
    try {
      const res = await fetch('/api/collect-pickup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
      });

      if (!res.ok) {
        toast.error('Failed to mark as collected');
        return;
      }

      setCollectedIds(prev => [...prev, requestId]);
      setLocalRequests(prev =>
        prev.map(r => r.id === requestId ? { ...r, status: 'collected' as const } : r)
      );

      const remaining = routeStops.filter(
        s => s.requestId !== requestId && !collectedIds.includes(s.requestId)
      );
      if (remaining.length === 0) {
        toast.success('All stops completed!');
      } else {
        toast.success('Marked as collected');
      }

      // Advance selected request to next uncollected stop
      const nextStop = routeStops.find(
        s => s.requestId !== requestId && !collectedIds.includes(s.requestId)
      );
      if (nextStop) {
        const nextReq = localRequests.find(r => r.id === nextStop.requestId);
        if (nextReq) setSelectedRequest(nextReq);
      }
    } catch {
      toast.error('Network error — please try again');
    } finally {
      setIsCollecting(false);
    }
  }

  const distanceToSelected =
    driverLocation && selectedRequest
      ? haversineKm(
          driverLocation.lat,
          driverLocation.lng,
          selectedRequest.latitude,
          selectedRequest.longitude
        ).toFixed(1)
      : null;

  const gpsLabel =
    gpsStatus === 'strong' ? 'Strong' : gpsStatus === 'searching' ? 'Searching…' : 'Unavailable';

  // Stops in order, excluding collected
  const nextStop = routeStops.find(s => !collectedIds.includes(s.requestId));
  const isSelectedCollected = selectedRequest ? collectedIds.includes(selectedRequest.id) : false;
  const isSelectedOnRoute = routeStops.some(s => s.requestId === selectedRequest?.id);
  const selectedStopOrder = routeStops.find(s => s.requestId === selectedRequest?.id)?.order;

  const routeSummary = currentRoute?.optimized_path;
  const pendingCount = localRequests.filter(r => r.status === 'pending').length;

  const visibleRequests = localRequests.filter(r => r.status !== 'collected');

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Session activation overlay — shown when no active session exists */}
      {!sessionId && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur">
          <div className="bg-card border border-border rounded-xl p-8 w-full max-w-sm shadow-xl space-y-6">
            <div>
              <h2 className="text-2xl font-bold">Start Your Shift</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Select your vehicle and activate your session to begin tracking.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground uppercase tracking-wide block">
                Assigned Vehicle
              </label>
              {availableVehicles.length === 0 ? (
                <p className="text-sm text-destructive">
                  No active vehicles in your municipality. Contact your admin.
                </p>
              ) : (
                <select
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-foreground"
                >
                  <option value="">— Select vehicle —</option>
                  {availableVehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.plate_number} · {v.capacity_volume}L
                    </option>
                  ))}
                </select>
              )}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block shrink-0" />
              Location access will be requested on activation.
            </p>
            <Button
              onClick={handleActivate}
              disabled={!selectedVehicleId || isActivating || availableVehicles.length === 0}
              className="w-full py-5 text-base font-bold bg-primary hover:bg-primary/90 text-foreground"
            >
              {isActivating ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" />Activating…</>
              ) : (
                'Go On Duty →'
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Map */}
      <div className="flex-1 relative">
        <Map center={initialCenter} zoom={initialZoom} className="w-full h-full">
          {/* Driver location — pulsing blue dot */}
          {driverLocation && (
            <MapMarker longitude={driverLocation.lng} latitude={driverLocation.lat}>
              <MarkerContent>
                <div className="relative flex items-center justify-center">
                  <div className="w-5 h-5 rounded-full bg-blue-500 border-2 border-white shadow-lg z-10" />
                  <div className="absolute w-5 h-5 rounded-full bg-blue-400 animate-ping opacity-60" />
                </div>
              </MarkerContent>
              <MarkerTooltip>
                <p className="font-medium">Your location</p>
              </MarkerTooltip>
            </MapMarker>
          )}

          {/* Pickup request markers */}
          {visibleRequests.map((req) => {
            const stopInfo = routeStops.find(s => s.requestId === req.id);
            const isNext = stopInfo?.requestId === nextStop?.requestId;
            const isSelected = req.id === selectedRequest?.id;

            return (
              <MapMarker
                key={req.id}
                longitude={req.longitude}
                latitude={req.latitude}
                onClick={() => setSelectedRequest(req)}
              >
                <MarkerContent>
                  <div className="relative flex items-center justify-center cursor-pointer">
                    <div
                      className={cn(
                        'rounded-full border-2 border-white shadow-md transition-transform hover:scale-110',
                        isSelected && 'ring-2 ring-white scale-110',
                        isNext
                          ? 'w-6 h-6 bg-primary'
                          : req.status === 'pending'
                            ? 'w-4 h-4 bg-amber-400'
                            : 'w-4 h-4 bg-emerald-500'
                      )}
                    />
                    {stopInfo && (
                      <span className="absolute -top-3 -right-2 text-[9px] font-black text-white bg-stone-800 rounded-full w-4 h-4 flex items-center justify-center leading-none">
                        {stopInfo.order}
                      </span>
                    )}
                  </div>
                </MarkerContent>
                <MarkerTooltip>
                  <p className="font-medium">{req.category}</p>
                  {stopInfo && <p className="text-xs opacity-75">Stop #{stopInfo.order}</p>}
                  <p className="text-xs opacity-75 capitalize">{req.status}</p>
                </MarkerTooltip>
              </MapMarker>
            );
          })}

          {/* Road-following route polyline */}
          {currentRoute?.optimized_path?.coordinates &&
            currentRoute.optimized_path.coordinates.length >= 2 && (
              <MapRoute
                coordinates={currentRoute.optimized_path.coordinates}
                color="#22c55e"
                width={4}
                opacity={0.85}
              />
            )}

          <MapControls
            position="bottom-left"
            showZoom
            showCompass
            showLocate
            onLocate={({ latitude, longitude }) =>
              setDriverLocation({ lat: latitude, lng: longitude })
            }
          />
        </Map>

        {/* Top Info Bar */}
        <div className="absolute top-4 left-4 right-4 z-10 bg-card/80 backdrop-blur rounded-lg p-4 flex justify-between items-center">
          <div className="flex gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'w-3 h-3 rounded-full',
                  gpsStatus === 'strong'
                    ? 'bg-primary'
                    : gpsStatus === 'searching'
                      ? 'bg-amber-400 animate-pulse'
                      : 'bg-destructive'
                )}
              />
              <span className="text-sm">GPS: {gpsLabel}</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-mono">{vehiclePlate}</span>
            </div>
          </div>
          <div className="flex gap-3 text-xs text-muted-foreground">
            {routeStops.length > 0 && (
              <span className="flex items-center gap-1 text-primary font-medium">
                <Route className="w-3 h-3" />
                {collectedIds.length}/{routeStops.length} collected
              </span>
            )}
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
              Pending
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              Scheduled
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
              You
            </span>
          </div>
        </div>

        {/* Session status chip */}
        <div className="absolute bottom-6 left-20 z-10 bg-card/80 backdrop-blur rounded-lg p-3">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'w-3 h-3 rounded-full',
                sessionStatus === 'ON_ROUTE'
                  ? 'bg-primary animate-pulse'
                  : 'bg-muted-foreground'
              )}
            />
            <span className="text-xs font-semibold text-muted-foreground">
              {sessionStatus === 'ON_ROUTE' ? 'Route Active' : 'Vehicle Synced'}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{vehiclePlate}</p>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-96 bg-card border-l border-border overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-card/95 backdrop-blur border-b border-border p-6 z-20">
          <div className="flex justify-between items-start gap-3">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                {selectedRequest ? (
                  selectedStopOrder
                    ? `Stop #${selectedStopOrder} of ${routeStops.length}`
                    : 'Selected Pickup'
                ) : 'No pickup selected'}
              </p>
              {selectedRequest ? (
                <h2 className="text-2xl font-bold mt-2 truncate">
                  {selectedRequest.category}
                </h2>
              ) : (
                <p className="text-muted-foreground mt-2">Click a node on the map</p>
              )}
            </div>
            {selectedRequest && (
              <Badge
                className={cn(
                  'shrink-0 rounded capitalize',
                  isSelectedCollected
                    ? 'bg-stone-500/20 text-stone-400 hover:bg-stone-500/20'
                    : selectedRequest.status === 'pending'
                      ? 'bg-amber-400/20 text-amber-400 hover:bg-amber-400/20'
                      : 'bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20'
                )}
              >
                {isSelectedCollected ? 'collected' : selectedRequest.status}
              </Badge>
            )}
          </div>

          {/* Route summary strip */}
          {routeSummary?.totalDuration && routeSummary?.totalDistance && (
            <div className="mt-3 flex gap-4 text-xs text-muted-foreground border-t border-border pt-3">
              <span>
                <span className="font-semibold text-foreground">
                  {formatDuration(routeSummary.totalDuration)}
                </span>{' '}
                total
              </span>
              <span>
                <span className="font-semibold text-foreground">
                  {formatDistance(routeSummary.totalDistance)}
                </span>{' '}
                distance
              </span>
              <span>
                <span className="font-semibold text-foreground">{routeStops.length}</span> stops
              </span>
            </div>
          )}
        </div>

        {/* Details */}
        {selectedRequest ? (
          <div className="p-6 space-y-6 flex-1">
            {/* Distance + Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Distance</p>
                {distanceToSelected ? (
                  <p className="text-3xl font-bold text-foreground mt-2">
                    {distanceToSelected}
                    <span className="text-lg text-muted-foreground ml-1">km</span>
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground mt-2">GPS needed</p>
                )}
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Priority</p>
                <p className="text-3xl font-bold text-primary mt-2">
                  {selectedRequest.priority_score}
                  <span className="text-lg text-muted-foreground ml-1">/10</span>
                </p>
              </div>
            </div>

            {/* Category */}
            <div className="flex items-start gap-3">
              <Package className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Waste Category</p>
                <p className="text-foreground font-medium">{selectedRequest.category}</p>
              </div>
            </div>

            {/* Volume */}
            {selectedRequest.volume_estimate !== null && (
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Volume Estimate</p>
                  <p className="text-foreground font-medium">{selectedRequest.volume_estimate} L</p>
                </div>
              </div>
            )}

            {/* Resident */}
            {selectedRequest.users?.full_name && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Requested by</p>
                  <p className="text-foreground font-medium">{selectedRequest.users.full_name}</p>
                </div>
              </div>
            )}

            {/* Image */}
            {selectedRequest.image_url && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Photo</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedRequest.image_url}
                  alt="Waste pickup"
                  className="w-full rounded-lg object-cover max-h-40"
                />
              </div>
            )}

            {/* Coordinates + date */}
            <div className="text-xs text-muted-foreground border-t border-border pt-4">
              <p>
                {selectedRequest.latitude.toFixed(5)}, {selectedRequest.longitude.toFixed(5)}
              </p>
              <p className="mt-1">
                Submitted {new Date(selectedRequest.created_at).toLocaleDateString()}
              </p>
            </div>

            {/* Mark Collected button — only if this stop is on the active route */}
            {isSelectedOnRoute && !isSelectedCollected && (
              <Button
                onClick={() => markCollected(selectedRequest.id)}
                disabled={isCollecting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                {isCollecting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                )}
                MARK AS COLLECTED
              </Button>
            )}

            {isSelectedCollected && (
              <div className="flex items-center gap-2 text-stone-400 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>This stop has been collected</span>
              </div>
            )}

            {/* All stops list */}
            {visibleRequests.length > 1 && (
              <div className="border-t border-border pt-6">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">
                  {routeStops.length > 0
                    ? `Route Stops (${routeStops.length - collectedIds.length} remaining)`
                    : `All Requests (${visibleRequests.length})`}
                </p>
                <div className="space-y-2">
                  {(routeStops.length > 0 ? routeStops : visibleRequests.map((r, i) => ({
                    requestId: r.id, order: i + 1
                  }))).map((stop) => {
                    const req = localRequests.find(r => r.id === stop.requestId);
                    if (!req || req.status === 'collected') return null;
                    const isCollected = collectedIds.includes(req.id);
                    const isNextStop = 'requestId' in stop && stop.requestId === nextStop?.requestId;

                    return (
                      <Button
                        key={req.id}
                        variant="ghost"
                        onClick={() => setSelectedRequest(req)}
                        className={cn(
                          'w-full h-auto justify-start text-left p-3 rounded-lg transition-colors',
                          selectedRequest?.id === req.id
                            ? 'bg-primary/20 border border-primary'
                            : isNextStop
                              ? 'bg-primary/10 border border-primary/30'
                              : 'bg-muted/50 hover:bg-muted-foreground/30',
                          isCollected && 'opacity-40'
                        )}
                      >
                        <div className="flex items-center gap-2 w-full min-w-0">
                          {'order' in stop && (
                            <span className="text-[10px] font-black text-muted-foreground w-5 text-center shrink-0">
                              #{stop.order}
                            </span>
                          )}
                          <span
                            className={cn(
                              'w-2.5 h-2.5 rounded-full shrink-0',
                              isCollected
                                ? 'bg-stone-500'
                                : isNextStop
                                  ? 'bg-primary'
                                  : req.status === 'pending'
                                    ? 'bg-amber-400'
                                    : 'bg-emerald-500'
                            )}
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{req.category}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {isCollected ? 'collected' : req.status} · priority {req.priority_score}
                            </p>
                          </div>
                          {isNextStop && (
                            <Badge className="ml-auto shrink-0 text-[9px] bg-primary/20 text-primary hover:bg-primary/20 px-1.5">
                              NEXT
                            </Badge>
                          )}
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground p-6">
            <div className="text-center">
              <MapPin className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p className="text-sm">
                {pickupRequests.length === 0
                  ? 'No pickup requests in your municipality'
                  : 'Select a pickup node on the map'}
              </p>
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="sticky bottom-0 bg-card/95 backdrop-blur border-t border-border p-6 space-y-3">
          {/* Optimize Route button — shown when there are pending requests and no active route */}
          {pendingCount > 0 && routeStops.length === 0 && (
            <Button
              onClick={optimizeRoute}
              disabled={isOptimizing || !driverLocation || !driverSession}
              className="w-full py-5 font-bold bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isOptimizing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Optimizing…
                </>
              ) : (
                <>
                  <Route className="w-4 h-4 mr-2" />
                  OPTIMIZE ROUTE ({pendingCount} stops)
                </>
              )}
            </Button>
          )}

          <Button
            onClick={toggleRoute}
            disabled={!driverSession}
            className={cn(
              'w-full py-6 text-lg font-bold transition-all',
              isRouteActive
                ? 'bg-muted-foreground/20 hover:bg-gray-600 text-foreground'
                : 'bg-primary hover:bg-primary/90 text-foreground'
            )}
          >
            {isRouteActive ? 'ROUTE ACTIVE' : 'START ROUTE →'}
          </Button>

          {!driverSession && (
            <p className="text-xs text-muted-foreground text-center">
              No active driver session found
            </p>
          )}
          {!driverLocation && driverSession && (
            <p className="text-xs text-muted-foreground text-center">
              Waiting for GPS to optimize route
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
