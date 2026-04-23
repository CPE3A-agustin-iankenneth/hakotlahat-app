import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MunRoutesContent } from "@/components/mun/mun-routes-content";
import type { MunRoute } from "@/types/municipality";

export default async function MunRoutesPage() {
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

  const [{ data: activeRoutes }, { data: completedRoutes }] = await Promise.all([
    supabase
      .from("routes")
      .select(
        `id, driver_id, status, optimized_path, created_at,
         driver:users!routes_driver_id_fkey(full_name, email)`
      )
      .eq("status", "active")
      .order("created_at", { ascending: false }),
    supabase
      .from("routes")
      .select(
        `id, driver_id, status, optimized_path, created_at,
         driver:users!routes_driver_id_fkey(full_name, email)`
      )
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  return (
    <MunRoutesContent
      activeRoutes={(activeRoutes as unknown as MunRoute[]) ?? []}
      completedRoutes={(completedRoutes as unknown as MunRoute[]) ?? []}
    />
  );
}
