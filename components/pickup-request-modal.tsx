import { useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Sparkles,
  X,
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

export interface RequestPickupData {
  category: string;
  date: string;
  notes: string;
  estimatedVolume?: string;
  assignedVehicle?: string;
}

interface RequestPickupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: RequestPickupData) => void;
}

const STEPS = ["AI Estimate", "Details", "Confirm"];

export const RequestPickupModal = ({
  open,
  onOpenChange,
  onSubmit,
}: RequestPickupModalProps) => {
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    volume: string;
    vehicle: string;
  } | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStep(0);
    setCategory("");
    setDate("");
    setNotes("");
    setScanning(false);
    setScanResult(null);
    setImagePreview(null);
    setDragActive(false);
  };

  const handleClose = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG or JPG).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB.");
      return;
    }
    const url = URL.createObjectURL(file);
    setImagePreview(url);
    setScanning(true);
    setScanResult(null);
    setTimeout(() => {
      setScanResult({ volume: "1.2 m³", vehicle: "Truck #08" });
      setScanning(false);
      toast.success("AI scan complete — volume estimated, vehicle assigned.");
    }, 1400);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const clearImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setScanResult(null);
    setScanning(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleConfirm = () => {
    onSubmit({
      category,
      date,
      notes,
      estimatedVolume: scanResult?.volume,
      assignedVehicle: scanResult?.vehicle,
    });
    handleClose(false);
  };

  const canNext =
    step === 0 || (step === 1 && category && date) || step === 2;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[560px] p-0 overflow-hidden">
        {/* Header band */}
        <div className="bg-gradient-to-br from-primary to-secondary px-6 pt-6 pb-5 text-primary-foreground">
          <DialogHeader className="space-y-1 text-left">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider opacity-90">
              <Sparkles className="w-3.5 h-3.5" />
              Step {step + 1} of {STEPS.length}
            </div>
            <DialogTitle className="text-2xl font-bold text-primary-foreground">
              {STEPS[step] === "AI Estimate"
                ? "Snap your waste"
                : STEPS[step] === "Details"
                ? "Pickup details"
                : "Review & confirm"}
            </DialogTitle>
            <DialogDescription className="text-primary-foreground/80">
              {STEPS[step] === "AI Estimate"
                ? "Let AI estimate volume and assign the right vehicle."
                : STEPS[step] === "Details"
                ? "Tell us what and when."
                : "Make sure everything looks right."}
            </DialogDescription>
          </DialogHeader>

          {/* Stepper */}
          <div className="flex items-center gap-2 pt-4">
            {STEPS.map((label, i) => (
              <div
                key={label}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  i <= step ? "bg-primary-foreground" : "bg-primary-foreground/25"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 min-h-[280px]">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {!imagePreview ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={onDrop}
                    role="button"
                    tabIndex={0}
                    className={`border-2 border-dashed rounded-xl p-8 text-center space-y-3 cursor-pointer transition-colors ${
                      dragActive
                        ? "border-primary bg-primary/5"
                        : "border-border bg-muted/40 hover:bg-muted/70"
                    }`}
                  >
                    <div className="w-14 h-14 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
                      <Upload className="w-7 h-7 text-primary" />
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      Drop image here or click to upload
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG up to 10MB
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFile(file);
                      }}
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative rounded-xl overflow-hidden border bg-muted">
                      <Image
                        src={imagePreview}
                        alt="Waste pile preview"
                        width={560}
                        height={192}
                        className="w-full h-48 object-cover"
                      />
                      <button
                        onClick={clearImage}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-background/90 hover:bg-background flex items-center justify-center shadow-sm"
                        aria-label="Remove image"
                      >
                        <X className="w-4 h-4 text-foreground" />
                      </button>
                    </div>

                    {scanning && (
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing image...
                      </div>
                    )}

                    {scanResult && !scanning && (
                      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
                        <div className="flex items-center gap-2 text-primary">
                          <CheckCircle2 className="w-5 h-5" />
                          <span className="font-semibold text-sm">
                            Scan complete
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="rounded-lg bg-card p-3">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">
                              Volume
                            </p>
                            <p className="font-bold text-lg text-foreground">
                              {scanResult.volume}
                            </p>
                          </div>
                          <div className="rounded-lg bg-card p-3">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">
                              Vehicle
                            </p>
                            <p className="font-bold text-lg text-foreground">
                              {scanResult.vehicle}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <p className="text-xs text-center text-muted-foreground">
                  This step is optional — you can skip it.
                </p>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="category">Waste Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cardboard & Paper">
                        Cardboard & Paper
                      </SelectItem>
                      <SelectItem value="Plastics">Plastics</SelectItem>
                      <SelectItem value="Electronics">Electronics</SelectItem>
                      <SelectItem value="Bulk Waste">Bulk Waste</SelectItem>
                      <SelectItem value="Organic">Organic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Preferred Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Gate codes, access instructions, etc."
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                <div className="rounded-xl border bg-card p-4 space-y-3 text-sm">
                  <Row label="Category" value={category} />
                  <Row label="Date" value={date} />
                  <Row label="Notes" value={notes || "—"} />
                  <Row
                    label="AI Volume"
                    value={scanResult?.volume ?? "Not scanned"}
                  />
                  <Row
                    label="Vehicle"
                    value={scanResult?.vehicle ?? "Auto-assign"}
                  />
                </div>
                {scanResult && (
                  <Badge className="bg-primary/15 text-primary hover:bg-primary/20">
                    AI-optimized vehicle assignment
                  </Badge>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 pb-6 pt-0 flex sm:justify-between gap-2">
          <Button
            variant="ghost"
            onClick={() =>
              step === 0 ? handleClose(false) : setStep(step - 1)
            }
          >
            <ArrowLeft className="w-4 h-4" />
            {step === 0 ? "Cancel" : "Back"}
          </Button>
          {step < STEPS.length - 1 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canNext}
            >
              {step === 0 && !scanResult ? "Skip" : "Next"}{" "}
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleConfirm}>
              <CheckCircle2 className="w-4 h-4" /> Confirm Pickup
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between gap-4">
    <span className="text-muted-foreground">{label}</span>
    <span className="font-medium text-right text-foreground">{value}</span>
  </div>
);
