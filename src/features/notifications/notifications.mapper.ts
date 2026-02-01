/**
 * Notifications Mapper
 * Maps and transforms notification data
 */

import { Notification } from './notifications.types';
import {
  NOTIFICATION_ICONS,
  NOTIFICATION_COLORS,
  NOTIFICATION_TITLES,
} from './notifications.constants';

/**
 * Get icon for notification type
 */
export const getNotificationIcon = (type: string): string => {
  return NOTIFICATION_ICONS[type] || 'notifications';
};

/**
 * Get color for notification type
 */
export const getNotificationColor = (type: string): string => {
  return NOTIFICATION_COLORS[type] || '#007aff';
};

/**
 * Get default title for notification type
 */
export const getNotificationTitle = (type: string, notification: Notification): string => {
  // Use the notification's own title if available
  if (notification.title) {
    return notification.title;
  }
  // Fall back to default title for the type
  return NOTIFICATION_TITLES[type] || 'Notification';
};

/**
 * Check if notification is unread
 */
export const isNotificationUnread = (notification: Notification): boolean => {
  return (
    notification.channels.inApp.enabled &&
    !notification.channels.inApp.readAt &&
    !notification.channels.inApp.dismissedAt
  );
};

/**
 * Format notification timestamp
 */
export const formatNotificationTime = (
  timestamp: string,
  t: (key: string, params?: Record<string, string | number>) => string,
  language: string = 'en'
): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) {
    return t('notifications.time.justNow');
  } else if (diffMins < 60) {
    return t('notifications.time.minsAgo', { count: diffMins });
  } else if (diffHours < 24) {
    return t('notifications.time.hoursAgo', { count: diffHours });
  } else if (diffDays < 7) {
    return t('notifications.time.daysAgo', { count: diffDays });
  } else {
    // Format as date
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
    };
    return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', options);
  }
};

/**
 * Get action URL from notification
 */
export const getNotificationActionUrl = (notification: Notification): string | null => {
  const url = notification.richContent?.actionUrl || notification.richContent?.metadata?.actionUrl || null;
  return url ? url.trim() : null;
};

/**
 * Get CTA buttons from notification
 */
export const getNotificationCTAButtons = (notification: Notification) => {
  return notification.richContent?.ctaButtons || [];
};

/**
 * Check if notification has action
 */
export const hasNotificationAction = (notification: Notification): boolean => {
  return !!(
    notification.richContent?.actionUrl ||
    notification.richContent?.ctaButtons?.length
  );
};

/**
 * Get notification category from type
 */
export const getNotificationCategory = (type: string): string => {
  if (type.startsWith('subscription:')) return 'subscription';
  if (type.startsWith('insight:')) return 'content';
  if (type.startsWith('engagement:')) return 'engagement';
  if (type.startsWith('premium:')) return 'premium';
  if (type.startsWith('system:')) return 'system';
  if (type.startsWith('marketing:')) return 'marketing';
  return 'other';
};

/**
 * Group notifications by date
 */
export const groupNotificationsByDate = (notifications: Notification[]) => {
  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  const groups: {
    today: Notification[];
    yesterday: Notification[];
    thisWeek: Notification[];
    older: Notification[];
  } = {
    today: [],
    yesterday: [],
    thisWeek: [],
    older: [],
  };

  safeNotifications.forEach(notification => {
    const notifDate = new Date(notification.createdAt);
    notifDate.setHours(0, 0, 0, 0);

    if (notifDate.getTime() === today.getTime()) {
      groups.today.push(notification);
    } else if (notifDate.getTime() === yesterday.getTime()) {
      groups.yesterday.push(notification);
    } else if (notifDate.getTime() >= lastWeek.getTime()) {
      groups.thisWeek.push(notification);
    } else {
      groups.older.push(notification);
    }
  });

  return groups;
};

/**
 * Filter notifications by category
 */
export const filterNotificationsByCategory = (
  notifications: Notification[],
  category: string
): Notification[] => {
  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  if (category === 'all') {
    return safeNotifications;
  }
  return safeNotifications.filter(n => getNotificationCategory(n.type) === category);
};

/**
 * Sort notifications by priority and date
 */
export const sortNotifications = (notifications: Notification[]): Notification[] => {
  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };

  return [...safeNotifications].sort((a, b) => {
    // First sort by read status (unread first)
    const aUnread = isNotificationUnread(a);
    const bUnread = isNotificationUnread(b);
    if (aUnread !== bUnread) {
      return aUnread ? -1 : 1;
    }

    // Then by priority
    const aPriority = priorityOrder[a.priority];
    const bPriority = priorityOrder[b.priority];
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }

    // Finally by date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};
