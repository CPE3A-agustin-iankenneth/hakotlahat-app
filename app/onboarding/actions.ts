"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function completeOnboarding(data: {
  role: "resident" | "driver";
  full_name: string;
  avatar_url: string | null;
  home_lat: number | null;
  home_lng: number | null;
  home_address: string | null;
  municipality_id?: string | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Update user record with municipality_id for both residents and drivers
  const { error: userError } = await supabase.from("users").upsert({
    id: user.id,
    email: user.email!,
    role: data.role,
    full_name: data.full_name,
    avatar_url: data.avatar_url,
    home_lat: data.home_lat,
    home_lng: data.home_lng,
    home_address: data.home_address,
    has_onboarded: true,
    municipality_id: data.municipality_id,
  });

  if (userError) throw new Error(userError.message);

  // Seed the appropriate score row with all defaults (idempotent via ON CONFLICT)
  if (data.role === "resident") {
    const { error: scoreError } = await supabase
      .from("res_score")
      .upsert({ user_id: user.id }, { onConflict: "user_id" });
    if (scoreError) console.error("res_score seed error:", scoreError.message);
  } else if (data.role === "driver") {
    const { error: scoreError } = await supabase
      .from("drv_score")
      .upsert({ user_id: user.id }, { onConflict: "user_id" });
    if (scoreError) console.error("drv_score seed error:", scoreError.message);
  }

  redirect(data.role === "driver" ? "/drv" : "/res");
}
