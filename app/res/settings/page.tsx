import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Bell, LogOut } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PickupAddressCard from "@/components/pickup-address-card";

async function SettingsPageContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("users")
    .select("home_lat, home_lng, home_address")
    .eq("id", user.id)
    .single();

  async function signOutAction() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/auth/login");
  }

  return (
    <div className="min-h-svh bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        <PickupAddressCard
          initialAddress={profile?.home_address ?? null}
          initialLat={profile?.home_lat ?? null}
          initialLng={profile?.home_lng ?? null}
        />
        <Card className="p-6 shadow-sm">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-6">
            <Bell className="h-5 w-5 text-primary" />
            Notification Settings
          </h3>
          <div className="space-y-4">
            <div className="flex items-start justify-between py-4 border-b">
              <div className="flex-1">
                <h4 className="font-semibold text-foreground">
                  Push Notifications
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Real-time alerts for waste collection arrivals and route
                  updates.
                </p>
              </div>
              <Switch className="ml-4 flex-shrink-0" />
            </div>
            <div className="flex items-start justify-between py-4 border-b">
              <div className="flex-1">
                <h4 className="font-semibold text-foreground">SMS Alerts</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Receive critical service interruptions directly to your mobile
                  phone.
                </p>
              </div>
              <Switch className="ml-4 flex-shrink-0" />
            </div>
            <div className="flex items-start justify-between py-4 border-b">
              <div className="flex-1">
                <h4 className="font-semibold text-foreground">
                  Weather Delays
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Get notified if severe weather impacts your scheduled
                  collection time.
                </p>
              </div>
              <Switch className="ml-4 flex-shrink-0" />
            </div>
            <div className="flex items-start justify-between py-4">
              <div className="flex-1">
                <h4 className="font-semibold text-foreground">
                  Weekly Analytics Email
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Receive a summary of your recycling impact and waste metrics.
                </p>
              </div>
              <Switch className="ml-4 flex-shrink-0" />
            </div>
          </div>
        </Card>
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
          <h3 className="text-lg font-bold text-destructive mb-2">
            Danger Zone
          </h3>
          <p className="text-destructive text-sm mb-4">
            Once you sign out, you will need to re-authenticate to access your
            routes.
          </p>
          <form action={signOutAction}>
            <Button
              type="submit"
              variant="destructive"
              className="bg-destructive/20 hover:bg-destructive/30 text-destructive px-6 py-2 rounded-lg font-medium flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={null}>
      <SettingsPageContent />
    </Suspense>
  );
}
