/**
 * Auth Actions
 * Business logic for authentication operations
 * Coordinates between API, storage, and state
 */

import { Dispatch } from 'react';
import {
  AuthAction,
  AuthActionType,
  AuthSession,
  AuthTokens,
  UserRole,
} from './auth.types';
import {
  saveAuthSession,
  deleteAuthSession,
  clearAllAuthData,
  isSessionValid,
  saveBiometricPreference,
} from './auth.storage';
import {
  checkBiometricAvailability,
  validateBiometricSecurity,
  handleBiometricError,
} from './auth.biometric';
import { bootstrapApp, bootstrapWithBiometric } from './auth.bootstrap';

// Import auth services
import { login as loginApi, logout as logoutApi, refreshToken as refreshTokenApi } from '../../core/services/auth/authService';
import { register as registerApi } from '../../core/services/auth/register.service';

/**
 * Bootstrap Action
 * Initializes app and restores session if available
 */
export const bootstrap = async (dispatch: Dispatch<AuthAction>) => {
  dispatch({ type: AuthActionType.BOOTSTRAP_START });

  try {
    const result = await bootstrapApp();

    // Check if we should attempt token refresh
    if (result.session && !isSessionValid(result.session)) {
      // Token expired - attempt refresh
      try {
        await refreshTokens(dispatch, result.session.tokens.refreshToken);
        // Refresh succeeded - load the new session
        const updatedResult = await bootstrapApp();
        dispatch({
          type: AuthActionType.BOOTSTRAP_SUCCESS,
          payload: updatedResult.session,
        });
        return;
      } catch {
        // Refresh failed - clear session
        await deleteAuthSession();
        dispatch({ type: AuthActionType.BOOTSTRAP_SUCCESS, payload: null });
        return;
      }
    }

    dispatch({
      type: AuthActionType.BOOTSTRAP_SUCCESS,
      payload: result.session,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Bootstrap failed';
    dispatch({ type: AuthActionType.BOOTSTRAP_ERROR, payload: message });
  }
};

/**
 * Login Action
 * Authenticates user with email and password
 */
export const login = async (
  dispatch: Dispatch<AuthAction>,
  identifier: string,
  password: string
) => {
  dispatch({ type: AuthActionType.LOGIN_START });

  try {
    // Call API
    const response = await loginApi({ identifier, password });

    // Create session
    const now = Date.now();
    const session: AuthSession = {
      user: {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        role: response.user.role as UserRole,
      },
      tokens: response.tokens,
      issuedAt: now,
      expiresAt: now + response.tokens.expiresIn * 1000,
    };

    // Save to secure storage
    await saveAuthSession(session, false);

    dispatch({ type: AuthActionType.LOGIN_SUCCESS, payload: session });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Login failed. Please try again.';
    dispatch({ type: AuthActionType.LOGIN_ERROR, payload: message });
    throw error;
  }
};

/**
 * Register Action
 * Creates new user account
 */
export const registerUser = async (
  dispatch: Dispatch<AuthAction>,
  fullName: string,
  email: string,
  password: string,
  phoneNumber?: string,
  country?: string,
  nationality?: string
) => {
  dispatch({ type: AuthActionType.REGISTER_START });

  try {
    // Call API
    const response = await registerApi({ fullName, email, password, nationality, phoneNumber, country });

    // Create session
    const now = Date.now();
    const session: AuthSession = {
      user: {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        role: response.user.role as UserRole,
      },
      tokens: response.tokens,
      issuedAt: now,
      expiresAt: now + response.tokens.expiresIn * 1000,
    };

    // Save to secure storage
    await saveAuthSession(session, false);

    dispatch({ type: AuthActionType.REGISTER_SUCCESS, payload: session });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Registration failed. Please try again.';
    dispatch({ type: AuthActionType.REGISTER_ERROR, payload: message });
    throw error;
  }
};

/**
 * Logout Action
 * Ends user session and clears all auth data
 */
export const logout = async (dispatch: Dispatch<AuthAction>) => {
  console.log('[Auth Actions] logout() ENTERED');
  try {
    // Get current session to extract refresh token
    console.log('[Auth Actions] STEP 1: Bootstrapping app to get session...');
    const result = await bootstrapApp();
    console.log('[Auth Actions] STEP 1 Results:', !!result, !!result?.session);

    const refreshToken = result.session?.tokens.refreshToken;
    console.log('[Auth Actions] STEP 2: Refresh token found:', !!refreshToken);

    // Call API to invalidate tokens on backend
    if (refreshToken) {
      console.log('[Auth Actions] STEP 3: Calling logout API...');
      try {
        await logoutApi(refreshToken);
        console.log('[Auth Actions] STEP 3: API call success');
      } catch (apiErr) {
        console.error('[Auth Actions] STEP 3: API call failed (continuing anyway):', apiErr);
      }
    } else {
      console.warn('[Auth Actions] STEP 3: No refresh token, skipping API call');
    }

    // Clear all secure storage
    console.log('[Auth Actions] STEP 4: Clearing all auth data from storage...');
    try {
      await clearAllAuthData();
      console.log('[Auth Actions] STEP 4: Storage cleared');
    } catch (storageErr) {
      console.error('[Auth Actions] STEP 4: Failed to clear storage:', storageErr);
    }

    // Dispatch logout action to update state
    console.log('[Auth Actions] STEP 5: Dispatching LOGOUT action to reducer...');
    dispatch({ type: AuthActionType.LOGOUT });
    console.log('[Auth Actions] logout() FINISHED SUCCESS');
  } catch (error) {
    console.error('[Auth Actions] logout() CRITICAL FAILURE:', error);
    // Always clear storage and dispatch logout even if API call fails
    try {
      await clearAllAuthData();
    } catch (e) { }
    dispatch({ type: AuthActionType.LOGOUT });
  }
};

/**
 * Refresh Tokens Action
 * Refreshes access token using refresh token
 */
export const refreshTokens = async (
  dispatch: Dispatch<AuthAction>,
  refreshToken: string
): Promise<void> => {
  dispatch({ type: AuthActionType.REFRESH_START });

  try {
    // Call refresh token API
    const response = await refreshTokenApi(refreshToken);

    const newTokens: AuthTokens = {
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      expiresIn: response.expiresIn,
    };

    dispatch({ type: AuthActionType.REFRESH_SUCCESS, payload: newTokens });

    // Save updated session
    const session = await bootstrapApp();
    if (session.session) {
      await saveAuthSession(session.session, false);
    }
  } catch (error) {
    const message = 'Token refresh failed';
    dispatch({ type: AuthActionType.REFRESH_ERROR, payload: message });
    throw error;
  }
};

/**
 * Enable Biometric Action
 * Enables biometric authentication for user
 */
export const enableBiometric = async (dispatch: Dispatch<AuthAction>) => {
  try {
    // Check availability
    const availability = await checkBiometricAvailability();
    if (!availability.available) {
      throw new Error(
        availability.error || 'Biometric authentication not available'
      );
    }

    // Validate security
    const isSecure = await validateBiometricSecurity();
    if (!isSecure) {
      throw new Error('Biometric authentication is not secure on this device');
    }

    // Save preference
    await saveBiometricPreference(true);

    // Re-save session with biometric protection
    const result = await bootstrapApp();
    if (result.session) {
      await saveAuthSession(result.session, true);
    }

    dispatch({
      type: AuthActionType.ENABLE_BIOMETRIC,
      payload: availability.biometryType!,
    });
  } catch (error) {
    const message = handleBiometricError(error);
    throw new Error(message);
  }
};

/**
 * Disable Biometric Action
 * Disables biometric authentication
 */
export const disableBiometric = async (dispatch: Dispatch<AuthAction>) => {
  try {
    // Clear biometric preference
    await saveBiometricPreference(false);

    // Re-save session without biometric protection
    const result = await bootstrapApp();
    if (result.session) {
      await saveAuthSession(result.session, false);
    }

    dispatch({ type: AuthActionType.DISABLE_BIOMETRIC });
  } catch (error) {
    console.error('[Auth] Failed to disable biometric:', error);
    throw error;
  }
};

/**
 * Login with Biometric Action
 * Authenticates user using biometric credentials
 */
export const loginWithBiometric = async (dispatch: Dispatch<AuthAction>) => {
  dispatch({ type: AuthActionType.LOGIN_START });

  try {
    const session = await bootstrapWithBiometric();

    if (!session) {
      throw new Error('Biometric authentication failed');
    }

    // Validate session
    if (!isSessionValid(session)) {
      // Try to refresh
      await refreshTokens(dispatch, session.tokens.refreshToken);
      return;
    }

    dispatch({ type: AuthActionType.LOGIN_SUCCESS, payload: session });
  } catch (error) {
    const message = handleBiometricError(error);
    dispatch({ type: AuthActionType.LOGIN_ERROR, payload: message });
    throw error;
  }
};

/**
 * Clear Error Action
 * Clears auth error state
 */
export const clearError = (dispatch: Dispatch<AuthAction>) => {
  dispatch({ type: AuthActionType.CLEAR_ERROR });
};
