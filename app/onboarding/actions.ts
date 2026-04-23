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



  redirect(data.role === "driver" ? "/drv" : "/res");
}


