/**
 * Login Feature Types
 * Type definitions for login screen state and props
 */

export interface LoginFormData {
  email: string;
  password: string;
}

export interface LoginFormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export interface LoginFormState {
  data: LoginFormData;
  errors: LoginFormErrors;
  isLoading: boolean;
  showPassword: boolean;
}
