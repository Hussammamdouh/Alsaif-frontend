/**
 * Biometric Authentication Service
 * Handles Face ID, Touch ID, and Fingerprint authentication
 */

import * as Keychain from '../../core/utils/keychain-stub';
import { Platform } from 'react-native';
import { BiometricAvailability, BiometricType } from './auth.types';

/**
 * Check Biometric Availability
 * Determines if biometric authentication is available on device
 *
 * @returns Biometric availability status
 */
export const checkBiometricAvailability =
  async (): Promise<BiometricAvailability> => {
    try {
      const biometryType = await Keychain.getSupportedBiometryType();

      if (!biometryType) {
        return {
          available: false,
          biometryType: null,
          error: 'Biometric authentication is not available on this device',
        };
      }

      // Map keychain biometry type to our enum
      const mappedType = mapBiometryType(biometryType);

      return {
        available: true,
        biometryType: mappedType,
      };
    } catch (error) {
      console.error('[Biometric] Failed to check availability:', error);
      return {
        available: false,
        biometryType: null,
        error: 'Failed to check biometric availability',
      };
    }
  };

/**
 * Map Keychain Biometry Type to Our Enum
 */
const mapBiometryType = (
  keychainType: Keychain.BIOMETRY_TYPE
): BiometricType => {
  switch (keychainType) {
    case Keychain.BIOMETRY_TYPE.FACE_ID:
      return BiometricType.FACE_ID;
    case Keychain.BIOMETRY_TYPE.TOUCH_ID:
      return BiometricType.TOUCH_ID;
    case Keychain.BIOMETRY_TYPE.FINGERPRINT:
      return BiometricType.FINGERPRINT;
    case Keychain.BIOMETRY_TYPE.IRIS:
      return BiometricType.IRIS;
    default:
      return BiometricType.FINGERPRINT;
  }
};

/**
 * Get Biometric Prompt Message
 * Platform-specific biometric prompt text
 *
 * @param biometricType - Type of biometric authentication
 * @returns User-friendly prompt message
 */
export const getBiometricPromptMessage = (
  biometricType: BiometricType | null
): string => {
  if (Platform.OS === 'ios') {
    return biometricType === BiometricType.FACE_ID
      ? 'Authenticate with Face ID'
      : 'Authenticate with Touch ID';
  }

  return 'Authenticate with Biometrics';
};

/**
 * Get Biometric Enable Message
 * User-friendly message for enabling biometrics
 *
 * @param biometricType - Type of biometric authentication
 * @returns Enable prompt message
 */
export const getBiometricEnableMessage = (
  biometricType: BiometricType
): string => {
  switch (biometricType) {
    case BiometricType.FACE_ID:
      return 'Enable Face ID for faster login?';
    case BiometricType.TOUCH_ID:
      return 'Enable Touch ID for faster login?';
    case BiometricType.FINGERPRINT:
      return 'Enable Fingerprint for faster login?';
    case BiometricType.IRIS:
      return 'Enable Iris scanning for faster login?';
    default:
      return 'Enable biometric authentication for faster login?';
  }
};

/**
 * Validate Biometric Security
 * Checks if biometric authentication can be safely used
 *
 * @returns True if biometric is secure, false otherwise
 */
export const validateBiometricSecurity = async (): Promise<boolean> => {
  try {
    const availability = await checkBiometricAvailability();

    if (!availability.available) {
      return false;
    }

    // Additional security checks can go here
    // e.g., check if device is rooted/jailbroken
    // e.g., verify hardware-backed keystore

    return true;
  } catch (error) {
    console.error('[Biometric] Security validation failed:', error);
    return false;
  }
};

/**
 * Handle Biometric Error
 * Converts keychain errors to user-friendly messages
 *
 * @param error - Error from keychain operation
 * @returns User-friendly error message
 */
export const handleBiometricError = (error: unknown): string => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes('cancel')) {
      return 'Authentication cancelled';
    }

    if (message.includes('lockout')) {
      return 'Too many failed attempts. Please try again later.';
    }

    if (message.includes('not available')) {
      return 'Biometric authentication is not available';
    }

    if (message.includes('not enrolled')) {
      return 'No biometric credentials enrolled on this device';
    }

    if (message.includes('system cancel')) {
      return 'Authentication was interrupted';
    }
  }

  return 'Biometric authentication failed';
};
