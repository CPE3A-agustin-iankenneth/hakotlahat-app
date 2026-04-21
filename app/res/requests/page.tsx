import { Button } from "@/components/ui/button";
import { Plus, MapPin, Trash2 } from "lucide-react";
import { AppWindowIcon, CodeIcon } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function RequestPage() {
  return (
    <div>
      {/* Header Section */}
      <div className="flex justify-between items-start px-10 pt-10">
        <div>
          <h1 className="text-4xl font-bold font-Roboto">Your Requests</h1>
          <p>Manage and track your active waste collection requests.</p>
        </div>
        {/* New Request Button */}
        <Button className="bg-primary hover:bg-primary/90 rounded-full">
          <Plus className="w-5 h-5" />
          New Request
        </Button>
      </div>
      {/* Tabs Section */}
      <div className="px-10 pt-6">
        <Tabs defaultValue="Active">
          <TabsList>
            <TabsTrigger
              value="Active"
              className="data-[state=active]:text-primary data-[state=inactive]:text-muted-foreground"
            >
              Active
            </TabsTrigger>
            <TabsTrigger
              value="History"
              className="data-[state=active]:text-primary data-[state=inactive]:text-muted-foreground"
            >
              History
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      {/* Requests List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 text-foreground p-10 gap-6">
        <div className="flex flex-row items-center bg-card p-5 rounded-3xl border border-border shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 group">
          {/* Image Section */}
          <div className="w-40 h-40 flex-shrink:0 mr-6">
            <img
              src="/path-to-your-bottles-image.png"
              alt="Recycling"
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
          {/* Details Section */}
          <div className="flex-1 flex flex-col h-full">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-foreground">April 19, 2026</span>
              <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Pending
              </span>
            </div>
            {/* Request Title */}
            <h2 className="text-2xl font-black text-foreground mb-2">
              Plastic & Glass
            </h2>
            {/* Location Details */}
            <div className="flex items-start text-muted-foreground mb-4">
              <MapPin className="w-4 h-4 mr-1 mt-1 flex-shrink:0" />
              <p className="text-sm font-medium leading-snug">
                William Ville 3,
                <br />
                Arizona Street
              </p>
            </div>
            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-auto">
              <button className="border-2 border-border text-primary font-bold py-2 px-6 rounded-full hover:bg-primary/10 hover:border-primary/20 transition-colors">
                View Details
              </button>
              <button className="p-2 text-destructive hover:text-destructive/80 transition-colors">
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-row items-center bg-card p-5 rounded-3xl border border-border shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 group">
          {/* Image Section */}
          <div className="w-40 h-40 flex-shrink:0 mr-6">
            <img
              src="/path-to-your-bottles-image.png"
              alt="Recycling"
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
          {/* Details Section */}
          <div className="flex-1 flex flex-col h-full">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-foreground">April 20, 2026</span>
              <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Pending
              </span>
            </div>
            {/* Request Title */}
            <h2 className="text-2xl font-black text-foreground mb-2">
              Paper & Card Boards
            </h2>
            {/* Location Details */}
            <div className="flex items-start text-muted-foreground mb-4">
              <MapPin className="w-4 h-4 mr-1 mt-1 flex-shrink:0" />
              <p className="text-sm font-medium leading-snug">
                William Ville 3,
                <br />
                Arizona Street
              </p>
            </div>
            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-auto">
              <button className="border-2 border-border text-primary font-bold py-2 px-6 rounded-full hover:bg-primary/10 hover:border-primary/20 transition-colors">
                View Details
              </button>
              <button className="p-2 text-destructive hover:text-destructive/80 transition-colors">
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-row items-center bg-card p-5 rounded-3xl border border-border shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 group">
          {/* Image Section */}
          <div className="w-40 h-40 flex-shrink:0 mr-6">
            <img
              src="/path-to-your-bottles-image.png"
              alt="Recycling"
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
          {/* Details Section */}
          <div className="flex-1 flex flex-col h-full">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-foreground">April 20, 2026</span>
              <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Pending
              </span>
            </div>
            {/* Request Title */}
            <h2 className="text-2xl font-black text-foreground mb-2">
              Electronic Wastes
            </h2>
            {/* Location Details */}
            <div className="flex items-start text-muted-foreground mb-4">
              <MapPin className="w-4 h-4 mr-1 mt-1 shrink-0" />
              <p className="text-sm font-medium leading-snug">
                William Ville 3,
                <br />
                Arizona Street
              </p>
            </div>
            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-auto">
              <button className="border-2 border-border text-primary font-bold py-2 px-6 rounded-full hover:bg-primary/10 hover:border-primary/20 transition-colors">
                View Details
              </button>
              <button className="p-2 text-destructive hover:text-destructive/80 transition-colors">
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-row items-center bg-card p-5 rounded-3xl border border-border shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-300 group">
          {/* Image Section */}
          <div className="w-40 h-40 flex-shrink:0 mr-6">
            <img
              src="/path-to-your-bottles-image.png"
              alt="Recycling"
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
          {/* Details Section */}
          <div className="flex-1 flex flex-col h-full">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-foreground">April 20, 2026</span>
              <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                Pending
              </span>
            </div>
            {/* Request Title */}
            <h2 className="text-2xl font-black text-foreground mb-2">
              Metals & Aluminums
            </h2>
            {/* Location Details */}
            <div className="flex items-start text-muted-foreground mb-4">
              <MapPin className="w-4 h-4 mr-1 mt-1 flex-shrink:0" />
              <p className="text-sm font-medium leading-snug">
                William Ville 3,
                <br />
                Arizona Street
              </p>
            </div>
            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-auto">
              <button className="border-2 border-border text-primary font-bold py-2 px-6 rounded-full hover:bg-primary/10 hover:border-primary/20 transition-colors">
                View Details
              </button>
              <button className="p-2 text-destructive hover:text-destructive/80 transition-colors">
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
