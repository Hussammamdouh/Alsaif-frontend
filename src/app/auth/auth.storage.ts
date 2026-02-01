/**
 * Auth Storage Service
 * Secure storage for authentication tokens and session data
 * Uses OS-level keychain (iOS Keychain / Android Keystore) on native
 * Uses AsyncStorage for web/Expo Go development
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as KeychainStub from '../../core/utils/keychain-stub';
import { AuthSession, SecureStorageKey } from './auth.types';

// Real keychain will be loaded dynamically if available
let Keychain: any = KeychainStub;

/**
 * Initialize Keychain
 * Attempts to load real react-native-keychain if not in Expo Go
 */
const initKeychain = () => {
  try {
    // If not running in Expo Go (appOwnership is null or 'standalone'/'guest' in some versions)
    // and not on web, we try to use the real native module
    const isExpoGo = Constants.appOwnership === 'expo';

    if (Platform.OS !== 'web' && !isExpoGo) {
      // In native builds, this will work if the module is linked
      // If it fails or returns undefined, we stay with the stub
      const NativeKeychain = require('react-native-keychain');
      if (NativeKeychain && NativeKeychain.setGenericPassword) {
        Keychain = NativeKeychain;
      }
    }
  } catch (e) {
    console.warn('[AuthStorage] Failed to load native keychain, using stub:', e);
  }
};

// Initialize on load
initKeychain();

/**
 * Storage Configuration
 * High security settings for production fintech app
 */
const KEYCHAIN_OPTIONS: any = {
  service: 'com.elsaifanalysis.auth',
  accessible: Keychain.ACCESSIBLE?.WHEN_UNLOCKED_THIS_DEVICE_ONLY || 'AccessibleWhenUnlockedThisDeviceOnly',
  securityLevel: Keychain.SECURITY_LEVEL?.SECURE_HARDWARE || 'SECURE_HARDWARE',
};

/**
 * Biometric Storage Configuration
 * Additional security for biometric-protected data
 */
const BIOMETRIC_OPTIONS: any = {
  ...KEYCHAIN_OPTIONS,
  accessControl: Keychain.ACCESS_CONTROL?.BIOMETRY_CURRENT_SET || 'BiometryCurrentSet',
};

/**
 * Check if running on web or in Expo Go
 * Use AsyncStorage instead of Keychain for web/Expo Go
 */
const shouldUseAsyncStorage = (): boolean => {
  const isExpoGo = Constants.appOwnership === 'expo';
  return Platform.OS === 'web' || isExpoGo;
};

/**
 * Save Auth Session
 * Securely stores authentication session in device keychain
 *
 * @param session - Auth session to store
 * @param useBiometric - Whether to protect with biometric
 */
export const saveAuthSession = async (
  session: AuthSession,
  useBiometric = false
): Promise<void> => {
  try {
    const sessionData = JSON.stringify(session);

    // Use AsyncStorage for web/Expo Go
    if (shouldUseAsyncStorage()) {
      await AsyncStorage.setItem(SecureStorageKey.AUTH_SESSION, sessionData);
      return;
    }

    // Use Keychain for native
    const options = useBiometric ? { ...BIOMETRIC_OPTIONS } : { ...KEYCHAIN_OPTIONS };
    await Keychain.setGenericPassword(
      SecureStorageKey.AUTH_SESSION,
      sessionData,
      options
    );
  } catch (error) {
    console.error('[AuthStorage] Failed to save session:', error);
    throw new Error('Failed to save authentication session');
  }
};

/**
 * Load Auth Session
 * Retrieves authentication session from device keychain
 *
 * @param requireBiometric - Whether biometric auth is required
 * @returns Auth session or null if not found
 */
export const loadAuthSession = async (
  requireBiometric = false
): Promise<AuthSession | null> => {
  try {
    // Use AsyncStorage for web/Expo Go
    if (shouldUseAsyncStorage()) {
      const sessionData = await AsyncStorage.getItem(SecureStorageKey.AUTH_SESSION);
      if (!sessionData) {
        return null;
      }
      const session = JSON.parse(sessionData) as AuthSession;
      return session;
    }

    // Use Keychain for native
    // We pass a new object literal to avoid "frozen object" errors if the library tries to modify it
    const options = requireBiometric
      ? {
        service: KEYCHAIN_OPTIONS.service,
        accessControl: Keychain.ACCESS_CONTROL?.BIOMETRY_CURRENT_SET || 'BiometryCurrentSet',
        authenticationPrompt: {
          title: 'Authenticate to access your account',
        },
      }
      : { ...KEYCHAIN_OPTIONS };

    const credentials = await Keychain.getGenericPassword(options);

    if (!credentials) {
      return null;
    }

    // Verify it's our session key
    if (credentials.username !== SecureStorageKey.AUTH_SESSION) {
      return null;
    }

    const session = JSON.parse(credentials.password) as AuthSession;
    return session;
  } catch (error) {
    // Biometric failure or cancellation
    if (requireBiometric && isKeychainError(error)) {
      console.warn('[AuthStorage] Biometric authentication failed');
      return null;
    }

    console.error('[AuthStorage] Failed to load session:', error);
    return null;
  }
};

