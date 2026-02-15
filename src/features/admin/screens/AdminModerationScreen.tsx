/**
 * AdminModerationScreen
 * Content moderation with flagged content review and actions
 * Now with theme and language support
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  ScrollView,
  TextInput,
  ActivityIndicator,
  useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme, useLocalization } from '../../../app/providers';
import { createAdminStyles } from '../admin.styles';
import { useModeration } from '../hooks';
import {
  FilterBar,
  SearchBar,
  LoadingState,
  EmptyState,
  ActionSheet,
  ConfirmationModal,
  StatCard,
  AdminSidebar,
} from '../components';
import { ResponsiveContainer } from '../../../shared/components';

const STATUS_COLORS: Record<string, string> = {
  pending: '#FF9800',
  approved: '#4CAF50',
  rejected: '#F44336',
  resolved: '#2196F3',
  removed: '#F44336',
};

export const AdminModerationScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { t, isRTL } = useLocalization();
  const styles = useMemo(() => createAdminStyles(theme, isRTL), [theme, isRTL]);
  const localStyles = useMemo(() => createLocalStyles(theme, isRTL), [theme, isRTL]);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const [searchQuery, setSearchQuery] = useState('');
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const {
    moderationQueue,
    flaggedContent,
    loading,
    error,
    queueStatus,
    setQueueStatusFilter,
    flaggedStatus,
    setFlaggedStatusFilter,
    severity,
    setSeverityFilter,
    approveContent,
    rejectContent,
    resolveFlaggedContent,
    getModerationStats,
    refresh,
  } = useModeration();

  const [activeTab, setActiveTab] = useState<'queue' | 'flagged'>('queue');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getModerationStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
    };
    fetchStats();
  }, [getModerationStats]);

  const TABS = [
    { id: 'queue', label: t('admin.moderationQueue'), icon: 'list-outline' },
    { id: 'flagged', label: t('admin.flaggedContent'), icon: 'flag-outline' },
  ];

  const queueStatusOptions = [
    { label: t('common.all'), value: '' },
    { label: t('admin.pending'), value: 'pending', icon: 'time-outline' },
    { label: t('admin.approved'), value: 'approved', icon: 'checkmark-circle' },
    { label: t('admin.rejected'), value: 'rejected', icon: 'close-circle' },
  ];

  const flaggedStatusOptions = [
    { label: t('common.all'), value: '' },
    { label: t('admin.pending'), value: 'pending', icon: 'time-outline' },
    { label: t('admin.resolved'), value: 'resolved', icon: 'checkmark-circle' },
  ];

  const handleItemPress = (item: any) => {
    setSelectedItem(item);
    setShowActionSheet(true);
  };

  const handleApprove = async () => {
    if (selectedItem) {
      try {
        if (activeTab === 'queue') {
          await approveContent(selectedItem._id);
        } else {
          await resolveFlaggedContent(selectedItem._id, 'approved', 'Approved by admin');
        }
        setSelectedItem(null);
        setShowActionSheet(false);
      } catch (error) {
        console.error('Failed to approve:', error);
      }
    }
  };

  const handleRemove = async () => {
    if (selectedItem) {
      try {
        if (activeTab === 'queue') {
          await rejectContent(selectedItem._id, 'Removed by admin');
        } else {
          await resolveFlaggedContent(selectedItem._id, 'removed', 'Removed by admin');
        }
        setSelectedItem(null);
        setShowResolveModal(false);
      } catch (error) {
        console.error('Failed to remove:', error);
      }
    }
  };

  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'low':
        return theme.success.main;
      case 'medium':
        return theme.warning.main;
      case 'high':
        return theme.error.main;
      case 'critical':
        return '#8B0000';
      default:
        return theme.text.tertiary;
    }
  };

  const renderModerationItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity
        style={localStyles.itemCard}
        onPress={() => handleItemPress(item)}
        activeOpacity={0.7}
      >
        <View style={localStyles.cardHeader}>
          <View style={localStyles.typeInfo}>
            <View style={[localStyles.typeIcon, { backgroundColor: theme.primary.main + '20' }]}>
              <Ionicons
                name={item.contentType === 'insight' ? 'document-text-outline' : 'chatbubble-outline'}
                size={18}
                color={theme.primary.main}
              />
            </View>
            <View>
              <Text style={localStyles.itemTitle} numberOfLines={1}>
                {item.content?.title || item.title || 'Untitled Content'}
              </Text>
              <Text style={localStyles.itemMeta}>
                {t('admin.by')} {item.author?.name || 'Unknown'} • {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
          <View style={[localStyles.statusBadge, { backgroundColor: (STATUS_COLORS[item.status] || theme.text.tertiary) + '20' }]}>
            <Text style={[localStyles.statusText, { color: STATUS_COLORS[item.status] || theme.text.tertiary }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={localStyles.itemExcerpt} numberOfLines={2}>
          {item.content?.excerpt || item.excerpt || item.content?.body || 'No preview available'}
        </Text>

        <View style={localStyles.cardFooter}>
          <View style={localStyles.footerDetail}>
            <Ionicons name="folder-outline" size={14} color={theme.text.tertiary} />
            <Text style={localStyles.footerText}>{item.category || item.contentType}</Text>
          </View>
          <TouchableOpacity style={[localStyles.actionBtn, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={[localStyles.actionBtnText, { [isRTL ? 'marginLeft' : 'marginRight']: 4 }]}>{t('admin.review')}</Text>
            <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={14} color={theme.primary.main} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFlaggedItem = ({ item }: { item: any }) => {
    const severityColor = getSeverityColor(item.severity);

    return (
      <TouchableOpacity
        style={[localStyles.itemCard, { borderLeftWidth: 4, borderLeftColor: severityColor }]}
        onPress={() => handleItemPress(item)}
        activeOpacity={0.7}
      >
        <View style={localStyles.cardHeader}>
          <View style={localStyles.typeInfo}>
            <View style={[localStyles.typeIcon, { backgroundColor: severityColor + '15' }]}>
              <Ionicons name="flag-outline" size={18} color={severityColor} />
            </View>
            <View>
              <Text style={localStyles.itemTitle} numberOfLines={1}>
                {item.content?.title || 'Reported Content'}
              </Text>
              <Text style={localStyles.itemMeta}>
                {item.reportCount || 1} {t('admin.reports')} • {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
          </View>
          <View style={[localStyles.severityBadge, { backgroundColor: severityColor + '20' }]}>
            <Text style={[localStyles.severityText, { color: severityColor }]}>
              {item.severity.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={localStyles.reportReason}>
          <Text style={localStyles.reasonLabel}>{t('admin.reason')}:</Text>
          <Text style={localStyles.reasonText}>{item.reason}</Text>
        </View>

        {item.description && (
          <Text style={localStyles.reportDesc} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        <View style={localStyles.cardFooter}>
          <View style={localStyles.footerDetail}>
            <Ionicons name="person-outline" size={14} color={theme.text.tertiary} />
            <Text style={localStyles.footerText}>
              {t('admin.reportedBy')} {item.reportedBy?.name || 'Anonymous'}
            </Text>
          </View>
          <TouchableOpacity style={[localStyles.actionBtn, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={[localStyles.actionBtnText, { color: theme.error.main, [isRTL ? 'marginLeft' : 'marginRight']: 4 }]}>{t('admin.takeAction')}</Text>
            <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={14} color={theme.error.main} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && flaggedContent.length === 0) {
    return <LoadingState type="list" count={5} />;
  }

  const renderHeader = () => (
    <View style={[styles.header, isDesktop && { backgroundColor: theme.background.secondary, borderBottomColor: theme.ui.border, height: 80, paddingTop: 0, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
      <View style={[styles.headerLeft, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color={theme.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{isDesktop ? t('admin.moderationOverview') : t('admin.moderation')}</Text>
      </View>
      <TouchableOpacity onPress={refresh} style={{ [isRTL ? 'marginLeft' : 'marginRight']: isDesktop ? 20 : 0 }}>
        <Ionicons name="refresh" size={24} color={theme.primary.main} />
      </TouchableOpacity>
    </View>
  );

  const renderMainContent = () => (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={localStyles.statsScroll}
        contentContainerStyle={[localStyles.statsContainer, isDesktop && { paddingHorizontal: 24, paddingVertical: 16 }]}
      >
        <StatCard
          title={t('admin.pendingReview')}
          value={stats?.queue?.pending || 0}
          icon="time-outline"
          color={theme.primary.main}
        />
        <StatCard
          title={t('admin.flaggedItems')}
          value={stats?.flagged?.pending || 0}
          icon="flag-outline"
          color={theme.error.main}
        />
        <StatCard
          title={t('admin.criticalFlags')}
          value={stats?.flagged?.critical || 0}
          icon="alert-circle-outline"
          color={theme.error.dark}
        />
        <StatCard
          title={t('admin.resolvedToday')}
          value={stats?.resolvedToday || 0}
          icon="checkmark-done-outline"
          color={theme.success.main}
        />
      </ScrollView>

      <View style={[localStyles.tabsContainer, isDesktop && { paddingHorizontal: 24 }]}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              localStyles.tab,
              activeTab === tab.id && localStyles.activeTab,
            ]}
            onPress={() => setActiveTab(tab.id as any)}
          >
            <Ionicons
              name={tab.icon as any}
              size={20}
              color={activeTab === tab.id ? theme.primary.main : theme.text.tertiary}
            />
            <Text
              style={[
                localStyles.tabLabel,
                activeTab === tab.id && localStyles.activeTabLabel,
              ]}
            >
              {tab.label}
            </Text>
            {activeTab === tab.id && <View style={localStyles.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      <View style={[localStyles.filtersContainer, isDesktop && { paddingHorizontal: 24 }]}>
        <View style={[localStyles.searchHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={[localStyles.searchWrapper, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Ionicons name="search" size={20} color={theme.text.tertiary} />
            <TextInput
              style={[localStyles.searchInput, { textAlign: isRTL ? 'right' : 'left' }]}
              placeholder={activeTab === 'queue' ? t('admin.searchQueue') : t('admin.searchFlags')}
              placeholderTextColor={theme.text.tertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={localStyles.filterBtn}>
            <Ionicons name="options-outline" size={20} color={theme.text.primary} />
          </TouchableOpacity>
        </View>

        <FilterBar
          options={activeTab === 'queue' ? queueStatusOptions : flaggedStatusOptions}
          selectedValue={((activeTab === 'queue' ? queueStatus : flaggedStatus) || '') as any}
          onSelect={(value) => {
            const filterValue = value === '' ? undefined : value as any;
            return activeTab === 'queue' ? setQueueStatusFilter(filterValue) : setFlaggedStatusFilter(filterValue);
          }}
          label={t('admin.status')}
        />
      </View>

      {error ? (
        <EmptyState
          icon="alert-circle"
          title={t('common.error')}
          message={error}
          actionLabel={t('common.retry')}
          onActionPress={refresh}
          iconColor={theme.error.main}
        />
      ) : (activeTab === 'queue' ? moderationQueue : flaggedContent).length === 0 ? (
        <EmptyState
          icon={activeTab === 'queue' ? "list-outline" : "shield-checkmark-outline"}
          title={activeTab === 'queue' ? t('admin.emptyQueue') : t('admin.noFlaggedContent')}
          message={t('admin.moderationClear')}
          iconColor={theme.success.main}
        />
      ) : (
        <FlatList
          data={activeTab === 'queue' ? moderationQueue : flaggedContent}
          renderItem={activeTab === 'queue' ? renderModerationItem : renderFlaggedItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={[styles.scrollContent, isDesktop && { paddingHorizontal: 24 }]}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
          numColumns={isDesktop ? 2 : 1}
          key={isDesktop ? 'desktop' : 'mobile'}
        />
      )}
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

        <ActionSheet
          visible={showActionSheet}
          onClose={() => {
            setShowActionSheet(false);
          }}
          title={t('admin.moderationActions')}
          options={[
            {
              label: activeTab === 'queue' ? t('admin.approveContent') : t('admin.resolve'),
              icon: 'checkmark-circle-outline',
              onPress: handleApprove,
            },
            {
              label: t('admin.viewDetails'),
              icon: 'information-circle-outline',
              onPress: () => setShowActionSheet(false),
            },
            {
              label: t('admin.contactReporter'),
              icon: 'mail-outline',
              onPress: () => setShowActionSheet(false),
            },
            {
              label: activeTab === 'queue' ? t('admin.rejectContentLabel') : t('admin.removeContentLabel'),
              icon: 'trash-outline',
              onPress: () => {
                setShowActionSheet(false);
                setShowResolveModal(true);
              },
              destructive: true,
            },
          ]}
        />

        <ConfirmationModal
          visible={showResolveModal}
          onClose={() => {
            setShowResolveModal(false);
            setSelectedItem(null);
          }}
          onConfirm={handleRemove}
          title={activeTab === 'queue' ? t('admin.rejectContentLabel') : t('admin.removeContentLabel')}
          message={activeTab === 'queue' ? t('admin.rejectContent') || 'Confirm rejection?' : t('admin.removeMessage')}
          confirmText={activeTab === 'queue' ? t('admin.reject') || 'Reject' : t('admin.removeContentLabel')}
          cancelText={t('common.cancel')}
          destructive
          icon="trash"
        />
      </View>
    </SafeAreaView>
  );
};

const createLocalStyles = (theme: any, isRTL: boolean) => StyleSheet.create({
  statsScroll: {
    maxHeight: 130,
    marginTop: 16,
  },
  statsContainer: {
    paddingHorizontal: 16,
    gap: 12,
    flexDirection: isRTL ? 'row-reverse' : 'row',
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  tabsContainer: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    paddingHorizontal: 16,
    marginTop: 20,
    backgroundColor: theme.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.main,
  },
  tab: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    paddingVertical: 14,
    [isRTL ? 'marginLeft' : 'marginRight']: 24,
    gap: 8,
    position: 'relative',
  },
  activeTab: {
    borderBottomWidth: 0, // Indicator handles this
  },
  tabLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text.tertiary,
    textAlign: isRTL ? 'right' : 'left',
  },
  activeTabLabel: {
    color: theme.primary.main,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: theme.primary.main,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  filtersContainer: {
    padding: 16,
    backgroundColor: theme.background.primary,
  },
  searchHeader: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    gap: 12,
    marginBottom: 16,
  },
  searchWrapper: {
    flex: 1,
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    backgroundColor: theme.background.secondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.text.primary,
    textAlign: isRTL ? 'right' : 'left',
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: theme.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemCard: {
    backgroundColor: theme.surface?.main || theme.background.secondary,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  typeInfo: {
    flex: 1,
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    gap: 12,
  },
  typeIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    [isRTL ? 'marginLeft' : 'marginRight']: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text.primary,
    marginBottom: 2,
    textAlign: isRTL ? 'right' : 'left',
  },
  itemMeta: {
    fontSize: 12,
    color: theme.text.tertiary,
    textAlign: isRTL ? 'right' : 'left',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  severityText: {
    fontSize: 11,
    fontWeight: '700',
  },
  itemExcerpt: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.text.secondary,
    marginBottom: 16,
    textAlign: isRTL ? 'right' : 'left',
  },
  reportReason: {
    backgroundColor: theme.background.tertiary,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  reasonLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.text.secondary,
    marginBottom: 4,
    textAlign: isRTL ? 'right' : 'left',
  },
  reasonText: {
    fontSize: 13,
    color: theme.text.primary,
    lineHeight: 18,
    textAlign: isRTL ? 'right' : 'left',
  },
  reportDesc: {
    fontSize: 14,
    fontStyle: 'italic',
    color: theme.text.secondary,
    marginBottom: 16,
    textAlign: isRTL ? 'right' : 'left',
  },
  cardFooter: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.border?.main || '#eee',
  },
  footerDetail: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerText: {
    fontSize: 12,
    color: theme.text.tertiary,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.primary.main,
    textAlign: isRTL ? 'right' : 'left',
  },
});
