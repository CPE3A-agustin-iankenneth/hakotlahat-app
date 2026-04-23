"use client";
import { useState } from "react";
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
import { RequestPickupModal, RequestPickupData } from "@/components/pickup-request-modal";
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

const mockTicket = "#4920";

const initialSteps: CollectionStep[] = [
  { label: "Request Pending", detail: "Validated by system at 08:30 AM", completed: true },
  { label: "Route Scheduled", detail: "Driver: Marcus (Truck #08)", completed: true },
  { label: "Collected", detail: "Expected by 12:00 PM", completed: false },
  { label: "Processing", detail: "At recycling facility", completed: false },
];

const initialStats = { totalRecycled: 842, ecoCredits: 2450 };

const initialActivity: ActivityItem[] = [
  { id: "1", category: "Cardboard & Paper", type: "Scheduled Pickup", date: "Oct 24, 2023", points: 45, status: "Completed" },
  { id: "2", category: "Electronics", type: "Drop-off", date: "Oct 20, 2023", points: 120, status: "Completed" },
  { id: "3", category: "Plastics", type: "Scheduled Pickup", date: "Oct 18, 2023", points: 30, status: "Completed" },
];

const Index = () => {
  const [steps, setSteps] = useState(initialSteps);
  const [activity, setActivity] = useState(initialActivity);
  const [stats, setStats] = useState(initialStats);
  const [pickupOpen, setPickupOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);
  const [activityOpen, setActivityOpen] = useState(false);

  const handlePickupSubmit = async (data: RequestPickupData) => {
    const supabase = createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
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
          `${user.id}/${Date.now()}.${ext}`
        );
      } catch (err) {
        toast.error("Image upload failed — request will be submitted without photo.");
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

    const newItem: ActivityItem = {
      id: Date.now().toString(),
      category: data.category,
      type: "Scheduled Pickup",
      date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      points: 0,
      status: "Pending",
    };
    setActivity([newItem, ...activity]);
    setSteps((prev) =>
      prev.map((s, i) =>
        i === 0
          ? { ...s, detail: `New request submitted at ${new Date().toLocaleTimeString()}`, completed: true }
          : s
      )
    );
    const extra = data.estimatedVolume ? ` (AI volume: ${data.estimatedVolume} m³)` : "";
    toast.success(`Pickup requested — ${newItem.category} on ${newItem.date}${extra}.`);
  };

  const advanceStep = () => {
    const nextIdx = steps.findIndex((s) => !s.completed);
    if (nextIdx === -1) {
      toast("All steps complete — this collection is fully processed.");
      return;
    }
    setSteps((prev) => prev.map((s, i) => (i === nextIdx ? { ...s, completed: true } : s)));
    if (nextIdx === 2) {
      setStats((s) => ({ totalRecycled: s.totalRecycled + 12, ecoCredits: s.ecoCredits + 25 }));
      toast.success("Collected! +12kg recycled, +25 eco credits.");
    } else {
      toast(`${steps[nextIdx].label} — status updated.`);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster />
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl bg-gradient-to-br from-primary/15 via-primary/5 to-background border p-10"
        >
          <Badge className="bg-primary/15 text-primary hover:bg-primary/20 mb-4">
            Next Collection: Today
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight max-w-2xl">
            Clean streets start at your doorstep.
          </h1>
          <p className="text-muted-foreground mt-4 max-w-2xl text-lg">
            Schedule a bulk waste pickup in seconds and track our eco-friendly disposal process in
            real-time. Includes built-in AI volume estimation.
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
              <Badge variant="secondary">Ticket {mockTicket}</Badge>
            </div>
            <div className="space-y-3">
              {steps.map((step) => (
                <div key={step.label} className="flex gap-3">
                  <div className="mt-0.5">
                    {step.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${step.completed ? "" : "text-muted-foreground"}`}>
                      {step.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={advanceStep} className="w-full">
              Advance Status (Demo)
            </Button>
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
                {stats.totalRecycled} <span className="text-lg text-muted-foreground">kg</span>
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
              <p className="text-4xl font-bold">{stats.ecoCredits.toLocaleString()}</p>
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
              onClick={() => toast(`Showing all activity — ${activity.length} entries.`)}
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
                    <p className="text-sm font-semibold text-primary">+{item.points} pts</p>
                    <p className="text-xs text-muted-foreground">{item.status}</p>
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
                <span className="font-medium">+{selectedActivity.points} pts</span>
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
