/**
 * Password Reset Service
 * Handles forgot password and reset password API calls
 */

import { apiClient } from '../api/apiClient';

/**
 * Backend API Response Format
 */
interface BackendResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

/**
 * Forgot Password Response
 */
interface ForgotPasswordResponse {
  code?: string; // Only in development/testing
  expiresAt: string;
}

/**
 * Request password reset code
 *
 * @param email - User's email address
 * @returns Promise with reset code info (code only included in development)
 */
export const requestPasswordReset = async (
  email: string
): Promise<{ message: string; code?: string; expiresAt?: string }> => {
  try {
    const response = await apiClient.post<BackendResponse<ForgotPasswordResponse>>(
      '/api/auth/forgot-password',
      { email },
      false // requiresAuth = false
    );

    return {
      message: response.message || 'Password reset code sent to your email',
      code: response.data?.code, // Only in development
      expiresAt: response.data?.expiresAt,
    };
  } catch (error: any) {
    throw new Error(
      error.message || 'Failed to send password reset code. Please try again.'
    );
  }
};

/**
 * Resend password reset code
 *
 * @param email - User's email address
 * @returns Promise with reset code info
 */
export const resendResetCode = async (
  email: string
): Promise<{ message: string; code?: string; expiresAt?: string }> => {
  try {
    const response = await apiClient.post<BackendResponse<ForgotPasswordResponse>>(
      '/api/auth/resend-reset-code',
      { email },
      false // requiresAuth = false
    );

    return {
      message: response.message || 'New password reset code sent to your email',
      code: response.data?.code, // Only in development
      expiresAt: response.data?.expiresAt,
    };
  } catch (error: any) {
    throw new Error(
      error.message || 'Failed to resend password reset code. Please try again.'
    );
  }
};

/**
 * Verify reset code
 *
 * @param email - User's email address
 * @param code - 6-digit verification code
 * @returns Promise that resolves to true if code is valid
 */
export const verifyResetCode = async (email: string, code: string): Promise<boolean> => {
  try {
    const response = await apiClient.post<BackendResponse<{ valid: boolean }>>(
      '/api/auth/verify-reset-code',
      { email, code },
      false // requiresAuth = false
    );

    return response.data?.valid || false;
  } catch (error) {
    return false;
  }
};

/**
 * Reset password with code
 *
 * @param email - User's email address
 * @param code - 6-digit verification code
 * @param newPassword - New password
 * @returns Promise that resolves when password is reset
 */
export const resetPassword = async (
  email: string,
  code: string,
  newPassword: string
): Promise<{ message: string }> => {
  try {
    const response = await apiClient.post<BackendResponse<void>>(
      '/api/auth/reset-password',
      { email, code, newPassword },
      false // requiresAuth = false
    );

    return {
      message:
        response.message ||
        'Password has been reset successfully. Please login with your new password.',
    };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to reset password. Please try again.');
  }
};

/**
 * Reset password with token (from email link)
 * Alternative to code-based reset
 *
 * @param token - Reset token from email
 * @param newPassword - New password
 * @returns Promise that resolves when password is reset
 */
export const resetPasswordWithToken = async (
  token: string,
  newPassword: string
): Promise<{ message: string }> => {
  try {
    const response = await apiClient.post<BackendResponse<void>>(
      '/api/auth/reset-password-with-token',
      { token, newPassword },
      false // requiresAuth = false
    );

    return {
      message:
        response.message ||
        'Password has been reset successfully. Please login with your new password.',
    };
  } catch (error: any) {
    throw new Error(error.message || 'Failed to reset password. Please try again.');
  }
};
