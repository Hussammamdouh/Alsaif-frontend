/**
 * Push Notification Service
 * Handles Firebase Cloud Messaging (FCM) integration for push notifications
 */

import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { Platform, Alert, PermissionsAndroid } from 'react-native';
import notifee, { AndroidImportance, EventType } from '@notifee/react-native';
import DeviceInfo from 'react-native-device-info';
import { registerPushToken, unregisterPushToken } from './notificationsService';
import { getNotificationIcon, getNotificationColor } from '../../../features/notifications/notifications.mapper';

/**
 * Request notification permissions
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('iOS notification permission granted:', authStatus);
      } else {
        console.log('iOS notification permission denied');
      }

      return enabled;
    } else {
      // Android
      if (Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      // For Android < 13, notifications are enabled by default
      return true;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

/**
 * Get FCM token
 */
export const getFCMToken = async (): Promise<string | null> => {
  try {
    const token = await messaging().getToken();
    console.log('FCM Token:', token);
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
};

/**
 * Register device for push notifications
 */
export const registerDeviceForPushNotifications = async (): Promise<boolean> => {
  try {
    // Request permission
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      console.log('Notification permission not granted');
      return false;
    }

    // Get FCM token
    const token = await getFCMToken();
    if (!token) {
      console.error('Failed to get FCM token');
      return false;
    }

    // Get device info
    const deviceId = await DeviceInfo.getUniqueId();
    const deviceModel = await DeviceInfo.getModel();
    const systemVersion = await DeviceInfo.getSystemVersion();
    const appVersion = await DeviceInfo.getVersion();

    // Register with backend
    await registerPushToken({
      token,
      deviceId,
      platform: Platform.OS as 'ios' | 'android',
      deviceInfo: {
        model: deviceModel,
        osVersion: systemVersion,
        appVersion,
      },
    });

    console.log('Device registered for push notifications');
    return true;
  } catch (error) {
    console.error('Error registering device for push notifications:', error);
    return false;
  }
};

/**
 * Unregister device from push notifications
 */
export const unregisterDeviceFromPushNotifications = async (): Promise<void> => {
  try {
    const deviceId = await DeviceInfo.getUniqueId();
    await unregisterPushToken(deviceId);
    await messaging().deleteToken();
    console.log('Device unregistered from push notifications');
  } catch (error) {
    console.error('Error unregistering device from push notifications:', error);
  }
};

/**
 * Create notification channel (Android only)
 */
export const createNotificationChannel = async (
  channelId: string,
  channelName: string,
  importance: AndroidImportance = AndroidImportance.HIGH
): Promise<void> => {
  if (Platform.OS === 'android') {
    try {
      await notifee.createChannel({
        id: channelId,
        name: channelName,
        importance,
        sound: 'default',
        vibration: true,
      });
    } catch (error) {
      console.error('Error creating notification channel:', error);
    }
  }
};

/**
 * Initialize default notification channels (Android)
 */
export const initializeNotificationChannels = async (): Promise<void> => {
  if (Platform.OS === 'android') {
    await createNotificationChannel(
      'default',
      'Default Notifications',
      AndroidImportance.HIGH
    );
    await createNotificationChannel(
      'subscription',
      'Subscription Updates',
      AndroidImportance.HIGH
    );
    await createNotificationChannel(
      'content',
      'New Content',
      AndroidImportance.DEFAULT
    );
    await createNotificationChannel(
      'engagement',
      'Engagement',
      AndroidImportance.DEFAULT
    );
    await createNotificationChannel(
      'premium',
      'Premium Content',
      AndroidImportance.HIGH
    );
    await createNotificationChannel(
      'system',
      'System Alerts',
      AndroidImportance.HIGH
    );
    await createNotificationChannel(
      'marketing',
      'Promotions',
      AndroidImportance.LOW
    );
  }
};

/**
 * Display local notification using Notifee
 */
export const displayLocalNotification = async (
  notification: FirebaseMessagingTypes.RemoteMessage
): Promise<void> => {
  try {
    const { title, body, data } = notification;
    const notificationType = data?.type || 'default';
    const channelId = data?.channelId || 'default';

    await notifee.displayNotification({
      title: title || 'Vertex Capital',
      body: body || '',
      data,
      android: {
        channelId,
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: 'default',
          launchActivity: 'default',
        },
        smallIcon: 'ic_notification',
        color: getNotificationColor(notificationType),
      },
      ios: {
        sound: 'default',
        badgeCount: data?.badgeCount ? parseInt(data.badgeCount, 10) : undefined,
      },
    });
  } catch (error) {
    console.error('Error displaying local notification:', error);
  }
};

