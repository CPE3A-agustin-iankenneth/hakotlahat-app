"use client";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  useMap,
} from "@/components/ui/map";
import type { MapViewport } from "@/components/ui/map";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { MapPin, Search, X } from "lucide-react";
import { updatePickupLocation } from "@/app/res/settings/actions";

type LocationData = { lat: number | null; lng: number | null; address: string };
type GeoFeature = { label: string; lng: number; lat: number };

// Default center: Philippines
const DEFAULT_VIEWPORT: MapViewport = {
  center: [121.774, 12.8797],
  zoom: 5.5,
  bearing: 0,
  pitch: 0,
};

export default function PickupAddressCard({
  initialAddress,
  initialLat,
  initialLng,
}: {
  initialAddress: string | null;
  initialLat: number | null;
  initialLng: number | null;
}) {
  const [savedLocation, setSavedLocation] = useState<LocationData>({
    lat: initialLat,
    lng: initialLng,
    address: initialAddress ?? "",
  });
  const [draftLocation, setDraftLocation] = useState<LocationData>({
    lat: initialLat,
    lng: initialLng,
    address: initialAddress ?? "",
  });
  const [previewViewport, setPreviewViewport] =
    useState<MapViewport>(DEFAULT_VIEWPORT);
  const [editViewport, setEditViewport] =
    useState<MapViewport>(DEFAULT_VIEWPORT);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GeoFeature[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isEditing = isModalOpen;
  const activeLocation = isEditing ? draftLocation : savedLocation;
  const hasChanges =
    draftLocation.lat !== savedLocation.lat ||
    draftLocation.lng !== savedLocation.lng ||
    draftLocation.address !== savedLocation.address;

  useEffect(() => {
    if (savedLocation.lat === null || savedLocation.lng === null) return;
    setPreviewViewport((v) => ({
      ...v,
      center: [savedLocation.lng, savedLocation.lat],
      zoom: 15,
    }));
    setEditViewport((v) => ({
      ...v,
      center: [savedLocation.lng, savedLocation.lat],
      zoom: 15,
    }));
  }, [savedLocation.lat, savedLocation.lng]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const reverseGeocode = useCallback(async (lng: number, lat: number) => {
    try {
      const res = await fetch(
        `/api/geocode?type=reverse&lng=${lng}&lat=${lat}`,
      );
      const data: { features: GeoFeature[] } = await res.json();
      const label = data.features[0]?.label ?? "";
      setDraftLocation({ lat, lng, address: label });
    } catch {
      setDraftLocation({ lat, lng, address: "" });
    }
  }, []);

  const handlePinDrop = useCallback(
    (lng: number, lat: number) => {
      if (!isEditing) return;
      reverseGeocode(lng, lat);
    },
    [isEditing, reverseGeocode],
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim()) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `/api/geocode?type=search&q=${encodeURIComponent(val)}`,
        );
        const data: { features: GeoFeature[] } = await res.json();
        setSuggestions(data.features);
        setShowDropdown(data.features.length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  const handleSuggestionSelect = (feature: GeoFeature) => {
    setQuery(feature.label);
    setShowDropdown(false);
    setSuggestions([]);
    setDraftLocation({
      lat: feature.lat,
      lng: feature.lng,
      address: feature.label,
    });
    setEditViewport((v) => ({
      ...v,
      center: [feature.lng, feature.lat],
      zoom: 15,
    }));
  };

  const handleClearSearch = () => {
    setQuery("");
    setSuggestions([]);
    setShowDropdown(false);
  };

  const handleStartEditing = () => {
    setError(null);
    setDraftLocation(savedLocation);
    setQuery(savedLocation.address);
    setSuggestions([]);
    setShowDropdown(false);
    if (savedLocation.lat !== null && savedLocation.lng !== null) {
      setEditViewport((v) => ({
        ...v,
        center: [savedLocation.lng, savedLocation.lat],
        zoom: 15,
      }));
    } else {
      setEditViewport(DEFAULT_VIEWPORT);
    }
    setIsModalOpen(true);
    requestAnimationFrame(() => searchInputRef.current?.focus());
  };

  const handleCancelEditing = () => {
    setIsModalOpen(false);
    setError(null);
    setQuery("");
    setSuggestions([]);
    setShowDropdown(false);
    setDraftLocation(savedLocation);
  };

  const handleSave = () => {
    setError(null);
    startTransition(async () => {
      try {
        await updatePickupLocation({
          home_lat: draftLocation.lat,
          home_lng: draftLocation.lng,
          home_address: draftLocation.address ? draftLocation.address : null,
        });
        setSavedLocation(draftLocation);
        setIsModalOpen(false);
        setQuery("");
        setSuggestions([]);
        setShowDropdown(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  };

  return (
    <Card className="p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Pickup Address
        </h3>
        <Button
          variant="link"
          className="text-sm text-primary hover:text-primary font-medium p-0 h-auto"
          onClick={handleStartEditing}
          disabled={isPending}
        >
          Pin New Location
        </Button>
      </div>
      <div className="mb-4">
        <h4 className="font-semibold text-foreground mb-1">
          Current Primary Residence
        </h4>
        <p className="text-muted-foreground text-sm">
          {savedLocation.address || "No address on file yet."}
        </p>
      </div>

      <div className=" overflow-hidden rounded-3xl border border-border bg-muted/30 shadow-sm">
        <Map
          theme="light"
          viewport={previewViewport}
          onViewportChange={setPreviewViewport}
          className="h-[300px] w-full"
        >
          {savedLocation.lat !== null && savedLocation.lng !== null && (
            <MapMarker
              longitude={savedLocation.lng}
              latitude={savedLocation.lat}
            >
              <MarkerContent>
                <MapPin className="size-9 text-primary drop-shadow-md -mb-1" />
              </MarkerContent>
            </MapMarker>
          )}
        </Map>
      </div>

      <div className="mt-3 flex items-start gap-2 px-1 min-h-[1.25rem]">
        {savedLocation.lat !== null && savedLocation.lng !== null ? (
          <>
            <div className="size-2 rounded-full bg-primary shrink-0 mt-1.5" />
            <p className="text-sm text-foreground line-clamp-2">
              {savedLocation.address ||
                `${savedLocation.lat.toFixed(5)}, ${savedLocation.lng.toFixed(5)}`}
            </p>
          </>
        ) : (
          <>
            <div className="size-2 rounded-full bg-muted-foreground/40 shrink-0 mt-1.5" />
            <p className="text-sm text-muted-foreground">
              No location selected yet.
            </p>
          </>
        )}
      </div>

      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open) handleCancelEditing();
        }}
      >
        <DialogContent className="sm:max-w-[960px] p-0 overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b">
            <DialogHeader className="text-left">
              <DialogTitle>Pin New Location</DialogTitle>
              <DialogDescription>
                Search for your address or drop a pin on the map.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div className="relative rounded-2xl overflow-hidden bg-card border border-border shadow-xs">
              {isEditing && (
                <div
                  ref={searchRef}
                  className="absolute top-3 left-3 right-3 z-10"
                >
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                    <Input
                      ref={searchInputRef}
                      placeholder="Search your address..."
                      value={query}
                      onChange={handleSearchChange}
                      onFocus={() =>
                        suggestions.length > 0 && setShowDropdown(true)
                      }
                      className="pl-9 pr-9 h-11 rounded-2xl bg-background/95 backdrop-blur border-0 shadow-md text-sm"
                    />
                    {query && (
                      <button
                        type="button"
                        onClick={handleClearSearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {isSearching ? (
                          <span className="size-4 block rounded-full border-2 border-muted-foreground border-t-transparent animate-spin" />
                        ) : (
                          <X className="size-4" />
                        )}
                      </button>
                    )}
                  </div>

                  {showDropdown && (
                    <ul className="mt-1 bg-background rounded-2xl shadow-lg border border-border overflow-hidden">
                      {suggestions.map((s, i) => (
                        <li key={i}>
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleSuggestionSelect(s)}
                            className="w-full text-left px-4 py-3 text-sm hover:bg-muted flex items-start gap-2.5 transition-colors"
                          >
                            <MapPin className="size-4 text-primary shrink-0 mt-0.5" />
                            <span className="line-clamp-2 text-foreground">
                              {s.label}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <Map
                theme="light"
                viewport={editViewport}
                onViewportChange={setEditViewport}
                className="h-[52vmax] max-h-[380px] min-h-[240px] w-full"
              >
                {isEditing && <MapClickHandler onMapClick={handlePinDrop} />}
                {activeLocation.lat !== null && activeLocation.lng !== null && (
                  <MapMarker
                    longitude={activeLocation.lng}
                    latitude={activeLocation.lat}
                    draggable={isEditing}
                    onDragEnd={({ lng, lat }) => handlePinDrop(lng, lat)}
                  >
                    <MarkerContent>
                      <MapPin className="size-9 text-primary drop-shadow-md -mb-1" />
                    </MarkerContent>
                  </MapMarker>
                )}
                {isEditing && (
                  <MapControls
                    showZoom
                    showLocate
                    position="bottom-right"
                    onLocate={({ longitude, latitude }) => {
                      handlePinDrop(longitude, latitude);
                      setEditViewport((v) => ({
                        ...v,
                        center: [longitude, latitude],
                        zoom: 15,
                      }));
                    }}
                  />
                )}
              </Map>
            </div>

            <div className="flex items-start gap-2 px-1 min-h-[1.25rem]">
              {activeLocation.lat !== null ? (
                <>
                  <div className="size-2 rounded-full bg-primary shrink-0 mt-1.5" />
                  <p className="text-sm text-foreground line-clamp-2">
                    {activeLocation.address ||
                      `${activeLocation.lat.toFixed(5)}, ${activeLocation.lng!.toFixed(5)}`}
                  </p>
                </>
              ) : (
                <>
                  <div className="size-2 rounded-full bg-muted-foreground/40 shrink-0 mt-1.5" />
                  <p className="text-sm text-muted-foreground">
                    No location selected yet.
                  </p>
                </>
              )}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <div className="px-6 pb-6 pt-0 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Button
              variant="ghost"
              onClick={handleCancelEditing}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              className="rounded-full px-6"
              onClick={handleSave}
              disabled={
                isPending ||
                !hasChanges ||
                draftLocation.lat === null ||
                draftLocation.lng === null
              }
            >
              {isPending ? "Saving location..." : "Save Location"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function MapClickHandler({
  onMapClick,
}: {
  onMapClick: (lng: number, lat: number) => void;
}) {
  const { map, isLoaded } = useMap();
  const onMapClickRef = useRef(onMapClick);
  onMapClickRef.current = onMapClick;

  useEffect(() => {
    if (!map || !isLoaded) return;
    const handler = (e: { lngLat: { lng: number; lat: number } }) => {
      onMapClickRef.current(e.lngLat.lng, e.lngLat.lat);
    };
    map.on("click", handler);
    return () => {
      map.off("click", handler);
    };
  }, [map, isLoaded]);

  return null;
}
