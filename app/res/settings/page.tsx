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

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  return (
    <div className="min-h-svh bg-gray-50">
      {/* Top Navigation Header */}
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search settings..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex items-center gap-6 ml-8">
            <Bell className="h-5 w-5 text-gray-600 cursor-pointer hover:text-gray-900" />
            <HelpCircle className="h-5 w-5 text-gray-600 cursor-pointer hover:text-gray-900" />
            <span className="text-gray-900 font-medium">HakotLahat Portal</span>
          </div>
        </div>
      </div>
      {/* Profile Header */}
      <div>
        <div className="max-w-7xl mx-auto px-6 py-8 flex items-start justify-between">
          <div className="flex items-start gap-6">
            <div className="relative">
              <div className="h-24 w-24 bg-linear-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                MS
              </div>
              <div className="absolute bottom-0 right-0 h-6 w-6 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Mateo Santos</h2>
              <p className="text-gray-600 flex items-center gap-2 mt-1">
                <MapPin className="h-4 w-4" />
                Route Contributor • Member since Jan 2024
              </p>
            </div>
          </div>
          <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium">
            ✎ Edit Profile
          </button>
        </div>
      </div>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* Pickup Address */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-green-600" />
                  Pickup Address
                </h3>
                <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                  Pin New Location
                </button>
              </div>
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-1">
                  Current Primary Residence
                </h4>
                <p className="text-gray-600 text-sm">
                  456 Maharika St., Malolios, Bulacan, 3000
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-200 to-green-100 rounded-lg h-48 relative overflow-hidden flex items-center justify-center">
                <div className="text-center">
                  <div className="text-green-700 text-5xl mb-2">📍</div>
                  <p className="text-xs text-gray-700 font-medium">
                    GPS: 14.8527° N, 120.8960° E
                  </p>
                </div>
              </div>
            </div>
            {/* Password & Security */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                <Lock className="h-5 w-5 text-red-600" />
                Password & Security
              </h3>

              <div className="space-y-0">
                <button className="w-full text-left py-3 px-0 hover:bg-gray-50 rounded-lg flex items-center justify-between group border-b">
                  <div>
                    <p className="font-semibold text-gray-900">
                      Change Password
                    </p>
                    <p className="text-sm text-gray-600">
                      Last updated 3 months ago
                    </p>
                  </div>
                  <span className="text-gray-400">›</span>
                </button>
                <button className="w-full text-left py-3 px-0 hover:bg-gray-50 rounded-lg flex items-center justify-between group">
                  <div>
                    <p className="font-semibold text-gray-900">
                      Two-Factor Authentication
                    </p>
                    <p className="text-sm text-gray-600">Currently Enabled</p>
                  </div>
                  <span className="text-gray-400">›</span>
                </button>
              </div>
            </div>
          </div>
          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Notification Settings */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                <Bell className="h-5 w-5 text-green-600" />
                Notification Settings
              </h3>
              <div className="space-y-4">
                {/* Push Notifications */}
                <div className="flex items-start justify-between py-4 border-b">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      Push Notifications
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Real-time alerts for waste collection arrivals and route
                      updates.
                    </p>
                  </div>
                  <Switch defaultChecked className="ml-4 flex-shrink-0" />
                </div>
                {/* SMS Alerts */}
                <div className="flex items-start justify-between py-4 border-b">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">SMS Alerts</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Receive critical service interruptions directly to your
                      mobile phone.
                    </p>
                  </div>
                  <Switch defaultChecked className="ml-4 flex-shrink-0" />
                </div>
                {/* Weather Delays */}
                <div className="flex items-start justify-between py-4 border-b">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      Weather Delays
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Get notified if severe weather impacts your scheduled
                      collection time.
                    </p>
                  </div>
                  <Switch defaultChecked className="ml-4 flex-shrink-0" />
                </div>
                {/* Weekly Analytics Email */}
                <div className="flex items-start justify-between py-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      Weekly Analytics Email
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Receive a summary of your recycling impact and waste
                      metrics.
                    </p>
                  </div>
                  <Switch className="ml-4 flex-shrink-0" />
                </div>
              </div>
            </div>
            {/* Language & Localization */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                <Globe className="h-5 w-5 text-gray-600" />
                Language & Localization
              </h3>

              <select className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer">
                <option>English (Philippines)</option>
                <option>Tagalog</option>
              </select>
            </div>
          </div>
        </div>
        {/* Danger Zone */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-bold text-red-900 mb-2">Danger Zone</h3>
          <p className="text-red-700 text-sm mb-4">
            Once you sign out, you will need to re-authenticate to access your
            routes.
          </p>
          <button className="bg-red-100 hover:bg-red-200 text-red-700 px-6 py-2 rounded-lg font-medium flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
