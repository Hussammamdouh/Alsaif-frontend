/**
 * Logger Utility
 * Production-ready logging with environment-based levels
 * Prevents sensitive data logging in production
 */

import { ENV, isProduction } from '../config/env';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private currentLevel: number;
  private enableLogging: boolean;

  constructor() {
    this.currentLevel = LOG_LEVELS[ENV.LOG_LEVEL];
    this.enableLogging = ENV.ENABLE_LOGGING;
  }

  /**
   * Check if log level should be output
   */
  private shouldLog(level: LogLevel): boolean {
    if (!this.enableLogging) {
      return false;
    }
    return LOG_LEVELS[level] >= this.currentLevel;
  }

  /**
   * Sanitize sensitive data from logs
   */
  private sanitize(...args: unknown[]): unknown[] {
    if (!isProduction()) {
      return args;
    }

    return args.map(arg => {
      if (typeof arg === 'string') {
        // Redact tokens, passwords, etc.
        return arg
          .replace(/Bearer\s+[\w-]+\.[\w-]+\.[\w-]+/gi, 'Bearer [REDACTED]')
          .replace(/"password"\s*:\s*"[^"]+"/gi, '"password":"[REDACTED]"')
          .replace(/"token"\s*:\s*"[^"]+"/gi, '"token":"[REDACTED]"');
      }

      if (typeof arg === 'object' && arg !== null) {
        const sanitized = { ...arg as Record<string, unknown> };
        const sensitiveKeys = ['password', 'token', 'accessToken', 'refreshToken', 'secret'];

        sensitiveKeys.forEach(key => {
          if (key in sanitized) {
            sanitized[key] = '[REDACTED]';
          }
        });

        return sanitized;
      }

      return arg;
    });
  }

  /**
   * Format log message with context
   */
  private format(level: LogLevel, context: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] [${context}]`;
  }

  /**
   * Debug level logging
   */
  debug(context: string, ...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      const prefix = this.format('debug', context);
      const sanitized = this.sanitize(...args);
      console.log(prefix, ...sanitized);
    }
  }

  /**
   * Info level logging
   */
  info(context: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      const prefix = this.format('info', context);
      const sanitized = this.sanitize(...args);
      console.info(prefix, ...sanitized);
    }
  }

  /**
   * Warning level logging
   */
  warn(context: string, ...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      const prefix = this.format('warn', context);
      const sanitized = this.sanitize(...args);
      console.warn(prefix, ...sanitized);
    }
  }

  /**
   * Error level logging
   */
  error(context: string, ...args: unknown[]): void {
    if (this.shouldLog('error')) {
      const prefix = this.format('error', context);
      const sanitized = this.sanitize(...args);
      console.error(prefix, ...sanitized);
    }
  }
}

/**
 * Global logger instance
 */
export const logger = new Logger();
