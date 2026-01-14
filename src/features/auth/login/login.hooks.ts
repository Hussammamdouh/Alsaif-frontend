/**
 * Login Hooks
 * Custom hooks for login screen logic
 */

import { useState, useCallback, useMemo } from 'react';
import { useAuth } from '../../../app/auth';
import type { LoginFormState } from './login.types';
import { validateEmail, validatePassword } from './login.validation';
import { rateLimiter, RATE_LIMIT_CONFIG } from '../../../core/utils/rate-limiter';

/**
 * Custom hook for login form management
 * Handles form state, validation, and submission
 */
export const useLoginForm = () => {
  const { login, state: authState } = useAuth();
  const [formState, setFormState] = useState<LoginFormState>({
    data: {
      email: '',
      password: '',
    },
    errors: {},
    isLoading: false,
    showPassword: false,
  });

  /**
   * Update email field
   * Clears email error when user starts typing
   */
  const setEmail = useCallback((email: string) => {
    setFormState(prev => ({
      ...prev,
      data: { ...prev.data, email },
      errors: { ...prev.errors, email: undefined, general: undefined },
    }));
  }, []);

  /**
   * Update password field
   * Clears password error when user starts typing
   */
  const setPassword = useCallback((password: string) => {
    setFormState(prev => ({
      ...prev,
      data: { ...prev.data, password },
      errors: { ...prev.errors, password: undefined, general: undefined },
    }));
  }, []);

  /**
   * Toggle password visibility
   */
  const toggleShowPassword = useCallback(() => {
    setFormState(prev => ({
      ...prev,
      showPassword: !prev.showPassword,
    }));
  }, []);

  /**
   * Validate form fields
   * Returns true if valid, false otherwise
   */
  const validateForm = useCallback((): boolean => {
    const emailError = validateEmail(formState.data.email);
    const passwordError = validatePassword(formState.data.password);

    if (emailError || passwordError) {
      setFormState(prev => ({
        ...prev,
        errors: {
          email: emailError,
          password: passwordError,
        },
      }));
      return false;
    }

    return true;
  }, [formState.data.email, formState.data.password]);

  /**
   * Submit login form
   * Validates inputs and calls auth service with rate limiting
   */
  const submitLogin = useCallback(
    async (onSuccess: (email: string) => void) => {
      // Clear previous errors
      setFormState(prev => ({
        ...prev,
        errors: {},
      }));

      // Validate form
      if (!validateForm()) {
        return;
      }

      // Check rate limit
      const rateLimitResult = rateLimiter.canAttempt(
        formState.data.email.toLowerCase(),
        RATE_LIMIT_CONFIG.LOGIN.maxAttempts,
        RATE_LIMIT_CONFIG.LOGIN.windowMs
      );

      if (!rateLimitResult.allowed) {
        const remainingTime = rateLimiter.getRemainingTimeString(
          formState.data.email.toLowerCase(),
          RATE_LIMIT_CONFIG.LOGIN.windowMs
        );
        setFormState(prev => ({
          ...prev,
          errors: {
            general: `Too many login attempts. Please try again in ${remainingTime}.`,
          },
        }));
        return;
      }

      // Set loading state
      setFormState(prev => ({ ...prev, isLoading: true }));

      try {
        // Call auth login action
        await login(formState.data.email, formState.data.password);

        // Success - reset rate limit for this email
        rateLimiter.reset(formState.data.email.toLowerCase());

        // Call the onSuccess callback with user email
        onSuccess(formState.data.email);
      } catch (error) {
        // Record failed attempt
        rateLimiter.recordAttempt(
          formState.data.email.toLowerCase(),
          RATE_LIMIT_CONFIG.LOGIN.windowMs
        );

        // Handle auth errors
        const authError = error as Error;
        const remainingAttempts = rateLimiter.canAttempt(
          formState.data.email.toLowerCase(),
          RATE_LIMIT_CONFIG.LOGIN.maxAttempts,
          RATE_LIMIT_CONFIG.LOGIN.windowMs
        ).remainingAttempts;

        let errorMessage = authError.message || 'Login failed. Please try again.';
        if (remainingAttempts > 0) {
          errorMessage += ` (${remainingAttempts} attempt${remainingAttempts > 1 ? 's' : ''} remaining)`;
        }

        setFormState(prev => ({
          ...prev,
          isLoading: false,
          errors: {
            general: errorMessage,
          },
        }));
      }
    },
    [formState.data.email, formState.data.password, login, validateForm]
  );

  /**
   * Check if submit button should be disabled
   */
  const isSubmitDisabled = useMemo((): boolean => {
    const { email, password } = formState.data;
    return (
      !email.trim() ||
      !password.trim() ||
      formState.isLoading
    );
  }, [formState.data, formState.isLoading]);

  return {
    email: formState.data.email,
    password: formState.data.password,
    errors: formState.errors,
    isLoading: formState.isLoading || authState.isLoading,
    showPassword: formState.showPassword,
    setEmail,
    setPassword,
    toggleShowPassword,
    submitLogin,
    isSubmitDisabled,
  };
};
