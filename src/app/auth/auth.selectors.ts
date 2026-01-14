/**
 * Auth Selectors
 * Derived state selectors for authentication
 * Pure functions for computing values from auth state
 */

import { AuthState, UserRole, BootstrapState } from './auth.types';

/**
 * Is Bootstrap Complete
 * Checks if app has finished bootstrapping
 */
export const isBootstrapComplete = (state: AuthState): boolean => {
  return (
    state.bootstrapState === BootstrapState.READY ||
    state.bootstrapState === BootstrapState.ERROR
  );
};

/**
 * Is Bootstrap Loading
 * Checks if app is currently bootstrapping
 */
export const isBootstrapLoading = (state: AuthState): boolean => {
  return state.bootstrapState === BootstrapState.LOADING;
};

/**
 * Has Active Session
 * Checks if user has an active authenticated session
 */
export const hasActiveSession = (state: AuthState): boolean => {
  return state.isAuthenticated && state.session !== null;
};

/**
 * Get User Display Name
 * Returns user's display name
 */
export const getUserDisplayName = (state: AuthState): string => {
  if (!state.session?.user) {
    return 'Guest';
  }

  return state.session.user.name;
};

/**
 * Get User Email
 * Returns user's email address
 */
export const getUserEmail = (state: AuthState): string | null => {
  return state.session?.user.email || null;
};

/**
 * Get User Role
 * Returns user's role
 */
export const getUserRole = (state: AuthState): UserRole | null => {
  return state.session?.user.role || null;
};

/**
 * Is Session Expiring Soon
 * Checks if access token will expire within specified minutes
 */
export const isSessionExpiringSoon = (
  state: AuthState,
  minutesThreshold: number = 5
): boolean => {
  if (!state.session) {
    return false;
  }

  const now = Date.now();
  const thresholdMs = minutesThreshold * 60 * 1000;

  return state.session.expiresAt - now < thresholdMs;
};

/**
 * Get Time Until Expiration
 * Returns milliseconds until token expiration
 */
export const getTimeUntilExpiration = (state: AuthState): number => {
  if (!state.session) {
    return 0;
  }

  const now = Date.now();
  return Math.max(0, state.session.expiresAt - now);
};

/**
 * Should Refresh Token
 * Determines if token should be refreshed
 */
export const shouldRefreshToken = (state: AuthState): boolean => {
  if (!state.isAuthenticated || !state.session) {
    return false;
  }

  // Refresh if token expires in less than 5 minutes
  return isSessionExpiringSoon(state, 5);
};

/**
 * Has Role
 * Checks if user has specific role
 */
export const hasRole = (state: AuthState, role: UserRole): boolean => {
  const userRole = getUserRole(state);
  return userRole === role;
};

/**
 * Can Access
 * Checks if user can access feature based on role hierarchy
 */
export const canAccess = (
  state: AuthState,
  requiredRole: UserRole
): boolean => {
  const userRole = getUserRole(state);

  if (!userRole) {
    return false;
  }

  // Role hierarchy: SUPERADMIN > ADMIN > USER
  const roleHierarchy = {
    [UserRole.USER]: 0,
    [UserRole.ADMIN]: 1,
    [UserRole.SUPERADMIN]: 2,
  };

  const userLevel = roleHierarchy[userRole];
  const requiredLevel = roleHierarchy[requiredRole];

  return userLevel >= requiredLevel;
};

/**
 * Is Admin
 * Checks if user is admin or superadmin
 */
export const isAdmin = (state: AuthState): boolean => {
  const userRole = getUserRole(state);
  return userRole === UserRole.ADMIN || userRole === UserRole.SUPERADMIN;
};

/**
 * Is Superadmin
 * Checks if user is superadmin
 */
export const isSuperadmin = (state: AuthState): boolean => {
  return hasRole(state, UserRole.SUPERADMIN);
};

/**
 * Get Current Error
 * Returns current error message
 */
export const getCurrentError = (state: AuthState): string | null => {
  return state.error || state.bootstrapError;
};

/**
 * Has Error
 * Checks if there's any error in auth state
 */
export const hasError = (state: AuthState): boolean => {
  return state.error !== null || state.bootstrapError !== null;
};

/**
 * Is Biometric Available
 * Checks if biometric auth is enabled and available
 */
export const isBiometricAvailable = (state: AuthState): boolean => {
  return state.biometricEnabled && state.biometricType !== null;
};

/**
 * Get Biometric Type Display Name
 * Returns user-friendly biometric type name
 */
export const getBiometricTypeDisplayName = (state: AuthState): string => {
  if (!state.biometricType) {
    return 'Biometric';
  }

  switch (state.biometricType) {
    case 'FaceID':
      return 'Face ID';
    case 'TouchID':
      return 'Touch ID';
    case 'Fingerprint':
      return 'Fingerprint';
    case 'Iris':
      return 'Iris';
    default:
      return 'Biometric';
  }
};
