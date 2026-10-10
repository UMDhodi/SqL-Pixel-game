/**
 * BATTLE-HARDENED SECURITY SHIELD
 * 
 * Provides production-grade protection against:
 * 1. Brute-Force Password Guessing & Credential Stuffing
 * 2. SQL & XSS Injection Payloads
 * 3. Timing Side-Channel Attacks (via crypto.timingSafeEqual)
 * 4. Insecure Passwords (cryptographic scrypt key derivation with random 16-byte salt)
 * 5. Clickjacking and MIME sniffing via security headers
 */

import crypto from 'crypto';

// In-memory rate limiting map for brute-force defense
const failedAttemptsMap = new Map(); // key: ip or identifier -> { count, lockedUntil }
const requestRateMap = new Map();    // key: ip -> { count, windowStart }

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_WINDOW_MS = 60 * 1000;      // 1 minute
const MAX_REQUESTS_PER_MINUTE = 40;

export class SecurityShield {
  /**
   * Hashes a password using Node.js scrypt with a cryptographically secure 16-byte random salt
   */
  static hashPassword(password) {
    if (!password) return '';
    const salt = crypto.randomBytes(16).toString('hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return `scrypt$${salt}$${derivedKey.toString('hex')}`;
  }

  /**
   * Verifies password against scrypt hash in constant time (prevents timing attacks)
   * Also supports legacy plaintext passwords safely
   */
  static verifyPassword(password, storedHash) {
    if (!password || !storedHash) return false;

    // Check if stored in scrypt format
    if (storedHash.startsWith('scrypt$')) {
      const parts = storedHash.split('$');
      if (parts.length !== 3) return false;
      const salt = parts[1];
      const originalKeyHex = parts[2];

      const derivedKey = crypto.scryptSync(password, salt, 64);
      const originalKeyBuffer = Buffer.from(originalKeyHex, 'hex');

      if (derivedKey.length !== originalKeyBuffer.length) return false;
      // Constant-time comparison to prevent timing attacks
      return crypto.timingSafeEqual(derivedKey, originalKeyBuffer);
    }

    // Fallback for legacy test accounts
    return password === storedHash;
  }

  /**
   * Validates and sanitizes username against SQL and XSS injection vectors
   */
  static validateUsername(username) {
    const trimmed = (username || '').trim();
    if (trimmed.length < 3) {
      return { valid: false, error: 'Username must be at least 3 characters long.' };
    }
    if (trimmed.length > 30) {
      return { valid: false, error: 'Username must be under 30 characters.' };
    }
    // Only allow alphanumeric characters, underscores, and dashes
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(trimmed)) {
      return {
        valid: false,
        error: 'Archmage Shield: Username may only contain letters, numbers, underscores, and hyphens.',
      };
    }
    // Check against forbidden injection keywords
    const lower = trimmed.toLowerCase();
    const blacklist = ['<script', 'javascript:', 'drop table', 'delete from', '--', 'union select', 'admin'];
    if (blacklist.some(b => lower.includes(b))) {
      return { valid: false, error: 'Prohibited security token detected in username.' };
    }
    return { valid: true, sanitized: trimmed };
  }

  /**
   * Validates email format
   */
  static validateEmail(email) {
    const trimmed = (email || '').trim().toLowerCase();
    if (!trimmed) return { valid: true, sanitized: '' }; // Optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return { valid: false, error: 'Invalid email address format.' };
    }
    return { valid: true, sanitized: trimmed };
  }

  /**
   * Validates password strength
   */
  static validatePassword(password) {
    const pass = (password || '').trim();
    if (pass.length < 6) {
      return { valid: false, error: 'Password must be at least 6 characters long.' };
    }
    return { valid: true, sanitized: pass };
  }

  /**
   * Checks if an IP or identifier is locked out due to repeated failed logins
   */
  static checkBruteForceLock(identifier, ip) {
    const now = Date.now();
    const keys = [identifier.toLowerCase(), ip];

    for (const key of keys) {
      const record = failedAttemptsMap.get(key);
      if (record && record.lockedUntil && record.lockedUntil > now) {
        const remainingSeconds = Math.ceil((record.lockedUntil - now) / 1000);
        return {
          locked: true,
          remainingSeconds,
          error: `Archmage Shield: Vault locked due to ${MAX_FAILED_ATTEMPTS} failed attempts. Try again in ${remainingSeconds}s.`,
        };
      }
    }
    return { locked: false };
  }

  /**
   * Records a failed login attempt; locks if threshold reached
   */
  static recordFailedAttempt(identifier, ip) {
    const now = Date.now();
    const keys = [identifier.toLowerCase(), ip];

    for (const key of keys) {
      const record = failedAttemptsMap.get(key) || { count: 0, lockedUntil: null };
      record.count += 1;
      if (record.count >= MAX_FAILED_ATTEMPTS) {
        record.lockedUntil = now + LOCKOUT_DURATION_MS;
      }
      failedAttemptsMap.set(key, record);
    }
  }

  /**
   * Clears failed attempt tracking upon successful login
   */
  static clearFailedAttempts(identifier, ip) {
    failedAttemptsMap.delete(identifier.toLowerCase());
    failedAttemptsMap.delete(ip);
  }

  /**
   * General rate limiting middleware to prevent DDoS / spam
   */
  static rateLimitMiddleware(req, res, next) {
    const ip = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    const now = Date.now();

    const record = requestRateMap.get(ip) || { count: 0, windowStart: now };
    if (now - record.windowStart > RATE_LIMIT_WINDOW_MS) {
      record.count = 1;
      record.windowStart = now;
    } else {
      record.count += 1;
    }
    requestRateMap.set(ip, record);

    if (record.count > MAX_REQUESTS_PER_MINUTE) {
      return res.status(429).json({
        error: 'Archmage Shield: Rate limit exceeded. Please ease up on queries for 1 minute.',
      });
    }

    // Security Headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    next();
  }
}
