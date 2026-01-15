/**
 * Notifications Hooks
 * Custom hooks for notification management
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Notification,
  NotificationPreferences,
  NotificationsState,
  UpdatePreferencesRequest,
  RegisterPushTokenRequest,
} from './notifications.types';
import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  trackNotificationClick,
  dismissNotification,
  getNotificationPreferences,
  updateNotificationPreferences,
  registerPushToken,
  unregisterPushToken,
  sendTestNotification,
} from '../../core/services/notifications/notificationsService';
import { DEFAULT_PAGE_SIZE } from './notifications.constants';

/**
 * Hook to manage notifications list
 */
export const useNotifications = () => {
  const [state, setState] = useState<NotificationsState>({
    notifications: [],
    unreadCount: 0,
    preferences: null,
    pushTokens: [],
    isLoading: false,
    isFetching: false,
    isUpdating: false,
    error: null,
    hasMore: true,
    page: 1,
  });

  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  /**
   * Fetch notifications with pagination
   */
  const fetchNotifications = useCallback(
    async (page = 1, append = false) => {
      if (!isMounted.current) return;

      setState(prev => ({
        ...prev,
        isFetching: true,
        error: null,
      }));

      try {
        const data = await getNotifications({
          page,
          limit: DEFAULT_PAGE_SIZE,
        });

        if (!isMounted.current) return;

        setState(prev => ({
          ...prev,
          notifications: append
            ? [...prev.notifications, ...data.notifications]
            : data.notifications,
          hasMore: data.hasMore,
          page,
          isFetching: false,
        }));
      } catch (error: any) {
        if (!isMounted.current) return;

        setState(prev => ({
          ...prev,
          error: error.message || 'Failed to fetch notifications',
          isFetching: false,
        }));
      }
    },
    []
  );

  /**
   * Refresh notifications (pull-to-refresh)
   */
  const refreshNotifications = useCallback(async () => {
    await fetchNotifications(1, false);
  }, [fetchNotifications]);

  /**
   * Load more notifications (pagination)
   */
  const loadMoreNotifications = useCallback(async () => {
    if (state.isFetching || !state.hasMore) return;
    await fetchNotifications(state.page + 1, true);
  }, [state.isFetching, state.hasMore, state.page, fetchNotifications]);

  /**
   * Fetch unread count
   */
  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await getUnreadCount();

      if (!isMounted.current) return;

      setState(prev => ({
        ...prev,
        unreadCount: count,
      }));
    } catch (error: any) {
      console.error('Failed to fetch unread count:', error);
    }
  }, []);

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback(async (notificationId: string) => {
    setState(prev => ({
      ...prev,
      isUpdating: true,
    }));

    try {
      await markNotificationAsRead(notificationId);

      if (!isMounted.current) return;

      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(n =>
          n.id === notificationId
            ? {
              ...n,
              channels: {
                ...n.channels,
                inApp: {
                  ...n.channels.inApp,
                  readAt: new Date().toISOString(),
                },
              },
            }
            : n
        ),
        unreadCount: Math.max(0, prev.unreadCount - 1),
        isUpdating: false,
      }));
    } catch (error: any) {
      if (!isMounted.current) return;

      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to mark notification as read',
        isUpdating: false,
      }));
    }
  }, []);

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async () => {
    setState(prev => ({
      ...prev,
      isUpdating: true,
    }));

    try {
      await markAllNotificationsAsRead();

      if (!isMounted.current) return;

      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(n => ({
          ...n,
          channels: {
            ...n.channels,
            inApp: {
              ...n.channels.inApp,
              readAt: new Date().toISOString(),
            },
          },
        })),
        unreadCount: 0,
        isUpdating: false,
      }));
    } catch (error: any) {
      if (!isMounted.current) return;

      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to mark all notifications as read',
        isUpdating: false,
      }));
    }
  }, []);

  /**
   * Track notification click
   */
  const trackClick = useCallback(async (notificationId: string) => {
    try {
      await trackNotificationClick(notificationId);

      if (!isMounted.current) return;

      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(n =>
          n.id === notificationId
            ? {
              ...n,
              analytics: {
                ...n.analytics,
                clicked: true,
                clickedAt: new Date().toISOString(),
              },
            }
            : n
        ),
      }));
    } catch (error: any) {
      console.error('Failed to track notification click:', error);
    }
  }, []);

  /**
   * Dismiss notification
   */
  const dismiss = useCallback(async (notificationId: string) => {
    setState(prev => ({
      ...prev,
      isUpdating: true,
    }));

    try {
      await dismissNotification(notificationId);

      if (!isMounted.current) return;

      setState(prev => ({
        ...prev,
        notifications: prev.notifications.filter(n => n.id !== notificationId),
        unreadCount: Math.max(
          0,
          prev.unreadCount -
          (prev.notifications.find(n => n.id === notificationId)?.channels.inApp
            .readAt
            ? 0
            : 1)
        ),
        isUpdating: false,
      }));
    } catch (error: any) {
      if (!isMounted.current) return;

      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to dismiss notification',
        isUpdating: false,
      }));
    }
  }, []);

  /**
   * Initial load
   */
  useEffect(() => {
    fetchNotifications(1, false);
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  return {
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    isLoading: state.isLoading,
    isFetching: state.isFetching,
    isUpdating: state.isUpdating,
    error: state.error,
    hasMore: state.hasMore,
    refreshNotifications,
    loadMoreNotifications,
    markAsRead,
    markAllAsRead,
    trackClick,
    dismiss,
  };
};

/**
 * Hook to manage notification preferences
 */
export const useNotificationPreferences = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  /**
   * Fetch preferences
   */
  const fetchPreferences = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getNotificationPreferences();

      if (!isMounted.current) return;

      setPreferences(data);
      setIsLoading(false);
    } catch (err: any) {
      if (!isMounted.current) return;

      setError(err.message || 'Failed to fetch notification preferences');
      setIsLoading(false);
    }
  }, []);

  /**
   * Update preferences
   */
  const updatePreferences = useCallback(
    async (updates: UpdatePreferencesRequest) => {
      setIsUpdating(true);
      setError(null);

      try {
        const data = await updateNotificationPreferences(updates);

        if (!isMounted.current) return;

        setPreferences(data);
        setIsUpdating(false);
      } catch (err: any) {
        if (!isMounted.current) return;

        setError(err.message || 'Failed to update notification preferences');
        setIsUpdating(false);
      }
    },
    []
  );

  /**
   * Initial load
   */
  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  return {
    preferences,
    isLoading,
    isUpdating,
    error,
    updatePreferences,
    refreshPreferences: fetchPreferences,
  };
};

