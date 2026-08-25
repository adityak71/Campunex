import { pool } from '../config/db.js';
import { io } from '../server.js';
import { NotificationCategory, NotificationPriority, Notification } from '@campunex/shared';

export interface CreateNotificationPayload {
  recipient_id: string;
  recipient_role: string;
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
 */
export async function createAndEmitNotification(payload: CreateNotificationPayload): Promise<void> {
  try {
    const result = await pool.query(
      `INSERT INTO notifications (
        recipient_id, recipient_role, event_type, entity_type, entity_id, category, title, message, priority, action_type, action_url, expires_at, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (recipient_id, event_type, entity_id) WHERE entity_id IS NOT NULL 
      DO NOTHING
      RETURNING *`,
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
        payload.metadata || null,
      ]
    );

    const notification = result.rows[0];
    if (notification) {
      // Broadcast to user's personal WebSocket room for instant delivery
      io.to(`user:${payload.recipient_id}`).emit('notification:new', {
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
      } as Notification);
    }
  } catch (err) {
    // Non-critical: log but don't fail the parent operation
    console.error('⚠️ Failed to create/emit notification:', err);
  }
}
