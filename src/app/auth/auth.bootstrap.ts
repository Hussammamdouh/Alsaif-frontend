/**
 * Auth Bootstrap Service
 * Handles app initialization and session restoration
 */

import { AuthSession } from './auth.types';
import {
  loadAuthSession,
  loadBiometricPreference,
  isSessionValid,
  deleteAuthSession,
} from './auth.storage';
import { checkBiometricAvailability } from './auth.biometric';

/**
 * Bootstrap Result
 * Result of app bootstrap process
 */
export interface BootstrapResult {
  session: AuthSession | null;
  biometricEnabled: boolean;
  biometricAvailable: boolean;
}

/**
 * Bootstrap App
 * Initializes app on launch:
 * 1. Load saved session from secure storage
 * 2. Validate token expiration
 * 3. Check biometric availability
 * 4. Restore session if valid
 *
 * @returns Bootstrap result with session and biometric status
 */
export const bootstrapApp = async (): Promise<BootstrapResult> => {
  try {
    // Load all data in parallel for better performance
    const [session, biometricAvailability, biometricEnabled] = await Promise.all([
      loadAuthSession(false),
      checkBiometricAvailability(),
      loadBiometricPreference(),
    ]);

    // No saved session - fresh start
    if (!session) {
      return {
        session: null,
        biometricEnabled: false,
        biometricAvailable: biometricAvailability.available,
      };
    }

    // Validate session expiration
    if (!isSessionValid(session)) {
      console.warn('[Bootstrap] Session expired, will attempt refresh');

      // Session expired - try to refresh
      // Note: Refresh will be handled by AuthProvider
      // For now, return the session and let provider handle refresh
      return {
        session,
        biometricEnabled:
          biometricEnabled && biometricAvailability.available,
        biometricAvailable: biometricAvailability.available,
      };
    }

    // Valid session - restore
    return {
      session,
      biometricEnabled: biometricEnabled && biometricAvailability.available,
      biometricAvailable: biometricAvailability.available,
    };
  } catch (error) {
    console.error('[Bootstrap] Failed to bootstrap app:', error);

    // On error, clear corrupted data and start fresh
    await deleteAuthSession();

    return {
      session: null,
      biometricEnabled: false,
      biometricAvailable: false,
    };
  }
};

/**
 * Bootstrap with Biometric
 * Attempts to restore session using biometric authentication
 *
 * @returns Session if biometric auth succeeds, null otherwise
 */
export const bootstrapWithBiometric = async (): Promise<AuthSession | null> => {
  try {
    // Check if biometric is available
    const availability = await checkBiometricAvailability();
    if (!availability.available) {
      return null;
    }

    // Load biometric preference
    const biometricEnabled = await loadBiometricPreference();
    if (!biometricEnabled) {
      return null;
    }

    // Load session with biometric authentication
    const session = await loadAuthSession(true);

    if (!session) {
      return null;
    }

    // Validate session
    if (!isSessionValid(session)) {
      console.warn('[Bootstrap] Biometric session expired');
      return null;
    }

    return session;
  } catch (error) {
    console.error('[Bootstrap] Biometric bootstrap failed:', error);
    return null;
  }
};

/**
 * Validate Bootstrap State
 * Ensures app is in a consistent state after bootstrap
 *
 * @param result - Bootstrap result to validate
 * @returns True if state is valid
 */
export const validateBootstrapState = (result: BootstrapResult): boolean => {
  // If biometric is enabled, it must be available
  if (result.biometricEnabled && !result.biometricAvailable) {
    return false;
  }

  // If session exists, it must have required fields
  if (result.session) {
    if (
      !result.session.user ||
      !result.session.tokens ||
      !result.session.expiresAt
    ) {
      return false;
    }
  }

  return true;
};
