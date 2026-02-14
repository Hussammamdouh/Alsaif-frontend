/**
 * Admin Subscriptions Management Screen
 * View and manage user subscriptions
 * Now with improved design, theme and language support
 */

import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  StyleSheet,
  RefreshControl,
  useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { createAdminStyles } from '../admin.styles';
import { useAdminSubscriptions } from '../hooks';
import { useTheme, useLocalization } from '../../../app/providers';
import { exportToExcel } from '../../../shared/utils/exportUtils';
import {
  SUBSCRIPTION_FILTER_OPTIONS,
  STATUS_COLORS,
  TIER_COLORS,
  SUBSCRIPTION_TIERS,
} from '../admin.constants';
import type { AdminSubscription, SubscriptionTier } from '../admin.types';
import {
  LoadingState,
  EmptyState,
  ActionSheet,
  ConfirmationModal,
  AdminSidebar,
} from '../components';
import { ResponsiveContainer } from '../../../shared/components';

export const AdminSubscriptionsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { t, isRTL } = useLocalization();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const styles = useMemo(() => createAdminStyles(theme, isRTL), [theme, isRTL]);
  const localStyles = useMemo(() => createLocalStyles(theme, isRTL), [theme, isRTL]);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const {
    subscriptions,
    pagination,
    filters,
    isLoading,
    isUpdating,
    error,
    setFilters,
    loadMore,
    refresh,
    grantSubscription,
    revokeSubscription,
  } = useAdminSubscriptions();

  const [selectedFilter, setSelectedFilter] = useState('');
  const [grantModalVisible, setGrantModalVisible] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<AdminSubscription | null>(null);

  // Grant form state
  const [grantEmail, setGrantEmail] = useState('');
  const [grantTier, setGrantTier] = useState<SubscriptionTier>('premium');
  const [grantDuration, setGrantDuration] = useState('30');
  const [grantReason, setGrantReason] = useState('');
  const [formError, setFormError] = useState('');

  // Revoke form state
  const [revokeReason, setRevokeReason] = useState('');


  useEffect(() => {
    const delaySearch = setTimeout(() => {
      setFilters({ ...filters, search: searchQuery });
    }, 500);
    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  const handleFilterChange = (value: string) => {
    setSelectedFilter(value);
    setFilters({ ...filters, status: value as any });
  };

  const openGrantModal = () => {
    setGrantEmail('');
    setGrantTier('premium');
    setGrantDuration('30');
    setGrantReason('');
    setFormError('');
    setGrantModalVisible(true);
  };

  const handleSubscriptionPress = (subscription: AdminSubscription) => {
    setSelectedSubscription(subscription);
    setShowActionSheet(true);
  };

  const handleGrant = async () => {
    if (!grantEmail.trim()) {
      setFormError(t('admin.emailRequired'));
      return;
    }
    if (!grantReason.trim()) {
      setFormError(t('admin.reasonRequired'));
      return;
    }

    const durationDays = parseInt(grantDuration, 10);
    if (isNaN(durationDays) || durationDays < 1) {
      setFormError(t('admin.durationMinimum'));
      return;
    }

    try {
      await grantSubscription({
        email: grantEmail,
        tier: grantTier,
        durationDays,
        reason: grantReason,
      });
      setGrantModalVisible(false);
      setFormError('');
      refresh();
    } catch (err: any) {
      setFormError(err.message || 'Failed to grant subscription');
    }
  };

  const handleRevoke = async () => {
    if (!selectedSubscription) return;
    if (!revokeReason.trim()) {
      setFormError(t('admin.reasonRequired'));
      return;
    }

    try {
      await revokeSubscription(selectedSubscription.user.id, revokeReason);
      setShowRevokeModal(false);
      setFormError('');
      setSelectedSubscription(null);
      refresh();
    } catch (err: any) {
      setFormError(err.message || 'Failed to revoke subscription');
    }
  };

  const getDaysRemaining = (endDate: string): number => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleExport = () => {
    if (!subscriptions || subscriptions.length === 0) return;

    const exportData = subscriptions.map(sub => ({
      User: sub.user.name,
      Email: sub.user.email,
      Tier: sub.tier,
      Status: sub.status,
      StartDate: new Date(sub.startDate).toLocaleDateString(),
      EndDate: sub.endDate ? new Date(sub.endDate).toLocaleDateString() : 'N/A',
      AutoRenew: sub.autoRenew ? 'Yes' : 'No'
    }));

    exportToExcel(exportData, `Subscriptions_${new Date().toISOString().split('T')[0]}`);
  };

  const renderSubscriptionCard = ({ item }: { item: AdminSubscription }) => {
    const statusColor = STATUS_COLORS[item.status] || theme.text.tertiary;
    const tierColor = TIER_COLORS[item.tier];
    const daysRemaining = item.endDate ? getDaysRemaining(item.endDate) : 0;
    const progressPercent = item.endDate
      ? ((new Date().getTime() - new Date(item.startDate).getTime()) /
        (new Date(item.endDate).getTime() - new Date(item.startDate).getTime())) *
      100
      : 0;

    return (
      <TouchableOpacity
        style={localStyles.subscriptionCard}
        onPress={() => handleSubscriptionPress(item)}
        activeOpacity={0.7}
      >
        <View style={localStyles.userHeader}>
          <View style={localStyles.userAvatar}>
            <Text style={localStyles.avatarText}>
              {item.user.name.substring(0, 2).toUpperCase()}
            </Text>
          </View>
          <View style={localStyles.userInfo}>
            <Text style={localStyles.userName}>{item.user.name}</Text>
            <Text style={localStyles.userEmail}>{item.user.email}</Text>
          </View>
        </View>

        <View style={localStyles.subscriptionBadges}>
          {item.tier && (
            <View style={[localStyles.badge, { backgroundColor: tierColor + '20' }]}>
              <Ionicons name="star" size={12} color={tierColor} />
              <Text style={[localStyles.badgeText, { color: tierColor }]}>
                {t(`tier.${item.tier}`).toUpperCase()}
              </Text>
            </View>
          )}
          {item.status && (
            <View style={[localStyles.badge, { backgroundColor: statusColor + '20' }]}>
              <Text style={[localStyles.badgeText, { color: statusColor }]}>
                {t(`status.${item.status}`).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {item.status === 'active' && (
          <>
            <View style={localStyles.progressSection}>
              <View style={localStyles.progressHeader}>
                <Text style={localStyles.progressText}>
                  {daysRemaining} {t('admin.daysRemaining')}
                </Text>
                <Text style={localStyles.progressText}>
                  {t('admin.ends')} {item.endDate ? formatDate(item.endDate) : 'N/A'}
                </Text>
              </View>
              <View style={localStyles.progressBarContainer}>
                <View
                  style={[
                    localStyles.progressBar,
                    {
                      width: `${Math.min(progressPercent, 100)}%`,
                      backgroundColor: tierColor,
                    },
                  ]}
                />
              </View>
            </View>

            {item.autoRenew && (
              <View style={localStyles.autoRenewBadge}>
                <Ionicons name="sync" size={14} color={theme.success.main} />
                <Text style={localStyles.autoRenewText}>
                  {t('admin.autoRenewEnabled')}
                </Text>
              </View>
            )}
          </>
        )}

        {item.revenue !== undefined && (
          <Text style={localStyles.revenueText}>
            {t('admin.revenue')}: ${item.revenue.toFixed(2)}
          </Text>
        )}

        {(item.lastPaymentDate || item.stripeSubscriptionId) && (
          <View style={localStyles.paymentInfo}>
            {item.lastPaymentDate && (
              <View style={localStyles.paymentDetail}>
                <Ionicons name="calendar-outline" size={14} color={theme.text.secondary} />
                <Text style={localStyles.paymentDetailText}>
                  {t('admin.paymentDate')}: {formatDate(item.lastPaymentDate)}
                </Text>
              </View>
            )}
            {item.stripeSubscriptionId && (
              <View style={localStyles.paymentDetail}>
                <Ionicons name="receipt-outline" size={14} color={theme.text.secondary} />
                <Text style={localStyles.paymentDetailText}>
                  {t('admin.stripeSubscriptionId')}: {item.stripeSubscriptionId}
                </Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading && subscriptions.length === 0) {
    return <LoadingState type="list" count={5} />;
  }

  const renderHeader = () => (
    <View style={[styles.header, isDesktop && { backgroundColor: theme.background.secondary, borderBottomColor: theme.ui.border, height: 80, paddingTop: 0, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
      <View style={[styles.headerLeft, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color={theme.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{isDesktop ? t('admin.subscriptionsOverview') : t('admin.subscriptions')}</Text>
      </View>
      <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 12 }}>
        <TouchableOpacity onPress={handleExport} style={localStyles.iconBtn}>
          <Ionicons name="download-outline" size={22} color={theme.primary.main} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.addButton, { [isRTL ? 'marginLeft' : 'marginRight']: isDesktop ? 20 : 0 }]} onPress={openGrantModal}>
          <Ionicons name="add" size={24} color={theme.primary.contrast} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderMainContent = () => (
    <>
      <View style={[localStyles.searchContainer, isDesktop && { paddingHorizontal: 24 }]}>
        <View style={[localStyles.searchBar, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Ionicons
            name="search"
            size={20}
            color={theme.text.tertiary}
            style={[localStyles.searchIcon, { [isRTL ? 'marginLeft' : 'marginRight']: 8 }]}
          />
          <TextInput
            style={[localStyles.searchInput, { textAlign: isRTL ? 'right' : 'left' }]}
            placeholder={t('admin.searchSubscriptions')}
            placeholderTextColor={theme.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={{ [isRTL ? 'marginRight' : 'marginLeft']: 8 }}>
              <Ionicons name="close-circle" size={20} color={theme.text.tertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={localStyles.filterContainer}
        contentContainerStyle={[localStyles.filterContent, isDesktop && { paddingHorizontal: 24 }]}
      >
        {SUBSCRIPTION_FILTER_OPTIONS.map((opt, index) => (
          <TouchableOpacity
            key={`filter-${index}`}
            style={[
              localStyles.filterChip,
              selectedFilter === opt.value && localStyles.filterChipActive,
            ]}
            onPress={() => handleFilterChange(opt.value)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                localStyles.filterChipText,
                selectedFilter === opt.value && localStyles.filterChipTextActive,
              ]}
            >
              {t(opt.labelKey)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {error ? (
        <EmptyState
          icon="alert-circle"
          title={t('common.error')}
          message={error}
          actionLabel={t('common.retry')}
          onActionPress={refresh}
          iconColor={theme.error.main}
        />
      ) : subscriptions.length === 0 ? (
        <EmptyState
          icon="card-outline"
          title={t('admin.noSubscriptionsFound')}
          message={t('admin.noSubscriptionsMessage')}
          iconColor={theme.text.tertiary}
        />
      ) : (
        <FlatList
          data={subscriptions}
          renderItem={renderSubscriptionCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[localStyles.listContent, isDesktop && { paddingHorizontal: 24 }]}
          columnWrapperStyle={isDesktop ? { flexDirection: isRTL ? 'row-reverse' : 'row' } : undefined}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} />}
          numColumns={isDesktop ? 2 : 1}
          key={isDesktop ? 'desktop' : 'mobile'}
          ListFooterComponent={
            pagination?.hasNextPage ? (
              <TouchableOpacity
                style={localStyles.loadMoreButton}
                onPress={loadMore}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={theme.primary.main} />
                ) : (
                  <Text style={localStyles.loadMoreText}>{t('common.loadMore')}</Text>
                )}
              </TouchableOpacity>
            ) : null
          }
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
          title={selectedSubscription?.user.name || t('admin.manageSubscription')}
          options={[
            {
              label: t('admin.revokeSubscription'),
              icon: 'close-circle-outline',
              onPress: () => {
                if (selectedSubscription?.status !== 'active') {
                  setShowActionSheet(false);
                  return;
                }
                setShowActionSheet(false);
                setShowRevokeModal(true);
              },
              destructive: true,
            },
          ]}
        />

        <ConfirmationModal
          visible={showRevokeModal}
          onClose={() => {
            setShowRevokeModal(false);
            setRevokeReason('');
            setFormError('');
            setSelectedSubscription(null);
          }}
          onConfirm={handleRevoke}
          title={t('admin.revokeSubscription')}
          message={t('admin.onlyActiveCanRevoke')}
          confirmText={t('admin.confirmRevocation')}
          cancelText={t('common.cancel')}
          destructive
          icon="close-circle"
          customContent={
            <View style={localStyles.formGroup}>
              <Text style={localStyles.label}>{t('admin.reasonForRevocation')} *</Text>
              <TextInput
                style={[localStyles.formInput, localStyles.textArea]}
                placeholder={t('admin.revocationPlaceholder')}
                placeholderTextColor={theme.text.tertiary}
                value={revokeReason}
                onChangeText={setRevokeReason}
                multiline
                numberOfLines={4}
              />
              {formError ? (
                <Text style={localStyles.errorText}>{formError}</Text>
              ) : null}
            </View>
          }
        />

        {/* Grant Subscription Modal */}
        <Modal
          visible={grantModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setGrantModalVisible(false)}
        >
          <View style={localStyles.modalOverlay}>
            <View style={[localStyles.modalContainer, isDesktop && localStyles.desktopModalContent]}>
              <View style={localStyles.modalContent}>
                {/* Modal Header */}
                <View style={localStyles.modalHeader}>
                  <Text style={localStyles.modalTitle}>{t('admin.grantSubscription')}</Text>
                  <TouchableOpacity
                    style={localStyles.modalCloseButton}
                    onPress={() => setGrantModalVisible(false)}
                  >
                    <Ionicons name="close" size={24} color={theme.text.tertiary} />
                  </TouchableOpacity>
                </View>

                {formError ? (
                  <View style={localStyles.errorBanner}>
                    <Ionicons name="alert-circle" size={20} color={theme.error.main} />
                    <Text style={localStyles.errorBannerText}>{formError}</Text>
                  </View>
                ) : null}

                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={localStyles.formGroup}>
                    <Text style={localStyles.label}>{t('admin.userEmail')} *</Text>
                    <TextInput
                      style={localStyles.formInput}
                      placeholder={t('admin.emailPlaceholder')}
                      placeholderTextColor={theme.text.tertiary}
                      value={grantEmail}
                      onChangeText={setGrantEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>

                  <View style={localStyles.formGroup}>
                    <Text style={localStyles.label}>{t('admin.duration')} *</Text>
                    <TextInput
                      style={localStyles.formInput}
                      placeholder={t('admin.durationPlaceholder')}
                      placeholderTextColor={theme.text.tertiary}
                      value={grantDuration}
                      onChangeText={setGrantDuration}
                      keyboardType="number-pad"
                    />
                  </View>

                  <View style={localStyles.formGroup}>
                    <Text style={localStyles.label}>{t('admin.reason')} *</Text>
                    <TextInput
                      style={[localStyles.formInput, localStyles.textArea]}
                      placeholder={t('admin.reasonPlaceholder')}
                      placeholderTextColor={theme.text.tertiary}
                      value={grantReason}
                      onChangeText={setGrantReason}
                      multiline
                      numberOfLines={4}
                    />
                  </View>
                </ScrollView>

                <TouchableOpacity
                  style={localStyles.submitButton}
                  onPress={handleGrant}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <ActivityIndicator size="small" color={theme.primary.contrast} />
                  ) : (
                    <Text style={localStyles.submitButtonText}>
                      {t('admin.grantSubscription')}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const createLocalStyles = (theme: any, isRTL: boolean) => StyleSheet.create({
  iconBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: theme.primary.main + '10',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchBar: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    backgroundColor: theme.background.secondary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchIcon: {
    [isRTL ? 'marginLeft' : 'marginRight']: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.text.primary,
    textAlign: isRTL ? 'right' : 'left',
  },
  filterContainer: {
    maxHeight: 60,
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: isRTL ? 'row-reverse' : 'row',
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.background.secondary,
    [isRTL ? 'marginLeft' : 'marginRight']: 8,
    borderWidth: 1,
    borderColor: theme.border.main,
  },
  filterChipActive: {
    backgroundColor: theme.primary.main,
    borderColor: theme.primary.main,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text.primary,
  },
  filterChipTextActive: {
    color: theme.primary.contrast,
  },
  listContent: {
    padding: 16,
    paddingBottom: 110, // Added for Floating Tab Bar safety
  },
  subscriptionCard: {
    backgroundColor: theme.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: theme.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userHeader: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    [isRTL ? 'marginLeft' : 'marginRight']: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.primary.contrast,
  },
  userInfo: {
    flex: 1,
    alignItems: isRTL ? 'flex-end' : 'flex-start',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text.primary,
    marginBottom: 4,
    textAlign: isRTL ? 'right' : 'left',
  },
  userEmail: {
    fontSize: 14,
    color: theme.text.tertiary,
    textAlign: isRTL ? 'right' : 'left',
  },
  subscriptionBadges: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  badge: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    [isRTL ? 'marginLeft' : 'marginRight']: 8,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    [isRTL ? 'marginRight' : 'marginLeft']: 4,
  },
  progressSection: {
    marginTop: 4,
  },
  progressHeader: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 13,
    color: theme.text.secondary,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: theme.background.tertiary,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  autoRenewBadge: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  autoRenewText: {
    fontSize: 13,
    color: theme.success.main,
    [isRTL ? 'marginRight' : 'marginLeft']: 4,
  },
  revenueText: {
    fontSize: 14,
    color: theme.text.secondary,
    marginTop: 8,
    textAlign: isRTL ? 'right' : 'left',
  },
  loadMoreButton: {
    backgroundColor: theme.background.secondary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  loadMoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.primary.main,
  },
  tierButtonsRow: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tierButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: theme.background.tertiary,
    alignItems: 'center',
    [isRTL ? 'marginLeft' : 'marginRight']: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: '30%',
  },
  tierButtonActive: {
    backgroundColor: theme.primary.main,
    borderColor: theme.primary.main,
  },
  tierButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text.primary,
  },
  tierButtonTextActive: {
    color: theme.primary.contrast,
  },
  errorBanner: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    backgroundColor: theme.error.main + '15',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.error.main + '30',
  },
  errorBannerText: {
    flex: 1,
    fontSize: 14,
    color: theme.error.main,
    [isRTL ? 'marginRight' : 'marginLeft']: 8,
    textAlign: isRTL ? 'right' : 'left',
  },
  errorText: {
    fontSize: 13,
    color: theme.error.main,
    marginTop: 4,
  },
  desktopModalContent: {
    width: 600,
    alignSelf: 'center',
    marginVertical: 40,
    borderRadius: 24,
    minHeight: 'auto',
    maxHeight: '90%',
  },
  // Modal Styles - Matching AdminUsersScreen and AdminInsightsScreen
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 600,
    maxHeight: '90%',
  },
  modalContent: {
    backgroundColor: theme.surface?.main || theme.background.primary,
    borderRadius: 16,
    padding: 24,
    minHeight: 200,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.main,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text.primary,
    flex: 1,
  },
  modalCloseButton: {
    padding: 4,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text.secondary,
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: theme.background.secondary,
    borderWidth: 1,
    borderColor: theme.border.main,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.text.primary,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  submitButton: {
    backgroundColor: theme.primary.main,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.primary.contrast,
  },
  paymentInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.border.main,
    gap: 8,
  },
  paymentDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paymentDetailText: {
    fontSize: 12,
    color: theme.text.secondary,
  },
});
