/**
 * Forgot Password Hooks
 * Form state management for password reset request
 */

import { useState, useCallback, useMemo } from 'react';
import {
  ForgotPasswordFormData,
  ForgotPasswordFormErrors,
  ForgotPasswordFormState,
} from './forgot-password.types';
import { validateEmail } from './forgot-password.validation';
import { requestPasswordReset } from '../../../core/services/auth/password.service';

const INITIAL_FORM_DATA: ForgotPasswordFormData = {
  email: '',
};

const INITIAL_FORM_STATE: ForgotPasswordFormState = {
  data: INITIAL_FORM_DATA,
  errors: {},
  isLoading: false,
  emailSent: false,
};

/**
 * Custom hook for forgot password form management
 */
export const useForgotPasswordForm = () => {
  const [formState, setFormState] = useState<ForgotPasswordFormState>(INITIAL_FORM_STATE);

  /**
   * Update email field
   */
  const setEmail = useCallback((email: string) => {
    setFormState(prev => ({
      ...prev,
      data: { ...prev.data, email },
      errors: { ...prev.errors, email: undefined, general: undefined },
      emailSent: false, // Reset sent state when user edits email
    }));
  }, []);

  /**
   * Validate entire form
   */
  const validateForm = useCallback((): boolean => {
    const errors: ForgotPasswordFormErrors = {};

    const emailError = validateEmail(formState.data.email);
    if (emailError) {
      errors.email = emailError;
    }

    if (Object.keys(errors).length > 0) {
      setFormState(prev => ({ ...prev, errors }));
      return false;
    }

    return true;
  }, [formState.data.email]);

  /**
   * Submit forgot password request
   */
  const submitForgotPassword = useCallback(
    async (onSuccess: () => void) => {
      // Clear previous errors
      setFormState(prev => ({ ...prev, errors: {}, isLoading: true }));

      // Validate form
      if (!validateForm()) {
        setFormState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        // Call real API
        const result = await requestPasswordReset(formState.data.email);

        // Log code in development (for testing without email)
        if (result.code) {
          console.log('[ForgotPassword] Reset code:', result.code);
        }

        setFormState(prev => ({
          ...prev,
          isLoading: false,
          emailSent: true,
          errors: {},
        }));

        onSuccess();
      } catch (error) {
        const apiError = error as Error;
        setFormState(prev => ({
          ...prev,
          isLoading: false,
          emailSent: false,
          errors: {
            general: apiError.message || 'Failed to send reset email. Please try again.',
          },
        }));
      }
    },
    [formState.data.email, validateForm]
  );

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setFormState(INITIAL_FORM_STATE);
  }, []);

  /**
   * Check if submit button should be disabled
   */
  const isSubmitDisabled = useMemo(() => {
    return !formState.data.email.trim() || formState.isLoading || formState.emailSent;
  }, [formState.data.email, formState.isLoading, formState.emailSent]);

  return {
    formState,
    setEmail,
    submitForgotPassword,
    resetForm,
    isSubmitDisabled,
  };
};
