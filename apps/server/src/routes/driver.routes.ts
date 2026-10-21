import { Router, Request, Response } from 'express';
import { pool } from '../config/db.js';
import { authenticate } from '../middleware/auth.js';
import { driverProfileSchema } from '@campunex/shared';

const router = Router();

// Protect all driver routes with authenticate
router.use(authenticate);

// GET /api/v1/driver/profile - Fetch authenticated driver's KYC and vehicle info
router.get('/profile', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await pool.query(
      `SELECT dp.*, u.name, u.email, u.verification_status
       FROM driver_profiles dp
       JOIN users u ON dp.user_id = u.id
       WHERE dp.user_id = $1;`,
      [userId]
    );

    res.json({ profile: result.rows[0] || null });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch driver profile' });
  }
});

// POST /api/v1/driver/profile - Create or update driver KYC and vehicle info
router.post('/profile', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const parseResult = driverProfileSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation Error',
        details: parseResult.error.format(),
      });
    }

    const {
      phone_number,
      dob,
      aadhaar_number,
      driving_license_number,
      rc_number,
      vehicle_type,
      vehicle_number,
      vehicle_make,
      vehicle_model,
      vehicle_color,
    } = parseResult.data;

    const cleanPhone = phone_number.trim();
    const cleanAadhaar = aadhaar_number.trim();
    const cleanDL = driving_license_number.trim().toUpperCase();
    const cleanRC = rc_number.trim().toUpperCase();
    const cleanVehicle = vehicle_number.trim().toUpperCase();

    // 1. Proactive uniqueness check against all other drivers
    const dupCheck = await pool.query(
      `SELECT phone_number, aadhaar_number, driving_license_number, rc_number, vehicle_number
       FROM driver_profiles
       WHERE user_id != $1 AND (
         phone_number = $2 OR
         aadhaar_number = $3 OR
         driving_license_number = $4 OR
         rc_number = $5 OR
         vehicle_number = $6
       )
       LIMIT 1;`,
      [userId, cleanPhone, cleanAadhaar, cleanDL, cleanRC, cleanVehicle]
    );

    if (dupCheck.rows.length > 0) {
      const match = dupCheck.rows[0];
      if (match.phone_number === cleanPhone) {
        return res.status(409).json({ error: 'This mobile number is already registered by another driver. Please try another.' });
      }
      if (match.aadhaar_number === cleanAadhaar) {
        return res.status(409).json({ error: 'This Aadhaar number is already registered. Please try another.' });
      }
      if (match.driving_license_number === cleanDL) {
        return res.status(409).json({ error: 'This Driving License (DL) number is already registered. Please try another.' });
      }
      if (match.rc_number === cleanRC) {
        return res.status(409).json({ error: 'This Vehicle Registration Certificate (RC) number is already registered. Please try another.' });
      }
      if (match.vehicle_number === cleanVehicle) {
        return res.status(409).json({ error: 'This Vehicle number is already registered. Please try another.' });
      }
    }

    const result = await pool.query(
      `INSERT INTO driver_profiles (
         user_id, phone_number, dob, aadhaar_number, driving_license_number, rc_number, vehicle_type, vehicle_number, vehicle_make, vehicle_model, vehicle_color, approval_status
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'PENDING')
       ON CONFLICT (user_id) DO UPDATE SET
         phone_number = EXCLUDED.phone_number,
         dob = EXCLUDED.dob,
         aadhaar_number = EXCLUDED.aadhaar_number,
         driving_license_number = EXCLUDED.driving_license_number,
         rc_number = EXCLUDED.rc_number,
         vehicle_type = EXCLUDED.vehicle_type,
         vehicle_number = EXCLUDED.vehicle_number,
         vehicle_make = EXCLUDED.vehicle_make,
         vehicle_model = EXCLUDED.vehicle_model,
         vehicle_color = EXCLUDED.vehicle_color,
         approval_status = 'PENDING',
         rejection_reason = NULL,
         updated_at = NOW()
       RETURNING *;`,
      [
        userId,
        cleanPhone,
        dob,
        cleanAadhaar,
        cleanDL,
        cleanRC,
        vehicle_type || 'CAR',
        cleanVehicle,
        vehicle_make.trim(),
        vehicle_model.trim(),
        vehicle_color.trim(),
      ]
    );

    res.status(200).json({
      message: 'Driver KYC submitted. Please wait for administrator verification.',
      profile: result.rows[0],
    });
  } catch (err: any) {
    if (err.code === '23505') {
      const detail = err.detail || '';
      if (detail.includes('phone_number')) {
        return res.status(409).json({ error: 'This mobile number is already registered by another driver. Please try another.' });
      }
      if (detail.includes('aadhaar_number')) {
        return res.status(409).json({ error: 'This Aadhaar number is already registered. Please try another.' });
      }
      if (detail.includes('driving_license_number')) {
        return res.status(409).json({ error: 'This Driving License (DL) number is already registered. Please try another.' });
      }
      if (detail.includes('rc_number')) {
        return res.status(409).json({ error: 'This Vehicle Registration Certificate (RC) number is already registered. Please try another.' });
      }
      if (detail.includes('vehicle_number')) {
        return res.status(409).json({ error: 'This Vehicle number is already registered. Please try another.' });
      }
      return res.status(409).json({ error: 'One of the submitted details already exists in the system. Please try another.' });
    }
    res.status(500).json({ error: err.message || 'Failed to submit driver profile' });
  }
});

export default router;
