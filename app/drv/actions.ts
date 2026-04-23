'use server';

import { createClient } from '@/lib/supabase/server';

export async function activateDriverSession(
  vehicleId: string,
  lat: number,
  lng: number
): Promise<{ sessionId: string } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: 'Not authenticated' };

  // Close any stale sessions first
  await supabase
    .from('driver_sessions')
    .update({ status: 'OFF_DUTY', ended_at: new Date().toISOString() })
    .eq('driver_id', user.id)
    .in('status', ['ON_DUTY', 'ON_ROUTE']);

  const { data, error } = await supabase
    .from('driver_sessions')
    .insert({
      driver_id: user.id,
      vehicle_id: vehicleId,
      current_lat: lat,
      current_lng: lng,
      status: 'ON_DUTY',
      last_location_update: new Date().toISOString(),
      started_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) return { error: error.message };
  return { sessionId: data.id };
}
