import { Request, Response } from 'express';
import { registerUser, loginUser, verifyInstitutionOtp, getUserById } from './auth.service.js';
import { setTokenCookie, clearTokenCookie } from '../../utils/jwt.js';
import { registerSchema, loginSchema } from '@campunex/shared';

export async function handleRegister(req: Request, res: Response): Promise<void> {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: 'Validation Error', details: parseResult.error.format() });
      return;
    }

    const { user, token, verificationOtp } = await registerUser(parseResult.data);
    setTokenCookie(res, token);

    res.status(201).json({
      message: 'Registration successful. Please check your email for the verification OTP.',
      user,
      token,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Registration failed' });
  }
}

export async function handleLogin(req: Request, res: Response): Promise<void> {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: 'Validation Error', details: parseResult.error.format() });
      return;
    }

    const { user, token } = await loginUser(parseResult.data);
    setTokenCookie(res, token);

    res.status(200).json({
      message: 'Login successful',
      user,
      token,
    });
  } catch (err: any) {
    res.status(401).json({ error: err.message || 'Authentication failed' });
  }
}

export async function handleLogout(_req: Request, res: Response): Promise<void> {
  clearTokenCookie(res);
  res.status(200).json({ message: 'Logout successful' });
}

export async function handleGetMe(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user?.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await getUserById(req.user.userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({ user });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
}

export async function handleVerifyInstitution(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { otp } = req.body;

    if (!userId || !otp) {
      res.status(400).json({ error: 'User ID and 6-digit verification OTP are required' });
      return;
    }

    const { user, token } = await verifyInstitutionOtp(userId, otp);
    setTokenCookie(res, token);

    res.status(200).json({
      message: 'Institutional identity successfully verified',
      user,
      token,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Verification failed' });
  }
}
