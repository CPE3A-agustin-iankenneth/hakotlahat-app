import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminFleetContent } from "@/components/admin/admin-fleet-content";
import type { MunVehicle, DriverWithSession } from "@/types/municipality";

export default async function AdminFleetPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("users")
    .select("role, municipality_id")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/auth/login");

  const [{ data: drivers }, { data: activeSessions }, { data: vehicles }, { data: pendingRequestsRaw }] =
    await Promise.all([
      supabase
        .from("users")
        .select("id, full_name, email, avatar_url")
        .eq("role", "driver")
        .order("full_name"),
      supabase
        .from("driver_sessions")
        .select(
          `id, driver_id, vehicle_id, status, current_lat, current_lng,
           last_location_update, started_at, ended_at,
           driver:users!driver_sessions_driver_id_fkey(id, full_name, email, avatar_url),
           vehicle:vehicles(id, municipality_id, plate_number, capacity_volume, status, created_at)`
        )
        .is("ended_at", null)
        .in("status", ["ON_DUTY", "ON_ROUTE"]),
      supabase
        .from("vehicles")
        .select("*")
        .order("plate_number"),
      supabase
        .from("pickup_requests")
        .select("id, latitude, longitude, category, priority_score, status, users!resident_id(municipality_id)")
        .in("status", ["pending", "scheduled"]),
    ]);

  // Merge active sessions into driver records
  const sessionMap = new Map(
    (activeSessions ?? []).map((s) => [s.driver_id, s])
  );

  const driversWithSessions: DriverWithSession[] = (drivers ?? []).map((d) => ({
    id: d.id,
    full_name: d.full_name,
    email: d.email,
    avatar_url: d.avatar_url,
    activeSession: (sessionMap.get(d.id) as unknown as DriverWithSession["activeSession"]) ?? null,
  }));

  // Filter requests to this municipality
  type RawRequest = { id: string; latitude: number; longitude: number; category: string | null; priority_score: number; status: string; users: { municipality_id: string } | { municipality_id: string }[] | null };
  const municipalRequests = ((pendingRequestsRaw ?? []) as unknown as RawRequest[]).filter((r) => {
    const munId = Array.isArray(r.users) ? r.users[0]?.municipality_id : r.users?.municipality_id;
    return munId === profile?.municipality_id;
  }).map((r) => ({
    id: r.id,
    latitude: r.latitude,
    longitude: r.longitude,
    category: r.category,
    priority_score: r.priority_score,
    status: r.status,
  }));

  return (
    <AdminFleetContent
      drivers={driversWithSessions}
      vehicles={(vehicles as unknown as MunVehicle[]) ?? []}
      municipalityId={profile?.municipality_id ?? null}
      pendingRequests={municipalRequests}
    />
  );
}
