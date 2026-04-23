import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MunFleetContent } from "@/components/mun/mun-fleet-content";
import type { MunVehicle, DriverWithSession } from "@/types/municipality";

export default async function MunFleetPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/auth/login");

  const [{ data: drivers }, { data: activeSessions }, { data: vehicles }] =
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

  return (
    <MunFleetContent
      drivers={driversWithSessions}
      vehicles={(vehicles as unknown as MunVehicle[]) ?? []}
    />
  );
}