/**
 * Handle foreground notification
 */
export const handleForegroundNotification = (
  notification: FirebaseMessagingTypes.RemoteMessage,
  onNotificationReceived?: (notification: FirebaseMessagingTypes.RemoteMessage) => void
): void => {
  console.log('Foreground notification received:', notification);

  // Display notification
  displayLocalNotification(notification);

  // Call custom handler
  if (onNotificationReceived) {
    onNotificationReceived(notification);
  }
};

/**
 * Handle background notification
 */
export const handleBackgroundNotification = async (
  notification: FirebaseMessagingTypes.RemoteMessage
): Promise<void> => {
  console.log('Background notification received:', notification);
  await displayLocalNotification(notification);
};

/**
 * Handle notification opened (user tapped on notification)
 */
export const handleNotificationOpened = (
  remoteMessage: FirebaseMessagingTypes.RemoteMessage | null,
  onNotificationOpened?: (data: any) => void
): void => {
  if (remoteMessage) {
    console.log('Notification opened:', remoteMessage);

    // Extract action URL from notification data
    const actionUrl = remoteMessage.data?.actionUrl;
    const notificationId = remoteMessage.data?.notificationId;

    if (onNotificationOpened) {
      onNotificationOpened({
        actionUrl,
        notificationId,
        data: remoteMessage.data,
      });
    }
  }
};

/**
 * Setup push notification listeners
 */
export const setupPushNotificationListeners = (handlers: {
  onNotificationReceived?: (notification: FirebaseMessagingTypes.RemoteMessage) => void;
  onNotificationOpened?: (data: any) => void;
  onTokenRefresh?: (token: string) => void;
}): (() => void) => {
  const {
    onNotificationReceived,
    onNotificationOpened,
    onTokenRefresh,
  } = handlers;

  // Foreground message listener
  const unsubscribeForeground = messaging().onMessage(notification => {
    handleForegroundNotification(notification, onNotificationReceived);
  });

  // Background/Quit state message handler (set in index.js)
  messaging().setBackgroundMessageHandler(handleBackgroundNotification);

  // Notification opened listener (when app is in background)
  const unsubscribeNotificationOpened = messaging().onNotificationOpenedApp(
    remoteMessage => {
      handleNotificationOpened(remoteMessage, onNotificationOpened);
    }
  );

  // Check if app was opened from a notification (when app was quit)
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      handleNotificationOpened(remoteMessage, onNotificationOpened);
    });

  // Token refresh listener
  const unsubscribeTokenRefresh = messaging().onTokenRefresh(async token => {
    console.log('FCM token refreshed:', token);

    try {
      const deviceId = await DeviceInfo.getUniqueId();
      const deviceModel = await DeviceInfo.getModel();
      const systemVersion = await DeviceInfo.getSystemVersion();
      const appVersion = await DeviceInfo.getVersion();

      await registerPushToken({
        token,
        deviceId,
        platform: Platform.OS as 'ios' | 'android',
        deviceInfo: {
          model: deviceModel,
          osVersion: systemVersion,
          appVersion,
        },
      });

      if (onTokenRefresh) {
        onTokenRefresh(token);
      }
    } catch (error) {
      console.error('Error handling token refresh:', error);
    }
  });

  // Notifee foreground event listener
  const unsubscribeNotifeeEvents = notifee.onForegroundEvent(
    ({ type, detail }) => {
      if (type === EventType.PRESS) {
        console.log('Notifee notification pressed:', detail.notification);
        const data = detail.notification?.data;
        if (data && onNotificationOpened) {
          onNotificationOpened(data);
        }
      }
    }
  );

  // Return cleanup function
  return () => {
    unsubscribeForeground();
    unsubscribeNotificationOpened();
    unsubscribeTokenRefresh();
    unsubscribeNotifeeEvents();
  };
};

/**
 * Set badge count (iOS only)
 */
export const setBadgeCount = async (count: number): Promise<void> => {
  if (Platform.OS === 'ios') {
    try {
      await notifee.setBadgeCount(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  }
};

/**
 * Get badge count (iOS only)
 */
export const getBadgeCount = async (): Promise<number> => {
  if (Platform.OS === 'ios') {
    try {
      return await notifee.getBadgeCount();
    } catch (error) {
      console.error('Error getting badge count:', error);
      return 0;
    }
  }
  return 0;
};

/**
 * Clear all notifications
 */
export const clearAllNotifications = async (): Promise<void> => {
  try {
    await notifee.cancelAllNotifications();
    if (Platform.OS === 'ios') {
      await notifee.setBadgeCount(0);
    }
  } catch (error) {
    console.error('Error clearing all notifications:', error);
  }
};
