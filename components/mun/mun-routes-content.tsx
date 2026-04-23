"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Route, Users, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { MunRoute } from "@/types/municipality";

interface Props {
  activeRoutes: MunRoute[];
  completedRoutes: MunRoute[];
}

function getStopCount(route: MunRoute): string {
  const path = route.optimized_path;
  if (!path) return "—";
  const stops =
    (path as { stops?: unknown[] }).stops?.length ??
    (path as { waypoints?: unknown[] }).waypoints?.length;
  return stops != null ? String(stops) : "—";
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MunRoutesContent({ activeRoutes, completedRoutes }: Props) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-6 py-8 space-y-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-4xl font-bold tracking-tight">Routes</h1>
          <p className="mt-2 text-muted-foreground">
            Active and completed waste collection routes.
          </p>
        </motion.div>

        {/* Active Routes */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-4 flex items-center gap-3"
          >
            <h2 className="text-xl font-bold">Active Routes</h2>
            <span className="flex items-center gap-1.5 rounded-full bg-green-500/15 px-2.5 py-0.5 text-xs font-semibold text-green-600">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
              {activeRoutes.length} live
            </span>
          </motion.div>

          {activeRoutes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="rounded-2xl border-2 border-dashed p-12 text-center text-muted-foreground"
            >
              No active routes at the moment.
            </motion.div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeRoutes.map((route, i) => (
                <motion.div
                  key={route.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + Math.min(i * 0.05, 0.3) }}
                  className="rounded-2xl border bg-card p-5 shadow-sm"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <Badge className="flex items-center gap-1.5 bg-green-500/15 text-green-600 hover:bg-green-500/20">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                      Active
                    </Badge>
                  </div>
                  <p className="font-bold">
                    {route.driver?.full_name ?? route.driver?.email ?? "Unknown driver"}
                  </p>
                  <div className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Route className="h-3.5 w-3.5 shrink-0" />
                      <span>{getStopCount(route)} stops</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{route.driver?.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <span>Started {formatDate(route.created_at)}</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link href="/mun/fleet">
                      <Button variant="outline" size="sm" className="w-full rounded-full">
                        View in Fleet
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Completed Routes */}
        <section>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-4 text-xl font-bold"
          >
            Completed Routes
            <span className="ml-2 text-base font-normal text-muted-foreground">
              (last 20)
            </span>
          </motion.h2>

          {completedRoutes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="rounded-2xl border-2 border-dashed p-12 text-center text-muted-foreground"
            >
              No completed routes yet.
            </motion.div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {completedRoutes.map((route, i) => (
                <motion.div
                  key={route.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + Math.min(i * 0.04, 0.35) }}
                  className="rounded-2xl border bg-card p-5 opacity-80 shadow-sm transition-opacity hover:opacity-100"
                >
                  <div className="mb-3">
                    <Badge variant="secondary">Completed</Badge>
                  </div>
                  <p className="font-bold">
                    {route.driver?.full_name ?? route.driver?.email ?? "Unknown driver"}
                  </p>
                  <div className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Route className="h-3.5 w-3.5 shrink-0" />
                      <span>{getStopCount(route)} stops</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <span>{formatDate(route.created_at)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
