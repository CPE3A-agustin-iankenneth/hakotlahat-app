"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Truck, MapPin, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { createClient } from "@/lib/supabase/client";
import type { MunVehicle, VehicleStatus, DriverWithSession } from "@/types/municipality";

interface Props {
  drivers: DriverWithSession[];
  vehicles: MunVehicle[];
}

function relativeTime(ts: string | null): string {
  if (!ts) return "No update";
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function sessionStatusBadge(status: string | undefined) {
  if (status === "ON_ROUTE")
    return (
      <Badge className="flex items-center gap-1.5 bg-secondary/20 text-secondary-foreground">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-secondary" />
        On Route
      </Badge>
    );
  if (status === "ON_DUTY")
    return (
      <Badge className="bg-primary/15 text-primary hover:bg-primary/20">On Duty</Badge>
    );
  return <Badge variant="secondary">Off Duty</Badge>;
}

function vehicleStatusBadge(status: VehicleStatus) {
  if (status === "ACTIVE")
    return <Badge className="bg-primary/15 text-primary hover:bg-primary/20">Active</Badge>;
  if (status === "MAINTENANCE")
    return (
      <Badge className="bg-amber-500/15 text-amber-600 hover:bg-amber-500/20">
        Maintenance
      </Badge>
    );
  return <Badge variant="secondary">Retired</Badge>;
}

export function MunFleetContent({ drivers, vehicles }: Props) {
  const [vehicleList, setVehicleList] = useState(vehicles);
  const supabase = createClient();

  async function updateVehicleStatus(id: string, status: VehicleStatus) {
    setVehicleList((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status } : v))
    );
    const { error } = await supabase
      .from("vehicles")
      .update({ status })
      .eq("id", id);
    if (error) {
      toast.error("Failed to update vehicle status.");
      setVehicleList(vehicles);
    } else {
      toast.success("Vehicle status updated.");
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster />
      <div className="mx-auto max-w-7xl px-6 py-8 space-y-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-4xl font-bold tracking-tight">Fleet Management</h1>
          <p className="mt-2 text-muted-foreground">
            Manage drivers and vehicles across your municipality.
          </p>
        </motion.div>

        {/* Drivers */}
        <section>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-4 text-xl font-bold"
          >
            Drivers
            <span className="ml-2 text-base font-normal text-muted-foreground">
              ({drivers.length})
            </span>
          </motion.h2>

          {drivers.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
              No drivers registered yet.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {drivers.map((driver, i) => (
                <motion.div
                  key={driver.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + Math.min(i * 0.05, 0.35) }}
                  className="rounded-2xl border bg-card p-5 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                      {driver.full_name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold">
                        {driver.full_name ?? "Unnamed Driver"}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {driver.email}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    {sessionStatusBadge(driver.activeSession?.status)}
                    <span className="text-xs text-muted-foreground">
                      {driver.activeSession?.vehicle?.plate_number ?? "Unassigned"}
                    </span>
                  </div>

                  {driver.activeSession && (
                    <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span>
                          {driver.activeSession.current_lat != null
                            ? `${driver.activeSession.current_lat.toFixed(4)}, ${driver.activeSession.current_lng?.toFixed(4)}`
                            : "Location unknown"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3 shrink-0" />
                        <span>
                          Updated {relativeTime(driver.activeSession.last_location_update)}
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Vehicles */}
        <section>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-4 text-xl font-bold"
          >
            Vehicles
            <span className="ml-2 text-base font-normal text-muted-foreground">
              ({vehicleList.length})
            </span>
          </motion.h2>

          {vehicleList.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
              No vehicles registered yet.
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="rounded-2xl border bg-card overflow-hidden shadow-sm"
            >
              {/* Table header */}
              <div className="grid grid-cols-4 border-b bg-muted/40 px-6 py-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                <span>Plate</span>
                <span>Capacity</span>
                <span>Status</span>
                <span>Actions</span>
              </div>
              <div className="divide-y">
                {vehicleList.map((vehicle, i) => (
                  <motion.div
                    key={vehicle.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + Math.min(i * 0.04, 0.3) }}
                    className="grid grid-cols-4 items-center px-6 py-4"
                  >
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">{vehicle.plate_number}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {vehicle.capacity_volume} L
                    </span>
                    <div>{vehicleStatusBadge(vehicle.status)}</div>
                    <Select
                      defaultValue={vehicle.status}
                      onValueChange={(val) =>
                        updateVehicleStatus(vehicle.id, val as VehicleStatus)
                      }
                    >
                      <SelectTrigger className="h-8 w-36 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                        <SelectItem value="RETIRED">Retired</SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </section>
      </div>
    </div>
  );
}