/**
 * Hook to manage push notification tokens
 */
export const usePushNotifications = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Register push token
   */
  const registerToken = useCallback(async (tokenData: RegisterPushTokenRequest) => {
    setIsRegistering(true);
    setError(null);

    try {
      await registerPushToken(tokenData);
      setIsRegistering(false);
    } catch (err: any) {
      setError(err.message || 'Failed to register push token');
      setIsRegistering(false);
      throw err;
    }
  }, []);

  /**
   * Unregister push token
   */
  const unregisterToken = useCallback(async (token: string) => {
    setIsRegistering(true);
    setError(null);

    try {
      await unregisterPushToken(token);
      setIsRegistering(false);
    } catch (err: any) {
      setError(err.message || 'Failed to unregister push token');
      setIsRegistering(false);
      throw err;
    }
  }, []);

  /**
   * Send test notification
   */
  const sendTest = useCallback(async () => {
    try {
      await sendTestNotification();
    } catch (err: any) {
      setError(err.message || 'Failed to send test notification');
      throw err;
    }
  }, []);

  return {
    isRegistering,
    error,
    registerToken,
    unregisterToken,
    sendTest,
  };
};

/**
 * Hook to manage unread badge count
 */
export const useUnreadBadge = () => {
  const [count, setCount] = useState(0);

  const fetchCount = useCallback(async () => {
    try {
      const unreadCount = await getUnreadCount();
      setCount(unreadCount);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  }, []);

  useEffect(() => {
    fetchCount();

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchCount, 30000);

    return () => clearInterval(interval);
  }, [fetchCount]);

  return {
    count,
    refresh: fetchCount,
  };
};
