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

// DELETE /api/v1/admin/institutions/:id - Delete institution domain
router.delete('/institutions/:id', async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM institutions WHERE id = $1 RETURNING id;', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Institution not found' });
    }
    res.json({ message: 'Institution deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete institution' });
  }
});

// GET /api/v1/admin/users - Platform user administration with institution details
router.get('/users', async (_req, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.verification_status, u.created_at, i.name AS institution
       FROM users u
       LEFT JOIN institutions i ON u.institution_id = i.id
       ORDER BY u.created_at DESC
       LIMIT 100;`
    );
    res.json({ users: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch platform users' });
  }
});

// PATCH /api/v1/admin/users/:id/verification - Update user verification status
router.patch('/users/:id/verification', async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { verification_status } = req.body;
    if (!['VERIFIED', 'PENDING', 'REJECTED'].includes(verification_status)) {
      return res.status(400).json({ error: 'Invalid verification_status. Must be VERIFIED, PENDING, or REJECTED' });
    }

    const result = await pool.query(
      `UPDATE users
       SET verification_status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, name, email, role, verification_status;`,
      [verification_status, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User verification updated', user: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update user verification' });
  }
});

// GET /api/v1/admin/system - Live platform metrics from database
router.get('/system', async (_req, res: Response) => {
  try {
    const usersCount = await pool.query('SELECT COUNT(*)::int AS count FROM users;');
    const verifiedUsersCount = await pool.query("SELECT COUNT(*)::int AS count FROM users WHERE verification_status = 'VERIFIED';");
    const pendingUsersCount = await pool.query("SELECT COUNT(*)::int AS count FROM users WHERE verification_status = 'PENDING';");
    const activeRidesCount = await pool.query("SELECT COUNT(*)::int AS count FROM rides WHERE status IN ('OPEN', 'ACTIVE', 'SCHEDULED');");
    const completedTripsCount = await pool.query("SELECT COUNT(*)::int AS count FROM trips WHERE status = 'COMPLETED';");
    const institutionsCount = await pool.query('SELECT COUNT(*)::int AS count FROM institutions;');

    res.json({
      system: {
        totalUsers: usersCount.rows[0]?.count ?? 0,
        verifiedUsers: verifiedUsersCount.rows[0]?.count ?? 0,
        pendingVerifications: pendingUsersCount.rows[0]?.count ?? 0,
        activeRides: activeRidesCount.rows[0]?.count ?? 0,
        completedTrips: completedTripsCount.rows[0]?.count ?? 0,
        totalInstitutions: institutionsCount.rows[0]?.count ?? 0,
        status: 'OPERATIONAL',
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch system metrics' });
  }
});

export default router;
