import { pool } from '../config/db.js';
import { io } from '../server.js';

export interface CreateNotificationPayload {
  userId: string;
  role: 'RIDER' | 'DRIVER' | 'BOTH';
  category: 'RIDE' | 'TRIP' | 'REQUEST' | 'SAFETY' | 'ACCOUNT' | 'SYSTEM';
  type: string;
  title: string;
  message: string;
  state?: 'UNREAD' | 'READ' | 'ACTION_REQUIRED' | 'INFORMATIONAL' | 'SUCCESS' | 'WARNING' | 'CRITICAL';
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  link?: string;
  action_label?: string;
}

/**
 * Creates a notification in the DB and immediately broadcasts it to the user
 * via their personal WebSocket room (user:<userId>).
 */
export async function createAndEmitNotification(payload: CreateNotificationPayload): Promise<void> {
  try {
    const result = await pool.query(
      `INSERT INTO notifications (user_id, role, category, type, title, message, state, priority, link, action_label)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, user_id, role, category, type, title, message, state, priority, link, action_label, created_at`,
      [
        payload.userId,
        payload.role,
        payload.category,
        payload.type,
        payload.title,
        payload.message,
        payload.state || 'UNREAD',
        payload.priority || 'NORMAL',
        payload.link || null,
        payload.action_label || null,
      ]
    );

    const notification = result.rows[0];
    if (notification) {
      // Broadcast to user's personal WebSocket room for instant delivery
      io.to(`user:${payload.userId}`).emit('notification:new', {
        id: notification.id,
        role: notification.role,
        category: notification.category,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        state: notification.state,
        priority: notification.priority,
        link: notification.link,
        action_label: notification.action_label,
        timestamp: notification.created_at,
        read: false,
      });
    }
  } catch (err) {
    // Non-critical: log but don't fail the parent operation
    console.error('⚠️ Failed to create/emit notification:', err);
  }
}
