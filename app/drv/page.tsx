'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Phone, MapPin, Package, Clock, AlertCircle, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

export default function RoutePage({ params }: { params: { id: string } }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [routeData, setRouteData] = useState<RouteData>(mockRouteData);
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
      el.className = 'w-8 h-8 rounded-full flex items-center justify-center font-bold text-white cursor-pointer';

      if (index === 0) {
        el.className += ' bg-green-500';
      } else if (index === routeData.stops.length - 1) {
        el.className += ' bg-red-500';
      } else {
        el.className += ' bg-blue-500';
      }

      el.textContent = (index + 1).toString();

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(
        `<div class="bg-gray-900 text-white p-3 rounded">
          <p class="font-semibold">${stop.address}</p>
          <p class="text-sm text-gray-300">${stop.contact}</p>
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
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      {/* Map Container */}
      <div className="flex-1 relative">
        <div ref={mapContainer} className="w-full h-full" />

        {/* Top Info Bar */}
        <div className="absolute top-4 left-4 right-4 z-10 bg-gray-900/80 backdrop-blur rounded-lg p-4 flex justify-between items-center">
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-sm">GPS Signal: {routeData.gpsSignal}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span className="text-sm">5G Latency: {routeData.latency}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Top 5% Drivers this week</p>
            <p className="text-lg font-bold text-green-400">
              {routeData.topPercentile}%
            </p>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="absolute bottom-6 left-4 z-10 flex flex-col gap-2">
          <Button
            size="icon"
            className="bg-gray-800 hover:bg-gray-700 text-white"
            onClick={() => map.current?.zoomIn()}
          >
            +
          </Button>
          <Button
            size="icon"
            className="bg-gray-800 hover:bg-gray-700 text-white"
            onClick={() => map.current?.zoomOut()}
          >
            −
          </Button>
          <Button
            size="icon"
            className="bg-gray-800 hover:bg-gray-700 text-white"
            onClick={() => map.current?.easeTo({ bearing: 0, pitch: 0 })}
          >
            <Navigation className="w-4 h-4" />
          </Button>
        </div>

        {/* Vehicle Status */}
        <div className="absolute bottom-6 left-20 z-10 bg-gray-900/80 backdrop-blur rounded-lg p-3 max-w-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-gray-300">
              Vehicle Synced
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">{routeData.vehicleStatus}</p>
        </div>
      </div>

      {/* Right Sidebar - Route Details */}
      <div className="w-96 bg-gray-900 border-l border-gray-800 overflow-y-auto">
        {/* Up Next Header */}
        <div className="sticky top-0 bg-gray-900/95 backdrop-blur border-b border-gray-800 p-6 z-20">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Up Next
              </p>
              <h2 className="text-2xl font-bold mt-2">
                {currentStop.address}
              </h2>
            </div>
            <div className="bg-red-500/20 text-red-400 px-3 py-1 rounded text-xs font-semibold">
              {currentStop.priority}
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="p-6 space-y-6">
          {/* Distance and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wide">
                Distance
              </p>
              <p className="text-3xl font-bold text-white mt-2">
                {currentStop.distance}
                <span className="text-lg text-gray-400 ml-1">km</span>
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wide">
                Est. Time
              </p>
              <p className="text-3xl font-bold text-green-400 mt-2">
                {currentStop.estTime}
                <span className="text-lg text-gray-400 ml-1">min</span>
              </p>
            </div>
          </div>

          {/* Cargo Type */}
          <div className="flex items-start gap-3">
            <Package className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Cargo Type
              </p>
              <p className="text-white font-medium">{currentStop.cargoType}</p>
            </div>
          </div>

          {/* Contact */}
          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                On-site Contact
              </p>
              <p className="text-white font-medium">{currentStop.contact}</p>
              <p className="text-sm text-gray-400">{currentStop.contactPhone}</p>
            </div>
          </div>

          {/* Instructions */}
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Instructions
              </p>
              <p className="text-sm text-gray-300 mt-1">
                {currentStop.instructions}
              </p>
            </div>
          </div>

          {/* Route Stops List */}
          {routeData.stops.length > 1 && (
            <div className="border-t border-gray-800 pt-6">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">
                Other Stops
              </p>
              <div className="space-y-2">
                {routeData.stops.map((stop, index) => (
                  <button
                    key={stop.id}
                    onClick={() => setSelectedStop(stop)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedStop?.id === stop.id
                        ? 'bg-green-500/20 border border-green-500'
                        : 'bg-gray-800/50 hover:bg-gray-800'
                    }`}
                  >
                    <p className="text-sm font-medium">
                      Stop {index + 1}: {stop.address}
                    </p>
                    <p className="text-xs text-gray-400">
                      {stop.distance} km • {stop.estTime} min
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Start Route Button */}
        <div className="sticky bottom-0 bg-gray-900/95 backdrop-blur border-t border-gray-800 p-6">
          <Button
            onClick={() => setIsRouteStarted(!isRouteStarted)}
            className={`w-full py-6 text-lg font-bold transition-all ${
              isRouteStarted
                ? 'bg-gray-700 hover:bg-gray-600'
                : 'bg-green-500 hover:bg-green-600 text-black'
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
