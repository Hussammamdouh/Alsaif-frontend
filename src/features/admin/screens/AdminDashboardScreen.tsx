/**
 * Admin Dashboard Screen
 * Overview screen with stats and quick actions
 * Now with theme and language support
 */

import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { createAdminStyles } from '../admin.styles';
import { useAdminDashboard } from '../hooks';
import { useSystemSettings } from '../../subscription/subscription.hooks';
import { DASHBOARD_SECTIONS, DASHBOARD_SECTION_TRANSLATIONS, CHART_COLORS } from '../admin.constants';
import { useTheme, useLocalization } from '../../../app/providers';

export const AdminDashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const { stats, isLoading, error, refresh } = useAdminDashboard();
  const { theme } = useTheme();
  const { t } = useLocalization();
  const { settings, toggleSubscriptionPause, toggleNewSubscriptions } = useSystemSettings();

  const styles = useMemo(() => createAdminStyles(theme), [theme]);

  useEffect(() => {
    refresh();
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (amount: number): string => {
    return `$${formatNumber(amount)}`;
  };

  const renderStatCard = (
    title: string,
    value: number | string,
    icon: string,
    color: string,
    subtitle?: string
  ) => (
    <View style={styles.dashboardStatCard}>
      <View style={styles.dashboardStatLeft}>
        <Text style={styles.dashboardStatValue}>{value}</Text>
        <Text style={styles.dashboardStatLabel}>{title}</Text>
        {subtitle && (
          <Text style={styles.dashboardStatSubtext}>{subtitle}</Text>
        )}
      </View>
      <View style={[styles.dashboardStatIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
    </View>
  );

  const renderQuickAction = (
    label: string,
    icon: string,
    color: string,
    onPress: () => void
  ) => (
    <TouchableOpacity
      style={styles.quickActionItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon as any} size={28} color={color} />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  );

  const renderSectionCard = (section: typeof DASHBOARD_SECTIONS[number]) => {
    const translations = DASHBOARD_SECTION_TRANSLATIONS[section.id as keyof typeof DASHBOARD_SECTION_TRANSLATIONS];

    return (
      <TouchableOpacity
        key={section.id}
        style={styles.card}
        onPress={() => navigation.navigate(section.route as never)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <View
                style={[
                  styles.dashboardStatIcon,
                  { backgroundColor: section.color + '20', marginRight: 12 },
                ]}
              >
                <Ionicons name={section.icon as any} size={20} color={section.color} />
              </View>
              <Text style={styles.cardTitle}>{t(translations.titleKey)}</Text>
            </View>
            <Text style={styles.cardSubtitle}>{t(translations.descriptionKey)}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.text.tertiary} />
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading && !stats) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary.main} />
            <Text style={styles.loadingText}>{t('common.loading')}</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !stats) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={64} color={theme.error.main} />
            <Text style={styles.errorTitle}>{t('common.error')}</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary]}
              onPress={refresh}
            >
              <Text style={[styles.buttonText, styles.buttonTextPrimary]}>
                {t('common.retry')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>{t('admin.dashboard')}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={refresh}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh" size={24} color={theme.primary.main} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refresh}
              tintColor={theme.primary.main}
            />
          }
        >
          {/* Overview Stats */}
          <View style={styles.dashboardGrid}>
            {renderStatCard(
              t('admin.totalUsers'),
              formatNumber(stats?.users?.total || 0),
              'people',
              CHART_COLORS.PRIMARY,
              `${stats?.users?.active || 0} ${t('admin.active')}`
            )}
            {renderStatCard(
              t('admin.premiumSubscribers'),
              formatNumber(stats?.users?.premium || 0),
              'star',
              CHART_COLORS.INFO,
              `${stats?.subscriptions?.active || 0} ${t('admin.activeSubs')}`
            )}
            {renderStatCard(
              t('admin.totalInsights'),
              formatNumber(stats?.insights?.total || 0),
              'document-text',
              CHART_COLORS.SUCCESS,
              `${stats?.insights?.published || 0} ${t('admin.published')}`
            )}
            {renderStatCard(
              t('admin.subscriptionRevenue'),
              formatCurrency(stats?.subscriptions?.revenue || 0),
              'cash',
              CHART_COLORS.WARNING,
              `${stats?.subscriptions?.total || 0} ${t('admin.subscriptions')}`
            )}
          </View>

          {/* System Settings Controls */}
          {(stats as any)?.role === 'superadmin' && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{t('admin.systemSettings')}</Text>
              </View>
              <View style={styles.card}>
                <View style={styles.settingRow}>
                  <View style={styles.settingLeft}>
                    <Ionicons
                      name={settings?.isSubscriptionsPaused ? "pause-circle" : "play-circle"}
                      size={24}
                      color={settings?.isSubscriptionsPaused ? theme.warning.main : theme.success.main}
                    />
                    <View style={{ marginLeft: 12 }}>
                      <Text style={[styles.cardTitle, { marginBottom: 2 }]}>{t('admin.pauseSubscriptions')}</Text>
                      <Text style={styles.cardSubtitle}>
                        {settings?.isSubscriptionsPaused ? t('admin.subscriptionsPausedDesc') : t('admin.subscriptionsActiveDesc')}
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={settings?.isSubscriptionsPaused || false}
                    onValueChange={() => { toggleSubscriptionPause(); }}
                    trackColor={{ false: theme.border.main, true: theme.warning.main }}
                  />
                </View>

                <View style={[styles.settingRow, { marginTop: 16, borderTopWidth: 1, borderTopColor: theme.border.main, paddingTop: 16 }]}>
                  <View style={styles.settingLeft}>
                    <Ionicons
                      name={settings?.isNewSubscriptionsEnabled ? "add-circle" : "remove-circle"}
                      size={24}
                      color={settings?.isNewSubscriptionsEnabled ? theme.success.main : theme.error.main}
                    />
                    <View style={{ marginLeft: 12 }}>
                      <Text style={[styles.cardTitle, { marginBottom: 2 }]}>{t('admin.enableNewSubscriptions')}</Text>
                      <Text style={styles.cardSubtitle}>
                        {settings?.isNewSubscriptionsEnabled ? t('admin.newSubsEnabledDesc') : t('admin.newSubsDisabledDesc')}
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={settings?.isNewSubscriptionsEnabled || false}
                    onValueChange={() => { toggleNewSubscriptions(); }}
                    trackColor={{ false: theme.border.main, true: theme.primary.main }}
                  />
                </View>
              </View>
            </>
          )}

          {/* Quick Actions */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('admin.quickActions')}</Text>
          </View>
          <View style={styles.quickActionsGrid}>
            {renderQuickAction(
              t('admin.createInsight'),
              'add-circle',
              CHART_COLORS.SUCCESS,
              () => navigation.navigate('AdminInsights' as never)
            )}
            {renderQuickAction(
              t('admin.manageUsers'),
              'people',
              CHART_COLORS.PRIMARY,
              () => navigation.navigate('AdminUsers' as never)
            )}
            {renderQuickAction(
              t('admin.sendBroadcast'),
              'megaphone',
              CHART_COLORS.WARNING,
              () => navigation.navigate('AdminBroadcast' as never)
            )}
            {renderQuickAction(
              t('admin.viewAnalytics'),
              'bar-chart',
              CHART_COLORS.INFO,
              () => navigation.navigate('AdminAnalytics' as never)
            )}
          </View>

          {/* All Sections */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('admin.allSections')}</Text>
          </View>
          {DASHBOARD_SECTIONS.map(renderSectionCard)}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};
