import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const ORS_BASE = 'https://api.openrouteservice.org';
const MAX_WAYPOINTS = 50;
const LOG = '[optimize-route]';

type PickupRow = {
  id: string;
  latitude: number;
  longitude: number;
  priority_score: number;
  volume_estimate: number | null;
  category: string | null;
};

type OrsJobStep = {
  type: string;
  id: number;
  arrival: number;
  location: [number, number];
};

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

export async function POST(req: NextRequest) {
  console.log(`\n${LOG} ─── Request received ───`);

  // ── Auth ──────────────────────────────────────────────
  const apiKey = process.env.ORS_API_KEY;
  if (!apiKey) {
    console.error(`${LOG} ✗ ORS_API_KEY is not set`);
    return NextResponse.json({ error: 'ORS API key not configured' }, { status: 500 });
  }
  console.log(`${LOG} ✓ ORS_API_KEY present`);

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  // Admin client bypasses RLS — used only for writes after auth is validated above
  const admin = createAdminClient();
  if (!user) {
    console.error(`${LOG} ✗ Auth failed:`, authError?.message);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  console.log(`${LOG} ✓ Auth OK — user: ${user.id}`);

  // ── Body parsing ──────────────────────────────────────
  let body: { driverLat?: number; driverLng?: number; vehicleCapacity?: number; requestIds?: string[] };
  try {
    body = await req.json();
  } catch (e) {
    console.error(`${LOG} ✗ Failed to parse JSON body:`, e);
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { driverLat, driverLng, vehicleCapacity, requestIds } = body;
  console.log(`${LOG} Body received:`, {
    driverLat,
    driverLng,
    vehicleCapacity,
    requestIds: requestIds?.length ?? 'none',
  });

  // Use null/undefined check — 0 is a valid coordinate
  if (driverLat == null || driverLng == null) {
    console.error(`${LOG} ✗ Missing lat/lng`);
    return NextResponse.json(
      { error: `Missing driver coordinates — received: lat=${driverLat}, lng=${driverLng}` },
      { status: 400 }
    );
  }

  if (!requestIds || requestIds.length === 0) {
    console.error(`${LOG} ✗ No requestIds provided`);
    return NextResponse.json({ error: 'No request IDs provided' }, { status: 400 });
  }

  const vehicleCap = vehicleCapacity ?? 0;

  // ── Fetch the specific pending requests by ID ─────────
  // The client already pre-filtered by municipality; we just verify they're still pending.
  console.log(`${LOG} Querying ${requestIds.length} pickup_requests by ID…`);
  const { data: rawRequests, error: dbError } = await supabase
    .from('pickup_requests')
    .select('id, latitude, longitude, priority_score, volume_estimate, category')
    .in('id', requestIds.slice(0, MAX_WAYPOINTS))
    .eq('status', 'pending');

  if (dbError) {
    console.error(`${LOG} ✗ DB error fetching pickup_requests:`, dbError.message);
    return NextResponse.json({ error: `DB error: ${dbError.message}` }, { status: 500 });
  }

  const requests: PickupRow[] = (rawRequests ?? []) as PickupRow[];
  console.log(`${LOG} Confirmed pending requests: ${requests.length} of ${requestIds.length} requested`);

  if (requests.length === 0) {
    console.warn(`${LOG} ✗ None of the provided IDs are still pending`);
    return NextResponse.json(
      { error: 'None of the selected requests are still pending — they may have already been scheduled' },
      { status: 400 }
    );
  }

  // ── Build ORS Optimization payload ───────────────────
  const jobs = requests.map((r, i) => ({
    id: i + 1,
    location: [r.longitude, r.latitude] as [number, number],
    priority: Math.min(r.priority_score ?? 1, 10),
    amount: [Math.max(1, Math.round((r.volume_estimate ?? 1) * 10))],
  }));

  const capacity = vehicleCap > 0 ? Math.round(vehicleCap * 10) : 1000;
  const vehicles = [{
    id: 1,
    profile: 'driving-car',
    start: [driverLng, driverLat] as [number, number],
    end: [driverLng, driverLat] as [number, number],
    capacity: [capacity],
  }];

  const orsPayload = { jobs, vehicles };
  console.log(`${LOG} ORS Optimization payload — jobs: ${jobs.length}, vehicle capacity: ${capacity}`);
  console.log(`${LOG} Driver start: [${driverLng}, ${driverLat}]`);

  // ── ORS Optimization API ──────────────────────────────
  const optimizationRes = await fetch(`${ORS_BASE}/optimization`, {
    method: 'POST',
    headers: {
      Authorization: apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orsPayload),
  });

  console.log(`${LOG} ORS Optimization response status: ${optimizationRes.status}`);

  if (!optimizationRes.ok) {
    const err = await optimizationRes.text();
    console.error(`${LOG} ✗ ORS Optimization failed (${optimizationRes.status}):`, err);
    return NextResponse.json(
      { error: `ORS Optimization API error (${optimizationRes.status}): ${err}` },
      { status: 502 }
    );
  }

  const optimizationData = await optimizationRes.json() as {
    routes?: { steps: OrsJobStep[]; duration: number; distance: number }[];
    unassigned?: { id: number }[];
  };

  const orsRoute = optimizationData.routes?.[0];
  console.log(`${LOG} ORS routes returned: ${optimizationData.routes?.length ?? 0}, unassigned: ${optimizationData.unassigned?.length ?? 0}`);

  if (!orsRoute) {
    console.error(`${LOG} ✗ ORS returned no route. Full response:`, JSON.stringify(optimizationData));
    return NextResponse.json({ error: 'ORS returned no route' }, { status: 502 });
  }

  // ── Map steps → ordered stops ─────────────────────────
  const jobSteps = orsRoute.steps.filter((s) => s.type === 'job');
  console.log(`${LOG} Job steps in route: ${jobSteps.length}`);

  const orderedStops: RouteStop[] = jobSteps.map((step, i) => {
    const r = requests[step.id - 1];
    return {
      requestId: r.id,
      order: i + 1,
      lng: r.longitude,
      lat: r.latitude,
      category: r.category,
      priority_score: r.priority_score,
      volume_estimate: r.volume_estimate,
      arrival: step.arrival,
    };
  });

  // ── ORS Directions API (road geometry) ───────────────
  const waypoints: [number, number][] = [
    [driverLng, driverLat],
    ...orderedStops.map((s) => [s.lng, s.lat] as [number, number]),
  ];

  console.log(`${LOG} Calling ORS Directions with ${waypoints.length} waypoints…`);
  let roadCoordinates: [number, number][] = waypoints;

  const directionsRes = await fetch(`${ORS_BASE}/v2/directions/driving-car/geojson`, {
    method: 'POST',
    headers: {
      Authorization: apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ coordinates: waypoints }),
  });

  console.log(`${LOG} ORS Directions response status: ${directionsRes.status}`);

  if (directionsRes.ok) {
    const directionsData = await directionsRes.json() as {
      features?: { geometry?: { coordinates?: [number, number][] } }[];
    };
    const coords = directionsData.features?.[0]?.geometry?.coordinates;
    if (coords && coords.length > 0) {
      roadCoordinates = coords;
      console.log(`${LOG} ✓ Road geometry: ${coords.length} coordinate points`);
    } else {
      console.warn(`${LOG} Directions API returned no geometry — falling back to straight-line waypoints`);
    }
  } else {
    const dirErr = await directionsRes.text();
    console.warn(`${LOG} Directions API failed (${directionsRes.status}) — falling back to straight-line waypoints:`, dirErr);
  }

  // ── Save to Supabase (admin client bypasses RLS) ──────
  console.log(`${LOG} Deactivating existing active routes for driver…`);
  await admin
    .from('routes')
    .update({ status: 'completed' })
    .eq('driver_id', user.id)
    .eq('status', 'active');

  const optimizedPath = {
    coordinates: roadCoordinates,
    stops: orderedStops,
    totalDuration: orsRoute.duration,
    totalDistance: orsRoute.distance,
  };

  console.log(`${LOG} Inserting new route into DB…`);
  const { data: newRoute, error: routeError } = await admin
    .from('routes')
    .insert({ driver_id: user.id, status: 'active', optimized_path: optimizedPath })
    .select('id')
    .single();

  if (routeError) {
    console.error(`${LOG} ✗ Failed to insert route:`, routeError.message);
    return NextResponse.json({ error: routeError.message }, { status: 500 });
  }

  const assignedIds = orderedStops.map((s) => s.requestId);
  await admin.from('pickup_requests').update({ status: 'scheduled' }).in('id', assignedIds);

  console.log(`${LOG} ✓ Done — routeId: ${newRoute.id}, stops: ${orderedStops.length}, duration: ${orsRoute.duration}s, distance: ${orsRoute.distance}m`);

  return NextResponse.json({
    routeId: newRoute.id,
    stops: orderedStops,
    totalDuration: orsRoute.duration,
    totalDistance: orsRoute.distance,
    unassignedCount: optimizationData.unassigned?.length ?? 0,
  });
}
