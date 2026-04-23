export type VehicleStatus = "ACTIVE" | "MAINTENANCE" | "RETIRED";
export type SessionStatus = "ON_DUTY" | "OFF_DUTY" | "ON_ROUTE";
export type RequestStatus = "pending" | "scheduled" | "collected";
export type RouteStatus = "active" | "completed";

export interface MunVehicle {
  id: string;
  municipality_id: string;
  plate_number: string;
  capacity_volume: number;
  status: VehicleStatus;
  created_at: string;
}

export interface MunDriverSession {
  id: string;
  driver_id: string;
  vehicle_id: string | null;
  current_lat: number | null;
  current_lng: number | null;
  status: SessionStatus;
  last_location_update: string | null;
  started_at: string;
  ended_at: string | null;
  driver: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  };
  vehicle: MunVehicle | null;
}

export interface MunPickupRequest {
  id: string;
  resident_id: string;
  lat: number;
  lng: number;
  image_url: string | null;
  status: RequestStatus;
  priority_score: number;
  volume_estimate: string | null;
  category: string | null;
  created_at: string;
  resident: {
    full_name: string | null;
    email: string;
  } | null;
}

export interface MunRoute {
  id: string;
  driver_id: string;
  status: RouteStatus;
  optimized_path: Record<string, unknown> | null;
  created_at: string;
  driver: {
    full_name: string | null;
    email: string;
  } | null;
}

export interface MunDashboardStats {
  pendingCount: number;
  activeDriverCount: number;
  availableVehicleCount: number;
  completedRoutesToday: number;
}

export interface DriverWithSession {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  activeSession: MunDriverSession | null;
}
