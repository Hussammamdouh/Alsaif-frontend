/**
 * Settings Screen
 * Comprehensive settings management with sections for Account, App, Security, and Notifications
 * Production-grade implementation with device management and account deletion
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  Pressable,
  Animated,
  Easing,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

import { styles } from './settings.styles';
import { useNavigation } from '@react-navigation/native';
import { ResponsiveContainer } from '../../shared/components';
import { SettingsLayout, SettingsTab } from './SettingsLayout';
import { useSettings, useDeviceManagement, useNotificationSettings, useSubscriptionCancellation } from './settings.hooks';
import { useProfile } from '../profile/profile.hooks';
import { useTheme } from '../../app/providers/ThemeProvider';
import { useLocalization } from '../../app/providers/LocalizationProvider';
import { useAuth } from '../../app/auth';
import { LANGUAGE_OPTIONS, THEME_OPTIONS, SETTINGS_SECTIONS } from './settings.constants';
import { ActiveSession } from './settings.types';
import { requestAccountDeletion, cancelAccountDeletion, exportUserData } from '../../core/services/settings/settingsService';
import {
  checkBiometricAvailability,
  getBiometricEnableMessage,
  getBiometricPromptMessage,
  handleBiometricError,
} from '../../app/auth/auth.biometric';
import * as Keychain from '../../core/utils/keychain-stub';
import { calculatePasswordStrength } from '../../shared/utils/passwordStrength';

/**
 * Settings Screen Props
 */
interface SettingsScreenProps {
  onNavigateBack: () => void;
  onNavigateToSubscription?: (isSubscribed: boolean) => void;
  onNavigateToSecurity: () => void;
  onNavigateToTerms: () => void;
  onNavigateToAbout?: () => void;
  onLogout: () => void;
}

/**
 * Settings Screen Component
 */
