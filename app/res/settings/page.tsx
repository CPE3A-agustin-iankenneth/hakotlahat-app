import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  Bell,
  LogOut,
  MapPin,
  Lock,
  Globe,
  Search,
  HelpCircle,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  return (
    <div className="min-h-svh bg-background">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Pickup Address */}
            <Card className="p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Pickup Address
                </h3>
                <Button variant="link" className="text-sm text-primary hover:text-primary font-medium p-0 h-auto">
                  Pin New Location
                </Button>
              </div>
              <div className="mb-4">
                <h4 className="font-semibold text-foreground mb-1">
                  Current Primary Residence
                </h4>
                <p className="text-muted-foreground text-sm">
                  456 Maharika St., Malolios, Bulacan, 3000
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-200 to-green-100 rounded-lg h-48 relative overflow-hidden flex items-center justify-center">
                <div className="text-center">
                  <div className="text-primary text-5xl mb-2">📍</div>
                  <p className="text-xs text-foreground font-medium">
                    GPS: 14.8527° N, 120.8960° E
                  </p>
                </div>
              </div>
            </Card>
            {/* Password & Security */}
            <Card className="p-6 shadow-sm">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-4">
                <Lock className="h-5 w-5 text-destructive" />
                Password & Security
              </h3>

              <div className="space-y-0">
                <Button variant="ghost" className="w-full text-left py-6 px-4 hover:bg-background rounded-lg flex items-center justify-between group border-b h-auto">
                  <div>
                    <p className="font-semibold text-foreground">
                      Change Password
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Last updated 3 months ago
                    </p>
                  </div>
                  <span className="text-muted-foreground">›</span>
                </Button>
                <Button variant="ghost" className="w-full text-left py-6 px-4 hover:bg-background rounded-lg flex items-center justify-between group h-auto">
                  <div>
                    <p className="font-semibold text-foreground">
                      Two-Factor Authentication
                    </p>
                    <p className="text-sm text-muted-foreground">Currently Enabled</p>
                  </div>
                  <span className="text-muted-foreground">›</span>
                </Button>
              </div>
            </Card>
          </div>
          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Notification Settings */}
            <Card className="p-6 shadow-sm">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-6">
                <Bell className="h-5 w-5 text-primary" />
                Notification Settings
              </h3>
              <div className="space-y-4">
                {/* Push Notifications */}
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
                  <Switch defaultChecked className="ml-4 flex-shrink-0" />
                </div>
                {/* SMS Alerts */}
                <div className="flex items-start justify-between py-4 border-b">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">SMS Alerts</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Receive critical service interruptions directly to your
                      mobile phone.
                    </p>
                  </div>
                  <Switch defaultChecked className="ml-4 flex-shrink-0" />
                </div>
                {/* Weather Delays */}
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
                  <Switch defaultChecked className="ml-4 flex-shrink-0" />
                </div>
                {/* Weekly Analytics Email */}
                <div className="flex items-start justify-between py-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground">
                      Weekly Analytics Email
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Receive a summary of your recycling impact and waste
                      metrics.
                    </p>
                  </div>
                  <Switch className="ml-4 flex-shrink-0" />
                </div>
              </div>
            </Card>
            {/* Language & Localization */}
            <Card className="p-6 shadow-sm">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2 mb-6">
                <Globe className="h-5 w-5 text-muted-foreground" />
                Language & Localization
              </h3>

              <Select defaultValue="english">
                <SelectTrigger className="w-full h-12 rounded-lg bg-card">
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English (Philippines)</SelectItem>
                  <SelectItem value="tagalog">Tagalog</SelectItem>
                </SelectContent>
              </Select>
            </Card>
          </div>
        </div>
        {/* Danger Zone */}
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-bold text-destructive mb-2">Danger Zone</h3>
          <p className="text-destructive text-sm mb-4">
            Once you sign out, you will need to re-authenticate to access your
            routes.
          </p>
          <Button variant="destructive" className="bg-destructive/20 hover:bg-destructive/30 text-destructive px-6 py-2 rounded-lg font-medium flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
