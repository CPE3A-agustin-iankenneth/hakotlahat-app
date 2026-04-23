"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ClipboardList,
  Users,
  Truck,
  CheckCircle2,
  Package,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { createClient } from "@/lib/supabase/client";
import type { MunDriverSession, MunPickupRequest, MunDashboardStats } from "@/types/municipality";

interface Props {
  stats: MunDashboardStats;
  activeSessions: MunDriverSession[];
  pendingRequests: MunPickupRequest[];
}

function relativeTime(ts: string | null): string {
  if (!ts) return "Unknown";
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function sessionStatusBadge(status: string) {
  if (status === "ON_ROUTE")
    return (
      <Badge className="flex items-center gap-1.5 bg-secondary/20 text-secondary-foreground">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-secondary" />
        On Route
      </Badge>
    );
  if (status === "ON_DUTY")
    return (
      <Badge className="bg-primary/15 text-primary hover:bg-primary/20">
        On Duty
      </Badge>
    );
  return <Badge variant="secondary">Off Duty</Badge>;
}

function priorityBadge(score: number) {
  if (score >= 4)
    return (
      <Badge className="bg-destructive/15 text-destructive hover:bg-destructive/20">
        Priority {score}
      </Badge>
    );
  return <Badge variant="secondary">Score {score}</Badge>;
}

export function AdminDashboardContent({ stats, activeSessions, pendingRequests }: Props) {
  const [localRequests, setLocalRequests] = useState(pendingRequests);
  const supabase = createClient();

  async function markScheduled(id: string) {
    setLocalRequests((prev) => prev.filter((r) => r.id !== id));
    const { error } = await supabase
      .from("pickup_requests")
      .update({ status: "scheduled" })
      .eq("id", id);
    if (error) {
      toast.error("Failed to update request.");
      setLocalRequests(pendingRequests);
    } else {
      toast.success("Request marked as scheduled.");
    }
  }

  const statCards = [
    {
      label: "Pending Requests",
      value: stats.pendingCount,
      icon: ClipboardList,
      bg: "bg-amber-500/10",
      color: "text-amber-600",
    },
    {
      label: "Active Drivers",
      value: stats.activeDriverCount,
      icon: Users,
      bg: "bg-primary/10",
      color: "text-primary",
    },
    {
      label: "Vehicles Ready",
      value: stats.availableVehicleCount,
      icon: Truck,
      bg: "bg-secondary/10",
      color: "text-secondary-foreground",
    },
    {
      label: "Routes Today",
      value: stats.completedRoutesToday,
      icon: CheckCircle2,
      bg: "bg-green-500/10",
      color: "text-green-600",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster />
      <div className="mx-auto max-w-7xl px-6 py-8 space-y-8">

        {/* Stat Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border bg-card p-6 shadow-sm"
            >
              <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${card.bg}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <p className="text-4xl font-bold">{card.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{card.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Live Fleet */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Live Fleet</h2>
            <Link
              href="/admin/fleet"
              className="text-sm font-semibold text-primary hover:underline"
            >
              View Full Fleet →
            </Link>
          </div>

          {activeSessions.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
              No drivers currently on duty.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeSessions.map((session, i) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + Math.min(i * 0.05, 0.3) }}
                  className="rounded-2xl border bg-card p-5 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                      {session.driver?.full_name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold">
                        {session.driver?.full_name ?? "Unknown Driver"}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {session.driver?.email}
                      </p>
                    </div>
                    {sessionStatusBadge(session.status)}
                  </div>
                  <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Truck className="h-3.5 w-3.5 shrink-0" />
                      <span>{session.vehicle?.plate_number ?? "Unassigned"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span>Updated {relativeTime(session.last_location_update)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Pending Requests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Pending Requests</h2>
            <Link
              href="/admin/requests"
              className="text-sm font-semibold text-primary hover:underline"
            >
              View All Requests →
            </Link>
          </div>

          <div className="rounded-2xl border bg-card">
            {localRequests.length === 0 ? (
              <div className="p-10 text-center text-muted-foreground">
                No pending requests at this time.
              </div>
            ) : (
              <div className="divide-y">
                {localRequests.map((req) => (
                  <div
                    key={req.id}
                    className="flex items-center gap-4 px-5 py-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">
                        {req.category ?? "Uncategorized"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {req.resident?.full_name ?? req.resident?.email ?? "Unknown resident"} •{" "}
                        {new Date(req.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      {priorityBadge(req.priority_score)}
                      <Button
                        size="sm"
                        onClick={() => markScheduled(req.id)}
                        className="rounded-full"
                      >
                        Schedule
                      </Button>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
