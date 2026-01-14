/**
 * Notifications Types
 * Type definitions for notifications feature
 */

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';
export type NotificationStatus = 'pending' | 'processing' | 'sent' | 'partial' | 'failed';
export type ChannelStatus = 'pending' | 'sent' | 'failed' | 'skipped';

export interface NotificationChannel {
  enabled: boolean;
  status: ChannelStatus;
  sentAt?: string;
  attempts?: number;
  error?: string;
}

export interface InAppChannel extends NotificationChannel {
  readAt?: string;
  dismissedAt?: string;
}

export interface PushChannel extends NotificationChannel {
  tokens?: string[];
}

export interface EmailChannel extends NotificationChannel {
  emailAddress?: string;
}

export interface SmsChannel extends NotificationChannel {
  phoneNumber?: string;
}

export interface NotificationChannels {
  email: EmailChannel;
  push: PushChannel;
  sms: SmsChannel;
  inApp: InAppChannel;
}

export interface RichContent {
  imageUrl?: string;
  actionUrl?: string;
  actionText?: string;
  ctaButtons?: Array<{
    text: string;
    url: string;
    style?: 'primary' | 'secondary' | 'danger';
  }>;
  metadata?: Record<string, any>;
}

export interface NotificationAnalytics {
  clicked: boolean;
  clickedAt?: string;
  converted: boolean;
  convertedAt?: string;
}

export interface Notification {
  id: string;
  recipient: string;
  type: string;
  priority: NotificationPriority;
  title: string;
  body: string;
  richContent?: RichContent;
  channels: NotificationChannels;
  overallStatus: NotificationStatus;
  scheduledFor?: string;
  expiresAt?: string;
  retryable: boolean;
  maxRetries: number;
  nextRetryAt?: string;
  analytics: NotificationAnalytics;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreferenceChannel {
  enabled: boolean;
  channels: Array<'email' | 'push' | 'sms' | 'inApp'>;
  frequency?: 'instant' | 'hourly' | 'daily' | 'weekly';
  daysBeforeExpiry?: number[];
}

export interface NotificationPreferences {
  subscription: {
    lifecycle: NotificationPreferenceChannel;
    reminders: NotificationPreferenceChannel;
    renewals: NotificationPreferenceChannel;
    cancellations: NotificationPreferenceChannel;
    upgrades: NotificationPreferenceChannel;
  };
  content: {
    newInsights: NotificationPreferenceChannel;
    featuredInsights: NotificationPreferenceChannel;
    trendingContent: NotificationPreferenceChannel;
    savedContent: NotificationPreferenceChannel;
  };
  engagement: {
    likes: NotificationPreferenceChannel;
    comments: NotificationPreferenceChannel;
    follows: NotificationPreferenceChannel;
    mentions: NotificationPreferenceChannel;
  };
  premium: {
    exclusiveContent: NotificationPreferenceChannel;
    earlyAccess: NotificationPreferenceChannel;
    specialOffers: NotificationPreferenceChannel;
  };
  system: {
    welcome: NotificationPreferenceChannel;
    securityAlerts: NotificationPreferenceChannel;
    accountActivity: NotificationPreferenceChannel;
    policyChanges: NotificationPreferenceChannel;
  };
  marketing: {
    promotions: NotificationPreferenceChannel;
    newsletter: NotificationPreferenceChannel;
    surveys: NotificationPreferenceChannel;
  };
  globalSettings: {
    pushEnabled: boolean;
    emailEnabled: boolean;
    smsEnabled: boolean;
    quietHours: {
      enabled: boolean;
      start: string; // HH:MM format
      end: string; // HH:MM format
      timezone: string;
    };
  };
}

export interface PushToken {
  token: string;
  deviceId: string;
  platform: 'ios' | 'android';
  deviceInfo?: {
    model?: string;
    osVersion?: string;
    appVersion?: string;
  };
}

export interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreferences | null;
  pushTokens: PushToken[];
  isLoading: boolean;
  isFetching: boolean;
  isUpdating: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
}

// API Response Types
export interface GetNotificationsResponse {
  success: boolean;
  message?: string;
  data: {
    notifications: Notification[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

export interface GetUnreadCountResponse {
  success: boolean;
  message?: string;
  data: {
    count: number;
  };
}

export interface GetPreferencesResponse {
  success: boolean;
  message?: string;
  data: {
    preferences: NotificationPreferences;
  };
}

export interface UpdatePreferencesRequest {
  subscription?: Partial<NotificationPreferences['subscription']>;
  content?: Partial<NotificationPreferences['content']>;
  engagement?: Partial<NotificationPreferences['engagement']>;
  premium?: Partial<NotificationPreferences['premium']>;
  system?: Partial<NotificationPreferences['system']>;
  marketing?: Partial<NotificationPreferences['marketing']>;
  globalSettings?: Partial<NotificationPreferences['globalSettings']>;
}

export interface UpdatePreferencesResponse {
  success: boolean;
  message?: string;
  data: {
    preferences: NotificationPreferences;
  };
}

export interface RegisterPushTokenRequest {
  token: string;
  deviceId: string;
  platform: 'ios' | 'android';
  deviceInfo?: {
    model?: string;
    osVersion?: string;
    appVersion?: string;
  };
}

export interface RegisterPushTokenResponse {
  success: boolean;
  message?: string;
}

export interface MarkAsReadResponse {
  success: boolean;
  message?: string;
}

export interface TrackClickResponse {
  success: boolean;
  message?: string;
}

export interface DismissNotificationResponse {
  success: boolean;
  message?: string;
}
