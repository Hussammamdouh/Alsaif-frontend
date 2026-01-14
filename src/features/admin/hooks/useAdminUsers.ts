/**
 * useAdminUsers Hook
 * Manage user list, filters, and actions
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getUsers,
  suspendUser,
  activateUser,
  changeUserRole,
  toggleInsightBan,
} from '../../../core/services/admin/adminService';
import type {
  AdminUser,
  UserFilters,
  PaginationMeta,
  UserActionData,
  RoleChangeData,
} from '../admin.types';
import { DEFAULT_PAGE_SIZE } from '../admin.constants';

interface AdminUsersState {
  users: AdminUser[];
  pagination: PaginationMeta | null;
  filters: UserFilters;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
}

export const useAdminUsers = () => {
  const [state, setState] = useState<AdminUsersState>({
    users: [],
    pagination: null,
    filters: {},
    isLoading: false,
    isUpdating: false,
    error: null,
  });

  const fetchUsers = useCallback(
    async (page = 1, append = false) => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await getUsers(page, DEFAULT_PAGE_SIZE, state.filters);

        setState(prev => ({
          ...prev,
          users: append ? [...prev.users, ...response.data] : response.data,
          pagination: response.pagination,
          isLoading: false,
        }));
      } catch (error: any) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error.message || 'Failed to fetch users',
        }));
      }
    },
    [state.filters]
  );

  const setFilters = useCallback((newFilters: UserFilters) => {
    setState(prev => ({
      ...prev,
      filters: newFilters,
      users: [], // Reset users when filters change
    }));
  }, []);

  const loadMore = useCallback(() => {
    if (!state.pagination?.hasNextPage || state.isLoading) return;
    fetchUsers(state.pagination.currentPage + 1, true);
  }, [state.pagination, state.isLoading, fetchUsers]);

  const refresh = useCallback(() => {
    fetchUsers(1, false);
  }, [fetchUsers]);

  const handleSuspendUser = useCallback(
    async (data: UserActionData) => {
      setState(prev => ({ ...prev, isUpdating: true, error: null }));

      try {
        await suspendUser(data);

        // Update local state
        setState(prev => ({
          ...prev,
          users: prev.users.map(user =>
            user.id === data.userId ? { ...user, isActive: false } : user
          ),
          isUpdating: false,
        }));
      } catch (error: any) {
        setState(prev => ({
          ...prev,
          isUpdating: false,
          error: error.message || 'Failed to suspend user',
        }));
        throw error;
      }
    },
    []
  );

  const handleActivateUser = useCallback(
    async (data: UserActionData) => {
      setState(prev => ({ ...prev, isUpdating: true, error: null }));

      try {
        await activateUser(data);

        // Update local state
        setState(prev => ({
          ...prev,
          users: prev.users.map(user =>
            user.id === data.userId ? { ...user, isActive: true } : user
          ),
          isUpdating: false,
        }));
      } catch (error: any) {
        setState(prev => ({
          ...prev,
          isUpdating: false,
          error: error.message || 'Failed to activate user',
        }));
        throw error;
      }
    },
    []
  );

  const handleChangeUserRole = useCallback(
    async (data: RoleChangeData) => {
      setState(prev => ({ ...prev, isUpdating: true, error: null }));

      try {
        await changeUserRole(data);

        // Update local state
        setState(prev => ({
          ...prev,
          users: prev.users.map(user =>
            user.id === data.userId ? { ...user, role: data.newRole } : user
          ),
          isUpdating: false,
        }));
      } catch (error: any) {
        setState(prev => ({
          ...prev,
          isUpdating: false,
          error: error.message || 'Failed to change user role',
        }));
        throw error;
      }
    },
    []
  );

  const handleToggleInsightBan = useCallback(
    async (userId: string) => {
      setState(prev => ({ ...prev, isUpdating: true, error: null }));

      try {
        const { isBannedFromInsights } = await toggleInsightBan(userId);

        // Update local state
        setState(prev => ({
          ...prev,
          users: prev.users.map(user =>
            user.id === userId ? { ...user, isBannedFromInsights } : user
          ),
          isUpdating: false,
        }));
      } catch (error: any) {
        setState(prev => ({
          ...prev,
          isUpdating: false,
          error: error.message || 'Failed to toggle insight ban',
        }));
        throw error;
      }
    },
    []
  );

  // Initial fetch
  useEffect(() => {
    fetchUsers(1, false);
  }, [fetchUsers]);

  return {
    users: state.users,
    pagination: state.pagination,
    filters: state.filters,
    isLoading: state.isLoading,
    isUpdating: state.isUpdating,
    error: state.error,
    setFilters,
    loadMore,
    refresh,
    suspendUser: handleSuspendUser,
    activateUser: handleActivateUser,
    changeUserRole: handleChangeUserRole,
    toggleInsightBan: handleToggleInsightBan,
  };
};
