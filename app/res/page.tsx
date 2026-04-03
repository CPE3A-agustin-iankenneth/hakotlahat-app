import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ResidentPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <p className="text-lg font-medium text-foreground">
        You are in the Resident page.
      </p>
    </div>
  );
}
