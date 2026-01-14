/**
 * Password Strength Utilities
 * Functions to evaluate password strength and provide feedback
 */

export interface PasswordStrength {
  score: number; // 0-4
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong';
  color: string;
  feedback: string[];
}

/**
 * Calculate password strength score
 * Based on length, character variety, and common patterns
 */
export const calculatePasswordStrength = (password: string): PasswordStrength => {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  else if (password.length < 8) {
    feedback.push('Use at least 8 characters');
  }

  // Character variety checks
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (hasLowercase && hasUppercase) score++;
  else if (!hasLowercase || !hasUppercase) {
    feedback.push('Mix uppercase and lowercase letters');
  }

  if (hasNumbers) score++;
  else {
    feedback.push('Include numbers');
  }

  if (hasSpecialChars) score++;
  else {
    feedback.push('Include special characters (!@#$%^&*)');
  }

  // Common patterns check (weak passwords)
  const commonPatterns = [
    /^123/,
    /abc/i,
    /qwerty/i,
    /password/i,
    /admin/i,
    /(.)\1{2,}/, // repeated characters
  ];

  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      score = Math.max(0, score - 1);
      feedback.push('Avoid common patterns');
      break;
    }
  }

  // Normalize score to 0-4
  score = Math.min(4, Math.max(0, score));

  // Determine label and color
  let label: PasswordStrength['label'];
  let color: string;

  switch (score) {
    case 0:
    case 1:
      label = 'Very Weak';
      color = '#ff3b30';
      break;
    case 2:
      label = 'Weak';
      color = '#ff9500';
      break;
    case 3:
      label = 'Fair';
      color = '#ffcc00';
      break;
    case 4:
      label = 'Strong';
      color = '#34c759';
      break;
    default:
      label = 'Very Weak';
      color = '#ff3b30';
  }

  // Add positive feedback for strong passwords
  if (score >= 4 && feedback.length === 0) {
    feedback.push('Excellent password!');
  }

  return {
    score,
    label,
    color,
    feedback,
  };
};

/**
 * Check if password meets minimum requirements
 */
export const meetsMinimumRequirements = (password: string): boolean => {
  return (
    password.length >= 8 &&
    /[a-zA-Z]/.test(password) &&
    /[0-9]/.test(password)
  );
};
