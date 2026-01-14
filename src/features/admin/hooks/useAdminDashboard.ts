/**
 * useAdminDashboard Hook
 * Fetch and manage dashboard statistics
 */

import { useState, useEffect, useCallback } from 'react';
import { getDashboardStats } from '../../../core/services/admin/adminService';
import type { DashboardStats } from '../admin.types';

interface AdminDashboardState {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
}

export const useAdminDashboard = () => {
  const [state, setState] = useState<AdminDashboardState>({
    stats: null,
    isLoading: false,
    error: null,
  });

  const fetchStats = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const stats = await getDashboardStats();
      setState({ stats, isLoading: false, error: null });
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to fetch dashboard statistics',
      }));
    }
  }, []);

  const refresh = useCallback(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats: state.stats,
    isLoading: state.isLoading,
    error: state.error,
    refresh,
  };
};
