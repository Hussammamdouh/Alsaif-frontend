/**
 * useNotificationSetup Hook
 * Unified hook for initializing both Firebase and OneSignal push notifications
 */

import { useEffect, useCallback } from 'react';
import { Platform, Linking } from 'react-native';
import {
  initializeNotificationChannels,
  registerDeviceForPushNotifications,
  setupPushNotificationListeners,
  setBadgeCount,
} from '../../core/services/notifications/pushNotificationService';
import {
  initializeOneSignal,
  setOneSignalUserId,
  removeOneSignalUserId,
  registerOneSignalDevice,
  setupOneSignalListeners,
  setOneSignalTags,
  setOneSignalEmail,
  sendOneSignalOutcome,
} from '../../core/services/notifications/oneSignalService';
import { getUnreadCount } from '../../core/services/notifications/notificationsService';

interface NotificationSetupConfig {
  userId?: string;
  userEmail?: string;
  userTags?: Record<string, string>;
  onNotificationReceived?: (notification: any) => void;
  onNotificationOpened?: (data: any) => void;
}

/**
 * Hook to setup push notifications (Firebase + OneSignal)
 */
export const useNotificationSetup = (config: NotificationSetupConfig = {}) => {
  const {
    userId,
    userEmail,
    userTags,
    onNotificationReceived,
    onNotificationOpened,
  } = config;

  /**
   * Handle notification opened/clicked
   */
  const handleNotificationOpened = useCallback(
    async (data: any) => {
      console.log('Notification opened:', data);

      // Track outcome in OneSignal
      if (data.notificationId) {
        await sendOneSignalOutcome('notification_opened');
      }

      // Parse action URL for deep linking
      if (data.actionUrl) {
        try {
          // Check if it's an internal deep link or external URL
          if (data.actionUrl.startsWith('http')) {
            // External URL
            const supported = await Linking.canOpenURL(data.actionUrl);
            if (supported) {
              await Linking.openURL(data.actionUrl);
            }
          } else {
            // Internal deep link - implement your navigation logic
            // Example: navigation.navigate(parseDeepLink(data.actionUrl));
            console.log('Navigate to:', data.actionUrl);
          }
        } catch (error) {
          console.error('Failed to handle deep link:', error);
        }
      }

      // Call custom handler
      if (onNotificationOpened) {
        onNotificationOpened(data);
      }
    },
    [onNotificationOpened]
  );

  /**
   * Handle notification received
   */
  const handleNotificationReceived = useCallback(
    async (notification: any) => {
      console.log('Notification received:', notification);

      // Update badge count
      try {
        const count = await getUnreadCount();
        if (Platform.OS === 'ios') {
          await setBadgeCount(count);
        }
      } catch (error) {
        console.error('Failed to update badge count:', error);
      }

      // Call custom handler
      if (onNotificationReceived) {
        onNotificationReceived(notification);
      }
    },
    [onNotificationReceived]
  );

  /**
   * Initialize notifications
   */
  const initializeNotifications = useCallback(async () => {
    try {
      console.log('Initializing push notifications...');

      // 1. Initialize Firebase
      await initializeNotificationChannels();

      // Only register with backend if we have a user
      if (userId) {
        await registerDeviceForPushNotifications();
      }

      // 2. Initialize OneSignal
      await initializeOneSignal(userId);

      // 3. Set user ID in OneSignal if provided
      if (userId) {
        await setOneSignalUserId(userId);
        await registerOneSignalDevice(userId);
      }

      // 4. Set user email in OneSignal if provided
      if (userEmail) {
        await setOneSignalEmail(userEmail);
      }

      // 5. Set user tags in OneSignal if provided
      if (userTags) {
        await setOneSignalTags(userTags);
      }

      // 6. Setup Firebase listeners
      const cleanupFirebase = setupPushNotificationListeners({
        onNotificationReceived: handleNotificationReceived,
        onNotificationOpened: handleNotificationOpened,
        onTokenRefresh: async (token) => {
          console.log('Firebase token refreshed:', token);
          if (userId) {
            await registerDeviceForPushNotifications();
          }
        },
      });

      // 7. Setup OneSignal listeners
      const cleanupOneSignal = setupOneSignalListeners({
        onNotificationReceived: handleNotificationReceived,
        onNotificationOpened: (event) => {
          handleNotificationOpened({
            notification: event.notification,
            actionUrl: event.notification?.additionalData?.actionUrl,
            notificationId: event.notification?.notificationId,
          });
        },
      });

      console.log('Push notifications initialized successfully');

      // Return cleanup function
      return () => {
        cleanupFirebase();
        cleanupOneSignal();
      };
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
      return () => { }; // Return empty cleanup function
    }
  }, [
    userId,
    userEmail,
    userTags,
    handleNotificationReceived,
    handleNotificationOpened,
  ]);

  /**
   * Cleanup on logout
   */
  const cleanupNotifications = useCallback(async () => {
    try {
      await removeOneSignalUserId();
      if (Platform.OS === 'ios') {
        await setBadgeCount(0);
      }
      console.log('Notifications cleanup complete');
    } catch (error) {
      console.error('Failed to cleanup notifications:', error);
    }
  }, []);

  /**
   * Update user tags
   */
  const updateUserTags = useCallback(async (tags: Record<string, string>) => {
    try {
      await setOneSignalTags(tags);
    } catch (error) {
      console.error('Failed to update user tags:', error);
    }
  }, []);

  /**
   * Initialize on mount
   */
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    initializeNotifications().then((cleanupFn) => {
      cleanup = cleanupFn;
    });

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [initializeNotifications]);

  return {
    cleanupNotifications,
    updateUserTags,
  };
};

/**
 * Hook for notification deep linking
 */
export const useNotificationDeepLinking = (
  onDeepLink: (url: string, data?: any) => void
) => {
  useEffect(() => {
    // Handle initial notification (app opened from quit state)
    const handleInitialNotification = async () => {
      // This is handled by the notification setup listeners
    };

    handleInitialNotification();
  }, [onDeepLink]);
};
