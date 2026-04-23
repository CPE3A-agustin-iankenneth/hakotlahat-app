"use client";

import { useState } from "react";
import { PlusCircle, Calendar, MessageSquare, Trash2 } from "lucide-react";
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
import { ReusableModal } from "@/components/ui/reusable-modal";
import { toast } from "sonner";

interface PickupRequestModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { category: string; date: string; notes: string }) => void;
}

const WASTE_CATEGORIES = [
  { value: "Cardboard & Paper", label: "Cardboard & Paper", icon: "📄" },
  { value: "Plastics", label: "Plastics", icon: "🥤" },
  { value: "Electronics", label: "Electronics", icon: "💻" },
  { value: "Glass", label: "Glass", icon: "🍷" },
  { value: "Metal", label: "Metal", icon: "🥫" },
  { value: "Bulk Waste", label: "Bulk Waste", icon: "🛋️" },
];

export function PickupRequestModal({
  isOpen,
  onOpenChange,
  onSubmit,
}: PickupRequestModalProps) {
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!category || !date) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate a bit of delay for premium feel
    await new Promise((resolve) => setTimeout(resolve, 800));

    onSubmit({ category, date, notes });
    
    // Reset form
    setCategory("");
    setDate("");
    setNotes("");
    onOpenChange(false);
    setIsSubmitting(false);
  };

  return (
    <ReusableModal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Request New Pickup"
      description="Schedule a collection for your recyclables or bulk waste."
      className="sm:max-w-[500px]"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pt-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium flex items-center gap-2">
              <Trash2 size={14} className="text-primary" />
              Waste Category
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category" className="h-12 bg-muted/30 border-border/50 hover:border-primary/50 transition-colors">
                <SelectValue placeholder="Select what to collect" />
              </SelectTrigger>
              <SelectContent>
                {WASTE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <span className="flex items-center gap-2">
                      <span className="text-lg">{cat.icon}</span>
                      {cat.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-medium flex items-center gap-2">
              <Calendar size={14} className="text-primary" />
              Preferred Pickup Date
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-12 bg-muted/30 border-border/50 hover:border-primary/50 transition-colors"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium flex items-center gap-2">
              <MessageSquare size={14} className="text-primary" />
              Additional Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="e.g., Items are at the back gate, gate code is 1234..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[100px] bg-muted/30 border-border/50 hover:border-primary/50 transition-colors resize-none"
            />
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-border/50">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 h-11 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <PlusCircle size={18} />
                </motion.div>
                Processing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <PlusCircle size={18} />
                Submit Request
              </span>
            )}
          </Button>
        </div>
      </form>
    </ReusableModal>
  );
}
