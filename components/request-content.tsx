"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, MapPin, Trash2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";
import { RequestPickupModal, RequestPickupData } from "@/components/pickup-request-modal";

interface PickupRequest {
  id: string;
  resident_id: string;
  lat: number;
  lng: number;
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
  
  // Create the pickup request in Supabase
  const { data: newRequest, error } = await supabase
    .from("pickup_requests")
    .insert({
      resident_id: "user_id", // Get from auth context
      category: data.category,
      volume_estimate: data.estimatedVolume,
      // Add other fields as needed
      status: "pending",
      priority_score: 1, // Or calculate from data
      lat: 0, lng: 0, // Get from map/location
    })
    .select()
    .single();

  if (!error && newRequest) {
    setActive([...active, newRequest as PickupRequest]);
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
      className="flex flex-row items-center p-5 rounded-3xl hover:shadow-md hover:scale-[1.02] transition-all duration-300"
    >
      {/* Image Section */}
      <div className="w-40 h-40 flex-shrink-0 mr-6 bg-gray-200 rounded-2xl overflow-hidden">
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
      <div className="flex-1 flex flex-col h-full">
        <div className="flex justify-between items-center mb-1">
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
            {request.lat.toFixed(4)}°N, {request.lng.toFixed(4)}°E
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-auto">
          <Button
            variant="outline"
            className="rounded-full border-2 font-bold px-6 text-primary hover:bg-primary/10"
          >
            View Details
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
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
      <div className="flex justify-between items-start px-10 pt-10">
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
      <div className="px-10 pt-6">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 text-foreground p-10 gap-6">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 text-foreground p-10 gap-6">
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
