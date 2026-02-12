/**
 * Admin Audit Logs Screen
 * View system audit logs (superadmin only)
 * Now with theme and language support
 */

import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme, useLocalization } from '../../../app/providers';
import { createAdminStyles } from '../admin.styles';
import { useAdminAuditLogs } from '../hooks';
import { SEVERITY_COLORS, ROLE_COLORS } from '../admin.constants';
import type { AuditLog, AuditSeverity } from '../admin.types';
import { ResponsiveContainer } from '../../../shared/components';
import { AdminSidebar } from '../components';

export const AdminAuditLogsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { t, isRTL } = useLocalization();
  const styles = useMemo(() => createAdminStyles(theme, isRTL), [theme, isRTL]);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const { logs, pagination, filters, isLoading, error, setFilters, loadMore, refresh } =
    useAdminAuditLogs();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<AuditSeverity | ''>('');

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      setFilters({ ...filters, actorId: searchQuery || undefined });
    }, 500);
    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  const handleSeverityFilter = (severity: AuditSeverity | '') => {
    setSelectedSeverity(severity);
    setFilters({ ...filters, severity: severity || undefined });
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getSeverityIcon = (severity: AuditSeverity): string => {
    switch (severity) {
      case 'critical':
        return 'alert-circle';
      case 'error':
        return 'close-circle';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'information-circle';
    }
  };

  const getActionIcon = (action: string): string => {
    if (action.includes('USER')) return 'person';
    if (action.includes('INSIGHT')) return 'document-text';
    if (action.includes('SUBSCRIPTION')) return 'card';
    if (action.includes('NOTIFICATION') || action.includes('BROADCAST')) return 'megaphone';
    if (action.includes('ROLE')) return 'shield';
    if (action.includes('LOGIN') || action.includes('LOGOUT')) return 'log-in';
    return 'ellipse';
  };

  const renderLogCard = (log: AuditLog) => {
    const severityColor = SEVERITY_COLORS[log.severity];
    const roleColor = log.actor?.role ? ROLE_COLORS[log.actor.role] : theme.text.tertiary;

    return (
      <View key={log.id} style={styles.card}>
        <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'flex-start', padding: 16 }}>
          <View
            style={[
              {
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: severityColor + '20',
                justifyContent: 'center',
                alignItems: 'center',
                [isRTL ? 'marginLeft' : 'marginRight']: 12,
              },
            ]}
          >
            <Ionicons
              name={getSeverityIcon(log.severity) as any}
              size={20}
              color={severityColor}
            />
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', marginBottom: 4 }}>
              <Ionicons
                name={getActionIcon(log.action) as any}
                size={16}
                color={theme.text.primary}
                style={{ [isRTL ? 'marginLeft' : 'marginRight']: 6 }}
              />
              <Text style={styles.cardTitle}>{log.action.replace(/_/g, ' ')}</Text>
            </View>
            <Text style={styles.cardSubtitle}>{formatDate(log.timestamp)}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: severityColor + '20' }]}>
            <Text style={[styles.badgeText, { color: severityColor }]}>
              {log.severity.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          {log.actor && (
            <View
              style={{
                backgroundColor: theme.background.tertiary,
                padding: 12,
                borderRadius: 8,
                marginBottom: 12,
              }}
            >
              <Text style={[styles.label, { marginBottom: 4 }]}>Actor</Text>
              <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center' }}>
                <Text style={styles.listItemTitle}>{log.actor.email}</Text>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: roleColor + '20', [isRTL ? 'marginRight' : 'marginLeft']: 8 },
                  ]}
                >
                  <Text style={[styles.badgeText, { color: roleColor }]}>
                    {log.actor.role.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {log.target && (
            <View
              style={{
                backgroundColor: theme.background.tertiary,
                padding: 12,
                borderRadius: 8,
                marginBottom: 12,
              }}
            >
              <Text style={[styles.label, { marginBottom: 4 }]}>Target</Text>
              <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                <View style={[styles.badge, { backgroundColor: theme.primary.main + '20', [isRTL ? 'marginLeft' : 'marginRight']: 6 }]}>
                  <Text style={[styles.badgeText, { color: theme.primary.main }]}>
                    {log.target.resourceType}
                  </Text>
                </View>
                {log.target.resourceName && (
                  <Text style={styles.listItemSubtitle}>{log.target.resourceName}</Text>
                )}
              </View>
              <Text style={[styles.cardSubtitle, { marginTop: 4 }]}>
                ID: {log.target.resourceId}
              </Text>
            </View>
          )}

          {log.changes && (
            <View
              style={{
                backgroundColor: theme.background.tertiary,
                padding: 12,
                borderRadius: 8,
                marginBottom: 12,
              }}
            >
              <Text style={[styles.label, { marginBottom: 8 }]}>Changes</Text>
              {Object.keys(log.changes.before || {}).map((key) => (
                <View key={key} style={{ marginBottom: 6 }}>
                  <Text style={[styles.cardSubtitle, { fontWeight: '600' }]}>{key}:</Text>
                  <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', gap: 8, marginTop: 2 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.cardSubtitle, { color: theme.error.main }]}>
                        - {JSON.stringify(log.changes?.before?.[key])}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.cardSubtitle, { color: theme.success.main }]}>
                        + {JSON.stringify(log.changes?.after?.[key])}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <View
              style={{
                backgroundColor: theme.background.tertiary,
                padding: 12,
                borderRadius: 8,
                marginBottom: 12,
              }}
            >
              <Text style={[styles.label, { marginBottom: 4 }]}>Metadata</Text>
              {Object.entries(log.metadata).map(([key, value]) => (
                <Text key={key} style={styles.cardSubtitle}>
                  {key}: {JSON.stringify(value)}
                </Text>
              ))}
            </View>
          )}

          <View style={{ borderTopWidth: 1, borderTopColor: theme.border.main, paddingTop: 12 }}>
            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={styles.cardSubtitle}>IP: {log.ipAddress}</Text>
            </View>
            <Text style={styles.cardSubtitle} numberOfLines={1}>
              User Agent: {log.userAgent}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderSeverityFilter = (severity: AuditSeverity | '', label: string) => (
    <TouchableOpacity
      key={severity || 'all'}
      style={[
        styles.filterTab,
        selectedSeverity === severity && styles.filterTabActive,
      ]}
      onPress={() => handleSeverityFilter(severity)}
    >
      <Text
        style={[
          styles.filterTabText,
          selectedSeverity === severity && styles.filterTabTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={[styles.header, isDesktop && { backgroundColor: theme.background.secondary, borderBottomColor: theme.ui.border, height: 80, paddingTop: 0, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
      <View style={[styles.headerLeft, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        {!isDesktop && (
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color={theme.text.primary} />
          </TouchableOpacity>
        )}
        <Text style={[styles.headerTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{isDesktop ? t('admin.auditLogsOverview') : t('admin.auditLogs')}</Text>
      </View>
      <TouchableOpacity onPress={refresh} activeOpacity={0.7}>
        <Ionicons name="refresh" size={24} color={theme.primary.main} />
      </TouchableOpacity>
    </View>
  );

  const renderMainContent = () => (
    <>
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Ionicons name="search" size={20} color={theme.text.secondary} style={[styles.searchIcon, { [isRTL ? 'marginLeft' : 'marginRight']: 8 }]} />
          <TextInput
            style={[styles.searchInput, { textAlign: isRTL ? 'right' : 'left' }]}
            placeholder="Search by actor ID..."
            placeholderTextColor={theme.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterTabs}
        contentContainerStyle={styles.filterTabsContent}
      >
        {renderSeverityFilter('', 'All')}
        {renderSeverityFilter('info', 'Info')}
        {renderSeverityFilter('warning', 'Warning')}
        {renderSeverityFilter('error', 'Error')}
        {renderSeverityFilter('critical', 'Critical')}
      </ScrollView>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {isLoading && logs.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary.main} />
            <Text style={styles.loadingText}>{t('common.loading')}</Text>
          </View>
        ) : error && logs.length === 0 ? (
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
        ) : logs.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="document-text-outline"
              size={64}
              color={theme.text.tertiary}
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyTitle}>No Audit Logs Found</Text>
            <Text style={styles.emptyMessage}>
              No logs match your current filters
            </Text>
          </View>
        ) : (
          <>
            {logs.map(renderLogCard)}
            {pagination && pagination.hasMore && (
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={loadMore}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={theme.primary.main} />
                ) : (
                  <Text style={styles.loadMoreText}>{t('common.loadMore')}</Text>
                )}
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>
    </>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {isDesktop ? (
          <View style={styles.desktopContentWrapper}>
            <AdminSidebar />
            <View style={styles.desktopMainContent}>
              {renderHeader()}
              {renderMainContent()}
            </View>
          </View>
        ) : (
          <ResponsiveContainer style={{ flex: 1 }}>
            {renderHeader()}
            {renderMainContent()}
          </ResponsiveContainer>
        )}
      </View>
    </SafeAreaView>
  );
};
