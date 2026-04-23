import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DriverMapClient } from '@/components/drv/driver-map-client';
import type { PickupRequest, DriverSession, ActiveRoute } from '@/components/drv/driver-map-client';

export default async function RoutePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase
    .from('users')
    .select('full_name, municipality_id')
    .eq('id', user.id)
    .single();

  if (!profile?.municipality_id) redirect('/onboarding');

  // Supabase join returns users as array; filter to same municipality after fetch
  const { data: allRequests } = await supabase
    .from('pickup_requests')
    .select(
      `id, latitude, longitude, status, priority_score,
       volume_estimate, category, image_url, created_at,
       users!resident_id ( full_name, municipality_id )`
    )
    .in('status', ['pending', 'scheduled']);

  // Normalize Supabase's array join to single object and filter by municipality
  const pickupRequests: PickupRequest[] = (allRequests ?? [])
    .map((r) => ({
      ...r,
      // Supabase returns the joined relation as array or object depending on version
      users: Array.isArray(r.users) ? (r.users[0] ?? null) : r.users,
    }))
    .filter(
      (r) => r.users?.municipality_id === profile.municipality_id
    ) as PickupRequest[];

  // Active route for this driver (if any)
  const { data: activeRouteRaw } = await supabase
    .from('routes')
    .select('id, status, optimized_path, created_at')
    .eq('driver_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  type OptimizedPath = {
    coordinates: [number, number][];
    stops?: {
      requestId: string;
      order: number;
      lng: number;
      lat: number;
      category: string | null;
      priority_score: number;
      volume_estimate: number | null;
      arrival: number;
    }[];
    totalDuration?: number;
    totalDistance?: number;
  };

  const activeRoute = activeRouteRaw
    ? {
        id: activeRouteRaw.id as string,
        optimized_path: activeRouteRaw.optimized_path as OptimizedPath | null,
      }
    : null;

  // Available vehicles in driver's municipality (ACTIVE only — for session activation)
  const { data: availableVehiclesRaw } = await supabase
    .from('vehicles')
    .select('id, plate_number, capacity_volume')
    .eq('municipality_id', profile.municipality_id)
    .eq('status', 'ACTIVE');

  const availableVehicles = (availableVehiclesRaw ?? []) as {
    id: string;
    plate_number: string;
    capacity_volume: number;
  }[];

  // Current driver session (for vehicle + last known location)
  const { data: sessionRaw } = await supabase
    .from('driver_sessions')
    .select(
      `id, status, current_lat, current_lng,
       vehicles ( plate_number, capacity_volume )`
    )
    .eq('driver_id', user.id)
    .in('status', ['ON_DUTY', 'ON_ROUTE'])
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const driverSession: DriverSession = sessionRaw
    ? {
        id: sessionRaw.id as string,
        status: sessionRaw.status as string,
        current_lat: sessionRaw.current_lat as number | null,
        current_lng: sessionRaw.current_lng as number | null,
        vehicles: Array.isArray(sessionRaw.vehicles)
          ? (sessionRaw.vehicles[0] ?? null)
          : sessionRaw.vehicles
            ? {
                plate_number: (sessionRaw.vehicles as { plate_number: string; capacity_volume: number }).plate_number,
                capacity_volume: (sessionRaw.vehicles as { plate_number: string; capacity_volume: number }).capacity_volume,
              }
            : null,
      }
    : null;

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Map Container */}
      <div className="flex-1 relative">
        <div ref={mapContainer} className="w-full h-full" />

        {/* Top Info Bar */}
        <div className="absolute top-4 left-4 right-4 z-10 bg-card/80 backdrop-blur rounded-lg p-4 flex justify-between items-center">
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full" />
              <span className="text-sm">GPS Signal: {routeData.gpsSignal}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-accent rounded-full" />
              <span className="text-sm">5G Latency: {routeData.latency}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Top 5% Drivers this week</p>
            <p className="text-lg font-bold text-primary">
              {routeData.topPercentile}%
            </p>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="absolute bottom-6 left-4 z-10 flex flex-col gap-2">
          <Button
            size="icon"
            className="bg-muted hover:bg-muted-foreground/20 text-foreground"
            onClick={() => map.current?.zoomIn()}
          >
            +
          </Button>
          <Button
            size="icon"
            className="bg-muted hover:bg-muted-foreground/20 text-foreground"
            onClick={() => map.current?.zoomOut()}
          >
            −
          </Button>
          <Button
            size="icon"
            className="bg-muted hover:bg-muted-foreground/20 text-foreground"
            onClick={() => map.current?.easeTo({ bearing: 0, pitch: 0 })}
          >
            <Navigation className="w-4 h-4" />
          </Button>
        </div>

        {/* Vehicle Status */}
        <div className="absolute bottom-6 left-20 z-10 bg-card/80 backdrop-blur rounded-lg p-3 max-w-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-muted-foreground">
              Vehicle Synced
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{routeData.vehicleStatus}</p>
        </div>
      </div>

      {/* Right Sidebar - Route Details */}
      <div className="w-96 bg-card border-l border-border overflow-y-auto">
        {/* Up Next Header */}
        <div className="sticky top-0 bg-card/95 backdrop-blur border-b border-border p-6 z-20">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Up Next
              </p>
              <h2 className="text-2xl font-bold mt-2">
                {currentStop.address}
              </h2>
            </div>
            <Badge variant="destructive" className="bg-destructive/20 text-destructive hover:bg-destructive/20 rounded">
              {currentStop.priority}
            </Badge>
          </div>
        </div>

        {/* Details Section */}
        <div className="p-6 space-y-6">
          {/* Distance and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Distance
              </p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {currentStop.distance}
                <span className="text-lg text-muted-foreground ml-1">km</span>
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Est. Time
              </p>
              <p className="text-3xl font-bold text-primary mt-2">
                {currentStop.estTime}
                <span className="text-lg text-muted-foreground ml-1">min</span>
              </p>
            </div>
          </div>

          {/* Cargo Type */}
          <div className="flex items-start gap-3">
            <Package className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Cargo Type
              </p>
              <p className="text-foreground font-medium">{currentStop.cargoType}</p>
            </div>
          </div>

          {/* Contact */}
          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                On-site Contact
              </p>
              <p className="text-foreground font-medium">{currentStop.contact}</p>
              <p className="text-sm text-muted-foreground">{currentStop.contactPhone}</p>
            </div>
          </div>

          {/* Instructions */}
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Instructions
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {currentStop.instructions}
              </p>
            </div>
          </div>

          {/* Route Stops List */}
          {routeData.stops.length > 1 && (
            <div className="border-t border-border pt-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">
                Other Stops
              </p>
              <div className="space-y-2">
                {routeData.stops.map((stop, index) => (
                  <Button
                    key={stop.id}
                    variant="ghost"
                    onClick={() => setSelectedStop(stop)}
                    className={`w-full h-auto justify-start text-left p-3 rounded-lg transition-colors ${selectedStop?.id === stop.id
                        ? 'bg-primary/20 border border-primary'
                        : 'bg-muted/50 hover:bg-muted-foreground/30'
                      }`}
                  >
                    <p className="text-sm font-medium">
                      Stop {index + 1}: {stop.address}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stop.distance} km • {stop.estTime} min
                    </p>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Start Route Button */}
        <div className="sticky bottom-0 bg-card/95 backdrop-blur border-t border-border p-6">
          <Button
            onClick={() => setIsRouteStarted(!isRouteStarted)}
            className={`w-full py-6 text-lg font-bold transition-all ${isRouteStarted
                ? 'bg-muted-foreground/20 hover:bg-gray-600'
                : 'bg-primary hover:bg-primary text-foreground'
              }`}
          >
            {isRouteStarted ? 'ROUTE ACTIVE' : 'START ROUTE'}
            {isRouteStarted ? '' : ' →'}
          </Button>
        </div>
      </div>
    </div>
  );
}
