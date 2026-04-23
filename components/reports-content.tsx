"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Chart } from "@/components/ui/chart";
import { CompositionChart } from "@/components/ui/composition-chart";
import { Progress } from "@/components/ui/progress";
import { Leaf, CheckCircle } from "lucide-react";

// How many collection weeks to consider a "full" streak milestone (100% bar)
const STREAK_TARGET_WEEKS = 20;

/**
 * Returns the ISO week start (Monday 00:00:00 UTC) for a given Date.
 */
function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diff = (day === 0 ? -6 : 1) - day;
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString().split("T")[0];
}

/**
 * Returns the number of consecutive weeks with at least one collected request.
 */
function computeCollectionStreak(weeksWithCollections: Set<string>): number {
  if (weeksWithCollections.size === 0) return 0;

  const now = new Date();
  const lookback = STREAK_TARGET_WEEKS * 4;

  for (let i = 0; i < lookback; i++) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i * 7);
    const weekKey = getWeekStart(d);

    if (weeksWithCollections.has(weekKey)) {
      continue;
    }
    return i;
  }

  return lookback;
}

// ── Types ──────────────────────────────────────────────────────────────────

interface WeeklyEntry {
  label: string;
  primary: number;
  secondary: number;
}

interface CompositionEntry {
  name: string;
  value: number;
  color: string;
}

const COMPOSITION_CATEGORIES = [
  { label: "Cardboard & Paper", color: "#059669" },
  { label: "Plastics", color: "#10b981" },
  { label: "Electronics", color: "#0ea5e9" },
  { label: "Bulk Waste", color: "#f59e0b" },
  { label: "Organic", color: "#22c55e" },
  { label: "Hazardous", color: "#ef4444" },
  { label: "Other", color: "#94a3b8" },
] as const;

function buildWeeklySeries(weekCount: number) {
  const now = new Date();
  const series: WeeklyEntry[] = [];
  const keys: string[] = [];

  for (let i = weekCount - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i * 7);
    const weekKey = getWeekStart(d);
    const labelDate = new Date(`${weekKey}T00:00:00Z`);

    keys.push(weekKey);
    series.push({
      label: labelDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      primary: 0,
      secondary: 0,
    });
  }

  return { series, keys };
}

interface ReportsContentProps {
  /** The authenticated user's ID passed down from the server component */
  userId: string | null;
}

// ── Component ──────────────────────────────────────────────────────────────

