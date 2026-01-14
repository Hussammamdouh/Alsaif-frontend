/**
 * Registration Hooks
 * Custom hooks for registration screen logic
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useAuth } from '../../../app/auth';
import type { RegisterFormState } from './register.types';
import {
  validateFullName,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateTermsAgreement,
  calculatePasswordStrength,
} from './register.validation';

/**
 * Custom hook for registration form management
 * Handles form state, validation, and submission
 */
export const useRegisterForm = () => {
  const { register, state: authState } = useAuth();
  const [formState, setFormState] = useState<RegisterFormState>({
    data: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      nationality: '',
      agreeToTerms: false,
    },
    errors: {},
    isLoading: false,
    showPassword: false,
    showConfirmPassword: false,
    passwordStrength: 'weak',
  });

  /**
   * Update full name field
   * Clears error when user starts typing
   */
  const setFullName = useCallback((fullName: string) => {
    setFormState(prev => ({
      ...prev,
      data: { ...prev.data, fullName },
      errors: { ...prev.errors, fullName: undefined, general: undefined },
    }));
  }, []);

  /**
   * Update nationality field
   * Clears error when user starts typing
   */
  const setNationality = useCallback((nationality: string) => {
    setFormState(prev => ({
      ...prev,
      data: { ...prev.data, nationality },
      errors: { ...prev.errors, nationality: undefined, general: undefined },
    }));
  }, []);

  /**
   * Update email field
   * Clears error when user starts typing
   */
  const setEmail = useCallback((email: string) => {
    setFormState(prev => ({
      ...prev,
      data: { ...prev.data, email },
      errors: { ...prev.errors, email: undefined, general: undefined },
    }));
  }, []);

  /**
   * Debounce timer for password strength calculation
   */
  const strengthTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Update password field
   * Clears error and recalculates strength with debounce
   */
  const setPassword = useCallback((password: string) => {
    // Update password immediately
    setFormState(prev => ({
      ...prev,
      data: { ...prev.data, password },
      errors: { ...prev.errors, password: undefined, general: undefined },
    }));

    // Debounce strength calculation (300ms)
    if (strengthTimerRef.current) {
      clearTimeout(strengthTimerRef.current);
    }

    strengthTimerRef.current = setTimeout(() => {
      const strength = calculatePasswordStrength(password);
      setFormState(prev => ({
        ...prev,
        passwordStrength: strength,
      }));
    }, 300);
  }, []);

  /**
   * Cleanup debounce timer on unmount
   */
  useEffect(() => {
    return () => {
      if (strengthTimerRef.current) {
        clearTimeout(strengthTimerRef.current);
      }
    };
  }, []);

  /**
   * Update confirm password field
   * Clears error when user starts typing
   */
  const setConfirmPassword = useCallback((confirmPassword: string) => {
    setFormState(prev => ({
      ...prev,
      data: { ...prev.data, confirmPassword },
      errors: { ...prev.errors, confirmPassword: undefined, general: undefined },
    }));
  }, []);

  /**
   * Toggle terms agreement
   */
  const toggleAgreeToTerms = useCallback(() => {
    setFormState(prev => ({
      ...prev,
      data: { ...prev.data, agreeToTerms: !prev.data.agreeToTerms },
      errors: { ...prev.errors, agreeToTerms: undefined, general: undefined },
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
   * Toggle confirm password visibility
   */
  const toggleShowConfirmPassword = useCallback(() => {
    setFormState(prev => ({
      ...prev,
      showConfirmPassword: !prev.showConfirmPassword,
    }));
  }, []);

  /**
   * Validate form fields
   * Returns true if valid, false otherwise
   */
  const validateForm = useCallback((): boolean => {
    const fullNameError = validateFullName(formState.data.fullName);
    const emailError = validateEmail(formState.data.email);
    const passwordError = validatePassword(formState.data.password);
    const confirmPasswordError = validateConfirmPassword(
      formState.data.password,
      formState.data.confirmPassword
    );
    const termsError = validateTermsAgreement(formState.data.agreeToTerms);
    const nationalityError = !formState.data.nationality ? 'Nationality is required' : undefined;

    if (fullNameError || emailError || passwordError || confirmPasswordError || termsError || nationalityError) {
      setFormState(prev => ({
        ...prev,
        errors: {
          fullName: fullNameError,
          email: emailError,
          password: passwordError,
          confirmPassword: confirmPasswordError,
          agreeToTerms: termsError,
          nationality: nationalityError,
        },
      }));
      return false;
    }

    return true;
  }, [formState.data]);

  /**
   * Submit registration form
   * Validates inputs and calls registration service
   */
  const submitRegistration = useCallback(
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

      // Set loading state
      setFormState(prev => ({ ...prev, isLoading: true }));

      try {
        // Call auth register action
        await register(
          formState.data.fullName,
          formState.data.email,
          formState.data.password,
          formState.data.nationality
        );

        // Success - call the onSuccess callback
        onSuccess(formState.data.email);
      } catch (error) {
        // Handle registration errors
        const authError = error as Error;
        setFormState(prev => ({
          ...prev,
          isLoading: false,
          errors: {
            general: authError.message || 'Registration failed. Please try again.',
          },
        }));
      }
    },
    [formState.data.fullName, formState.data.email, formState.data.password, formState.data.nationality, register, validateForm]
  );

  /**
   * Check if submit button should be disabled
   */
  const isSubmitDisabled = useMemo((): boolean => {
    const { fullName, email, password, confirmPassword, agreeToTerms, nationality } = formState.data;
    return (
      !fullName.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim() ||
      !nationality.trim() ||
      !agreeToTerms ||
      formState.isLoading
    );
  }, [formState.data, formState.isLoading]);

  return {
    fullName: formState.data.fullName,
    email: formState.data.email,
    password: formState.data.password,
    confirmPassword: formState.data.confirmPassword,
    agreeToTerms: formState.data.agreeToTerms,
    errors: formState.errors,
    isLoading: formState.isLoading || authState.isLoading,
    showPassword: formState.showPassword,
    showConfirmPassword: formState.showConfirmPassword,
    passwordStrength: formState.passwordStrength,
    setFullName,
    setEmail,
    setPassword,
    setConfirmPassword,
    toggleAgreeToTerms,
    toggleShowPassword,
    toggleShowConfirmPassword,
    submitRegistration,
    isSubmitDisabled,
    nationality: formState.data.nationality,
    setNationality,
  };
};
