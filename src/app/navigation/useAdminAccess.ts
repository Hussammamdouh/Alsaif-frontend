/**
 * Admin Access Hook
 * Helper hook to check admin permissions
 */

import { useMemo } from 'react';
import { useAuth } from '../auth';
import { UserRole } from '../auth/auth.types';

interface AdminAccessResult {
  isAdmin: boolean;
  isSuperadmin: boolean;
  hasAdminAccess: boolean;
  userRole: UserRole | null;
  canAccessAuditLogs: boolean;
  canManageAdmins: boolean;
  canBroadcast: boolean;
  canManageUsers: boolean;
  canManageInsights: boolean;
  canManageSubscriptions: boolean;
}

/**
 * useAdminAccess Hook
 * Check user's admin permissions and roles
 *
 * @returns Object with permission flags and role info
 *
 * @example
 * ```tsx
 * const { hasAdminAccess, isSuperadmin } = useAdminAccess();
 *
 * if (hasAdminAccess) {
 *   return <AdminDashboardButton />;
 * }
 * ```
 */
export const useAdminAccess = (): AdminAccessResult => {
  const { state } = useAuth();

  return useMemo(() => {
    const user = state.session?.user;
    const userRole = user?.role || null;

    const isSuperadmin = userRole === UserRole.SUPERADMIN;
    const isAdmin = userRole === UserRole.ADMIN;
    const hasAdminAccess = isSuperadmin || isAdmin;

    return {
      isAdmin,
      isSuperadmin,
      hasAdminAccess,
      userRole,
      // Superadmin-only permissions
      canAccessAuditLogs: isSuperadmin,
      canManageAdmins: isSuperadmin,
      // Admin and Superadmin permissions
      canBroadcast: hasAdminAccess,
      canManageUsers: hasAdminAccess,
      canManageInsights: hasAdminAccess,
      canManageSubscriptions: hasAdminAccess,
    };
  }, [state.session?.user]);
};
