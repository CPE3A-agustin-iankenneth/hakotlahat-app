import { Button } from "@/components/ui/button";
import { Flame, CheckCircle2, TrendingUp, Navigation, ChevronRight } from "lucide-react";

export default async function DriverPointsPage() {
  const stats = [
    {
      icon: Flame,
      badge: "+200 Bonus",
      badgeColor: "text-secondary",
      title: "CURRENT STREAK",
      value: "5 Days",
    },
    {
      icon: CheckCircle2,
      badge: "Top 5%",
      badgeColor: "text-accent",
      title: "HIGH-PRIORITY CLEARS",
      value: "28",
    },
    {
      icon: TrendingUp,
      badge: "Global Avg: 92%",
      badgeColor: "text-primary",
      title: "ON-TIME RATE",
      value: "98.5%",
    },
    {
      icon: Navigation,
      badge: "Platinum Goal",
      badgeColor: "text-secondary-foreground",
      title: "DISTANCE DRIVEN",
      value: "1,240 km",
    },
  ];

  const leaderboard = [
    {
      rank: 1,
      name: "Marco P.",
      role: "Regional Leader • Hub",
      efficiency: 99.2,
      routes: 142,
      points: 1420,
      bgColor: "bg-secondary/20",
      borderColor: "border-secondary/30",
      rankColor: "bg-secondary",
    },
    {
      rank: 2,
      name: "Alex R.",
      role: "Elite Driver • Hub-4",
      efficiency: 98.5,
      routes: 128,
      points: 1250,
      badge: "YOU",
      badgeBg: "bg-primary",
      bgColor: "bg-muted/50",
      borderColor: "border-border",
      rankColor: "bg-muted",
    },
    {
      rank: 3,
      name: "Sarah L.",
      role: "Elite Driver • Hub-2",
      efficiency: 97.8,
      routes: 115,
      points: 1180,
      bgColor: "bg-accent/20",
      borderColor: "border-accent/30",
      rankColor: "bg-accent",
    },
  ];

  const progressValue = 1250;
  const progressMax = 5000;
  const percentage = (progressValue / progressMax) * 100;
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Main Card Container */}
        <div className="bg-card/50 border border-primary/30 rounded-3xl p-12 flex items-center justify-between gap-12">
          {/* Left Side - Content */}
          <div className="flex flex-col gap-6 flex-1">
            <div>
              <p className="text-muted-foreground uppercase tracking-widest text-xs font-bold mb-2">
                Performance Overview
              </p>
              <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
                Excellent Work, Alex!
              </h1>
            </div>

            <Button className="bg-primary hover:bg-primary/90 text-foreground font-bold rounded-full w-fit px-6 py-2">
              ✓ ECO-MASTER TIER
            </Button>

            <p className="text-muted-foreground text-sm max-w-md leading-relaxed">
              You're in the top 2% of fleet efficiency this month. Keep up the
              clean driving habits to maintain your status.
            </p>
          </div>

          {/* Right Side - Circular Progress */}
          <div className="relative flex items-center justify-center w-80 h-80">
            <svg width="320" height="320" viewBox="0 0 320 320" className="transform -rotate-90">
              <circle cx="160" cy="160" r="90" stroke="#374151" strokeWidth="12" fill="none" />
              <circle
                cx="160"
                cy="160"
                r="90"
                stroke="currentColor" className="text-primary"
                strokeWidth="12"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.5s ease" }}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <p className="text-6xl font-bold text-foreground">{progressValue.toLocaleString()}</p>
              <p className="text-sm uppercase tracking-widest text-muted-foreground font-bold">Total Points</p>
            </div>
          </div>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-card/50 border border-border rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Icon size={20} className={stat.badgeColor} />
                  <span className={`text-xs font-bold ${stat.badgeColor}`}>
                    {stat.badge}
                  </span>
                </div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-2">
                  {stat.title}
                </p>
                <p className="text-3xl font-extrabold text-foreground">
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Fleet Leaderboard */}
        <div className="bg-card/50 border border-border rounded-3xl p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-extrabold mb-1">Fleet Leaderboard</h2>
              <p className="text-muted-foreground text-sm">Weekly rankings across all regional hubs</p>
            </div>
            <button className="text-primary text-sm font-semibold hover:text-primary/80 flex items-center gap-1">
              View Full Rankings <ChevronRight size={16} />
            </button>
          </div>

          <div className="space-y-4">
            {/* Headers */}
            <div className="grid grid-cols-6 gap-4 px-4 py-3 text-xs uppercase font-bold text-muted-foreground border-b border-border">
              <div>Rank</div>
              <div className="col-span-2">Driver</div>
              <div>Efficiency Rating</div>
              <div>Completed Tasks</div>
              <div className="text-right">Total Points</div>
            </div>

            {/* Leaderboard Rows */}
            {leaderboard.map((driver) => (
              <div
                key={driver.rank}
                className={`grid grid-cols-6 gap-4 items-center px-4 py-4 rounded-2xl border ${driver.bgColor} ${driver.borderColor} transition-all hover:border-opacity-100`}
              >
                {/* Rank */}
                <div className="flex justify-center">
                  <div className={`w-8 h-8 rounded-full ${driver.rankColor} flex items-center justify-center font-bold text-foreground text-sm`}>
                    {driver.rank}
                  </div>
                </div>

                {/* Driver Info */}
                <div className="col-span-2 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${driver.rankColor} flex items-center justify-center text-foreground font-bold`}>
                    {driver.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-foreground">{driver.name}</p>
                      {driver.badge && (
                        <span className={`${driver.badgeBg} text-foreground text-xs px-2 py-1 rounded-full font-bold`}>
                          {driver.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{driver.role}</p>
                  </div>
                </div>

                {/* Efficiency Bar */}
                <div>
                  <div className="w-full bg-muted-foreground/20 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all"
                      style={{ width: `${driver.efficiency}%` }}
                    />
                  </div>
                  <p className="text-sm font-semibold text-primary mt-1">{driver.efficiency}%</p>
                </div>

                {/* Routes */}
                <div className="text-center">
                  <p className="text-foreground font-semibold">{driver.routes} Routes</p>
                </div>

                {/* Points */}
                <div className="text-right">
                  <p className="text-foreground font-extrabold text-lg">{driver.points.toLocaleString()} pts</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
