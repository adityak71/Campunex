import { pool } from '../../config/db.js';
import { redis } from '../../config/redis.js';
import { hashPassword, verifyPassword } from '../../utils/password.js';
import { signToken, JwtPayload } from '../../utils/jwt.js';
import { UserRole, VerificationStatus, User } from '@campunex/shared';
import { sendVerificationEmail } from '../../utils/mailer.js';

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}): Promise<{ user: User; token: string }> {
  const { name, email, password, role } = data;

  // 1. Check existing email
  const existingRes = await pool.query('SELECT id FROM users WHERE email = $1;', [email]);
  if (existingRes.rows.length > 0) {
    throw new Error('User with this email already exists');
  }

  // 2. Extract email domain for institutional identity matching
  const emailDomain = email.split('@')[1]?.toLowerCase();
  let institutionId: string | undefined;
  let verificationStatus: VerificationStatus = 'PENDING';

  if (emailDomain) {
    const instRes = await pool.query('SELECT id FROM institutions WHERE email_domain = $1;', [
      emailDomain,
    ]);
    if (instRes.rows.length > 0) {
      institutionId = instRes.rows[0].id;
    }
  }

  // 3. Hash password
  const passwordHash = await hashPassword(password);

  // 4. Create user in PostgreSQL
  const insertRes = await pool.query<User>(
    `INSERT INTO users (name, email, password_hash, role, verification_status, institution_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, name, email, role, verification_status, institution_id, created_at, updated_at;`,
    [name, email, passwordHash, role, verificationStatus, institutionId || null]
  );

  const newUser = insertRes.rows[0];

  // 5. Generate 6-digit institutional OTP & store in Redis (10 minutes)
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await redis.setex(`inst_otp:${newUser.id}`, 600, otp);

  // Send OTP to user's email via Brevo
  // Fire and forget (don't block registration on email failure)
  sendVerificationEmail(newUser.email, otp).catch(console.error);

  // 6. Sign JWT Token
  const jwtPayload: JwtPayload = {
    userId: newUser.id,
    email: newUser.email,
    role: newUser.role,
    verificationStatus: newUser.verification_status,
  };
  const token = signToken(jwtPayload);

  return { user: newUser, token };
}

export async function loginUser(data: {
  email: string;
  password: string;
}): Promise<{ user: User; token: string }> {
  const { email, password } = data;

  const userRes = await pool.query<User & { password_hash: string }>(
    `SELECT id, name, email, password_hash, role, verification_status, institution_id, created_at, updated_at
     FROM users WHERE email = $1;`,
    [email]
  );

  if (userRes.rows.length === 0) {
    throw new Error('Invalid email or password');
  }

  const user = userRes.rows[0];
  const isValid = await verifyPassword(password, user.password_hash);
  if (!isValid) {
    throw new Error('Invalid email or password');
  }

  const jwtPayload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    verificationStatus: user.verification_status,
  };

  const token = signToken(jwtPayload);

  const { password_hash, ...userProfile } = user;
  return { user: userProfile as User, token };
}

export async function verifyInstitutionOtp(
  userId: string,
  otp: string
): Promise<{ user: User; token: string }> {
  const storedOtp = await redis.get(`inst_otp:${userId}`);
  if (!storedOtp || storedOtp !== otp) {
    throw new Error('Invalid or expired verification code');
  }

  await redis.del(`inst_otp:${userId}`);

  const updateRes = await pool.query<User>(
    `UPDATE users
     SET verification_status = 'VERIFIED', updated_at = NOW()
     WHERE id = $1
     RETURNING id, name, email, role, verification_status, institution_id, created_at, updated_at;`,
    [userId]
  );

  if (updateRes.rows.length === 0) {
    throw new Error('User not found');
  }

  const updatedUser = updateRes.rows[0];

  const jwtPayload: JwtPayload = {
    userId: updatedUser.id,
    email: updatedUser.email,
    role: updatedUser.role,
    verificationStatus: updatedUser.verification_status,
  };

  const newToken = signToken(jwtPayload);
  return { user: updatedUser, token: newToken };
}

export async function getUserById(userId: string): Promise<User | null> {
  const res = await pool.query<User>(
    `SELECT id, name, email, role, verification_status, institution_id, created_at, updated_at
     FROM users WHERE id = $1;`,
    [userId]
  );
  return res.rows[0] || null;
}

export async function resendInstitutionOtp(userId: string): Promise<void> {
  const userRes = await pool.query<User>(
    'SELECT id, email, verification_status FROM users WHERE id = $1;',
    [userId]
  );

  if (userRes.rows.length === 0) {
    throw new Error('User not found');
  }

  const user = userRes.rows[0];

  if (user.verification_status === 'VERIFIED') {
    throw new Error('User is already verified');
  }

  // Check rate limit (only resend once per minute)
  const ttl = await redis.ttl(`inst_otp:${userId}`);
  if (ttl > 540) { // If TTL is > 9 minutes, they just requested it.
    throw new Error('Please wait before requesting a new OTP');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await redis.setex(`inst_otp:${userId}`, 600, otp);

  // Send OTP
  sendVerificationEmail(user.email, otp).catch(console.error);
}
