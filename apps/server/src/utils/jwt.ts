import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { config } from '../config/index.js';
import { UserRole, VerificationStatus } from '@campunex/shared';

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  verificationStatus: VerificationStatus;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
  });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, config.jwt.secret) as JwtPayload;
  } catch (err) {
    return null;
  }
}

export function setTokenCookie(res: Response, token: string): void {
  const isProduction = config.env === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

export function clearTokenCookie(res: Response): void {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'lax',
  });
}
