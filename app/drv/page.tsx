'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Phone, Package, AlertCircle, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface RouteStop {
  id: string;
  address: string;
  distance: number;
  estTime: number;
  volume: string;
  priority: 'HIGH VOLUME' | 'STANDARD';
  cargoType: string;
  contact: string;
  contactPhone: string;
  instructions: string;
  lat: number;
  lng: number;
}

interface RouteData {
  id: string;
  stops: RouteStop[];
  currentStop: number;
  gpsSignal: 'Strong' | 'Weak';
  latency: string;
  topPercentile: number;
  vehicleStatus: string;
  vehicleId: string;
}

// Mock data - replace with API call
const mockRouteData: RouteData = {
  id: 'route-1',
  currentStop: 0,
  gpsSignal: 'Strong',
  latency: '12ms',
  topPercentile: 5,
  vehicleStatus: 'TRUCK #ML-5020 IS READY',
  vehicleId: 'ML-5020',
  stops: [
    {
      id: 'stop-1',
      address: '42 Green Valley Ave',
      distance: 0.8,
      estTime: 4,
      volume: 'HIGH VOLUME',
      priority: 'HIGH VOLUME',
      cargoType: 'Premium Recyclables',
      contact: 'Robert Chen',
      contactPhone: '+63 912',
      instructions: 'Gate code 4692. Use loading bay C.',
      lat: 10.7969,
      lng: 106.7093,
    },
  ],
};

