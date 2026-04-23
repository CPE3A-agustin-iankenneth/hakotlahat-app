import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminDashboardContent } from "@/components/admin/admin-dashboard-content";
import type { MunDriverSession, MunPickupRequest, MunDashboardStats } from "@/types/municipality";

export default async function AdminDashboardPage() {
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

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    { count: pendingCount },
    { data: activeSessions },
    { count: availableVehicleCount },
    { count: completedRoutesToday },
    { data: pendingRequests },
  ] = await Promise.all([
    supabase
      .from("pickup_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("driver_sessions")
      .select(
        `id, driver_id, vehicle_id, status, current_lat, current_lng,
         last_location_update, started_at, ended_at,
         driver:users!driver_sessions_driver_id_fkey(id, full_name, email, avatar_url),
         vehicle:vehicles(id, municipality_id, plate_number, capacity_volume, status, created_at)`
      )
      .in("status", ["ON_DUTY", "ON_ROUTE"])
      .is("ended_at", null),
    supabase
      .from("vehicles")
      .select("*", { count: "exact", head: true })
      .eq("status", "ACTIVE"),
    supabase
      .from("routes")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed")
      .gte("created_at", todayStart.toISOString()),
    supabase
      .from("pickup_requests")
      .select(
        `id, resident_id, latitude, longitude, image_url, status, priority_score,
         volume_estimate, category, created_at,
         resident:users!pickup_requests_resident_id_fkey(full_name, email)`
      )
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const stats: MunDashboardStats = {
    pendingCount: pendingCount ?? 0,
    activeDriverCount: activeSessions?.length ?? 0,
    availableVehicleCount: availableVehicleCount ?? 0,
    completedRoutesToday: completedRoutesToday ?? 0,
  };

  return (
    <AdminDashboardContent
      stats={stats}
      activeSessions={(activeSessions as unknown as MunDriverSession[]) ?? []}
      pendingRequests={(pendingRequests as unknown as MunPickupRequest[]) ?? []}
    />
  );
}
