import argon2 from 'argon2';
import { pool } from '../config/db.js';

export async function runSeeds(): Promise<void> {
  const client = await pool.connect();
  try {
    console.log('🌱 Checking seed data...');

    // Seed default institutions
    const institutions = [
      { name: 'Lovely Professional University', email_domain: 'lpu.in' },
      { name: 'State University Campus', email_domain: 'college.edu' },
      { name: 'National Institute of Tech', email_domain: 'nit.ac.in' },
    ];

    for (const inst of institutions) {
      await client.query(
        `INSERT INTO institutions (name, email_domain)
         VALUES ($1, $2)
         ON CONFLICT (email_domain) DO NOTHING;`,
        [inst.name, inst.email_domain]
      );
    }

    // Check if test users exist
    const userCount = await client.query('SELECT COUNT(*) FROM users;');
    if (parseInt(userCount.rows[0].count, 10) === 0) {
      console.log('🌱 Seeding initial demo users...');
      const instRes = await client.query(`SELECT id FROM institutions WHERE email_domain = 'lpu.in' LIMIT 1;`);
      const instId = instRes.rows[0]?.id;

      const passwordHash = await argon2.hash('password123');

      // Demo Driver
      const driverRes = await client.query(
        `INSERT INTO users (name, email, password_hash, role, verification_status, institution_id)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id;`,
        ['Demo Driver', 'driver@lpu.in', passwordHash, 'DRIVER', 'VERIFIED', instId]
      );
      const driverId = driverRes.rows[0]?.id;

      // Demo Rider
      await client.query(
        `INSERT INTO users (name, email, password_hash, role, verification_status, institution_id)
         VALUES ($1, $2, $3, $4, $5, $6);`,
        ['Demo Rider', 'rider@lpu.in', passwordHash, 'RIDER', 'VERIFIED', instId]
      );

      // Seed Default Demo Rides for Driver
      if (driverId) {
        console.log('🌱 Seeding initial campus rides for Demo Driver...');
        const departure1 = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        const departure2 = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

        // Ride 1: LPU Main Gate -> Jalandhar Railway Station
        await client.query(
          `INSERT INTO rides (
            driver_id, origin_name, destination_name, origin_geom, destination_geom, route_geometry, departure_time, total_seats, available_seats, status
          ) VALUES (
            $1, 'LPU Main Gate', 'Jalandhar City Railway Station',
            ST_SetSRID(ST_MakePoint(75.7037, 31.2536), 4326),
            ST_SetSRID(ST_MakePoint(75.5762, 31.3260), 4326),
            ST_SetSRID(ST_MakeLine(ST_MakePoint(75.7037, 31.2536), ST_MakePoint(75.5762, 31.3260)), 4326),
            $2, 4, 4, 'SCHEDULED'
          );`,
          [driverId, departure1]
        );

        // Ride 2: LPU Law Gate -> Phagwara Junction
        await client.query(
          `INSERT INTO rides (
            driver_id, origin_name, destination_name, origin_geom, destination_geom, route_geometry, departure_time, total_seats, available_seats, status
          ) VALUES (
            $1, 'LPU Law Gate', 'Phagwara Junction Railway Station',
            ST_SetSRID(ST_MakePoint(75.7012, 31.2505), 4326),
            ST_SetSRID(ST_MakePoint(75.7708, 31.2240), 4326),
            ST_SetSRID(ST_MakeLine(ST_MakePoint(75.7012, 31.2505), ST_MakePoint(75.7708, 31.2240)), 4326),
            $2, 3, 3, 'SCHEDULED'
          );`,
          [driverId, departure2]
        );
      }

      console.log('✅ Demo users & campus rides seeded successfully!');
    } else {
      console.log('ℹ️ Seed data already present.');
    }

    // Ensure Demo Driver profile exists and is approved for development / testing
    const existingDriverRes = await client.query(`SELECT id FROM users WHERE email = 'driver@lpu.in' LIMIT 1;`);
    if (existingDriverRes.rows.length > 0) {
      await client.query(
        `INSERT INTO driver_profiles (
          user_id, phone_number, dob, aadhaar_number, driving_license_number, rc_number, vehicle_number, vehicle_make, vehicle_model, vehicle_color, approval_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'APPROVED')
        ON CONFLICT (user_id) DO NOTHING;`,
        [existingDriverRes.rows[0].id, '9876543210', '1998-05-15', '123456789012', 'DL-PB-08-2020-0012345', 'RC-PB-08-AB-1234', 'PB-08-AB-1234', 'Honda', 'Civic', 'Silver']
      );
    }
  } catch (err) {
    console.error('❌ Database seed failed:', err);
  } finally {
    client.release();
  }
}
