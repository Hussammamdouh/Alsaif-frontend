/**
 * useAdminAuditLogs Hook
 * Manage audit logs (superadmin only)
 */

import { useState, useEffect, useCallback } from 'react';
import { getAuditLogs } from '../../../core/services/admin/adminService';
import type {
  AuditLog,
  AuditLogFilters,
  PaginationMeta,
} from '../admin.types';
import { DEFAULT_PAGE_SIZE } from '../admin.constants';

interface AuditLogsState {
  logs: AuditLog[];
  pagination: PaginationMeta | null;
  filters: AuditLogFilters;
  isLoading: boolean;
  error: string | null;
}

export const useAdminAuditLogs = () => {
  const [state, setState] = useState<AuditLogsState>({
    logs: [],
    pagination: null,
    filters: {},
    isLoading: false,
    error: null,
  });

  const fetchLogs = useCallback(
    async (page = 1, append = false) => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await getAuditLogs(page, DEFAULT_PAGE_SIZE, state.filters);

        setState(prev => ({
          ...prev,
          logs: append ? [...prev.logs, ...response.data] : response.data,
          pagination: response.pagination,
          isLoading: false,
        }));
      } catch (error: any) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error.message || 'Failed to fetch audit logs',
        }));
      }
    },
    [state.filters]
  );

  const setFilters = useCallback((newFilters: AuditLogFilters) => {
    setState(prev => ({
      ...prev,
      filters: newFilters,
      logs: [],
    }));
  }, []);

  const loadMore = useCallback(() => {
    if (!state.pagination?.hasNextPage || state.isLoading) return;
    fetchLogs(state.pagination.currentPage + 1, true);
  }, [state.pagination, state.isLoading, fetchLogs]);

  const refresh = useCallback(() => {
    fetchLogs(1, false);
  }, [fetchLogs]);

  // Initial fetch
  useEffect(() => {
    fetchLogs(1, false);
  }, [fetchLogs]);

  return {
    logs: state.logs,
    pagination: state.pagination,
    filters: state.filters,
    isLoading: state.isLoading,
    error: state.error,
    setFilters,
    loadMore,
    refresh,
  };
};
