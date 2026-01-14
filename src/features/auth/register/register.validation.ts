/**
 * Registration Form Validation
 * Real-world validation rules for secure user registration
 */

import type { RegisterFormData, RegisterFormErrors, PasswordStrength } from './register.types';

/**
 * Email validation regex (RFC 5322 simplified)
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Password requirements
 */
const MIN_PASSWORD_LENGTH = 8;
const PASSWORD_UPPERCASE_REGEX = /[A-Z]/;
const PASSWORD_LOWERCASE_REGEX = /[a-z]/;
const PASSWORD_NUMBER_REGEX = /[0-9]/;
const PASSWORD_SPECIAL_REGEX = /[!@#$%^&*(),.?":{}|<>]/;

/**
 * Common passwords to reject
 */
const COMMON_PASSWORDS = new Set([
  'password', 'password123', '123456', '12345678', 'qwerty', 'abc123',
  'monkey', '1234567', 'letmein', 'trustno1', 'dragon', 'baseball',
  'iloveyou', 'master', 'sunshine', 'ashley', 'bailey', 'passw0rd',
  'shadow', '123123', '654321', 'superman', 'qazwsx', 'michael',
]);

/**
 * Validate full name
 * Must be at least 2 words (first name + last name)
 */
export const validateFullName = (fullName: string): string | undefined => {
  const trimmed = fullName.trim();

  if (!trimmed) {
    return 'Full name is required';
  }

  const words = trimmed.split(/\s+/);
  if (words.length < 2) {
    return 'Please enter your first and last name';
  }

  if (trimmed.length < 3) {
    return 'Name must be at least 3 characters';
  }

  return undefined;
};

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
 * Calculate password strength
 */
export const calculatePasswordStrength = (password: string): PasswordStrength => {
  if (!password) {
    return 'weak';
  }

  let score = 0;

  // Length check
  if (password.length >= MIN_PASSWORD_LENGTH) {
    score += 1;
  }
  if (password.length >= 12) {
    score += 1;
  }

  // Character variety checks
  if (PASSWORD_UPPERCASE_REGEX.test(password) || PASSWORD_LOWERCASE_REGEX.test(password)) {
    score += 1;
  }
  if (PASSWORD_NUMBER_REGEX.test(password)) {
    score += 1;
  }
  if (PASSWORD_SPECIAL_REGEX.test(password)) {
    score += 1;
  }

  // Determine strength
  if (score <= 2) {
    return 'weak';
  }
  if (score <= 4) {
    return 'medium';
  }
  return 'strong';
};

/**
 * Validate password
 * Must be at least 8 characters, include uppercase, lowercase, number, and special character
 */
export const validatePassword = (password: string): string | undefined => {
  if (!password) {
    return 'Password is required';
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }

  // Check for common passwords
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    return 'This password is too common. Please choose a stronger password';
  }

  if (!PASSWORD_UPPERCASE_REGEX.test(password)) {
    return 'Password must include at least one uppercase letter';
  }

  if (!PASSWORD_LOWERCASE_REGEX.test(password)) {
    return 'Password must include at least one lowercase letter';
  }

  if (!PASSWORD_NUMBER_REGEX.test(password)) {
    return 'Password must include at least one number';
  }

  if (!PASSWORD_SPECIAL_REGEX.test(password)) {
    return 'Password must include at least one special character (!@#$%^&*...)';
  }

  return undefined;
};

/**
 * Validate confirm password
 * Must match the password field
 */
export const validateConfirmPassword = (
  password: string,
  confirmPassword: string
): string | undefined => {
  if (!confirmPassword) {
    return 'Please confirm your password';
  }

  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }

  return undefined;
};

/**
 * Validate terms agreement
 */
export const validateTermsAgreement = (agreed: boolean): string | undefined => {
  if (!agreed) {
    return 'You must agree to the terms and conditions';
  }

  return undefined;
};

/**
 * Validate entire registration form
 * Returns errors object or undefined if valid
 */
export const validateRegisterForm = (
  formData: RegisterFormData
): RegisterFormErrors | undefined => {
  const errors: RegisterFormErrors = {};

  const fullNameError = validateFullName(formData.fullName);
  const emailError = validateEmail(formData.email);
  const passwordError = validatePassword(formData.password);
  const confirmPasswordError = validateConfirmPassword(
    formData.password,
    formData.confirmPassword
  );
  const termsError = validateTermsAgreement(formData.agreeToTerms);
  const nationalityError = !formData.nationality?.trim() ? 'Nationality is required' : undefined;

  if (fullNameError) {
    errors.fullName = fullNameError;
  }

  if (emailError) {
    errors.email = emailError;
  }

  if (passwordError) {
    errors.password = passwordError;
  }

  if (confirmPasswordError) {
    errors.confirmPassword = confirmPasswordError;
  }

  if (termsError) {
    errors.agreeToTerms = termsError;
  }

  if (nationalityError) {
    errors.nationality = nationalityError;
  }

  // Return undefined if no errors (form is valid)
  return Object.keys(errors).length > 0 ? errors : undefined;
};

/**
 * Check if form is valid (for button disable state)
 */
export const isFormValid = (formData: RegisterFormData): boolean => {
  return validateRegisterForm(formData) === undefined;
};
