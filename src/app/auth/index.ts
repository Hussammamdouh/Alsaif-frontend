/**
 * Auth Module Exports
 * Public API for authentication functionality
 */

// Provider
export { AuthProvider } from './AuthProvider';

// Hooks
export {
  useAuth,
  useAuthState,
  useUser,
  useIsAuthenticated,
  useAuthLoading,
  useAuthError,
  useHasRole,
  useIsAdmin,
  useCanAccess,
  useBiometricStatus,
  useAuthOperations,
  useSession,
  useAccessToken,
} from './auth.hooks';

// Guards
export {
  AuthGate,
  requireAuth,
  requireRole,
  GuestOnlyGate,
} from './AuthGate';

// Types
export type {
  User,
  AuthTokens,
  AuthSession,
  AuthState,
  AuthContextValue,
  BiometricAvailability,
} from './auth.types';

export { UserRole, BiometricType, BootstrapState } from './auth.types';

// Selectors
export * from './auth.selectors';

// Biometric utilities
export {
  checkBiometricAvailability,
  getBiometricPromptMessage,
  getBiometricEnableMessage,
} from './auth.biometric';
