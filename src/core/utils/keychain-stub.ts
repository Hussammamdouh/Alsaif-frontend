/**
 * React Native Keychain Stub
 * For Expo Go compatibility - keychain doesn't work in Expo Go
 * This stub prevents crashes and logs warnings
 */

export enum SECURITY_LEVEL {
  ANY = 'ANY',
  SECURE_SOFTWARE = 'SECURE_SOFTWARE',
  SECURE_HARDWARE = 'SECURE_HARDWARE',
}

export enum ACCESSIBLE {
  WHEN_UNLOCKED = 'AccessibleWhenUnlocked',
  AFTER_FIRST_UNLOCK = 'AccessibleAfterFirstUnlock',
  ALWAYS = 'AccessibleAlways',
  WHEN_PASSCODE_SET_THIS_DEVICE_ONLY = 'AccessibleWhenPasscodeSetThisDeviceOnly',
  WHEN_UNLOCKED_THIS_DEVICE_ONLY = 'AccessibleWhenUnlockedThisDeviceOnly',
  AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY = 'AccessibleAfterFirstUnlockThisDeviceOnly',
  ALWAYS_THIS_DEVICE_ONLY = 'AccessibleAlwaysThisDeviceOnly',
}

export enum ACCESS_CONTROL {
  USER_PRESENCE = 'UserPresence',
  BIOMETRY_ANY = 'BiometryAny',
  BIOMETRY_CURRENT_SET = 'BiometryCurrentSet',
  DEVICE_PASSCODE = 'DevicePasscode',
  APPLICATION_PASSWORD = 'ApplicationPassword',
  BIOMETRY_ANY_OR_DEVICE_PASSCODE = 'BiometryAnyOrDevicePasscode',
  BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE = 'BiometryCurrentSetOrDevicePasscode',
}

export enum AUTHENTICATION_TYPE {
  DEVICE_PASSCODE_OR_BIOMETRICS = 'AuthenticationWithBiometricsDevicePasscode',
  BIOMETRICS = 'AuthenticationWithBiometrics',
}

export enum BIOMETRY_TYPE {
  TOUCH_ID = 'TouchID',
  FACE_ID = 'FaceID',
  FINGERPRINT = 'Fingerprint',
  FACE = 'Face',
  IRIS = 'Iris',
}

export interface SetOptions {
  service?: string;
  accessible?: ACCESSIBLE;
  securityLevel?: SECURITY_LEVEL;
  accessControl?: ACCESS_CONTROL;
}

export interface GetOptions {
  service?: string;
  authenticationPrompt?: {
    title?: string;
    cancel?: string;
  };
  accessControl?: ACCESS_CONTROL;
}

const logWarning = (method: string) => {
  console.warn(`[Keychain Stub] ${method} called - not available in Expo Go. Build with EAS to enable.`);
};

export async function setGenericPassword(
  username: string,
  password: string,
  options?: any
): Promise<false | { service: string; storage: string }> {
  logWarning('setGenericPassword');
  return false;
}

export async function getGenericPassword(options?: any): Promise<false | { username: string; password: string; service: string; storage: string }> {
  logWarning('getGenericPassword');
  return false;
}

export async function resetGenericPassword(options?: any): Promise<boolean> {
  logWarning('resetGenericPassword');
  return true;
}

export async function setInternetCredentials(
  server: string,
  username: string,
  password: string,
  options?: any
): Promise<void> {
  logWarning('setInternetCredentials');
}

export async function getInternetCredentials(
  server: string,
  options?: any
): Promise<false | { username: string; password: string }> {
  logWarning('getInternetCredentials');
  return false;
}

export async function resetInternetCredentials(server: string, options?: any): Promise<void> {
  logWarning('resetInternetCredentials');
}

export async function getSupportedBiometryType(): Promise<BIOMETRY_TYPE | null> {
  logWarning('getSupportedBiometryType');
  return null;
}

export async function canImplyAuthentication(options?: any): Promise<boolean> {
  logWarning('canImplyAuthentication');
  return false;
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
