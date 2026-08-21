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
      await client.query(
        `INSERT INTO users (name, email, password_hash, role, verification_status, institution_id)
         VALUES ($1, $2, $3, $4, $5, $6);`,
        ['Demo Driver', 'driver@lpu.in', passwordHash, 'DRIVER', 'VERIFIED', instId]
      );

      // Demo Rider
      await client.query(
        `INSERT INTO users (name, email, password_hash, role, verification_status, institution_id)
         VALUES ($1, $2, $3, $4, $5, $6);`,
        ['Demo Rider', 'rider@lpu.in', passwordHash, 'RIDER', 'VERIFIED', instId]
      );

      console.log('✅ Demo users seeded: driver@lpu.in / rider@lpu.in (password: password123)');
    } else {
      console.log('ℹ️ Seed data already present.');
    }
  } catch (err) {
    console.error('❌ Database seed failed:', err);
  } finally {
    client.release();
  }
}
