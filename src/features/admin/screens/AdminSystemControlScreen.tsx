/**
 * Admin System Control Screen
 * Superadmin-only panel to monitor system metrics, optimize database, manage queue, and toggle settings overrides
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Switch,
  TextInput,
  StyleSheet,
  useWindowDimensions,
  StatusBar,
  I18nManager,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { getApiBaseUrl } from '../../../core/config/env';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme, useLocalization } from '../../../app/providers';
import { createAdminStyles } from '../admin.styles';
import { useAdminSystemControl } from '../hooks';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { ResponsiveContainer } from '../../../shared/components';
import { AdminSidebar } from '../components/AdminSidebar';

type TabType = 'system' | 'database' | 'queue' | 'settings';

export const AdminSystemControlScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();
  const { t, isRTL } = useLocalization();
  const isManualRTL = isRTL !== I18nManager.isRTL;
  const styles = useMemo(() => createAdminStyles(theme, isRTL), [theme, isRTL]);
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  const {
    systemStats,
    dbAnalysis,
    settings,
    isLoading,
    error,
    refresh,
    isMaintenanceLoading,
    isJobsLoading,
    isMetricsLoading,
    runDatabaseMaintenance,
    clearFailedJobs,
    retryFailedJobs,
    resetPerformanceMetrics,
    toggleSubscriptionPause,
    toggleNewSubscriptions,
    supportEmails,
    isLicenseUploading,
    isEmailsLoading,
    uploadLicensePdf,
    deleteLicensePdf,
    addSupportEmail,
    deleteSupportEmail,
  } = useAdminSystemControl();

  const [activeTab, setActiveTab] = useState<TabType>('system');

  // Input for custom lockout message
  const [lockoutMsg, setLockoutMsg] = useState('');

  // Support email input state
  const [newEmail, setNewEmail] = useState('');

  const handleAddEmail = async () => {
    if (!newEmail.trim()) return;
    const success = await addSupportEmail(newEmail.trim());
    if (success) {
      setNewEmail('');
    }
  };

  const handleDeleteSupportEmailConfirm = (email: string) => {
    setEmailToRemove(email);
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) return;
      
      const asset = result.assets[0];
      const formData = new FormData();
      
      if (Platform.OS === 'web') {
        if (asset.file) {
          formData.append('pdf', asset.file);
        } else {
          const response = await fetch(asset.uri);
          const blob = await response.blob();
          formData.append('pdf', blob, asset.name || 'license.pdf');
        }
      } else {
        formData.append('pdf', {
          uri: asset.uri,
          name: asset.name || 'license.pdf',
          type: 'application/pdf',
        } as any);
      }

      setPendingUploadData(formData);
      setPendingUploadName(asset.name || 'license.pdf');
    } catch (err: any) {
      if (Platform.OS === 'web') {
        window.alert(err.message || 'Failed to select PDF document');
      } else {
        Alert.alert('Error', err.message || 'Failed to select PDF document');
      }
    }
  };

  const handleRemoveLicense = () => {
    setIsRemoveCertModalVisible(true);
  };

  // Confirmation Modals visibility states
  const [isMaintenanceModalVisible, setIsMaintenanceModalVisible] = useState(false);
  const [isResetMetricsModalVisible, setIsResetMetricsModalVisible] = useState(false);
  const [isRetryJobsModalVisible, setIsRetryJobsModalVisible] = useState(false);
  const [isClearJobsModalVisible, setIsClearJobsModalVisible] = useState(false);
  const [isPauseSubsModalVisible, setIsPauseSubsModalVisible] = useState(false);
  const [isToggleNewSubsModalVisible, setIsToggleNewSubsModalVisible] = useState(false);

  // New Confirmation states for settings actions
  const [emailToRemove, setEmailToRemove] = useState<string | null>(null);
  const [isRemoveCertModalVisible, setIsRemoveCertModalVisible] = useState(false);
  const [pendingUploadData, setPendingUploadData] = useState<FormData | null>(null);
  const [pendingUploadName, setPendingUploadName] = useState<string | null>(null);

  // Sync lockout message from settings once loaded
  useEffect(() => {
    if (settings?.subscriptionDisabledMessage) {
      setLockoutMsg(settings.subscriptionDisabledMessage);
    }
  }, [settings]);

  // Utility to format bytes into readable sizes
  const formatBytes = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Utility to format seconds into readable uptime duration
  const formatUptime = (seconds: number): string => {
    if (!seconds) return '0s';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts = [];
    if (hrs > 0) parts.push(`${hrs}h`);
    if (mins > 0) parts.push(`${mins}m`);
    parts.push(`${secs}s`);
    return parts.join(' ');
  };

  // Helper to align text based on localization
  const getTextAlignStyle = () => {
    return isRTL ? { textAlign: 'right' as const } : { textAlign: 'left' as const };
  };

  // Safe wrapper for values
  const getSafe = (value: any, fallback = 'N/A') => {
    return value !== undefined && value !== null ? value : fallback;
  };

  if (isLoading && !systemStats) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary.main} />
          <Text style={[styles.loadingText, { color: theme.text.secondary }]}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Define tab headers
  const tabs: { type: TabType; icon: string; label: string; shortLabel: string }[] = [
    { type: 'system', icon: 'pulse-outline', label: t('admin.systemStats'), shortLabel: t('admin.systemShort') },
    { type: 'database', icon: 'server-outline', label: t('admin.databaseStats'), shortLabel: t('admin.databaseShort') },
    { type: 'queue', icon: 'layers-outline', label: t('admin.jobQueue'), shortLabel: t('admin.queueShort') },
    { type: 'settings', icon: 'options-outline', label: t('admin.settingsOverrides'), shortLabel: t('admin.settingsShort') },
  ];

  const renderTabHeaders = () => (
    <View style={[localStyles.tabBar, { backgroundColor: theme.background.secondary, borderColor: theme.ui.border, flexDirection: isManualRTL ? 'row-reverse' : 'row' }]}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.type;
        return (
          <TouchableOpacity
            key={tab.type}
            style={[
              localStyles.tabButton,
              isActive && { borderBottomColor: theme.primary.main, backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }
            ]}
            onPress={() => setActiveTab(tab.type)}
          >
            <Ionicons name={tab.icon as any} size={20} color={isActive ? theme.primary.main : theme.text.tertiary} />
            {!isDesktop && (
              <Text style={[localStyles.tabLabelMobile, { color: isActive ? theme.primary.main : theme.text.secondary, fontWeight: isActive ? '700' : '400' }]}>
                {tab.shortLabel}
              </Text>
            )}
            {isDesktop && (
              <Text style={[localStyles.tabLabel, { color: isActive ? theme.primary.main : theme.text.secondary, fontWeight: isActive ? '700' : '400' }]}>
                {tab.label}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderSystemStatsTab = () => {
    const server = systemStats?.server || {};
    const users = systemStats?.users || {};
    const content = systemStats?.content || {};
    
    return (
      <View style={{ gap: 20 }}>
        {/* System Overview Grid */}
        <View style={[styles.dashboardGrid, { gap: 16 }]}>
          <View style={[styles.card, localStyles.metricCard, { borderColor: theme.ui.border }]}>
            <Ionicons name="people-outline" size={28} color={theme.primary.main} />
            <Text style={[styles.cardSubtitle, { marginTop: 8 }]}>{t('admin.totalUsers')}</Text>
            <Text style={[styles.cardTitle, { fontSize: 24, marginTop: 4 }]}>{getSafe(users.total)}</Text>
            <Text style={[styles.cardSubtitle, { fontSize: 12, color: theme.success.main }]}>
              {getSafe(users.active)} {t('admin.active')}
            </Text>
          </View>

          <View style={[styles.card, localStyles.metricCard, { borderColor: theme.ui.border }]}>
            <Ionicons name="document-text-outline" size={28} color={theme.success.main} />
            <Text style={[styles.cardSubtitle, { marginTop: 8 }]}>{t('admin.totalInsights')}</Text>
            <Text style={[styles.cardTitle, { fontSize: 24, marginTop: 4 }]}>{getSafe(content.totalInsights)}</Text>
          </View>

          <View style={[styles.card, localStyles.metricCard, { borderColor: theme.ui.border }]}>
            <Ionicons name="hourglass-outline" size={28} color={theme.warning.main} />
            <Text style={[styles.cardSubtitle, { marginTop: 8 }]}>{t('admin.uptime')}</Text>
            <Text style={[styles.cardTitle, { fontSize: 18, marginTop: 4 }]} numberOfLines={1}>
              {formatUptime(server.uptime)}
            </Text>
          </View>
        </View>

        {/* Server Hardware details */}
        <View style={[styles.card, { borderColor: theme.ui.border }]}>
          <View style={styles.cardInner}>
            <Text style={[styles.cardTitle, getTextAlignStyle(), { marginBottom: 16 }]}>{t('admin.systemStats')}</Text>
            
            <View style={localStyles.infoRowGroup}>
              <View style={[localStyles.infoRow, { flexDirection: isManualRTL ? 'row-reverse' : 'row' }]}>
                <Text style={[localStyles.infoLabel, { color: theme.text.tertiary }]}>{t('admin.platform')}</Text>
                <Text style={[localStyles.infoValue, { color: theme.text.primary }]}>{getSafe(server.platform)}</Text>
              </View>
              <View style={[localStyles.infoRow, { flexDirection: isManualRTL ? 'row-reverse' : 'row' }]}>
                <Text style={[localStyles.infoLabel, { color: theme.text.tertiary }]}>{t('admin.nodeVersion')}</Text>
                <Text style={[localStyles.infoValue, { color: theme.text.primary }]}>{getSafe(server.nodeVersion)}</Text>
              </View>
              {server.memory && (
                <View style={[localStyles.infoRow, { flexDirection: isManualRTL ? 'row-reverse' : 'row' }]}>
                  <Text style={[localStyles.infoLabel, { color: theme.text.tertiary }]}>{t('admin.memoryUsage')}</Text>
                  <Text style={[localStyles.infoValue, { color: theme.text.primary }]}>
                    {formatBytes(server.memory.rss)} (RSS)
                  </Text>
                </View>
              )}
              {server.cpu && (
                <View style={[localStyles.infoRow, { flexDirection: isManualRTL ? 'row-reverse' : 'row' }]}>
                  <Text style={[localStyles.infoLabel, { color: theme.text.tertiary }]}>{t('admin.cpuUsage')}</Text>
                  <Text style={[localStyles.infoValue, { color: theme.text.primary }]}>
                    {((server.cpu.user + server.cpu.system) / 1000000).toFixed(2)}s cpu-time
                  </Text>
                </View>
              )}
            </View>

            {/* Metrics Reset Trigger */}
            <TouchableOpacity
              style={[styles.button, { alignSelf: isRTL ? 'flex-end' : 'flex-start', marginTop: 16, backgroundColor: theme.error.main + '20', borderColor: theme.error.main, borderWidth: 1 }]}
              onPress={() => setIsResetMetricsModalVisible(true)}
              disabled={isMetricsLoading}
            >
              {isMetricsLoading ? (
                <ActivityIndicator color={theme.error.main} size="small" />
              ) : (
                <Text style={[styles.buttonText, { color: theme.error.main }]}>{t('admin.resetMetrics')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderDatabaseTab = () => {
    const database = systemStats?.database || {};
    
    return (
      <View style={{ gap: 20 }}>
        {/* DB Metrics Cards */}
        <View style={[styles.dashboardGrid, { gap: 16 }]}>
          <View style={[styles.card, localStyles.metricCard, { borderColor: theme.ui.border }]}>
            <Ionicons name="folder-open-outline" size={28} color={theme.primary.main} />
            <Text style={[styles.cardSubtitle, { marginTop: 8 }]}>{t('admin.totalCollections')}</Text>
            <Text style={[styles.cardTitle, { fontSize: 24, marginTop: 4 }]}>{getSafe(database.collections)}</Text>
          </View>
          <View style={[styles.card, localStyles.metricCard, { borderColor: theme.ui.border }]}>
            <Ionicons name="server-outline" size={28} color={theme.success.main} />
            <Text style={[styles.cardSubtitle, { marginTop: 8 }]}>{t('admin.totalSize')}</Text>
            <Text style={[styles.cardTitle, { fontSize: 20, marginTop: 4 }]} numberOfLines={1}>
              {formatBytes(database.dataSize)}
            </Text>
          </View>
          <View style={[styles.card, localStyles.metricCard, { borderColor: theme.ui.border }]}>
            <Ionicons name="bookmarks-outline" size={28} color={theme.warning.main} />
            <Text style={[styles.cardSubtitle, { marginTop: 8 }]}>{t('admin.indexCount')}</Text>
            <Text style={[styles.cardTitle, { fontSize: 24, marginTop: 4 }]}>{getSafe(database.indexes)}</Text>
          </View>
        </View>

        {/* Database Maintenance Card */}
        <View style={[styles.card, { borderColor: theme.ui.border }]}>
          <View style={styles.cardInner}>
            <View style={{ flexDirection: isManualRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={[styles.cardTitle, getTextAlignStyle()]}>{t('admin.runMaintenance')}</Text>
              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary, { minWidth: 140 }]}
                onPress={() => setIsMaintenanceModalVisible(true)}
                disabled={isMaintenanceLoading}
              >
                {isMaintenanceLoading ? (
                  <ActivityIndicator color={theme.primary.contrast} size="small" />
                ) : (
                  <Text style={[styles.buttonText, styles.buttonTextPrimary]}>{t('admin.runMaintenance')}</Text>
                )}
              </TouchableOpacity>
            </View>
            <Text style={[styles.cardSubtitle, getTextAlignStyle(), { lineHeight: 20 }]}>
              {t('admin.maintenanceConfirmMessage')}
            </Text>
          </View>
        </View>

        {/* Collections Breakdown list */}
        <View style={[styles.card, { borderColor: theme.ui.border }]}>
          <View style={styles.cardInner}>
            <Text style={[styles.cardTitle, getTextAlignStyle(), { marginBottom: 16 }]}>{t('admin.totalCollections')}</Text>
            
            <ScrollView horizontal style={{ width: '100%' }}>
              <View style={{ minWidth: 600 }}>
                {/* Header */}
                <View style={[localStyles.tableHeaderRow, { borderBottomColor: theme.ui.border, flexDirection: isManualRTL ? 'row-reverse' : 'row' }]}>
                  <Text style={[localStyles.tableHeaderCell, { width: 150, color: theme.text.tertiary }, getTextAlignStyle()]}>{t('admin.collectionName')}</Text>
                  <Text style={[localStyles.tableHeaderCell, { width: 100, color: theme.text.tertiary, textAlign: 'center' }]}>{t('admin.documentCount')}</Text>
                  <Text style={[localStyles.tableHeaderCell, { width: 100, color: theme.text.tertiary, textAlign: 'center' }]}>{t('admin.totalSize')}</Text>
                  <Text style={[localStyles.tableHeaderCell, { width: 80, color: theme.text.tertiary, textAlign: 'center' }]}>{t('admin.indexCount')}</Text>
                  <Text style={[localStyles.tableHeaderCell, { width: 80, color: theme.text.tertiary, textAlign: 'center' }]}>{t('admin.fragmentation')}</Text>
                </View>

                {/* Rows */}
                {dbAnalysis?.map((col: any) => {
                  const fragPercent = parseFloat(col.fragmentation);
                  const isHighFrag = fragPercent > 30;
                  
                  return (
                    <View key={col.name} style={[localStyles.tableRow, { borderBottomColor: theme.ui.border, flexDirection: isManualRTL ? 'row-reverse' : 'row' }]}>
                      <Text style={[localStyles.tableCell, { width: 150, fontWeight: '700', color: theme.text.primary }, getTextAlignStyle()]} numberOfLines={1}>
                        {col.name}
                      </Text>
                      <Text style={[localStyles.tableCell, { width: 100, color: theme.text.secondary, textAlign: 'center' }]}>
                        {col.documents}
                      </Text>
                      <Text style={[localStyles.tableCell, { width: 100, color: theme.text.secondary, textAlign: 'center' }]}>
                        {formatBytes(col.dataSize)}
                      </Text>
                      <Text style={[localStyles.tableCell, { width: 80, color: theme.text.secondary, textAlign: 'center' }]}>
                        {col.indexes}
                      </Text>
                      <Text style={[
                        localStyles.tableCell, 
                        { width: 80, textAlign: 'center', fontWeight: 'bold' },
                        { color: isHighFrag ? theme.error.main : theme.success.main }
                      ]}>
                        {col.fragmentation}%
                      </Text>
                    </View>
                  );
                })}
              </View>
            </ScrollView>

            {/* Suggestions checklist */}
            <View style={{ marginTop: 24 }}>
              <Text style={[styles.cardTitle, getTextAlignStyle(), { fontSize: 16, marginBottom: 12 }]}>{t('admin.suggestions')}</Text>
              {dbAnalysis?.flatMap((c: any) => c.suggestions || []).length === 0 ? (
                <View style={[localStyles.suggestionItem, { backgroundColor: theme.success.main + '10', borderColor: theme.success.main + '20', flexDirection: isManualRTL ? 'row-reverse' : 'row' }]}>
                  <Ionicons name="checkmark-circle-outline" size={20} color={theme.success.main} style={{ marginEnd: 8 }} />
                  <Text style={{ color: theme.success.main, fontWeight: '600' }}>All collections are optimized. No actions needed.</Text>
                </View>
              ) : (
                dbAnalysis?.map((col: any) => {
                  if (!col.suggestions || col.suggestions.length === 0) return null;
                  return col.suggestions.map((sug: string, idx: number) => (
                    <View key={`${col.name}-${idx}`} style={[localStyles.suggestionItem, { backgroundColor: theme.warning.main + '10', borderColor: theme.warning.main + '20', flexDirection: isManualRTL ? 'row-reverse' : 'row' }]}>
                      <Ionicons name="warning-outline" size={20} color={theme.warning.main} style={{ marginEnd: 8 }} />
                      <View style={{ flex: 1, alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                        <Text style={{ color: theme.text.primary, fontWeight: '700', fontSize: 12 }}>{col.name.toUpperCase()}</Text>
                        <Text style={{ color: theme.text.secondary, fontSize: 13, marginTop: 2 }}>{sug}</Text>
                      </View>
                    </View>
                  ));
                })
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderQueueTab = () => {
    const jobs = systemStats?.jobs || {};
    
    return (
      <View style={{ gap: 20 }}>
        {/* Job counts */}
        <View style={[styles.dashboardGrid, { gap: 16 }]}>
          <View style={[styles.card, localStyles.metricCard, { borderColor: theme.ui.border }]}>
            <Ionicons name="hourglass-outline" size={28} color={theme.primary.main} />
            <Text style={[styles.cardSubtitle, { marginTop: 8 }]}>{t('admin.pendingJobs')}</Text>
            <Text style={[styles.cardTitle, { fontSize: 24, marginTop: 4 }]}>{getSafe(jobs.pending)}</Text>
          </View>

          <View style={[styles.card, localStyles.metricCard, { borderColor: theme.ui.border }]}>
            <Ionicons name="close-circle-outline" size={28} color={theme.error.main} />
            <Text style={[styles.cardSubtitle, { marginTop: 8 }]}>{t('admin.failedJobs')}</Text>
            <Text style={[styles.cardTitle, { fontSize: 24, marginTop: 4 }]}>{getSafe(jobs.failed)}</Text>
          </View>

          <View style={[styles.card, localStyles.metricCard, { borderColor: theme.ui.border }]}>
            <Ionicons name="list-outline" size={28} color={theme.success.main} />
            <Text style={[styles.cardSubtitle, { marginTop: 8 }]}>{t('admin.totalJobs')}</Text>
            <Text style={[styles.cardTitle, { fontSize: 24, marginTop: 4 }]}>{getSafe(jobs.total)}</Text>
          </View>
        </View>

        {/* Job Queue operations */}
        <View style={[styles.card, { borderColor: theme.ui.border }]}>
          <View style={styles.cardInner}>
            <Text style={[styles.cardTitle, getTextAlignStyle(), { marginBottom: 16 }]}>{t('admin.jobQueue')}</Text>
            
            <View style={{ flexDirection: isManualRTL ? 'row-reverse' : 'row', gap: 16 }}>
              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary, { flex: 1, height: 48 }]}
                onPress={() => setIsRetryJobsModalVisible(true)}
                disabled={isJobsLoading || jobs.failed === 0}
              >
                {isJobsLoading ? (
                  <ActivityIndicator color={theme.primary.contrast} size="small" />
                ) : (
                  <>
                    <Ionicons name="refresh-outline" size={20} color={theme.primary.contrast} style={{ marginRight: 8 }} />
                    <Text style={[styles.buttonText, styles.buttonTextPrimary]}>{t('admin.retryJobs')}</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { flex: 1, height: 48, backgroundColor: theme.error.main + '20', borderColor: theme.error.main, borderWidth: 1 }]}
                onPress={() => setIsClearJobsModalVisible(true)}
                disabled={isJobsLoading || jobs.failed === 0}
              >
                {isJobsLoading ? (
                  <ActivityIndicator color={theme.error.main} size="small" />
                ) : (
                  <>
                    <Ionicons name="trash-outline" size={20} color={theme.error.main} style={{ marginRight: 8 }} />
                    <Text style={[styles.buttonText, { color: theme.error.main }]}>{t('admin.clearJobs')}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderSettingsTab = () => {
    return (
      <View style={{ gap: 20 }}>
        {/* Toggle Subscription state */}
        <View style={[styles.card, { borderColor: theme.ui.border }]}>
          <View style={styles.cardInner}>
            <Text style={[styles.cardTitle, getTextAlignStyle(), { marginBottom: 16 }]}>{t('admin.settingsOverrides')}</Text>

            {/* Switch 1: Pause Subscriptions */}
            <View style={[styles.settingRow, { flexDirection: isManualRTL ? 'row-reverse' : 'row' }]}>
              <View style={[styles.settingLeft, { flexDirection: isManualRTL ? 'row-reverse' : 'row', flex: 1 }]}>
                <Ionicons
                  name={settings?.isSubscriptionsPaused ? "pause-circle" : "play-circle"}
                  size={28}
                  color={settings?.isSubscriptionsPaused ? theme.warning.main : theme.success.main}
                />
                <View style={{ marginStart: 12, flex: 1, alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                  <Text style={[styles.cardTitle, { fontSize: 16, marginBottom: 4 }]}>{t('admin.pauseSubscriptions')}</Text>
                  <Text style={[styles.cardSubtitle, { textAlign: isRTL ? 'right' : 'left' }]}>
                    {settings?.isSubscriptionsPaused ? t('admin.subscriptionsPausedDesc') : t('admin.subscriptionsActiveDesc')}
                  </Text>
                </View>
              </View>
              <Switch
                value={settings?.isSubscriptionsPaused || false}
                onValueChange={() => setIsPauseSubsModalVisible(true)}
                trackColor={{ false: theme.border.main, true: theme.warning.main }}
              />
            </View>

            {/* Switch 2: Toggle New Subscriptions */}
            <View style={[styles.settingRow, { borderTopWidth: 1, borderTopColor: theme.ui.border, paddingTop: 20, marginTop: 20, flexDirection: isManualRTL ? 'row-reverse' : 'row' }]}>
              <View style={[styles.settingLeft, { flexDirection: isManualRTL ? 'row-reverse' : 'row', flex: 1 }]}>
                <Ionicons
                  name={settings?.isNewSubscriptionsEnabled ? "add-circle" : "remove-circle"}
                  size={28}
                  color={settings?.isNewSubscriptionsEnabled ? theme.success.main : theme.error.main}
                />
                <View style={{ marginStart: 12, flex: 1, alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                  <Text style={[styles.cardTitle, { fontSize: 16, marginBottom: 4 }]}>{t('admin.disableNewSubscriptions')}</Text>
                  <Text style={[styles.cardSubtitle, { textAlign: isRTL ? 'right' : 'left' }]}>
                    {settings?.isNewSubscriptionsEnabled ? t('admin.newSubsEnabledDesc') : t('admin.newSubsDisabledDesc')}
                  </Text>
                </View>
              </View>
              <Switch
                value={!settings?.isNewSubscriptionsEnabled || false}
                onValueChange={() => setIsToggleNewSubsModalVisible(true)}
                trackColor={{ false: theme.border.main, true: theme.error.main }}
              />
            </View>

            {/* Text Input: Lockout message */}
            {!settings?.isNewSubscriptionsEnabled && (
              <View style={{ marginTop: 20, borderTopWidth: 1, borderTopColor: theme.ui.border, paddingTop: 20, alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                <Text style={[styles.cardTitle, { fontSize: 14, marginBottom: 8 }]}>
                  {t('admin.lockoutMessageLabel')}
                </Text>
                <TextInput
                  style={[localStyles.textInput, {
                    backgroundColor: theme.background.secondary,
                    color: theme.text.primary,
                    borderColor: theme.ui.border,
                    textAlign: isRTL ? 'right' : 'left',
                  }]}
                  placeholder={t('admin.lockoutMessagePlaceholder')}
                  placeholderTextColor={theme.text.tertiary}
                  value={lockoutMsg}
                  onChangeText={setLockoutMsg}
                  multiline
                  numberOfLines={3}
                />
                <TouchableOpacity
                  style={[styles.button, styles.buttonPrimary, { marginTop: 12, height: 40, paddingVertical: 0 }]}
                  onPress={async () => {
                    await toggleNewSubscriptions(false, lockoutMsg);
                    Alert.alert(t('common.success'), t('admin.settingsSaved'));
                  }}
                >
                  <Text style={[styles.buttonText, styles.buttonTextPrimary]}>{t('common.save')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Official Government Certificate PDF Upload */}
        <View style={[styles.card, { borderColor: theme.ui.border }]}>
          <View style={styles.cardInner}>
            <Text style={[styles.cardTitle, getTextAlignStyle(), { marginBottom: 8 }]}>Official Government Certificate</Text>
            <Text style={[styles.cardSubtitle, getTextAlignStyle(), { marginBottom: 16 }]}>
              This official certificate is displayed in the About screen. You can upload a renewed PDF here.
            </Text>

            {settings?.financialLicenseUrl && (
              <View style={[localStyles.currentFileRow, { backgroundColor: theme.background.secondary, borderColor: theme.ui.border, flexDirection: isManualRTL ? 'row-reverse' : 'row' }]}>
                <Ionicons name="document-text-outline" size={24} color={theme.primary.main} />
                <Text style={[localStyles.currentFileText, { color: theme.text.primary, flex: 1, marginHorizontal: 8 }]} numberOfLines={1}>
                  {settings.financialLicenseUrl.split('/').pop()}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <TouchableOpacity
                    onPress={() => {
                      const licenseUrl = settings?.financialLicenseUrl;
                      if (!licenseUrl) return;
                      const baseUrl = getApiBaseUrl();
                      const fullUrl = licenseUrl.startsWith('http')
                        ? licenseUrl
                        : `${baseUrl}${licenseUrl}`;
                      Linking.openURL(fullUrl);
                    }}
                  >
                    <Text style={{ color: theme.primary.main, fontWeight: '700' }}>View Current</Text>
                  </TouchableOpacity>
                  {settings.financialLicenseUrl !== '/uploads/documents/default_financial_license.pdf' && (
                    <TouchableOpacity
                      onPress={handleRemoveLicense}
                      disabled={isLicenseUploading}
                    >
                      <Text style={{ color: theme.error.main, fontWeight: '700' }}>Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary, { marginTop: 12, height: 48, justifyContent: 'center' }]}
              onPress={handlePickDocument}
              disabled={isLicenseUploading}
            >
              {isLicenseUploading ? (
                <ActivityIndicator color={theme.primary.contrast} size="small" />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Ionicons name="cloud-upload-outline" size={20} color={theme.primary.contrast} />
                  <Text style={[styles.buttonText, styles.buttonTextPrimary]}>Select & Upload New PDF</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Help & Support Recipient Emails CRUD */}
        <View style={[styles.card, { borderColor: theme.ui.border }]}>
          <View style={styles.cardInner}>
            <Text style={[styles.cardTitle, getTextAlignStyle(), { marginBottom: 8 }]}>Support Ticket Recipients</Text>
            <Text style={[styles.cardSubtitle, getTextAlignStyle(), { marginBottom: 16 }]}>
              Manage the list of emails that receive technical support tickets submitted by users.
            </Text>

            {isEmailsLoading && supportEmails.length === 0 ? (
              <ActivityIndicator size="small" color={theme.primary.main} style={{ marginVertical: 12 }} />
            ) : (
              <View style={{ gap: 10, marginBottom: 16 }}>
                {supportEmails.filter(email => email !== 'hossammamdouh05@gmail.com').map((email) => {
                  const isPermanent = email === 'hussam.mamdouh@aiesec.net';
                  return (
                    <View key={email} style={[localStyles.emailRow, { borderColor: theme.ui.border, flexDirection: isManualRTL ? 'row-reverse' : 'row' }]}>
                      <Text style={[localStyles.emailText, { color: theme.text.primary, flex: 1, textAlign: isRTL ? 'right' : 'left' }]}>{email}</Text>
                      {isPermanent ? (
                        <View style={[localStyles.badge, { backgroundColor: theme.primary.main + '15' }]}>
                          <Text style={[localStyles.badgeText, { color: theme.primary.main }]}>System Default</Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          onPress={() => handleDeleteSupportEmailConfirm(email)}
                          style={localStyles.deleteButton}
                        >
                          <Ionicons name="trash-outline" size={18} color={theme.error.main} />
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
              </View>
            )}

            {/* Add support email form */}
            <View style={[localStyles.addEmailForm, { flexDirection: isManualRTL ? 'row-reverse' : 'row' }]}>
              <TextInput
                style={[localStyles.emailInput, {
                  borderColor: theme.ui.border,
                  color: theme.text.primary,
                  backgroundColor: theme.background.secondary,
                  textAlign: isRTL ? 'right' : 'left',
                }]}
                placeholder="Enter email address..."
                placeholderTextColor={theme.text.tertiary}
                value={newEmail}
                onChangeText={setNewEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary, { height: 44, paddingHorizontal: 16, justifyContent: 'center' }]}
                onPress={handleAddEmail}
                disabled={isEmailsLoading}
              >
                {isEmailsLoading ? (
                  <ActivityIndicator color={theme.primary.contrast} size="small" />
                ) : (
                  <Text style={[styles.buttonText, styles.buttonTextPrimary]}>Add Email</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'system':
        return renderSystemStatsTab();
      case 'database':
        return renderDatabaseTab();
      case 'queue':
        return renderQueueTab();
      case 'settings':
        return renderSettingsTab();
      default:
        return null;
    }
  };

  const renderScreenBody = () => (
    <ScrollView
      style={styles.content}
      contentContainerStyle={[styles.scrollContent, isDesktop && { padding: 32 }]}
    >
      {renderTabHeaders()}
      
      {error && (
        <View style={[styles.errorContainer, { marginBottom: 16 }]}>
          <Ionicons name="alert-circle" size={40} color={theme.error.main} />
          <Text style={[styles.errorMessage, { marginTop: 8 }]}>{error}</Text>
        </View>
      )}

      {renderActiveTabContent()}
    </ScrollView>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {isDesktop ? (
        <View style={styles.desktopContentWrapper}>
          <AdminSidebar />
          <View style={styles.desktopMainContent}>
            <View style={[styles.header, { backgroundColor: theme.background.secondary, borderBottomColor: theme.ui.border, height: 80, paddingTop: 0, flexDirection: isManualRTL ? 'row-reverse' : 'row' }]}>
              <Text style={[styles.headerTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{t('admin.systemControl')}</Text>
              <View style={styles.headerRight}>
                <TouchableOpacity
                  style={styles.addButton}
                  activeOpacity={0.8}
                  onPress={() => refresh()}
                >
                  <Ionicons name="refresh" size={22} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
            {renderScreenBody()}
          </View>
        </View>
      ) : (
        <>
          <View style={[styles.header, { backgroundColor: theme.background.secondary, borderBottomColor: theme.ui.border, flexDirection: isManualRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.headerLeft, { flexDirection: isManualRTL ? 'row-reverse' : 'row' }]}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{ padding: 4, marginEnd: 8 }}
              >
                <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={theme.text.primary} />
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{t('admin.systemControl')}</Text>
            </View>
            <View style={[styles.headerRight, { flexDirection: isManualRTL ? 'row-reverse' : 'row' }]}>
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => refresh()}
                activeOpacity={0.7}
              >
                <Ionicons name="refresh" size={24} color={theme.primary.main} />
              </TouchableOpacity>
            </View>
          </View>

          <ResponsiveContainer style={{ flex: 1 }}>
            {renderScreenBody()}
          </ResponsiveContainer>
        </>
      )}

      {/* Confirmation Modals */}
      <ConfirmationModal
        visible={isMaintenanceModalVisible}
        onClose={() => setIsMaintenanceModalVisible(false)}
        onConfirm={async () => { await runDatabaseMaintenance(); }}
        title={t('admin.maintenanceConfirmTitle')}
        message={t('admin.maintenanceConfirmMessage')}
        confirmText={t('common.confirm')}
        cancelText={t('common.cancel')}
        icon="construct-outline"
        iconColor={theme.primary.main}
      />

      <ConfirmationModal
        visible={isResetMetricsModalVisible}
        onClose={() => setIsResetMetricsModalVisible(false)}
        onConfirm={async () => { await resetPerformanceMetrics(); }}
        title={t('admin.resetMetricsConfirmTitle')}
        message={t('admin.resetMetricsConfirmMessage')}
        confirmText={t('common.confirm')}
        cancelText={t('common.cancel')}
        icon="stats-chart-outline"
        iconColor={theme.error.main}
        destructive
      />

      <ConfirmationModal
        visible={isRetryJobsModalVisible}
        onClose={() => setIsRetryJobsModalVisible(false)}
        onConfirm={async () => { await retryFailedJobs(); }}
        title={t('admin.retryJobsConfirmTitle')}
        message={t('admin.retryJobsConfirmMessage')}
        confirmText={t('common.confirm')}
        cancelText={t('common.cancel')}
        icon="refresh-circle-outline"
        iconColor={theme.primary.main}
      />

      <ConfirmationModal
        visible={isClearJobsModalVisible}
        onClose={() => setIsClearJobsModalVisible(false)}
        onConfirm={async () => { await clearFailedJobs(); }}
        title={t('admin.clearJobsConfirmTitle')}
        message={t('admin.clearJobsConfirmMessage')}
        confirmText={t('common.confirm')}
        cancelText={t('common.cancel')}
        icon="trash-outline"
        iconColor={theme.error.main}
        destructive
      />

      <ConfirmationModal
        visible={isPauseSubsModalVisible}
        onClose={() => setIsPauseSubsModalVisible(false)}
        onConfirm={() => toggleSubscriptionPause()}
        title={t('admin.pauseSubsConfirmTitle')}
        message={t('admin.pauseSubsConfirmMessage')}
        confirmText={t('common.confirm')}
        cancelText={t('common.cancel')}
        icon="alert-circle-outline"
        iconColor={theme.warning.main}
      />

      <ConfirmationModal
        visible={isToggleNewSubsModalVisible}
        onClose={() => setIsToggleNewSubsModalVisible(false)}
        onConfirm={() => toggleNewSubscriptions(!settings?.isNewSubscriptionsEnabled, lockoutMsg)}
        title={t('admin.toggleNewSubsConfirmTitle')}
        message={t('admin.toggleNewSubsConfirmMessage')}
        confirmText={t('common.confirm')}
        cancelText={t('common.cancel')}
        icon="alert-circle-outline"
        iconColor={theme.error.main}
      />

      {/* Remove Support Email Confirmation Modal */}
      <ConfirmationModal
        visible={!!emailToRemove}
        onClose={() => setEmailToRemove(null)}
        onConfirm={async () => {
          if (emailToRemove) {
            await deleteSupportEmail(emailToRemove);
            setEmailToRemove(null);
          }
        }}
        title="Remove Support Email"
        message={`Are you sure you want to remove "${emailToRemove}" from the ticket recipient list?`}
        confirmText={t('common.confirm')}
        cancelText={t('common.cancel')}
        icon="trash-outline"
        iconColor={theme.error.main}
        destructive
      />

      {/* Remove Custom Certificate Confirmation Modal */}
      <ConfirmationModal
        visible={isRemoveCertModalVisible}
        onClose={() => setIsRemoveCertModalVisible(false)}
        onConfirm={async () => {
          await deleteLicensePdf();
          setIsRemoveCertModalVisible(false);
        }}
        title="Remove Custom Certificate"
        message="Are you sure you want to remove the custom certificate and revert to the default certificate?"
        confirmText={t('common.confirm')}
        cancelText={t('common.cancel')}
        icon="document-text-outline"
        iconColor={theme.error.main}
        destructive
      />

      {/* Upload Certificate Confirmation Modal */}
      <ConfirmationModal
        visible={!!pendingUploadData}
        onClose={() => {
          setPendingUploadData(null);
          setPendingUploadName(null);
        }}
        onConfirm={async () => {
          if (pendingUploadData) {
            await uploadLicensePdf(pendingUploadData);
          }
          setPendingUploadData(null);
          setPendingUploadName(null);
        }}
        title="Confirm Certificate Upload"
        message={`Do you want to set "${pendingUploadName}" as the new official financial license?`}
        confirmText={t('common.confirm')}
        cancelText={t('common.cancel')}
        icon="cloud-upload-outline"
        iconColor={theme.primary.main}
      />
    </View>
  );
};

const localStyles = StyleSheet.create({
  tabBar: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 24,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    gap: 4,
  },
  tabLabel: {
    fontSize: 13,
  },
  tabLabelMobile: {
    fontSize: 10,
  },
  metricCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
  },
  infoRowGroup: {
    gap: 12,
  },
  infoRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.1)',
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  tableHeaderRow: {
    borderBottomWidth: 2,
    paddingBottom: 10,
    marginBottom: 10,
  },
  tableHeaderCell: {
    fontSize: 12,
    fontWeight: '700',
  },
  tableRow: {
    borderBottomWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tableCell: {
    fontSize: 13,
  },
  suggestionItem: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  textInput: {
    width: '100%',
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
  },
  currentFileRow: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  currentFileText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emailRow: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  emailText: {
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  addEmailForm: {
    gap: 12,
    alignItems: 'center',
    marginTop: 16,
    width: '100%',
  },
  emailInput: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
});
