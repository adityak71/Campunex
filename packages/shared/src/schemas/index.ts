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
  dropoff_lat: z.coerce.number().min(-90).max(90),
  dropoff_lng: z.coerce.number().min(-180).max(180),
  departure_time: z.string().optional(),
  max_distance_meters: z.coerce.number().positive().optional().default(500),
});

export const verifyOtpSchema = z.object({
  otp: z.string().length(4, 'OTP must be 4 digits').regex(/^\d{4}$/, 'OTP must be numeric'),
});
