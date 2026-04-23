import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

async function MunReportsPageContent() {
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="rounded-3xl border bg-card p-12 text-center shadow-sm max-w-sm w-full">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-muted">
          <BarChart3 className="h-10 w-10 text-muted-foreground/40" />
        </div>
        <h1 className="text-2xl font-bold">Analytics & Reports</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Detailed municipality analytics and waste collection insights are coming
          soon.
        </p>
        <div className="mt-5">
          <Badge variant="secondary">Coming Soon</Badge>
        </div>
      </div>
    </div>
  );
}

export default function MunReportsPage() {
  return (
    <Suspense fallback={null}>
      <MunReportsPageContent />
    </Suspense>
  );
}
