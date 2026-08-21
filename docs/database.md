# Database & Spatial Schema Documentation

Campunex utilizes PostgreSQL 16 with the **PostGIS 3.4 extension** enabled.

## Entity Relational Tables

### 1. `institutions`
Stores verified campus domain names for identity verification.
- `id` (UUID, PK)
- `name` (VARCHAR)
- `email_domain` (VARCHAR, UNIQUE) — e.g. `lpu.in`
- `verification_enabled` (BOOLEAN)

### 2. `users`
User account identities with Role-Based Access Control (`RIDER`, `DRIVER`, `ADMIN`).
- `id` (UUID, PK)
- `name` (VARCHAR)
- `email` (VARCHAR, UNIQUE)
- `password_hash` (TEXT) — Argon2id
- `role` (VARCHAR)
- `verification_status` (VARCHAR) — `PENDING`, `VERIFIED`, `REJECTED`
- `institution_id` (UUID, FK)

### 3. `rides`
Driver published routes containing PostGIS spatial columns in `SRID 4326` (WGS 84).
- `id` (UUID, PK)
- `driver_id` (UUID, FK)
- `origin_geom` (`GEOMETRY(Point, 4326)`) — Driver departure point
- `destination_geom` (`GEOMETRY(Point, 4326)`) — Driver arrival point
- `route_geometry` (`GEOMETRY(LineString, 4326)`) — Continuous polyline path along waypoints
- `departure_time` (TIMESTAMPTZ)
- `total_seats` (INT)
- `available_seats` (INT)
- `status` (VARCHAR)

### 4. `ride_requests`
Rider booking requests with pickup/dropoff spatial points.
- `id` (UUID, PK)
- `ride_id` (UUID, FK)
- `rider_id` (UUID, FK)
- `pickup_geom` (`GEOMETRY(Point, 4326)`)
- `dropoff_geom` (`GEOMETRY(Point, 4326)`)
- `status` (VARCHAR)

### 5. `trips`
Active ride state machine tracking life cycle and dual OTP verification.
- `id` (UUID, PK)
- `ride_request_id` (UUID, FK, UNIQUE)
- `ride_id` (UUID, FK)
- `rider_id` (UUID, FK)
- `driver_id` (UUID, FK)
- `status` (VARCHAR) — `ACCEPTED` -> `OTP_PENDING` -> `IN_PROGRESS` -> `COMPLETION_PENDING` -> `COMPLETED`
- `start_otp_hash` (VARCHAR)
- `completion_otp_hash` (VARCHAR)
- `started_at` (TIMESTAMPTZ)
- `completed_at` (TIMESTAMPTZ)

## GIST Spatial Indexes
```sql
CREATE INDEX idx_rides_route_geom ON rides USING GIST (route_geometry);
CREATE INDEX idx_rides_origin_geom ON rides USING GIST (origin_geom);
CREATE INDEX idx_rides_destination_geom ON rides USING GIST (destination_geom);
```
