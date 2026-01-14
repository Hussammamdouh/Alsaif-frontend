/**
 * Reset Password Hooks
 * Form state management for password reset with code
 */

import { useState, useCallback, useMemo } from 'react';
import {
  ResetPasswordFormData,
  ResetPasswordFormErrors,
  ResetPasswordFormState,
} from './reset-password.types';
import {
  validateResetCode,
  validatePassword,
  validateConfirmPassword,
} from './reset-password.validation';
import { resetPassword } from '../../../core/services/auth/password.service';

const INITIAL_FORM_DATA: ResetPasswordFormData = {
  code: '',
  password: '',
  confirmPassword: '',
};

const INITIAL_FORM_STATE: ResetPasswordFormState = {
  data: INITIAL_FORM_DATA,
  errors: {},
  isLoading: false,
  resetSuccess: false,
};

/**
 * Custom hook for reset password form management
 */
export const useResetPasswordForm = (email?: string) => {
  const [formState, setFormState] = useState<ResetPasswordFormState>(INITIAL_FORM_STATE);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /**
   * Update reset code field
   */
  const setCode = useCallback((code: string) => {
    // Only allow numbers and limit to 6 digits
    const numericCode = code.replace(/[^0-9]/g, '').slice(0, 6);
    setFormState(prev => ({
      ...prev,
      data: { ...prev.data, code: numericCode },
      errors: { ...prev.errors, code: undefined, general: undefined },
    }));
  }, []);

  /**
   * Update password field
   */
  const setPassword = useCallback((password: string) => {
    setFormState(prev => ({
      ...prev,
      data: { ...prev.data, password },
      errors: { ...prev.errors, password: undefined, general: undefined },
    }));
  }, []);

  /**
   * Update confirm password field
   */
  const setConfirmPassword = useCallback((confirmPassword: string) => {
    setFormState(prev => ({
      ...prev,
      data: { ...prev.data, confirmPassword },
      errors: { ...prev.errors, confirmPassword: undefined, general: undefined },
    }));
  }, []);

  /**
   * Toggle password visibility
   */
  const toggleShowPassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  /**
   * Toggle confirm password visibility
   */
  const toggleShowConfirmPassword = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
  }, []);

  /**
   * Validate entire form
   */
  const validateForm = useCallback((): boolean => {
    const errors: ResetPasswordFormErrors = {};

    const codeError = validateResetCode(formState.data.code);
    if (codeError) {
      errors.code = codeError;
    }

    const passwordError = validatePassword(formState.data.password);
    if (passwordError) {
      errors.password = passwordError;
    }

    const confirmPasswordError = validateConfirmPassword(
      formState.data.password,
      formState.data.confirmPassword
    );
    if (confirmPasswordError) {
      errors.confirmPassword = confirmPasswordError;
    }

    if (Object.keys(errors).length > 0) {
      setFormState(prev => ({ ...prev, errors }));
      return false;
    }

    return true;
  }, [formState.data.code, formState.data.password, formState.data.confirmPassword]);

  /**
   * Submit password reset
   */
  const submitResetPassword = useCallback(
    async (onSuccess: () => void) => {
      // Clear previous errors
      setFormState(prev => ({ ...prev, errors: {}, isLoading: true }));

      // Validate form
      if (!validateForm()) {
        setFormState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      // Validate email is provided
      if (!email) {
        setFormState(prev => ({
          ...prev,
          isLoading: false,
          errors: {
            general: 'Email is required. Please go back and try again.',
          },
        }));
        return;
      }

      try {
        // Call real API
        await resetPassword(email, formState.data.code, formState.data.password);

        setFormState(prev => ({
          ...prev,
          isLoading: false,
          resetSuccess: true,
          errors: {},
        }));

        onSuccess();
      } catch (error) {
        const apiError = error as Error;
        setFormState(prev => ({
          ...prev,
          isLoading: false,
          resetSuccess: false,
          errors: {
            general: apiError.message || 'Failed to reset password. Please try again.',
          },
        }));
      }
    },
    [formState.data.code, formState.data.password, email, validateForm]
  );

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setFormState(INITIAL_FORM_STATE);
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, []);

  /**
   * Check if submit button should be disabled
   */
  const isSubmitDisabled = useMemo(() => {
    return (
      !formState.data.code.trim() ||
      !formState.data.password.trim() ||
      !formState.data.confirmPassword.trim() ||
      formState.isLoading ||
      formState.resetSuccess
    );
  }, [
    formState.data.code,
    formState.data.password,
    formState.data.confirmPassword,
    formState.isLoading,
    formState.resetSuccess,
  ]);

  return {
    formState,
    showPassword,
    showConfirmPassword,
    setCode,
    setPassword,
    setConfirmPassword,
    toggleShowPassword,
    toggleShowConfirmPassword,
    submitResetPassword,
    resetForm,
    isSubmitDisabled,
  };
};
