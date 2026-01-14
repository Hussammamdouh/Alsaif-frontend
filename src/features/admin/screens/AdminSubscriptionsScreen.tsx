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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { createAdminStyles } from '../admin.styles';
import { useAdminSubscriptions } from '../hooks';
import { useTheme, useLocalization } from '../../../app/providers';
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
} from '../components';

export const AdminSubscriptionsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { t } = useLocalization();
  const styles = useMemo(() => createAdminStyles(theme), [theme]);
  const localStyles = useMemo(() => createLocalStyles(theme), [theme]);

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

  const [searchQuery, setSearchQuery] = useState('');
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
    refresh();
  }, []);

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
      </TouchableOpacity>
    );
  };

  if (isLoading && subscriptions.length === 0) {
    return <LoadingState type="list" count={5} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={theme.text.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t('admin.subscriptions')}</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={openGrantModal}>
            <Ionicons name="add" size={24} color={theme.primary.contrast} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={localStyles.searchContainer}>
          <View style={localStyles.searchBar}>
            <Ionicons
              name="search"
              size={20}
              color={theme.text.tertiary}
              style={{ marginRight: 8 }}
            />
            <TextInput
              style={localStyles.searchInput}
              placeholder={t('admin.searchSubscriptions')}
              placeholderTextColor={theme.text.tertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={{ marginLeft: 8 }}>
                <Ionicons name="close-circle" size={20} color={theme.text.tertiary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={localStyles.filterContainer}
          contentContainerStyle={localStyles.filterContent}
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

        {/* Subscriptions List */}
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
            contentContainerStyle={localStyles.listContent}
            refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} />}
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
            <View style={localStyles.modalContainer}>
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

const createLocalStyles = (theme: any) => StyleSheet.create({
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.background.secondary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.text.primary,
  },
  filterContainer: {
    maxHeight: 60,
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.background.secondary,
    marginRight: 8,
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
    flexDirection: 'row',
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
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.primary.contrast,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text.primary,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: theme.text.tertiary,
  },
  subscriptionBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  progressSection: {
    marginTop: 4,
  },
  progressHeader: {
    flexDirection: 'row',
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
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  autoRenewText: {
    fontSize: 13,
    color: theme.success.main,
    marginLeft: 4,
  },
  revenueText: {
    fontSize: 14,
    color: theme.text.secondary,
    marginTop: 8,
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tierButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: theme.background.tertiary,
    alignItems: 'center',
    marginRight: 8,
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
    flexDirection: 'row',
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
    marginLeft: 8,
  },
  errorText: {
    fontSize: 13,
    color: theme.error.main,
    marginTop: 4,
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
});
