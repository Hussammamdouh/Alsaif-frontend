/**
 * Notifications Service
 * Handles all notification-related API calls
 */

import apiClient from '../api/apiClient';
import {
  GetNotificationsResponse,
  GetUnreadCountResponse,
  GetPreferencesResponse,
  UpdatePreferencesRequest,
  UpdatePreferencesResponse,
  RegisterPushTokenRequest,
  RegisterPushTokenResponse,
  MarkAsReadResponse,
  TrackClickResponse,
  DismissNotificationResponse,
  Notification,
  NotificationPreferences,
} from '../../../features/notifications/notifications.types';

/**
 * Get notification history with pagination
 */
export const getNotifications = async (params?: {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}): Promise<GetNotificationsResponse['data']> => {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.unreadOnly) queryParams.append('unreadOnly', 'true');

  const url = `/api/notifications/history${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiClient.get<any>(url);

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to fetch notifications');
  }

  // Map backend structure to frontend expectation
  const { notifications, pagination } = response.data;

  // Ensure all notifications have an 'id' field (mapped from _id if necessary)
  const mappedNotifications = (notifications || []).map((n: any) => ({
    ...n,
    id: n.id || n._id || '',
  }));

  return {
    notifications: mappedNotifications,
    total: pagination.total,
    page: pagination.page,
    limit: pagination.limit,
    hasMore: pagination.page < pagination.pages,
  };
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async (): Promise<number> => {
  const response = await apiClient.get<GetUnreadCountResponse>('/api/notifications/unread-count');

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to fetch unread count');
  }

  return response.data.count;
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  const response = await apiClient.patch<MarkAsReadResponse>(
    `/api/notifications/${notificationId}/read`
  );

  if (!response.success) {
    throw new Error(response.message || 'Failed to mark notification as read');
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (): Promise<void> => {
  const response = await apiClient.post<MarkAsReadResponse>(
    '/api/notifications/mark-all-read'
  );

  if (!response.success) {
    throw new Error(response.message || 'Failed to mark all notifications as read');
  }
};

/**
 * Track notification click
 */
export const trackNotificationClick = async (notificationId: string): Promise<void> => {
  if (!notificationId || notificationId === 'undefined') {
    console.warn('[NotificationsService] trackNotificationClick called with invalid ID:', notificationId);
    return;
  }

  const response = await apiClient.post<TrackClickResponse>(
    `/api/notifications/${notificationId}/click`
  );

  if (!response.success) {
    throw new Error(response.message || 'Failed to track notification click');
  }
};

/**
 * Dismiss a notification
 */
export const dismissNotification = async (notificationId: string): Promise<void> => {
  const response = await apiClient.delete<DismissNotificationResponse>(
    `/api/notifications/${notificationId}`
  );

  if (!response.success) {
    throw new Error(response.message || 'Failed to dismiss notification');
  }
};

/**
 * Get user notification preferences
 */
export const getNotificationPreferences = async (): Promise<NotificationPreferences> => {
  const response = await apiClient.get<GetPreferencesResponse>('/api/notifications/preferences');

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to fetch notification preferences');
  }

  return response.data.preferences;
};

/**
 * Update user notification preferences
 */
export const updateNotificationPreferences = async (
  preferences: UpdatePreferencesRequest
): Promise<NotificationPreferences> => {
  const response = await apiClient.patch<UpdatePreferencesResponse>(
    '/api/notifications/preferences',
    preferences
  );

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to update notification preferences');
  }

  return response.data.preferences;
};

/**
 * Register push notification token
 */
export const registerPushToken = async (
  tokenData: RegisterPushTokenRequest
): Promise<void> => {
  const response = await apiClient.post<RegisterPushTokenResponse>(
    '/api/notifications/push-token',
    tokenData
  );

  if (!response.success) {
    throw new Error(response.message || 'Failed to register push token');
  }
};

/**
 * Unregister push notification token
 */
export const unregisterPushToken = async (token: string): Promise<void> => {
  const response = await apiClient.delete<RegisterPushTokenResponse>(
    '/api/notifications/push-token',
    { data: { token } }
  );

  if (!response.success) {
    throw new Error(response.message || 'Failed to unregister push token');
  }
};

/**
 * Send a test notification
 */
export const sendTestNotification = async (): Promise<void> => {
  const response = await apiClient.post<{ success: boolean; message?: string }>(
    '/api/notifications/test'
  );

  if (!response.success) {
    throw new Error(response.message || 'Failed to send test notification');
  }
};
