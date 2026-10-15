import { pool } from '../config/db.js';
import { io } from '../server.js';
import { NotificationCategory, NotificationPriority, Notification } from '@campunex/shared';

export interface CreateNotificationPayload {
  recipient_id: string;
  recipient_role: 'RIDER' | 'DRIVER' | 'ADMIN' | 'BOTH';
  event_type: string;
  entity_type?: string;
  entity_id?: string;
  category: NotificationCategory;
  title: string;
  message: string;
  priority?: NotificationPriority;
  action_type?: string;
  action_url?: string;
  expires_at?: Date;
  metadata?: Record<string, any>;
}

/**
 * Creates a notification in the DB and immediately broadcasts it to the user
 * via their personal WebSocket room (user:<userId>).
 * Enforces idempotency via ON CONFLICT (recipient_id, event_type, entity_id).
 */
export async function createAndEmitNotification(payload: CreateNotificationPayload): Promise<Notification | null> {
  try {
    const result = await pool.query(
      `INSERT INTO notifications (
        recipient_id, recipient_role, event_type, entity_type, entity_id, category, title, message, priority, action_type, action_url, expires_at, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (recipient_id, event_type, entity_id) WHERE entity_id IS NOT NULL 
      DO UPDATE SET
        title = EXCLUDED.title,
        message = EXCLUDED.message,
        priority = EXCLUDED.priority,
        action_type = EXCLUDED.action_type,
        action_url = EXCLUDED.action_url,
        is_read = false,
        read_at = NULL,
        created_at = NOW(),
        metadata = EXCLUDED.metadata
      RETURNING *;`,
      [
        payload.recipient_id,
        payload.recipient_role,
        payload.event_type,
        payload.entity_type || null,
        payload.entity_id || null,
        payload.category,
        payload.title,
        payload.message,
        payload.priority || 'NORMAL',
        payload.action_type || null,
        payload.action_url || null,
        payload.expires_at || null,
        payload.metadata ? JSON.stringify(payload.metadata) : null,
      ]
    );

    const notification = result.rows[0];
    if (notification) {
      const formattedNotif: Notification = {
        id: notification.id,
        recipient_id: notification.recipient_id,
        recipient_role: notification.recipient_role,
        event_type: notification.event_type,
        entity_type: notification.entity_type,
        entity_id: notification.entity_id,
        category: notification.category,
        title: notification.title,
        message: notification.message,
        priority: notification.priority,
        is_read: notification.is_read,
        action_type: notification.action_type,
        action_url: notification.action_url,
        expires_at: notification.expires_at,
        created_at: notification.created_at,
        metadata: notification.metadata,
      };

      // Broadcast to user's isolated personal WebSocket room for instant delivery (Rule 3)
      io.to(`user:${payload.recipient_id}`).emit('notification:new', formattedNotif);
      return formattedNotif;
    }
    return null;
  } catch (err) {
    // Non-critical: log but don't fail the parent business transaction
    console.error('⚠️ Failed to create/emit notification:', err);
    return null;
  }
}

/**
 * Dispatches platform-level notifications to all system administrators.
 */
export async function notifyAdmins(
  payload: Omit<CreateNotificationPayload, 'recipient_id' | 'recipient_role'>
): Promise<void> {
  try {
    const adminRes = await pool.query(`SELECT id FROM users WHERE role = 'ADMIN';`);
    for (const admin of adminRes.rows) {
      await createAndEmitNotification({
        ...payload,
        recipient_id: admin.id,
        recipient_role: 'ADMIN',
      });
    }
  } catch (err) {
    console.error('⚠️ Failed to dispatch admin notifications:', err);
  }
}
