/**
 * useSubscriptionAccess
 * Hook for checking subscription-based access control throughout the app
 */

import { useMemo } from 'react';
import { useSubscription } from './subscription.hooks';
import { SubscriptionTier } from './subscription.types';
import { useIsAdmin } from '../../app/auth/auth.hooks';

/**
 * Tier hierarchy for access control
 * Higher values = higher tier
 */
const TIER_HIERARCHY: Record<SubscriptionTier, number> = {
  free: 0,
  basic: 1,
  starter: 2,
  premium: 3,
  pro: 4,
  enterprise: 5,
};

/**
 * Access control utilities based on user's subscription
 */
export const useSubscriptionAccess = () => {
  const { subscription, loading } = useSubscription();
  const isAdmin = useIsAdmin();

  /**
   * Check if user has access to a specific tier level
   * @param requiredTier - Minimum tier required
   * @returns true if user's tier meets or exceeds the required tier
   */
  const hasTierAccess = useMemo(() => {
    return (requiredTier: SubscriptionTier): boolean => {
      // Admins have access to everything
      if (isAdmin) return true;

      // If no subscription or expired, user has free tier
      if (!subscription || subscription.status !== 'active') {
        return requiredTier === 'free';
      }

      const userTierLevel = TIER_HIERARCHY[subscription.tier] || 0;
      const requiredTierLevel = TIER_HIERARCHY[requiredTier] || 0;

      return userTierLevel >= requiredTierLevel;
    };
  }, [subscription]);

  /**
   * Check if user has an active (paid) subscription
   */
  const hasActiveSubscription = useMemo(() => {
    return subscription?.status === 'active' && subscription?.tier !== 'free';
  }, [subscription]);

  /**
   * Check if user has access to premium content
   * Premium content requires at least 'basic' tier
   */
  const hasPremiumAccess = useMemo(() => {
    return hasTierAccess('basic');
  }, [hasTierAccess]);

  /**
   * Check if user has access to pro features
   * Pro features require at least 'premium' tier
   */
  const hasProAccess = useMemo(() => {
    return hasTierAccess('premium');
  }, [hasTierAccess]);

  /**
   * Check if user has enterprise access
   * Enterprise features require 'enterprise' tier
   */
  const hasEnterpriseAccess = useMemo(() => {
    return hasTierAccess('enterprise');
  }, [hasTierAccess]);

  /**
   * Get user's current tier
   */
  const currentTier = useMemo(() => {
    if (!subscription || subscription.status !== 'active') {
      return 'free';
    }
    return subscription.tier;
  }, [subscription]);

  /**
   * Check if subscription is expiring soon (within warning period)
   */
  const isExpiringSoon = useMemo(() => {
    return subscription?.isExpiringSoon || false;
  }, [subscription]);

  /**
   * Get days remaining on subscription
   */
  const daysRemaining = useMemo(() => {
    return subscription?.daysRemaining || 0;
  }, [subscription]);

  /**
   * Check if user can upgrade
   */
  const canUpgrade = useMemo(() => {
    return subscription?.canUpgrade || false;
  }, [subscription]);

  /**
   * Check if user should be prompted to upgrade
   * True if user is on free tier or subscription is expired
   */
  const shouldPromptUpgrade = useMemo(() => {
    if (!subscription) return false;
    return subscription.tier === 'free' || subscription.status === 'expired';
  }, [subscription]);

  /**
   * Get upgrade message for locked content
   */
  const getUpgradeMessage = (requiredTier: SubscriptionTier): string => {
    const tierName = requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1);
    return `This content requires ${tierName} subscription or higher. Upgrade now to access premium features.`;
  };

  /**
   * Check if specific insight type is accessible
   * @param insightType - 'free' or 'premium'
   */
  const canAccessInsight = (insightType: 'free' | 'premium'): boolean => {
    if (isAdmin) return true;
    if (insightType === 'free') return true;
    return hasPremiumAccess;
  };

  return {
    // Subscription state
    subscription,
    loading,
    currentTier,

    // Access checks
    hasTierAccess,
    hasActiveSubscription,
    hasPremiumAccess,
    hasProAccess,
    hasEnterpriseAccess,
    canAccessInsight,

    // Subscription status
    isExpiringSoon,
    daysRemaining,
    canUpgrade,
    shouldPromptUpgrade,

    // Utilities
    getUpgradeMessage,
  };
};
