/**
 * OneSignal Service
 * Handles OneSignal push notification integration for rich, customized notifications
 */

import { OneSignal } from 'react-native-onesignal';
import { Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { registerPushToken } from './notificationsService';

// OneSignal App ID - Replace with your actual OneSignal App ID
const ONESIGNAL_APP_ID = process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID || '__ONESIGNAL_APP_ID__';

// Track initialization status to prevent multiple init calls
let isWebInitialized = false;

/**
 * Initialize OneSignal
 */
export const initializeOneSignal = async (userId?: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      if (isWebInitialized) {
        console.log('OneSignal Web already initialized');
        if (userId) await setOneSignalUserId(userId);
        return;
      }

      const { default: OneSignalWeb } = await import('react-onesignal');
      console.log('Current Browser Origin:', window.location.origin);

      try {
        console.log('Attempting OneSignal Web Init with ID:', ONESIGNAL_APP_ID);
        await OneSignalWeb.init({
          appId: ONESIGNAL_APP_ID,
          allowLocalhostAsSecureOrigin: true,
          // Hide the default bell icon
          notifyButton: {
            enable: false,
          } as any,
        });
        isWebInitialized = true;
      } catch (initError: any) {
        console.error('OneSignal Web Init Catch:', initError.message);
        if (initError.message?.includes('already initialized')) {
          isWebInitialized = true;
          console.log('OneSignal Web detected previous initialization');
        } else if (initError.message?.includes('Can only be used on')) {
          console.error('ONESIGNAL DOMAIN MISMATCH: Please check your OneSignal Dashboard Settings.');
          console.error('If testing locally, ensure "Localhost Support" is enabled in OneSignal Web Push settings.');
          // Suppress error in console to prevent crash but log clearly
        } else {
          throw initError;
        }
      }

      if (userId) {
        await OneSignalWeb.login(userId);
      }
      console.log('OneSignal Web initialized successfully');
      return;
    }

    // Mobile (Native) Initialization
    // Remove this method to stop OneSignal Debugging
    OneSignal.Debug.setLogLevel(6);

    // OneSignal Initialization
    OneSignal.initialize(ONESIGNAL_APP_ID);

    // Request permission for push notifications (iOS)
    if (Platform.OS === 'ios') {
      const hasPermission = await OneSignal.Notifications.requestPermission(true);
      console.log('OneSignal iOS permission:', hasPermission);
    }

    // Set user ID if provided
    if (userId) {
      await setOneSignalUserId(userId);
    }

    console.log('OneSignal initialized successfully');
  } catch (error) {
    console.error('Failed to initialize OneSignal:', error);
    throw error;
  }
};

/**
 * Set OneSignal user ID (external user ID)
 */
export const setOneSignalUserId = async (userId: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      const { default: OneSignalWeb } = await import('react-onesignal');
      await OneSignalWeb.login(userId);
      return;
    }

    OneSignal.login(userId);
    console.log('OneSignal user ID set:', userId);

    // Also set as external user ID for backward compatibility
    OneSignal.User.addAlias('external_id', userId);
  } catch (error) {
    console.error('Failed to set OneSignal user ID:', error);
    throw error;
  }
};

/**
 * Remove OneSignal user ID (on logout)
 */
export const removeOneSignalUserId = async (): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      if (!isWebInitialized) {
        console.warn('OneSignal Web not initialized, skipping logout');
        return;
      }
      const { default: OneSignalWeb } = await import('react-onesignal');

      // Ensure we are logged in or have a state session before logging out
      // OneSignal Web sometimes throws if calling logout when already logged out or uninitialized
      try {
        await OneSignalWeb.logout();
      } catch (logoutError) {
        console.warn('OneSignal Web logout suppressed error:', logoutError);
      }
      return;
    }

    OneSignal.logout();
    console.log('OneSignal user logged out');
  } catch (error) {
    console.error('Failed to logout OneSignal user:', error);
  }
};

/**
 * Get OneSignal Player ID (device identifier)
 */
export const getOneSignalPlayerId = async (): Promise<string | null> => {
  try {
    const deviceState = await OneSignal.User.getOnesignalId();
    return deviceState || null;
  } catch (error) {
    console.error('Failed to get OneSignal player ID:', error);
    return null;
  }
};

/**
 * Get OneSignal push token
 */
export const getOneSignalPushToken = async (): Promise<string | null> => {
  try {
    const pushToken = OneSignal.User.pushSubscription.token;
    return pushToken || null;
  } catch (error) {
    console.error('Failed to get OneSignal push token:', error);
    return null;
  }
};

