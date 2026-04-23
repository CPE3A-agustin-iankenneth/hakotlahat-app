import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import OnboardingWizard from "@/components/onboarding-wizard";

export default async function OnboardingPage() {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // If the user has already completed onboarding, send them to their dashboard
  const { data: profile } = await supabase
    .from("users")
    .select("role, has_onboarded")
    .eq("id", user.id)
    .single();

  if (profile?.has_onboarded) {
    redirect(profile.role === "driver" ? "/drv" : "/res");
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OnboardingWizard userId={user.id} userEmail={user.email!} />
    </Suspense>
  );
}
