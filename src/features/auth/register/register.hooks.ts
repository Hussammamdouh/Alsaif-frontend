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
import { Country } from '../../../core/constants/countries';

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
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      country: null,
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
   * Update country field
   */
  const setCountry = useCallback((country: Country) => {
    setFormState(prev => ({
      ...prev,
      data: { ...prev.data, country },
      errors: { ...prev.errors, country: undefined, general: undefined },
    }));
  }, []);

  /**
   * Update phone number field
   */
  const setPhoneNumber = useCallback((phoneNumber: string) => {
    setFormState(prev => ({
      ...prev,
      data: { ...prev.data, phoneNumber },
      errors: { ...prev.errors, phoneNumber: undefined, general: undefined },
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
    // T&C validation is now handled in the modal
    const countryError = !formState.data.country ? 'Country is required' : undefined;
    const phoneNumberError = !formState.data.phoneNumber ? 'Phone number is required' : undefined;

    if (fullNameError || emailError || phoneNumberError || passwordError || confirmPasswordError || countryError) {
      setFormState(prev => ({
        ...prev,
        errors: {
          fullName: fullNameError,
          email: emailError,
          phoneNumber: phoneNumberError,
          password: passwordError,
          confirmPassword: confirmPasswordError,
          country: countryError,
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
    async (onSuccess: (userId: string, email: string) => void) => {
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
        const user = await register(
          formState.data.fullName,
          formState.data.email,
          formState.data.password,
          formState.data.country?.name.en || '',
          formState.data.phoneNumber,
          formState.data.country?.code
        );

        // Success - call the onSuccess callback
        onSuccess(user.id, formState.data.email);
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
    [formState.data.fullName, formState.data.email, formState.data.password, formState.data.phoneNumber, formState.data.country, register, validateForm]
  );

  /**
   * Check if submit button should be disabled
   */
  const isSubmitDisabled = useMemo((): boolean => {
    const { fullName, email, phoneNumber, password, confirmPassword, country } = formState.data;
    return (
      !fullName.trim() ||
      !email.trim() ||
      !phoneNumber.trim() ||
      !password.trim() ||
      !confirmPassword.trim() ||
      !country ||
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
    country: formState.data.country,
    setCountry,
    phoneNumber: formState.data.phoneNumber,
    setPhoneNumber,
  };
};
