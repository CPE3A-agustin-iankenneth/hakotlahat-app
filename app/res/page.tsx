"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  PlusCircle,
  CheckCircle2,
  Circle,
  Leaf,
  Star,
  ChevronRight,
  Package,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import {
  RequestPickupModal,
  RequestPickupData,
} from "@/components/pickup-request-modal";
import { createClient } from "@/lib/supabase/client";
import { uploadImage } from "@/lib/upload-image";

interface CollectionStep {
  label: string;
  detail: string;
  completed: boolean;
}

interface ActivityItem {
  id: string;
  category: string;
  type: string;
  date: string;
  points: number;
  status: "Completed" | "Pending" | "In Progress";
}

const initialStats = { totalRecycled: 0, ecoCredits: 0 };

const initialActivity: ActivityItem[] = [];

const Index = () => {
  const [steps, setSteps] = useState<CollectionStep[]>([]);
  const [activity, setActivity] = useState(initialActivity);
  const [stats, setStats] = useState(initialStats);
  const [pickupOpen, setPickupOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(
    null,
  );
  const [activityOpen, setActivityOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [latestRequest, setLatestRequest] = useState<any>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          console.error("User not authenticated");
          setLoading(false);
          return;
        }

        // Fetch user's pickup requests (activity) — source of truth for stats
        const { data: pickupData } = await supabase
          .from("pickup_requests")
          .select("id, category, status, created_at, volume_estimate")
          .eq("resident_id", user.id)
          .order("created_at", { ascending: false });

        // Transform pickup data to activity items
        const activityItems: ActivityItem[] = (pickupData || []).map(
          (pickup) => ({
            id: pickup.id,
            category: pickup.category,
            type: "Scheduled Pickup",
            date: new Date(pickup.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            points:
              pickup.status === "collected"
                ? Math.ceil((pickup.volume_estimate || 0) * 5)
                : 0,
            status:
              pickup.status === "pending"
                ? "Pending"
                : pickup.status === "scheduled"
                  ? "In Progress"
                  : "Completed",
          }),
        );

        // Calculate stats from real data
        const ecoCredits = activityItems.reduce((sum, item) => sum + item.points, 0);
        const totalRecycledHistory = (pickupData || [])
          .filter((p) => p.status === "collected")
          .reduce((sum, p) => sum + Math.ceil((p.volume_estimate || 0) * 2.4), 0);
        const totalRequests = (pickupData || []).length;

        // Sync res_score table to match reality (fire-and-forget)
        supabase
          .from("res_score")
          .upsert(
            {
              user_id: user.id,
              eco_points: ecoCredits,
              total_recycled: totalRecycledHistory,
              total_requests: totalRequests,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" },
          )
          .then(({ error }) => {
            if (error) console.error("[res_score sync]", error.message);
          });

        // Map latest request to steps (only if from today)
        const latest = pickupData?.[0];
        const isToday = latest ? new Date(latest.created_at).toDateString() === new Date().toDateString() : false;

        if (latest && isToday) {
          setLatestRequest(latest);
          const s = latest.status;
          setSteps([
            {
              label: "Request Pending",
              detail: "Validated by system",
              completed: s === "pending" || s === "scheduled" || s === "collected",
            },
            {
              label: "Route Scheduled",
              detail: s === "scheduled" || s === "collected" ? "Driver assigned" : "Pending assignment",
              completed: s === "scheduled" || s === "collected",
            },
            {
              label: "Collected",
              detail: s === "collected" ? "Items picked up" : "Expected soon",
              completed: s === "collected",
            },
          ]);
        } else {
          setLatestRequest(null);
          setSteps([]);
        }

        setStats({ totalRecycled: totalRecycledHistory, ecoCredits });
        setActivity(activityItems);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handlePickupSubmit = async (data: RequestPickupData) => {
    const supabase = createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      toast.error("You must be logged in to submit a request.");
      return;
    }

    const { data: profile } = await supabase
      .from("users")
      .select("home_lat, home_lng")
      .eq("id", user.id)
      .single();

    let imageUrl: string | null = null;
    if (data.imageFile) {
      try {
        const ext = data.imageFile.name.split(".").pop() ?? "jpg";
        imageUrl = await uploadImage(
          data.imageFile,
          "pickup-images",
          `${user.id}/${Date.now()}.${ext}`,
        );
      } catch (err) {
        toast.error(
          "Image upload failed — request will be submitted without photo.",
        );
        console.error("Image upload failed:", err);
      }
    }

    const { error } = await supabase.from("pickup_requests").insert({
      resident_id: user.id,
      latitude: profile?.home_lat ?? 0,
      longitude: profile?.home_lng ?? 0,
      image_url: imageUrl,
      status: "pending",
      priority_score: data.priorityScore ?? 1,
      volume_estimate: data.estimatedVolume ?? null,
      category: data.category,
      created_at: new Date().toISOString(),
    });

    if (error) {
      toast.error(`Failed to submit request: ${error.message}`);
      console.error("Failed to submit pickup request:", error);
      return;
    }

    // Refresh latest request status
    const { data: latestData } = await supabase
      .from("pickup_requests")
      .select("*")
      .eq("resident_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (latestData) {
      setLatestRequest(latestData);
      setSteps([
        {
          label: "Request Pending",
          detail: "Validated by system",
          completed: true,
        },
        {
          label: "Route Scheduled",
          detail: "Pending assignment",
          completed: false,
        },
        {
          label: "Collected",
          detail: "Expected soon",
          completed: false,
        },
      ]);
    }
    const extra = data.estimatedVolume
      ? ` (AI volume: ${data.estimatedVolume} m³)`
      : "";
    const dateStr = new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    toast.success(`Pickup requested — ${data.category} on ${dateStr}${extra}.`);

    // Refetch activity data to include the new submission
    const { data: pickupData } = await supabase
      .from("pickup_requests")
      .select("id, category, status, created_at, volume_estimate")
      .eq("resident_id", user.id)
      .order("created_at", { ascending: false });

    const activityItems: ActivityItem[] = (pickupData || []).map((pickup) => ({
      id: pickup.id,
      category: pickup.category,
      type: "Scheduled Pickup",
      date: new Date(pickup.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      points:
        pickup.status === "collected"
          ? Math.ceil((pickup.volume_estimate || 0) * 5)
          : 0,
      status:
        pickup.status === "pending"
          ? "Pending"
          : pickup.status === "scheduled"
            ? "In Progress"
            : "Completed",
    }));

    const ecoCredits = activityItems.reduce((sum, item) => sum + item.points, 0);
    const totalRecycled = (pickupData || [])
      .filter((p) => p.status === "collected")
      .reduce((sum, p) => sum + Math.ceil((p.volume_estimate || 0) * 2.4), 0);
    const totalRequests = (pickupData || []).length;

    supabase
      .from("res_score")
      .upsert(
        {
          user_id: user.id,
          eco_points: ecoCredits,
          total_recycled: totalRecycled,
          total_requests: totalRequests,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      )
      .then(({ error }) => {
        if (error) console.error("[res_score sync]", error.message);
      });

    setActivity(activityItems);
    setStats({ totalRecycled, ecoCredits });
  };

  // Removed advanceStep demo function

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster />
      <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 md:py-10 space-y-6 md:space-y-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl bg-gradient-to-br from-primary/15 via-primary/5 to-background border p-6 md:p-10"
        >
          <Badge className="bg-primary/15 text-primary hover:bg-primary/20 mb-4">
            Next Collection: Today
          </Badge>
          <h1 className="text-2xl md:text-5xl font-bold tracking-tight max-w-2xl">
            Clean streets start at your doorstep.
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl text-sm md:text-lg">
            Schedule a bulk waste pickup in seconds and track our eco-friendly
            disposal process in real-time. Includes built-in AI volume
            estimation.
          </p>
          <Button
            onClick={() => setPickupOpen(true)}
            size="lg"
            className="mt-6 rounded-full px-6 font-semibold"
          >
            <PlusCircle className="w-5 h-5" />
            Request New Pickup
          </Button>
        </motion.div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-1 rounded-2xl border bg-card p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Collection Status</h3>
              {latestRequest && (
                <Badge variant="secondary">
                  Ticket #{latestRequest.id.slice(0, 5)}
                </Badge>
              )}
            </div>
            <div className="space-y-3">
              {steps.length > 0 ? (
                steps.map((step) => (
                  <div key={step.label} className="flex gap-3">
                    <div className="mt-0.5">
                      {step.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p
                        className={`text-sm font-medium ${step.completed ? "" : "text-muted-foreground"}`}
                      >
                        {step.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {step.detail}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center">
                  <p className="text-sm text-muted-foreground italic">
                    No active requests.
                  </p>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border bg-card p-6 flex flex-col justify-between"
          >
            <h3 className="font-semibold">Total Recycled</h3>
            <div className="flex items-end justify-between mt-4">
              <p className="text-4xl font-bold">
                {stats.totalRecycled}{" "}
                <span className="text-lg text-muted-foreground">kg</span>
              </p>
              <Leaf className="w-8 h-8 text-primary" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border bg-card p-6 flex flex-col justify-between"
          >
            <h3 className="font-semibold">Eco Credits</h3>
            <div className="flex items-end justify-between mt-4">
              <p className="text-4xl font-bold">
                {stats.ecoCredits.toLocaleString()}
              </p>
              <Star className="w-8 h-8 text-primary" />
            </div>
          </motion.div>
        </div>

        {/* Activity */}
        <div className="rounded-2xl border bg-card p-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">Recent Activity</h3>
            <Button
              variant="link"
              onClick={() =>
                toast(`Showing all activity — ${activity.length} entries.`)
              }
              className="text-primary font-semibold p-0 h-auto"
            >
              View All
            </Button>
          </div>
          <div className="divide-y">
            {activity.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedActivity(item);
                  setActivityOpen(true);
                }}
                className="w-full flex items-center justify-between py-4 hover:bg-muted/50 rounded-lg transition-colors text-left px-2"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{item.category}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.type} • {item.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">
                      +{item.points} pts
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.status}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pickup Modal (3 steps, AI volume integrated) */}
      <RequestPickupModal
        open={pickupOpen}
        onOpenChange={setPickupOpen}
        onSubmit={handlePickupSubmit}
      />

      {/* Activity Detail */}
      <Dialog open={activityOpen} onOpenChange={setActivityOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedActivity?.category}</DialogTitle>
            <DialogDescription>
              {selectedActivity?.type} • {selectedActivity?.date}
            </DialogDescription>
          </DialogHeader>
          {selectedActivity && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium">{selectedActivity.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Points Earned</span>
                <span className="font-medium">
                  +{selectedActivity.points} pts
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Reference ID</span>
                <span className="font-medium">#{selectedActivity.id}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setActivityOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
