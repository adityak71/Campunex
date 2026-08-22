import { Router, Response } from 'express';
import { pool } from '../config/db.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

// Enforce authentication & ADMIN role globally across all admin routes
router.use(authenticate);
router.use(requireRole('ADMIN'));

// GET /api/v1/admin/institutions - Manage platform institution domain verification list
router.get('/institutions', async (_req, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM institutions ORDER BY name ASC;');
    res.json({ institutions: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch institutions' });
  }
});

// POST /api/v1/admin/institutions - Add approved university domain
router.post('/institutions', async (req: any, res: Response) => {
  try {
    const { name, email_domain, verification_enabled } = req.body;
    if (!name || !email_domain) {
      return res.status(400).json({ error: 'Institution name and email_domain are required' });
    }

    const result = await pool.query(
      `INSERT INTO institutions (name, email_domain, verification_enabled)
       VALUES ($1, $2, $3)
       RETURNING *;`,
      [name, email_domain.toLowerCase(), verification_enabled ?? true]
    );

    res.status(201).json({ message: 'Institution added successfully', institution: result.rows[0] });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to add institution' });
  }
});

// PATCH /api/v1/admin/institutions/:id - Toggle verification status or update domain
router.patch('/institutions/:id', async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { verification_enabled, name } = req.body;

    const result = await pool.query(
      `UPDATE institutions
       SET verification_enabled = COALESCE($1, verification_enabled),
           name = COALESCE($2, name),
           updated_at = NOW()
       WHERE id = $3
       RETURNING *;`,
      [verification_enabled, name, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Institution not found' });
    }

    res.json({ message: 'Institution updated', institution: result.rows[0] });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update institution' });
  }
});

// GET /api/v1/admin/users - Platform user administration
router.get('/users', async (_req, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, role, verification_status, created_at FROM users ORDER BY created_at DESC LIMIT 100;`
    );
    res.json({ users: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch platform users' });
  }
});

// GET /api/v1/admin/system - Platform status inspection
router.get('/system', async (_req, res: Response) => {
  try {
    const usersCount = await pool.query('SELECT COUNT(*)::int AS count FROM users;');
    const ridesCount = await pool.query('SELECT COUNT(*)::int AS count FROM rides;');
    const tripsCount = await pool.query('SELECT COUNT(*)::int AS count FROM trips;');

    res.json({
      system: {
        totalUsers: usersCount.rows[0].count,
        totalRides: ridesCount.rows[0].count,
        totalTrips: tripsCount.rows[0].count,
        status: 'OPERATIONAL',
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch system metrics' });
  }
});

export default router;
