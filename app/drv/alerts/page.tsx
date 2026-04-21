import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Map } from "@/components/ui/map";
import { MapPin, CloudHail, CalendarDays, ChartNoAxesColumn } from "lucide-react";

function FleetAlerts() {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-extrabold">Fleet Alerts</h2>
              <p className="text-sm text-muted-foreground">
                Real-time operational updates and safety critical communications.
              </p>
            </div>
            <Button size="sm" className="h-10">Mark All as Read</Button>
          </div>

          {/* Alert 1 - Urgent */}
          <div className="flex gap-4 items-start">
            <div className="w-1 rounded-xl bg-destructive mt-2" />
            <Card className="flex-1 p-6">
              <CardHeader className="flex items-start justify-between">
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                      <CloudHail className="h-6 w-6 text-destructive" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="destructive">URGENT • WEATHER</Badge>
                    </div>
                    <CardTitle className="text-base font-semibold leading-snug">
                      Heavy rain detected. Sector 4 route has been dynamically optimized to avoid flood zones.
                    </CardTitle>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">2 mins ago</div>
              </CardHeader>

              <CardContent>
                <div className="mt-4 flex gap-3">
                  <Button variant="default" size="sm" className="rounded-md shadow-sm">View Updated Route</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alert 2 - System */}
          <div className="flex gap-4 items-start">
            <div className="w-1 rounded-xl bg-primary mt-2" />
            <Card className="flex-1 p-6">
              <CardHeader className="flex items-start justify-between">
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="default">SYSTEM • DISPATCH</Badge>
                    </div>
                    <CardTitle className="text-base font-semibold leading-snug">
                      New High-Volume node added to your route by Dispatch. Check inventory capacity before departure.
                    </CardTitle>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">14 mins ago</div>
              </CardHeader>

              <CardContent>
                <div className="mt-4 flex gap-3 items-center">
                  <Button variant="outline" size="sm" className="rounded-md">Accept Load</Button>
                  <Button variant="ghost" size="sm">Details</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alert 3 - General */}
          <div className="flex gap-4 items-start">
            <div className="w-1 rounded-xl bg-muted mt-2" />
            <Card className="flex-1 p-6">
              <CardHeader className="flex items-start justify-between">
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-lg bg-muted/10 flex items-center justify-center">
                      <CalendarDays className="h-6 w-6 text-muted-foreground" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-muted text-muted-foreground">GENERAL • SAFETY</Badge>
                    </div>
                    <CardTitle className="text-base font-semibold leading-snug">
                      Weekly safety meeting tomorrow at 0800. Attendance is mandatory for all active drivers.
                    </CardTitle>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">1 hour ago</div>
              </CardHeader>
            </Card>
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
          <Card className="p-4">
            <CardHeader className="px-0 pb-2">
              <CardTitle>Alerts Summary</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <div className="flex flex-col gap-3">
                <div className="grid gap-3">
                  {/* Urgent */}
                  <div className="p-1 rounded-lg bg-card/30">
                    <div className="flex items-center justify-between px-3 py-2 rounded-md bg-destructive/10">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full bg-destructive" />
                        <div className="text-sm text-destructive">Urgent</div>
                      </div>
                      <div className="text-xl font-bold bg-foreground text-primary-foreground px-3 py-1 rounded-md">01</div>
                    </div>
                  </div>

                  {/* System (highlighted) */}
                  <div className="p-1 rounded-lg bg-card/30">
                    <div className="flex items-center justify-between px-3 py-2 rounded-md bg-primary/10">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full bg-primary" />
                        <div className="text-sm text-primary">System</div>
                      </div>
                      <div className="text-xl font-bold bg-foreground text-primary-foreground px-3 py-1 rounded-md">04</div>
                    </div>
                  </div>

                  {/* General */}
                  <div className="p-1 rounded-lg bg-card/30">
                    <div className="flex items-center justify-between px-3 py-2 rounded-md bg-muted">
                      <div className="flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full bg-muted-foreground" />
                        <div className="text-sm text-foreground">General</div>
                      </div>
                      <div className="text-xl font-bold bg-foreground text-primary-foreground px-3 py-1 rounded-md">12</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="px-0 pt-4">
              <div className="w-full">
                <div className="text-xs text-muted-foreground mb-2">Unread Signal Strength</div>
                <div className="h-20 rounded-lg bg-muted flex flex-col items-center justify-center gap-2 p-3">
                  <ChartNoAxesColumn className="h-8 w-8 text-primary" />
                  <div className="text-sm font-semibold text-primary-foreground">SYSTEM OPTIMAL</div>
                </div>
              </div>
            </CardFooter>
          </Card>

          <Card>
            <CardContent>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">Live Fleet Map</div>
                    <div className="text-xs text-muted-foreground">Track all vehicles in real-time</div>
                  </div>
                  <Badge className="bg-accent text-accent-foreground">LIVE</Badge>
                </div>

                <div className="mt-3 rounded-md overflow-hidden h-40 bg-gradient-to-b from-slate-800 to-slate-900">
                  <Map />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <main className="p-6 max-w-7xl mx-auto">
      <FleetAlerts />
    </main>
  );
}
