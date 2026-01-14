/**
 * Auth Gate
 * Navigation guard component that controls access based on authentication
 * Prevents unauthorized access to protected routes
 */

import React from 'react';
import { useAuth } from './auth.hooks';
import { UserRole, BootstrapState } from './auth.types';

/**
 * Auth Gate Props
 */
interface AuthGateProps {
  children: React.ReactNode;
  /** Require authentication to access */
  requireAuth?: boolean;
  /** Require specific role */
  requireRole?: UserRole;
  /** Component to show when access is denied */
  fallback?: React.ReactNode;
}

/**
 * Auth Gate Component
 * Controls access to child components based on auth state
 *
 * Usage:
 * ```tsx
 * <AuthGate requireAuth>
 *   <ProtectedScreen />
 * </AuthGate>
 *
 * <AuthGate requireRole={UserRole.ADMIN}>
 *   <AdminPanel />
 * </AuthGate>
 * ```
 */
export const AuthGate: React.FC<AuthGateProps> = ({
  children,
  requireAuth = false,
  requireRole,
  fallback = null,
}) => {
  const { state } = useAuth();

  // Wait for bootstrap to complete
  if (state.bootstrapState === BootstrapState.LOADING) {
    return null;
  }

  // Check authentication requirement
  if (requireAuth && !state.isAuthenticated) {
    return <>{fallback}</>;
  }

  // Check role requirement
  if (requireRole && state.session) {
    const userRole = state.session.user.role;

    // Role hierarchy: SUPERADMIN > ADMIN > USER
    const roleHierarchy = {
      [UserRole.USER]: 0,
      [UserRole.ADMIN]: 1,
      [UserRole.SUPERADMIN]: 2,
    };

    const userLevel = roleHierarchy[userRole];
    const requiredLevel = roleHierarchy[requireRole];

    if (userLevel < requiredLevel) {
      return <>{fallback}</>;
    }
  }

  // Access granted
  return <>{children}</>;
};

/**
 * Require Auth HOC
 * Higher-order component for protecting routes
 *
 * Usage:
 * ```tsx
 * const ProtectedScreen = requireAuth(MyScreen);
 * ```
 */
export const requireAuth = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) => {
  const ProtectedComponent: React.FC<P> = props => {
    return (
      <AuthGate requireAuth fallback={fallback}>
        <Component {...props} />
      </AuthGate>
    );
  };

  ProtectedComponent.displayName = `requireAuth(${Component.displayName || Component.name})`;

  return ProtectedComponent;
};

/**
 * Require Role HOC
 * Higher-order component for role-based protection
 *
 * Usage:
 * ```tsx
 * const AdminScreen = requireRole(MyScreen, UserRole.ADMIN);
 * ```
 */
export const requireRole = <P extends object>(
  Component: React.ComponentType<P>,
  role: UserRole,
  fallback?: React.ReactNode
) => {
  const ProtectedComponent: React.FC<P> = props => {
    return (
      <AuthGate requireAuth requireRole={role} fallback={fallback}>
        <Component {...props} />
      </AuthGate>
    );
  };

  ProtectedComponent.displayName = `requireRole(${Component.displayName || Component.name}, ${role})`;

  return ProtectedComponent;
};

/**
 * Guest Only Gate
 * Shows content only to unauthenticated users
 *
 * Usage:
 * ```tsx
 * <GuestOnlyGate>
 *   <LoginScreen />
 * </GuestOnlyGate>
 * ```
 */
export const GuestOnlyGate: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback = null }) => {
  const { state } = useAuth();

  // Wait for bootstrap
  if (state.bootstrapState === BootstrapState.LOADING) {
    return null;
  }

  // Show content only if NOT authenticated
  if (state.isAuthenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
