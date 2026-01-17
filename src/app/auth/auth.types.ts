/**
 * Auth Types
 * Complete type definitions for authentication state management
 */

/**
 * User Roles
 * Hierarchical access levels for the application
 */
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPERADMIN = 'superadmin',
}

/**
 * User Profile
 * Core user data returned from authentication
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  emailVerified?: boolean;
  phoneNumber?: string;
  avatar?: string;
}

/**
 * Auth Tokens
 * JWT tokens for session management
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds until expiration
  tokenType?: string; // e.g., 'Bearer'
}

/**
 * Auth Session
 * Complete authenticated session data
 */
export interface AuthSession {
  user: User;
  tokens: AuthTokens;
  issuedAt: number; // timestamp when session was created
  expiresAt: number; // timestamp when access token expires
}

/**
 * Bootstrap State
 * App initialization states
 */
export enum BootstrapState {
  IDLE = 'idle',
  LOADING = 'loading',
  READY = 'ready',
  ERROR = 'error',
}

/**
 * Auth State
 * Global authentication state
 */
export interface AuthState {
  // Session
  session: AuthSession | null;
  isAuthenticated: boolean;

  // Bootstrap
  bootstrapState: BootstrapState;
  bootstrapError: string | null;

  // UI States
  isLoading: boolean; // for login/logout operations
  error: string | null;

  // Biometric
  biometricEnabled: boolean;
  biometricType: BiometricType | null;
}

/**
 * Biometric Types
 * Supported biometric authentication methods
 */
export enum BiometricType {
  TOUCH_ID = 'TouchID',
  FACE_ID = 'FaceID',
  FINGERPRINT = 'Fingerprint',
  IRIS = 'Iris',
}

/**
 * Biometric Availability
 */
export interface BiometricAvailability {
  available: boolean;
  biometryType: BiometricType | null;
  error?: string;
}

/**
 * Auth Action Types
 * All possible auth state transitions
 */
export enum AuthActionType {
  // Bootstrap
  BOOTSTRAP_START = 'BOOTSTRAP_START',
  BOOTSTRAP_SUCCESS = 'BOOTSTRAP_SUCCESS',
  BOOTSTRAP_ERROR = 'BOOTSTRAP_ERROR',

  // Login
  LOGIN_START = 'LOGIN_START',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_ERROR = 'LOGIN_ERROR',

  // Register
  REGISTER_START = 'REGISTER_START',
  REGISTER_SUCCESS = 'REGISTER_SUCCESS',
  REGISTER_ERROR = 'REGISTER_ERROR',

  // Token Refresh
  REFRESH_START = 'REFRESH_START',
  REFRESH_SUCCESS = 'REFRESH_SUCCESS',
  REFRESH_ERROR = 'REFRESH_ERROR',

  // Logout
  LOGOUT = 'LOGOUT',

  // Session Update
  UPDATE_SESSION = 'UPDATE_SESSION',

  // Biometric
  ENABLE_BIOMETRIC = 'ENABLE_BIOMETRIC',
  DISABLE_BIOMETRIC = 'DISABLE_BIOMETRIC',

  // Error Handling
  CLEAR_ERROR = 'CLEAR_ERROR',
}

/**
 * Auth Actions
 * Discriminated union of all auth actions
 */
export type AuthAction =
  | { type: AuthActionType.BOOTSTRAP_START }
  | { type: AuthActionType.BOOTSTRAP_SUCCESS; payload: AuthSession | null }
  | { type: AuthActionType.BOOTSTRAP_ERROR; payload: string }
  | { type: AuthActionType.LOGIN_START }
  | { type: AuthActionType.LOGIN_SUCCESS; payload: AuthSession }
  | { type: AuthActionType.LOGIN_ERROR; payload: string }
  | { type: AuthActionType.REGISTER_START }
  | { type: AuthActionType.REGISTER_SUCCESS; payload: AuthSession }
  | { type: AuthActionType.REGISTER_ERROR; payload: string }
  | { type: AuthActionType.REFRESH_START }
  | { type: AuthActionType.REFRESH_SUCCESS; payload: AuthTokens }
  | { type: AuthActionType.REFRESH_ERROR; payload: string }
  | { type: AuthActionType.LOGOUT }
  | { type: AuthActionType.UPDATE_SESSION; payload: Partial<AuthSession> }
  | { type: AuthActionType.ENABLE_BIOMETRIC; payload: BiometricType }
  | { type: AuthActionType.DISABLE_BIOMETRIC }
  | { type: AuthActionType.CLEAR_ERROR };

/**
 * Auth Context Value
 * Public API exposed by AuthProvider
 */
export interface AuthContextValue {
  // State
  state: AuthState;

  // Auth Operations
  login: (email: string, password: string) => Promise<void>;
  register: (
    fullName: string,
    email: string,
    password: string,
    nationality: string,
    phoneNumber?: string,
    country?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<void>;

  // Biometric
  enableBiometric: () => Promise<void>;
  disableBiometric: () => Promise<void>;
  loginWithBiometric: () => Promise<void>;

  // Utilities
  clearError: () => void;
}

/**
 * Secure Storage Keys
 * Keys used for storing sensitive data
 */
export enum SecureStorageKey {
  AUTH_SESSION = 'auth_session',
  BIOMETRIC_ENABLED = 'biometric_enabled',
}
