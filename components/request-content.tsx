"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, MapPin, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import { uploadImage } from "@/lib/upload-image";
import {
  RequestPickupModal,
  RequestPickupData,
} from "@/components/pickup-request-modal";

interface PickupRequest {
  id: string;
  resident_id: string;
  latitude: number;
  longitude: number;
  image_url: string | null;
  status: "pending" | "scheduled" | "collected";
  priority_score: number;
  volume_estimate: string | null;
  created_at: string;
  category: string | null;
}

interface RequestsContentProps {
  activeRequests: PickupRequest[];
  historyRequests: PickupRequest[];
}

export function RequestsContent({
  activeRequests,
  historyRequests,
}: RequestsContentProps) {
  const [active, setActive] = useState<PickupRequest[]>(activeRequests);
  const [history, setHistory] = useState<PickupRequest[]>(historyRequests);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (requestId: string) => {
    setIsDeleting(requestId);
    const supabase = createClient();

    const { error } = await supabase
      .from("pickup_requests")
      .delete()
      .eq("id", requestId);

    if (!error) {
      setActive(active.filter((r) => r.id !== requestId));
    } else {
      console.error("Failed to delete request:", error);
    }
    setIsDeleting(null);
  };
  const handleSubmitRequest = async (data: RequestPickupData) => {
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

    const { data: newRequest, error } = await supabase
      .from("pickup_requests")
      .insert({
        resident_id: user.id,
        latitude: profile?.home_lat ?? 0,
        longitude: profile?.home_lng ?? 0,
        image_url: imageUrl,
        status: "pending",
        priority_score: data.priorityScore ?? 1,
        volume_estimate: data.estimatedVolume ?? null,
        category: data.category,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (!error && newRequest) {
      setActive([newRequest as PickupRequest, ...active]);
      toast.success("Pickup request submitted successfully.");
    } else if (error) {
      toast.error(`Failed to submit request: ${error.message}`);
      console.error("Failed to submit pickup request:", error);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadge = (
    status: string,
  ): "secondary" | "default" | "outline" => {
    const variants: Record<string, "secondary" | "default" | "outline"> = {
      pending: "secondary",
      scheduled: "default",
      collected: "outline",
    };
    return variants[status] || "secondary";
  };

  const getPriorityLabel = (score: number): string => {
    if (score >= 8) return "High Priority";
    if (score >= 5) return "Medium Priority";
    return "Low Priority";
  };

  const renderRequestCard = (request: PickupRequest) => (
    <Card
      key={request.id}
      className="flex flex-col gap-4 rounded-3xl p-5 transition-all duration-300 hover:shadow-md hover:scale-[1.02] sm:flex-row sm:items-center"
    >
      {/* Image Section */}
      <div className="h-48 w-full flex-shrink-0 overflow-hidden rounded-2xl bg-gray-200 sm:h-40 sm:w-40">
        {request.image_url ? (
          <img
            src={request.image_url}
            alt={request.category || "Waste"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No image
          </div>
        )}
      </div>

      {/* Details Section */}
      <div className="flex h-full w-full flex-1 flex-col">
        <div className="mb-1 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="font-bold text-foreground">
            {formatDate(request.created_at)}
          </span>
          <Badge
            variant={getStatusBadge(request.status)}
            className="uppercase tracking-wider"
          >
            {request.status}
          </Badge>
        </div>

        {/* Request Title */}
        <h2 className="text-2xl font-black text-foreground mb-2">
          {request.category || "Waste Collection"}
        </h2>

        {/* Priority Score */}
        <div className="flex items-center gap-4 mb-2">
          <span className="text-sm text-muted-foreground font-medium">
            {getPriorityLabel(request.priority_score)}
          </span>
          {request.volume_estimate && (
            <span className="text-sm text-muted-foreground">
              Volume: {request.volume_estimate}
            </span>
          )}
        </div>

        {/* Location Details */}
        <div className="flex items-start text-muted-foreground mb-4">
          <MapPin className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
          <p className="text-sm font-medium leading-snug">
            {typeof request.latitude === "number" &&
            typeof request.longitude === "number"
              ? `${request.latitude.toFixed(4)}°N, ${request.longitude.toFixed(4)}°E`
              : "Location not available"}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            variant="outline"
            className="w-full rounded-full border-2 px-6 font-bold text-primary hover:bg-primary/10 sm:w-auto"
          >
            View Details
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="self-end text-destructive hover:text-destructive/80 hover:bg-destructive/10 sm:self-auto"
            onClick={() => handleDelete(request.id)}
            disabled={isDeleting === request.id}
          >
            <Trash2 size={20} />
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <div>
      {/* Header Section */}
      <div className="flex items-start justify-between px-4 pt-6 sm:px-10 sm:pt-10">
        <div>
          <h1 className="text-4xl font-bold font-Roboto">Your Requests</h1>
          <p>Manage and track your active waste collection requests.</p>
        </div>
        <Button
          className="bg-primary hover:bg-primary/90 rounded-full"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="w-5 h-5" />
          New Request
        </Button>
      </div>

      {/* Tabs Section */}
      <div className="px-4 pt-6 sm:px-10">
        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger
              value="active"
              className="data-[state=active]:text-primary data-[state=inactive]:text-muted-foreground"
            >
              Active ({active.length})
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="data-[state=active]:text-primary data-[state=inactive]:text-muted-foreground"
            >
              History ({history.length})
            </TabsTrigger>
          </TabsList>

          {/* Active Requests Tab */}
          <TabsContent value="active">
            <div className="grid grid-cols-1 gap-4 p-4 text-foreground sm:gap-6 sm:p-6 xl:grid-cols-2 xl:p-10">
              {active.length > 0 ? (
                active.map((request) => renderRequestCard(request))
              ) : (
                <p className="col-span-full text-muted-foreground text-center py-8">
                  No active requests yet. Create one to get started!
                </p>
              )}
            </div>
          </TabsContent>

          {/* History Requests Tab */}
          <TabsContent value="history">
            <div className="grid grid-cols-1 gap-4 p-4 text-foreground sm:gap-6 sm:p-6 xl:grid-cols-2 xl:p-10">
              {history.length > 0 ? (
                history.map((request) => renderRequestCard(request))
              ) : (
                <p className="col-span-full text-muted-foreground text-center py-8">
                  No collected requests yet
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <RequestPickupModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSubmit={handleSubmitRequest}
      />
    </div>
  );
}
