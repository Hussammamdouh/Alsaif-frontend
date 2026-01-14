/**
 * Change Password Service
 * Handles password change for authenticated users
 */

import { apiClient } from '../api/apiClient';

/**
 * Backend API Response Format
 */
interface BackendResponse {
  success: boolean;
  message?: string;
}

/**
 * Change password for authenticated user
 *
 * @param currentPassword - Current password
 * @param newPassword - New password
 * @returns Promise with success message
 */
export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<{ message: string }> => {
  try {
    const response = await apiClient.post<BackendResponse>(
      '/api/auth/change-password',
      {
        currentPassword,
        newPassword,
      },
      true // requiresAuth = true (protected endpoint)
    );

    return {
      message: response.message || 'Password changed successfully',
    };
  } catch (error: any) {
    throw new Error(
      error.message || 'Failed to change password. Please try again.'
    );
  }
};
