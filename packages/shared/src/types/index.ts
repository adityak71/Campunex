import { USER_ROLES, VERIFICATION_STATUS, RIDE_STATUS, RIDE_REQUEST_STATUS, TRIP_STATUS } from '../constants/index.js';

export type UserRole = keyof typeof USER_ROLES;
export type VerificationStatus = keyof typeof VERIFICATION_STATUS;
export type RideStatus = keyof typeof RIDE_STATUS;
export type RideRequestStatus = keyof typeof RIDE_REQUEST_STATUS;
export type TripStatus = keyof typeof TRIP_STATUS;

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  verification_status: VerificationStatus;
  institution_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Ride {
  id: string;
  driver_id: string;
  origin_name: string;
  destination_name: string;
  origin: GeoPoint;
  destination: GeoPoint;
  route_geometry?: string; // GeoJSON string or WKT
  departure_time: string;
  total_seats: number;
  available_seats: number;
  status: RideStatus;
  created_at: string;
  updated_at: string;
}

export interface MatchResult {
  ride: Ride;
  driver_name: string;
  matchScore: number;
  routeCompatibility: number;
  pickupDistanceMeters: number;
  dropoffDistanceMeters: number;
  timeDifferenceMinutes: number;
}

export interface LocationUpdatePayload {
  tripId: string;
  latitude: number;
  longitude: number;
  timestamp: number;
}

export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  services: {
    postgres: boolean;
    postgis: boolean;
    redis: boolean;
  };
}
