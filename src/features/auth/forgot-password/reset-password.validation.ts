/**
 * Reset Password Validation
 */

const CODE_LENGTH = 6;
const CODE_REGEX = /^[0-9]{6}$/;

const PASSWORD_UPPERCASE_REGEX = /[A-Z]/;
const PASSWORD_LOWERCASE_REGEX = /[a-z]/;
const PASSWORD_NUMBER_REGEX = /[0-9]/;
const PASSWORD_SPECIAL_REGEX = /[!@#$%^&*(),.?":{}|<>]/;

const COMMON_PASSWORDS = new Set([
  'password',
  'password123',
  '123456',
  '12345678',
  'qwerty',
  'abc123',
  'monkey',
  '1234567',
  'letmein',
  'trustno1',
  'dragon',
  'baseball',
  'iloveyou',
  'master',
  'sunshine',
  'ashley',
  'bailey',
  'passw0rd',
  'shadow',
  '123123',
  '654321',
  'superman',
  'qazwsx',
  'michael',
  'football',
]);

/**
 * Validate reset code format
 */
export const validateResetCode = (code: string): string | undefined => {
  if (!code.trim()) {
    return 'Reset code is required';
  }

  if (code.length !== CODE_LENGTH) {
    return `Reset code must be ${CODE_LENGTH} digits`;
  }

  if (!CODE_REGEX.test(code)) {
    return 'Reset code must contain only numbers';
  }

  return undefined;
};

/**
 * Validate new password
 */
export const validatePassword = (password: string): string | undefined => {
  if (!password) {
    return 'Password is required';
  }

  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }

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
    return 'Password must include at least one special character (!@#$%^&*(),.?":{}|<>)';
  }

  return undefined;
};

/**
 * Validate password confirmation
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
