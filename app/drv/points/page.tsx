import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, CheckCircle2, TrendingUp, Navigation, ChevronRight } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  name: string;
  role: string;
  efficiency: number;
  routes: number;
  points: number;
  isCurrentUser?: boolean;
}

async function DriverPointsPageContent() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let myScore = {
    total_collections: 0,
    routes_completed: 0,
    total_distance_km: 0,
    on_time_rate: 1.0,
    avg_route_duration_min: 0,
    drv_points: 0,
  };

  let myName = "Driver";

  if (user) {
    const [scoreResult, profileResult] = await Promise.all([
      supabase
        .from("drv_score")
        .select(
          "total_collections, routes_completed, total_distance_km, on_time_rate, avg_route_duration_min, drv_points"
        )
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("users")
        .select("full_name")
        .eq("id", user.id)
        .single(),
    ]);

    if (scoreResult.data) myScore = scoreResult.data;
    if (profileResult.data?.full_name) myName = profileResult.data.full_name;
  }

  const { data: leaderboardRaw } = await supabase
    .from("drv_score")
    .select("user_id, drv_points, routes_completed, on_time_rate")
    .order("drv_points", { ascending: false })
    .limit(10);

  const leaderboard: LeaderboardEntry[] = [];

  if (leaderboardRaw && leaderboardRaw.length > 0) {
    const userIds = leaderboardRaw.map((row) => row.user_id);
    const { data: usersData } = await supabase
      .from("users")
      .select("id, full_name")
      .in("id", userIds);

    const nameMap = Object.fromEntries(
      (usersData || []).map((u) => [u.id, u.full_name ?? "Driver"])
    );

    leaderboardRaw.forEach((row, idx) => {
      leaderboard.push({
        rank: idx + 1,
        name: nameMap[row.user_id] ?? "Driver",
        role: "Driver",
        efficiency: Math.round((row.on_time_rate ?? 1.0) * 100 * 10) / 10,
        routes: row.routes_completed ?? 0,
        points: row.drv_points ?? 0,
        isCurrentUser: row.user_id === user?.id,
      });
    });
  }

  const myRankEntry = leaderboard.find((e) => e.isCurrentUser);

  const progressValue = myScore.drv_points;
  const progressMax = 5000;
  const percentage = Math.min((progressValue / progressMax) * 100, 100);
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const onTimePercent = Math.round((myScore.on_time_rate ?? 1.0) * 1000) / 10;

  const stats = [
    {
      icon: CheckCircle2,
      badge: myRankEntry ? `Rank #${myRankEntry.rank}` : "—",
      badgeColor: "text-accent",
      title: "TOTAL COLLECTIONS",
      value: myScore.total_collections.toString(),
    },
    {
      icon: TrendingUp,
      badge: "On-Time Rate",
      badgeColor: "text-primary",
      title: "ON-TIME RATE",
      value: `${onTimePercent}%`,
    },
    {
      icon: Navigation,
      badge: "Lifetime",
      badgeColor: "text-secondary-foreground",
      title: "DISTANCE DRIVEN",
      value: `${Number(myScore.total_distance_km).toLocaleString()} km`,
    },
    {
      icon: Flame,
      badge: "Completed",
      badgeColor: "text-secondary",
      title: "ROUTES COMPLETED",
      value: myScore.routes_completed.toString(),
    },
  ];

  const rankColors = [
    { bg: "bg-secondary/20", border: "border-secondary/30", rank: "bg-secondary" },
    { bg: "bg-muted/50",     border: "border-border",        rank: "bg-muted" },
    { bg: "bg-accent/20",   border: "border-accent/30",     rank: "bg-accent" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-4 md:space-y-8">

        {/* Hero Card — compact side-by-side on mobile, spacious on desktop */}
        <Card className="bg-card/50 border-primary/30 rounded-3xl p-4 md:p-12 flex items-center gap-4 md:gap-12">
          {/* Left: text content */}
          <div className="flex flex-col gap-3 md:gap-6 flex-1 min-w-0">
            <div>
              <p className="text-muted-foreground uppercase tracking-widest text-[10px] md:text-xs font-bold mb-1 md:mb-2">
                Performance Overview
              </p>
              <h1 className="text-xl md:text-5xl font-extrabold tracking-tight leading-tight truncate">
                {myScore.drv_points > 0
                  ? `Excellent Work, ${myName.split(" ")[0]}!`
                  : `Welcome, ${myName.split(" ")[0]}!`}
              </h1>
            </div>

            <Button className="bg-primary hover:bg-primary/90 text-foreground font-bold rounded-full w-fit px-3 md:px-6 py-1.5 md:py-2 text-xs md:text-base">
              {myScore.drv_points >= 4000
                ? "✓ ECO-MASTER TIER"
                : myScore.drv_points >= 2000
                ? "✓ ELITE TIER"
                : myScore.drv_points >= 500
                ? "✓ ACTIVE DRIVER"
                : "✦ GETTING STARTED"}
            </Button>

            <p className="text-muted-foreground text-xs leading-relaxed">
              {myRankEntry
                ? `Ranked #${myRankEntry.rank} in the fleet.`
                : "Complete routes to earn points!"}
            </p>
          </div>

          {/* Right: circular progress — compact on mobile, full on desktop */}
          <div className="relative flex items-center justify-center w-28 h-28 md:w-80 md:h-80 shrink-0">
            <svg viewBox="0 0 320 320" className="w-full h-full transform -rotate-90">
              <circle cx="160" cy="160" r="90" stroke="#374151" strokeWidth="12" fill="none" />
              <circle
                cx="160"
                cy="160"
                r="90"
                stroke="currentColor"
                className="text-primary"
                strokeWidth="12"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.5s ease" }}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <p className="text-lg md:text-6xl font-bold text-foreground leading-none">{progressValue.toLocaleString()}</p>
              <p className="text-[8px] md:text-sm uppercase tracking-widest text-muted-foreground font-bold mt-0.5">pts</p>
            </div>
          </div>
        </Card>

        {/* Stats Cards Grid — 2 cols on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="bg-card/50 rounded-2xl p-4 md:p-6">
                <div className="flex items-center gap-2 mb-3 md:mb-4">
                  <Icon size={18} className={stat.badgeColor} />
                  <Badge variant="outline" className={`text-xs font-bold border-none ${stat.badgeColor} truncate`}>
                    {stat.badge}
                  </Badge>
                </div>
                <p className="text-[10px] md:text-xs uppercase tracking-wide md:tracking-widest text-muted-foreground font-bold mb-1 md:mb-2 leading-tight">
                  {stat.title}
                </p>
                <p className="text-xl md:text-3xl font-extrabold text-foreground">
                  {stat.value}
                </p>
              </Card>
            );
          })}
        </div>

        {/* Fleet Leaderboard */}
        <Card className="bg-card/50 rounded-3xl p-4 md:p-8">
          <div className="flex items-center justify-between mb-4 md:mb-8">
            <div>
              <h2 className="text-lg md:text-2xl font-extrabold mb-0.5">Fleet Leaderboard</h2>
              <p className="text-muted-foreground text-xs md:text-sm">Rankings across all drivers</p>
            </div>
            <Button variant="link" className="text-primary font-semibold hover:text-primary/80 flex items-center gap-1 p-0 h-auto text-xs md:text-sm shrink-0">
              <span className="hidden sm:inline">View Full Rankings</span>
              <span className="sm:hidden">Full</span>
              <ChevronRight size={14} />
            </Button>
          </div>

          <div className="space-y-3 md:space-y-4">
            {/* Column headers — simplified on mobile */}
            <div className="grid grid-cols-[auto_1fr_auto] md:grid-cols-6 gap-2 md:gap-4 px-3 md:px-4 py-2 md:py-3 text-xs uppercase font-bold text-muted-foreground border-b border-border">
              <div>Rank</div>
              <div className="md:col-span-2">Driver</div>
              <div className="hidden md:block">On-Time Rate</div>
              <div className="hidden md:block">Routes Done</div>
              <div className="text-right">Points</div>
            </div>

            {leaderboard.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground text-sm">
                No leaderboard data yet. Complete routes to appear here!
              </div>
            ) : (
              leaderboard.map((driver) => {
                const colors = rankColors[Math.min(driver.rank - 1, rankColors.length - 1)];
                return (
                  <div
                    key={driver.rank}
                    className={`grid grid-cols-[auto_1fr_auto] md:grid-cols-6 gap-2 md:gap-4 items-center px-3 md:px-4 py-3 md:py-4 rounded-2xl border ${colors.bg} ${colors.border} transition-all`}
                  >
                    {/* Rank */}
                    <div className="flex justify-center">
                      <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full ${colors.rank} flex items-center justify-center font-bold text-foreground text-xs md:text-sm`}>
                        {driver.rank}
                      </div>
                    </div>

                    {/* Driver Info */}
                    <div className="md:col-span-2 flex items-center gap-2 md:gap-3 min-w-0">
                      <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full ${colors.rank} flex items-center justify-center text-foreground font-bold shrink-0 text-sm`}>
                        {driver.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-semibold text-foreground text-sm truncate">{driver.name}</p>
                          {driver.isCurrentUser && (
                            <Badge className="bg-primary text-foreground text-[10px] px-1.5 py-0 h-4">YOU</Badge>
                          )}
                        </div>
                        <p className="text-[10px] md:text-xs text-muted-foreground">{driver.efficiency}% on-time</p>
                      </div>
                    </div>

                    {/* Efficiency Bar — desktop only */}
                    <div className="hidden md:block">
                      <div className="w-full bg-muted-foreground/20 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-primary h-full transition-all"
                          style={{ width: `${Math.min(driver.efficiency, 100)}%` }}
                        />
                      </div>
                      <p className="text-sm font-semibold text-primary mt-1">{driver.efficiency}%</p>
                    </div>

                    {/* Routes — desktop only */}
                    <div className="hidden md:block text-center">
                      <p className="text-foreground font-semibold text-sm">{driver.routes} Routes</p>
                    </div>

                    {/* Points */}
                    <div className="text-right">
                      <p className="text-foreground font-extrabold text-base md:text-lg">{driver.points.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground md:hidden">pts</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function DriverPointsPage() {
  return (
    <Suspense fallback={null}>
      <DriverPointsPageContent />
    </Suspense>
  );
}
