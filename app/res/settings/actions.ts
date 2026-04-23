"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function updatePickupLocation(data: {
  home_lat: number | null;
  home_lng: number | null;
  home_address: string | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { error } = await supabase
    .from("users")
    .update({
      home_lat: data.home_lat,
      home_lng: data.home_lng,
      home_address: data.home_address,
    })
    .eq("id", user.id);

  if (error) throw new Error(error.message);
}