export const SettingsScreen: React.FC<SettingsScreenProps> = React.memo(
  ({ onNavigateBack, onNavigateToSecurity, onNavigateToSubscription, onNavigateToTerms, onNavigateToAbout, onLogout }) => {
    console.log('[SettingsScreen] Render. onLogout available:', !!onLogout);
    const { profile, subscription, updateProfile, loadProfile } = useProfile();
    const { settings, updateSettings, changePassword, isUpdating } = useSettings();
    const { sessions, loadSessions, revokeSession, logoutAllDevices, isRevoking } = useDeviceManagement();
    const { preferences, updatePreferences } = useNotificationSettings();
    const { cancelSubscription, isCancelling } = useSubscriptionCancellation();
    const { theme, themeMode, toggleTheme, setThemeMode } = useTheme();
    const { t, language, setLanguage } = useLocalization();
    const { logout: authLogout } = useAuth();
    const { width } = useWindowDimensions();
    const isDesktop = width >= 1024;
    const navigation = useNavigation<any>();

    // Local state for modals and inputs
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [showDeviceManagementModal, setShowDeviceManagementModal] = useState(false);
    const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
    const [showLanguageModal, setShowLanguageModal] = useState(false);
    const [showThemeModal, setShowThemeModal] = useState(false);
    const [showNotificationPreferencesModal, setShowNotificationPreferencesModal] = useState(false);
    const [showLogoutAllDevicesModal, setShowLogoutAllDevicesModal] = useState(false);
    const [showCancelSubscriptionModal, setShowCancelSubscriptionModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteReason, setDeleteReason] = useState('');

    // Animation values
    const headerOpacity = useRef(new Animated.Value(0)).current;
    const headerTranslateY = useRef(new Animated.Value(-20)).current;
    const accountOpacity = useRef(new Animated.Value(0)).current;
    const accountTranslateY = useRef(new Animated.Value(20)).current;
    const appPreferencesOpacity = useRef(new Animated.Value(0)).current;
    const appPreferencesTranslateY = useRef(new Animated.Value(20)).current;
    const accessibilityOpacity = useRef(new Animated.Value(0)).current;
    const accessibilityTranslateY = useRef(new Animated.Value(20)).current;
    const securityOpacity = useRef(new Animated.Value(0)).current;
    const securityTranslateY = useRef(new Animated.Value(20)).current;
    const notificationsOpacity = useRef(new Animated.Value(0)).current;
    const notificationsTranslateY = useRef(new Animated.Value(20)).current;
    const privacyOpacity = useRef(new Animated.Value(0)).current;
    const privacyTranslateY = useRef(new Animated.Value(20)).current;
    const aboutOpacity = useRef(new Animated.Value(0)).current;
    const aboutTranslateY = useRef(new Animated.Value(20)).current;
    const dangerOpacity = useRef(new Animated.Value(0)).current;
    const dangerTranslateY = useRef(new Animated.Value(20)).current;
    const modalScale = useRef(new Animated.Value(0.9)).current;
    const modalOpacity = useRef(new Animated.Value(0)).current;

    /**
     * Initialize animations on mount
     */
    useEffect(() => {
      // Consolidated animation with shorter delays
      Animated.parallel([
        // Header animation
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(headerTranslateY, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        // Account section
        Animated.timing(accountOpacity, {
          toValue: 1,
          duration: 500,
          delay: 50,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(accountTranslateY, {
          toValue: 0,
          duration: 500,
          delay: 50,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        // App Preferences
        Animated.timing(appPreferencesOpacity, {
          toValue: 1,
          duration: 500,
          delay: 100,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(appPreferencesTranslateY, {
          toValue: 0,
          duration: 500,
          delay: 100,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        // Accessibility
        Animated.timing(accessibilityOpacity, {
          toValue: 1,
          duration: 500,
          delay: 150,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(accessibilityTranslateY, {
          toValue: 0,
          duration: 500,
          delay: 150,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        // Security
        Animated.timing(securityOpacity, {
          toValue: 1,
          duration: 500,
          delay: 200,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(securityTranslateY, {
          toValue: 0,
          duration: 500,
          delay: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        // Notifications
        Animated.timing(notificationsOpacity, {
          toValue: 1,
          duration: 500,
          delay: 250,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(notificationsTranslateY, {
          toValue: 0,
          duration: 500,
          delay: 250,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        // Privacy
        Animated.timing(privacyOpacity, {
          toValue: 1,
          duration: 500,
          delay: 300,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(privacyTranslateY, {
          toValue: 0,
          duration: 500,
          delay: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        // About
        Animated.timing(aboutOpacity, {
          toValue: 1,
          duration: 500,
          delay: 350,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(aboutTranslateY, {
          toValue: 0,
          duration: 500,
          delay: 350,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        // Danger Zone
        Animated.timing(dangerOpacity, {
          toValue: 1,
          duration: 500,
          delay: 400,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(dangerTranslateY, {
          toValue: 0,
          duration: 500,
          delay: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }, []);

    /**
     * Animate modal entrance
     */
    useEffect(() => {
      if (showChangePasswordModal || showDeleteAccountModal || showLanguageModal || showThemeModal || showLogoutAllDevicesModal) {
        // Reset values
        modalScale.setValue(0.9);
        modalOpacity.setValue(0);

        // Animate in
        Animated.parallel([
          Animated.spring(modalScale, {
            toValue: 1,
            tension: 50,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(modalOpacity, {
            toValue: 1,
            duration: 300,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, [showChangePasswordModal, showDeleteAccountModal, showLanguageModal, showThemeModal, showLogoutAllDevicesModal]);

    /**
     * Handle password change
     */
    const handleChangePassword = useCallback(async () => {
      if (!currentPassword || !newPassword || !confirmPassword) {
        Alert.alert('Error', 'Please fill in all password fields');
        return;
      }

      if (newPassword !== confirmPassword) {
        Alert.alert('Error', 'New passwords do not match');
        return;
      }

      if (newPassword.length < 8) {
        Alert.alert('Error', 'Password must be at least 8 characters');
        return;
      }

      const result = await changePassword({
        currentPassword,
        newPassword,
      });

      if (result.success) {
        Alert.alert('Success', 'Password changed successfully');
        setShowChangePasswordModal(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        Alert.alert('Error', result.error || 'Failed to change password');
      }
    }, [currentPassword, newPassword, confirmPassword, changePassword]);

    /**
     * Handle biometric toggle
     */
    const handleBiometricToggle = useCallback(
      async (value: boolean) => {
        if (value) {
          // Enabling biometric - check availability and authenticate
          try {
            const availability = await checkBiometricAvailability();

            if (!availability.available) {
              Alert.alert(
                'Biometric Not Available',
                availability.error || 'Biometric authentication is not available on this device'
              );
              return;
            }

            // Prompt user with appropriate message
            const message = getBiometricEnableMessage(availability.biometryType!);
            Alert.alert('Enable Biometric Login', message, [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Enable',
                onPress: async () => {
                  try {
                    // Authenticate with biometric to verify it works
                    const promptMessage = getBiometricPromptMessage(availability.biometryType);
                    const credentials = await Keychain.getGenericPassword({
                      authenticationPrompt: {
                        title: promptMessage,
                      },
                      authenticationType: Keychain.AUTHENTICATION_TYPE.BIOMETRICS,
                    });

                    if (credentials) {
                      // Biometric auth successful, enable in settings
                      const result = await updateSettings({ biometricEnabled: true });
                      if (result.success) {
                        Alert.alert('Success', 'Biometric login enabled successfully');
                      }
                    }
                  } catch (error) {
                    const errorMessage = handleBiometricError(error);
                    Alert.alert('Authentication Failed', errorMessage);
                  }
                },
              },
            ]);
          } catch (error) {
            Alert.alert('Error', 'Failed to check biometric availability');
          }
        } else {
          // Disabling biometric - require re-authentication
          Alert.alert(
            'Disable Biometric Login',
            'To disable biometric login, please authenticate one more time.',
            [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Authenticate',
                style: 'destructive',
                onPress: async () => {
                  try {
                    const availability = await checkBiometricAvailability();
                    if (availability.available) {
                      const promptMessage = getBiometricPromptMessage(availability.biometryType);
                      await Keychain.getGenericPassword({
                        authenticationPrompt: {
                          title: promptMessage,
                        },
                        authenticationType: Keychain.AUTHENTICATION_TYPE.BIOMETRICS,
                      });
                    }

                    // Authentication successful, disable
                    const result = await updateSettings({ biometricEnabled: false });
                    if (result.success) {
                      Alert.alert('Success', 'Biometric login disabled');
                    }
                  } catch (error) {
                    const errorMessage = handleBiometricError(error);
                    Alert.alert('Authentication Failed', errorMessage);
                  }
                },
              },
            ]
          );
        }
      },
      [updateSettings]
    );

    /**
     * Handle language change
     */
    const handleLanguageChange = useCallback(
      async (newLanguage: 'en' | 'ar') => {
        // Sync with LocalizationProvider
        setLanguage(newLanguage);

        // Update in backend settings
        const result = await updateSettings({ language: newLanguage });
        if (result.success) {
          setShowLanguageModal(false);
          Alert.alert(t('common.success'), t('settings.languageUpdated'));
        }
      },
      [updateSettings, setLanguage, t]
    );

    /**
     * Handle theme change
     */
    const handleThemeChange = useCallback(
      async (newTheme: 'light' | 'dark' | 'auto') => {
        // Sync with ThemeProvider
        if (newTheme === 'light' || newTheme === 'dark' || newTheme === 'auto') {
          setThemeMode(newTheme);
        }

        // Update in backend settings
        const result = await updateSettings({ theme: newTheme });
        if (result.success) {
          setShowThemeModal(false);
          Alert.alert(t('common.success'), t('settings.themeUpdated'));
        }
      },
      [updateSettings, setThemeMode, t]
    );

    /**
     * Get translated device info
     */
    const getTranslatedDeviceInfo = useCallback((text: string) => {
      if (!text || text === 'Unknown') return t('settings.unknown');
      const lower = text.toLowerCase();
      if (lower === 'ios') return t('settings.ios');
      if (lower === 'android') return t('settings.android');
      if (lower === 'windows') return t('settings.windows');
      if (lower === 'macos' || lower === 'mac os') return t('settings.macos');
      if (lower === 'linux') return t('settings.linux');
      if (lower === 'chrome') return t('settings.chrome');
      if (lower === 'safari') return t('settings.safari');
      if (lower === 'firefox') return t('settings.firefox');
      if (lower === 'edge') return t('settings.edge');
      if (lower === 'mobile') return t('settings.mobile');
      if (lower === 'tablet') return t('settings.tablet');
      if (lower === 'desktop') return t('settings.desktop');
      return text;
    }, [t]);

    /**
     * Handle session revocation
     */
    const handleRevokeSession = useCallback(
      (session: ActiveSession) => {
        if (session.isCurrent) {
          Alert.alert(
            'Current Session',
            'You cannot revoke your current session. Use logout instead.'
          );
          return;
        }

        Alert.alert(
          t('settings.revokeSession'),
          t('settings.revokeSessionMessage')
            .replace('{device}', session.deviceInfo.device)
            .replace('{browser}', session.deviceInfo.browser),
          [
            { text: t('common.cancel'), style: 'cancel' },
            {
              text: t('settings.revoke'),
              style: 'destructive',
              onPress: async () => {
                const result = await revokeSession(session.id);
                if (result.success) {
                  Alert.alert(t('common.success'), 'Session revoked successfully');
                  loadSessions();
                } else {
                  Alert.alert(t('common.error'), result.error || 'Failed to revoke session');
                }
              },
            },
          ]
        );
      },
      [revokeSession, loadSessions]
    );

    /**
     * Handle subscription cancellation
     */
    const handleCancelSubscription = useCallback(async () => {
      setShowCancelSubscriptionModal(false);

      const result = await cancelSubscription();
      if (result.success) {
        loadProfile(); // Refresh profile to show cancelled status
        Alert.alert(t('common.success'), t('settings.cancelSubscriptionSuccess'));
      } else {
        Alert.alert(t('common.error'), result.error || t('common.failed'));
      }
    }, [cancelSubscription, loadProfile, t]);

    /**
     * Handle logout all devices initiation
     */
    const handleLogoutAllDevices = useCallback(() => {
      console.log('[SettingsScreen] handleLogoutAllDevices called - showing modal');
      setShowLogoutAllDevicesModal(true);
    }, []);

    /**
     * Handle logout all devices confirmation
     */
    const handleConfirmLogoutAllDevices = useCallback(async () => {
      console.log('[SettingsScreen] Confirming Logout All Devices from modal');
      setShowLogoutAllDevicesModal(false);

      const result = await logoutAllDevices();
      console.log('[SettingsScreen] Logout All Devices result:', result);

      if (result.success) {
        console.log('[SettingsScreen] Triggering authLogout and onLogout');
        await authLogout();
        onLogout();
      } else {
        Alert.alert('Error', result.error || 'Failed to logout from all devices');
      }
    }, [logoutAllDevices, authLogout, onLogout]);

    /**
     * Handle account deletion request
     */
    const handleDeleteAccount = useCallback(async () => {
      if (!deletePassword) {
        Alert.alert('Error', 'Please enter your password to confirm');
        return;
      }

      Alert.alert(
        'Delete Account',
        'Your account will be deactivated immediately and permanently deleted after 30 days. You can cancel within this period. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete Account',
            style: 'destructive',
            onPress: async () => {
              try {
                const result = await requestAccountDeletion({
                  password: deletePassword,
                  reason: deleteReason || undefined,
                });

                const deletionDate = new Date(result.scheduledDeletionDate).toLocaleDateString();

                Alert.alert(
                  'Account Deletion Requested',
                  `Your account has been scheduled for deletion on ${deletionDate}. You will receive an email with instructions to cancel if needed.`,
                  [
                    {
                      text: 'OK',
                      onPress: async () => {
                        setShowDeleteAccountModal(false);
                        setDeletePassword('');
                        setDeleteReason('');
                        // Logout user since account is now deactivated
                        await authLogout();
                        onLogout();
                      },
                    },
                  ]
                );
              } catch (error) {
                Alert.alert(
                  'Error',
                  error instanceof Error ? error.message : 'Failed to request account deletion'
                );
              }
            },
          },
        ]
      );
    }, [deletePassword, deleteReason, onLogout]);

    /**
     * Handle cancel account deletion
     */
    const handleCancelDeletion = useCallback(async () => {
      Alert.alert(
        'Cancel Account Deletion',
        'Are you sure you want to cancel your account deletion request?',
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Yes, Cancel Deletion',
            onPress: async () => {
              try {
                await cancelAccountDeletion();
                Alert.alert(
                  'Deletion Cancelled',
                  'Your account deletion has been cancelled successfully.',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        // Reload profile to get updated data
                        loadProfile();
                      },
                    },
                  ]
                );
              } catch (error) {
                Alert.alert(
                  'Error',
                  error instanceof Error ? error.message : 'Failed to cancel account deletion'
                );
              }
            },
          },
        ]
      );
    }, [loadProfile]);

    // Calculate days remaining until deletion
    const daysUntilDeletion = profile?.scheduledDeletionDate
      ? Math.ceil(
        (new Date(profile.scheduledDeletionDate).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
      )
      : null;

    /**
     * Handle data export
     */
    const handleExportData = useCallback(async () => {
      try {
        Alert.alert(
          'Export Your Data',
          'This will download all your personal data in JSON format. This may take a moment.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Export',
              onPress: async () => {
                try {
                  const data = await exportUserData();

                  // Convert to JSON string
                  const jsonString = JSON.stringify(data, null, 2);
                  const fileName = `user-data-export-${new Date().toISOString().split('T')[0]}.json`;

                  // In a real app, you would save this file or share it
                  // For now, show success message
                  Alert.alert(
                    'Export Complete',
                    `Your data has been exported successfully. In a production app, this would save as: ${fileName}`,
                    [
                      {
                        text: 'OK',
                        onPress: () => {
                          console.log('Exported data:', jsonString);
                        },
                      },
                    ]
                  );
                } catch (error) {
                  Alert.alert(
                    'Export Failed',
                    error instanceof Error ? error.message : 'Failed to export data'
                  );
                }
              },
            },
          ]
        );
      } catch (error) {
        Alert.alert('Error', 'Failed to initiate data export');
      }
    }, []);

    /**
     * Handle sidebar tab change for Desktop
     */
    const handleTabChange = useCallback((tab: SettingsTab) => {
      switch (tab) {
        case 'profile':
          navigation.navigate('Main', { screen: 'MainTabs', params: { screen: 'ProfileTab' } });
          break;
        case 'preferences':
          // Already here
          break;
        case 'security':
          onNavigateToSecurity();
          break;
        case 'subscription':
          if (onNavigateToSubscription) {
            onNavigateToSubscription(subscription?.tier === 'premium');
          }
          break;
        case 'terms':
          navigation.navigate('Main', { screen: 'Terms' });
          break;
        case 'about':
          navigation.navigate('Main', { screen: 'About' });
          break;
      }
    }, [onNavigateToSecurity, onNavigateToSubscription, subscription, navigation]);

    const renderSettingsContent = () => (
      <View style={isDesktop ? { width: '100%' } : null}>

        {/* Deletion Status Banner */}
        {profile?.deletionRequestedAt && daysUntilDeletion !== null && daysUntilDeletion > 0 && (
          <View style={[styles.deletionBanner, { backgroundColor: theme.error.light }]}>
            <View style={styles.deletionBannerContent}>
              <Icon name="warning-outline" size={24} color={theme.error.main} style={styles.deletionIcon} />
              <View style={styles.deletionText}>
                <Text style={[styles.deletionTitle, { color: theme.text.primary }]}>{t('settings.accountDeletionScheduled')}</Text>
                <Text style={[styles.deletionDescription, { color: theme.text.secondary }]}>
                  {t('settings.accountWillBeDeleted')
                    .replace('{days}', daysUntilDeletion.toString())
                    .replace('{date}', new Date(profile.scheduledDeletionDate!).toLocaleDateString())}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={[styles.cancelDeletionButton, { backgroundColor: theme.error.main }]} onPress={handleCancelDeletion}>
              <Text style={styles.cancelDeletionText}>{t('settings.cancelDeletion')}</Text>
            </TouchableOpacity>
          </View>
        )}

        <ScrollView style={[styles.scrollView, { backgroundColor: theme.background.primary }]} showsVerticalScrollIndicator={false} contentContainerStyle={isDesktop && { flexGrow: 1, justifyContent: 'center' }}>
          <View style={isDesktop ? { padding: 40, alignItems: 'center' } : null}>
            <ResponsiveContainer maxWidth={isDesktop ? 900 : undefined}>
              <View style={isDesktop ? {
                backgroundColor: theme.background.secondary,
                borderRadius: 24,
                padding: 32,
                borderWidth: 1,
                borderColor: theme.border.main,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 5,
              } : null}>
                {/* Account Section */}
                <Animated.View
                  style={[
                    styles.section,
                    {
                      opacity: accountOpacity,
                      transform: [{ translateY: accountTranslateY }],
                    },
                  ]}
                >
                  <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>{t('settings.account')}</Text>

                  {/* Change Password */}
                  <TouchableOpacity
                    style={[styles.settingRow, { backgroundColor: theme.background.secondary, borderBottomColor: theme.border.main }, isDesktop && { padding: 12 }]}
                    onPress={() => setShowChangePasswordModal(true)}
                  >
                    <View style={styles.settingLeft}>
                      <Icon name="key-outline" size={24} color={theme.text.secondary} style={styles.settingIcon} />
                      <Text style={[styles.settingLabel, { color: theme.text.primary }]}>{t('settings.changePassword')}</Text>
                    </View>
                    <Icon name="chevron-forward" size={20} color={theme.text.tertiary} />
                  </TouchableOpacity>

                  {/* Security & Sessions */}
                  <TouchableOpacity
                    style={[styles.settingRow, { backgroundColor: theme.background.secondary, borderBottomColor: theme.border.main }, isDesktop && { padding: 12 }]}
                    onPress={onNavigateToSecurity}
                  >
                    <View style={styles.settingLeft}>
                      <Icon name="shield-checkmark-outline" size={24} color={theme.text.secondary} style={styles.settingIcon} />
                      <Text style={[styles.settingLabel, { color: theme.text.primary }]}>Security & Sessions</Text>
                    </View>
                    <View style={styles.settingRight}>
                      <Icon name="chevron-forward" size={20} color={theme.text.tertiary} />
                    </View>
                  </TouchableOpacity>

                  {/* Biometric Login */}
                  <View style={[styles.settingRow, { backgroundColor: theme.background.secondary }, isDesktop && { padding: 12 }]}>
                    <View style={styles.settingLeft}>
                      <Icon name="finger-print-outline" size={24} color={theme.text.secondary} style={styles.settingIcon} />
                      <Text style={[styles.settingLabel, { color: theme.text.primary }]}>{t('settings.biometricLogin')}</Text>
                    </View>
                    <Switch
                      value={profile?.settings?.biometricEnabled || false}
                      onValueChange={handleBiometricToggle}
                      disabled={isUpdating}
                      trackColor={{ false: '#767577', true: '#A855F7' }}
                      thumbColor={profile?.settings?.biometricEnabled ? '#fff' : '#f4f3f4'}
                    />
                  </View>
                </Animated.View>

                {/* App Preferences Section */}
                <Animated.View
                  style={[
                    styles.section,
                    {
                      opacity: appPreferencesOpacity,
                      transform: [{ translateY: appPreferencesTranslateY }],
                    },
                  ]}
                >
                  <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>{t('settings.appPreferences')}</Text>

                  {/* Language */}
                  <TouchableOpacity
                    style={[styles.settingRow, { backgroundColor: theme.background.secondary }, isDesktop && { padding: 12 }]}
                    onPress={() => setShowLanguageModal(true)}
                  >
                    <View style={styles.settingLeft}>
                      <Icon name="language-outline" size={24} color={theme.text.secondary} style={styles.settingIcon} />
                      <Text style={[styles.settingLabel, { color: theme.text.primary }]}>{t('settings.language')}</Text>
                    </View>
                    <View style={styles.settingRight}>
                      <Text style={[styles.settingValue, { color: theme.text.secondary }]}>
                        {language === 'en' ? 'English' : language === 'ar' ? 'العربية' : LANGUAGE_OPTIONS.find(l => l.value === language)?.label || 'English'}
                      </Text>
                      <Icon name="chevron-forward" size={20} color={theme.text.tertiary} />
                    </View>
                  </TouchableOpacity>

                  {/* Theme */}
                  <TouchableOpacity
                    style={[styles.settingRow, { backgroundColor: theme.background.secondary }]}
                    onPress={() => setShowThemeModal(true)}
                  >
                    <View style={styles.settingLeft}>
                      <Icon name="color-palette-outline" size={24} color={theme.text.secondary} style={styles.settingIcon} />
                      <Text style={[styles.settingLabel, { color: theme.text.primary }]}>{t('settings.theme')}</Text>
                    </View>
                    <View style={styles.settingRight}>
                      <Text style={[styles.settingValue, { color: theme.text.secondary }]}>
                        {themeMode === 'dark' ? t('settings.dark') : themeMode === 'light' ? t('settings.light') : t('settings.auto')}
                      </Text>
                      <Icon name="chevron-forward" size={20} color={theme.text.tertiary} />
                    </View>
                  </TouchableOpacity>

                  {/* Chat Settings - Commented out as requested
            <View style={[styles.settingRow, { backgroundColor: theme.background.secondary, borderBottomColor: theme.border.main }]}>
              <View style={styles.settingLeft}>
                <Icon name="chatbubbles-outline" size={24} color={theme.text.secondary} style={styles.settingIcon} />
                <Text style={[styles.settingLabel, { color: theme.text.primary }]}>{t('settings.muteGroupChats')}</Text>
              </View>
              <Switch
                value={profile?.settings?.chat?.muteGroups || false}
                onValueChange={value => updateSettings({ chat: { muteGroups: value } })}
                disabled={isUpdating}
                trackColor={{ false: theme.border.main, true: theme.primary.main }}
                thumbColor={theme.background.primary}
              />
            </View>

            <View style={[styles.settingRow, { backgroundColor: theme.background.secondary, borderBottomColor: theme.border.main }]}>
              <View style={styles.settingLeft}>
                <Icon name="checkmark-done-outline" size={24} color={theme.text.secondary} style={styles.settingIcon} />
                <Text style={[styles.settingLabel, { color: theme.text.primary }]}>{t('settings.readReceipts')}</Text>
              </View>
              <Switch
                value={profile?.settings?.chat?.readReceipts !== false}
                onValueChange={value => updateSettings({ chat: { readReceipts: value } })}
                disabled={isUpdating}
                trackColor={{ false: theme.border.main, true: theme.primary.main }}
                thumbColor={theme.background.primary}
              />
            </View>
            */}
                </Animated.View>

                {/* Accessibility Section - Commented out as requested
          <Animated.View
            style={[
              styles.section,
              {
                opacity: accessibilityOpacity,
                transform: [{ translateY: accessibilityTranslateY }],
              },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>{t('settings.accessibility')}</Text>

            <View style={[styles.settingRow, { backgroundColor: theme.background.secondary, borderBottomColor: theme.border.main }]}>
              <View style={styles.settingLeft}>
                <Icon name="text-outline" size={24} color={theme.text.secondary} style={styles.settingIcon} />
                <Text style={[styles.settingLabel, { color: theme.text.primary }]}>{t('settings.textSize')}</Text>
              </View>
              <Text style={[styles.settingValue, { color: theme.text.secondary }]}>{t('settings.default')}</Text>
            </View>

            <View style={[styles.settingRow, { backgroundColor: theme.background.secondary }]}>
              <View style={styles.settingLeft}>
                <Icon name="contrast-outline" size={24} color={theme.text.secondary} style={styles.settingIcon} />
                <Text style={[styles.settingLabel, { color: theme.text.primary }]}>{t('settings.highContrast')}</Text>
              </View>
              <Switch
                value={false}
                onValueChange={() => {
                  Alert.alert('Coming Soon', 'High contrast mode will be available in a future update');
                }}
              />
            </View>

            <View style={[styles.settingRow, { backgroundColor: theme.background.secondary, borderBottomColor: theme.border.main }]}>
              <View style={styles.settingLeft}>
                <Icon name="eye-outline" size={24} color={theme.text.secondary} style={styles.settingIcon} />
                <Text style={[styles.settingLabel, { color: theme.text.primary }]}>{t('settings.reduceMotion')}</Text>
              </View>
              <Switch
                value={false}
                onValueChange={() => {
                  Alert.alert(t('common.comingSoon'), t('settings.reduceMotionMessage'));
                }}
                trackColor={{ false: theme.border.main, true: theme.primary.main }}
                thumbColor={theme.background.primary}
              />
            </View>
          </Animated.View>
          */}

                {/* Security Section */}
                <Animated.View
                  style={[
                    styles.section,
                    {
                      opacity: securityOpacity,
                      transform: [{ translateY: securityTranslateY }],
                    },
                  ]}
                >
                  <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>{t('settings.security')}</Text>

                  {onNavigateToSubscription && (
                    <TouchableOpacity
                      style={[styles.settingRow, { backgroundColor: theme.background.secondary, borderBottomColor: theme.border.main }]}
                      onPress={() => onNavigateToSubscription(subscription?.tier === 'premium')}
                    >
                      <View style={styles.settingLeft}>
                        <Icon name="card-outline" size={24} color={theme.text.secondary} style={styles.settingIcon} />
                        <Text style={[styles.settingLabel, { color: theme.text.primary }]}>{t('profile.subscription')}</Text>
                      </View>
                      <View style={styles.settingRight}>
                        <Text style={[styles.settingValue, { color: theme.text.secondary }]}>
                          {subscription?.tier === 'premium' ? t('profile.premium') : t('profile.free')}
                        </Text>
                        <Icon name="chevron-forward" size={20} color={theme.text.tertiary} />
                      </View>
                    </TouchableOpacity>
                  )}

                  {subscription?.tier === 'premium' && subscription?.status !== 'cancelled' && (
                    <TouchableOpacity
                      style={[styles.settingRow, { backgroundColor: theme.background.secondary, borderBottomColor: theme.border.main }]}
                      onPress={() => setShowCancelSubscriptionModal(true)}
                    >
                      <View style={styles.settingLeft}>
                        <Icon name="close-circle-outline" size={24} color="#ff3b30" style={styles.settingIcon} />
                        <Text style={[styles.settingLabel, styles.dangerText]}>{t('settings.cancelSubscription')}</Text>
                      </View>
                      <Icon name="chevron-forward" size={20} color={theme.text.tertiary} />
                    </TouchableOpacity>
                  )}

                  {subscription?.status === 'cancelled' && subscription?.endDate && (
                    <View style={[styles.settingRow, { backgroundColor: theme.background.secondary, borderBottomColor: theme.border.main }]}>
                      <View style={styles.settingLeft}>
                        <Icon name="time-outline" size={24} color={theme.text.secondary} style={styles.settingIcon} />
                        <Text style={[styles.settingLabel, { color: theme.text.primary }]}>{t('settings.activeUntil')}</Text>
                      </View>
                      <Text style={[styles.settingValue, { color: theme.text.secondary }]}>
                        {new Date(subscription.endDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                      </Text>
                    </View>
                  )}
                  {/* Active Sessions */}
                  <TouchableOpacity
                    style={[styles.settingRow, { backgroundColor: theme.background.secondary, borderBottomColor: theme.border.main }]}
                    onPress={() => setShowDeviceManagementModal(true)}
                  >
                    <View style={styles.settingLeft}>
                      <Icon name="phone-portrait-outline" size={24} color={theme.text.secondary} style={styles.settingIcon} />
                      <Text style={[styles.settingLabel, { color: theme.text.primary }]}>{t('settings.activeSessions')}</Text>
                    </View>
                    <View style={styles.settingRight}>
                      <Text style={[styles.settingValue, { color: theme.text.secondary }]}>{sessions.length} {t('settings.devices')}</Text>
                      <Icon name="chevron-forward" size={20} color={theme.text.tertiary} />
                    </View>
                  </TouchableOpacity>

                  {/* Logout All Devices */}
                  <TouchableOpacity
                    style={[styles.settingRow, { backgroundColor: theme.background.secondary, borderBottomColor: theme.border.main }]}
                    onPress={handleLogoutAllDevices}
                    disabled={isRevoking}
                  >
                    <View style={styles.settingLeft}>
                      <Icon name="log-out-outline" size={24} color="#ff3b30" style={styles.settingIcon} />
                      <Text style={[styles.settingLabel, styles.dangerText]}>{t('settings.logoutAllDevices')}</Text>
                    </View>
                    {isRevoking && <ActivityIndicator size="small" color={theme.primary.main} />}
                  </TouchableOpacity>
                </Animated.View>

                {/* Notifications Section */}
                <Animated.View
                  style={[
                    styles.section,
                    {
                      opacity: notificationsOpacity,
                      transform: [{ translateY: notificationsTranslateY }],
                    },
                  ]}
                >
                  <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>{t('settings.notifications')}</Text>

                  {/* Detailed Notification Preferences */}
                  <TouchableOpacity
                    style={[styles.settingRow, { backgroundColor: theme.background.secondary, borderBottomColor: theme.border.main }]}
                    onPress={() => setShowNotificationPreferencesModal(true)}
                  >
                    <View style={styles.settingLeft}>
                      <Icon name="options-outline" size={24} color={theme.text.secondary} style={styles.settingIcon} />
                      <Text style={[styles.settingLabel, { color: theme.text.primary }]}>{t('settings.notificationPreferences')}</Text>
                    </View>
                    <Icon name="chevron-forward" size={20} color={theme.text.tertiary} />
                  </TouchableOpacity>

                  <View style={[styles.settingRow, { backgroundColor: theme.background.secondary, borderBottomColor: theme.border.main }]}>
                    <View style={styles.settingLeft}>
                      <Icon name="notifications-outline" size={24} color={theme.text.secondary} style={styles.settingIcon} />
                      <Text style={[styles.settingLabel, { color: theme.text.primary }]}>{t('settings.pushNotifications')}</Text>
                    </View>
                    <Switch
                      value={preferences?.globalSettings?.pushEnabled || false}
                      onValueChange={(value) => {
                        updatePreferences({ globalSettings: { ...preferences?.globalSettings, pushEnabled: value } as any });
                      }}
                      trackColor={{ false: theme.border.main, true: theme.primary.main }}
                      thumbColor={theme.background.primary}
                    />
                  </View>

                  <View style={[styles.settingRow, { backgroundColor: theme.background.secondary, borderBottomColor: theme.border.main }]}>
                    <View style={styles.settingLeft}>
                      <Icon name="mail-outline" size={24} color={theme.text.secondary} style={styles.settingIcon} />
                      <Text style={[styles.settingLabel, { color: theme.text.primary }]}>{t('settings.emailNotifications')}</Text>
                    </View>
                    <Switch
                      value={preferences?.globalSettings?.emailEnabled || false}
                      onValueChange={(value) => {
                        updatePreferences({ globalSettings: { ...preferences?.globalSettings, emailEnabled: value } as any });
                      }}
                      trackColor={{ false: theme.border.main, true: theme.primary.main }}
                      thumbColor={theme.background.primary}
                    />
                  </View>
                </Animated.View>

                {/* Privacy & Data Section - Commented out as requested
          <Animated.View
            style={[
              styles.section,
              {
                opacity: privacyOpacity,
                transform: [{ translateY: privacyTranslateY }],
              },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>{t('settings.privacyData')}</Text>

            <TouchableOpacity
              style={[styles.settingRow, { backgroundColor: theme.background.secondary, borderBottomColor: theme.border.main }]}
              onPress={handleExportData}
            >
              <View style={styles.settingLeft}>
                <Icon name="download-outline" size={24} color={theme.text.secondary} style={styles.settingIcon} />
                <Text style={[styles.settingLabel, { color: theme.text.primary }]}>{t('settings.downloadMyData')}</Text>
              </View>
              <Icon name="chevron-forward" size={20} color={theme.text.tertiary} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.settingRow, { backgroundColor: theme.background.secondary, borderBottomColor: theme.border.main }]}>
              <View style={styles.settingLeft}>
                <Icon name="eye-off-outline" size={24} color={theme.text.secondary} style={styles.settingIcon} />
                <Text style={[styles.settingLabel, { color: theme.text.primary }]}>{t('settings.profileVisibility')}</Text>
              </View>
              <Text style={[styles.settingValue, { color: theme.text.secondary }]}>{t('settings.public')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.settingRow, { backgroundColor: theme.background.secondary, borderBottomColor: theme.border.main }]}>
              <View style={styles.settingLeft}>
                <Icon name="shield-outline" size={24} color={theme.text.secondary} style={styles.settingIcon} />
                <Text style={[styles.settingLabel, { color: theme.text.primary }]}>{t('settings.dataPrivacy')}</Text>
              </View>
              <Icon name="chevron-forward" size={20} color={theme.text.tertiary} />
            </TouchableOpacity>
          </Animated.View>
          */}

                {/* About Section */}
                <Animated.View
                  style={[
                    styles.section,
                    {
                      opacity: aboutOpacity,
                      transform: [{ translateY: aboutTranslateY }],
                    },
                  ]}
                >
                  <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>{t('settings.about')}</Text>

                  <TouchableOpacity style={[styles.settingRow, { backgroundColor: theme.background.secondary, borderBottomColor: theme.border.main }]}>
                    <View style={styles.settingLeft}>
                      <Icon name="information-circle-outline" size={24} color={theme.text.secondary} style={styles.settingIcon} />
                      <Text style={[styles.settingLabel, { color: theme.text.primary }]}>{t('settings.version')}</Text>
                    </View>
                    <Text style={[styles.settingValue, { color: theme.text.secondary }]}>1.0.0</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.settingRow, { backgroundColor: theme.background.secondary, borderBottomColor: theme.border.main }]}
                    onPress={onNavigateToAbout}
                  >
                    <View style={styles.settingLeft}>
                      <Icon name="information-outline" size={24} color={theme.text.secondary} style={styles.settingIcon} />
                      <Text style={[styles.settingLabel, { color: theme.text.primary }]}>{t('about.title')}</Text>
                    </View>
                    <Icon name="chevron-forward" size={20} color={theme.text.tertiary} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.settingRow, { backgroundColor: theme.background.secondary, borderBottomColor: theme.border.main }]}
                    onPress={onNavigateToTerms}
                  >
                    <View style={styles.settingLeft}>
                      <Icon name="document-text-outline" size={24} color={theme.text.secondary} style={styles.settingIcon} />
                      <Text style={[styles.settingLabel, { color: theme.text.primary }]}>{t('settings.termsOfService')}</Text>
                    </View>
                    <Icon name="chevron-forward" size={20} color={theme.text.tertiary} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.settingRow, { backgroundColor: theme.background.secondary, borderBottomColor: theme.border.main }]}
                    onPress={onNavigateToTerms}
                  >
                    <View style={styles.settingLeft}>
                      <Icon name="shield-checkmark-outline" size={24} color={theme.text.secondary} style={styles.settingIcon} />
                      <Text style={[styles.settingLabel, { color: theme.text.primary }]}>{t('settings.privacyPolicy')}</Text>
                    </View>
                    <Icon name="chevron-forward" size={20} color={theme.text.tertiary} />
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.settingRow, { backgroundColor: theme.background.secondary, borderBottomColor: theme.border.main }]}>
                    <View style={styles.settingLeft}>
                      <Icon name="help-circle-outline" size={24} color={theme.text.secondary} style={styles.settingIcon} />
                      <Text style={[styles.settingLabel, { color: theme.text.primary }]}>{t('settings.helpSupport')}</Text>
                    </View>
                    <Icon name="chevron-forward" size={20} color={theme.text.tertiary} />
                  </TouchableOpacity>
                </Animated.View>

                {/* Danger Zone */}
                <Animated.View
                  style={[
                    styles.section,
                    {
                      opacity: dangerOpacity,
                      transform: [{ translateY: dangerTranslateY }],
                    },
                  ]}
                >
                  <Text style={[styles.sectionTitle, styles.dangerText]}>{t('settings.dangerZone')}</Text>

                  <TouchableOpacity
                    style={[styles.settingRow, { backgroundColor: theme.background.secondary, borderBottomColor: theme.border.main }]}
                    onPress={() => setShowDeleteAccountModal(true)}
                  >
                    <View style={styles.settingLeft}>
                      <Icon name="trash-outline" size={24} color="#ff3b30" style={styles.settingIcon} />
                      <Text style={[styles.settingLabel, styles.dangerText]}>{t('settings.deleteAccount')}</Text>
                    </View>
                    <Icon name="chevron-forward" size={20} color="#ff3b30" />
                  </TouchableOpacity>
                </Animated.View>

                <View style={styles.bottomSpacer} />
              </View>
            </ResponsiveContainer>
          </View>
        </ScrollView>
      </View>
    );

    return (
      <>
        {isDesktop ? (
          <SettingsLayout
            activeTab="preferences"
            onTabChange={handleTabChange}
            onLogout={authLogout}
          >
            {renderSettingsContent()}
          </SettingsLayout>
        ) : (
          <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]} edges={['top']}>
            {/* Header */}
            <Animated.View
              style={[
                styles.header,
                { backgroundColor: theme.background.primary, borderBottomColor: theme.border.main },
                {
                  opacity: headerOpacity,
                  transform: [{ translateY: headerTranslateY }],
                },
              ]}
            >
              <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
                <Icon name="arrow-back" size={24} color={theme.text.primary} />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: theme.text.primary }]}>{t('common.settings')}</Text>
              <View style={styles.headerSpacer} />
            </Animated.View>

            <ScrollView style={[styles.scrollView, { backgroundColor: theme.background.primary }]} showsVerticalScrollIndicator={false} contentContainerStyle={isDesktop && { flexGrow: 1, justifyContent: 'center' }}>
              {renderSettingsContent()}
            </ScrollView>
          </SafeAreaView>
        )}

        {/* Change Password Modal */}
        <Modal
          visible={showChangePasswordModal}
          transparent
          animationType={isDesktop ? "fade" : "fade"}
          onRequestClose={() => setShowChangePasswordModal(false)}
        >
          <View style={[styles.modalOverlay, isDesktop && styles.desktopModalOverlay]}>
            <Animated.View
              style={[
                styles.modalContent,
                isDesktop && styles.desktopModalContent,
                { backgroundColor: theme.background.primary },
                {
                  opacity: modalOpacity,
                  transform: [{ scale: modalScale }],
                },
              ]}
            >
              <Text style={[styles.modalTitle, { color: theme.text.primary }]}>{t('settings.changePassword')}</Text>

              <TextInput
                style={[styles.input, { backgroundColor: theme.background.secondary, color: theme.text.primary, borderColor: theme.border.light }]}
                placeholder={t('settings.currentPassword')}
                placeholderTextColor={theme.text.tertiary}
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
                autoCapitalize="none"
              />

              <TextInput
                style={[styles.input, { backgroundColor: theme.background.secondary, color: theme.text.primary, borderColor: theme.border.light }]}
                placeholder={t('settings.newPassword')}
                placeholderTextColor={theme.text.tertiary}
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                autoCapitalize="none"
              />

              {/* Password Strength Meter */}
              {newPassword.length > 0 && (() => {
                const strength = calculatePasswordStrength(newPassword);
                return (
                  <View style={styles.passwordStrengthContainer}>
                    <View style={styles.passwordStrengthBar}>
                      <View
                        style={[
                          styles.passwordStrengthFill,
                          { width: `${(strength.score / 4) * 100}%`, backgroundColor: strength.color },
                        ]}
                      />
                    </View>
                    <Text style={[styles.passwordStrengthLabel, { color: strength.color }]}>
                      {strength.label}
                    </Text>
                    {strength.feedback.length > 0 && (
                      <View style={styles.passwordFeedback}>
                        {strength.feedback.map((tip, index) => (
                          <Text key={index} style={styles.passwordFeedbackText}>
                            • {tip}
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })()}

              <TextInput
                style={[styles.input, { backgroundColor: theme.background.secondary, color: theme.text.primary, borderColor: theme.border.light }]}
                placeholder={t('settings.confirmNewPassword')}
                placeholderTextColor={theme.text.tertiary}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                autoCapitalize="none"
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel, { backgroundColor: theme.background.secondary }]}
                  onPress={() => {
                    setShowChangePasswordModal(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                >
                  <Text style={[styles.modalButtonTextCancel, { color: theme.text.primary }]}>{t('common.cancel')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonConfirm, { backgroundColor: theme.primary.main }]}
                  onPress={handleChangePassword}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={[styles.modalButtonText, { color: '#fff' }]}>{t('settings.changePassword')}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>

        {/* Device Management Modal */}
        <Modal
          visible={showDeviceManagementModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowDeviceManagementModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, styles.deviceModalContent, { backgroundColor: theme.background.primary }]}>
              <View style={[styles.modalHeader, { borderBottomColor: theme.border.main }]}>
                <Text style={[styles.modalTitle, { color: theme.text.primary }]}>{t('settings.activeSessions')}</Text>
                <TouchableOpacity onPress={() => setShowDeviceManagementModal(false)}>
                  <Icon name="close" size={24} color={theme.text.primary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.deviceList}>
                {sessions.map(session => (
                  <View key={session.id} style={[styles.deviceItem, { backgroundColor: theme.background.secondary, borderBottomColor: theme.border.main }]}>
                    <View style={styles.deviceInfo}>
                      <Icon
                        name={
                          session.deviceInfo.device === 'Mobile'
                            ? 'phone-portrait-outline'
                            : session.deviceInfo.device === 'Tablet'
                              ? 'tablet-portrait-outline'
                              : 'desktop-outline'
                        }
                        size={24}
                        color={theme.text.secondary}
                        style={styles.deviceIcon}
                      />
                      <View style={styles.deviceDetails}>
                        <Text style={[styles.deviceName, { color: theme.text.primary }]}>
                          {getTranslatedDeviceInfo(session.deviceInfo.browser)} {t('common.on')} {getTranslatedDeviceInfo(session.deviceInfo.os)}
                        </Text>
                        <Text style={[styles.deviceMeta, { color: theme.text.tertiary }]}>
                          {getTranslatedDeviceInfo(session.deviceInfo.device)} • {session.ip}
                        </Text>
                        <Text style={[styles.deviceMeta, { color: theme.text.tertiary }]}>
                          {t('settings.lastActive')}:{' '}
                          {new Date(session.lastUsedAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                        </Text>
                        {session.isCurrent && (
                          <Text style={[styles.currentDeviceLabel, { color: theme.primary.main }]}>
                            {t('settings.currentDevice')}
                          </Text>
                        )}
                      </View>
                    </View>

                    {!session.isCurrent && (
                      <TouchableOpacity
                        style={[styles.revokeButton, { backgroundColor: theme.error.main + '20' }]}
                        onPress={() => handleRevokeSession(session)}
                        disabled={isRevoking}
                      >
                        <Text style={[styles.revokeButtonText, { color: theme.error.main }]}>
                          {t('settings.revoke')}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Delete Account Modal */}
        <Modal
          visible={showDeleteAccountModal}
          transparent
          animationType={isDesktop ? "fade" : "fade"}
          onRequestClose={() => setShowDeleteAccountModal(false)}
        >
          <View style={[styles.modalOverlay, isDesktop && styles.desktopModalOverlay]}>
            <Animated.View
              style={[
                styles.modalContent,
                isDesktop && styles.desktopModalContent,
                { backgroundColor: theme.background.primary },
                {
                  opacity: modalOpacity,
                  transform: [{ scale: modalScale }],
                },
              ]}
            >
              <Text style={[styles.modalTitle, { color: theme.text.primary }]}>{t('settings.deleteAccountTitle')}</Text>
              <Text style={[styles.modalDescription, { color: theme.text.secondary }]}>
                {t('settings.deleteAccountWarning')}
              </Text>

              <TextInput
                style={[styles.input, { backgroundColor: theme.background.secondary, color: theme.text.primary, borderColor: theme.border.light }]}
                placeholder={t('settings.deleteAccountConfirmation')}
                placeholderTextColor={theme.text.tertiary}
                secureTextEntry
                value={deletePassword}
                onChangeText={setDeletePassword}
                autoCapitalize="none"
              />

              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: theme.background.secondary, color: theme.text.primary, borderColor: theme.border.light }]}
                placeholder={t('settings.reasonOptional')}
                placeholderTextColor={theme.text.tertiary}
                multiline
                numberOfLines={4}
                value={deleteReason}
                onChangeText={setDeleteReason}
                maxLength={500}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel, { backgroundColor: theme.background.secondary }]}
                  onPress={() => {
                    setShowDeleteAccountModal(false);
                    setDeletePassword('');
                    setDeleteReason('');
                  }}
                >
                  <Text style={[styles.modalButtonTextCancel, { color: theme.text.primary }]}>{t('common.cancel')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonDanger, { backgroundColor: theme.error.main }]}
                  onPress={handleDeleteAccount}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={[styles.modalButtonText, { color: '#fff' }]}>{t('settings.deleteAccount')}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>

        {/* Language Picker Modal */}
        <Modal
          visible={showLanguageModal}
          transparent
          animationType={isDesktop ? "fade" : "fade"}
          onRequestClose={() => setShowLanguageModal(false)}
        >
          <View style={[styles.modalOverlay, isDesktop && styles.desktopModalOverlay]}>
            <Animated.View
              style={[
                styles.modalContent,
                isDesktop && styles.desktopModalContent,
                { backgroundColor: theme.background.primary },
                {
                  opacity: modalOpacity,
                  transform: [{ scale: modalScale }],
                },
              ]}
            >
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.text.primary }]}>{t('settings.selectLanguage')}</Text>
                <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                  <Icon name="close" size={24} color={theme.text.primary} />
                </TouchableOpacity>
              </View>

              {LANGUAGE_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.pickerOption,
                    { backgroundColor: theme.background.secondary, borderColor: theme.border.main },
                    profile?.settings?.language === option.value && { backgroundColor: theme.primary.light, borderColor: theme.primary.main },
                  ]}
                  onPress={() => handleLanguageChange(option.value)}
                  disabled={isUpdating}
                >
                  <Text
                    style={[
                      styles.pickerOptionText,
                      { color: theme.text.primary },
                      profile?.settings?.language === option.value && { color: theme.primary.main },
                    ]}
                  >
                    {option.label}
                  </Text>
                  {profile?.settings?.language === option.value && (
                    <Icon name="checkmark" size={24} color={theme.primary.main} />
                  )}
                </TouchableOpacity>
              ))}
            </Animated.View>
          </View>
        </Modal>

        {/* Theme Picker Modal */}
        <Modal
          visible={showThemeModal}
          transparent
          animationType={isDesktop ? "fade" : "fade"}
          onRequestClose={() => setShowThemeModal(false)}
        >
          <View style={[styles.modalOverlay, isDesktop && styles.desktopModalOverlay]}>
            <Animated.View
              style={[
                styles.modalContent,
                isDesktop && styles.desktopModalContent,
                { backgroundColor: theme.background.primary },
                {
                  opacity: modalOpacity,
                  transform: [{ scale: modalScale }],
                },
              ]}
            >
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.text.primary }]}>{t('settings.selectTheme')}</Text>
                <TouchableOpacity onPress={() => setShowThemeModal(false)}>
                  <Icon name="close" size={24} color={theme.text.primary} />
                </TouchableOpacity>
              </View>

              {THEME_OPTIONS.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.pickerOption,
                    { backgroundColor: theme.background.secondary, borderColor: theme.border.main },
                    profile?.settings?.theme === option.value && { backgroundColor: theme.primary.light, borderColor: theme.primary.main },
                  ]}
                  onPress={() => handleThemeChange(option.value)}
                  disabled={isUpdating}
                >
                  <View style={styles.pickerOptionLeft}>
                    <Icon name={option.icon} size={24} color={theme.text.secondary} style={styles.pickerIcon} />
                    <Text
                      style={[
                        styles.pickerOptionText,
                        { color: theme.text.primary },
                        profile?.settings?.theme === option.value && { color: theme.primary.main },
                      ]}
                    >
                      {t(`settings.${option.value}`)}
                    </Text>
                  </View>
                  {profile?.settings?.theme === option.value && (
                    <Icon name="checkmark" size={24} color={theme.primary.main} />
                  )}
                </TouchableOpacity>
              ))}
            </Animated.View>
          </View>
        </Modal>

        {/* Logout All Devices Modal */}
        <Modal
          visible={showLogoutAllDevicesModal}
          transparent
          animationType={isDesktop ? "fade" : "fade"}
          onRequestClose={() => setShowLogoutAllDevicesModal(false)}
        >
          <View style={[styles.modalOverlay, isDesktop && styles.desktopModalOverlay]}>
            <Animated.View
              style={[
                styles.modalContent,
                isDesktop && styles.desktopModalContent,
                { backgroundColor: theme.background.primary },
                {
                  opacity: modalOpacity,
                  transform: [{ scale: modalScale }],
                },
              ]}
            >
              <Text style={[styles.modalTitle, { color: theme.text.primary }]}>
                {t('settings.logoutAllDevicesTitle')}
              </Text>
              <Text style={[styles.modalDescription, { color: theme.text.secondary }]}>
                {t('settings.logoutAllDevicesConfirm')}
              </Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel, { backgroundColor: theme.background.secondary }]}
                  onPress={() => setShowLogoutAllDevicesModal(false)}
                >
                  <Text style={[styles.modalButtonTextCancel, { color: theme.text.primary }]}>
                    {t('common.cancel')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonDanger, { backgroundColor: theme.error.main }]}
                  onPress={handleConfirmLogoutAllDevices}
                  disabled={isRevoking}
                >
                  {isRevoking ? (
                    <ActivityIndicator size="small" color={theme.primary.contrast} />
                  ) : (
                    <Text style={[styles.modalButtonText, { color: theme.primary.contrast }]}>
                      {t('settings.logoutAllDevices')}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>
        {/* Subscription Cancellation Modal */}
        <Modal
          visible={showCancelSubscriptionModal}
          transparent
          animationType={isDesktop ? "fade" : "fade"}
          onRequestClose={() => setShowCancelSubscriptionModal(false)}
        >
          <View style={[styles.modalOverlay, isDesktop && styles.desktopModalOverlay]}>
            <Animated.View
              style={[
                styles.modalContent,
                isDesktop && styles.desktopModalContent,
                { backgroundColor: theme.background.primary },
                {
                  opacity: modalOpacity,
                  transform: [{ scale: modalScale }],
                },
              ]}
            >
              <Text style={[styles.modalTitle, { color: theme.text.primary }]}>
                {t('settings.cancelSubscriptionConfirmTitle')}
              </Text>
              <Text style={[styles.modalDescription, { color: theme.text.secondary }]}>
                {t('settings.cancelSubscriptionConfirmMessage')}
              </Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel, { backgroundColor: theme.background.secondary }]}
                  onPress={() => setShowCancelSubscriptionModal(false)}
                >
                  <Text style={[styles.modalButtonTextCancel, { color: theme.text.primary }]}>
                    {t('common.cancel')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonDanger, { backgroundColor: theme.error.main }]}
                  onPress={handleCancelSubscription}
                  disabled={isCancelling}
                >
                  {isCancelling ? (
                    <ActivityIndicator size="small" color={theme.primary.contrast} />
                  ) : (
                    <Text style={[styles.modalButtonText, { color: theme.primary.contrast }]}>
                      {t('settings.cancelSubscription')}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </Modal>

        {/* Notification Preferences Modal */}
        <Modal
          visible={showNotificationPreferencesModal}
          transparent
          animationType={isDesktop ? "fade" : "slide"}
          onRequestClose={() => setShowNotificationPreferencesModal(false)}
        >
          <View style={[styles.modalOverlay, isDesktop && styles.desktopModalOverlay]}>
            <View style={[
              styles.modalContent,
              styles.notificationModalContent,
              { backgroundColor: theme.background.primary },
              isDesktop && styles.desktopModalContent
            ]}>
              <View style={[styles.modalHeader, { borderBottomColor: theme.border.main }]}>
                <Text style={[styles.modalTitle, { color: theme.text.primary }]}>
                  {t('settings.notificationPreferences')}
                </Text>
                <TouchableOpacity onPress={() => setShowNotificationPreferencesModal(false)}>
                  <Icon name="close" size={24} color={theme.text.primary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.notificationScrollView} showsVerticalScrollIndicator={false}>
                {/* Subscription Notifications */}
                <Text style={[styles.notificationCategoryTitle, { color: theme.primary.main }]}>
                  {t('settings.subscription')}
                </Text>
                <View style={[styles.notificationRow, { borderBottomColor: theme.border.light }]}>
                  <Text style={[styles.notificationLabel, { color: theme.text.primary }]}>{t('settings.renewals')}</Text>
                  <Switch
                    value={preferences?.subscription?.renewals || false}
                    onValueChange={(value) => {
                      updatePreferences({ subscription: { ...preferences?.subscription, renewals: value } as any });
                    }}
                    trackColor={{ false: theme.border.main, true: theme.primary.main }}
                    thumbColor={theme.background.primary}
                  />
                </View>
                <View style={[styles.notificationRow, { borderBottomColor: theme.border.light }]}>
                  <Text style={[styles.notificationLabel, { color: theme.text.primary }]}>{t('settings.cancellations')}</Text>
                  <Switch
                    value={preferences?.subscription?.cancellations || false}
                    onValueChange={(value) => {
                      updatePreferences({ subscription: { ...preferences?.subscription, cancellations: value } as any });
                    }}
                    trackColor={{ false: theme.border.main, true: theme.primary.main }}
                    thumbColor={theme.background.primary}
                  />
                </View>
                <View style={[styles.notificationRow, { borderBottomColor: theme.border.light }]}>
                  <Text style={[styles.notificationLabel, { color: theme.text.primary }]}>{t('settings.upgrades')}</Text>
                  <Switch
                    value={preferences?.subscription?.upgrades || false}
                    onValueChange={(value) => {
                      updatePreferences({ subscription: { ...preferences?.subscription, upgrades: value } as any });
                    }}
                    trackColor={{ false: theme.border.main, true: theme.primary.main }}
                    thumbColor={theme.background.primary}
                  />
                </View>

                {/* Content Notifications */}
                <Text style={[styles.notificationCategoryTitle, { color: theme.primary.main }]}>
                  {t('settings.content')}
                </Text>
                <View style={[styles.notificationRow, { borderBottomColor: theme.border.light }]}>
                  <Text style={[styles.notificationLabel, { color: theme.text.primary }]}>{t('settings.newInsights')}</Text>
                  <Switch
                    value={preferences?.content?.newInsights || false}
                    onValueChange={(value) => {
                      updatePreferences({ content: { ...preferences?.content, newInsights: value } as any });
                    }}
                    trackColor={{ false: theme.border.main, true: theme.primary.main }}
                    thumbColor={theme.background.primary}
                  />
                </View>
                <View style={[styles.notificationRow, { borderBottomColor: theme.border.light }]}>
                  <Text style={[styles.notificationLabel, { color: theme.text.primary }]}>{t('settings.savedContent')}</Text>
                  <Switch
                    value={preferences?.content?.savedContent || false}
                    onValueChange={(value) => {
                      updatePreferences({ content: { ...preferences?.content, savedContent: value } as any });
                    }}
                    trackColor={{ false: theme.border.main, true: theme.primary.main }}
                    thumbColor={theme.background.primary}
                  />
                </View>

                {/* Engagement Notifications */}
                <Text style={[styles.notificationCategoryTitle, { color: theme.primary.main }]}>
                  {t('settings.engagement')}
                </Text>
                <View style={[styles.notificationRow, { borderBottomColor: theme.border.light }]}>
                  <Text style={[styles.notificationLabel, { color: theme.text.primary }]}>{t('settings.likes')}</Text>
                  <Switch
                    value={preferences?.engagement?.likes || false}
                    onValueChange={(value) => {
                      updatePreferences({ engagement: { ...preferences?.engagement, likes: value } as any });
                    }}
                    trackColor={{ false: theme.border.main, true: theme.primary.main }}
                    thumbColor={theme.background.primary}
                  />
                </View>
                <View style={[styles.notificationRow, { borderBottomColor: theme.border.light }]}>
                  <Text style={[styles.notificationLabel, { color: theme.text.primary }]}>{t('settings.comments')}</Text>
                  <Switch
                    value={preferences?.engagement?.comments || false}
                    onValueChange={(value) => {
                      updatePreferences({ engagement: { ...preferences?.engagement, comments: value } as any });
                    }}
                    trackColor={{ false: theme.border.main, true: theme.primary.main }}
                    thumbColor={theme.background.primary}
                  />
                </View>
                <View style={[styles.notificationRow, { borderBottomColor: theme.border.light }]}>
                  <Text style={[styles.notificationLabel, { color: theme.text.primary }]}>{t('settings.follows')}</Text>
                  <Switch
                    value={preferences?.engagement?.follows || false}
                    onValueChange={(value) => {
                      updatePreferences({ engagement: { ...preferences?.engagement, follows: value } as any });
                    }}
                    trackColor={{ false: theme.border.main, true: theme.primary.main }}
                    thumbColor={theme.background.primary}
                  />
                </View>

                {/* System Notifications */}
                <Text style={[styles.notificationCategoryTitle, { color: theme.primary.main }]}>
                  {t('settings.system')}
                </Text>
                <View style={[styles.notificationRow, { borderBottomColor: theme.border.light }]}>
                  <Text style={[styles.notificationLabel, { color: theme.text.primary }]}>{t('settings.securityAlerts')}</Text>
                  <Switch
                    value={preferences?.system?.securityAlerts || false}
                    onValueChange={(value) => {
                      updatePreferences({ system: { ...preferences?.system, securityAlerts: value } as any });
                    }}
                    trackColor={{ false: theme.border.main, true: theme.primary.main }}
                    thumbColor={theme.background.primary}
                  />
                </View>
                <View style={[styles.notificationRow, { borderBottomColor: theme.border.light }]}>
                  <Text style={[styles.notificationLabel, { color: theme.text.primary }]}>{t('settings.accountActivity')}</Text>
                  <Switch
                    value={preferences?.system?.accountActivity || false}
                    onValueChange={(value) => {
                      updatePreferences({ system: { ...preferences?.system, accountActivity: value } as any });
                    }}
                    trackColor={{ false: theme.border.main, true: theme.primary.main }}
                    thumbColor={theme.background.primary}
                  />
                </View>
                <View style={[styles.notificationRow, { borderBottomColor: theme.border.light }]}>
                  <Text style={[styles.notificationLabel, { color: theme.text.primary }]}>{t('settings.policyChanges')}</Text>
                  <Switch
                    value={preferences?.system?.policyChanges || false}
                    onValueChange={(value) => {
                      updatePreferences({ system: { ...preferences?.system, policyChanges: value } as any });
                    }}
                    trackColor={{ false: theme.border.main, true: theme.primary.main }}
                    thumbColor={theme.background.primary}
                  />
                </View>

                {/* Marketing Notifications */}
                <Text style={[styles.notificationCategoryTitle, { color: theme.primary.main }]}>
                  {t('settings.marketing')}
                </Text>
                <View style={[styles.notificationRow, { borderBottomColor: theme.border.light }]}>
                  <Text style={[styles.notificationLabel, { color: theme.text.primary }]}>{t('settings.promotions')}</Text>
                  <Switch
                    value={preferences?.marketing?.promotions || false}
                    onValueChange={(value) => {
                      updatePreferences({ marketing: { ...preferences?.marketing, promotions: value } as any });
                    }}
                    trackColor={{ false: theme.border.main, true: theme.primary.main }}
                    thumbColor={theme.background.primary}
                  />
                </View>
                <View style={[styles.notificationRow, { borderBottomColor: theme.border.light }]}>
                  <Text style={[styles.notificationLabel, { color: theme.text.primary }]}>{t('settings.newsletter')}</Text>
                  <Switch
                    value={preferences?.marketing?.newsletter || false}
                    onValueChange={(value) => {
                      updatePreferences({ marketing: { ...preferences?.marketing, newsletter: value } as any });
                    }}
                    trackColor={{ false: theme.border.main, true: theme.primary.main }}
                    thumbColor={theme.background.primary}
                  />
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </>
    );
  }
);

SettingsScreen.displayName = 'SettingsScreen';
