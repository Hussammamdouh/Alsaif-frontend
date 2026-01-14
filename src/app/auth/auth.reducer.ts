/**
 * Auth Reducer
 * Pure reducer for authentication state transitions
 * Handles all auth-related state changes predictably
 */

import {
  AuthState,
  AuthAction,
  AuthActionType,
  BootstrapState,
} from './auth.types';

/**
 * Initial Auth State
 * Safe default state for unauthenticated users
 */
export const initialAuthState: AuthState = {
  session: null,
  isAuthenticated: false,
  bootstrapState: BootstrapState.IDLE,
  bootstrapError: null,
  isLoading: false,
  error: null,
  biometricEnabled: false,
  biometricType: null,
};

/**
 * Auth Reducer
 * Pure function that handles all state transitions
 *
 * @param state - Current auth state
 * @param action - Action to process
 * @returns New auth state
 */
export const authReducer = (
  state: AuthState,
  action: AuthAction
): AuthState => {
  switch (action.type) {
    // ==================== BOOTSTRAP ====================
    case AuthActionType.BOOTSTRAP_START:
      return {
        ...state,
        bootstrapState: BootstrapState.LOADING,
        bootstrapError: null,
      };

    case AuthActionType.BOOTSTRAP_SUCCESS:
      return {
        ...state,
        session: action.payload,
        isAuthenticated: action.payload !== null,
        bootstrapState: BootstrapState.READY,
        bootstrapError: null,
      };

    case AuthActionType.BOOTSTRAP_ERROR:
      return {
        ...state,
        session: null,
        isAuthenticated: false,
        bootstrapState: BootstrapState.ERROR,
        bootstrapError: action.payload,
      };

    // ==================== LOGIN ====================
    case AuthActionType.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case AuthActionType.LOGIN_SUCCESS:
      return {
        ...state,
        session: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case AuthActionType.LOGIN_ERROR:
      return {
        ...state,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    // ==================== REGISTER ====================
    case AuthActionType.REGISTER_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case AuthActionType.REGISTER_SUCCESS:
      return {
        ...state,
        session: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case AuthActionType.REGISTER_ERROR:
      return {
        ...state,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };

    // ==================== TOKEN REFRESH ====================
    case AuthActionType.REFRESH_START:
      return {
        ...state,
        // Don't set isLoading for refresh - it's background
      };

    case AuthActionType.REFRESH_SUCCESS:
      if (!state.session) {
        return state;
      }

      // Calculate new expiration
      const now = Date.now();
      const expiresAt = now + action.payload.expiresIn * 1000;

      return {
        ...state,
        session: {
          ...state.session,
          tokens: action.payload,
          expiresAt,
        },
      };

    case AuthActionType.REFRESH_ERROR:
      // Token refresh failed - logout user
      return {
        ...state,
        session: null,
        isAuthenticated: false,
        error: action.payload,
        biometricEnabled: false,
        biometricType: null,
      };

    // ==================== LOGOUT ====================
    case AuthActionType.LOGOUT:
      console.log('[Auth Reducer] LOGOUT action received');
      console.log('[Auth Reducer] Current state isAuthenticated:', state.isAuthenticated);
      const newState = {
        ...initialAuthState,
        bootstrapState: BootstrapState.READY, // Keep bootstrap ready
      };
      console.log('[Auth Reducer] New state isAuthenticated:', newState.isAuthenticated);
      return newState;

    // ==================== SESSION UPDATE ====================
    case AuthActionType.UPDATE_SESSION:
      if (!state.session) {
        return state;
      }

      return {
        ...state,
        session: {
          ...state.session,
          ...action.payload,
        },
      };

    // ==================== BIOMETRIC ====================
    case AuthActionType.ENABLE_BIOMETRIC:
      return {
        ...state,
        biometricEnabled: true,
        biometricType: action.payload,
      };

    case AuthActionType.DISABLE_BIOMETRIC:
      return {
        ...state,
        biometricEnabled: false,
        biometricType: null,
      };

    // ==================== ERROR HANDLING ====================
    case AuthActionType.CLEAR_ERROR:
      return {
        ...state,
        error: null,
        bootstrapError: null,
      };

    default:
      return state;
  }
};
