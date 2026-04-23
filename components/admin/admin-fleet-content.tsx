"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Truck, MapPin, Clock, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { createClient } from "@/lib/supabase/client";
import {
  Map,
  MapMarker,
  MarkerContent,
  MarkerTooltip,
} from "@/components/ui/map";
import type { MunVehicle, VehicleStatus, DriverWithSession } from "@/types/municipality";

type MapRequest = {
  id: string;
  latitude: number;
  longitude: number;
  category: string | null;
  priority_score: number;
  status: string;
};

interface Props {
  drivers: DriverWithSession[];
  vehicles: MunVehicle[];
  municipalityId: string | null;
  pendingRequests?: MapRequest[];
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

export function AdminFleetContent({ drivers, vehicles, municipalityId, pendingRequests = [] }: Props) {
  const [vehicleList, setVehicleList] = useState(vehicles);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newPlate, setNewPlate] = useState("");
  const [newCapacity, setNewCapacity] = useState("");
  const [newStatus, setNewStatus] = useState<VehicleStatus>("ACTIVE");
  const [isAdding, setIsAdding] = useState(false);
  const supabase = createClient();

  const activeTrucks = drivers.filter(
    (d) =>
      d.activeSession?.current_lat != null &&
      d.activeSession?.current_lng != null
  );

  const mapCenter: [number, number] =
    activeTrucks.length > 0
      ? [activeTrucks[0].activeSession!.current_lng!, activeTrucks[0].activeSession!.current_lat!]
      : pendingRequests.length > 0
        ? [pendingRequests[0].longitude, pendingRequests[0].latitude]
        : [121.0, 12.5];

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

  async function addVehicle() {
    if (!newPlate.trim() || !newCapacity || !municipalityId) return;
    setIsAdding(true);

    const { data, error } = await supabase
      .from("vehicles")
      .insert({
        municipality_id: municipalityId,
        plate_number: newPlate.trim().toUpperCase(),
        capacity_volume: parseFloat(newCapacity),
        status: newStatus,
      })
      .select()
      .single();

    if (error) {
      toast.error("Failed to add vehicle.");
    } else {
      setVehicleList((prev) => [...prev, data as MunVehicle]);
      toast.success(`Vehicle ${data.plate_number} added.`);
      setShowAddDialog(false);
      setNewPlate("");
      setNewCapacity("");
      setNewStatus("ACTIVE");
    }
    setIsAdding(false);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster />

      {/* Add Vehicle Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Vehicle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="plate">Plate Number</Label>
              <Input
                id="plate"
                placeholder="ABC-1234"
                value={newPlate}
                onChange={(e) => setNewPlate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="capacity">Capacity (Liters)</Label>
              <Input
                id="capacity"
                type="number"
                placeholder="500"
                min={1}
                value={newCapacity}
                onChange={(e) => setNewCapacity(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={newStatus}
                onValueChange={(v) => setNewStatus(v as VehicleStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  <SelectItem value="RETIRED">Retired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={addVehicle}
              disabled={isAdding || !newPlate.trim() || !newCapacity || !municipalityId}
            >
              {isAdding ? "Adding…" : "Add Vehicle"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

        {/* Live Fleet Map */}
        <section>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-4 text-xl font-bold"
          >
            Live Fleet Map
            <span className="ml-2 text-base font-normal text-muted-foreground">
              {activeTrucks.length} drivers · {pendingRequests.length} requests
            </span>
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl overflow-hidden border shadow-sm"
            style={{ height: 340 }}
          >
            {activeTrucks.length === 0 && pendingRequests.length === 0 ? (
              <div className="h-full flex items-center justify-center bg-muted/30 text-muted-foreground text-sm">
                No active trucks or pending requests right now.
              </div>
            ) : (
              <Map center={mapCenter} zoom={12} className="w-full h-full">
                {/* Pending / scheduled request markers — amber pins */}
                {pendingRequests.map((req) => (
                  <MapMarker
                    key={req.id}
                    longitude={req.longitude}
                    latitude={req.latitude}
                  >
                    <MarkerContent>
                      <div className="relative flex items-center justify-center">
                        {/* Pin body */}
                        <div className="w-4 h-4 rounded-full bg-amber-400 border-2 border-white shadow-md" />
                      </div>
                    </MarkerContent>
                    <MarkerTooltip>
                      <p className="font-semibold">{req.category ?? "Request"}</p>
                      <p className="text-xs opacity-75 capitalize">{req.status}</p>
                      <p className="text-xs opacity-75">Priority {req.priority_score}</p>
                    </MarkerTooltip>
                  </MapMarker>
                ))}

                {/* Active driver markers — larger truck icons */}
                {activeTrucks.map((driver) => {
                  const isOnRoute = driver.activeSession?.status === "ON_ROUTE";
                  return (
                    <MapMarker
                      key={driver.id}
                      longitude={driver.activeSession!.current_lng!}
                      latitude={driver.activeSession!.current_lat!}
                    >
                      <MarkerContent>
                        <div className="relative flex items-center justify-center">
                          {/* Outer ring pulse for ON_ROUTE */}
                          {isOnRoute && (
                            <div className="absolute w-9 h-9 rounded-full bg-primary/30 animate-ping" />
                          )}
                          {/* Truck icon badge */}
                          <div
                            className={[
                              "relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-lg text-white text-xs font-black",
                              isOnRoute ? "bg-primary" : "bg-blue-500",
                            ].join(" ")}
                          >
                            🚛
                          </div>
                        </div>
                      </MarkerContent>
                      <MarkerTooltip>
                        <p className="font-semibold">{driver.full_name ?? "Driver"}</p>
                        <p className="text-xs opacity-75">
                          {driver.activeSession?.vehicle?.plate_number ?? "No vehicle"}
                        </p>
                        <p className="text-xs opacity-75">
                          {isOnRoute ? "On Route" : "On Duty"}
                        </p>
                      </MarkerTooltip>
                    </MapMarker>
                  );
                })}
              </Map>
            )}
          </motion.div>
        </section>

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
          <div className="mb-4 flex items-center justify-between">
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl font-bold"
            >
              Vehicles
              <span className="ml-2 text-base font-normal text-muted-foreground">
                ({vehicleList.length})
              </span>
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Button
                size="sm"
                onClick={() => setShowAddDialog(true)}
                disabled={!municipalityId}
                className="gap-1.5"
              >
                <Plus className="h-4 w-4" />
                Add Vehicle
              </Button>
            </motion.div>
          </div>

          {vehicleList.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-10 text-center text-muted-foreground">
              No vehicles registered yet. Click &ldquo;Add Vehicle&rdquo; to get started.
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
