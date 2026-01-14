/**
 * Profile Service
 * Handles profile-related API calls
 */

import { apiClient } from '../api/apiClient';
import {
  UserProfile,
  UpdateProfileRequest,
  UpdateProfileResponse,
  GetProfileResponse,
  GetSubscriptionResponse,
  SubscriptionInfo
} from '../../../features/profile/profile.types';

/**
 * Get current user profile
 */
export const getCurrentProfile = async (): Promise<UserProfile> => {
  const response = await apiClient.get<GetProfileResponse>('/api/auth/me');

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to fetch profile');
  }

  return response.data.user;
};

/**
 * Update current user profile
 */
export const updateProfile = async (
  data: UpdateProfileRequest
): Promise<UserProfile> => {
  const response = await apiClient.patch<UpdateProfileResponse>(
    '/api/users/me',
    data
  );

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to update profile');
  }

  return response.data.user;
};

/**
 * Get subscription details
 */
export const getSubscription = async (): Promise<SubscriptionInfo> => {
  const response = await apiClient.get<GetSubscriptionResponse>(
    '/api/subscriptions/me'
  );

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to fetch subscription');
  }

  return response.data.subscription;
};
