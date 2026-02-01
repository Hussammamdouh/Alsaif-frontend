/**
 * Settings Service
 * Handles settings-related API calls
 */

import { apiClient } from '../api/apiClient';
import {
  UserSettings,
  NotificationPreferences,
  ActiveSession,
  ChangePasswordRequest,
  ChangePasswordResponse,
  UpdateSettingsRequest,
  UpdateSettingsResponse,
  GetSessionsResponse
} from '../../../features/settings/settings.types';

/**
 * Change password
 */
export const changePassword = async (
  data: ChangePasswordRequest
): Promise<void> => {
  const response = await apiClient.post<ChangePasswordResponse>(
    '/api/auth/change-password',
    data
  );

  if (!response.success) {
    throw new Error(response.message || 'Failed to change password');
  }
};

/**
 * Update user settings
 */
export const updateSettings = async (
  data: UpdateSettingsRequest
): Promise<UserSettings> => {
  const response = await apiClient.patch<UpdateSettingsResponse>(
    '/api/users/me/settings',
    data
  );

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to update settings');
  }

  return response.data.settings;
};

/**
 * Get notification preferences
 */
export const getNotificationPreferences = async (): Promise<NotificationPreferences> => {
  const response = await apiClient.get<{
    success: boolean;
    message?: string;
    data: { preferences: NotificationPreferences };
  }>('/api/notifications/preferences');

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to fetch notification preferences');
  }

  return response.data.preferences;
};

/**
 * Update notification preferences
 */
export const updateNotificationPreferences = async (
  preferences: Partial<NotificationPreferences>
): Promise<NotificationPreferences> => {
  const response = await apiClient.patch<{
    success: boolean;
    message?: string;
    data: { preferences: NotificationPreferences };
  }>('/api/notifications/preferences', preferences);

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to update notification preferences');
  }

  return response.data.preferences;
};

/**
 * Get active sessions
 */
export const getActiveSessions = async (): Promise<ActiveSession[]> => {
  const response = await apiClient.get<GetSessionsResponse>(
    '/api/users/me/sessions'
  );

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to fetch active sessions');
  }

  return response.data.sessions;
};

/**
 * Revoke a specific session
 */
export const revokeSession = async (sessionId: string): Promise<void> => {
  const response = await apiClient.delete<{ success: boolean; message?: string }>(
    `/api/users/me/sessions/${sessionId}`
  );

  if (!response.success) {
    throw new Error(response.message || 'Failed to revoke session');
  }
};

/**
 * Logout from all devices
 */
export const logoutAllDevices = async (): Promise<void> => {
  console.log('[SettingsService] logoutAllDevices called');
  try {
    const response = await apiClient.post<{ success: boolean; message?: string }>(
      '/api/auth/logout-all'
    );

    console.log('[SettingsService] logoutAllDevices response:', response);

    if (!response.success) {
      throw new Error(response.message || 'Failed to logout from all devices');
    }
  } catch (error) {
    console.error('[SettingsService] logoutAllDevices error:', error);
    throw error;
  }
};

/**
 * Request account deletion
 */
export const requestAccountDeletion = async (data: {
  password: string;
  reason?: string;
}): Promise<{ scheduledDeletionDate: string }> => {
  const response = await apiClient.post<{
    success: boolean;
    message?: string;
    data: { scheduledDeletionDate: string };
  }>('/api/users/me/delete-request', data);

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to request account deletion');
  }

  return response.data;
};

/**
 * Cancel account deletion
 */
export const cancelAccountDeletion = async (): Promise<void> => {
  const response = await apiClient.post<{ success: boolean; message?: string }>(
    '/api/users/me/cancel-deletion'
  );

  if (!response.success) {
    throw new Error(response.message || 'Failed to cancel account deletion');
  }
};

/**
 * Cancel user subscription
 */
export const cancelSubscription = async (reason?: string): Promise<void> => {
  const response = await apiClient.post<{ success: boolean; message?: string }>(
    '/api/subscriptions/cancel',
    { reason }
  );

  if (!response.success) {
    throw new Error(response.message || 'Failed to cancel subscription');
  }
};

/**
 * Export user data (GDPR compliance)
 */
export const exportUserData = async (): Promise<any> => {
  const response = await apiClient.get<{
    success: boolean;
    message?: string;
    data: any;
  }>('/api/users/me/export-data');

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to export user data');
  }

  return response.data;
};
