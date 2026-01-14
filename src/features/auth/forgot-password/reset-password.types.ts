/**
 * Reset Password Types
 * Types for password reset screen after receiving reset token
 */

export interface ResetPasswordFormData {
  code: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordFormErrors {
  code?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export interface ResetPasswordFormState {
  data: ResetPasswordFormData;
  errors: ResetPasswordFormErrors;
  isLoading: boolean;
  resetSuccess: boolean;
}
