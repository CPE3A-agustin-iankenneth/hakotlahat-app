import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ReportsContent } from "@/components/reports-content";

async function ReportsPageContent() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  return <ReportsContent userId={user.id} />;
}

export default function ReportsPage() {
  return (
    <Suspense fallback={null}>
      <ReportsPageContent />
    </Suspense>
  );
}
