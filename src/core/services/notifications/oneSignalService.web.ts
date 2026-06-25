/**
 * OneSignal Service (Web Implementation)
 * Handles OneSignal push notification integration for Web using react-onesignal
 */

import OneSignalWeb from 'react-onesignal';
import { registerPushToken } from './notificationsService';

// OneSignal App ID
const ONESIGNAL_APP_ID = process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID || '__ONESIGNAL_APP_ID__';

let isInitialized = false;

/**
 * Initialize OneSignal
 */
export const initializeOneSignal = async (userId?: string): Promise<void> => {
  if (isInitialized) {
    console.log('OneSignal Web already initialized');
    if (userId) await setOneSignalUserId(userId);
    return;
  }

  try {
    console.log('Current Browser Origin:', window.location.origin);
    console.log('Attempting OneSignal Web Init with ID:', ONESIGNAL_APP_ID);
    
    await OneSignalWeb.init({
      appId: ONESIGNAL_APP_ID,
      allowLocalhostAsSecureOrigin: true,
      notifyButton: {
        enable: false,
      } as any,
    });
    isInitialized = true;

    if (userId) {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        await OneSignalWeb.login(userId);
        console.log('OneSignal Web login successful for:', userId);
      } catch (loginError: any) {
        if (loginError.message?.includes('reading \'tt\'')) {
          console.warn('OneSignal Web: SDK internal state not ready for login (tt error).');
        } else {
          console.warn('OneSignal Web login failed:', loginError.message);
        }
      }
    }
    console.log('OneSignal Web initialization sequence finished');
  } catch (error: any) {
    console.error('Failed to initialize OneSignal Web:', error);
    if (error.message?.includes('already initialized')) {
      isInitialized = true;
    }
  }
};

/**
 * Set OneSignal user ID (external user ID)
 */
export const setOneSignalUserId = async (userId: string): Promise<void> => {
  try {
    await new Promise(resolve => setTimeout(resolve, 500));
    await OneSignalWeb.login(userId);
    console.log('OneSignal Web login successful for:', userId);
  } catch (loginError: any) {
    if (loginError.message?.includes('reading \'tt\'')) {
      console.warn('OneSignal Web: SDK internal state not ready for login (tt error).');
    } else {
      console.warn('OneSignal Web login failed:', loginError.message);
    }
  }
};

/**
 * Remove OneSignal user ID (on logout)
 */
export const removeOneSignalUserId = async (): Promise<void> => {
  try {
    await OneSignalWeb.logout();
    console.log('OneSignal Web user logged out');
  } catch (logoutError) {
    console.warn('OneSignal Web logout suppressed error:', logoutError);
  }
};

/**
 * Get OneSignal Player ID (device identifier)
 */
export const getOneSignalPlayerId = async (): Promise<string | null> => {
  try {
    return (OneSignalWeb.User as any).onesignalId || null;
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
    return (OneSignalWeb.User as any).pushSubscription?.token || null;
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

    const deviceId = 'web-device';
    const deviceModel = 'Web Browser';
    const systemVersion = 'N/A';
    const appVersion = '1.0.0';

    await registerPushToken({
      token: pushToken,
      deviceId: playerId,
      platform: 'web',
      deviceInfo: {
        model: deviceModel,
        osVersion: systemVersion,
        appVersion,
      },
    });

    console.log('OneSignal web device registered with backend');
  } catch (error) {
    console.error('Failed to register OneSignal web device:', error);
  }
};

/**
 * Set user tags (for segmentation)
 */
export const setOneSignalTags = async (tags: Record<string, string>): Promise<void> => {
  try {
    await OneSignalWeb.User.addTags(tags);
    console.log('OneSignal Web tags set:', tags);
  } catch (error) {
    console.error('Failed to set OneSignal Web tags:', error);
  }
};

/**
 * Remove user tags
 */
export const removeOneSignalTags = async (tagKeys: string[]): Promise<void> => {
  try {
    await OneSignalWeb.User.removeTags(tagKeys);
    console.log('OneSignal Web tags removed:', tagKeys);
  } catch (error) {
    console.error('Failed to remove OneSignal Web tags:', error);
  }
};

/**
 * Set user email (for email notifications)
 */
export const setOneSignalEmail = async (email: string): Promise<void> => {
  try {
    (OneSignalWeb.User as any).addEmail(email);
    console.log('OneSignal Web email set:', email);
  } catch (error) {
    console.error('Failed to set OneSignal Web email:', error);
  }
};

/**
 * Remove user email
 */
