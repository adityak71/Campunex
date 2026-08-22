import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['RIDER', 'DRIVER']).default('RIDER'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const geoPointSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const createRideSchema = z.object({
  origin_name: z.string().min(1, 'Origin name is required'),
  destination_name: z.string().min(1, 'Destination name is required'),
  origin: geoPointSchema,
  destination: geoPointSchema,
  waypoints: z.array(geoPointSchema).optional(),
  departure_time: z.string().datetime('Invalid departure time'),
  total_seats: z.number().int().min(1).max(8),
});

export const searchRideSchema = z.object({
  pickup_lat: z.coerce.number().min(-90).max(90),
  pickup_lng: z.coerce.number().min(-180).max(180),
  dropoff_lat: z.coerce.number().min(-90).max(90).optional(),
  dest_lat: z.coerce.number().min(-90).max(90).optional(),
  dropoff_lng: z.coerce.number().min(-180).max(180).optional(),
  dest_lng: z.coerce.number().min(-180).max(180).optional(),
  departure_time: z.string().optional(),
  date: z.string().optional(),
  vehicle_type: z.enum(['ANY', 'CAR', 'BIKE']).optional().default('ANY'),
  vehicle: z.string().optional(),
  time_window: z.enum(['ANY', 'MORNING', 'AFTERNOON', 'EVENING']).optional().default('ANY'),
  max_distance_meters: z.coerce.number().positive().optional().default(500),
}).transform((data) => ({
  pickup_lat: data.pickup_lat,
  pickup_lng: data.pickup_lng,
  dropoff_lat: data.dropoff_lat ?? data.dest_lat ?? 31.3260,
  dropoff_lng: data.dropoff_lng ?? data.dest_lng ?? 75.5762,
  departure_time: data.departure_time ?? data.date,
  vehicle_type: data.vehicle_type ?? (data.vehicle as any) ?? 'ANY',
  time_window: data.time_window ?? 'ANY',
  max_distance_meters: data.max_distance_meters ?? 500,
}));

export const verifyOtpSchema = z.object({
  otp: z.string().length(4, 'OTP must be 4 digits').regex(/^\d{4}$/, 'OTP must be numeric'),
});
