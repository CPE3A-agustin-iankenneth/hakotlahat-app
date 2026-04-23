"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { createClient } from "@/lib/supabase/client";
import type { MunPickupRequest, RequestStatus } from "@/types/municipality";

interface Props {
  requests: MunPickupRequest[];
}

function statusBadge(status: RequestStatus) {
  if (status === "pending") return <Badge variant="secondary">Pending</Badge>;
  if (status === "scheduled") return <Badge>Scheduled</Badge>;
  return <Badge variant="outline">Collected</Badge>;
}

function priorityLabel(score: number): string {
  if (score >= 4) return "High";
  if (score >= 2) return "Medium";
  return "Low";
}

type TabValue = "all" | RequestStatus;

export function AdminRequestsContent({ requests }: Props) {
  const [localRequests, setLocalRequests] = useState(requests);
  const [activeTab, setActiveTab] = useState<TabValue>("pending");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const supabase = createClient();

  const counts = {
    all: localRequests.length,
    pending: localRequests.filter((r) => r.status === "pending").length,
    scheduled: localRequests.filter((r) => r.status === "scheduled").length,
    collected: localRequests.filter((r) => r.status === "collected").length,
  };

  const filtered =
    activeTab === "all"
      ? localRequests
      : localRequests.filter((r) => r.status === activeTab);

  async function updateStatus(id: string, status: RequestStatus) {
    setIsUpdating(id);
    setLocalRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
    const { error } = await supabase
      .from("pickup_requests")
      .update({ status })
      .eq("id", id);
    setIsUpdating(null);
    if (error) {
      toast.error("Failed to update request.");
      setLocalRequests(requests);
    } else {
      toast.success(
        status === "scheduled"
          ? "Request marked as scheduled."
          : "Request marked as collected."
      );
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster />
      <div className="mx-auto max-w-7xl px-6 py-8 space-y-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-4xl font-bold tracking-tight">Pickup Requests</h1>
          <p className="mt-2 text-muted-foreground">
            Review and manage all resident pickup requests.
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as TabValue)}
          >
            <TabsList className="mb-6">
              {(["all", "pending", "scheduled", "collected"] as const).map(
                (tab) => (
                  <TabsTrigger key={tab} value={tab} className="capitalize">
                    {tab}
                    <Badge
                      variant="secondary"
                      className="ml-1.5 rounded-full px-1.5 py-0 text-[10px]"
                    >
                      {counts[tab]}
                    </Badge>
                  </TabsTrigger>
                )
              )}
            </TabsList>

            {(["all", "pending", "scheduled", "collected"] as const).map(
              (tab) => (
                <TabsContent key={tab} value={tab}>
                  {filtered.length === 0 ? (
                    <div className="rounded-2xl border border-dashed p-12 text-center text-muted-foreground">
                      No {tab === "all" ? "" : tab} requests found.
                    </div>
                  ) : (
                    <div className="grid gap-5 lg:grid-cols-2">
                      {filtered.map((req, i) => (
                        <motion.div
                          key={req.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: Math.min(i * 0.04, 0.3) }}
                          className="flex gap-5 rounded-3xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
                        >
                          {/* Image */}
                          <div className="shrink-0">
                            {req.image_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={req.image_url}
                                alt={req.category ?? "Waste"}
                                className="h-32 w-32 rounded-2xl object-cover"
                              />
                            ) : (
                              <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-muted">
                                <Package className="h-8 w-8 text-muted-foreground/40" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="min-w-0 flex-1 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xl font-black leading-tight">
                                {req.category ?? "Uncategorized"}
                              </p>
                              {statusBadge(req.status)}
                            </div>

                            <p className="text-sm text-muted-foreground">
                              {req.resident?.full_name ?? req.resident?.email ?? "Unknown resident"}
                            </p>

                            <div className="flex flex-wrap gap-2 text-xs">
                              <span className="rounded-full bg-muted px-2.5 py-1 font-medium">
                                Priority: {priorityLabel(req.priority_score)} ({req.priority_score})
                              </span>
                              {req.volume_estimate && (
                                <span className="rounded-full bg-muted px-2.5 py-1 font-medium">
                                  ~{req.volume_estimate} L
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3 shrink-0" />
                              <span>
                                {req.latitude.toFixed(4)}, {req.longitude.toFixed(4)}
                              </span>
                            </div>

                            <p className="text-xs text-muted-foreground">
                              {new Date(req.created_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>

                            {/* Actions */}
                            <div className="flex gap-2 pt-1">
                              {req.status === "scheduled" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="rounded-full"
                                  disabled={isUpdating === req.id}
                                  onClick={() => updateStatus(req.id, "collected")}
                                >
                                  Mark Collected
                                </Button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              )
            )}
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}
