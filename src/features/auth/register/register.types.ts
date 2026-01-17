/**
 * Registration Feature Types
 * Type definitions for registration screen state and props
  */

import { Country } from '../../../core/constants/countries';

export interface RegisterFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  country: Country | null;
  agreeToTerms: boolean;
}

export interface RegisterFormErrors {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  confirmPassword?: string;
  country?: string;
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
