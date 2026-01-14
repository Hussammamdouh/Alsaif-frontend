/**
 * Forgot Password Validation
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
