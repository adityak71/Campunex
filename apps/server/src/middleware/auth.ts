import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { pool } from '../config/db.js';

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  let token: string | undefined = req.cookies?.token;

  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }

  if (!token) {
    res.status(401).json({ error: 'Unauthorized: Authentication token required' });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    return;
  }

  // Real-time blocked account enforcement
  try {
    const userRes = await pool.query('SELECT is_blocked FROM users WHERE id = $1;', [payload.userId]);
    if (userRes.rows.length > 0 && userRes.rows[0].is_blocked) {
      res.status(403).json({
        error: 'ACCOUNT_BLOCKED',
        message: 'You have been blocked by Campunex. Please contact customer care.',
      });
      return;
    }
  } catch (err) {
    console.error('Error checking user block status in auth middleware:', err);
  }

  req.user = payload;
  next();
}

