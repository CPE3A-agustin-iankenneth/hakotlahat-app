import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ReportsContent } from "@/components/reports-content";
 
export default async function ReportsPage() {
  await connection();
  const supabase = await createClient();
 
  const {
    data: { user },
  } = await supabase.auth.getUser();
 
  if (!user) redirect("/auth/login");
 
  return <ReportsContent userId={user.id} />;
}