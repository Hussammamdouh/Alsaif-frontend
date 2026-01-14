/**
 * Auth Hooks
 * Custom hooks for accessing authentication state and operations
 */

import { useContext, useMemo } from 'react';
import { AuthContext } from './AuthProvider';
import { UserRole } from './auth.types';

/**
 * Use Auth
 * Primary hook for accessing auth context
 *
 * @throws Error if used outside AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};

/**
 * Use Auth State
 * Hook for accessing only auth state (no operations)
 */
export const useAuthState = () => {
  const { state } = useAuth();
  return state;
};

/**
 * Use User
 * Hook for accessing current user data
 */
export const useUser = () => {
  const { state } = useAuth();
  return state.session?.user || null;
};

/**
 * Use Is Authenticated
 * Hook for checking authentication status
 */
export const useIsAuthenticated = () => {
  const { state } = useAuth();
  return state.isAuthenticated;
};

/**
 * Use Auth Loading
 * Hook for checking if auth operation is in progress
 */
export const useAuthLoading = () => {
  const { state } = useAuth();
  return state.isLoading;
};

/**
 * Use Auth Error
 * Hook for accessing auth error state
 */
export const useAuthError = () => {
  const { state } = useAuth();
  return state.error || state.bootstrapError;
};

/**
 * Use Has Role
 * Hook for checking if user has specific role
 *
 * @param role - Role to check
 * @returns True if user has the role
 */
export const useHasRole = (role: UserRole) => {
  const user = useUser();
  return user?.role === role;
};

/**
 * Use Is Admin
 * Hook for checking if user is admin or superadmin
 */
export const useIsAdmin = () => {
  const user = useUser();
  return (
    user?.role === UserRole.ADMIN || user?.role === UserRole.SUPERADMIN
  );
};

/**
 * Use Can Access
 * Hook for checking feature access based on role
 *
 * @param requiredRole - Minimum required role
 * @returns True if user can access the feature
 */
export const useCanAccess = (requiredRole: UserRole) => {
  const user = useUser();

  if (!user) {
    return false;
  }

  // Role hierarchy: SUPERADMIN > ADMIN > USER
  const roleHierarchy = {
    [UserRole.USER]: 0,
    [UserRole.ADMIN]: 1,
    [UserRole.SUPERADMIN]: 2,
  };

  const userLevel = roleHierarchy[user.role];
  const requiredLevel = roleHierarchy[requiredRole];

  return userLevel >= requiredLevel;
};

/**
 * Use Biometric Status
 * Hook for accessing biometric authentication status
 */
export const useBiometricStatus = () => {
  const { state } = useAuth();

  return useMemo(
    () => ({
      enabled: state.biometricEnabled,
      type: state.biometricType,
    }),
    [state.biometricEnabled, state.biometricType]
  );
};

/**
 * Use Auth Operations
 * Hook for accessing only auth operations (no state)
 */
export const useAuthOperations = () => {
  const {
    login,
    register,
    logout,
    refreshTokens,
    enableBiometric,
    disableBiometric,
    loginWithBiometric,
    clearError,
  } = useAuth();

  return useMemo(
    () => ({
      login,
      register,
      logout,
      refreshTokens,
      enableBiometric,
      disableBiometric,
      loginWithBiometric,
      clearError,
    }),
    [
      login,
      register,
      logout,
      refreshTokens,
      enableBiometric,
      disableBiometric,
      loginWithBiometric,
      clearError,
    ]
  );
};

/**
 * Use Session
 * Hook for accessing current session data
 */
export const useSession = () => {
  const { state } = useAuth();
  return state.session;
};

/**
 * Use Access Token
 * Hook for accessing current access token
 */
export const useAccessToken = () => {
  const session = useSession();
  return session?.tokens.accessToken || null;
};
