/**
 * useAdminSubscriptions Hook
 * Manage subscriptions list and actions
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getSubscriptions,
  grantSubscription,
  revokeSubscription,
} from '../../../core/services/admin/adminService';
import type {
  AdminSubscription,
  SubscriptionFilters,
  PaginationMeta,
  SubscriptionGrantData,
} from '../admin.types';
import { DEFAULT_PAGE_SIZE } from '../admin.constants';

interface AdminSubscriptionsState {
  subscriptions: AdminSubscription[];
  pagination: PaginationMeta | null;
  filters: SubscriptionFilters;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
}

export const useAdminSubscriptions = () => {
  const [state, setState] = useState<AdminSubscriptionsState>({
    subscriptions: [],
    pagination: null,
    filters: {},
    isLoading: false,
    isUpdating: false,
    error: null,
  });

  const fetchSubscriptions = useCallback(
    async (page = 1, append = false) => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await getSubscriptions(page, DEFAULT_PAGE_SIZE, state.filters);

        setState(prev => ({
          ...prev,
          subscriptions: append
            ? [...prev.subscriptions, ...response.data]
            : response.data,
          pagination: response.pagination,
          isLoading: false,
        }));
      } catch (error: any) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error.message || 'Failed to fetch subscriptions',
        }));
      }
    },
    [state.filters]
  );

  const setFilters = useCallback((newFilters: SubscriptionFilters) => {
    setState(prev => ({
      ...prev,
      filters: newFilters,
      subscriptions: [],
    }));
  }, []);

  const loadMore = useCallback(() => {
    if (!state.pagination?.hasNextPage || state.isLoading) return;
    fetchSubscriptions(state.pagination.currentPage + 1, true);
  }, [state.pagination, state.isLoading, fetchSubscriptions]);

  const refresh = useCallback(() => {
    fetchSubscriptions(1, false);
  }, [fetchSubscriptions]);

  const handleGrantSubscription = useCallback(
    async (data: SubscriptionGrantData) => {
      setState(prev => ({ ...prev, isUpdating: true, error: null }));

      try {
        await grantSubscription(data);
        setState(prev => ({ ...prev, isUpdating: false }));
        // Refresh list to get updated data
        refresh();
      } catch (error: any) {
        setState(prev => ({
          ...prev,
          isUpdating: false,
          error: error.message || 'Failed to grant subscription',
        }));
        throw error;
      }
    },
    [refresh]
  );

  const handleRevokeSubscription = useCallback(
    async (userId: string, reason?: string) => {
      setState(prev => ({ ...prev, isUpdating: true, error: null }));

      try {
        await revokeSubscription(userId, reason);
        setState(prev => ({ ...prev, isUpdating: false }));
        // Refresh list to get updated data
        refresh();
      } catch (error: any) {
        setState(prev => ({
          ...prev,
          isUpdating: false,
          error: error.message || 'Failed to revoke subscription',
        }));
        throw error;
      }
    },
    [refresh]
  );

  // Initial fetch
  useEffect(() => {
    fetchSubscriptions(1, false);
  }, [fetchSubscriptions]);

  return {
    subscriptions: state.subscriptions,
    pagination: state.pagination,
    filters: state.filters,
    isLoading: state.isLoading,
    isUpdating: state.isUpdating,
    error: state.error,
    setFilters,
    loadMore,
    refresh,
    grantSubscription: handleGrantSubscription,
    revokeSubscription: handleRevokeSubscription,
  };
};
