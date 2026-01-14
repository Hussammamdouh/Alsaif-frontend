/**
 * Registration Screen
 * Premium animated registration experience with modern design
 * Handles user sign-up with comprehensive validation
 */

import React, { useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

import { Input, Button, Checkbox, ThemeLanguageToggle } from '../../../shared/components';
import { styles } from './register.styles';
import { useRegisterForm } from './register.hooks';
import { useTheme, useLocalization } from '../../../app/providers';
import type { PasswordStrength } from './register.types';
import { useAuth, useBiometricStatus } from '../../../app/auth';

interface RegisterScreenProps {
  onRegisterSuccess: () => void;
  onNavigateToLogin: () => void;
}

/**
 * Registration Screen Component
 * Provides secure animated user sign-up interface
 */
export const RegisterScreen: React.FC<RegisterScreenProps> = React.memo(
  ({ onRegisterSuccess, onNavigateToLogin }) => {
    const { theme } = useTheme();
    const { t, isRTL } = useLocalization();

    const {
      fullName,
      email,
      password,
      confirmPassword,
      agreeToTerms,
      errors,
      isLoading,
      showPassword,
      showConfirmPassword,
      passwordStrength,
      setFullName,
      setEmail,
      setPassword,
      setConfirmPassword,
      toggleAgreeToTerms,
      toggleShowPassword,
      toggleShowConfirmPassword,
      submitRegistration,
      isSubmitDisabled,
      nationality,
      setNationality,
    } = useRegisterForm();

    const { enableBiometric, clearError } = useAuth();
    const { enabled: biometricEnabled, type: biometricType } = useBiometricStatus();
    const biometricAvailable = biometricType !== null;

    // Animation values
    const logoScale = useRef(new Animated.Value(0.8)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const headerOpacity = useRef(new Animated.Value(0)).current;
    const headerTranslateY = useRef(new Animated.Value(20)).current;
    const formOpacity = useRef(new Animated.Value(0)).current;
    const formTranslateY = useRef(new Animated.Value(30)).current;

    /**
     * Initialize animations on mount
     */
    useEffect(() => {
      // Logo animation
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 40,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
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

      // Form animation
      Animated.parallel([
        Animated.timing(formOpacity, {
          toValue: 1,
          duration: 600,
          delay: 400,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(formTranslateY, {
          toValue: 0,
          duration: 600,
          delay: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, []);

    /**
     * Clear errors when component unmounts
     */
    useEffect(() => {
      return () => {
        clearError();
      };
    }, [clearError]);

    /**
     * Handle successful registration
     */
    const handleRegisterSuccess = useCallback(
      async (_userEmail: string) => {
        // Check if biometric enrollment should be prompted
        if (biometricAvailable && !biometricEnabled) {
          const biometricName = biometricType === 'FaceID' ? 'Face ID' : biometricType === 'TouchID' ? 'Touch ID' : 'biometric authentication';

          Alert.alert(
            `Enable ${biometricName}?`,
            `Would you like to enable ${biometricName} for faster login?`,
            [
              {
                text: 'Not Now',
                style: 'cancel',
                onPress: () => onRegisterSuccess(),
              },
              {
                text: 'Enable',
                onPress: async () => {
                  try {
                    await enableBiometric();
                    onRegisterSuccess();
                  } catch (error) {
                    // If enabling fails, still proceed to app
                    onRegisterSuccess();
                  }
                },
              },
            ]
          );
        } else {
          // Navigate to main app
          onRegisterSuccess();
        }
      },
      [onRegisterSuccess, biometricAvailable, biometricEnabled, biometricType, enableBiometric]
    );

    /**
     * Handle terms link press
     */
    const handleTermsPress = useCallback(() => {
      Alert.alert(
        'Terms of Service',
        'Terms and conditions will be displayed here.',
        [{ text: 'OK' }]
      );
    }, []);

    /**
     * Handle privacy policy link press
     */
    const handlePrivacyPress = useCallback(() => {
      Alert.alert(
        'Privacy Policy',
        'Privacy policy details will be displayed here.',
        [{ text: 'OK' }]
      );
    }, []);

    /**
     * Handle registration submission
     */
    const handleSubmit = useCallback(() => {
      submitRegistration(handleRegisterSuccess);
    }, [submitRegistration, handleRegisterSuccess]);

    /**
     * Render password strength bars
     */
    const renderPasswordStrengthBars = () => {
      const getActiveCount = (strength: PasswordStrength): number => {
        if (strength === 'weak') return 1;
        if (strength === 'medium') return 2;
        return 4;
      };

      const getBarColorStyle = (index: number, strength: PasswordStrength) => {
        const activeCount = getActiveCount(strength);
        if (index >= activeCount) return null;

        if (strength === 'weak') return styles.strengthBarWeak;
        if (strength === 'medium') return styles.strengthBarMedium;
        return styles.strengthBarStrong;
      };

      return (
        <View style={styles.passwordStrengthContainer}>
          <View style={styles.strengthBarsContainer}>
            {[0, 1, 2, 3].map(index => (
              <View
                key={index}
                style={[
                  styles.strengthBar,
                  getBarColorStyle(index, passwordStrength),
                ]}
              />
            ))}
          </View>
          <Text
            style={[
              styles.strengthText,
              passwordStrength === 'weak' && styles.strengthTextWeak,
              passwordStrength === 'medium' && styles.strengthTextMedium,
              passwordStrength === 'strong' && styles.strengthTextStrong,
            ]}
          >
            {t('register.passwordStrength')}{' '}
            {t(`register.${passwordStrength}`)}
          </Text>
        </View>
      );
    };

    return (
      <View style={[styles.gradient, { backgroundColor: theme.background.primary }]}>
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
          <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Theme and Language Toggles */}
              <View style={[styles.togglesContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <ThemeLanguageToggle />
              </View>

              {/* Header Section */}
              <Animated.View
                style={[
                  styles.header,
                  {
                    opacity: headerOpacity,
                    transform: [{ translateY: headerTranslateY }],
                  },
                ]}
              >
                {/* Logo */}
                <Animated.View
                  style={[
                    styles.logoContainer,
                    {
                      opacity: logoOpacity,
                      transform: [{ scale: logoScale }],
                    },
                  ]}
                >
                  <View style={[styles.logoImageContainer, { backgroundColor: theme.ui.card }]}>
                    <Image
                      source={require('../../../assets/images/logo.png')}
                      style={styles.logoImage}
                      resizeMode="contain"
                    />
                  </View>
                  <Text style={[styles.logoText, { color: theme.text.primary }]}>{t('common.appName')}</Text>
                </Animated.View>

                {/* Title */}
                <Text style={[styles.title, { color: theme.text.primary }]}>{t('register.title')}</Text>

                {/* Subtitle */}
                <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
                  {t('register.subtitle')}
                </Text>
              </Animated.View>

              {/* Form Section */}
              <Animated.View
                style={[
                  styles.formContainer,
                  {
                    opacity: formOpacity,
                    transform: [{ translateY: formTranslateY }],
                  },
                ]}
              >
                {/* General Error Message */}
                {errors.general && (
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
                    <Text style={[styles.errorText, { color: theme.accent.error }]}>{errors.general}</Text>
                  </View>
                )}

                {/* Full Name Input */}
                <Input
                  label={t('register.fullName')}
                  value={fullName}
                  onChangeText={setFullName}
                  error={errors.fullName}
                  placeholder={t('register.fullNamePlaceholder')}
                  autoCapitalize="words"
                  autoCorrect={false}
                  textContentType="name"
                  accessibilityLabel="Full name input"
                  accessibilityHint="Enter your full name"
                  leftIcon={
                    <Icon
                      name="person-outline"
                      size={22}
                      color={theme.primary.main}
                    />
                  }
                />

                {/* Email Input */}
                <Input
                  label={t('register.email')}
                  value={email}
                  onChangeText={setEmail}
                  error={errors.email}
                  placeholder={t('register.emailPlaceholder')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="emailAddress"
                  accessibilityLabel="Email address input"
                  accessibilityHint="Enter your email address"
                  leftIcon={
                    <Icon
                      name="mail-outline"
                      size={20}
                      color={theme.primary.main}
                    />
                  }
                />

                {/* Nationality Input */}
                <Input
                  label={t('register.nationality')}
                  value={nationality}
                  onChangeText={setNationality}
                  error={errors.nationality}
                  placeholder={t('register.nationalityPlaceholder')}
                  autoCapitalize="words"
                  autoCorrect={false}
                  leftIcon={
                    <Icon
                      name="globe-outline"
                      size={20}
                      color={theme.primary.main}
                    />
                  }
                />

                {/* Password Input */}
                <Input
                  label={t('register.password')}
                  value={password}
                  onChangeText={setPassword}
                  error={errors.password}
                  placeholder={t('register.passwordPlaceholder')}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="newPassword"
                  accessibilityLabel="Password input"
                  accessibilityHint="Enter your password with uppercase, lowercase, number, and special character"
                  leftIcon={
                    <Icon
                      name="lock-closed-outline"
                      size={20}
                      color={theme.primary.main}
                    />
                  }
                  rightIcon={
                    <TouchableOpacity
                      onPress={toggleShowPassword}
                      activeOpacity={0.7}
                      accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                      accessibilityHint="Toggles password visibility"
                      accessibilityRole="button"
                    >
                      <Icon
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color={theme.primary.main}
                      />
                    </TouchableOpacity>
                  }
                />

                {/* Password Strength Indicator */}
                {password.length > 0 && renderPasswordStrengthBars()}

                {/* Confirm Password Input */}
                <Input
                  label={t('register.confirmPassword')}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  error={errors.confirmPassword}
                  placeholder={t('register.confirmPasswordPlaceholder')}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="newPassword"
                  accessibilityLabel="Confirm password input"
                  accessibilityHint="Re-enter your password to confirm"
                  leftIcon={
                    <Icon
                      name="lock-closed-outline"
                      size={20}
                      color={theme.primary.main}
                    />
                  }
                  rightIcon={
                    <TouchableOpacity
                      onPress={toggleShowConfirmPassword}
                      activeOpacity={0.7}
                      accessibilityLabel={showConfirmPassword ? 'Hide password' : 'Show password'}
                      accessibilityHint="Toggles password visibility"
                      accessibilityRole="button"
                    >
                      <Icon
                        name={
                          showConfirmPassword ? 'eye-off-outline' : 'eye-outline'
                        }
                        size={20}
                        color={theme.primary.main}
                      />
                    </TouchableOpacity>
                  }
                />

                {/* Terms & Conditions */}
                <View>
                  <View style={styles.termsContainer}>
                    <Checkbox
                      checked={agreeToTerms}
                      onToggle={toggleAgreeToTerms}
                      accessibilityLabel="Agree to terms and conditions"
                      accessibilityHint="Toggle agreement to terms of service and privacy policy"
                    />
                    <Text style={[styles.termsText, { color: theme.text.secondary }]}>
                      {t('register.agreeToTerms')}
                      <Text
                        style={[styles.termsLink, { color: theme.primary.main }]}
                        onPress={handleTermsPress}
                        accessibilityLabel="Terms of Service"
                        accessibilityHint="View terms of service"
                        accessibilityRole="button"
                      >
                        {t('register.termsOfService')}
                      </Text>
                      {t('register.and')}
                      <Text
                        style={[styles.termsLink, { color: theme.primary.main }]}
                        onPress={handlePrivacyPress}
                        accessibilityLabel="Privacy Policy"
                        accessibilityHint="View privacy policy"
                        accessibilityRole="button"
                      >
                        {t('register.privacyPolicy')}
                      </Text>
                      .
                    </Text>
                  </View>
                  {errors.agreeToTerms && (
                    <Text
                      style={[styles.termsError, { color: theme.accent.error }]}
                    >
                      {errors.agreeToTerms}
                    </Text>
                  )}
                </View>

                {/* Sign Up Button */}
                <Button
                  title={t('register.signUpButton')}
                  onPress={handleSubmit}
                  loading={isLoading}
                  disabled={isSubmitDisabled}
                  style={styles.signUpButton}
                  accessibilityLabel="Sign up"
                  accessibilityHint="Submits registration form"
                  accessibilityRole="button"
                />

                {/* Footer - Already have account */}
                <View style={styles.footer}>
                  <Text style={[styles.footerText, { color: theme.text.secondary }]}>
                    {t('register.alreadyHaveAccount')}{' '}
                    <Text
                      style={[styles.loginLink, { color: theme.primary.main }]}
                      onPress={onNavigateToLogin}
                      accessibilityLabel="Log in"
                      accessibilityHint="Navigate to login screen"
                      accessibilityRole="button"
                    >
                      {t('register.logIn')}
                    </Text>
                  </Text>
                </View>
              </Animated.View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    );
  }
);

RegisterScreen.displayName = 'RegisterScreen';