/**
 * Delete Auth Session
 * Removes authentication session from device keychain
 */
export const deleteAuthSession = async (): Promise<void> => {
  try {
    // Use AsyncStorage for web/Expo Go
    if (shouldUseAsyncStorage()) {
      await AsyncStorage.removeItem(SecureStorageKey.AUTH_SESSION);
      return;
    }

    // Use Keychain for native
    await Keychain.resetGenericPassword(KEYCHAIN_OPTIONS);
  } catch (error) {
    console.error('[AuthStorage] Failed to delete session:', error);
    // Don't throw - best effort cleanup
  }
};

/**
 * Save Biometric Preference
 * Stores user's biometric authentication preference
 *
 * @param enabled - Whether biometric is enabled
 */
export const saveBiometricPreference = async (
  enabled: boolean
): Promise<void> => {
  try {
    // Use AsyncStorage for web/Expo Go
    if (shouldUseAsyncStorage()) {
      if (enabled) {
        await AsyncStorage.setItem(SecureStorageKey.BIOMETRIC_ENABLED, 'true');
      } else {
        await AsyncStorage.removeItem(SecureStorageKey.BIOMETRIC_ENABLED);
      }
      return;
    }

    // Use Keychain for native
    if (enabled) {
      await Keychain.setGenericPassword(
        SecureStorageKey.BIOMETRIC_ENABLED,
        'true',
        KEYCHAIN_OPTIONS
      );
    } else {
      // Delete the preference
      await Keychain.resetGenericPassword({
        ...KEYCHAIN_OPTIONS,
        service: SecureStorageKey.BIOMETRIC_ENABLED,
      });
    }
  } catch (error) {
    console.error('[AuthStorage] Failed to save biometric preference:', error);
    throw new Error('Failed to save biometric preference');
  }
};

/**
 * Load Biometric Preference
 * Retrieves user's biometric authentication preference
 *
 * @returns Whether biometric is enabled
 */
export const loadBiometricPreference = async (): Promise<boolean> => {
  try {
    // Use AsyncStorage for web/Expo Go
    if (shouldUseAsyncStorage()) {
      const value = await AsyncStorage.getItem(SecureStorageKey.BIOMETRIC_ENABLED);
      return value === 'true';
    }

    // Use Keychain for native
    const credentials = await Keychain.getGenericPassword({
      ...KEYCHAIN_OPTIONS,
      service: SecureStorageKey.BIOMETRIC_ENABLED,
    });

    return credentials !== false;
  } catch (error) {
    console.error('[AuthStorage] Failed to load biometric preference:', error);
    return false;
  }
};

/**
 * Clear All Auth Data
 * Removes all authentication data from secure storage
 * Used on logout or security breach
 */
export const clearAllAuthData = async (): Promise<void> => {
  try {
    // Use AsyncStorage for web/Expo Go
    if (shouldUseAsyncStorage()) {
      await Promise.all([
        AsyncStorage.removeItem(SecureStorageKey.AUTH_SESSION),
        AsyncStorage.removeItem(SecureStorageKey.BIOMETRIC_ENABLED),
      ]);
      return;
    }

    // Use Keychain for native
    await Promise.all([
      deleteAuthSession(),
      Keychain.resetGenericPassword({
        ...KEYCHAIN_OPTIONS,
        service: SecureStorageKey.BIOMETRIC_ENABLED,
      }),
    ]);
  } catch (error) {
    console.error('[AuthStorage] Failed to clear auth data:', error);
    // Best effort - don't throw
  }
};

/**
 * Validate Session Expiration
 * Checks if access token is still valid
 *
 * @param session - Auth session to validate
 * @returns True if session is valid (not expired)
 */
export const isSessionValid = (session: AuthSession): boolean => {
  const now = Date.now();
  const bufferTime = 60 * 1000; // 1 minute buffer

  // Check if token is expired or will expire soon
  return session.expiresAt > now + bufferTime;
};

/**
 * Type Guard for Keychain Errors
 */
const isKeychainError = (error: unknown): error is Error => {
  return error instanceof Error;
};
