/**
 * Push Notification Service (Web Mock)
 * Prevents native Firebase/Notifee packages from crashing on Web
 */

export const requestNotificationPermission = async (): Promise<boolean> => {
  return true;
};

export const getFCMToken = async (): Promise<string | null> => {
  return null;
};

export const registerDeviceForPushNotifications = async (): Promise<boolean> => {
  return true;
};

export const unregisterDeviceFromPushNotifications = async (): Promise<void> => {
  return;
};

export const createNotificationChannel = async (
  channelId: string,
  channelName: string,
  importance?: any
): Promise<void> => {
  return;
};

export const initializeNotificationChannels = async (): Promise<void> => {
  return;
};

export const displayLocalNotification = async (
  notification: any
): Promise<void> => {
  return;
};

export const handleForegroundNotification = (
  notification: any,
  onNotificationReceived?: (notification: any) => void
): void => {
  if (onNotificationReceived) {
    onNotificationReceived(notification);
  }
};

export const handleBackgroundNotification = async (
  notification: any
): Promise<void> => {
  return;
};

export const handleNotificationOpened = (
  remoteMessage: any | null,
  onNotificationOpened?: (data: any) => void
): void => {
  if (remoteMessage && onNotificationOpened) {
    onNotificationOpened({
      actionUrl: remoteMessage.data?.actionUrl,
      notificationId: remoteMessage.data?.notificationId,
      data: remoteMessage.data,
    });
  }
};

export const setupPushNotificationListeners = (handlers: {
  onNotificationReceived?: (notification: any) => void;
  onNotificationOpened?: (data: any) => void;
  onTokenRefresh?: (token: string) => void;
}): (() => void) => {
  return () => {};
};

export const setBadgeCount = async (count: number): Promise<void> => {
  return;
};

export const getBadgeCount = async (): Promise<number> => {
  return 0;
};

export const clearAllNotifications = async (): Promise<void> => {
  return;
};
