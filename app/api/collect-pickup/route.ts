import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Points awarded per m³ of waste collected
const POINTS_PER_M3 = 5;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { requestId } = await req.json() as { requestId: string };
  if (!requestId) return NextResponse.json({ error: 'Missing requestId' }, { status: 400 });

  const admin = createAdminClient();

  // 1. Fetch the request first to get resident_id and volume
  const { data: pickupRequest, error: fetchError } = await admin
    .from('pickup_requests')
    .select('id, resident_id, volume_estimate, status')
    .eq('id', requestId)
    .single();

  if (fetchError || !pickupRequest) {
    return NextResponse.json({ error: fetchError?.message ?? 'Request not found' }, { status: 404 });
  }

  // Only collect if currently pending or scheduled
  if (!['pending', 'scheduled'].includes(pickupRequest.status)) {
    return NextResponse.json({ error: 'Request already collected or invalid status' }, { status: 409 });
  }

  // 2. Mark the request as collected
  const { error: updateError } = await admin
    .from('pickup_requests')
    .update({ status: 'collected' })
    .eq('id', requestId);

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  // 3. Compute increments from this pickup
  const volumeM3 = Number(pickupRequest.volume_estimate ?? 0);
  const pointsEarned = Math.ceil(volumeM3 * POINTS_PER_M3);
  // Schema: total_recycled = sum of volume_estimate on collected requests (displayed as kg)
  const kgRecycled = volumeM3;
  const residentId = pickupRequest.resident_id;

  // 4. Update res_score for the resident
  if (residentId) {
    const { data: existing } = await admin
      .from('res_score')
      .select('eco_points, total_recycled')
      .eq('user_id', residentId)
      .maybeSingle();

    const { error: scoreError } = await admin
      .from('res_score')
      .upsert(
        {
          user_id: residentId,
          eco_points: (existing?.eco_points ?? 0) + pointsEarned,
          total_recycled: (existing?.total_recycled ?? 0) + kgRecycled,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    if (scoreError) {
      console.error('[collect-pickup] res_score update failed:', scoreError.message);
    }
  }

  // 5. Update drv_score for the driver performing the collection
  const driverId = user.id;
  {
    const { data: drvExisting } = await admin
      .from('drv_score')
      .select('total_collections, drv_points, routes_completed, total_distance_km')
      .eq('user_id', driverId)
      .maybeSingle();

    let routeJustCompleted = false;
    let routeDistanceKm = 0;

    // Check if this collection completes an active route belonging to this driver
    const { data: activeRoutes } = await admin
      .from('routes')
      .select('id, optimized_path')
      .eq('driver_id', driverId)
      .eq('status', 'active');

    if (activeRoutes) {
      for (const route of activeRoutes) {
        const stops: { requestId: string }[] = route.optimized_path?.stops ?? [];
        if (!stops.some((s) => s.requestId === requestId)) continue;

        const stopIds = stops.map((s) => s.requestId);
        const { data: uncollected } = await admin
          .from('pickup_requests')
          .select('id')
          .in('id', stopIds)
          .neq('status', 'collected');

        if (!uncollected || uncollected.length === 0) {
          await admin.from('routes').update({ status: 'completed' }).eq('id', route.id);
          routeJustCompleted = true;
          routeDistanceKm = (route.optimized_path?.totalDistance ?? 0) / 1000;
        }
        break;
      }
    }

    const { error: drvError } = await admin
      .from('drv_score')
      .upsert(
        {
          user_id: driverId,
          total_collections: (drvExisting?.total_collections ?? 0) + 1,
          drv_points: (drvExisting?.drv_points ?? 0) + pointsEarned + (routeJustCompleted ? 50 : 0),
          routes_completed: (drvExisting?.routes_completed ?? 0) + (routeJustCompleted ? 1 : 0),
          total_distance_km: (drvExisting?.total_distance_km ?? 0) + routeDistanceKm,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    if (drvError) {
      console.error('[collect-pickup] drv_score update failed:', drvError.message);
    }
  }

  return NextResponse.json({ success: true });
}