/**
 * Register device with backend (using OneSignal player ID)
 */
export const registerOneSignalDevice = async (userId: string): Promise<void> => {
  try {
    const playerId = await getOneSignalPlayerId();
    const pushToken = await getOneSignalPushToken();

    if (!playerId || !pushToken) {
      console.warn('OneSignal player ID or push token not available');
      return;
    }

    const deviceId = await DeviceInfo.getUniqueId();
    const deviceModel = await DeviceInfo.getModel();
    const systemVersion = await DeviceInfo.getSystemVersion();
    const appVersion = await DeviceInfo.getVersion();

    // Register with backend
    await registerPushToken({
      token: pushToken,
      deviceId: playerId, // Use OneSignal player ID
      platform: Platform.OS as 'ios' | 'android',
      deviceInfo: {
        model: deviceModel,
        osVersion: systemVersion,
        appVersion,
      },
    });

    console.log('OneSignal device registered with backend');
  } catch (error) {
    console.error('Failed to register OneSignal device:', error);
  }
};

/**
 * Set user tags (for segmentation)
 */
export const setOneSignalTags = async (tags: Record<string, string>): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      const { default: OneSignalWeb } = await import('react-onesignal');
      await OneSignalWeb.User.addTags(tags);
      return;
    }

    OneSignal.User.addTags(tags);
    console.log('OneSignal tags set:', tags);
  } catch (error) {
    console.error('Failed to set OneSignal tags:', error);
  }
};

/**
 * Remove user tags
 */
export const removeOneSignalTags = async (tagKeys: string[]): Promise<void> => {
  try {
    OneSignal.User.removeTags(tagKeys);
    console.log('OneSignal tags removed:', tagKeys);
  } catch (error) {
    console.error('Failed to remove OneSignal tags:', error);
  }
};

/**
 * Set user email (for email notifications)
 */
export const setOneSignalEmail = async (email: string): Promise<void> => {
  try {
    OneSignal.User.addEmail(email);
    console.log('OneSignal email set:', email);
  } catch (error) {
    console.error('Failed to set OneSignal email:', error);
  }
};

/**
 * Remove user email
 */
export const removeOneSignalEmail = async (email: string): Promise<void> => {
  try {
    OneSignal.User.removeEmail(email);
    console.log('OneSignal email removed');
  } catch (error) {
    console.error('Failed to remove OneSignal email:', error);
  }
};

/**
 * Set user SMS (for SMS notifications)
 */
export const setOneSignalSMS = async (phoneNumber: string): Promise<void> => {
  try {
    OneSignal.User.addSms(phoneNumber);
    console.log('OneSignal SMS set:', phoneNumber);
  } catch (error) {
    console.error('Failed to set OneSignal SMS:', error);
  }
};

/**
 * Setup notification event listeners
 */
export const setupOneSignalListeners = (handlers: {
  onNotificationReceived?: (notification: any) => void;
  onNotificationOpened?: (openedEvent: any) => void;
}): (() => void) => {
  const { onNotificationReceived, onNotificationOpened } = handlers;

  // Foreground notification received listener
  const foregroundListener = OneSignal.Notifications.addEventListener(
    'foregroundWillDisplay',
    (event: any) => {
      console.log('OneSignal notification will display:', event);

      if (onNotificationReceived) {
        onNotificationReceived(event.notification);
      }

      // Complete with null means the notification will show
      // Complete with notification means the notification will show with modifications
      event.preventDefault();
      event.notification.display();
    }
  );

  // Notification clicked/opened listener
  const clickListener = OneSignal.Notifications.addEventListener(
    'click',
    (event: any) => {
      console.log('OneSignal notification clicked:', event);

      if (onNotificationOpened) {
        onNotificationOpened({
          notification: event.notification,
          action: event.result,
        });
      }
    }
  );

  // Permission change listener
  const permissionListener = OneSignal.Notifications.addEventListener(
    'permissionChange',
    (permission: any) => {
      console.log('OneSignal permission changed:', permission);
    }
  );

  // Subscription change listener
  const subscriptionListener = OneSignal.User.pushSubscription.addEventListener(
    'change',
    (subscription: any) => {
      console.log('OneSignal subscription changed:', subscription);
    }
  );

  // Return cleanup function
  return () => {
    // Only native listeners need removal this way
    if (Platform.OS !== 'web') {
      try {
        (foregroundListener as any)?.remove?.();
        (clickListener as any)?.remove?.();
        (permissionListener as any)?.remove?.();
        (subscriptionListener as any)?.remove?.();
      } catch (e) {
        console.warn('Listener removal error:', e);
      }
    }
  };
};

