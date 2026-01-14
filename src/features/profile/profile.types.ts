/**
 * Profile Types
 * Type definitions for user profile feature
 */

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'superadmin';
  avatar: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  settings?: {
    biometricEnabled: boolean;
    language: 'en' | 'ar' | 'fr' | 'es' | 'de';
    theme: 'light' | 'dark' | 'auto';
    chat: {
      muteGroups: boolean;
      readReceipts: boolean;
    };
  };
  deletionRequestedAt?: string | null;
  scheduledDeletionDate?: string | null;
  deletionReason?: string | null;
}

export interface SubscriptionInfo {
  tier: 'free' | 'premium';
  status: 'active' | 'inactive' | 'cancelled' | 'expired';
  startDate: string | null;
  endDate: string | null;
  autoRenew: boolean;
}

export interface ProfileState {
  profile: UserProfile | null;
  subscription: SubscriptionInfo | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
}

export interface UpdateProfileRequest {
  name?: string;
  avatar?: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  message?: string;
  data: {
    user: UserProfile;
  };
}

export interface GetProfileResponse {
  success: boolean;
  message?: string;
  data: {
    user: UserProfile;
  };
}

export interface GetSubscriptionResponse {
  success: boolean;
  message?: string;
  data: {
    subscription: SubscriptionInfo;
  };
}
