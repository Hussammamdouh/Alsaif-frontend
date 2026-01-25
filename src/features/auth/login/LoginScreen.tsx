/**
 * Login Screen
 * Premium animated login experience with modern design
 * Handles authentication with security-first approach
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
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

import { Input, Button, ThemeLanguageToggle, ResponsiveContainer } from '../../../shared/components';
import { styles } from './login.styles';
import { useLoginForm } from './login.hooks';
import { useTheme, useLocalization } from '../../../app/providers';
import { useAuth, useBiometricStatus } from '../../../app/auth';

interface LoginScreenProps {
  onLoginSuccess: () => void;
  onNavigateToRegister?: () => void;
  onNavigateToForgotPassword?: () => void;
}

/**
 * Login Screen Component
 * Provides secure animated authentication interface
 */
export const LoginScreen: React.FC<LoginScreenProps> = React.memo(
  ({ onLoginSuccess, onNavigateToRegister, onNavigateToForgotPassword }) => {
    const { theme } = useTheme();
    const { t, isRTL } = useLocalization();

    const {
      identifier,
      password,
      errors,
      isLoading,
      showPassword,
      setIdentifier,
      setPassword,
      toggleShowPassword,
      submitLogin,
      isSubmitDisabled,
    } = useLoginForm();

    const { loginWithBiometric, enableBiometric, clearError } = useAuth();
    const { enabled: biometricEnabled, type: biometricType } = useBiometricStatus();
    const biometricAvailable = biometricType !== null;

    const { width } = useWindowDimensions();
    const isDesktop = width > 768;

    // Animation values
    const logoScale = useRef(new Animated.Value(0.8)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const headerOpacity = useRef(new Animated.Value(0)).current;
    const headerTranslateY = useRef(new Animated.Value(20)).current;
    const formOpacity = useRef(new Animated.Value(0)).current;
    const formTranslateY = useRef(new Animated.Value(30)).current;
    const footerOpacity = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

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

      // Footer animation
      Animated.timing(footerOpacity, {
        toValue: 1,
        duration: 600,
        delay: 600,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();

      // Subtle pulse for biometric icon
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
     * Clear errors when component unmounts
     */
    useEffect(() => {
      return () => {
        clearError();
      };
    }, [clearError]);

    /**
     * Handle successful login
     */
    const handleLoginSuccess = useCallback(
      async (_userEmail: string) => {
        // Check if biometric enrollment should be prompted
        if (biometricAvailable && !biometricEnabled) {
          const biometricName = biometricType === 'FaceID' ? 'Face ID' : biometricType === 'TouchID' ? 'Touch ID' : 'biometric authentication';

          Alert.alert(
            `Enable ${biometricName}?`,
            `Would you like to enable ${biometricName} for faster login next time?`,
            [
              {
                text: 'Not Now',
                style: 'cancel',
                onPress: () => onLoginSuccess(),
              },
              {
                text: 'Enable',
                onPress: async () => {
                  try {
                    await enableBiometric();
                    onLoginSuccess();
                  } catch (error) {
                    // If enabling fails, still proceed to app
                    onLoginSuccess();
                  }
                },
              },
            ]
          );
        } else {
          // Navigate to main app
          onLoginSuccess();
        }
      },
      [onLoginSuccess, biometricAvailable, biometricEnabled, biometricType, enableBiometric]
    );

    /**
     * Handle forgot password navigation
     */
    const handleForgotPassword = useCallback(() => {
      if (onNavigateToForgotPassword) {
        onNavigateToForgotPassword();
      }
    }, [onNavigateToForgotPassword]);

    /**
     * Handle biometric authentication
     */
    const handleBiometricAuth = useCallback(async () => {
      if (!biometricEnabled) {
        return;
      }

      try {
        await loginWithBiometric();
        onLoginSuccess();
      } catch (error) {
        const biometricError = error as Error;
        Alert.alert(
          'Authentication Failed',
          biometricError.message || 'Biometric authentication failed. Please try again.',
          [{ text: 'OK' }]
        );
      }
    }, [biometricEnabled, loginWithBiometric, onLoginSuccess]);

    /**
     * Handle login submission
     */
    const handleSubmit = useCallback(() => {
      submitLogin(handleLoginSuccess);
    }, [submitLogin, handleLoginSuccess]);

    return (
      <View style={[styles.gradient, { backgroundColor: theme.background.primary }]}>
        {isDesktop && (
          <View style={styles.absoluteToggles}>
            <ThemeLanguageToggle />
          </View>
        )}
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
              <View style={isDesktop ? [styles.desktopWrapper, { flex: 0, minHeight: '100%', paddingVertical: 20 }] : null}>
                <ResponsiveContainer maxWidth={isDesktop ? 1200 : 480}>
                  <View style={isDesktop ? [styles.loginCard, { backgroundColor: theme.ui.card, borderColor: theme.ui.border, alignSelf: 'center' }] : null}>
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
                      <Text style={[styles.title, { color: theme.text.primary }]}>{t('login.title')}</Text>

                      {/* Subtitle */}
                      <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
                        {t('login.subtitle')}
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
                              backgroundColor: `${theme.accent.error}20`,
                              borderLeftColor: theme.accent.error,
                            },
                          ]}
                        >
                          <Icon name="warning-outline" size={20} color={theme.accent.error} style={styles.errorIcon} />
                          <Text style={[styles.errorText, { color: theme.accent.error }]}>{errors.general}</Text>
                        </View>
                      )}

                      {/* Email/Phone Input */}
                      <Input
                        label={t('login.identifier')}
                        value={identifier}
                        onChangeText={setIdentifier}
                        error={errors.identifier}
                        placeholder={t('login.identifierPlaceholder')}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        textContentType="username"
                        autoComplete="username"
                        accessibilityLabel="Email or phone number input"
                        accessibilityHint="Enter your email address or phone number"
                        leftIcon={
                          <Icon
                            name="mail-outline"
                            size={20}
                            color={theme.primary.main}
                          />
                        }
                      />

                      {/* Password Input */}
                      <Input
                        label={t('login.password')}
                        value={password}
                        onChangeText={setPassword}
                        error={errors.password}
                        placeholder={t('login.passwordPlaceholder')}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        textContentType="password"
                        autoComplete="password"
                        accessibilityLabel="Password input"
                        accessibilityHint="Enter your password"
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

                      {/* Forgot Password */}
                      <TouchableOpacity
                        style={styles.forgotPasswordContainer}
                        onPress={handleForgotPassword}
                        activeOpacity={0.7}
                        accessibilityLabel="Forgot password"
                        accessibilityHint="Navigate to password reset"
                        accessibilityRole="button"
                      >
                        <Text style={[styles.forgotPasswordText, { color: theme.primary.main }]}>
                          {t('login.forgotPassword')}
                        </Text>
                      </TouchableOpacity>

                      {/* Login Button */}
                      <Button
                        title={t('login.loginButton')}
                        onPress={handleSubmit}
                        loading={isLoading}
                        disabled={isSubmitDisabled}
                        style={styles.loginButton}
                        accessibilityLabel="Log in"
                        accessibilityHint="Submits login form"
                        accessibilityRole="button"
                      />
                    </Animated.View>

                    {/* Security Section */}
                    <Animated.View
                      style={[
                        styles.securitySection,
                        { opacity: footerOpacity },
                      ]}
                    >
                      {/* Divider */}
                      <View style={styles.securityDivider}>
                        <View style={[styles.dividerLine, { backgroundColor: theme.ui.border }]} />
                        <Text style={[styles.securityText, { color: theme.text.tertiary }]}>
                          {t('login.secureConnection')}
                        </Text>
                        <View style={[styles.dividerLine, { backgroundColor: theme.ui.border }]} />
                      </View>

                      {/* Biometric Auth */}
                      {biometricEnabled && (
                        <TouchableOpacity
                          style={styles.biometricContainer}
                          onPress={handleBiometricAuth}
                          activeOpacity={0.7}
                          accessibilityLabel={`Login with ${biometricType === 'FaceID' ? t('login.faceId') : biometricType === 'TouchID' ? t('login.touchId') : t('login.biometricLogin')}`}
                          accessibilityHint="Authenticate using biometric recognition"
                          accessibilityRole="button"
                        >
                          <Animated.View
                            style={[
                              styles.biometricIconContainer,
                              { backgroundColor: `${theme.primary.main}20` },
                              { transform: [{ scale: pulseAnim }] },
                            ]}
                          >
                            <Icon
                              name={
                                biometricType === 'FaceID'
                                  ? 'scan-outline'
                                  : biometricType === 'TouchID'
                                    ? 'finger-print'
                                    : 'shield-checkmark-outline'
                              }
                              size={28}
                              color={theme.primary.main}
                            />
                          </Animated.View>
                          <Text style={[styles.biometricText, { color: theme.primary.main }]}>
                            {biometricType === 'FaceID'
                              ? t('login.faceId')
                              : biometricType === 'TouchID'
                                ? t('login.touchId')
                                : t('login.biometricLogin')}
                          </Text>
                        </TouchableOpacity>
                      )}

                      {/* Encryption Info */}
                      <View style={styles.encryptionBadge}>
                        <Icon name="shield-checkmark" size={16} color={theme.accent.success} />
                        <Text style={[styles.encryptionText, { color: theme.text.tertiary }]}>
                          {t('login.encryption')}
                        </Text>
                      </View>
                    </Animated.View>

                    {/* Footer - Sign Up Link */}
                    {onNavigateToRegister && (
                      <Animated.View
                        style={[
                          styles.footer,
                          { opacity: footerOpacity },
                        ]}
                      >
                        <Text style={[styles.footerText, { color: theme.text.secondary }]}>
                          {t('login.noAccount')}{' '}
                          <Text
                            style={[styles.signUpLink, { color: theme.primary.main }]}
                            onPress={onNavigateToRegister}
                            accessibilityLabel="Sign up"
                            accessibilityHint="Navigate to registration screen"
                            accessibilityRole="button"
                          >
                            {t('login.signUp')}
                          </Text>
                        </Text>
                      </Animated.View>
                    )}
                  </View>
                </ResponsiveContainer>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
        {
          isDesktop && (
            <View style={styles.absoluteToggles}>
              <ThemeLanguageToggle />
            </View>
          )
        }
      </View >
    );
  }
);

LoginScreen.displayName = 'LoginScreen';