export default function RoutePage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [routeData] = useState<RouteData>(mockRouteData);
  const [isRouteStarted, setIsRouteStarted] = useState(false);
  const [selectedStop, setSelectedStop] = useState<RouteStop | null>(
    mockRouteData.stops[0]
  );

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://demotiles.maplibre.org/style.json',
      center: [106.7093, 10.7969],
      zoom: 14,
      pitch: 0,
      bearing: 0,
    });

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), 'bottom-left');

    // Add markers for stops
    routeData.stops.forEach((stop, index) => {
      const el = document.createElement('div');
      el.className = 'w-8 h-8 rounded-full flex items-center justify-center font-bold text-foreground cursor-pointer';

      if (index === 0) {
        el.className += ' bg-primary';
      } else if (index === routeData.stops.length - 1) {
        el.className += ' bg-destructive';
      } else {
        el.className += ' bg-accent';
      }

      el.textContent = (index + 1).toString();

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(
        `<div class="bg-card text-foreground p-3 rounded">
          <p class="font-semibold">${stop.address}</p>
          <p class="text-sm text-muted-foreground">${stop.contact}</p>
        </div>`
      );

      new maplibregl.Marker(el)
        .setLngLat([stop.lng, stop.lat])
        .setPopup(popup)
        .addTo(map.current!);

      el.addEventListener('click', () => setSelectedStop(stop));
    });

    // Draw route line (simplified)
    if (routeData.stops.length > 1) {
      const coordinates = routeData.stops.map((stop) => [stop.lng, stop.lat]);

      map.current.on('load', () => {
        if (!map.current) return;

        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: coordinates,
            },
          },
        });

        map.current.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          paint: {
            'line-color': '#22c55e',
            'line-width': 4,
          },
        });
      });
    }

    return () => {
      map.current?.remove();
    };
  }, [routeData]);

  const currentStop = selectedStop || routeData.stops[0];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Map Container */}
      <div className="flex-1 relative">
        <div ref={mapContainer} className="w-full h-full" />

        {/* Top Info Bar */}
        <div className="absolute top-4 left-4 right-4 z-10 bg-card/80 backdrop-blur rounded-lg p-4 flex justify-between items-center">
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full" />
              <span className="text-sm">GPS Signal: {routeData.gpsSignal}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-accent rounded-full" />
              <span className="text-sm">5G Latency: {routeData.latency}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Top 5% Drivers this week</p>
            <p className="text-lg font-bold text-primary">
              {routeData.topPercentile}%
            </p>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="absolute bottom-6 left-4 z-10 flex flex-col gap-2">
          <Button
            size="icon"
            className="bg-muted hover:bg-muted-foreground/20 text-foreground"
            onClick={() => map.current?.zoomIn()}
          >
            +
          </Button>
          <Button
            size="icon"
            className="bg-muted hover:bg-muted-foreground/20 text-foreground"
            onClick={() => map.current?.zoomOut()}
          >
            −
          </Button>
          <Button
            size="icon"
            className="bg-muted hover:bg-muted-foreground/20 text-foreground"
            onClick={() => map.current?.easeTo({ bearing: 0, pitch: 0 })}
          >
            <Navigation className="w-4 h-4" />
          </Button>
        </div>

        {/* Vehicle Status */}
        <div className="absolute bottom-6 left-20 z-10 bg-card/80 backdrop-blur rounded-lg p-3 max-w-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-muted-foreground">
              Vehicle Synced
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{routeData.vehicleStatus}</p>
        </div>
      </div>

      {/* Right Sidebar - Route Details */}
      <div className="w-96 bg-card border-l border-border overflow-y-auto">
        {/* Up Next Header */}
        <div className="sticky top-0 bg-card/95 backdrop-blur border-b border-border p-6 z-20">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Up Next
              </p>
              <h2 className="text-2xl font-bold mt-2">
                {currentStop.address}
              </h2>
            </div>
            <Badge variant="destructive" className="bg-destructive/20 text-destructive hover:bg-destructive/20 rounded">
              {currentStop.priority}
            </Badge>
          </div>
        </div>

        {/* Details Section */}
        <div className="p-6 space-y-6">
          {/* Distance and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Distance
              </p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {currentStop.distance}
                <span className="text-lg text-muted-foreground ml-1">km</span>
              </p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Est. Time
              </p>
              <p className="text-3xl font-bold text-primary mt-2">
                {currentStop.estTime}
                <span className="text-lg text-muted-foreground ml-1">min</span>
              </p>
            </div>
          </div>

          {/* Cargo Type */}
          <div className="flex items-start gap-3">
            <Package className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Cargo Type
              </p>
              <p className="text-foreground font-medium">{currentStop.cargoType}</p>
            </div>
          </div>

          {/* Contact */}
          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                On-site Contact
              </p>
              <p className="text-foreground font-medium">{currentStop.contact}</p>
              <p className="text-sm text-muted-foreground">{currentStop.contactPhone}</p>
            </div>
          </div>

          {/* Instructions */}
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Instructions
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {currentStop.instructions}
              </p>
            </div>
          </div>

          {/* Route Stops List */}
          {routeData.stops.length > 1 && (
            <div className="border-t border-border pt-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">
                Other Stops
              </p>
              <div className="space-y-2">
                {routeData.stops.map((stop, index) => (
                  <Button
                    key={stop.id}
                    variant="ghost"
                    onClick={() => setSelectedStop(stop)}
                    className={`w-full h-auto justify-start text-left p-3 rounded-lg transition-colors ${selectedStop?.id === stop.id
                        ? 'bg-primary/20 border border-primary'
                        : 'bg-muted/50 hover:bg-muted-foreground/30'
                      }`}
                  >
                    <p className="text-sm font-medium">
                      Stop {index + 1}: {stop.address}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stop.distance} km • {stop.estTime} min
                    </p>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Start Route Button */}
        <div className="sticky bottom-0 bg-card/95 backdrop-blur border-t border-border p-6">
          <Button
            onClick={() => setIsRouteStarted(!isRouteStarted)}
            className={`w-full py-6 text-lg font-bold transition-all ${isRouteStarted
                ? 'bg-muted-foreground/20 hover:bg-gray-600'
                : 'bg-primary hover:bg-primary text-foreground'
              }`}
          >
            {isRouteStarted ? 'ROUTE ACTIVE' : 'START ROUTE'}
            {isRouteStarted ? '' : ' →'}
          </Button>
        </div>
      </div>
    </div>
  );
}
