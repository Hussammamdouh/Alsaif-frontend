/**
 * SubscriptionScreen
 * Manage user subscriptions, view plans, upgrade, and cancel
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  useWindowDimensions,
  Platform,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useLocalization, useTheme } from '../../app/providers';
import { SettingsLayout, SettingsTab } from '../settings/SettingsLayout';
import { ResponsiveContainer, AuthRequiredGate } from '../../shared/components';
import { createSubscriptionStyles } from './subscription.styles';
import { LinearGradient } from 'expo-linear-gradient';
import {
  useSubscription,
  useSubscriptionPlans,
  useCheckout,
  useSystemSettings,
} from './subscription.hooks';
import {
  TIER_COLORS,
  TIER_ICONS,
  STATUS_COLORS,
  BILLING_CYCLE_LABELS,
  MESSAGES,
} from './subscription.constants';
import { BillingCycle } from './subscription.types';
import { formatCurrency, formatDate, formatRelativeTime } from './subscription.mapper';
import { useAuth } from '../../app/auth';

export const SubscriptionScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t, isRTL } = useLocalization();
  const { width } = useWindowDimensions();
  const navigation = useNavigation<any>();
  const isDesktop = width >= 768;
  const { logout: authLogout } = useAuth();

  const styles = React.useMemo(() => createSubscriptionStyles(theme, isRTL), [theme, isRTL]);

  const { subscription, loading: subLoading, refetch, cancelSubscription } = useSubscription();
  const { plans, loading: plansLoading } = useSubscriptionPlans();
  const { loading: checkoutLoading, initiateCheckout, initiateRenewal, initiateWebPortal } = useCheckout();
  const { settings } = useSystemSettings();

  const handleContactSupport = () => {
    const email = 'info@alsaifanalysis.com';
    const subject = encodeURIComponent('Subscription Inquiry - ALSAIF ANALYSIS');
    const body = encodeURIComponent('Hello Support,\n\nI want to upgrade my ALSAIF ANALYSIS account to Premium. How can I subscribe?\n\nThank you.');
    Linking.openURL(`mailto:${email}?subject=${subject}&body=${body}`);
  };

  const [selectedBillingCycle, setSelectedBillingCycle] = useState<BillingCycle>('monthly');
  const [refreshing, setRefreshing] = useState(false);

  const handleTabChange = useCallback((tab: SettingsTab) => {
    switch (tab) {
      case 'profile':
        navigation.navigate('Main', { screen: 'MainTabs', params: { screen: 'ProfileTab' } });
        break;
      case 'preferences':
        navigation.navigate('Main', { screen: 'Settings' });
        break;
      case 'security':
        navigation.navigate('Main', { screen: 'Security' });
        break;
      case 'subscription':
        // Already on subscription
        break;
      case 'terms':
        navigation.navigate('Main', { screen: 'Terms' });
        break;
      case 'about':
        navigation.navigate('Main', { screen: 'About' });
        break;
    }
  }, [navigation]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleUpgrade = async (planId: string) => {
    const success = await initiateCheckout(planId, selectedBillingCycle);
    if (success) {
      // Poll for subscription update after a delay (user returns from payment)
      setTimeout(() => refetch(), 3000);
    }
  };

  const handleRenew = async (planId: string) => {
    const success = await initiateRenewal(planId, selectedBillingCycle);
    if (success) {
      setTimeout(() => refetch(), 3000);
    }
  };

  const renderCurrentPlan = () => {
    if (!subscription) return null;

    const tierColor = TIER_COLORS[subscription.tier] || TIER_COLORS.free;
    const tierIcon = TIER_ICONS[subscription.tier] || TIER_ICONS.free;

    const tierName = t(`tier.${subscription.tier}`);

    return (
      <View style={styles.currentPlanCard}>
        <View style={[styles.planBadge, { backgroundColor: tierColor }]}>
          <Text style={styles.planBadgeText}>{tierName}</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <View style={[styles.planIconContainer, { backgroundColor: `${tierColor}20` }]}>
            <Ionicons name={tierIcon as any} size={28} color={tierColor} />
          </View>
          <Text style={styles.planName}>
            {tierName}
          </Text>
        </View>

        <Text style={[styles.planStatus, styles[`status${subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}` as keyof typeof styles] || {}]}>
          {subscription.status === 'active' && `✓ ${t('status.active')} ${t('profile.subscription')}`}
          {subscription.status === 'expired' && `✕ ${t('status.expired')}`}
          {subscription.status === 'cancelled' && `✕ ${t('status.cancelled')}`}
        </Text>

        <View style={styles.planDetails}>
          {subscription.status === 'active' && subscription.endDate && (
            <>
              <View style={styles.planDetailRow}>
                <Text style={styles.planDetailLabel}>{t('profile.expiresOn')}</Text>
                <Text style={styles.planDetailValue}>
                  {formatDate(subscription.endDate)}
                </Text>
              </View>
              <View style={styles.planDetailRow}>
                <Text style={styles.planDetailLabel}>
                  {t('admin.daysRemaining', { count: subscription.daysRemaining })}
                </Text>
                <Text style={[styles.planDetailValue, { color: subscription.isExpiringSoon ? theme.warning.main : theme.text.primary }]}>
                  {subscription.daysRemaining}
                </Text>
              </View>
              <View style={styles.planDetailRow}>
                <Text style={styles.planDetailLabel}>{t('profile.autoRenewal')}</Text>
                <Text style={styles.planDetailValue}>
                  {subscription.autoRenew ? t('common.yes') : t('common.no')}
                </Text>
              </View>
            </>
          )}

          {subscription.source && (
            <View style={styles.planDetailRow}>
              <Text style={styles.planDetailLabel}>{t('admin.status')}</Text>
              <Text style={styles.planDetailValue}>
                {subscription.source.charAt(0).toUpperCase() + subscription.source.slice(1)}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderExpiryWarning = () => {
    if (!subscription || !subscription.isExpiringSoon) return null;

    return (
      <View style={styles.warningBanner}>
        <Ionicons name="warning" size={24} color="#ff9500" style={styles.warningIcon} />
        <Text style={styles.warningText}>
          {t('notifications.event.subscription:expiring-soon')}
        </Text>
      </View>
    );
  };

  const renderBillingCycleSelector = () => {
    const cycles: BillingCycle[] = ['monthly', 'quarterly', 'yearly'];

    return (
      <View style={styles.billingCycleContainer}>
        {cycles.map((cycle) => (
          <TouchableOpacity
            key={cycle}
            style={[
              styles.billingCycleButton,
              selectedBillingCycle === cycle && styles.billingCycleButtonActive,
            ]}
            onPress={() => setSelectedBillingCycle(cycle)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.billingCycleText,
                selectedBillingCycle === cycle && styles.billingCycleTextActive,
              ]}
            >
              {BILLING_CYCLE_LABELS[cycle]}
            </Text>
            {cycle !== 'monthly' && (
              <Text style={styles.billingSavings}>
                Save {cycle === 'quarterly' ? '10%' : '20%'}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderPlanCard = (plan: any) => {
    const tierColor = TIER_COLORS[plan.tier as keyof typeof TIER_COLORS] || TIER_COLORS.free;
    const tierIcon = TIER_ICONS[plan.tier as keyof typeof TIER_ICONS] || TIER_ICONS.free;

    const isCurrentPlan = subscription?.tier === plan.tier && subscription?.status === 'active';
    const canSelect = subscription?.canUpgrade || subscription?.canRenew;
    const isPaused = settings?.isSubscriptionsPaused === true;
    const isNewDisabled = settings?.isNewSubscriptionsEnabled === false;
    const isSelectionDisabled = isCurrentPlan || !canSelect || checkoutLoading || isPaused || isNewDisabled;

    return (
      <View
        key={plan._id}
        style={[
          styles.planCard,
          plan.isFeatured && styles.planCardFeatured,
        ]}
      >
        {plan.isFeatured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredBadgeText}>Most Popular</Text>
          </View>
        )}

        <View style={styles.planHeader}>
          <View style={[styles.planIconContainer, { backgroundColor: `${tierColor}20` }]}>
            <Ionicons name={tierIcon as any} size={24} color={tierColor} />
          </View>
          <Text style={styles.planTitle}>{plan.name}</Text>
        </View>

        <Text style={styles.planPrice}>
          {formatCurrency(plan.price, plan.currency)}
        </Text>
        <Text style={styles.planCycle}>
          per {plan.billingCycle === 'monthly' ? 'month' : plan.billingCycle === 'quarterly' ? 'quarter' : 'year'}
        </Text>

        {plan.description && (
          <Text style={styles.planDescription}>{plan.description}</Text>
        )}

        <View style={styles.featuresList}>
          {plan.features.slice(0, 6).map((feature: any, index: number) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons
                name={feature.included ? 'checkmark-circle' : 'close-circle'}
                size={20}
                color={feature.included ? '#34c759' : '#8e8e93'}
                style={styles.featureIcon}
              />
              <Text style={styles.featureText}>{feature.name}</Text>
            </View>
          ))}
          {plan.features.length > 6 && (
            <Text style={[styles.featureText, { color: '#007aff', marginTop: 8 }]}>
              +{plan.features.length - 6} more features
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.selectButton,
            isSelectionDisabled && styles.selectButtonDisabled,
          ]}
          onPress={() => {
            if (subscription?.canRenew) {
              handleRenew(plan._id);
            } else {
              handleUpgrade(plan._id);
            }
          }}
          disabled={isSelectionDisabled}
          activeOpacity={0.7}
        >
          <Text style={styles.selectButtonText}>
            {checkoutLoading ? 'Processing...' : isCurrentPlan ? 'Current Plan' : subscription?.canRenew ? 'Renew' : 'Select Plan'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderActionButtons = () => {
    if (!subscription || subscription.tier === 'free') return null;

    return (
      <>
        {subscription.status === 'active' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonDestructive]}
            onPress={async () => {
              await cancelSubscription();
            }}
            activeOpacity={0.7}
          >
            <View style={styles.actionButtonContent}>
              <View style={styles.actionButtonLeft}>
                <Ionicons
                  name="close-circle"
                  size={24}
                  color={theme.error.main}
                  style={styles.actionButtonIcon}
                />
                <Text style={[styles.actionButtonText, styles.actionButtonTextDestructive]}>
                  {t('settings.cancelSubscription') || 'Cancel Subscription'}
                </Text>
              </View>
              <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={20} color={theme.error.main} />
            </View>
          </TouchableOpacity>
        )}
      </>
    );
  };

  const renderSubscriptionContent = () => (
    <View style={isDesktop ? { width: '100%' } : null}>
      <View style={isDesktop ? { padding: 40, alignItems: 'center' } : null}>
        <ResponsiveContainer maxWidth={isDesktop ? 1000 : undefined}>
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
            {/* Header (Desktop) */}
            {isDesktop && (
              <View style={[styles.header, { marginBottom: 32 }]}>
                <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', marginBottom: 8 }}>
                  <TouchableOpacity 
                    onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('MainTabs' as never)}
                    style={styles.backButton}
                  >
                    <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color={theme.text.primary} />
                  </TouchableOpacity>
                  <Text style={[styles.headerTitle, { fontSize: 28 }]}>{t('profile.subscription')}</Text>
                </View>
                <Text style={styles.headerSubtitle}>
                  {t('profile.manageSubscription')}
                </Text>
              </View>
            )}

            {/* Current Plan */}
            {renderCurrentPlan()}

            {/* Expiry Warning */}
            {renderExpiryWarning()}

            {/* Action Buttons */}
            {renderActionButtons()}

            {/* Available Plans */}
            {(subscription?.canUpgrade || subscription?.canRenew) && (
              <>
                <Text style={[styles.sectionTitle, isDesktop && { marginTop: 40 }]}>
                  {subscription.canRenew ? t('plans.renewSubscription') || 'Renew Subscription' : t('plans.upgradeToPremium') || 'Upgrade to Premium'}
                </Text>

                {renderBillingCycleSelector()}

                {/* Maintenance Message */}
                {settings && (!settings.isNewSubscriptionsEnabled || settings.isSubscriptionsPaused) && (
                  <View style={styles.maintenanceBanner}>
                    <Ionicons name="alert-circle" size={20} color="#EF4444" />
                    <Text style={styles.maintenanceText}>
                      {settings.isSubscriptionsPaused
                        ? t('plans.pausedMessage')
                        : (settings.subscriptionDisabledMessage || t('plans.temporarilyDisabled'))}
                    </Text>
                  </View>
                )}

                {plansLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.primary.main} />
                  </View>
                ) : plans.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="card-outline" size={64} color={theme.border.main} style={styles.emptyStateIcon} />
                    <Text style={styles.emptyStateTitle}>No Plans Available</Text>
                    <Text style={styles.emptyStateText}>{MESSAGES.NO_PLANS_AVAILABLE}</Text>
                  </View>
                ) : (
                  <View style={isDesktop ? { flexDirection: 'row', flexWrap: 'wrap', gap: 20, justifyContent: 'center' } : null}>
                    {plans.map(renderPlanCard)}
                  </View>
                )}
              </>
            )}
          </View>
        </ResponsiveContainer>
      </View>
    </View>
  );

  if (subLoading && !subscription) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary.main} />
        <Text style={styles.loadingText}>Loading subscription...</Text>
      </View>
    );
  }

  if (isDesktop) {
    return (
      <SettingsLayout
        activeTab="subscription"
        onTabChange={handleTabChange}
        onLogout={authLogout}
      >
        {renderSubscriptionContent()}
      </SettingsLayout>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      <AuthRequiredGate
        title={t('profile.subscription') || 'Subscription Management'}
        message={t('profile.loginMessage') || 'Please log in to manage your subscription and view active plans.'}
        icon="card-outline"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', marginBottom: 8 }}>
            <TouchableOpacity 
              onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('MainTabs' as never)}
              style={styles.backButton}
            >
              <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color={theme.text.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('profile.subscription')}</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            {t('profile.manageSubscription')}
          </Text>
        </View>

        {renderSubscriptionContent()}
      </AuthRequiredGate>
    </ScrollView>
  );
};
