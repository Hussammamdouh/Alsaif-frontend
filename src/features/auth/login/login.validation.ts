/**
 * Login Form Validation
 * Lightweight validation logic without heavy form libraries
 */

import type { LoginFormData, LoginFormErrors } from './login.types';

/**
 * Email validation regex (RFC 5322 simplified)
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Minimum password length for security
 * Matches registration requirements
 */
const MIN_PASSWORD_LENGTH = 8;

/**
 * Validate email format
 */
export const validateEmail = (email: string): string | undefined => {
  if (!email.trim()) {
    return 'Email is required';
  }

  if (!EMAIL_REGEX.test(email)) {
    return 'Please enter a valid email address';
  }

  return undefined;
};

/**
 * Validate password
 */
export const validatePassword = (password: string): string | undefined => {
  if (!password) {
    return 'Password is required';
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }

  return undefined;
};

/**
 * Validate entire login form
 * Returns errors object or undefined if valid
 */
export const validateLoginForm = (
  formData: LoginFormData
): LoginFormErrors | undefined => {
  const errors: LoginFormErrors = {};

  const emailError = validateEmail(formData.email);
  const passwordError = validatePassword(formData.password);

  if (emailError) {
    errors.email = emailError;
  }

  if (passwordError) {
    errors.password = passwordError;
  }

  // Return undefined if no errors (form is valid)
  return Object.keys(errors).length > 0 ? errors : undefined;
};

/**
 * Check if form is valid (for button disable state)
 */
export const isFormValid = (formData: LoginFormData): boolean => {
  return validateLoginForm(formData) === undefined;
};
