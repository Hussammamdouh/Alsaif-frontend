/**
 * Profile Screen
 * Premium redesign with linear gradients, glassmorphism, and fixed logout
 */

import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage } from '../../core/services/media/mediaService';

import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { styles } from './profile.styles';
import { useProfile } from './profile.hooks';
import { useLocalization } from '../../app/providers/LocalizationProvider';
import { useTheme } from '../../app/providers/ThemeProvider';
import { formatDateSafe } from '../../shared/utils/dateUtils';
import { useAuth } from '../../app/auth';
import { ResponsiveContainer, AuthRequiredGate } from '../../shared/components';
import { SettingsLayout, SettingsTab } from '../settings/SettingsLayout';

/**
 * Profile Screen Props
 */
interface ProfileScreenProps {
  onNavigateBack: () => void;
  onNavigateToSettings: () => void;
  onNavigateToSubscription?: (isSubscribed: boolean) => void;
  onNavigateToTerms: (tab?: 'privacy' | 'terms') => void;
  onNavigateToAbout?: () => void;
  onNavigateToInsightRequests?: () => void;
  onLogout: () => void;
}

/**
 * Profile Screen Component
 */
const ProfileScreenComponent: React.FC<ProfileScreenProps> = ({
  onNavigateToSettings,
  onNavigateToSubscription,
  onNavigateToTerms,
  onNavigateToAbout,
  onNavigateToInsightRequests,
  onLogout
}) => {
  const { profile, updateProfile, subscription, isLoading, loadProfile } = useProfile();
  console.log('[ProfileScreen] Render', { hasProfile: !!profile, isLoading, role: profile?.role });
  const { language, t } = useLocalization();
  const { theme, isDark } = useTheme();
  const { logout: authLogout, state: authState } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const navigation = useNavigation<any>();

  const isAdmin = authState.session?.user?.role === 'admin' || authState.session?.user?.role === 'superadmin' || authState.session?.user?.role === 'moderator';

  // Force refetch when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('[ProfileScreen] Focus - reloading profile');
      loadProfile();
    }, [loadProfile])
  );

  /**
   * Handle logout button press with localization
   */
  const handleLogoutPress = useCallback(async () => {
    console.log('[ProfileScreen] Logout button CLICKED - handler executing');

    // DIAGNOSTIC: Try calling logout directly to rule out Alert issues
    try {
      console.log('[ProfileScreen] DIAGNOSTIC: Attempting direct authLogout call (skipping Alert)...');
      if (typeof authLogout !== 'function') {
        console.error('[ProfileScreen] ERROR: authLogout is NOT a function!', typeof authLogout);
        return;
      }

      await authLogout();
      console.log('[ProfileScreen] DIAGNOSTIC: authLogout call finished');

      if (onLogout) {
        console.log('[ProfileScreen] calling onLogout prop');
        onLogout();
      }
    } catch (err) {
      console.error('[ProfileScreen] DIAGNOSTIC: direct authLogout failed:', err);
      Alert.alert('Logout Error', 'Failed to logout. Please try again.');
    }
  }, [authLogout, onLogout]);

  /**
   * Handle avatar press - pick image and upload
   */
  const [isUpdatingAvatar, setIsUpdatingAvatar] = React.useState(false);

  const handleAvatarPress = useCallback(async () => {
    try {
      // Permission check
      const current = await ImagePicker.getMediaLibraryPermissionsAsync();
      if (current.status === 'denied') {
        Alert.alert(
          t('common.photoLibraryAccess') || 'Photo Library Access',
          t('profile.photoPermissionMessage') || 'Please enable photo library access in your device Settings to change your avatar.',
          [
            { text: t('common.cancel'), style: 'cancel' },
            { text: t('common.settings'), onPress: () => Linking.openSettings() }
          ]
        );
        return;
      }

      if (current.status === 'undetermined') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          return;
        }
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];

        // Validate file size (max 5MB)
        const MAX_FILE_SIZE = 5 * 1024 * 1024;
        let fileSize = selectedImage.fileSize;
        if (!fileSize && selectedImage.uri) {
          try {
            const response = await fetch(selectedImage.uri);
            const blob = await response.blob();
            fileSize = blob.size;
          } catch (e) {
            console.log('Error getting size from blob:', e);
          }
        }

        if (fileSize && fileSize > MAX_FILE_SIZE) {
          Alert.alert(t('common.error'), t('media.fileTooLarge'));
          return;
        }

        setIsUpdatingAvatar(true);
        try {
          // 1. Upload to media service
          const imageUrl = await uploadImage(
            selectedImage.uri,
            'avatar.jpg',
            'image/jpeg'
          );

          // 2. Update user profile
          const updateResult = await updateProfile({ avatar: imageUrl });

          if (updateResult.success) {
            Alert.alert('Success', 'Profile picture updated successfully');
            loadProfile(); // Refresh profile data
          } else {
            throw new Error(updateResult.error || 'Failed to update profile');
          }
        } catch (uploadErr: any) {
          console.error('[ProfileScreen] Avatar update error:', uploadErr);
          Alert.alert('Update Failed', uploadErr.message || 'Could not update profile picture');
        } finally {
          setIsUpdatingAvatar(false);
        }
      }
    } catch (pickerErr) {
      console.error('[ProfileScreen] Image picker error:', pickerErr);
    }
  }, [updateProfile, loadProfile]);

  /**
   * Handle sidebar tab change for Desktop
   */
  const handleTabChange = useCallback((tab: SettingsTab) => {
    switch (tab) {
      case 'profile':
        // Already on profile
        break;
      case 'preferences':
        onNavigateToSettings();
        break;
      case 'security':
        navigation.navigate('Main', { screen: 'Security' });
        break;
      case 'subscription':
        if (isAdmin) return;
        if (onNavigateToSubscription) {
          const isSubscribed = subscription?.tier === 'premium' && subscription?.status === 'active';
          onNavigateToSubscription(isSubscribed);
        }
        break;
      case 'terms':
        navigation.navigate('Main', { screen: 'Terms' });
        break;
      case 'about':
        navigation.navigate('Main', { screen: 'About' });
        break;
    }
  }, [onNavigateToSettings, onNavigateToSubscription, subscription, navigation, isAdmin]);

  /**
   * Format join date
   */
  const joinDate = useMemo(() => {
    const rawDate = profile?.createdAt || subscription?.startDate;
    if (!rawDate) return '';
    try {
      const date = new Date(rawDate);
      return formatDateSafe(date, language, {
        month: 'short',
        year: 'numeric',
      });
    } catch (e) {
      return '';
    }
  }, [profile?.createdAt, subscription?.startDate, language]);

  if (isLoading && !profile) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background.primary }]}>
        <ActivityIndicator size="large" color={theme.primary.main} />
      </View>
    );
  }

  const renderProfileContent = () => (
    <View style={isDesktop ? { width: '100%' } : null}>
      <ResponsiveContainer maxWidth={isDesktop ? 800 : undefined}>
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
          {/* Profile Info Section */}
          <View style={[styles.profileSection, { borderBottomColor: theme.border.main }]}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleAvatarPress}
              disabled={isUpdatingAvatar}
              style={[styles.avatarContainer, isDesktop && { width: 90, height: 90, marginBottom: 12 }]}
            >
              {profile?.avatar ? (
                <View>
                  <Image
                    source={{ uri: profile.avatar }}
                    style={[styles.avatar, { borderColor: theme.border.main }, isDesktop && { width: 90, height: 90 }]}
                  />
                  <View style={[styles.avatarBadge, { backgroundColor: theme.primary.main }]}>
                    <Ionicons name="camera" size={12} color="white" />
                  </View>
                </View>
              ) : (
                <View style={[styles.avatarPlaceholder, {
                  backgroundColor: theme.primary.main + '20',
                  borderColor: theme.primary.main + '40'
                }, isDesktop && { width: 90, height: 90 }]}>
                  <Text style={[styles.avatarText, { color: theme.primary.main }]}>
                    {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </Text>
                  <View style={[styles.avatarBadge, { backgroundColor: theme.primary.main }]}>
                    <Ionicons name="camera" size={12} color="white" />
                  </View>
                </View>
              )}
              {isUpdatingAvatar && (
                <View style={styles.avatarLoadingOverlay}>
                  <ActivityIndicator size="small" color="white" />
                </View>
              )}
            </TouchableOpacity>
            <View style={styles.nameContainer}>
              <Text style={[styles.profileName, { color: theme.text.primary }]}>
                {profile?.name || t('profile.user')}
              </Text>
              <Text style={[styles.profileEmail, { color: theme.text.secondary }]}>
                {profile?.email || ''}
              </Text>
            </View>
          </View>

          {/* Stats Section */}
          <View style={styles.statsContainer}>
            <View style={[styles.statItem, {
              backgroundColor: theme.background.secondary,
              borderColor: theme.border.main
            }]}>
              <View style={[styles.statIconContainer, { backgroundColor: theme.primary.main + '10' }]}>
                <Ionicons name="calendar-outline" size={22} color={theme.primary.main} />
              </View>
              <Text style={[styles.statValue, { color: theme.text.primary }]}>{joinDate}</Text>
              <Text style={[styles.statLabel, { color: theme.text.tertiary }]}>{t('profile.memberSince')}</Text>
            </View>

            {!isAdmin && Platform.OS === 'android' && (
              <View style={[styles.statItem, {
                backgroundColor: theme.background.secondary,
                borderColor: theme.border.main
              }]}>
                <View style={[styles.statIconContainer, { backgroundColor: '#10B98110' }]}>
                  <Ionicons
                    name={subscription?.tier === 'premium' ? 'star' : 'person-outline'}
                    size={22}
                    color="#10B981"
                  />
                </View>
                <Text style={[styles.statValue, { color: theme.text.primary }]}>
                  {subscription?.tier === 'premium' ? t('profile.premium') : t('profile.free')}
                </Text>
                <Text style={[styles.statLabel, { color: theme.text.tertiary }]}>{t('profile.subscription')}</Text>
              </View>
            )}
          </View>

          {/* Subscription Card - HIDDEN for Admins */}
          {!isAdmin && subscription && Platform.OS === 'android' && (
            <View style={[styles.subscriptionCard, {
              backgroundColor: subscription.tier === 'premium' ? theme.primary.main + '05' : theme.background.secondary,
              borderColor: subscription.tier === 'premium' ? theme.primary.main + '30' : theme.border.main
            }]}>
              <View style={styles.subscriptionHeader}>
                <View>
                  <Text style={[styles.subscriptionTitle, { color: theme.text.primary }]}>
                    {subscription.tier === 'premium' ? t('profile.premiumPlan') : t('profile.freePlan')}
                  </Text>
                  <Text style={[styles.subscriptionSubtitle, { color: theme.text.secondary }]}>
                    {subscription.tier === 'premium'
                      ? t('profile.premiumDescription')
                      : t('profile.freeDescription')}
                  </Text>
                </View>
                {subscription.tier === 'premium' && (
                  <View style={[styles.premiumBadge, {
                    backgroundColor: '#FFD70020',
                    borderColor: '#FFD70040'
                  }]}>
                    <Ionicons name="sparkles" size={24} color="#FFD700" />
                  </View>
                )}
              </View>

              {/* Benefits list for premium */}
              {subscription.tier === 'premium' && (
                <View style={styles.subscriptionBenefits}>
                  <View style={styles.benefitItem}>
                    <Ionicons name="checkmark-circle" size={20} color={theme.primary.main} />
                    <Text style={[styles.benefitText, { color: theme.text.primary }]}>Unlimited Insights</Text>
                  </View>
                  <View style={styles.benefitItem}>
                    <Ionicons name="checkmark-circle" size={20} color={theme.primary.main} />
                    <Text style={[styles.benefitText, { color: theme.text.primary }]}>Expert Analysis</Text>
                  </View>
                </View>
              )}

              {onNavigateToSubscription && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.subscriptionButton, { backgroundColor: theme.primary.main }]}
                  onPress={() => onNavigateToSubscription(subscription.tier === 'premium' && subscription.status === 'active')}
                >
                  <Text style={styles.subscriptionButtonText}>
                    {subscription.tier === 'premium'
                      ? t('profile.manageSubscription')
                      : t('profile.upgradeToPremium')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Insight Requests for Premium Users */}
          {subscription?.tier === 'premium' && onNavigateToInsightRequests && !isAdmin && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text.tertiary }, isDesktop && { marginBottom: 8, marginTop: 12 }]}>
                {t('insights.premiumInsights')}
              </Text>
              <View style={[styles.menuCard, {
                backgroundColor: theme.background.secondary,
                borderColor: theme.border.main
              }]}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={onNavigateToInsightRequests}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={[styles.menuIconContainer, { backgroundColor: theme.primary.main + '10' }]}>
                      <Ionicons name="document-text-outline" size={22} color={theme.primary.main} />
                    </View>
                    <Text style={[styles.menuLabel, { color: theme.text.primary }]}>
                      {t('admin.insightRequests')}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={theme.text.tertiary} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Menu Sections */}
          <View style={[styles.section, isDesktop && { marginTop: 12 }]}>
            <Text style={[styles.sectionTitle, { color: theme.text.tertiary }, isDesktop && { marginBottom: 8 }]}>
              {t('profile.account')}
            </Text>
            <View style={[styles.menuCard, {
              backgroundColor: theme.background.secondary,
              borderColor: theme.border.main
            }]}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={onNavigateToSettings}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuIconContainer, { backgroundColor: theme.primary.main + '10' }]}>
                    <Ionicons name="settings-outline" size={22} color={theme.primary.main} />
                  </View>
                  <Text style={[styles.menuLabel, { color: theme.text.primary }]}>
                    {t('common.settings')}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.text.tertiary} />
              </TouchableOpacity>

              <View style={[styles.divider, { backgroundColor: theme.border.main }]} />

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleTabChange('security')}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuIconContainer, { backgroundColor: '#A855F710' }]}>
                    <Ionicons name="lock-closed-outline" size={22} color="#A855F7" />
                  </View>
                  <Text style={[styles.menuLabel, { color: theme.text.primary }]}>
                    {t('profile.security')}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.text.tertiary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.section, isDesktop && { marginTop: 12 }]}>
            <Text style={[styles.sectionTitle, { color: theme.text.tertiary }, isDesktop && { marginBottom: 8 }]}>
              {t('profile.support')}
            </Text>
            <View style={[styles.menuCard, {
              backgroundColor: theme.background.secondary,
              borderColor: theme.border.main
            }]}>
              <TouchableOpacity
                style={styles.menuItem}
                activeOpacity={0.7}
                onPress={() => onNavigateToTerms('privacy')}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuIconContainer, { backgroundColor: '#6366F110' }]}>
                    <Ionicons name="information-circle-outline" size={22} color="#6366F1" />
                  </View>
                  <Text style={[styles.menuLabel, { color: theme.text.primary }]}>
                    {t('profile.privacy')}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.text.tertiary} />
              </TouchableOpacity>

              <View style={[styles.divider, { backgroundColor: theme.border.main }]} />

              <TouchableOpacity
                style={styles.menuItem}
                activeOpacity={0.7}
                onPress={onNavigateToAbout}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuIconContainer, { backgroundColor: '#10B98110' }]}>
                    <Ionicons name="information-outline" size={22} color="#10B981" />
                  </View>
                  <Text style={[styles.menuLabel, { color: theme.text.primary }]}>
                    {t('about.title')}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.text.tertiary} />
              </TouchableOpacity>

              <View style={[styles.divider, { backgroundColor: theme.border.main }]} />

              <TouchableOpacity
                style={styles.menuItem}
                activeOpacity={0.7}
                onPress={() => Linking.openURL('https://www.instagram.com/alsaifdata?igsh=MXZycWgzYmludmEzZA==')}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuIconContainer, { backgroundColor: '#E1306C10' }]}>
                    <Ionicons name="logo-instagram" size={22} color="#E1306C" />
                  </View>
                  <Text style={[styles.menuLabel, { color: theme.text.primary }]}>
                    {t('profile.instagram')}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.text.tertiary} />
              </TouchableOpacity>

              <View style={[styles.divider, { backgroundColor: theme.border.main }]} />

              <TouchableOpacity
                style={styles.menuItem}
                activeOpacity={0.7}
                onPress={() => Linking.openURL('https://x.com/alsaifanalysis?s=11')}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuIconContainer, { backgroundColor: theme.text.primary + '10' }]}>
                    <Ionicons name="logo-x" size={22} color={theme.text.primary} />
                  </View>
                  <Text style={[styles.menuLabel, { color: theme.text.primary }]}>
                    {t('profile.x')}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.text.tertiary} />
              </TouchableOpacity>

              <View style={[styles.divider, { backgroundColor: theme.border.main }]} />

              <TouchableOpacity
                style={styles.menuItem}
                activeOpacity={0.7}
                onPress={() => Linking.openURL('https://t.me/alsaif_analysis')}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuIconContainer, { backgroundColor: '#0088cc10' }]}>
                    <Ionicons name="paper-plane" size={22} color="#0088cc" />
                  </View>
                  <Text style={[styles.menuLabel, { color: theme.text.primary }]}>
                    {t('profile.telegram')}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.text.tertiary} />
              </TouchableOpacity>

            </View>
          </View>

          {/* Footer Area */}
          <View style={styles.footer}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.logoutButton, {
                backgroundColor: theme.error.main + '10',
                borderColor: theme.error.main + '20'
              }]}
              onPress={handleLogoutPress}
            >
              <Ionicons name="log-out-outline" size={22} color={theme.error.main} />
              <Text style={[styles.logoutText, { color: theme.error.main }]}>{t('profile.logout')}</Text>
            </TouchableOpacity>

            <Text style={[styles.versionText, { color: theme.text.tertiary }]}>
              Alsaif Analysis v1.0.0
            </Text>
          </View>

          <View style={styles.bottomSpacer} />
        </View>
      </ResponsiveContainer>
    </View>
  );

  if (isDesktop) {
    return (
      <AuthRequiredGate
        title={t('profile.loginRequired') || 'Profile Access'}
        message={t('profile.loginMessage') || 'Log in to view your profile, manage settings, and track your subscriptions.'}
        icon="person-outline"
      >
        <SettingsLayout
          activeTab="profile"
          onTabChange={handleTabChange}
          onLogout={handleLogoutPress}
          showSubscription={!isAdmin && Platform.OS === 'android'}
        >
          {renderProfileContent()}
        </SettingsLayout>
      </AuthRequiredGate>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background.primary }]}
      edges={['top']}
    >
      <AuthRequiredGate
        title={t('profile.loginRequired') || 'Profile Access'}
        message={t('profile.loginMessage') || 'Log in to view your profile, manage settings, and track your subscriptions.'}
        icon="person-outline"
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.border.main, height: isDesktop ? 80 : undefined, paddingTop: isDesktop ? 0 : 20, justifyContent: 'center' }]}>
          <Text style={[styles.headerTitle, { color: theme.text.primary }]}>
            {t('profile.title')}
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={[styles.scrollContent, isDesktop && { flexGrow: 1, justifyContent: 'center' }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={loadProfile}
              tintColor={theme.primary.main}
              colors={[theme.primary.main]}
            />
          }
        >
          <View style={isDesktop ? { padding: 40, alignItems: 'center' } : null}>
            {renderProfileContent()}
          </View>
        </ScrollView>
      </AuthRequiredGate>
    </SafeAreaView >
  );
};

export const ProfileScreen = React.memo(ProfileScreenComponent);
ProfileScreen.displayName = 'ProfileScreen';
