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
import { useAuth } from '../../app/auth';

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
  const { state: authState } = useAuth();
  const { isAuthenticated, session } = authState;
  const userId = session?.user?.id;

  /**
   * Load profile data
   */
  const loadProfile = useCallback(async () => {
    console.log('[useProfile] loadProfile called', { isAuthenticated, userId });

    if (!isAuthenticated) {
      console.log('[useProfile] Not authenticated, resetting state');
      setState(INITIAL_STATE);
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      console.log('[useProfile] Fetching profile and subscription...');

      const [profile, subscription] = await Promise.all([
        getCurrentProfile(),
        getSubscription().catch((err) => {
          console.warn('[useProfile] getSubscription failed, using default', err);
          return {
            tier: 'free' as const,
            status: 'active' as const,
            startDate: null,
            endDate: null,
            autoRenew: false
          };
        })
      ]);

      console.log('[useProfile] Data fetched successfully', { profileId: profile.id, subTier: subscription.tier });

      setState(prev => ({
        ...prev,
        profile,
        subscription,
        isLoading: false
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load profile';
      console.error('[useProfile] Load failed', errorMessage);

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }));
    }
  }, [isAuthenticated, userId]);

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
   * Initial load & Auth state sync
   */
  useEffect(() => {
    loadProfile();
  }, [loadProfile, userId]); // Reload when user changes

  return {
    ...state,
    loadProfile,
    updateProfile
  };
};
