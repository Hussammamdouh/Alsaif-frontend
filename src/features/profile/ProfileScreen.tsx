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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { styles } from './profile.styles';
import { useProfile } from './profile.hooks';
import { useLocalization } from '../../app/providers/LocalizationProvider';
import { useTheme } from '../../app/providers/ThemeProvider';
import { useAuth } from '../../app/auth';

/**
 * Profile Screen Props
 */
interface ProfileScreenProps {
  onNavigateBack: () => void;
  onNavigateToSettings: () => void;
  onNavigateToSubscription?: () => void;
  onNavigateToTerms: () => void;
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
  onNavigateToInsightRequests,
  onLogout
}) => {
  const { profile, subscription, isLoading, loadProfile } = useProfile();
  const { language, t } = useLocalization();
  const { theme } = useTheme();
  const { logout: authLogout } = useAuth();

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
  }, [authLogout, onLogout, t]);

  /**
   * Format join date
   */
  const joinDate = useMemo(() => {
    const rawDate = profile?.createdAt || subscription?.startDate;
    if (!rawDate) return '';
    try {
      const date = new Date(rawDate);
      return date.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
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

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background.primary }]}
      edges={['top']}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border.main }]}>
        <Text style={[styles.headerTitle, { color: theme.text.primary }]}>
          {t('profile.title')}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
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
        {/* Profile Info Section */}
        <View style={[styles.profileSection, { borderBottomColor: theme.border.main }]}>
          <View style={styles.avatarContainer}>
            {profile?.avatar ? (
              <Image
                source={{ uri: profile.avatar }}
                style={[styles.avatar, { borderColor: theme.border.main }]}
              />
            ) : (
              <View style={[styles.avatarPlaceholder, {
                backgroundColor: theme.primary.main + '20',
                borderColor: theme.primary.main + '40'
              }]}>
                <Text style={[styles.avatarText, { color: theme.primary.main }]}>
                  {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              </View>
            )}
          </View>
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
          {profile?.role !== 'admin' && profile?.role !== 'superadmin' && (
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
          )}

          <View style={[styles.statItem, {
            backgroundColor: theme.background.secondary,
            borderColor: theme.border.main,
            flex: profile?.role === 'admin' || profile?.role === 'superadmin' ? 1 : undefined
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
        </View>

        {/* Subscription Card */}
        {subscription && (
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

            {onNavigateToSubscription && profile?.role !== 'admin' && profile?.role !== 'superadmin' && (
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.subscriptionButton, { backgroundColor: theme.primary.main }]}
                onPress={onNavigateToSubscription}
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
        {subscription?.tier === 'premium' && onNavigateToInsightRequests && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text.tertiary }]}>
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
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text.tertiary }]}>
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
              onPress={onNavigateToSettings}
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

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text.tertiary }]}>
            {t('profile.support')}
          </Text>
          <View style={[styles.menuCard, {
            backgroundColor: theme.background.secondary,
            borderColor: theme.border.main
          }]}>
            <TouchableOpacity
              style={styles.menuItem}
              activeOpacity={0.7}
              onPress={onNavigateToTerms}
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
            Elsaif Analysis v1.0.0
          </Text>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

export const ProfileScreen = React.memo(ProfileScreenComponent);
ProfileScreen.displayName = 'ProfileScreen';
