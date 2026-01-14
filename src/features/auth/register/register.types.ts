/**
 * Registration Feature Types
 * Type definitions for registration screen state and props
 */

export interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  nationality: string;
  agreeToTerms: boolean;
}

export interface RegisterFormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  nationality?: string;
  agreeToTerms?: string;
  general?: string;
}

export interface RegisterFormState {
  data: RegisterFormData;
  errors: RegisterFormErrors;
  isLoading: boolean;
  showPassword: boolean;
  showConfirmPassword: boolean;
  passwordStrength: PasswordStrength;
}

export type PasswordStrength = 'weak' | 'medium' | 'strong';
