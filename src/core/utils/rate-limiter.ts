/**
 * Rate Limiter Utility
 * Prevents brute force attacks by limiting login/registration attempts
 */

export interface RateLimitResult {
  allowed: boolean;
  remainingAttempts: number;
  resetTime?: number;
}

/**
 * Rate Limiter Class
 * Tracks and limits attempts for different operations
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();

  /**
   * Check if an attempt is allowed
   * @param key - Unique identifier (e.g., email, IP)
   * @param maxAttempts - Maximum attempts allowed
   * @param windowMs - Time window in milliseconds
   * @returns Whether the attempt is allowed and remaining attempts
   */
  canAttempt(key: string, maxAttempts: number, windowMs: number): RateLimitResult {
    const now = Date.now();
    const attemptTimes = this.attempts.get(key) || [];

    // Filter attempts within the time window
    const recentAttempts = attemptTimes.filter(time => now - time < windowMs);

    if (recentAttempts.length >= maxAttempts) {
      const oldestAttempt = Math.min(...recentAttempts);
      const resetTime = oldestAttempt + windowMs;

      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime,
      };
    }

    return {
      allowed: true,
      remainingAttempts: maxAttempts - recentAttempts.length - 1,
    };
  }

  /**
   * Record an attempt
   * @param key - Unique identifier
   */
  recordAttempt(key: string, windowMs: number): void {
    const now = Date.now();
    const attemptTimes = this.attempts.get(key) || [];

    // Filter attempts within the time window
    const recentAttempts = attemptTimes.filter(time => now - time < windowMs);
    recentAttempts.push(now);

    this.attempts.set(key, recentAttempts);
  }

  /**
   * Get remaining time until attempts reset
   * @param key - Unique identifier
   * @param windowMs - Time window in milliseconds
   * @returns Remaining time in milliseconds
   */
  getRemainingTime(key: string, windowMs: number): number {
    const attemptTimes = this.attempts.get(key) || [];
    if (attemptTimes.length === 0) {
      return 0;
    }

    const now = Date.now();
    const oldestAttempt = Math.min(...attemptTimes);
    const timeElapsed = now - oldestAttempt;
    return Math.max(0, windowMs - timeElapsed);
  }

  /**
   * Get remaining time in user-friendly format
   * @param key - Unique identifier
   * @param windowMs - Time window in milliseconds
   * @returns Human-readable time string
   */
  getRemainingTimeString(key: string, windowMs: number): string {
    const remainingMs = this.getRemainingTime(key, windowMs);

    if (remainingMs === 0) {
      return '';
    }

    const minutes = Math.floor(remainingMs / 60000);
    const seconds = Math.floor((remainingMs % 60000) / 1000);

    if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ${seconds} second${seconds !== 1 ? 's' : ''}`;
    }

    return `${seconds} second${seconds !== 1 ? 's' : ''}`;
  }

  /**
   * Reset attempts for a key
   * @param key - Unique identifier
   */
  reset(key: string): void {
    this.attempts.delete(key);
  }

  /**
   * Clear all attempts (useful for testing or cleanup)
   */
  clearAll(): void {
    this.attempts.clear();
  }
}

/**
 * Global rate limiter instance
 * Shared across the app
 */
export const rateLimiter = new RateLimiter();

/**
 * Rate limit configuration for different operations
 */
export const RATE_LIMIT_CONFIG = {
  LOGIN: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  REGISTER: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  PASSWORD_RESET: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
};
