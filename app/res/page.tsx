"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Bell,
  HelpCircle,
  PlusCircle,
  CheckCircle2,
  Circle,
  Leaf,
  Star,
  ScanLine,
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// ── Types (ready for DB integration) ──────────────────────────
interface UserProfile {
  name: string;
  tier: string;
  avatar?: string;
}

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

interface Notification {
  id: string;
  title: string;
  detail: string;
  time: string;
  unread: boolean;
}

// ── Mock Data (swap with DB queries) ──────────────────────────
const mockUser: UserProfile = {
  name: "Elena Garcia",
  tier: "Residential Tier 1",
};

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

const initialNotifications: Notification[] = [
  { id: "n1", title: "Route Scheduled", detail: "Your pickup is scheduled for today at 12:00 PM.", time: "2h ago", unread: true },
  { id: "n2", title: "Eco Credits Earned", detail: "You earned 45 points from your last pickup.", time: "1d ago", unread: true },
  { id: "n3", title: "New Tier Unlocked", detail: "You're now a Residential Tier 1 member!", time: "3d ago", unread: false },
];

// ── Animation Variants ───────────────────────────────────────
const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

// ── Component ─────────────────────────────────────────────────
const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [user] = useState<UserProfile>(mockUser);
  const [steps, setSteps] = useState<CollectionStep[]>(initialSteps);
  const [activity, setActivity] = useState<ActivityItem[]>(initialActivity);
  const [stats, setStats] = useState(initialStats);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);

  // UI State
  const [pickupOpen, setPickupOpen] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);

  // Pickup form state
  const [pickupCategory, setPickupCategory] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [pickupNotes, setPickupNotes] = useState("");

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handlePickupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickupCategory || !pickupDate) {
      toast.error("Missing info — please select a category and date.");
      return;
    }
    const newItem: ActivityItem = {
      id: Date.now().toString(),
      category: pickupCategory,
      type: "Scheduled Pickup",
      date: pickupDate,
      points: 0,
      status: "Pending",
    };
    setActivity([newItem, ...activity]);
    setSteps((prev) =>
      prev.map((s, i) => (i === 0 ? { ...s, detail: `New request submitted at ${new Date().toLocaleTimeString()}`, completed: true } : s))
    );
    setPickupCategory("");
    setPickupDate("");
    setPickupNotes("");
    setPickupOpen(false);
    toast.success(`Pickup requested — ${newItem.category} scheduled for ${newItem.date}.`);
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

  const handleScan = () => {
    toast.success("AI scan complete — estimated volume: 1.2m³, Truck #08 assigned.");
    setScanOpen(false);
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    toast("All caught up — notifications marked as read.");
  };

  const filteredActivity = activity.filter(
    (a) =>
      !searchQuery ||
      a.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-card border-b border-border px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 bg-muted rounded-full px-4 py-2 flex-1 max-w-md">
          <Search size={18} className="text-muted-foreground" />
          <input
            type="text"
            placeholder="Search pickups, stats, or help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent outline-none text-sm w-full text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setNotifOpen(true)}
            className="relative text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
            )}
          </button>
          <button
            onClick={() => setHelpOpen(true)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Help"
          >
            <HelpCircle size={20} />
          </button>
          <div className="flex items-center gap-2 pl-3 border-l border-border">
            <div className="text-right">
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.tier}</p>
            </div>
            <button className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm hover:bg-primary/30 transition-colors">
              {user.name.charAt(0)}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        {/* Hero Row */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {/* Hero Card */}
          <motion.div
            custom={0}
            variants={cardVariant}
            initial="hidden"
            animate="visible"
            className="md:col-span-3 bg-card rounded-2xl border border-border overflow-hidden relative flex flex-col justify-between p-8 min-h-[280px]"
          >
            <span className="inline-block bg-primary text-primary-foreground text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full w-fit">
              Next Collection: Today
            </span>
            <div className="mt-4 space-y-3 max-w-sm">
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight">
                Clean streets start at your doorstep.
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Schedule a bulk waste pickup in seconds and track our eco-friendly disposal process in real-time.
              </p>
            </div>
            <button
              onClick={() => setPickupOpen(true)}
              className="mt-6 inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-full hover:opacity-90 transition-opacity w-fit"
            >
              <PlusCircle size={18} />
              Request New Pickup
            </button>
          </motion.div>

          {/* AI Volume Check */}
          <motion.div
            custom={1}
            variants={cardVariant}
            initial="hidden"
            animate="visible"
            className="md:col-span-2 bg-primary text-primary-foreground rounded-2xl p-8 flex flex-col justify-between min-h-[280px]"
          >
            <div className="w-10 h-10 rounded-lg bg-primary-foreground/20 flex items-center justify-center">
              <ScanLine size={22} />
            </div>
            <div className="mt-4 space-y-2">
              <h2 className="text-xl font-bold">AI Volume Check</h2>
              <p className="text-sm opacity-80 leading-relaxed">
                Not sure if your load fits? Snap a photo of your waste pile. Our AI will estimate the volume and assign the right vehicle.
              </p>
            </div>
            <button
              onClick={() => setScanOpen(true)}
              className="mt-6 bg-primary-foreground text-primary font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity w-fit"
            >
              Scan Items Now
            </button>
          </motion.div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Collection Status */}
          <motion.div
            custom={2}
            variants={cardVariant}
            initial="hidden"
            animate="visible"
            className="bg-card rounded-2xl border border-border p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Collection Status</h3>
              <span className="text-sm text-muted-foreground font-medium">Ticket {mockTicket}</span>
            </div>
            <div className="space-y-4">
              {steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {step.completed ? (
                      <CheckCircle2 size={20} className="text-primary" />
                    ) : (
                      <Circle size={20} className="text-border" />
                    )}
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${step.completed ? "text-foreground" : "text-muted-foreground"}`}>
                      {step.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button
              onClick={advanceStep}
              variant="outline"
              size="sm"
              className="mt-4 w-full"
            >
              Advance Status (Demo)
            </Button>
          </motion.div>

          {/* Total Recycled */}
          <motion.div
            custom={3}
            variants={cardVariant}
            initial="hidden"
            animate="visible"
            className="bg-primary rounded-2xl p-6 flex flex-col justify-end min-h-[180px]"
          >
            <p className="text-xs font-bold tracking-widest uppercase text-primary-foreground/70">Total Recycled</p>
            <div className="flex items-end justify-between mt-2">
              <p className="text-5xl font-extrabold text-primary-foreground">
                {stats.totalRecycled} <span className="text-lg font-medium text-primary-foreground/60">kg</span>
              </p>
              <Leaf size={32} className="text-primary-foreground/30" />
            </div>
          </motion.div>

          {/* Eco Credits */}
          <motion.div
            custom={4}
            variants={cardVariant}
            initial="hidden"
            animate="visible"
            className="bg-primary rounded-2xl p-6 flex flex-col justify-end min-h-[180px]"
          >
            <p className="text-xs font-bold tracking-widest uppercase text-primary-foreground/70">Eco Credits</p>
            <div className="flex items-end justify-between mt-2">
              <p className="text-5xl font-extrabold text-primary-foreground">
                {stats.ecoCredits.toLocaleString()}
              </p>
              <Star size={32} className="text-primary-foreground/30" />
            </div>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          custom={5}
          variants={cardVariant}
          initial="hidden"
          animate="visible"
          className="bg-card rounded-2xl border border-border p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Recent Activity</h3>
            <button
              onClick={() => toast(`Showing all activity — ${activity.length} entries total.`)}
              className="text-sm text-primary font-semibold hover:underline"
            >
              View All
            </button>
          </div>
          <div className="divide-y divide-border">
            {filteredActivity.length === 0 && (
              <p className="text-sm text-muted-foreground py-6 text-center">No activity matches your search.</p>
            )}
            {filteredActivity.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedActivity(item);
                  setActivityOpen(true);
                }}
                className="w-full flex items-center justify-between py-3 hover:bg-muted/50 -mx-2 px-2 rounded-lg transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center">
                    <Package size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{item.category}</p>
                    <p className="text-xs text-muted-foreground">{item.type} • {item.date}</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-3">
                  <div>
                    <p className="text-sm font-semibold text-primary">+{item.points} pts</p>
                    <p className="text-xs text-muted-foreground">{item.status}</p>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      </main>

      {/* ── Pickup Request Dialog ── */}
      <Dialog open={pickupOpen} onOpenChange={setPickupOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request New Pickup</DialogTitle>
            <DialogDescription>Tell us what you'd like collected and when.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePickupSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">Waste Category</Label>
              <Select value={pickupCategory} onValueChange={setPickupCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cardboard & Paper">Cardboard & Paper</SelectItem>
                  <SelectItem value="Plastics">Plastics</SelectItem>
                  <SelectItem value="Electronics">Electronics</SelectItem>
                  <SelectItem value="Glass">Glass</SelectItem>
                  <SelectItem value="Metal">Metal</SelectItem>
                  <SelectItem value="Bulk Waste">Bulk Waste</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Preferred Date</Label>
              <Input
                id="date"
                type="date"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Access instructions, item details..."
                value={pickupNotes}
                onChange={(e) => setPickupNotes(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPickupOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Submit Request</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── AI Scan Dialog ── */}
      <Dialog open={scanOpen} onOpenChange={setScanOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI Volume Check</DialogTitle>
            <DialogDescription>Upload a photo of your waste pile for instant volume estimation.</DialogDescription>
          </DialogHeader>
          <div className="border-2 border-dashed border-border rounded-xl p-10 text-center bg-muted/30">
            <ScanLine size={36} className="mx-auto text-primary mb-3" />
            <p className="text-sm font-semibold">Drop image here or click to upload</p>
            <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
            <Input type="file" accept="image/*" className="mt-4" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScanOpen(false)}>Cancel</Button>
            <Button onClick={handleScan}>Run AI Estimate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Activity Detail Dialog ── */}
      <Dialog open={activityOpen} onOpenChange={setActivityOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedActivity?.category}</DialogTitle>
            <DialogDescription>{selectedActivity?.type} • {selectedActivity?.date}</DialogDescription>
          </DialogHeader>
          {selectedActivity && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="secondary">{selectedActivity.status}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Points Earned</span>
                <span className="font-semibold text-primary">+{selectedActivity.points} pts</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Reference ID</span>
                <span className="font-mono text-xs">#{selectedActivity.id}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setActivityOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Notifications Sheet ── */}
      <Sheet open={notifOpen} onOpenChange={setNotifOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Notifications</SheetTitle>
            <SheetDescription>{unreadCount} unread updates</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3 rounded-lg border ${n.unread ? "bg-primary/5 border-primary/20" : "bg-card border-border"}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold">{n.title}</p>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{n.time}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{n.detail}</p>
              </div>
            ))}
          </div>
          {unreadCount > 0 && (
            <Button onClick={markAllRead} variant="outline" className="w-full mt-4">
              Mark all as read
            </Button>
          )}
        </SheetContent>
      </Sheet>

      {/* ── Help Sheet ── */}
      <Sheet open={helpOpen} onOpenChange={setHelpOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Help & Support</SheetTitle>
            <SheetDescription>Quick answers to common questions.</SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4 text-sm">
            <div>
              <p className="font-semibold">How do I schedule a pickup?</p>
              <p className="text-muted-foreground mt-1">Click "Request New Pickup" on the hero card and fill in the form.</p>
            </div>
            <div>
              <p className="font-semibold">What are Eco Credits?</p>
              <p className="text-muted-foreground mt-1">Points earned per kg recycled. Redeemable for rewards.</p>
            </div>
            <div>
              <p className="font-semibold">Need more help?</p>
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => toast("Support contacted — we'll get back within 24h.")}
              >
                Contact Support
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Index;