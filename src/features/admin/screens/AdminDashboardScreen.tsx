/**
 * Admin Dashboard Screen
 * Overview screen with stats and quick actions
 * Now with theme and language support
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Switch,
  Alert,
  StatusBar,
  useWindowDimensions,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { createAdminStyles } from '../admin.styles';
import { useAdminDashboard } from '../hooks';
import { useSystemSettings } from '../../subscription/subscription.hooks';
import { DASHBOARD_SECTIONS, DASHBOARD_SECTION_TRANSLATIONS, CHART_COLORS } from '../admin.constants';
import { useTheme, useLocalization } from '../../../app/providers';
import { useUser, UserRole } from '../../../app/auth';
import { LinearGradient } from 'expo-linear-gradient';
import { ResponsiveContainer } from '../../../shared/components';
import { AdminSidebar } from '../components/AdminSidebar';
import { ActionSheet } from '../components';
import { loadAuthSession } from '../../../app/auth/auth.storage';
import { getApiBaseUrl } from '../../../core/config/env';

export const AdminDashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const { stats, isLoading, error, refresh } = useAdminDashboard();
  const { theme, isDark } = useTheme();
  const { t, isRTL } = useLocalization();
  const { settings, toggleSubscriptionPause, toggleNewSubscriptions } = useSystemSettings();
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;
  const user = useUser();
  const isSuper = user?.role === UserRole.SUPERADMIN;
  const isModerator = user?.role === UserRole.MODERATOR;

  const [showExportSheet, setShowExportSheet] = useState(false);

  const triggerExport = async (format: 'xlsx' | 'pdf') => {
    try {
      const baseUrl = getApiBaseUrl();
      const session = await loadAuthSession();
      if (!session) throw new Error('No session available');

      const url = `${baseUrl}/api/export/all?format=${format}&token=${session.tokens.accessToken}`;

      if (Platform.OS === 'web') {
        window.open(url, '_blank');
      } else {
        await Linking.openURL(url);
      }
    } catch (error: any) {
      if (Platform.OS === 'web') {
        alert(error.message || 'Failed to export report');
      } else {
        Alert.alert(t('common.error') || 'Error', error.message || 'Failed to export report');
      }
    }
  };

  const allowedSections = useMemo(() => {
    if (isModerator) {
      return DASHBOARD_SECTIONS.filter(section => section.id === 'moderation' || section.id === 'banners');
    }
    return DASHBOARD_SECTIONS.filter(section => !(section as any).superadminOnly || isSuper);
  }, [isModerator, isSuper]);

  const styles = useMemo(() => createAdminStyles(theme, isRTL), [theme, isRTL]);


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
    subtitle?: string,
    isDesktop?: boolean
  ) => (
    <LinearGradient
      colors={isDark ? ['#252525', '#1A1A1A'] : ['#FFFFFF', theme.background.secondary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.dashboardStatCard,
        { borderColor: isDark ? '#2A2A2A' : theme.ui.border },
        isDesktop && styles.desktopStatCard
      ]}
    >
      <View style={{ padding: 16, flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <View style={[styles.dashboardStatLeft, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
          <Text style={styles.dashboardStatValue}>{value}</Text>
          <Text style={styles.dashboardStatLabel}>{title}</Text>
          {subtitle && (
            <Text style={styles.dashboardStatSubtext}>{subtitle}</Text>
          )}
        </View>
        <View style={[styles.dashboardStatIcon, { backgroundColor: color + '15', borderColor: color + '30', borderWidth: 1 }]}>
          <Ionicons name={icon as any} size={24} color={color} />
        </View>
      </View>
      <View style={{ height: 2, width: '100%', backgroundColor: color + '40', position: 'absolute', bottom: 0 }} />
    </LinearGradient>
  );

  const renderQuickAction = (
    label: string,
    icon: string,
    color: string,
    onPress: () => void,
    isDesktop?: boolean
  ) => (
    <TouchableOpacity
      style={[styles.quickActionItem, isDesktop && styles.desktopQuickAction]}
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
        <View style={[styles.cardHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={{ flex: 1, alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', marginBottom: 8 }}>
              <View
                style={[
                  styles.dashboardStatIcon,
                  { backgroundColor: section.color + '20', [isRTL ? 'marginLeft' : 'marginRight']: 12 },
                ]}
              >
                <Ionicons name={section.icon as any} size={20} color={section.color} />
              </View>
              <Text style={styles.cardTitle}>{t(translations.titleKey)}</Text>
            </View>
            <Text style={[styles.cardSubtitle, { textAlign: isRTL ? 'right' : 'left' }]}>{t(translations.descriptionKey)}</Text>
          </View>
          <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={20} color={theme.text.tertiary} />
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

  const renderDashboardContent = () => (
    <ScrollView
      style={styles.content}
      contentContainerStyle={[styles.scrollContent, isDesktop && { padding: 32 }]}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={refresh}
          tintColor={theme.primary.main}
        />
      }
    >
      {/* Overview Stats */}
      {!isModerator && (
        <View style={[styles.dashboardGrid, isDesktop && { gap: 24 }]}>
          {renderStatCard(
            t('admin.totalUsers'),
            formatNumber(stats?.users?.total || 0),
            'people',
            CHART_COLORS.PRIMARY,
            `${stats?.users?.active || 0} ${t('admin.active')}`,
            isDesktop
          )}
          {renderStatCard(
            t('admin.premiumSubscribers'),
            formatNumber(stats?.users?.premium || 0),
            'star',
            CHART_COLORS.INFO,
            `${stats?.subscriptions?.active || 0} ${t('admin.activeSubs')}`,
            isDesktop
          )}
          {renderStatCard(
            t('admin.totalInsights'),
            formatNumber(stats?.insights?.total || 0),
            'document-text',
            CHART_COLORS.SUCCESS,
            `${stats?.insights?.published || 0} ${t('admin.published')}`,
            isDesktop
          )}
          {renderStatCard(
            t('admin.subscriptionRevenue'),
            formatCurrency(stats?.subscriptions?.revenue || 0),
            'cash',
            CHART_COLORS.WARNING,
            `${stats?.subscriptions?.total || 0} ${t('admin.subscriptions')}`,
            isDesktop
          )}
        </View>
      )}

      {/* System Settings Controls */}
      {!isModerator && isSuper && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('admin.systemSettings')}</Text>
          </View>
          <View style={[styles.card, { backgroundColor: theme.background.secondary, borderColor: theme.ui.border, maxWidth: isDesktop ? 800 : undefined }]}>
            <View style={[styles.settingRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <View style={[styles.settingLeft, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Ionicons
                  name={settings?.isSubscriptionsPaused ? "pause-circle" : "play-circle"}
                  size={24}
                  color={settings?.isSubscriptionsPaused ? theme.warning.main : theme.success.main}
                />
                <View style={{ [isRTL ? 'marginRight' : 'marginLeft']: 12, alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                  <Text style={[styles.cardTitle, { marginBottom: 2 }]}>{t('admin.pauseSubscriptions')}</Text>
                  <Text style={[styles.cardSubtitle, { textAlign: isRTL ? 'right' : 'left' }]}>
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

            <View style={[styles.settingRow, { marginTop: 16, borderTopWidth: 1, borderTopColor: theme.border.main, paddingTop: 16, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <View style={[styles.settingLeft, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Ionicons
                  name={settings?.isNewSubscriptionsEnabled ? "add-circle" : "remove-circle"}
                  size={24}
                  color={settings?.isNewSubscriptionsEnabled ? theme.success.main : theme.error.main}
                />
                <View style={{ [isRTL ? 'marginRight' : 'marginLeft']: 12, alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                  <Text style={[styles.cardTitle, { marginBottom: 2 }]}>{t('admin.enableNewSubscriptions')}</Text>
                  <Text style={[styles.cardSubtitle, { textAlign: isRTL ? 'right' : 'left' }]}>
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
      {!isModerator && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('admin.quickActions')}</Text>
          </View>
          <View style={styles.quickActionsGrid}>
            {renderQuickAction(
              t('admin.createInsight'),
              'add-circle',
              CHART_COLORS.SUCCESS,
              () => navigation.navigate('AdminInsights' as never),
              isDesktop
            )}
            {renderQuickAction(
              t('admin.manageUsers'),
              'people',
              CHART_COLORS.PRIMARY,
              () => navigation.navigate('AdminUsers' as never),
              isDesktop
            )}
            {renderQuickAction(
              t('admin.sendBroadcast'),
              'megaphone',
              CHART_COLORS.WARNING,
              () => navigation.navigate('AdminBroadcast' as never),
              isDesktop
            )}
            {renderQuickAction(
              t('admin.viewAnalytics'),
              'bar-chart',
              CHART_COLORS.INFO,
              () => navigation.navigate('AdminAnalytics' as never),
              isDesktop
            )}
          </View>
        </>
      )}

      {/* Sections */}
      {(!isDesktop || isModerator) && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {isModerator ? (t('admin.moderatorSections') || 'Moderator Sections') : t('admin.allSections')}
            </Text>
          </View>
          {allowedSections.map(renderSectionCard)}
        </>
      )}
    </ScrollView>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {isDesktop ? (
        <View style={styles.desktopContentWrapper}>
          <AdminSidebar />
          <View style={styles.desktopMainContent}>
            <View style={[styles.header, { backgroundColor: theme.background.secondary, borderBottomColor: theme.ui.border, height: 80, paddingTop: 0, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Text style={[styles.headerTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{t('admin.dashboardOverview')}</Text>
              <View style={[styles.headerRight, { flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 12 }]}>
                {!isModerator && (
                  <>
                    <TouchableOpacity
                      style={{
                        padding: 8,
                        borderRadius: 12,
                        backgroundColor: theme.primary.main + '10',
                        [isRTL ? 'marginLeft' : 'marginRight']: 8
                      }}
                      onPress={() => setShowExportSheet(true)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="download-outline" size={22} color={theme.primary.main} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.addButton} activeOpacity={0.8} onPress={() => navigation.navigate('AdminInsights' as never)}>
                      <Ionicons name="add" size={26} color="#FFFFFF" />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
            {renderDashboardContent()}
          </View>
        </View>
      ) : (
        <>
          <View style={[styles.header, { backgroundColor: theme.background.secondary, borderBottomColor: theme.ui.border, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.headerLeft, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Text style={[styles.headerTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{t('admin.dashboard')}</Text>
            </View>
            <View style={[styles.headerRight, { flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center' }]}>
              {!isModerator && (
                <TouchableOpacity
                  style={{
                    padding: 8,
                    borderRadius: 12,
                    backgroundColor: theme.primary.main + '10',
                    [isRTL ? 'marginLeft' : 'marginRight']: 8
                  }}
                  onPress={() => setShowExportSheet(true)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="download-outline" size={22} color={theme.primary.main} />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.filterButton}
                onPress={refresh}
                activeOpacity={0.7}
              >
                <Ionicons name="refresh" size={24} color={theme.primary.main} />
              </TouchableOpacity>
            </View>
          </View>

          <ResponsiveContainer style={{ flex: 1 }}>
            {renderDashboardContent()}
          </ResponsiveContainer>
        </>
      )}

      {/* Export Options Action Sheet */}
      <ActionSheet
        visible={showExportSheet}
        onClose={() => setShowExportSheet(false)}
        title={t('admin.exportData') || 'Export Data'}
        options={[
          {
            label: t('admin.exportAsExcel') || 'Export as Excel (XLSX)',
            icon: 'document-text-outline',
            onPress: () => {
              setShowExportSheet(false);
              triggerExport('xlsx');
            },
          },
          {
            label: t('admin.exportAsPDF') || 'Export as PDF',
            icon: 'document-outline',
            onPress: () => {
              setShowExportSheet(false);
              triggerExport('pdf');
            },
          },
        ]}
      />
    </View>
  );
};
