/**
 * Biometric Authentication Service
 * Handles Face ID, Touch ID, and Fingerprint authentication
 */

import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';
import { BiometricAvailability, BiometricType } from './auth.types';

/**
 * Check Biometric Availability
 * Determines if biometric authentication is available on device
 *
 * @returns Biometric availability status
 */
export const checkBiometricAvailability = async (): Promise<BiometricAvailability> => {
  if (Platform.OS === 'web') {
    return {
      available: false,
      biometryType: null,
      error: 'Biometric authentication is not supported on web',
    };
  }

  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) {
      return {
        available: false,
        biometryType: null,
        error: 'Biometric hardware is not available on this device',
      };
    }

    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (!isEnrolled) {
      return {
        available: false,
        biometryType: null,
        error: 'No biometric credentials enrolled on this device',
      };
    }

    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    let biometryType: BiometricType = BiometricType.FINGERPRINT;

    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      biometryType = BiometricType.FACE_ID;
    } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      biometryType = BiometricType.FINGERPRINT;
    } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      biometryType = BiometricType.IRIS;
    }

    return {
      available: true,
      biometryType,
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
    return availability.available;
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
