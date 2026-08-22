import { pool } from '../config/db.js';

export async function runMigrations(): Promise<void> {
  const client = await pool.connect();
  try {
    console.log('🔄 Running database migrations...');
    await client.query('BEGIN');

    // 1. Ensure extensions
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS postgis;
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `);

    // 2. Institutions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS institutions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email_domain VARCHAR(100) UNIQUE NOT NULL,
        verification_enabled BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 3. Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(20) DEFAULT 'RIDER' CHECK (role IN ('RIDER', 'DRIVER', 'ADMIN')),
        verification_status VARCHAR(20) DEFAULT 'PENDING' CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED')),
        institution_id UUID REFERENCES institutions(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 4. Rides table with PostGIS geometries
    await client.query(`
      CREATE TABLE IF NOT EXISTS rides (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        driver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        origin_name VARCHAR(255) NOT NULL,
        destination_name VARCHAR(255) NOT NULL,
        origin_geom GEOMETRY(Point, 4326) NOT NULL,
        destination_geom GEOMETRY(Point, 4326) NOT NULL,
        route_geometry GEOMETRY(LineString, 4326) NOT NULL,
        departure_time TIMESTAMPTZ NOT NULL,
        total_seats INT NOT NULL DEFAULT 4,
        available_seats INT NOT NULL DEFAULT 4,
        status VARCHAR(20) DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'OPEN', 'ACTIVE', 'CANCELLED', 'COMPLETED', 'EXPIRED')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 5. Ride Requests table
    await client.query(`
      CREATE TABLE IF NOT EXISTS ride_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
        rider_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        match_score FLOAT DEFAULT 0.0,
        pickup_geom GEOMETRY(Point, 4326),
        dropoff_geom GEOMETRY(Point, 4326),
        status VARCHAR(20) DEFAULT 'REQUESTED' CHECK (status IN ('REQUESTED', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'EXPIRED')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 6. Trips table
    await client.query(`
      CREATE TABLE IF NOT EXISTS trips (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ride_request_id UUID UNIQUE NOT NULL REFERENCES ride_requests(id) ON DELETE CASCADE,
        ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE CASCADE,
        rider_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        driver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(30) DEFAULT 'ACCEPTED' CHECK (status IN ('ACCEPTED', 'OTP_PENDING', 'STARTED', 'IN_PROGRESS', 'COMPLETION_PENDING', 'COMPLETED', 'CANCELLED')),
        start_otp_hash VARCHAR(255),
        completion_otp_hash VARCHAR(255),
        started_at TIMESTAMPTZ,
        completed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 7. Location Updates table
    await client.query(`
      CREATE TABLE IF NOT EXISTS location_updates (
        id BIGSERIAL PRIMARY KEY,
        trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
        driver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        location GEOMETRY(Point, 4326) NOT NULL,
        recorded_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 8. Create GIST Spatial Indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_rides_route_geom ON rides USING GIST (route_geometry);
      CREATE INDEX IF NOT EXISTS idx_rides_origin_geom ON rides USING GIST (origin_geom);
      CREATE INDEX IF NOT EXISTS idx_rides_destination_geom ON rides USING GIST (destination_geom);
      CREATE INDEX IF NOT EXISTS idx_ride_requests_pickup_geom ON ride_requests USING GIST (pickup_geom);
      CREATE INDEX IF NOT EXISTS idx_location_updates_loc ON location_updates USING GIST (location);
    `);

    // 9. Standard Indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_rides_driver ON rides(driver_id);
      CREATE INDEX IF NOT EXISTS idx_rides_departure ON rides(departure_time);
      CREATE INDEX IF NOT EXISTS idx_ride_requests_ride ON ride_requests(ride_id);
      CREATE INDEX IF NOT EXISTS idx_ride_requests_rider ON ride_requests(rider_id);
      CREATE INDEX IF NOT EXISTS idx_trips_driver ON trips(driver_id);
      CREATE INDEX IF NOT EXISTS idx_trips_rider ON trips(rider_id);
    `);

    // 10. Notifications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(20) NOT NULL CHECK (role IN ('RIDER', 'DRIVER', 'BOTH')),
        category VARCHAR(20) NOT NULL CHECK (category IN ('RIDE', 'TRIP', 'REQUEST', 'SAFETY', 'ACCOUNT', 'SYSTEM')),
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        state VARCHAR(30) DEFAULT 'UNREAD' CHECK (state IN ('UNREAD', 'READ', 'ACTION_REQUIRED', 'INFORMATIONAL', 'SUCCESS', 'WARNING', 'CRITICAL')),
        priority VARCHAR(20) DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'CRITICAL')),
        link VARCHAR(255),
        related_id VARCHAR(255),
        action_label VARCHAR(100),
        group_count INT DEFAULT 1,
        read_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_user_role ON notifications(user_id, role);
    `);

    // Fix existing rides status CHECK constraint (DROP + ADD to include OPEN, EXPIRED)
    await client.query(`
      ALTER TABLE rides DROP CONSTRAINT IF EXISTS rides_status_check;
      ALTER TABLE rides ADD CONSTRAINT rides_status_check
        CHECK (status IN ('SCHEDULED', 'OPEN', 'ACTIVE', 'CANCELLED', 'COMPLETED', 'EXPIRED'));
    `);

    // Fix notifications user_id to be nullable for broadcast system notifications
    await client.query(`
      ALTER TABLE notifications ALTER COLUMN user_id DROP NOT NULL;
    `).catch(() => { /* already nullable - ignore */ });

    await client.query('COMMIT');
    console.log('✅ Database migrations applied successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Database migration failed:', err);
    throw err;
  } finally {
    client.release();
  }
}
