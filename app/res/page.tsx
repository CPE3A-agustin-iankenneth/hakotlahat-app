import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";

export default async function ResidentPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Card>
        <CardHeader>
          <CardTitle>Request Pickup</CardTitle>
          <CardDescription>Request a pickup</CardDescription>
        </CardHeader>
        <CardContent>
          <Image src="/images/feet.jpg" alt="" width={100} height={100} />
          <Button>Request Pickup</Button>
        </CardContent>
      </Card>
    </div>
  );
}
