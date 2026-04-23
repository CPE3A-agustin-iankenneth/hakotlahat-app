export const dynamic = 'force-dynamic';
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AccountContent } from "@/components/account-content";

export default async function ResidentAccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("users")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <AccountContent
      userId={user.id}
      email={user.email ?? "unknown"}
      initialFullName={profile?.full_name ?? null}
      initialAvatarUrl={profile?.avatar_url ?? null}
    />
  );
}
