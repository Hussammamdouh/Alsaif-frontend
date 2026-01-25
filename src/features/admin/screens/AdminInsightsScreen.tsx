/**
 * Admin Insights Management Screen
 * Create, edit, and manage insights/content
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
  Platform,
  StatusBar,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { createAdminStyles } from '../admin.styles';
import { useAdminInsights, useAdminInsightRequests } from '../hooks';
import { useTheme, useLocalization } from '../../../app/providers';
import { AdminSidebar } from '../components/AdminSidebar';
import {
  INSIGHT_TYPE_FILTER_OPTIONS,
  INSIGHT_STATUS_FILTER_OPTIONS,
  STATUS_COLORS,
  VALIDATION_RULES,
  INSIGHT_CATEGORIES,
} from '../admin.constants';
import type { AdminInsight, InsightCategory, InsightType } from '../admin.types';
import {
  LoadingState,
  EmptyState,
  ActionSheet,
  ConfirmationModal,
  SearchBar,
  FilterBar,
} from '../components';
import { ResponsiveContainer } from '../../../shared/components';

export const AdminInsightsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { theme, isDark } = useTheme();
  const { t, isRTL } = useLocalization();
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;
  const styles = useMemo(() => createAdminStyles(theme), [theme]);
  const localStyles = useMemo(() => createLocalStyles(theme), [theme]);

  const {
    insights,
    pagination,
    filters,
    isLoading,
    isUpdating,
    error,
    setFilters,
    loadMore,
    refresh,
    createInsight,
    updateInsight,
    deleteInsight,
    publishInsight,
    featureInsight,
    scheduleInsight,
  } = useAdminInsights();

  const [searchQuery, setSearchQuery] = useState('');
  const [mainTab, setMainTab] = useState<'insights' | 'proposals'>('insights');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<AdminInsight | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(new Date(Date.now() + 86400000));
  const [deleteReason, setDeleteReason] = useState('');

  // Proposals state
  const {
    requests,
    isLoading: isRequestsLoading,
    error: requestsError,
    moderateRequest,
    refresh: refreshRequests,
    loadMore: loadMoreRequests,
    pagination: proposalsPagination
  } = useAdminInsightRequests();
  const [showModerateModal, setShowModerateModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [moderationStatus, setModerationStatus] = useState<'approved' | 'rejected'>('approved');
  const [rejectionReason, setRejectionReason] = useState('');
  const [targetType, setTargetType] = useState<'free_insight' | 'premium_insight' | 'free_chat' | 'premium_chat'>('free_insight');

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formExcerpt, setFormExcerpt] = useState('');
  const [formType, setFormType] = useState<InsightType>('free');
  const [formCategory, setFormCategory] = useState<InsightCategory>('market_analysis');
  const [formTags, setFormTags] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    refresh();

    // Check for auto-open param from Home screen
    if (route.params?.autoOpenCreate) {
      console.log('[AdminInsightsScreen] Auto-opening create modal');
      openCreateModal();
      // Clear params to avoid re-opening on re-render
      navigation.setParams({ autoOpenCreate: undefined } as any);
    }
  }, []);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      setFilters({ ...filters, search: searchQuery });
    }, 500);
    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  const handleTypeFilterChange = (value: string) => {
    setSelectedTypeFilter(value);
    setFilters({ ...filters, type: value as InsightType | undefined });
  };

  const handleStatusFilterChange = (value: string) => {
    setSelectedStatusFilter(value);
    setFilters({ ...filters, status: value as any });
  };

  const resetForm = () => {
    setFormTitle('');
    setFormContent('');
    setFormExcerpt('');
    setFormType('free');
    setFormCategory('market_analysis');
    setFormTags('');
    setFormError('');
    setIsScheduled(false);
    setScheduledDate(new Date(Date.now() + 86400000));
  };

  const openCreateModal = () => {
    resetForm();
    setCreateModalVisible(true);
  };

  const openEditModal = (insight: AdminInsight) => {
    setSelectedInsight(insight);
    setFormTitle(insight.title);
    setFormContent(insight.content);
    setFormExcerpt(insight.excerpt || '');
    setFormType(insight.type);
    setFormCategory(insight.category);
    setFormTags(insight.tags?.join(', ') || '');
    setFormError('');
    setIsScheduled(insight.status === 'scheduled');
    setScheduledDate(insight.scheduledFor ? new Date(insight.scheduledFor) : new Date(Date.now() + 86400000));
    setEditModalVisible(true);
  };

  const validateForm = (): boolean => {
    if (formTitle.length < VALIDATION_RULES.INSIGHT_TITLE_MIN) {
      setFormError(t('admin.titleMinLength'));
      return false;
    }
    if (formTitle.length > VALIDATION_RULES.INSIGHT_TITLE_MAX) {
      setFormError(t('admin.titleMaxLength'));
      return false;
    }
    if (formContent.length < VALIDATION_RULES.INSIGHT_CONTENT_MIN) {
      setFormError(t('admin.contentMinLength'));
      return false;
    }
    if (formExcerpt && formExcerpt.length > VALIDATION_RULES.INSIGHT_EXCERPT_MAX) {
      setFormError(t('admin.summaryMaxLength'));
      return false;
    }
    setFormError('');
    return true;
  };

  const handleCreateInsight = async () => {
    if (!validateForm()) return;

    try {
      await createInsight({
        title: formTitle,
        content: formContent,
        excerpt: formExcerpt || undefined,
        type: formType,
        category: formCategory,
        tags: formTags.split(',').map(t => t.trim()).filter(Boolean),
        scheduledFor: isScheduled ? scheduledDate.toISOString() : undefined,
      });
      setCreateModalVisible(false);
      resetForm();
      refresh();
    } catch (err: any) {
      setFormError(err.message || t('admin.failedToCreate'));
    }
  };

  const handleUpdateInsight = async () => {
    if (!selectedInsight) return;
    if (!validateForm()) return;

    try {
      await updateInsight(selectedInsight.id, {
        title: formTitle,
        content: formContent,
        excerpt: formExcerpt || undefined,
        type: formType,
        category: formCategory,
        tags: formTags.split(',').map(t => t.trim()).filter(Boolean),
        scheduledFor: isScheduled ? scheduledDate.toISOString() : undefined,
      });
      setEditModalVisible(false);
      setSelectedInsight(null);
      resetForm();
      refresh();
    } catch (err: any) {
      setFormError(err.message || t('admin.failedToUpdate'));
    }
  };

  const handleInsightPress = (insight: AdminInsight) => {
    setSelectedInsight(insight);
    setShowActionSheet(true);
  };

  const handlePublish = async () => {
    if (!selectedInsight) return;
    try {
      await publishInsight(selectedInsight.id);
      setShowPublishModal(false);
      setSelectedInsight(null);
      setShowActionSheet(false);
      refresh();
    } catch (err: any) {
      console.error('Failed to publish insight:', err);
    }
  };

  const handleFeature = async () => {
    if (!selectedInsight) return;
    const newFeaturedStatus = !selectedInsight.featured;
    try {
      await featureInsight(selectedInsight.id, newFeaturedStatus);
      setSelectedInsight(null);
      setShowActionSheet(false);
      refresh();
    } catch (err: any) {
      console.error('Failed to feature insight:', err);
    }
  };

  const handleDelete = async () => {
    if (!selectedInsight) {
      setFormError(t('admin.noInsightSelected'));
      return;
    }

    try {
      // Use provided reason or default to localized 'Deleted by admin'
      const reason = deleteReason.trim() || t('admin.deletedByAdmin');
      await deleteInsight(selectedInsight.id, reason);
      setShowDeleteModal(false);
      setSelectedInsight(null);
      setDeleteReason('');
      setFormError('');
      refresh();
    } catch (err: any) {
      setFormError(err.message || t('admin.failedToDelete'));
    }
  };

  const renderInsightCard = ({ item }: { item: AdminInsight }) => {
    const statusColor = (STATUS_COLORS as any)[item.status];
    const typeColor = item.type === 'premium' ? '#af52de' : theme.primary.main;

    return (
      <TouchableOpacity
        style={localStyles.insightCard}
        onPress={() => handleInsightPress(item)}
        activeOpacity={0.7}
      >
        <View style={localStyles.insightHeader}>
          <View style={{ flex: 1 }}>
            <View style={localStyles.titleRow}>
              <Text style={localStyles.insightTitle} numberOfLines={2}>
                {item.title}
              </Text>
              {item.featured && (
                <Ionicons name="star" size={20} color="#ff9500" style={{ marginLeft: 8 }} />
              )}
            </View>
            {item.excerpt && (
              <Text style={localStyles.insightExcerpt} numberOfLines={2}>
                {item.excerpt}
              </Text>
            )}
          </View>
        </View>

        <View style={localStyles.insightBadges}>
          {item.type && (
            <View style={[localStyles.badge, { backgroundColor: typeColor + '20' }]}>
              <Ionicons
                name={item.type === 'premium' ? 'star' : 'document-text'}
                size={12}
                color={typeColor}
              />
              <Text style={[localStyles.badgeText, { color: typeColor }]}>
                {t(`type.${item.type}`).toUpperCase()}
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
          {item.category && (
            <View style={[localStyles.badge, { backgroundColor: theme.background.tertiary }]}>
              <Text style={[localStyles.badgeText, { color: theme.text.tertiary }]}>
                {t(`category.${item.category}`)}
              </Text>
            </View>
          )}
          {item.status === 'scheduled' && item.scheduledFor && (
            <View style={[localStyles.badge, { backgroundColor: theme.primary.main + '20' }]}>
              <Ionicons name="time-outline" size={10} color={theme.primary.main} />
              <Text style={[localStyles.badgeText, { color: theme.primary.main }]}>
                {`${t('admin.scheduledFor')}: ${new Date(item.scheduledFor).toLocaleDateString()}`}
              </Text>
            </View>
          )}
        </View>

        <View style={localStyles.insightStats}>
          <View style={localStyles.statItem}>
            <Ionicons name="eye-outline" size={14} color={theme.text.tertiary} />
            <Text style={localStyles.statText}>{item.viewCount || 0}</Text>
          </View>
          <View style={localStyles.statItem}>
            <Ionicons name="heart-outline" size={14} color={theme.text.tertiary} />
            <Text style={localStyles.statText}>{item.likeCount || 0}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderRequestCard = ({ item }: { item: any }) => {
    const statusColor = (STATUS_COLORS as any)[item.status] || theme.text.tertiary;

    return (
      <TouchableOpacity
        style={localStyles.insightCard}
        onPress={() => {
          setSelectedRequest(item);
          setShowModerateModal(true);
        }}
        activeOpacity={0.7}
      >
        <View style={localStyles.insightHeader}>
          <View style={{ flex: 1 }}>
            <Text style={localStyles.insightTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={localStyles.insightExcerpt} numberOfLines={3}>
              {item.details}
            </Text>
          </View>
        </View>

        <View style={localStyles.insightBadges}>
          <View style={[localStyles.badge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[localStyles.badgeText, { color: statusColor }]}>
              {t(`status.${item.status}`).toUpperCase()}
            </Text>
          </View>
          <View style={[localStyles.badge, { backgroundColor: theme.background.tertiary }]}>
            <Text style={localStyles.badgeText}>
              {t('admin.by')}: {item.user?.name || item.user?.email || t('common.unknown')}
            </Text>
          </View>
          <View style={[localStyles.badge, { backgroundColor: theme.background.tertiary }]}>
            <Text style={localStyles.badgeText}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFormModal = (
    visible: boolean,
    onClose: () => void,
    onSubmit: () => void,
    title: string
  ) => (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={localStyles.modalOverlay}>
        <View style={localStyles.modalContainer}>
          <View style={localStyles.modalContent}>
            {/* Modal Header */}
            <View style={[localStyles.modalHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Text style={[localStyles.modalTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{title}</Text>
              <TouchableOpacity
                style={localStyles.modalCloseButton}
                onPress={() => {
                  onClose();
                  setSelectedInsight(null);
                }}
              >
                <Ionicons name="close" size={24} color={theme.text.secondary} />
              </TouchableOpacity>
            </View>

            {formError ? (
              <View style={localStyles.errorBanner}>
                <Ionicons name="alert-circle" size={20} color={theme.error.main} />
                <Text style={localStyles.errorText}>{formError}</Text>
              </View>
            ) : null}

            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
              {/* Basic Information Section */}
              <View style={localStyles.formSection}>
                <View style={localStyles.formGroup}>
                  <Text style={localStyles.label}>{t('admin.insightTitle')} *</Text>
                  <TextInput
                    style={localStyles.formInput}
                    placeholder={t('admin.insightTitlePlaceholder')}
                    placeholderTextColor={theme.text.tertiary}
                    value={formTitle}
                    onChangeText={setFormTitle}
                  />
                </View>

                <View style={localStyles.formGroup}>
                  <Text style={localStyles.label}>{t('admin.insightContent')} *</Text>
                  <TextInput
                    style={[localStyles.formInput, localStyles.textArea, { textAlign: isRTL ? 'right' : 'left' }]}
                    placeholder={t('admin.insightContentPlaceholder')}
                    placeholderTextColor={theme.text.tertiary}
                    value={formContent}
                    onChangeText={setFormContent}
                    multiline
                    numberOfLines={6}
                  />
                </View>

                <View style={localStyles.formGroup}>
                  <Text style={localStyles.label}>{t('admin.insightExcerpt')}</Text>
                  <TextInput
                    style={[localStyles.formInput, localStyles.textArea, { textAlign: isRTL ? 'right' : 'left' }]}
                    placeholder={t('admin.insightExcerptPlaceholder')}
                    placeholderTextColor={theme.text.tertiary}
                    value={formExcerpt}
                    onChangeText={setFormExcerpt}
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </View>

              {/* Divider */}
              <View style={localStyles.divider} />

              {/* Classification Section */}
              <View style={localStyles.formSection}>
                <View style={localStyles.formGroup}>
                  <Text style={localStyles.label}>{t('admin.insightType')} *</Text>
                  <View style={localStyles.typeButtonsRow}>
                    {['free', 'premium'].map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          localStyles.typeButton,
                          formType === type && localStyles.typeButtonActive,
                        ]}
                        onPress={() => setFormType(type as InsightType)}
                      >
                        <Text
                          style={[
                            localStyles.typeButtonText,
                            formType === type && localStyles.typeButtonTextActive,
                          ]}
                        >
                          {t(`type.${type}`)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={localStyles.formGroup}>
                  <Text style={localStyles.label}>{t('admin.insightCategory')} *</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingVertical: 8 }}
                  >
                    {Object.values(INSIGHT_CATEGORIES).map((category) => (
                      <TouchableOpacity
                        key={category}
                        style={[
                          localStyles.categoryChip,
                          formCategory === category && localStyles.categoryChipActive,
                        ]}
                        onPress={() => setFormCategory(category as InsightCategory)}
                      >
                        <Text
                          style={[
                            localStyles.categoryChipText,
                            formCategory === category && localStyles.categoryChipTextActive,
                          ]}
                        >
                          {t(`category.${category}`)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={localStyles.formGroup}>
                  <Text style={localStyles.label}>{t('admin.insightTags')}</Text>
                  <TextInput
                    style={localStyles.formInput}
                    placeholder={t('admin.insightTagsPlaceholder')}
                    placeholderTextColor={theme.text.tertiary}
                    value={formTags}
                    onChangeText={setFormTags}
                  />
                </View>
              </View>

              {/* Divider */}
              <View style={localStyles.divider} />

              {/* Scheduling Section */}
              <View style={localStyles.formSection}>
                <View style={[localStyles.titleRow, { marginBottom: 16 }]}>
                  <Ionicons name="calendar-outline" size={20} color={theme.text.secondary} style={{ marginRight: 8 }} />
                  <Text style={localStyles.sectionLabel}>{t('admin.scheduling')}</Text>
                </View>

                <View style={[localStyles.formGroup, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}>
                  <Text style={localStyles.label}>{t('admin.scheduleInsight')}</Text>
                  <TouchableOpacity
                    onPress={() => setIsScheduled(!isScheduled)}
                    style={[
                      localStyles.statusToggle,
                      isScheduled && localStyles.statusToggleActive
                    ]}
                  >
                    <View style={[
                      localStyles.statusToggleCircle,
                      isScheduled && localStyles.statusToggleCircleActive
                    ]} />
                  </TouchableOpacity>
                </View>

                {isScheduled && (
                  <TouchableOpacity
                    style={localStyles.datePickerButton}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Ionicons name="time-outline" size={20} color={theme.primary.main} />
                    <Text style={localStyles.datePickerButtonText}>
                      {scheduledDate.toLocaleString()}
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={theme.text.tertiary} />
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>

            <TouchableOpacity
              style={localStyles.submitButton}
              onPress={onSubmit}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color={theme.primary.contrast} />
              ) : (
                <Text style={localStyles.submitButtonText}>{title}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={scheduledDate}
          mode="datetime"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={new Date()}
          onChange={(event, date) => {
            if (Platform.OS !== 'ios') {
              setShowDatePicker(false);
            }
            if (date) {
              setScheduledDate(date);
            }
          }}
        />
      )}
    </Modal>
  );

  if (isLoading && insights.length === 0) {
    return <LoadingState type="list" count={5} />;
  }

  const renderHeader = () => (
    <View style={[styles.header, isDesktop && { height: 80, paddingTop: 0 }]}>
      <View style={styles.headerLeft}>
        {!isDesktop && (
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.text.primary} />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>{t('admin.insights')}</Text>
      </View>
      <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
        <Ionicons name="add" size={24} color={theme.primary.contrast} />
      </TouchableOpacity>
    </View>
  );

  const renderMainContent = () => (
    <>
      {/* Main Tabs */}
      <View style={localStyles.mainTabs}>
        <TouchableOpacity
          style={[localStyles.mainTab, mainTab === 'insights' && localStyles.mainTabActive]}
          onPress={() => setMainTab('insights')}
        >
          <Text style={[localStyles.mainTabText, mainTab === 'insights' && localStyles.mainTabTextActive]}>
            {t('admin.insights')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[localStyles.mainTab, mainTab === 'proposals' && localStyles.mainTabActive]}
          onPress={() => setMainTab('proposals')}
        >
          <Text style={[localStyles.mainTabText, mainTab === 'proposals' && localStyles.mainTabTextActive]}>
            {t('admin.insightRequests')}
          </Text>
        </TouchableOpacity>
      </View>

      {mainTab === 'insights' ? (
        <>
          {/* Search Bar & Filters */}
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('admin.searchInsights')}
            loading={isLoading && insights.length > 0}
          />

          {/* Type Filter */}
          <FilterBar
            options={INSIGHT_TYPE_FILTER_OPTIONS.map(opt => ({
              label: t(opt.labelKey),
              value: opt.value as string
            }))}
            selectedValue={selectedTypeFilter}
            onSelect={(val) => handleTypeFilterChange(val as string)}
            label={t('admin.filterByType')}
          />

          {/* Status Filter */}
          <FilterBar
            options={INSIGHT_STATUS_FILTER_OPTIONS.map(opt => ({
              label: t(opt.labelKey),
              value: opt.value as string
            }))}
            selectedValue={selectedStatusFilter}
            onSelect={(val) => handleStatusFilterChange(val as string)}
            label={t('admin.filterByStatus')}
          />

          {error ? (
            <EmptyState
              icon="alert-circle"
              title={t('common.error')}
              message={error}
              actionLabel={t('common.retry')}
              onActionPress={refresh}
            />
          ) : insights.length === 0 ? (
            <EmptyState
              icon="document-text-outline"
              title={t('admin.noInsightsFound')}
              message={t('admin.noInsightsMessage')}
              actionLabel={t('admin.createNewInsight')}
              onActionPress={openCreateModal}
            />
          ) : (
            <FlatList
              data={insights}
              renderItem={renderInsightCard}
              keyExtractor={(item) => item.id}
              contentContainerStyle={[localStyles.listContent, isDesktop && { paddingHorizontal: 32 }]}
              onEndReached={loadMore}
              onEndReachedThreshold={0.5}
              refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} />}
              ListFooterComponent={pagination?.hasMore ? <ActivityIndicator style={{ padding: 20 }} /> : null}
            />
          )}
        </>
      ) : (
        <>
          {/* Proposals List */}
          {requestsError ? (
            <EmptyState
              icon="alert-circle"
              title={t('common.error')}
              message={requestsError}
              actionLabel={t('common.retry')}
              onActionPress={refreshRequests}
            />
          ) : requests.length === 0 ? (
            <EmptyState
              icon="paper-plane-outline"
              title={t('admin.noProposalsFound')}
              message={t('admin.noProposalsMessage')}
            />
          ) : (
            <FlatList
              data={requests}
              renderItem={renderRequestCard}
              keyExtractor={(item) => item.id || item._id}
              contentContainerStyle={[localStyles.listContent, isDesktop && { paddingHorizontal: 32 }]}
              onEndReached={loadMoreRequests}
              onEndReachedThreshold={0.5}
              refreshControl={<RefreshControl refreshing={isRequestsLoading} onRefresh={refreshRequests} />}
              ListFooterComponent={proposalsPagination?.hasMore ? <ActivityIndicator style={{ padding: 20 }} /> : null}
            />
          )}
        </>
      )}
    </>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {isDesktop ? (
        <View style={styles.desktopContentWrapper}>
          <AdminSidebar />
          <View style={styles.desktopMainContent}>
            {renderHeader()}
            <View style={{ flex: 1, paddingVertical: 24 }}>
              {renderMainContent()}
            </View>
          </View>
        </View>
      ) : (
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            <ResponsiveContainer>
              <LinearGradient
                colors={isDark ? [theme.background.primary, '#1a2e1a', '#0a1a0a'] : ['#FFFFFF', '#F8FAF8', '#F1F5F1']}
                style={StyleSheet.absoluteFill}
              />
              {renderHeader()}
              {renderMainContent()}
            </ResponsiveContainer>
          </View>
        </SafeAreaView>
      )}

      <ActionSheet
        visible={showActionSheet}
        onClose={() => {
          setShowActionSheet(false);
          // Don't clear selectedInsight here - let the individual modals handle it
        }}
        title={selectedInsight?.title || t('admin.manageInsight')}
        options={[
          {
            label: t('admin.editInsight'),
            icon: 'create-outline',
            onPress: () => {
              setShowActionSheet(false);
              if (selectedInsight) openEditModal(selectedInsight);
            },
          },
          ...(selectedInsight?.status === 'draft'
            ? [
              {
                label: t('admin.publishInsight'),
                icon: 'globe',
                onPress: () => {
                  setShowActionSheet(false);
                  setShowPublishModal(true);
                },
              },
            ]
            : []),
          {
            label: selectedInsight?.featured ? t('admin.unfeatureInsight') : t('admin.featureInsight'),
            icon: selectedInsight?.featured ? 'star' : 'star-outline',
            onPress: () => handleFeature(),
          },
          {
            label: t('admin.deleteInsight'),
            icon: 'trash-outline',
            onPress: () => {
              setShowActionSheet(false);
              setShowDeleteModal(true);
            },
            destructive: true,
          },
        ]}
      />

      <ConfirmationModal
        visible={showPublishModal}
        onClose={() => {
          setShowPublishModal(false);
          setSelectedInsight(null);
        }}
        onConfirm={handlePublish}
        title={t('admin.publishConfirm')}
        message={t('admin.publishMessage')}
        confirmText={t('admin.publishInsight')}
        cancelText={t('common.cancel')}
        icon="globe"
      />

      <ConfirmationModal
        visible={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteReason('');
          setSelectedInsight(null);
        }}
        onConfirm={handleDelete}
        title={t('admin.deleteConfirm')}
        message={t('admin.deleteMessage')}
        confirmText={t('admin.deleteInsight')}
        cancelText={t('common.cancel')}
        destructive
        icon="trash"
        customContent={
          <View style={localStyles.formGroup}>
            <Text style={localStyles.label}>{t('admin.provideReason')}</Text>
            <TextInput
              style={[localStyles.formInput, localStyles.textArea]}
              placeholder={t('admin.provideReason')}
              placeholderTextColor={theme.text.tertiary}
              value={deleteReason}
              onChangeText={setDeleteReason}
              multiline
              numberOfLines={3}
            />
          </View>
        }
      />

      {/* Create Modal */}
      {renderFormModal(
        createModalVisible,
        () => setCreateModalVisible(false),
        handleCreateInsight,
        t('admin.createInsightTitle')
      )}

      {/* Edit Modal */}
      {renderFormModal(
        editModalVisible,
        () => setEditModalVisible(false),
        handleUpdateInsight,
        t('admin.updateInsightTitle')
      )}

      {/* Proposals Moderation Modal */}
      <Modal
        visible={showModerateModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModerateModal(false)}
      >
        <View style={localStyles.modalOverlay}>
          <View style={localStyles.modalContainer}>
            <View style={localStyles.modalContent}>
              <View style={[localStyles.modalHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text style={[localStyles.modalTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{t('admin.moderateRequest')}</Text>
                <TouchableOpacity onPress={() => setShowModerateModal(false)}>
                  <Ionicons name="close" size={24} color={theme.text.primary} />
                </TouchableOpacity>
              </View>

              {selectedRequest && (
                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, flexGrow: 1 }} showsVerticalScrollIndicator={false}>
                  <Text style={[localStyles.label, { marginBottom: 4 }]}>{t('admin.insightTitle')}</Text>
                  <Text style={[localStyles.modalSubtitle, { marginBottom: 16 }]}>{selectedRequest.title}</Text>

                  <Text style={[localStyles.label, { marginBottom: 4 }]}>{t('admin.insightContent')}</Text>
                  <Text style={[localStyles.modalSubtitle, { marginBottom: 16 }]}>{selectedRequest.details}</Text>

                  <Text style={localStyles.label}>{t('admin.status')}</Text>
                  <View style={localStyles.typeButtonsRow}>
                    {['approved', 'rejected'].map((s) => (
                      <TouchableOpacity
                        key={s}
                        style={[
                          localStyles.typeButton,
                          moderationStatus === s && localStyles.typeButtonActive,
                        ]}
                        onPress={() => setModerationStatus(s as any)}
                      >
                        <Text
                          style={[
                            localStyles.typeButtonText,
                            moderationStatus === s && localStyles.typeButtonTextActive,
                          ]}
                        >
                          {t(`admin.${s}`)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {moderationStatus === 'approved' && (
                    <View style={{ marginTop: 16 }}>
                      <Text style={localStyles.label}>{t('admin.insightType')}</Text>
                      <View style={localStyles.typeButtonsRow}>
                        {[
                          { label: 'Free Insight', value: 'free_insight' },
                          { label: 'Premium Insight', value: 'premium_insight' },
                          { label: 'Free Chat', value: 'free_chat' },
                          { label: 'Premium Chat', value: 'premium_chat' },
                        ].map((opt) => (
                          <TouchableOpacity
                            key={opt.value}
                            style={[
                              localStyles.typeButton,
                              { flex: 0, paddingHorizontal: 12, marginBottom: 8, marginRight: 8 },
                              targetType === opt.value && localStyles.typeButtonActive,
                            ]}
                            onPress={() => setTargetType(opt.value as any)}
                          >
                            <Text
                              style={[
                                localStyles.typeButtonText,
                                targetType === opt.value && localStyles.typeButtonTextActive,
                              ]}
                            >
                              {opt.label}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}

                  {moderationStatus === 'rejected' && (
                    <View style={{ marginTop: 16 }}>
                      <Text style={localStyles.label}>{t('admin.reason')}</Text>
                      <TextInput
                        style={[localStyles.formInput, localStyles.textArea]}
                        placeholder={t('admin.reasonPlaceholder')}
                        value={rejectionReason}
                        onChangeText={setRejectionReason}
                        multiline
                      />
                    </View>
                  )}

                  <TouchableOpacity
                    style={[localStyles.submitButton, { marginTop: 24 }]}
                    onPress={async () => {
                      try {
                        await moderateRequest(selectedRequest.id || selectedRequest._id, {
                          status: moderationStatus,
                          rejectionReason: moderationStatus === 'rejected' ? rejectionReason : undefined,
                          targetType: moderationStatus === 'approved' ? targetType : undefined,
                        });
                        setShowModerateModal(false);
                        setRejectionReason('');
                      } catch (err) {
                        // Error handled in hook
                      }
                    }}
                    disabled={isRequestsLoading}
                  >
                    {isRequestsLoading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={localStyles.submitButtonText}>{t('admin.takeAction')}</Text>
                    )}
                  </TouchableOpacity>
                </ScrollView>
              )}
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const createLocalStyles = (theme: any) => StyleSheet.create({
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  mainTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  mainTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: theme.background.secondary,
    borderWidth: 1,
    borderColor: theme.border.main,
  },
  mainTabActive: {
    backgroundColor: theme.primary.main,
    borderColor: theme.primary.main,
  },
  mainTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text.secondary,
  },
  mainTabTextActive: {
    color: '#FFFFFF',
  },
  modalSubtitle: {
    fontSize: 16,
    color: theme.text.primary,
    lineHeight: 22,
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
  insightCard: {
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    overflow: 'hidden',
    shadowColor: theme.isDark ? '#000' : 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  insightHeader: {
    padding: 16,
    paddingBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.text.primary,
    flex: 1,
  },
  insightExcerpt: {
    fontSize: 14,
    color: theme.text.secondary,
    lineHeight: 20,
  },
  insightBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    marginLeft: 4,
    letterSpacing: 0.3,
  },
  insightStats: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 13,
    color: theme.text.tertiary,
    marginLeft: 4,
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
  typeButtonsRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: theme.background.tertiary,
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeButtonActive: {
    backgroundColor: theme.primary.main,
    borderColor: theme.primary.main,
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text.primary,
  },
  typeButtonTextActive: {
    color: theme.primary.contrast,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: theme.background.tertiary,
    marginRight: 8,
    borderWidth: 1,
    borderColor: theme.border.main,
  },
  categoryChipActive: {
    backgroundColor: theme.primary.main,
    borderColor: theme.primary.main,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.text.primary,
  },
  categoryChipTextActive: {
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
  errorText: {
    flex: 1,
    fontSize: 14,
    color: theme.error.main,
    marginLeft: 8,
  },
  formSection: {
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: theme.border.main,
    marginVertical: 20,
    opacity: 0.3,
  },
  // Modal Styles - Matching AdminUsersScreen
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
    backgroundColor: theme.ui.card,
    borderRadius: 16,
    padding: 24,
    minHeight: 200,
    flexShrink: 1, // Allow content to shrink and scroll
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
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text.primary,
  },
  statusToggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.background.tertiary,
    padding: 2,
  },
  statusToggleActive: {
    backgroundColor: theme.primary.main,
  },
  statusToggleCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.background.primary,
  },
  statusToggleCircleActive: {
    transform: [{ translateX: 20 }],
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.background.secondary,
    borderWidth: 1,
    borderColor: theme.border.main,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 8,
  },
  datePickerButtonText: {
    flex: 1,
    fontSize: 15,
    color: theme.text.primary,
    marginLeft: 10,
  },
});
