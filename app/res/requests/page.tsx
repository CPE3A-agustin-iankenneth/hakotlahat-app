import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { RequestsContent } from "@/components/request-content";

async function RequestPageContent() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: activeRequests, error: activeError } = await supabase
    .from("pickup_requests")
    .select("*")
    .eq("resident_id", user.id)
    .in("status", ["pending", "scheduled"])
    .order("created_at", { ascending: false });

  const { data: historyRequests, error: historyError } = await supabase
    .from("pickup_requests")
    .select("*")
    .eq("resident_id", user.id)
    .eq("status", "collected")
    .order("created_at", { ascending: false });

  if (activeError || historyError) {
    console.error("Failed to fetch requests:", activeError || historyError);
    return <div className="p-10 text-red-500">Error loading requests</div>;
  }

  return (
    <RequestsContent
      activeRequests={activeRequests || []}
      historyRequests={historyRequests || []}
    />
  );
}

export default function RequestPage() {
  return (
    <Suspense fallback={null}>
      <RequestPageContent />
    </Suspense>
  );
}
