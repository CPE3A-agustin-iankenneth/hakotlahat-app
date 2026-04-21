"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

interface ReusableModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function ReusableModal({
  isOpen,
  onOpenChange,
  title,
  description,
  children,
  className,
}: ReusableModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-[425px] overflow-hidden", className)}>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {(title || description) && (
                <DialogHeader>
                  {title && <DialogTitle className="text-2xl font-bold tracking-tight">{title}</DialogTitle>}
                  {description && (
                    <DialogDescription className="text-muted-foreground">
                      {description}
                    </DialogDescription>
                  )}
                </DialogHeader>
              )}
              <div className="mt-4">{children}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
