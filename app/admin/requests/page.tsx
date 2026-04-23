import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminRequestsContent } from "@/components/admin/admin-requests-content";
import type { MunPickupRequest } from "@/types/municipality";

export default async function AdminRequestsPage() {
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

  const { data: allRequests } = await supabase
    .from("pickup_requests")
    .select(
      `id, resident_id, lat, lng, image_url, status, priority_score,
       volume_estimate, category, created_at,
       resident:users!pickup_requests_resident_id_fkey(full_name, email)`
    )
    .order("created_at", { ascending: false });

  return (
    <AdminRequestsContent
      requests={(allRequests as unknown as MunPickupRequest[]) ?? []}
    />
  );
}
