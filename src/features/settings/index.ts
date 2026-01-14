/**
 * Settings Feature Exports
 */

export { SettingsScreen } from './SettingsScreen';
export {
  useSettings,
  useNotificationSettings,
  useDeviceManagement,
} from './settings.hooks';
export type {
  UserSettings,
  NotificationPreferences,
  ActiveSession,
  ChangePasswordRequest,
  UpdateSettingsRequest,
  UpdateNotificationPreferencesRequest,
  SettingsState,
} from './settings.types';
export {
  LANGUAGE_OPTIONS,
  THEME_OPTIONS,
  SETTINGS_SECTIONS,
  BIOMETRIC_TYPES,
} from './settings.constants';
