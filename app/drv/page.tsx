import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { DriverMapClient } from '@/components/drv/driver-map-client';
import type { PickupRequest, DriverSession, ActiveRoute } from '@/components/drv/driver-map-client';

async function RoutePageContent() {
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
    <DriverMapClient
      driverId={user.id}
      municipalityId={profile.municipality_id}
      pickupRequests={pickupRequests}
      activeRoute={activeRoute as ActiveRoute}
      driverSession={driverSession}
      availableVehicles={availableVehicles}
    />
  );
}

export default function RoutePage() {
  return (
    <Suspense fallback={null}>
      <RoutePageContent />
    </Suspense>
  );
}