/**
 * Check if notifications are enabled
 */
export const areNotificationsEnabled = async (): Promise<boolean> => {
  try {
    const permission = await OneSignal.Notifications.getPermissionAsync();
    return permission;
  } catch (error) {
    console.error('Failed to check notification permission:', error);
    return false;
  }
};

/**
 * Prompt for push notification permission
 */
export const promptForPushPermission = async (): Promise<boolean> => {
  try {
    const permission = await OneSignal.Notifications.requestPermission(true);
    return permission;
  } catch (error) {
    console.error('Failed to request push permission:', error);
    return false;
  }
};

/**
 * Disable push notifications
 */
export const disablePushNotifications = (): void => {
  OneSignal.User.pushSubscription.optOut();
  console.log('Push notifications disabled');
};

/**
 * Enable push notifications
 */
export const enablePushNotifications = (): void => {
  OneSignal.User.pushSubscription.optIn();
  console.log('Push notifications enabled');
};

/**
 * Set notification categories (iOS)
 */
export const setNotificationCategories = (categories: any[]): void => {
  if (Platform.OS === 'ios') {
    // OneSignal.setNotificationCategories(categories);
    console.log('Notification categories set');
  }
};

/**
 * Clear all OneSignal notifications
 */
export const clearAllOneSignalNotifications = (): void => {
  OneSignal.Notifications.clearAll();
  console.log('All OneSignal notifications cleared');
};

/**
 * Set language (for localized notifications)
 */
export const setOneSignalLanguage = (languageCode: string): void => {
  OneSignal.User.setLanguage(languageCode);
  console.log('OneSignal language set:', languageCode);
};

/**
 * Trigger in-app message
 */
export const triggerInAppMessage = (triggerId: string): void => {
  OneSignal.InAppMessages.addTrigger(triggerId, 'true');
  console.log('In-app message triggered:', triggerId);
};

/**
 * Pause in-app messages
 */
export const pauseInAppMessages = (): void => {
  OneSignal.InAppMessages.setPaused(true);
  console.log('In-app messages paused');
};

/**
 * Resume in-app messages
 */
export const resumeInAppMessages = (): void => {
  OneSignal.InAppMessages.setPaused(false);
  console.log('In-app messages resumed');
};

/**
 * Get notification history from OneSignal
 */
export const getOneSignalNotificationHistory = async (): Promise<any[]> => {
  try {
    // OneSignal doesn't provide a direct API for notification history
    // You'll need to implement this on your backend
    console.warn('Notification history should be fetched from your backend');
    return [];
  } catch (error) {
    console.error('Failed to get notification history:', error);
    return [];
  }
};

/**
 * Send outcome (conversion tracking)
 */
export const sendOneSignalOutcome = async (
  outcomeName: string,
  value?: number
): Promise<void> => {
  try {
    if (value !== undefined) {
      OneSignal.Session.addOutcome(outcomeName);
    } else {
      OneSignal.Session.addOutcome(outcomeName);
    }
    console.log('OneSignal outcome sent:', outcomeName, value);
  } catch (error) {
    console.error('Failed to send outcome:', error);
  }
};

/**
 * Set location (for location-based notifications)
 */
export const setOneSignalLocation = async (
  latitude: number,
  longitude: number
): Promise<void> => {
  try {
    // OneSignal automatically tracks location if permission granted
    // Manual location setting is not typically needed
    console.log('Location tracking handled automatically by OneSignal');
  } catch (error) {
    console.error('Failed to set location:', error);
  }
};

export default {
  initializeOneSignal,
  setOneSignalUserId,
  removeOneSignalUserId,
  getOneSignalPlayerId,
  getOneSignalPushToken,
  registerOneSignalDevice,
  setOneSignalTags,
  removeOneSignalTags,
  setOneSignalEmail,
  removeOneSignalEmail,
  setOneSignalSMS,
  setupOneSignalListeners,
  areNotificationsEnabled,
  promptForPushPermission,
  disablePushNotifications,
  enablePushNotifications,
  clearAllOneSignalNotifications,
  setOneSignalLanguage,
  triggerInAppMessage,
  pauseInAppMessages,
  resumeInAppMessages,
  sendOneSignalOutcome,
};
