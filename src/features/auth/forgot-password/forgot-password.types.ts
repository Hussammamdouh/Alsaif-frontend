/**
 * Forgot Password Types
 */

export interface ForgotPasswordFormData {
  email: string;
}

export interface ForgotPasswordFormErrors {
  email?: string;
  general?: string;
}

export interface ForgotPasswordFormState {
  data: ForgotPasswordFormData;
  errors: ForgotPasswordFormErrors;
  isLoading: boolean;
  emailSent: boolean;
}
