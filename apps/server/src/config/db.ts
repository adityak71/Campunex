import pg from 'pg';
import { config } from './index.js';

const { Pool } = pg;

export const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.name,
  user: config.db.user,
  password: config.db.password,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('⚠️ PostgreSQL pool idle client error:', err.message);
});

export async function checkDbConnection(): Promise<{ connected: boolean; postgis: boolean }> {
  try {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT postgis_full_version();');
      const postgisEnabled = res.rows.length > 0;
      return { connected: true, postgis: postgisEnabled };
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('PostgreSQL connection check failed:', err);
    return { connected: false, postgis: false };
  }
}
