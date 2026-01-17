/**
 * Login Feature Types
 * Type definitions for login screen state and props
 */

export interface LoginFormData {
  identifier: string;
  password: string;
}

export interface LoginFormErrors {
  identifier?: string;
  password?: string;
  general?: string;
}

export interface LoginFormState {
  data: LoginFormData;
  errors: LoginFormErrors;
  isLoading: boolean;
  showPassword: boolean;
}
