/**
 * Reset Password Screen
 * Handles password reset with verification code
 */

import React, { useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

import { Input, Button } from '../../../shared/components';
import { styles } from './reset-password.styles';
import { useResetPasswordForm } from './reset-password.hooks';
import { useTheme, useLocalization } from '../../../app/providers';

interface ResetPasswordScreenProps {
  email?: string;
  onBackToLogin: () => void;
  onResetSuccess?: () => void;
}

/**
 * Reset Password Screen Component
 * Allows users to reset password using verification code
 */
export const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = React.memo(
  ({ email, onBackToLogin, onResetSuccess }) => {
    const { theme } = useTheme();
    const { t } = useLocalization();
    const {
      formState,
      showPassword,
      showConfirmPassword,
      setCode,
      setPassword,
      setConfirmPassword,
      toggleShowPassword,
      toggleShowConfirmPassword,
      submitResetPassword,
      isSubmitDisabled,
    } = useResetPasswordForm(email);

    // Animation values
    const iconScale = useRef(new Animated.Value(0.8)).current;
    const iconOpacity = useRef(new Animated.Value(0)).current;
    const headerOpacity = useRef(new Animated.Value(0)).current;
    const headerTranslateY = useRef(new Animated.Value(20)).current;
    const contentOpacity = useRef(new Animated.Value(0)).current;
    const contentTranslateY = useRef(new Animated.Value(30)).current;
    const footerOpacity = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // Entrance animations
    useEffect(() => {
      Animated.parallel([
        // Icon animation
        Animated.spring(iconScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(iconOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        // Header animation
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 600,
          delay: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(headerTranslateY, {
          toValue: 0,
          duration: 600,
          delay: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        // Content animation
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 600,
          delay: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(contentTranslateY, {
          toValue: 0,
          duration: 600,
          delay: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        // Footer animation
        Animated.timing(footerOpacity, {
          toValue: 1,
          duration: 600,
          delay: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();

      // Continuous pulse animation for icon
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, []);

    /**
     * Handle successful password reset
     */
    const handleSuccess = useCallback(() => {
      onResetSuccess?.();
    }, [onResetSuccess]);

    /**
     * Handle form submission
     */
    const handleSubmit = useCallback(() => {
      submitResetPassword(handleSuccess);
    }, [submitResetPassword, handleSuccess]);

    /**
     * Handle login after success
     */
    const handleGoToLogin = useCallback(() => {
      onBackToLogin();
    }, [onBackToLogin]);

    return (
      <View style={[styles.gradient, { backgroundColor: theme.background.primary }]}>
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
          <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Header with Icon */}
              <Animated.View
                style={[
                  styles.iconContainer,
                  { backgroundColor: `${theme.primary.main}15` },
                  {
                    opacity: iconOpacity,
                    transform: [{ scale: Animated.multiply(iconScale, pulseAnim) }],
                  },
                ]}
              >
                <Icon
                  name={formState.resetSuccess ? 'checkmark-circle-outline' : 'shield-checkmark-outline'}
                  size={40}
                  color={theme.primary.main}
                />
              </Animated.View>

              <Animated.View
                style={[
                  styles.header,
                  {
                    opacity: headerOpacity,
                    transform: [{ translateY: headerTranslateY }],
                  },
                ]}
              >
                <Text style={styles.title}>
                  {formState.resetSuccess ? t('resetPassword.successTitle1') : t('resetPassword.title1')}
                </Text>
                <Text style={styles.subtitle}>
                  {formState.resetSuccess
                    ? t('resetPassword.successSubtitle')
                    : t('resetPassword.subtitle')}
                </Text>
                {!formState.resetSuccess && email && (
                  <Text style={styles.emailText}>{email}</Text>
                )}
              </Animated.View>

              {/* Success State */}
              {formState.resetSuccess ? (
                <Animated.View
                  style={[
                    styles.successContainer,
                    {
                      opacity: contentOpacity,
                      transform: [{ translateY: contentTranslateY }],
                    },
                  ]}
                >
                  <View style={styles.successIconContainer}>
                    <Icon
                      name="checkmark"
                      size={32}
                      color={theme.background.primary}
                    />
                  </View>

                  <Text style={styles.successTitle}>{t('resetPassword.allSet')}</Text>
                  <Text style={styles.successText}>
                    {t('resetPassword.allSetSubtitle')}
                  </Text>

                  {/* Login Button */}
                  <Button
                    title={t('forgotPassword.backToLogin')}
                    onPress={handleGoToLogin}
                    style={styles.loginButton}
                    accessibilityLabel="Back to login"
                    accessibilityHint="Navigate to login screen"
                    accessibilityRole="button"
                  />
                </Animated.View>
              ) : (
                /* Form */
                <Animated.View
                  style={[
                    styles.formContainer,
                    {
                      opacity: contentOpacity,
                      transform: [{ translateY: contentTranslateY }],
                    },
                  ]}
                >
                  {/* General Error */}
                  {formState.errors.general && (
                    <View style={styles.errorContainer}>
                      <Icon
                        name="warning-outline"
                        size={20}
                        color={theme.accent.error}
                        style={styles.errorIcon}
                      />
                      <Text style={styles.errorText}>{formState.errors.general}</Text>
                    </View>
                  )}

                  {/* Verification Code Input */}
                  <Input
                    label={t('resetPassword.verificationCode')}
                    placeholder={t('resetPassword.codePlaceholder')}
                    value={formState.data.code}
                    onChangeText={setCode}
                    error={formState.errors.code}
                    keyboardType="number-pad"
                    maxLength={6}
                    editable={!formState.isLoading}
                    accessibilityLabel="Verification code input"
                    accessibilityHint="Enter the 6-digit code sent to your email"
                    leftIcon={
                      <Icon
                        name="keypad-outline"
                        size={20}
                        color={theme.text.tertiary}
                      />
                    }
                  />
                  <Text style={styles.codeHelper}>
                    {t('resetPassword.codeHelper')}
                  </Text>

                  {/* New Password Input */}
                  <Input
                    label={t('resetPassword.newPassword')}
                    placeholder={t('resetPassword.passwordPlaceholder')}
                    value={formState.data.password}
                    onChangeText={setPassword}
                    error={formState.errors.password}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="password-new"
                    editable={!formState.isLoading}
                    accessibilityLabel="New password input"
                    accessibilityHint="Enter your new password with uppercase, lowercase, number, and special character"
                    leftIcon={
                      <Icon
                        name="lock-closed-outline"
                        size={20}
                        color={theme.text.tertiary}
                      />
                    }
                    rightIcon={
                      <TouchableOpacity
                        onPress={toggleShowPassword}
                        accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                        accessibilityHint="Toggles password visibility"
                        accessibilityRole="button"
                      >
                        <Icon
                          name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                          size={20}
                          color={theme.text.tertiary}
                        />
                      </TouchableOpacity>
                    }
                  />

                  {/* Password Requirements */}
                  {formState.data.password && !formState.errors.password && (
                    <View style={styles.requirementsContainer}>
                      <Text style={styles.requirementText}>
                        {t('resetPassword.passwordRequirementsMet')}
                      </Text>
                    </View>
                  )}

                  {/* Confirm Password Input */}
                  <Input
                    label={t('register.confirmPassword')}
                    placeholder={t('resetPassword.confirmPlaceholder')}
                    value={formState.data.confirmPassword}
                    onChangeText={setConfirmPassword}
                    error={formState.errors.confirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoComplete="password-new"
                    editable={!formState.isLoading}
                    accessibilityLabel="Confirm password input"
                    accessibilityHint="Re-enter your password to confirm"
                    leftIcon={
                      <Icon
                        name="lock-closed-outline"
                        size={20}
                        color={theme.text.tertiary}
                      />
                    }
                    rightIcon={
                      <TouchableOpacity
                        onPress={toggleShowConfirmPassword}
                        accessibilityLabel={showConfirmPassword ? 'Hide password' : 'Show password'}
                        accessibilityHint="Toggles password visibility"
                        accessibilityRole="button"
                      >
                        <Icon
                          name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                          size={20}
                          color={theme.text.tertiary}
                        />
                      </TouchableOpacity>
                    }
                  />

                  {/* Submit Button */}
                  <Button
                    title={t('resetPassword.resetButton')}
                    onPress={handleSubmit}
                    loading={formState.isLoading}
                    disabled={isSubmitDisabled}
                    style={styles.submitButton}
                    accessibilityLabel="Reset password"
                    accessibilityHint="Submits new password"
                    accessibilityRole="button"
                  />
                </Animated.View>
              )}

              {/* Back to Login Link */}
              {!formState.resetSuccess && (
                <Animated.View
                  style={[
                    styles.footer,
                    {
                      opacity: footerOpacity,
                    },
                  ]}
                >
                  <TouchableOpacity
                    onPress={onBackToLogin}
                    accessibilityLabel="Back to login"
                    accessibilityHint="Navigate back to login screen"
                    accessibilityRole="button"
                  >
                    <Text style={styles.backToLoginText}>
                      {t('forgotPassword.rememberPassword')}{' '}
                      <Text style={styles.loginLink}>{t('forgotPassword.backToLogin')}</Text>
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    );
  }
);

ResetPasswordScreen.displayName = 'ResetPasswordScreen';
