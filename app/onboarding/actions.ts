"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function completeOnboarding(data: {
  role: "resident" | "driver";
  full_name: string;
  avatar_url: string | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { error } = await supabase.from("users").upsert({
    id: user.id,
    email: user.email!,
    role: data.role,
    full_name: data.full_name,
    avatar_url: data.avatar_url,
    has_onboarded: true,
  });

  if (error) throw new Error(error.message);

  redirect(data.role === "driver" ? "/drv" : "/res");
}
