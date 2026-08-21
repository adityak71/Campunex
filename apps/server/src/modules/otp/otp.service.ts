import crypto from 'crypto';
import { redis } from '../../config/redis.js';
import { config } from '../../config/index.js';

export function hashOtp(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

export function generate4DigitOtp(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export async function generateAndStoreTripOtp(
  tripId: string,
  type: 'START' | 'COMPLETION'
): Promise<{ otp: string; hash: string }> {
  const otp = generate4DigitOtp();
  const hash = hashOtp(otp);

  const redisKey = `otp:${type.toLowerCase()}:${tripId}`;
  const ttl = config.otp.expirationSeconds; // 300 seconds (5 mins)

  await redis.setex(redisKey, ttl, hash);
  // Reset attempt counter
  await redis.del(`otp:attempts:${type.toLowerCase()}:${tripId}`);

  return { otp, hash };
}

export async function verifyTripOtp(
  tripId: string,
  type: 'START' | 'COMPLETION',
  submittedOtp: string
): Promise<boolean> {
  const redisKey = `otp:${type.toLowerCase()}:${tripId}`;
  const attemptsKey = `otp:attempts:${type.toLowerCase()}:${tripId}`;

  // 1. Check max attempts
  const attemptsStr = await redis.get(attemptsKey);
  const attempts = attemptsStr ? parseInt(attemptsStr, 10) : 0;

  if (attempts >= config.otp.maxAttempts) {
    throw new Error('Maximum OTP verification attempts exceeded. Please request a new OTP.');
  }

  // 2. Fetch stored hash
  const storedHash = await redis.get(redisKey);
  if (!storedHash) {
    throw new Error('OTP has expired or is invalid. Please request a new OTP.');
  }

  // 3. Compare hash
  const submittedHash = hashOtp(submittedOtp);
  if (submittedHash !== storedHash) {
    await redis.setex(attemptsKey, 600, (attempts + 1).toString());
    const remaining = config.otp.maxAttempts - (attempts + 1);
    throw new Error(`Invalid OTP code. ${remaining} attempt(s) remaining.`);
  }

  // 4. On success, delete OTP and attempt keys
  await redis.del(redisKey);
  await redis.del(attemptsKey);

  return true;
}