export function ReportsContent({ userId }: ReportsContentProps) {
  const supabase = createClient();

  const [weeklyData, setWeeklyData] = useState<WeeklyEntry[]>(
    () => buildWeeklySeries(5).series,
  );

  const [compositionData, setCompositionData] = useState<CompositionEntry[]>([
    { name: "Plastic & Paper", value: 0, color: "#059669" },
    { name: "Organic", value: 0, color: "#10b981" },
    { name: "Other", value: 0, color: "#d1d5db" },
  ]);

  const [totalRecycledKg, setTotalRecycledKg] = useState(0);
  const [ecoPoints, setEcoPoints] = useState(0);
  const [totalRequests, setTotalRequests] = useState(0);
  const [communityRank, setCommunityRank] = useState<string | null>(null);
  const [collectionStreakWeeks, setCollectionStreakWeeks] = useState(0);

  const streakProgress = Math.min(
    Math.round((collectionStreakWeeks / STREAK_TARGET_WEEKS) * 100),
    100,
  );

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from("pickup_requests")
          .select("id,resident_id,category,created_at,status");

        if (error) {
          console.error(
            "Supabase error:",
            error.message,
            error.details,
            error.hint,
            error.code,
          );
          return;
        }

        const allRequests = data ?? [];

        const myRequests = userId
          ? allRequests.filter((r) => r.resident_id === userId)
          : allRequests;

        // ── Community rank ────────────────────────────────────────────────
        const countPerUser = new Map<string, number>();
        for (const row of allRequests) {
          const uid = row.resident_id ?? "__unknown__";
          countPerUser.set(uid, (countPerUser.get(uid) ?? 0) + 1);
        }
        const myCount = userId ? (countPerUser.get(userId) ?? 0) : 0;
        const allCounts = Array.from(countPerUser.values());
        const totalResidents = allCounts.length;

        let rankLabel: string | null = null;
        if (totalResidents >= 2 && myCount > 0) {
          const usersBelow = allCounts.filter((c) => c < myCount).length;
          const percentile = (usersBelow / totalResidents) * 100;
          const topPct = Math.max(1, Math.round(100 - percentile));
          rankLabel = `Top ${topPct}%`;
        }

        // ── Weekly collection chart ──────────────────────────────────────
        const { series: weeks, keys: weekKeys } = buildWeeklySeries(5);
        const categoryCounts: Record<string, number> = Object.fromEntries(
          COMPOSITION_CATEGORIES.map((entry) => [entry.label, 0]),
        );
        const categoryLookup = new Map(
          COMPOSITION_CATEGORIES.map((entry) => [
            entry.label.toLowerCase(),
            entry.label,
          ]),
        );
        const weeksWithCollections = new Set<string>();

        for (const row of myRequests) {
          const created = new Date(row.created_at);
          const weekKey = getWeekStart(created);
          const idx = weekKeys.indexOf(weekKey);
          if (idx !== -1) {
            if (row.status === "collected") weeks[idx].primary += 1;
            else weeks[idx].secondary += 1;
          }

          const normalized = (row.category ?? "Other").trim().toLowerCase();
          const label = categoryLookup.get(normalized) ?? "Other";
          categoryCounts[label] = (categoryCounts[label] ?? 0) + 1;

          if (row.status === "collected") {
            weeksWithCollections.add(weekKey);
          }
        }

        const totalComp =
          Object.values(categoryCounts).reduce(
            (sum, value) => sum + value,
            0,
          ) || 1;

        const composition: CompositionEntry[] = COMPOSITION_CATEGORIES.map(
          (entry) => ({
            name: entry.label,
            value: Math.round((categoryCounts[entry.label] / totalComp) * 100),
            color: entry.color,
          }),
        );

        let totalRecycled = 0;
        let fetchedEcoPoints = 0;
        let fetchedTotalRequests = 0;
        if (userId) {
          const { data: resScore, error: scoreError } = await supabase
            .from("res_score")
            .select("total_recycled, eco_points, total_requests")
            .eq("user_id", userId)
            .single();

          if (scoreError) {
            console.error(
              "res_score fetch error:",
              scoreError.message,
              scoreError.details,
              scoreError.hint,
              scoreError.code,
            );
          }

          totalRecycled = Number(resScore?.total_recycled ?? 0);
          fetchedEcoPoints = Number(resScore?.eco_points ?? 0);
          fetchedTotalRequests = Number(resScore?.total_requests ?? 0);
        }

        const streak = computeCollectionStreak(weeksWithCollections);

        if (!mounted) return;
        setWeeklyData(weeks);
        setCompositionData(composition);
        setTotalRecycledKg(totalRecycled);
        setEcoPoints(fetchedEcoPoints);
        setTotalRequests(fetchedTotalRequests);
        setCollectionStreakWeeks(streak);
        setCommunityRank(rankLabel);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();

    const channel = supabase
      .channel("public:pickup_requests")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pickup_requests" },
        () => fetchData(),
      )
      .subscribe();

    return () => {
      mounted = false;
      try {
        channel.unsubscribe();
      } catch {
        try {
          // @ts-ignore
          supabase.removeChannel(channel);
        } catch {}
      }
    };
  }, [supabase, userId]);

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="p-6 bg-background min-h-screen space-y-6">
      <div className="flex items-start gap-3">
        <div className="w-1 rounded-full bg-primary self-stretch" />
        <div>
          <h1 className="text-3xl font-bold mb-2">Impact Analytics</h1>
          <p className="text-muted-foreground">
            Your contribution to a sustainable community.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
        {/* ── Impact overview ───────────────────────────────────────────── */}
        <Card className="relative overflow-hidden bg-card shadow-sm h-full">
          <div className="pointer-events-none absolute top-6 right-6 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
          <CardContent className="relative grid gap-8 h-full">
            <div className="space-y-3">
              <p className="text-2xl font-bold uppercase tracking-[0.10em] text-primary">
                Impact overview
              </p>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Total Recycled</p>
                <div className="flex flex-wrap items-end gap-6">
                  <div className="flex items-end gap-3">
                    <p className="text-7xl font-bold tracking-tight text-foreground">
                      {totalRecycledKg}
                    </p>
                    <span className="text-3xl font-semibold text-muted-foreground">
                      kg
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Eco Points</p>
                    <p className="text-2xl font-bold text-primary">{ecoPoints.toLocaleString()} pts</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Lifetime Requests</p>
                    <p className="text-2xl font-bold text-foreground">{totalRequests}</p>
                  </div>
                  <div className="rounded-full bg-primary/20 px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm">
                    <p className="text-xs text-primary">Community Rank</p>
                    {communityRank ? (
                      <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1">
                        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                        {communityRank}
                      </div>
                    ) : (
                      <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1">
                        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-muted-foreground" />
                        <span className="text-muted-foreground text-xs">
                          Not ranked yet
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Streaks & milestones ──────────────────────────────────────── */}
        <Card className="bg-card shadow-sm h-full">
          <CardContent className="space-y-6 h-full">
            <div className="space-y-4">
              <p className="text-2xl font-bold uppercase tracking-[0.10em] text-muted-foreground">
                Streaks & milestones
              </p>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-m text-muted-foreground">
                    Collection Streak
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {collectionStreakWeeks}{" "}
                    {collectionStreakWeeks === 1 ? "Week" : "Weeks"}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-1">
              <Progress
                value={streakProgress}
                className="h-3 rounded-full bg-muted"
              />
              <p className="text-right text-xs text-muted-foreground">
                {streakProgress}%
              </p>
            </div>
            <div className="rounded-3xl border border-border bg-card p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive text-foreground shadow-sm">
                  <Leaf className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                    Latest badge
                  </p>
                  <p className="text-2xl font-semibold text-foreground">
                    Zero waste
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Weekly collection chart ───────────────────────────────────── */}
        <Card className="bg-card shadow-sm h-full">
          <CardContent className="space-y-6 h-full">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-2xl font-bold text-foreground">
                  Weekly Collection
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="inline-flex items-center gap-2">
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
                  Collected
                </div>
                <div className="inline-flex items-center gap-2">
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-muted" />
                  Other Requests
                </div>
              </div>
            </div>
            <div className="flex-1">
              <Chart data={weeklyData} />
            </div>
          </CardContent>
        </Card>

        {/* ── Composition chart ─────────────────────────────────────────── */}
        <Card className="bg-card shadow-sm h-full">
          <CardContent className="space-y-6 h-full">
            <div>
              <p className="text-2xl font-bold text-foreground">Composition</p>
            </div>
            <div className="flex-1">
              <CompositionChart data={compositionData} />
            </div>
            <div className="space-y-3">
              {compositionData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-flex h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.name}
                  </div>
                  <span className="font-semibold text-foreground">
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Civic impact banner ───────────────────────────────────────────── */}
      <Card className="bg-muted shadow-sm">
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-foreground shadow-sm">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold text-foreground text-2xl">Civic Impact</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Your consistent recycling efforts this quarter have saved
                approximately 15 trees and reduced landfill mass by 0.8 cubic
                meters. You are actively helping our city reach its 2030
                zero-waste sustainability goals.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
