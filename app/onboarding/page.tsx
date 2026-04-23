import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import OnboardingWizard from "@/components/onboarding-wizard";

async function OnboardingPageContent() {
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

  return <OnboardingWizard userId={user.id} userEmail={user.email!} />;
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingPageContent />
    </Suspense>
  );
}
