import { Router, Response } from 'express';
import { pool } from '../config/db.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// GET /api/v1/notifications - Role-isolated notification list for authenticated user
router.get('/', authenticate, async (req: any, res: Response) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const requestedRole = (req.query.role as string)?.toUpperCase() || req.user?.role;
    const categoryFilter = (req.query.category as string)?.toUpperCase();
    const filter = (req.query.filter as string)?.toUpperCase();
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    let query = `
      SELECT id, recipient_id, recipient_role, event_type, entity_type, entity_id, category, title, message, priority, 
             is_read, read_at, action_type, action_url, expires_at, created_at, metadata
      FROM notifications
      WHERE recipient_id = $1 AND (recipient_role = $2 OR recipient_role = 'BOTH')
    `;

    const values: any[] = [userId, requestedRole];
    let paramIdx = 3;

    if (filter === 'UNREAD') {
      query += ` AND is_read = false`;
    }

    if (categoryFilter && categoryFilter !== 'ALL') {
      query += ` AND category = $${paramIdx}`;
      values.push(categoryFilter);
      paramIdx++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);

    // Unread count calculation
    const unreadRes = await pool.query(
      `SELECT COUNT(*)::int AS unread_count FROM notifications WHERE recipient_id = $1 AND (recipient_role = $2 OR recipient_role = 'BOTH') AND is_read = false`,
      [userId, requestedRole]
    );

    res.json({
      notifications: result.rows,
      unread_count: unreadRes.rows[0]?.unread_count || 0,
    });
  } catch (err: any) {
    console.error('Failed to fetch notifications:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});

// PATCH /api/v1/notifications/:id/read - Persist read state server-side
router.patch('/:id/read', authenticate, async (req: any, res: Response) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const notificationId = req.params.id;

    const result = await pool.query(
      `UPDATE notifications
       SET read_at = NOW(), is_read = true
       WHERE id = $1 AND recipient_id = $2
       RETURNING *`,
      [notificationId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Not Found', message: 'Notification not found or ownership denied' });
    }

    res.json({ message: 'Notification marked as read', notification: result.rows[0] });
  } catch (err: any) {
    console.error('Failed to mark notification read:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});

// PATCH /api/v1/notifications/read-all - Bulk mark all unread notifications as read
router.patch('/read-all', authenticate, async (req: any, res: Response) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const requestedRole = (req.query.role as string)?.toUpperCase() || req.user?.role;

    const result = await pool.query(
      `UPDATE notifications
       SET read_at = NOW(), is_read = true
       WHERE recipient_id = $1 AND (recipient_role = $2 OR recipient_role = 'BOTH') AND is_read = false
       RETURNING id`,
      [userId, requestedRole]
    );

    res.json({ message: 'All notifications marked as read', updated_count: result.rowCount });
  } catch (err: any) {
    console.error('Failed to mark all read:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});

// DELETE /api/v1/notifications/:id - Dismiss notification owned by user
router.delete('/:id', authenticate, async (req: any, res: Response) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const notificationId = req.params.id;

    const result = await pool.query(
      `DELETE FROM notifications WHERE id = $1 AND recipient_id = $2 RETURNING id`,
      [notificationId, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Not Found', message: 'Notification not found or ownership denied' });
    }

    res.json({ message: 'Notification dismissed' });
  } catch (err: any) {
    console.error('Failed to delete notification:', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
  }
});

export default router;
