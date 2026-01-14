/**
 * useAdminBroadcast Hook
 * Manage broadcast notifications
 */

import { useState, useCallback } from 'react';
import {
  broadcastNotification,
  getBroadcastHistory,
} from '../../../core/services/admin/adminService';
import type {
  BroadcastNotificationData,
  PaginationMeta,
} from '../admin.types';
import { DEFAULT_PAGE_SIZE } from '../admin.constants';

interface BroadcastState {
  history: any[];
  pagination: PaginationMeta | null;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
}

export const useAdminBroadcast = () => {
  const [state, setState] = useState<BroadcastState>({
    history: [],
    pagination: null,
    isLoading: false,
    isSending: false,
    error: null,
  });

  const fetchHistory = useCallback(async (page = 1, append = false) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await getBroadcastHistory(page, DEFAULT_PAGE_SIZE);

      setState(prev => ({
        ...prev,
        history: append ? [...prev.history, ...response.data] : response.data,
        pagination: response.pagination,
        isLoading: false,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to fetch broadcast history',
      }));
    }
  }, []);

  const loadMore = useCallback(() => {
    if (!state.pagination?.hasNextPage || state.isLoading) return;
    fetchHistory(state.pagination.currentPage + 1, true);
  }, [state.pagination, state.isLoading, fetchHistory]);

  const refresh = useCallback(() => {
    fetchHistory(1, false);
  }, [fetchHistory]);

  const broadcast = useCallback(
    async (data: BroadcastNotificationData) => {
      setState(prev => ({ ...prev, isSending: true, error: null }));

      try {
        const result = await broadcastNotification(data);
        setState(prev => ({ ...prev, isSending: false }));

        // Refresh history to show new broadcast
        refresh();

        return result;
      } catch (error: any) {
        setState(prev => ({
          ...prev,
          isSending: false,
          error: error.message || 'Failed to broadcast notification',
        }));
        throw error;
      }
    },
    [refresh]
  );

  return {
    history: state.history,
    pagination: state.pagination,
    isLoading: state.isLoading,
    isSending: state.isSending,
    error: state.error,
    broadcast,
    loadMore,
    refresh,
    loadHistory: fetchHistory,
  };
};
