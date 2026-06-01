/**
 * Smart Keychain Wrapper / Stub
 * Connects to the real react-native-keychain library on standalone builds
 * Falls back to stub behaviour on Expo Go or Web to prevent crashes
 */

import * as Keychain from 'react-native-keychain';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Determine if we should use the stub (only in Expo Go or Web)
const isExpoGo = Constants.appOwnership === 'expo';
const isWeb = Platform.OS === 'web';
const useStub = isExpoGo || isWeb;

const logWarning = (method: string) => {
  console.warn(`[Keychain] ${method} falling back to stub (running in Expo Go or Web).`);
};

// Re-export enums from the real library or fall back to stub definitions
export const SECURITY_LEVEL = Keychain.SECURITY_LEVEL || {
  ANY: 'ANY',
  SECURE_SOFTWARE: 'SECURE_SOFTWARE',
  SECURE_HARDWARE: 'SECURE_HARDWARE',
};

export const ACCESSIBLE = Keychain.ACCESSIBLE || {
  WHEN_UNLOCKED: 'AccessibleWhenUnlocked',
  AFTER_FIRST_UNLOCK: 'AccessibleAfterFirstUnlock',
  ALWAYS: 'AccessibleAlways',
  WHEN_PASSCODE_SET_THIS_DEVICE_ONLY: 'AccessibleWhenPasscodeSetThisDeviceOnly',
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'AccessibleWhenUnlockedThisDeviceOnly',
  AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 'AccessibleAfterFirstUnlockThisDeviceOnly',
  ALWAYS_THIS_DEVICE_ONLY: 'AccessibleAlwaysThisDeviceOnly',
};

export const ACCESS_CONTROL = Keychain.ACCESS_CONTROL || {
  USER_PRESENCE: 'UserPresence',
  BIOMETRY_ANY: 'BiometryAny',
  BIOMETRY_CURRENT_SET: 'BiometryCurrentSet',
  DEVICE_PASSCODE: 'DevicePasscode',
  APPLICATION_PASSWORD: 'ApplicationPassword',
  BIOMETRY_ANY_OR_DEVICE_PASSCODE: 'BiometryAnyOrDevicePasscode',
  BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE: 'BiometryCurrentSetOrDevicePasscode',
};

export const AUTHENTICATION_TYPE = Keychain.AUTHENTICATION_TYPE || {
  DEVICE_PASSCODE_OR_BIOMETRICS: 'AuthenticationWithBiometricsDevicePasscode',
  BIOMETRICS: 'AuthenticationWithBiometrics',
};

export const BIOMETRY_TYPE = Keychain.BIOMETRY_TYPE || {
  TOUCH_ID: 'TouchID',
  FACE_ID: 'FaceID',
  FINGERPRINT: 'Fingerprint',
  FACE: 'Face',
  IRIS: 'Iris',
};

export type BIOMETRY_TYPE = Keychain.BIOMETRY_TYPE;

export async function setGenericPassword(
  username: string,
  password: string,
  options?: any
): Promise<any> {
  if (useStub) {
    logWarning('setGenericPassword');
    return false;
  }
  return Keychain.setGenericPassword(username, password, options);
}

export async function getGenericPassword(options?: any): Promise<any> {
  if (useStub) {
    logWarning('getGenericPassword');
    return false;
  }
  return Keychain.getGenericPassword(options);
}

export async function resetGenericPassword(options?: any): Promise<boolean> {
  if (useStub) {
    logWarning('resetGenericPassword');
    return true;
  }
  return Keychain.resetGenericPassword(options);
}

export async function setInternetCredentials(
  server: string,
  username: string,
  password: string,
  options?: any
): Promise<any> {
  if (useStub) {
    logWarning('setInternetCredentials');
    return;
  }
  return Keychain.setInternetCredentials(server, username, password, options);
}

export async function getInternetCredentials(
  server: string,
  options?: any
): Promise<any> {
  if (useStub) {
    logWarning('getInternetCredentials');
    return false;
  }
  return Keychain.getInternetCredentials(server, options);
}

export async function resetInternetCredentials(server: string, options?: any): Promise<void> {
  if (useStub) {
    logWarning('resetInternetCredentials');
    return;
  }
  return Keychain.resetInternetCredentials(server, options);
}

export async function getSupportedBiometryType(): Promise<any> {
  if (useStub) {
    logWarning('getSupportedBiometryType');
    return null;
  }
  try {
    return await Keychain.getSupportedBiometryType();
  } catch (err) {
    console.error('[Keychain] Error getting supported biometry type:', err);
    return null;
  }
}

export async function canImplyAuthentication(options?: any): Promise<boolean> {
  if (useStub) {
    logWarning('canImplyAuthentication');
    return false;
  }
  return Keychain.canImplyAuthentication(options);
}

export default {
  SECURITY_LEVEL,
  ACCESSIBLE,
  ACCESS_CONTROL,
  AUTHENTICATION_TYPE,
  BIOMETRY_TYPE,
  setGenericPassword,
  getGenericPassword,
  resetGenericPassword,
  setInternetCredentials,
  getInternetCredentials,
  resetInternetCredentials,
  getSupportedBiometryType,
  canImplyAuthentication,
};
