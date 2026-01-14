/**
 * useAdminInsights Hook
 * Manage insights list, filters, and CRUD operations
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getInsights,
  createInsight,
  updateInsight,
  deleteInsight,
  publishInsight,
  featureInsight,
  scheduleInsight,
  cancelInsightSchedule,
} from '../../../core/services/admin/adminService';
import type {
  AdminInsight,
  InsightFilters,
  PaginationMeta,
  CreateInsightData,
  UpdateInsightData,
} from '../admin.types';
import { DEFAULT_PAGE_SIZE } from '../admin.constants';

interface AdminInsightsState {
  insights: AdminInsight[];
  pagination: PaginationMeta | null;
  filters: InsightFilters;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
}

export const useAdminInsights = () => {
  const [state, setState] = useState<AdminInsightsState>({
    insights: [],
    pagination: null,
    filters: {},
    isLoading: false,
    isUpdating: false,
    error: null,
  });

  const fetchInsights = useCallback(
    async (page = 1, append = false) => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await getInsights(page, DEFAULT_PAGE_SIZE, state.filters);

        setState(prev => ({
          ...prev,
          insights: append ? [...prev.insights, ...response.data] : response.data,
          pagination: response.pagination,
          isLoading: false,
        }));
      } catch (error: any) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error.message || 'Failed to fetch insights',
        }));
      }
    },
    [state.filters]
  );

  const setFilters = useCallback((newFilters: InsightFilters) => {
    setState(prev => ({
      ...prev,
      filters: newFilters,
      insights: [], // Reset insights when filters change
    }));
  }, []);

  const loadMore = useCallback(() => {
    if (!state.pagination?.hasNextPage || state.isLoading) return;
    fetchInsights(state.pagination.currentPage + 1, true);
  }, [state.pagination, state.isLoading, fetchInsights]);

  const refresh = useCallback(() => {
    fetchInsights(1, false);
  }, [fetchInsights]);

  const handleCreateInsight = useCallback(
    async (data: CreateInsightData) => {
      setState(prev => ({ ...prev, isUpdating: true, error: null }));

      try {
        const newInsight = await createInsight(data);

        // Add to local state
        setState(prev => ({
          ...prev,
          insights: [newInsight, ...prev.insights],
          isUpdating: false,
        }));

        return newInsight;
      } catch (error: any) {
        setState(prev => ({
          ...prev,
          isUpdating: false,
          error: error.message || 'Failed to create insight',
        }));
        throw error;
      }
    },
    []
  );

  const handleUpdateInsight = useCallback(
    async (insightId: string, data: UpdateInsightData) => {
      setState(prev => ({ ...prev, isUpdating: true, error: null }));

      try {
        const updatedInsight = await updateInsight(insightId, data);

        // Update local state
        setState(prev => ({
          ...prev,
          insights: prev.insights.map(insight =>
            insight.id === insightId ? updatedInsight : insight
          ),
          isUpdating: false,
        }));

        return updatedInsight;
      } catch (error: any) {
        setState(prev => ({
          ...prev,
          isUpdating: false,
          error: error.message || 'Failed to update insight',
        }));
        throw error;
      }
    },
    []
  );

  const handleDeleteInsight = useCallback(
    async (insightId: string, reason?: string) => {
      setState(prev => ({ ...prev, isUpdating: true, error: null }));

      try {
        await deleteInsight(insightId, reason);

        // Remove from local state
        setState(prev => ({
          ...prev,
          insights: prev.insights.filter(insight => insight.id !== insightId),
          isUpdating: false,
        }));
      } catch (error: any) {
        setState(prev => ({
          ...prev,
          isUpdating: false,
          error: error.message || 'Failed to delete insight',
        }));
        throw error;
      }
    },
    []
  );

  const handlePublishInsight = useCallback(
    async (insightId: string) => {
      setState(prev => ({ ...prev, isUpdating: true, error: null }));

      try {
        const updatedInsight = await publishInsight(insightId);

        // Update local state
        setState(prev => ({
          ...prev,
          insights: prev.insights.map(insight =>
            insight.id === insightId ? updatedInsight : insight
          ),
          isUpdating: false,
        }));

        return updatedInsight;
      } catch (error: any) {
        setState(prev => ({
          ...prev,
          isUpdating: false,
          error: error.message || 'Failed to publish insight',
        }));
        throw error;
      }
    },
    []
  );

  const handleFeatureInsight = useCallback(
    async (insightId: string, featured: boolean) => {
      setState(prev => ({ ...prev, isUpdating: true, error: null }));

      try {
        const updatedInsight = await featureInsight(insightId, featured);

        // Update local state
        setState(prev => ({
          ...prev,
          insights: prev.insights.map(insight =>
            insight.id === insightId ? updatedInsight : insight
          ),
          isUpdating: false,
        }));

        return updatedInsight;
      } catch (error: any) {
        setState(prev => ({
          ...prev,
          isUpdating: false,
          error: error.message || 'Failed to feature insight',
        }));
        throw error;
      }
    },
    []
  );

  // Initial fetch
  useEffect(() => {
    fetchInsights(1, false);
  }, [fetchInsights]);

  return {
    insights: state.insights,
    pagination: state.pagination,
    filters: state.filters,
    isLoading: state.isLoading,
    isUpdating: state.isUpdating,
    error: state.error,
    setFilters,
    loadMore,
    refresh,
    createInsight: handleCreateInsight,
    updateInsight: handleUpdateInsight,
    deleteInsight: handleDeleteInsight,
    publishInsight: handlePublishInsight,
    featureInsight: handleFeatureInsight,
    scheduleInsight: useCallback(async (insightId: string, publishAt: string) => {
      setState(prev => ({ ...prev, isUpdating: true, error: null }));
      try {
        const updatedInsight = await scheduleInsight(insightId, publishAt);
        setState(prev => ({
          ...prev,
          insights: prev.insights.map(insight =>
            insight.id === insightId ? updatedInsight : insight
          ),
          isUpdating: false,
        }));
        return updatedInsight;
      } catch (error: any) {
        setState(prev => ({
          ...prev,
          isUpdating: false,
          error: error.message || 'Failed to schedule insight',
        }));
        throw error;
      }
    }, []),
    cancelSchedule: useCallback(async (insightId: string) => {
      setState(prev => ({ ...prev, isUpdating: true, error: null }));
      try {
        const updatedInsight = await cancelInsightSchedule(insightId);
        setState(prev => ({
          ...prev,
          insights: prev.insights.map(insight =>
            insight.id === insightId ? updatedInsight : insight
          ),
          isUpdating: false,
        }));
        return updatedInsight;
      } catch (error: any) {
        setState(prev => ({
          ...prev,
          isUpdating: false,
          error: error.message || 'Failed to cancel schedule',
        }));
        throw error;
      }
    }, []),
  };
};
