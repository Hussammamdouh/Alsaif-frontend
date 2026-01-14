/**
 * Settings Types
 * Type definitions for app settings feature
 */

export interface UserSettings {
  biometricEnabled: boolean;
  language: 'en' | 'ar' | 'fr' | 'es' | 'de';
  theme: 'light' | 'dark' | 'auto';
  chat: {
    muteGroups: boolean;
    readReceipts: boolean;
  };
}

export interface NotificationPreferences {
  subscription: {
    renewals: boolean;
    cancellations: boolean;
    upgrades: boolean;
  };
  content: {
    newInsights: boolean;
    savedContent: boolean;
  };
  engagement: {
    likes: boolean;
    comments: boolean;
    follows: boolean;
  };
  premium: {
    exclusiveContent: boolean;
    earlyAccess: boolean;
  };
  system: {
    securityAlerts: boolean;
    accountActivity: boolean;
    policyChanges: boolean;
  };
  marketing: {
    promotions: boolean;
    newsletter: boolean;
  };
  globalSettings: {
    pushEnabled: boolean;
    emailEnabled: boolean;
    smsEnabled: boolean;
  };
}

export interface ActiveSession {
  id: string;
  deviceInfo: {
    userAgent: string;
    browser: string;
    os: string;
    device: string;
  };
  ip: string;
  createdAt: string;
  lastUsedAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateSettingsRequest {
  biometricEnabled?: boolean;
  language?: 'en' | 'ar' | 'fr' | 'es' | 'de';
  theme?: 'light' | 'dark' | 'auto';
  chat?: {
    muteGroups?: boolean;
    readReceipts?: boolean;
  };
}

export interface ChangePasswordResponse {
  success: boolean;
  message?: string;
}

export interface UpdateSettingsResponse {
  success: boolean;
  message?: string;
  data: {
    settings: UserSettings;
  };
}

export interface GetSessionsResponse {
  success: boolean;
  message?: string;
  data: {
    sessions: ActiveSession[];
    total: number;
  };
}

export interface SettingsState {
  settings: UserSettings | null;
  notificationPreferences: NotificationPreferences | null;
  activeSessions: ActiveSession[];
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
}
