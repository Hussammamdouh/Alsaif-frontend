/**
 * Profile Hooks
 * Custom hooks for profile feature
 */

import { useState, useCallback, useEffect } from 'react';
import {
  getCurrentProfile,
  updateProfile as updateProfileApi,
  getSubscription
} from '../../core/services/profile/profileService';
import {
  ProfileState,
  UpdateProfileRequest
} from './profile.types';

const INITIAL_STATE: ProfileState = {
  profile: null,
  subscription: null,
  isLoading: false,
  isUpdating: false,
  error: null
};

/**
 * useProfile Hook
 * Manages profile state and operations
 */
export const useProfile = () => {
  const [state, setState] = useState<ProfileState>(INITIAL_STATE);

  /**
   * Load profile data
   */
  const loadProfile = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const [profile, subscription] = await Promise.all([
        getCurrentProfile(),
        getSubscription().catch(() => ({
          tier: 'free' as const,
          status: 'active' as const,
          startDate: null,
          endDate: null,
          autoRenew: false
        }))
      ]);

      setState(prev => ({
        ...prev,
        profile,
        subscription,
        isLoading: false
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load profile';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
    }
  }, []);

  /**
   * Update profile
   */
  const updateProfile = useCallback(async (data: UpdateProfileRequest) => {
    try {
      setState(prev => ({ ...prev, isUpdating: true, error: null }));

      const updatedProfile = await updateProfileApi(data);

      setState(prev => ({
        ...prev,
        profile: updatedProfile,
        isUpdating: false
      }));

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to update profile';
      setState(prev => ({
        ...prev,
        isUpdating: false,
        error: errorMessage
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  /**
   * Initial load
   */
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    ...state,
    loadProfile,
    updateProfile
  };
};
