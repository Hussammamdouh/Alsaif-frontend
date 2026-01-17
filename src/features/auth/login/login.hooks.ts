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
      identifier: '',
      password: '',
    },
    errors: {},
    isLoading: false,
    showPassword: false,
  });

  /**
   * Update identifier field
   * Clears error when user starts typing
   */
  const setIdentifier = useCallback((identifier: string) => {
    setFormState(prev => ({
      ...prev,
      data: { ...prev.data, identifier },
      errors: { ...prev.errors, identifier: undefined, general: undefined },
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
    const identifierError = !formState.data.identifier.trim() ? 'Email or Phone Number is required' : undefined;
    const passwordError = validatePassword(formState.data.password);

    if (identifierError || passwordError) {
      setFormState(prev => ({
        ...prev,
        errors: {
          identifier: identifierError,
          password: passwordError,
        },
      }));
      return false;
    }

    return true;
  }, [formState.data.identifier, formState.data.password]);

  /**
   * Submit login form
   * Validates inputs and calls auth service with rate limiting
   */
  const submitLogin = useCallback(
    async (onSuccess: (identifier: string) => void) => {
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
        formState.data.identifier.toLowerCase(),
        RATE_LIMIT_CONFIG.LOGIN.maxAttempts,
        RATE_LIMIT_CONFIG.LOGIN.windowMs
      );

      if (!rateLimitResult.allowed) {
        const remainingTime = rateLimiter.getRemainingTimeString(
          formState.data.identifier.toLowerCase(),
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
        await login(formState.data.identifier, formState.data.password);

        // Success - reset rate limit
        rateLimiter.reset(formState.data.identifier.toLowerCase());

        // Call the onSuccess callback
        onSuccess(formState.data.identifier);
      } catch (error) {
        // Record failed attempt
        rateLimiter.recordAttempt(
          formState.data.identifier.toLowerCase(),
          RATE_LIMIT_CONFIG.LOGIN.windowMs
        );

        // Handle auth errors
        const authError = error as Error;
        const remainingAttempts = rateLimiter.canAttempt(
          formState.data.identifier.toLowerCase(),
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
    [formState.data.identifier, formState.data.password, login, validateForm]
  );

  /**
   * Check if submit button should be disabled
   */
  const isSubmitDisabled = useMemo((): boolean => {
    const { identifier, password } = formState.data;
    return (
      !identifier.trim() ||
      !password.trim() ||
      formState.isLoading
    );
  }, [formState.data, formState.isLoading]);

  return {
    identifier: formState.data.identifier,
    password: formState.data.password,
    errors: formState.errors,
    isLoading: formState.isLoading || authState.isLoading,
    showPassword: formState.showPassword,
    setIdentifier,
    setPassword,
    toggleShowPassword,
    submitLogin,
    isSubmitDisabled,
  };
};
