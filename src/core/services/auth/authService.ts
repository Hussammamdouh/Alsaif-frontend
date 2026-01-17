/**
 * Authentication Service
 * Handles all auth-related API calls
 */

import { apiClient, refreshAccessToken as unifiedRefresh } from '../api/apiClient';
import type { LoginCredentials, LoginResponse, AuthError } from './auth.types';
import { loadAuthSession } from '../../../app/auth/auth.storage';

/**
 * Backend API Response Format
 */
interface BackendResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

/**
 * Backend Login/Register Response
 */
interface BackendAuthResponse {
  user: {
    _id: string;
    id: string;
    name: string;
    email: string;
    role: string;
    isActive: boolean;
  };
  token: string; // For backward compatibility
  accessToken: string;
  refreshToken: string;
}

/**
 * Login user with email and password
 *
 * @param credentials - User login credentials
 * @returns Promise with user data and tokens
 */
export const login = async (
  credentials: LoginCredentials
): Promise<LoginResponse> => {
  try {
    const response = await apiClient.post<BackendResponse<BackendAuthResponse>>(
      '/api/auth/login',
      credentials,
      false // requiresAuth = false for login
    );

    // Transform backend response to match app's expected format
    const { user, accessToken, refreshToken } = response.data;

    return {
      user: {
        id: user.id || user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: 900, // 15 minutes (900 seconds) - matches backend JWT expiration
      },
    };
  } catch (error: any) {
    // Transform API error to AuthError
    const authError: AuthError = {
      code: error.statusCode === 401 ? 'INVALID_CREDENTIALS' : 'LOGIN_FAILED',
      message: error.message || 'Login failed. Please try again.',
    };
    throw authError;
  }
};

/**
 * Logout user
 *
 * @param refreshToken - Refresh token to invalidate
 */
export const logout = async (refreshToken: string): Promise<void> => {
  try {
    await apiClient.post(
      '/api/auth/logout',
      { refreshToken },
      false // requiresAuth = false - allows logout even if access token is expired
    );
  } catch (error) {
    // Log error but don't throw - logout should succeed even if API call fails
    console.error('[AuthService] Logout error:', error);
  }
};

/**
 * Refresh access token
 *
 * @param token - Refresh token
 * @returns New access and refresh tokens
 */
export const refreshToken = async (
  token: string
): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> => {
  try {
    // Calling the unified refresh function which handles atomic requests and state sync
    const accessToken = await unifiedRefresh();

    // After a successful refresh, the new tokens are already saved in storage
    const session = await loadAuthSession();

    if (!session) {
      throw new Error('Session lost after refresh');
    }

    return {
      accessToken: session.tokens.accessToken,
      refreshToken: session.tokens.refreshToken,
      expiresIn: session.tokens.expiresIn,
    };
  } catch (error: any) {
    const authError: AuthError = {
      code: 'REFRESH_FAILED',
      message: error.message || 'Session expired. Please login again.',
    };
    throw authError;
  }
};
