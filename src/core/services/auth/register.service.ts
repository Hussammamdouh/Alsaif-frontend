/**
 * Registration Service
 * Handles user registration API calls
 */

import { apiClient } from '../api/apiClient';
import type { User, AuthTokens, AuthError } from './auth.types';

/**
 * Registration request payload
 */
export interface RegisterCredentials {
  fullName: string;
  email: string;
  password: string;
  nationality: string;
  phoneNumber?: string;
  country?: string;
}

/**
 * Registration response
 */
export interface RegisterResponse {
  user: User;
  tokens: AuthTokens;
  message: string;
}

/**
 * Backend API Response Format
 */
interface BackendResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

/**
 * Backend Register Response
 */
interface BackendRegisterResponse {
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
 * Register a new user
 *
 * @param credentials - User registration data
 * @returns Promise with user data and tokens
 */
export const register = async (
  credentials: RegisterCredentials
): Promise<RegisterResponse> => {
  try {
    // Transform fullName to name for backend
    const requestBody = {
      name: credentials.fullName,
      email: credentials.email,
      password: credentials.password,
      nationality: credentials.nationality,
      phoneNumber: credentials.phoneNumber,
      country: credentials.country,
    };

    const response = await apiClient.post<BackendResponse<BackendRegisterResponse>>(
      '/api/auth/register',
      requestBody,
      false // requiresAuth = false for registration
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
      message: response.message || 'Registration successful! Welcome to Vertex Capital.',
    };
  } catch (error: any) {
    // Transform API error to AuthError
    let errorCode = 'REGISTRATION_FAILED';
    let errorMessage = 'Registration failed. Please try again.';

    if (error.statusCode === 409 || error.message?.includes('already exists')) {
      errorCode = 'EMAIL_EXISTS';
      errorMessage = 'An account with this email already exists';
    } else if (error.message) {
      errorMessage = error.message;
    }

    const authError: AuthError = {
      code: errorCode,
      message: errorMessage,
    };
    throw authError;
  }
};

/**
 * Check if email is available
 * Useful for real-time validation during registration
 *
 * Note: Backend doesn't have this endpoint yet,
 * so we'll catch the error during registration
 */
export const checkEmailAvailability = async (_email: string): Promise<boolean> => {
  // Since backend doesn't have a dedicated check-email endpoint,
  // we'll return true and let the registration endpoint handle validation
  // This can be improved if backend adds a check-email endpoint
  return true;
};
