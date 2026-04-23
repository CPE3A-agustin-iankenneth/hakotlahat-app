export const dynamic = 'force-dynamic';
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  ChevronRight,
  MapPinned,
  Navigation,
  Package,
  Plus,
  Route,
} from "lucide-react";

type RouteStop = {
  requestId: string;
  order: number;
  lng: number;
  lat: number;
  category: string | null;
  priority_score: number;
  volume_estimate: number | null;
  arrival: number;
};

type OptimizedPath = {
  coordinates: [number, number][];
  stops?: RouteStop[];
  totalDuration?: number;
  totalDistance?: number;
};

function formatArrival(seconds: number, routeStartedAt: string): string {
  const startMs = new Date(routeStartedAt).getTime();
  const arrivalMs = startMs + seconds * 1000;
  return new Date(arrivalMs).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatDistance(meters: number): string {
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${meters} m`;
}

export default async function SchedulePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Fetch active route with stop data
  const { data: activeRouteRaw } = await supabase
    .from("routes")
    .select("id, optimized_path, created_at")
    .eq("driver_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const optimizedPath = activeRouteRaw?.optimized_path as OptimizedPath | null;
  const stops: RouteStop[] = optimizedPath?.stops ?? [];
  const routeStartedAt = activeRouteRaw?.created_at as string | undefined;

  // Fetch current status of each pickup request so we can show collected vs pending
  const requestIds = stops.map((s) => s.requestId);
  const { data: requestStatuses } = requestIds.length > 0
    ? await supabase
      .from("pickup_requests")
      .select("id, status")
      .in("id", requestIds)
    : { data: [] };

  const statusMap = new Map<string, string>(
    (requestStatuses ?? []).map((r) => [r.id, r.status])
  );

  const collectedCount = [...statusMap.values()].filter((s) => s === "collected").length;

  return (
    <div className="mx-auto w-full max-w-4xl px-3 py-4 md:px-8 md:py-8">
      <section className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-background via-card to-background shadow-2xl">
        <div className="border-b border-border px-5 pb-4 pt-5 md:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
                Today&apos;s Itinerary
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })}
                {activeRouteRaw && ` • Route ${activeRouteRaw.id.slice(0, 8).toUpperCase()}`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
                Shift Progress
              </p>
              <p className="mt-1 text-xl font-semibold text-muted-foreground">
                <span className="text-4xl font-black text-foreground">{collectedCount}</span> /{" "}
                {stops.length} Stops Completed
              </p>
            </div>
          </div>

          {stops.length > 0 && (
            <div className="mt-5 h-2 rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all"
                style={{ width: `${stops.length > 0 ? (collectedCount / stops.length) * 100 : 0}%` }}
              />
            </div>
          )}

          {optimizedPath?.totalDuration && optimizedPath?.totalDistance && (
            <div className="mt-2 flex items-center justify-between text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              <span>
                Est. duration: {formatDuration(optimizedPath.totalDuration)}
              </span>
              <span>Total distance: {formatDistance(optimizedPath.totalDistance)}</span>
            </div>
          )}
        </div>

        <div className="relative px-5 py-4 md:px-6">
          {stops.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
              <Route className="h-12 w-12 mb-4 opacity-30" />
              <p className="text-lg font-semibold">No active route</p>
              <p className="text-sm mt-1">
                Go to the map and tap &quot;Optimize Route&quot; to generate today&apos;s schedule.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {stops.map((stop) => {
                const status = statusMap.get(stop.requestId) ?? "scheduled";
                const isDone = status === "collected";
                const isCurrent =
                  !isDone &&
                  stops.find((s) => statusMap.get(s.requestId) !== "collected")?.requestId ===
                  stop.requestId;

                return (
                  <Card
                    key={stop.requestId}
                    className={`relative rounded-xl border px-4 py-3 transition-colors ${isCurrent
                      ? "border-primary/70 bg-card/90 shadow-md ring-1 ring-primary/25"
                      : isDone
                        ? "border-border bg-card/40 opacity-60"
                        : "border-border bg-card/70"
                      }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                          Stop #{stop.order}
                          {routeStartedAt && stop.arrival > 0 && (
                            <> • ETA {formatArrival(stop.arrival, routeStartedAt)}</>
                          )}
                        </p>
                        <h2
                          className={`truncate text-2xl font-extrabold tracking-tight ${isDone
                            ? "text-muted-foreground/70 line-through"
                            : "text-foreground"
                            }`}
                        >
                          {stop.category ?? "Unknown Category"}
                        </h2>
                        <p className="truncate text-base text-muted-foreground">
                          {stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}
                          {isDone ? " • Collected" : ""}
                        </p>

                        {isCurrent && (
                          <div className="mt-3 flex items-center gap-5 text-foreground">
                            <span className="inline-flex items-center gap-1.5 text-lg font-bold">
                              <Package className="h-4 w-4 text-primary" />
                              Priority {stop.priority_score}
                            </span>
                            {stop.volume_estimate !== null && (
                              <span className="inline-flex items-center gap-1.5 text-lg font-bold">
                                {stop.volume_estimate} L
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {isCurrent ? (
                        <Button className="shrink-0 rounded-xl px-6 py-8 text-xl font-black transition hover:brightness-110">
                          <Navigation className="h-5 w-5" />
                          Navigate
                        </Button>
                      ) : isDone ? (
                        <CheckCircle2 className="h-6 w-6 shrink-0 text-secondary" />
                      ) : (
                        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
