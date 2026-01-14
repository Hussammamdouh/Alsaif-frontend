/**
 * Settings Hooks
 * Custom hooks for settings feature
 */

import { useState, useCallback, useEffect } from 'react';
import {
  changePassword as changePasswordApi,
  updateSettings as updateSettingsApi,
  getNotificationPreferences as getNotificationPreferencesApi,
  updateNotificationPreferences as updateNotificationPreferencesApi,
  getActiveSessions as getActiveSessionsApi,
  revokeSession as revokeSessionApi,
  logoutAllDevices as logoutAllDevicesApi
} from '../../core/services/settings/settingsService';
import {
  SettingsState,
  ChangePasswordRequest,
  UpdateSettingsRequest,
  UpdateNotificationPreferencesRequest,
  ActiveSession
} from './settings.types';

const INITIAL_STATE: SettingsState = {
  settings: null,
  notificationPreferences: null,
  activeSessions: [],
  isLoading: false,
  isUpdating: false,
  error: null
};

/**
 * useSettings Hook
 * Manages settings state and operations
 */
export const useSettings = () => {
  const [state, setState] = useState<SettingsState>(INITIAL_STATE);

  /**
   * Load settings data
   */
  const loadSettings = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Settings are loaded from profile
      // This is just a placeholder for consistency
      setState(prev => ({
        ...prev,
        isLoading: false
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load settings';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
    }
  }, []);

  /**
   * Update settings
   */
  const updateSettings = useCallback(async (data: UpdateSettingsRequest) => {
    try {
      setState(prev => ({ ...prev, isUpdating: true, error: null }));

      const updatedSettings = await updateSettingsApi(data);

      setState(prev => ({
        ...prev,
        settings: updatedSettings,
        isUpdating: false
      }));

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update settings';
      setState(prev => ({
        ...prev,
        isUpdating: false,
        error: errorMessage
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * Change password
   */
  const changePassword = useCallback(async (data: ChangePasswordRequest) => {
    try {
      setState(prev => ({ ...prev, isUpdating: true, error: null }));

      await changePasswordApi(data);

      setState(prev => ({ ...prev, isUpdating: false }));

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to change password';
      setState(prev => ({
        ...prev,
        isUpdating: false,
        error: errorMessage
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  return {
    ...state,
    loadSettings,
    updateSettings,
    changePassword
  };
};

/**
 * useNotificationSettings Hook
 * Manages notification preferences
 */
export const useNotificationSettings = () => {
  const [state, setState] = useState<{
    preferences: SettingsState['notificationPreferences'];
    isLoading: boolean;
    isUpdating: boolean;
    error: string | null;
  }>({
    preferences: null,
    isLoading: false,
    isUpdating: false,
    error: null
  });

  /**
   * Load notification preferences
   */
  const loadPreferences = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const preferences = await getNotificationPreferencesApi();

      setState(prev => ({
        ...prev,
        preferences,
        isLoading: false
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to load notification preferences';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
    }
  }, []);

  /**
   * Update notification preferences
   */
  const updatePreferences = useCallback(
    async (data: UpdateNotificationPreferencesRequest) => {
      try {
        setState(prev => ({ ...prev, isUpdating: true, error: null }));

        const updatedPreferences = await updateNotificationPreferencesApi(data);

        setState(prev => ({
          ...prev,
          preferences: updatedPreferences,
          isUpdating: false
        }));

        return { success: true };
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to update notification preferences';
        setState(prev => ({
          ...prev,
          isUpdating: false,
          error: errorMessage
        }));
        return { success: false, error: errorMessage };
      }
    },
    []
  );

  /**
   * Initial load
   */
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  return {
    preferences: state.preferences,
    isLoading: state.isLoading,
    isUpdating: state.isUpdating,
    error: state.error,
    loadPreferences,
    updatePreferences
  };
};

/**
 * useDeviceManagement Hook
 * Manages active sessions/devices
 */
export const useDeviceManagement = () => {
  const [state, setState] = useState<{
    sessions: ActiveSession[];
    isLoading: boolean;
    isRevoking: boolean;
    error: string | null;
  }>({
    sessions: [],
    isLoading: false,
    isRevoking: false,
    error: null
  });

  /**
   * Load active sessions
   */
  const loadSessions = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const sessions = await getActiveSessionsApi();

      setState(prev => ({
        ...prev,
        sessions,
        isLoading: false
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to load active sessions';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
    }
  }, []);

  /**
   * Revoke a specific session
   */
  const revokeSession = useCallback(
    async (sessionId: string) => {
      try {
        setState(prev => ({ ...prev, isRevoking: true, error: null }));

        await revokeSessionApi(sessionId);

        // Remove the revoked session from state
        setState(prev => ({
          ...prev,
          sessions: prev.sessions.filter(s => s.id !== sessionId),
          isRevoking: false
        }));

        return { success: true };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to revoke session';
        setState(prev => ({
          ...prev,
          isRevoking: false,
          error: errorMessage
        }));
        return { success: false, error: errorMessage };
      }
    },
    []
  );

  /**
   * Logout from all devices
   */
  const logoutAllDevices = useCallback(async () => {
    console.log('[SettingsHooks] logoutAllDevices hook called');
    try {
      setState(prev => ({ ...prev, isRevoking: true, error: null }));

      await logoutAllDevicesApi();

      setState(prev => ({
        ...prev,
        sessions: [],
        isRevoking: false
      }));

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to logout from all devices';
      setState(prev => ({
        ...prev,
        isRevoking: false,
        error: errorMessage
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * Initial load
   */
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  return {
    sessions: state.sessions,
    isLoading: state.isLoading,
    isRevoking: state.isRevoking,
    error: state.error,
    loadSessions,
    revokeSession,
    logoutAllDevices
  };
};
