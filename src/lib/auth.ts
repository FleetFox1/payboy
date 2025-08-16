import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { SignJWT, jwtVerify } from 'jose';

// JWT secret (make sure to add this to your .env.local)
const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-super-secret-jwt-key');

/**
 * JWT utilities for authentication
 */

// Create a JWT token for a user
export async function createJWT(payload: { userId: string; email: string; userType: string }): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h') // Token expires in 24 hours
    .setIssuer('payboy-app')
    .setAudience('payboy-users')
    .sign(secret);
}

// Verify and decode a JWT token
export async function verifyJWT(token: string): Promise<{ userId: string; email: string; userType: string } | null> {
  try {
    const { payload } = await jwtVerify(token, secret, {
      issuer: 'payboy-app',
      audience: 'payboy-users',
    });
    return payload as { userId: string; email: string; userType: string };
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

// Create a JWT token for API authentication (for merchants)
export async function createApiJWT(payload: { merchantId: string; apiKeyLast4: string }): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h') // API tokens expire faster
    .setIssuer('payboy-api')
    .setAudience('payboy-merchants')
    .sign(secret);
}

/**
 * Password hashing utilities for email/password authentication
 */

// Hash a password for storage
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12; // Strong salt rounds for security
  return bcrypt.hash(password, saltRounds);
}

// Verify a password against its hash
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generate API key for merchants
export function generateApiKey(): string {
  const prefix = 'pk_live_';
  const randomBytes = crypto.randomBytes(32).toString('hex');
  return `${prefix}${randomBytes}`;
}

// Hash API key for storage (we store hash, show last 4 to user)
export async function hashApiKey(apiKey: string): Promise<{ hash: string; last4: string }> {
  const hash = await bcrypt.hash(apiKey, 12);
  const last4 = apiKey.slice(-4);
  return { hash, last4 };
}

// Verify API key against its hash
export async function verifyApiKey(apiKey: string, hash: string): Promise<boolean> {
  return bcrypt.compare(apiKey, hash);
}

// Generate secure webhook secret
export function generateWebhookSecret(): string {
  return `whsec_${crypto.randomBytes(32).toString('hex')}`;
}

/**
 * Email validation utility
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Password strength validation
 */
export function isValidPassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}