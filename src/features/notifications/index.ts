/**
 * Notifications Feature
 * Public exports for notifications functionality
 */

export { default as NotificationsScreen } from './NotificationsScreen';

export {
  useNotifications,
  useNotificationPreferences,
  usePushNotifications,
  useUnreadBadge,
} from './notifications.hooks';

export type {
  Notification,
  NotificationPreferences,
  NotificationPreferenceChannel,
  NotificationPriority,
  NotificationStatus,
  NotificationChannels,
  RichContent,
  PushToken,
  UpdatePreferencesRequest,
  RegisterPushTokenRequest,
} from './notifications.types';

export {
  NOTIFICATION_EVENTS,
  NOTIFICATION_CATEGORIES,
  NOTIFICATION_ICONS,
  NOTIFICATION_COLORS,
  NOTIFICATION_TITLES,
  CHANNEL_LABELS,
  FREQUENCY_LABELS,
} from './notifications.constants';

export {
  getNotificationIcon,
  getNotificationColor,
  getNotificationTitle,
  isNotificationUnread,
  formatNotificationTime,
  getNotificationActionUrl,
  hasNotificationAction,
  getNotificationCategory,
  groupNotificationsByDate,
  filterNotificationsByCategory,
  sortNotifications,
} from './notifications.mapper';
