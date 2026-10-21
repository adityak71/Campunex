import { Router, Request, Response } from 'express';
import { pool } from '../config/db.js';
import { authenticate } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

// Enforce authentication & ADMIN role globally across all admin routes
router.use(authenticate);
router.use(requireRole('ADMIN'));

// GET /api/v1/admin/institutions - Manage platform institution domain verification list
router.get('/institutions', async (_req: Request, res: Response) => {
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

// GET /api/v1/admin/users - Platform user administration with institution details and driver KYC info
router.get('/users', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.verification_status, u.is_blocked, u.created_at,
              i.name AS institution,
              dp.id AS driver_profile_id,
              dp.phone_number,
              dp.dob,
              dp.aadhaar_number,
              dp.driving_license_number,
              dp.rc_number,
              dp.vehicle_type,
              dp.vehicle_number,
              dp.vehicle_make,
              dp.vehicle_model,
              dp.vehicle_color,
              dp.approval_status,
              dp.rejection_reason
       FROM users u
       LEFT JOIN institutions i ON u.institution_id = i.id
       LEFT JOIN driver_profiles dp ON dp.user_id = u.id
       ORDER BY u.created_at DESC
       LIMIT 100;`
    );
    res.json({ users: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch platform users' });
  }
});

// PATCH /api/v1/admin/users/:id/block - Block or unblock any user
router.patch('/users/:id/block', async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { is_blocked } = req.body;
    if (typeof is_blocked !== 'boolean') {
      return res.status(400).json({ error: 'is_blocked must be a boolean (true or false)' });
    }

    const result = await pool.query(
      `UPDATE users
       SET is_blocked = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, name, email, role, is_blocked, verification_status;`,
      [is_blocked, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: is_blocked ? 'User blocked successfully' : 'User unblocked successfully',
      user: result.rows[0],
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update user block status' });
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

    const user = result.rows[0];

    // If driver, keep driver_profiles approval_status in sync
    if (user.role === 'DRIVER') {
      const driverApproval =
        verification_status === 'VERIFIED' ? 'APPROVED' :
        verification_status === 'REJECTED' ? 'REJECTED' : 'PENDING';
      await pool.query(
        `UPDATE driver_profiles SET approval_status = $1, updated_at = NOW() WHERE user_id = $2;`,
        [driverApproval, id]
      );
    }

    res.json({ message: 'User verification updated', user });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update user verification' });
  }
});

// GET /api/v1/admin/drivers/pending - Fetch driver KYC & vehicle profiles for verification queue
router.get('/drivers/pending', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT dp.*, u.name AS driver_name, u.email AS driver_email, u.created_at AS user_created_at, i.name AS institution_name
       FROM driver_profiles dp
       JOIN users u ON dp.user_id = u.id
       LEFT JOIN institutions i ON u.institution_id = i.id
       ORDER BY dp.created_at DESC;`
    );
    res.json({ driverProfiles: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch driver profiles' });
  }
});

// PATCH /api/v1/admin/drivers/:id/approval - Approve or reject driver application
router.patch('/drivers/:id/approval', async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { approval_status, rejection_reason } = req.body;
    if (!['APPROVED', 'REJECTED', 'PENDING'].includes(approval_status)) {
      return res.status(400).json({ error: 'approval_status must be APPROVED, REJECTED, or PENDING' });
    }

    const result = await pool.query(
      `UPDATE driver_profiles
       SET approval_status = $1,
           rejection_reason = $2,
           updated_at = NOW()
       WHERE id::text = $3 OR user_id::text = $3
       RETURNING *;`,
      [approval_status, rejection_reason || null, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Driver profile not found' });
    }

    const profile = result.rows[0];

    // Synchronize user's verification_status
    const newVerificationStatus =
      approval_status === 'APPROVED' ? 'VERIFIED' :
      approval_status === 'REJECTED' ? 'REJECTED' : 'PENDING';

    await pool.query(
      `UPDATE users SET verification_status = $1, updated_at = NOW() WHERE id = $2;`,
      [newVerificationStatus, profile.user_id]
    );

    res.json({ message: `Driver profile ${approval_status.toLowerCase()} successfully`, profile });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update driver approval' });
  }
});


// GET /api/v1/admin/system - Live platform metrics from database
router.get('/system', async (_req: Request, res: Response) => {
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
