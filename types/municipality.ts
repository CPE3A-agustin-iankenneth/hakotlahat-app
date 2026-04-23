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
  latitude: number;
  longitude: number;
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

export interface ResScore {
  id: string;
  user_id: string;
  total_recycled: number;
  eco_points: number;
  total_requests: number;
  streak_days: number;
  created_at: string;
  updated_at: string;
}

export interface DrvScore {
  id: string;
  user_id: string;
  total_collections: number;
  routes_completed: number;
  total_distance_km: number;
  on_time_rate: number;
  avg_route_duration_min: number;
  drv_points: number;
  created_at: string;
  updated_at: string;
}
