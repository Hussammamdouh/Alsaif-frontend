/**
 * Forgot Password Screen
 * Premium animated password reset request flow
 */

import React, { useCallback, useEffect, useRef } from 'react';
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
import { styles } from './forgot-password.styles';
import { useForgotPasswordForm } from './forgot-password.hooks';
import { useTheme, useLocalization } from '../../../app/providers';

interface ForgotPasswordScreenProps {
  onBackToLogin: () => void;
  onResetEmailSent?: (email: string) => void;
}

/**
 * Forgot Password Screen Component
 * Animated interface for requesting password reset
 */
export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = React.memo(
  ({ onBackToLogin, onResetEmailSent }) => {
    const { theme } = useTheme();
    const { t } = useLocalization();
    const {
      formState,
      setEmail,
      submitForgotPassword,
      isSubmitDisabled,
    } = useForgotPasswordForm();

    // Animation values
    const iconScale = useRef(new Animated.Value(0)).current;
    const iconOpacity = useRef(new Animated.Value(0)).current;
    const headerOpacity = useRef(new Animated.Value(0)).current;
    const headerTranslateY = useRef(new Animated.Value(20)).current;
    const contentOpacity = useRef(new Animated.Value(0)).current;
    const contentTranslateY = useRef(new Animated.Value(30)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    /**
     * Initialize animations on mount
     */
    useEffect(() => {
      // Icon animation
      Animated.parallel([
        Animated.spring(iconScale, {
          toValue: 1,
          tension: 40,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(iconOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ]).start();

      // Header animation
      Animated.parallel([
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 600,
          delay: 200,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(headerTranslateY, {
          toValue: 0,
          duration: 600,
          delay: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();

      // Content animation
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 600,
          delay: 400,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(contentTranslateY, {
          toValue: 0,
          duration: 600,
          delay: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();

      // Pulse animation for icon
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, []);

    /**
     * Handle successful email submission
     */
    const handleSuccess = useCallback(() => {
      onResetEmailSent?.(formState.data.email);
    }, [formState.data.email, onResetEmailSent]);

    /**
     * Handle form submission
     */
    const handleSubmit = useCallback(() => {
      submitForgotPassword(handleSuccess);
    }, [submitForgotPassword, handleSuccess]);

    /**
     * Handle resend email
     */
    const handleResend = useCallback(() => {
      submitForgotPassword(handleSuccess);
    }, [submitForgotPassword, handleSuccess]);

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
                  styles.header,
                  {
                    opacity: headerOpacity,
                    transform: [{ translateY: headerTranslateY }],
                  },
                ]}
              >
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
                    name="lock-closed-outline"
                    size={40}
                    color={theme.primary.main}
                  />
                </Animated.View>

                <Text style={[styles.title, { color: theme.text.primary }]}>{t('forgotPassword.title')}</Text>
                <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
                  {formState.emailSent
                    ? t('forgotPassword.successSubtitle')
                    : t('forgotPassword.subtitle')}
                </Text>
              </Animated.View>

              {/* Success State */}
              {formState.emailSent ? (
                <Animated.View
                  style={[
                    styles.successContainer,
                    {
                      backgroundColor: `${theme.accent.success}15`,
                      borderLeftColor: theme.accent.success,
                    },
                    {
                      opacity: contentOpacity,
                      transform: [{ translateY: contentTranslateY }],
                    },
                  ]}
                >
                  <View style={[styles.successIconContainer, { backgroundColor: theme.accent.success }]}>
                    <Icon
                      name="checkmark-circle"
                      size={32}
                      color={theme.background.primary}
                    />
                  </View>

                  <Text style={[styles.successTitle, { color: theme.text.primary }]}>{t('forgotPassword.successTitle')}</Text>
                  <Text style={[styles.successText, { color: theme.text.secondary }]}>
                    {t('forgotPassword.successMessage')}{'\n'}
                    <Text style={{ fontWeight: '600' }}>{formState.data.email}</Text>
                  </Text>

                  {/* Resend Button */}
                  <TouchableOpacity
                    style={styles.resendButton}
                    onPress={handleResend}
                    disabled={formState.isLoading}
                    accessibilityLabel="Resend email"
                    accessibilityHint="Sends another password reset email"
                    accessibilityRole="button"
                  >
                    <Text style={[styles.resendButtonText, { color: theme.primary.main }]}>
                      {t('forgotPassword.resendText')}
                    </Text>
                  </TouchableOpacity>
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
                    <View
                      style={[
                        styles.errorContainer,
                        {
                          backgroundColor: `${theme.accent.error}15`,
                          borderLeftColor: theme.accent.error,
                        },
                      ]}
                    >
                      <Icon name="warning-outline" size={20} color={theme.accent.error} style={styles.errorIcon} />
                      <Text style={[styles.errorText, { color: theme.accent.error }]}>{formState.errors.general}</Text>
                    </View>
                  )}

                  {/* Email Input */}
                  <Input
                    label={t('login.email')}
                    placeholder={t('forgotPassword.emailPlaceholder')}
                    value={formState.data.email}
                    onChangeText={setEmail}
                    error={formState.errors.email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect={false}
                    editable={!formState.isLoading}
                    accessibilityLabel="Email address input"
                    accessibilityHint="Enter your email to receive password reset instructions"
                    leftIcon={
                      <Icon
                        name="mail-outline"
                        size={20}
                        color={theme.primary.main}
                      />
                    }
                  />

                  {/* Submit Button */}
                  <Button
                    title={t('forgotPassword.sendLink')}
                    onPress={handleSubmit}
                    loading={formState.isLoading}
                    disabled={isSubmitDisabled}
                    style={styles.submitButton}
                    accessibilityLabel="Send reset link"
                    accessibilityHint="Sends password reset email"
                    accessibilityRole="button"
                  />
                </Animated.View>
              )}

              {/* Back to Login Link */}
              <Animated.View
                style={[
                  styles.footer,
                  { opacity: contentOpacity },
                ]}
              >
                <TouchableOpacity
                  onPress={onBackToLogin}
                  accessibilityLabel="Back to login"
                  accessibilityHint="Navigate back to login screen"
                  accessibilityRole="button"
                >
                  <Text style={[styles.backToLoginText, { color: theme.text.secondary }]}>
                    {t('forgotPassword.rememberPassword')}{' '}
                    <Text style={[styles.loginLink, { color: theme.primary.main }]}>{t('forgotPassword.backToLogin')}</Text>
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    );
  }
);

ForgotPasswordScreen.displayName = 'ForgotPasswordScreen';