export const removeOneSignalEmail = async (email: string): Promise<void> => {
  try {
    (OneSignalWeb.User as any).removeEmail(email);
    console.log('OneSignal Web email removed');
  } catch (error) {
    console.error('Failed to remove OneSignal Web email:', error);
  }
};

/**
 * Set user SMS (for SMS notifications)
 */
export const setOneSignalSMS = async (phoneNumber: string): Promise<void> => {
  try {
    await (OneSignalWeb.User as any).addSms(phoneNumber);
    console.log('OneSignal Web SMS set:', phoneNumber);
  } catch (error) {
    console.error('Failed to set OneSignal Web SMS:', error);
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

  OneSignalWeb.Notifications.addEventListener('foregroundWillDisplay', (event: any) => {
    console.log('OneSignal Web notification will display:', event);
    if (onNotificationReceived) onNotificationReceived(event.notification);
  });

  OneSignalWeb.Notifications.addEventListener('click', (event: any) => {
    console.log('OneSignal Web notification clicked:', event);
    if (onNotificationOpened) {
      onNotificationOpened({
        notification: event.notification,
        action: event.result,
      });
    }
  });

  return () => {
    // Cleanup for web if needed
  };
};

/**
 * Check if notifications are enabled
 */
export const areNotificationsEnabled = async (): Promise<boolean> => {
  try {
    return OneSignalWeb.Notifications.permission;
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
    return await OneSignalWeb.Notifications.requestPermission();
  } catch (error) {
    console.error('Failed to request push permission:', error);
    return false;
  }
};

/**
 * Disable push notifications
 */
export const disablePushNotifications = async (): Promise<void> => {
  try {
    await (OneSignalWeb.User as any).pushSubscription.optOut();
    console.log('Push notifications disabled');
  } catch (error) {
    console.error('Failed to optOut push notifications on web:', error);
  }
};

/**
 * Enable push notifications
 */
export const enablePushNotifications = async (): Promise<void> => {
  try {
    await (OneSignalWeb.User as any).pushSubscription.optIn();
    console.log('Push notifications enabled');
  } catch (error) {
    console.error('Failed to optIn push notifications on web:', error);
  }
};

/**
 * Set notification categories
 */
export const setNotificationCategories = (categories: any[]): void => {
  console.log('Notification categories not applicable on web');
};

/**
 * Clear all OneSignal notifications
 */
export const clearAllOneSignalNotifications = (): void => {
  console.log('Clear all notifications not supported directly on web');
};

/**
 * Set language (for localized notifications)
 */
export const setOneSignalLanguage = (languageCode: string): void => {
  try {
    OneSignalWeb.User.setLanguage(languageCode);
    console.log('OneSignal Web language set:', languageCode);
  } catch (error) {
    console.error('Failed to set language on web:', error);
  }
};

/**
 * Trigger in-app message
 */
export const triggerInAppMessage = (triggerId: string): void => {
  try {
    (OneSignalWeb as any).InAppMessages.addTrigger(triggerId, 'true');
    console.log('In-app message triggered:', triggerId);
  } catch (error) {
    console.error('Failed to trigger in-app message on web:', error);
  }
};

/**
 * Pause in-app messages
 */
export const pauseInAppMessages = (): void => {
  try {
    (OneSignalWeb as any).InAppMessages.setPaused(true);
    console.log('In-app messages paused');
  } catch (error) {
    console.error('Failed to pause in-app messages on web:', error);
  }
};

/**
 * Resume in-app messages
 */
export const resumeInAppMessages = (): void => {
  try {
    (OneSignalWeb as any).InAppMessages.setPaused(false);
    console.log('In-app messages resumed');
  } catch (error) {
    console.error('Failed to resume in-app messages on web:', error);
  }
};

/**
 * Get notification history from OneSignal
 */
export const getOneSignalNotificationHistory = async (): Promise<any[]> => {
  return [];
};

/**
 * Send outcome (conversion tracking)
 */
export const sendOneSignalOutcome = async (
  outcomeName: string,
  value?: number
): Promise<void> => {
  try {
    (OneSignalWeb as any).Session.addOutcome(outcomeName, value);
    console.log('OneSignal Web outcome sent:', outcomeName, value);
  } catch (error) {
    console.error('Failed to send outcome:', error);
  }
};

/**
 * Set location
 */
export const setOneSignalLocation = async (
  latitude: number,
  longitude: number
): Promise<void> => {
  console.log('Location tracking handled automatically by OneSignal on web');
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
