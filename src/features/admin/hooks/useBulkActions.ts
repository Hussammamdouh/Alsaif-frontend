/**
 * useBulkActions Hook
 * Manages bulk operations on users, insights, and subscriptions
 */

import { useState, useCallback } from 'react';
import { bulkActionsService } from '../../../core/services/api/adminEnhancements.service';

export const useBulkActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);

  // User Bulk Actions
  const bulkActivateUsers = useCallback(async (userIds: string[]) => {
    setLoading(true);
    setError(null);
    setProgress({ current: 0, total: userIds.length });
    try {
      const result = await bulkActionsService.bulkActivateUsers(userIds);
      setProgress(null);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to activate users');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const bulkDeactivateUsers = useCallback(async (userIds: string[]) => {
    setLoading(true);
    setError(null);
    setProgress({ current: 0, total: userIds.length });
    try {
      const result = await bulkActionsService.bulkDeactivateUsers(userIds);
      setProgress(null);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to deactivate users');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const bulkDeleteUsers = useCallback(async (userIds: string[]) => {
    setLoading(true);
    setError(null);
    setProgress({ current: 0, total: userIds.length });
    try {
      const result = await bulkActionsService.bulkDeleteUsers(userIds);
      setProgress(null);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to delete users');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const bulkUpdateUserRole = useCallback(async (userIds: string[], role: string) => {
    setLoading(true);
    setError(null);
    setProgress({ current: 0, total: userIds.length });
    try {
      const result = await bulkActionsService.bulkUpdateUserRole(userIds, role);
      setProgress(null);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to update user roles');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const bulkSendNotification = useCallback(
    async (userIds: string[], notification: { title: string; message: string; type?: string }) => {
      setLoading(true);
      setError(null);
      setProgress({ current: 0, total: userIds.length });
      try {
        const result = await bulkActionsService.bulkSendNotification(userIds, notification);
        setProgress(null);
        return result;
      } catch (err: any) {
        setError(err.message || 'Failed to send notifications');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Insight Bulk Actions
  const bulkPublishInsights = useCallback(async (insightIds: string[]) => {
    setLoading(true);
    setError(null);
    setProgress({ current: 0, total: insightIds.length });
    try {
      const result = await bulkActionsService.bulkPublishInsights(insightIds);
      setProgress(null);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to publish insights');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const bulkUnpublishInsights = useCallback(async (insightIds: string[]) => {
    setLoading(true);
    setError(null);
    setProgress({ current: 0, total: insightIds.length });
    try {
      const result = await bulkActionsService.bulkUnpublishInsights(insightIds);
      setProgress(null);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to unpublish insights');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const bulkDeleteInsights = useCallback(async (insightIds: string[]) => {
    setLoading(true);
    setError(null);
    setProgress({ current: 0, total: insightIds.length });
    try {
      const result = await bulkActionsService.bulkDeleteInsights(insightIds);
      setProgress(null);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to delete insights');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const bulkUpdateInsightCategory = useCallback(async (insightIds: string[], category: string) => {
    setLoading(true);
    setError(null);
    setProgress({ current: 0, total: insightIds.length });
    try {
      const result = await bulkActionsService.bulkUpdateInsightCategory(insightIds, category);
      setProgress(null);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to update insight categories');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const bulkUpdateInsightTags = useCallback(async (insightIds: string[], tags: string[]) => {
    setLoading(true);
    setError(null);
    setProgress({ current: 0, total: insightIds.length });
    try {
      const result = await bulkActionsService.bulkUpdateInsightTags(insightIds, tags);
      setProgress(null);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to update insight tags');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Subscription Bulk Actions
  const bulkCancelSubscriptions = useCallback(async (subscriptionIds: string[], reason?: string) => {
    setLoading(true);
    setError(null);
    setProgress({ current: 0, total: subscriptionIds.length });
    try {
      const result = await bulkActionsService.bulkCancelSubscriptions(subscriptionIds, reason);
      setProgress(null);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to cancel subscriptions');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const bulkReactivateSubscriptions = useCallback(async (subscriptionIds: string[]) => {
    setLoading(true);
    setError(null);
    setProgress({ current: 0, total: subscriptionIds.length });
    try {
      const result = await bulkActionsService.bulkReactivateSubscriptions(subscriptionIds);
      setProgress(null);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to reactivate subscriptions');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const bulkUpdateSubscriptionTier = useCallback(async (subscriptionIds: string[], tier: string) => {
    setLoading(true);
    setError(null);
    setProgress({ current: 0, total: subscriptionIds.length });
    try {
      const result = await bulkActionsService.bulkUpdateSubscriptionTier(subscriptionIds, tier);
      setProgress(null);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to update subscription tiers');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const bulkExtendSubscriptions = useCallback(async (subscriptionIds: string[], days: number) => {
    setLoading(true);
    setError(null);
    setProgress({ current: 0, total: subscriptionIds.length });
    try {
      const result = await bulkActionsService.bulkExtendSubscriptions(subscriptionIds, days);
      setProgress(null);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to extend subscriptions');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const bulkApplyDiscount = useCallback(async (subscriptionIds: string[], discountCode: string) => {
    setLoading(true);
    setError(null);
    setProgress({ current: 0, total: subscriptionIds.length });
    try {
      const result = await bulkActionsService.bulkApplyDiscount(subscriptionIds, discountCode);
      setProgress(null);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to apply discount');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    loading,
    error,
    progress,

    // User actions
    bulkActivateUsers,
    bulkDeactivateUsers,
    bulkDeleteUsers,
    bulkUpdateUserRole,
    bulkSendNotification,

    // Insight actions
    bulkPublishInsights,
    bulkUnpublishInsights,
    bulkDeleteInsights,
    bulkUpdateInsightCategory,
    bulkUpdateInsightTags,

    // Subscription actions
    bulkCancelSubscriptions,
    bulkReactivateSubscriptions,
    bulkUpdateSubscriptionTier,
    bulkExtendSubscriptions,
    bulkApplyDiscount,

    // Utilities
    clearError,
  };
};
