/**
 * Settings Constants
 * Constants for settings feature
 */

export const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'العربية' }
] as const;

export const THEME_OPTIONS = [
  { value: 'light', label: 'Light', icon: 'sunny-outline' },
  { value: 'dark', label: 'Dark', icon: 'moon-outline' },
  { value: 'auto', label: 'Auto', icon: 'phone-portrait-outline' }
] as const;

export const SETTINGS_SECTIONS = {
  ACCOUNT: 'Account',
  APP: 'App Preferences',
  SECURITY: 'Security',
  NOTIFICATIONS: 'Notifications',
  ABOUT: 'About'
} as const;

export const BIOMETRIC_TYPES = {
  FINGERPRINT: 'Fingerprint',
  FACE_ID: 'Face ID',
  BIOMETRIC: 'Biometric'
} as const;
