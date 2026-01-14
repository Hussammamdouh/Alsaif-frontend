/**
 * Environment Configuration
 * Centralized access to environment variables
 * Using Expo Constants for environment management
 */

import Constants from 'expo-constants';

// Get extra config from app.config.js
const extra = Constants.expoConfig?.extra || {};

const Config = {
  API_BASE_URL: extra.apiBaseUrl || 'http://localhost:5000',
  API_TIMEOUT: extra.apiTimeout || '30000',
  ENABLE_LOGGING: extra.enableLogging ? 'true' : 'false',
  LOG_LEVEL: extra.logLevel || 'debug',
  APP_ENV: 'development',
};

/**
 * Environment Variables
 */
export const ENV = {
  /**
   * API Configuration
   */
  API_BASE_URL: Config.API_BASE_URL || 'http://localhost:5000',
  API_TIMEOUT: parseInt(Config.API_TIMEOUT || '30000', 10),

  /**
   * Logging Configuration
   */
  ENABLE_LOGGING: Config.ENABLE_LOGGING === 'true',
  LOG_LEVEL: (Config.LOG_LEVEL || 'debug') as 'debug' | 'info' | 'warn' | 'error',

  /**
   * App Information
   */
  APP_ENV: (Config.APP_ENV || 'development') as 'development' | 'staging' | 'production',

  /**
   * Feature Flags
   */
  ENABLE_BIOMETRIC: true,
  ENABLE_EMAIL_VERIFICATION: true,
  ENABLE_DEVICE_SECURITY_CHECK: true,
} as const;

/**
 * Check if running in production
 */
export const isProduction = () => ENV.APP_ENV === 'production';

/**
 * Check if running in development
 */
export const isDevelopment = () => ENV.APP_ENV === 'development';

/**
 * Get API base URL
 */
export const getApiBaseUrl = () => ENV.API_BASE_URL;

/**
 * Get API timeout
 */
export const getApiTimeout = () => ENV.API_TIMEOUT;
