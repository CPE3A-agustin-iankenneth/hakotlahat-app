export const dynamic = 'force-dynamic';
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ReportsContent } from "@/components/reports-content";
 
export default async function ReportsPage() {
  const supabase = await createClient();
 
  const {
    data: { user },
  } = await supabase.auth.getUser();
 
  if (!user) redirect("/auth/login");
 
  return <ReportsContent userId={user.id} />;
}