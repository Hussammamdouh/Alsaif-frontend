/**
 * AdminDiscountCodesScreen
 * Manage discount codes with usage tracking and analytics
 * Now with theme and language support
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
  ActivityIndicator,
  useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme, useLocalization } from '../../../app/providers';
import { createAdminStyles } from '../admin.styles';
import { useDiscountCodes } from '../hooks';
import {
  FilterBar,
  SearchBar,
  PaginationControls,
  LoadingState,
  EmptyState,
  ActionSheet,
  ConfirmationModal,
  AdminSidebar,
} from '../components';
import { ResponsiveContainer } from '../../../shared/components';

export const AdminDiscountCodesScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { t, isRTL } = useLocalization();
  const styles = useMemo(() => createAdminStyles(theme, isRTL), [theme, isRTL]);
  const localStyles = useMemo(() => createLocalStyles(theme, isRTL), [theme, isRTL]);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const [searchQuery, setSearchQuery] = useState('');
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formCode, setFormCode] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formType, setFormType] = useState<'percentage' | 'fixed_amount' | 'free_trial'>('percentage');
  const [formValue, setFormValue] = useState('');
  const [formTrialDays, setFormTrialDays] = useState('');
  const [formMaxUses, setFormMaxUses] = useState('');
  const [formValidUntil, setFormValidUntil] = useState('');
  const [formApplicableTiers, setFormApplicableTiers] = useState<string[]>([]);
  const [formIsActive, setFormIsActive] = useState(true);
  const [selectedCode, setSelectedCode] = useState<any | null>(null);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [usageStats, setUsageStats] = useState<any>(null);
  const [analyticsStats, setAnalyticsStats] = useState<any>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const EXPIRATION_PRESETS = [
    { label: t('admin.oneMonth'), months: 1 },
    { label: t('admin.threeMonths'), months: 3 },
    { label: t('admin.sixMonths'), months: 6 },
    { label: t('admin.oneYear'), months: 12 },
    { label: t('admin.noExpiry'), months: 0 },
  ];

  const handlePresetSelect = (months: number) => {
    if (months === 0) {
      setFormValidUntil('');
      return;
    }
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    setFormValidUntil(date.toISOString().split('T')[0]);
  };

  const {
    codes,
    loading,
    error,
    page,
    totalPages,
    totalItems,
    isActive,
    type,
    setActiveFilter,
    setTypeFilter,
    goToPage,
    activateCode,
    deactivateCode,
    deleteCode,
    createCode,
    updateCode,
    refresh,
    getCodeUsage,
    getCodeAnalytics,
  } = useDiscountCodes();

  const resetForm = useCallback(() => {
    setFormCode('');
    setFormDescription('');
    setFormType('percentage');
    setFormValue('');
    setFormTrialDays('');
    setFormMaxUses('');
    setFormValidUntil('');
    setFormApplicableTiers([]);
    setFormIsActive(true);
    setSelectedCode(null);
  }, []);

  const openCreateModal = useCallback(() => {
    resetForm();
    setShowFormModal(true);
  }, [resetForm]);

  const openEditModal = useCallback((code: any) => {
    setSelectedCode(code);
    setFormCode(code.code || '');
    setFormDescription(code.description || '');
    setFormType(code.type || 'percentage');
    setFormValue(String(code.value || ''));
    setFormTrialDays(String(code.trialDays || ''));
    setFormMaxUses(String(code.maxUses || ''));
    setFormValidUntil(code.validUntil ? new Date(code.validUntil).toISOString().split('T')[0] : '');
    setFormApplicableTiers(code.applicableTiers || []);
    setFormIsActive(code.isActive !== false);
    setShowFormModal(true);
  }, []);

  const handleDuplicate = useCallback((code: any) => {
    resetForm();
    setFormCode(`${code.code}-COPY`);
    setFormDescription(code.description || '');
    setFormType(code.type || 'percentage');
    setFormValue(String(code.value || ''));
    setFormTrialDays(String(code.trialDays || ''));
    setFormMaxUses(String(code.maxUses || ''));
    setFormValidUntil(code.validUntil ? new Date(code.validUntil).toISOString().split('T')[0] : '');
    setFormApplicableTiers(code.applicableTiers || []);
    setFormIsActive(code.isActive !== false);
    setShowActionSheet(false);
    setShowFormModal(true);
  }, [resetForm]);

  const handleViewUsage = useCallback(async (code: any) => {
    setShowActionSheet(false);
    setIsLoadingDetails(true);
    setShowUsageModal(true);
    try {
      const stats = await getCodeUsage(code._id);
      setUsageStats(stats);
    } catch (error) {
      console.error('Failed to fetch usage:', error);
    } finally {
      setIsLoadingDetails(false);
    }
  }, [getCodeUsage]);

  const handleViewAnalytics = useCallback(async (code: any) => {
    setShowActionSheet(false);
    setIsLoadingDetails(true);
    setShowAnalyticsModal(true);
    try {
      const stats = await getCodeAnalytics(code._id);
      setAnalyticsStats(stats);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoadingDetails(false);
    }
  }, [getCodeAnalytics]);

  const TIERS = ['basic', 'starter', 'premium', 'pro', 'enterprise'];

  const statusOptions = [
    { label: t('common.all'), value: undefined as any },
    { label: t('admin.active'), value: true as any, icon: 'checkmark-circle' },
    { label: t('admin.inactive'), value: false as any, icon: 'close-circle' },
  ];

  const typeOptions = [
    { label: t('common.all'), value: undefined as any },
    { label: t('admin.percentage'), value: 'percentage' as any, icon: 'percent' },
    { label: t('admin.fixedAmount'), value: 'fixed_amount' as any, icon: 'cash' },
    { label: t('admin.freeTrial'), value: 'free_trial' as any, icon: 'gift' },
  ];

  const handleCodePress = (code: any) => {
    setSelectedCode(code);
    setShowActionSheet(true);
  };

  const handleToggleActive = async () => {
    if (selectedCode) {
      try {
        if (selectedCode.isActive) {
          await deactivateCode(selectedCode._id);
        } else {
          await activateCode(selectedCode._id);
        }
        setSelectedCode(null);
        setShowActionSheet(false);
      } catch (error) {
        console.error('Failed to toggle code:', error);
      }
    }
  };

  const handleDelete = async () => {
    if (selectedCode) {
      try {
        await deleteCode(selectedCode._id);
        setSelectedCode(null);
        setShowDeleteModal(false);
      } catch (error) {
        console.error('Failed to delete code:', error);
      }
    }
  };

  const handleSave = async () => {
    if (!formCode || (formType !== 'free_trial' && !formValue) || (formType === 'free_trial' && !formTrialDays)) return;

    setIsSaving(true);
    try {
      const codeData: any = {
        code: formCode,
        description: formDescription,
        type: formType,
        value: formType !== 'free_trial' ? Number(formValue) : undefined,
        trialDays: formType === 'free_trial' ? Number(formTrialDays) : undefined,
        maxUses: formMaxUses ? Number(formMaxUses) : undefined,
        validFrom: new Date().toISOString(),
        validUntil: formValidUntil ? new Date(formValidUntil).toISOString() : undefined,
        applicableTiers: formApplicableTiers,
        isActive: formIsActive,
      };

      if (selectedCode) {
        await updateCode(selectedCode._id, codeData);
      } else {
        await createCode(codeData);
      }

      setShowFormModal(false);
      resetForm();
    } catch (error) {
      console.error('Failed to save code:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleTier = (tier: string) => {
    if (formApplicableTiers.includes(tier)) {
      setFormApplicableTiers(formApplicableTiers.filter(t => t !== tier));
    } else {
      setFormApplicableTiers([...formApplicableTiers, tier]);
    }
  };

  const getTypeColor = (codeType: string) => {
    switch (codeType) {
      case 'percentage':
        return theme.accent.info;
      case 'fixed_amount':
        return theme.success.main;
      case 'free_trial':
        return theme.warning.main;
      default:
        return theme.text.tertiary;
    }
  };

  const getTypeIcon = (codeType: string) => {
    switch (codeType) {
      case 'percentage':
        return 'percent';
      case 'fixed_amount':
        return 'cash';
      case 'free_trial':
        return 'gift';
      default:
        return 'pricetag';
    }
  };

  const formatDiscount = (code: any) => {
    if (code.type === 'percentage') {
      return `${code.value}% OFF`;
    } else if (code.type === 'fixed_amount') {
      return `${code.value} AED OFF`;
    } else {
      return `${code.trialDays} Days Free`;
    }
  };

  const renderCodeItem = ({ item }: { item: any }) => {
    const isExpired = item.validUntil ? new Date(item.validUntil) < new Date() : false;
    const usagePercent = item.maxUses
      ? ((item.usageCount || 0) / item.maxUses) * 100
      : 0;

    return (
      <TouchableOpacity
        style={localStyles.codeItem}
        onPress={() => handleCodePress(item)}
        activeOpacity={0.7}
      >
        <View style={[localStyles.codeHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={[localStyles.codeInfo, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={[localStyles.codeName, { textAlign: isRTL ? 'right' : 'left' }]}>{item.code}</Text>
            <View
              style={[
                localStyles.typeBadge,
                { backgroundColor: `${getTypeColor(item.type)}15`, flexDirection: isRTL ? 'row-reverse' : 'row' },
              ]}
            >
              <Ionicons name={getTypeIcon(item.type) as any} size={12} color={getTypeColor(item.type)} />
              <Text style={[localStyles.typeText, { color: getTypeColor(item.type), [isRTL ? 'marginRight' : 'marginLeft']: 4 }]}>
                {item.type === 'fixed_amount' ? t('admin.fixedAmount') : item.type === 'percentage' ? t('admin.percentage') : t('admin.freeTrial')}
              </Text>
            </View>
          </View>
          <View
            style={[
              localStyles.statusIndicator,
              { backgroundColor: !item.isActive ? theme.text.tertiary : isExpired ? theme.error.main : theme.success.main },
            ]}
          />
        </View>

        {isExpired && (
          <View style={[localStyles.expiredBadge, { backgroundColor: `${theme.error.main}15` }]}>
            <Text style={[localStyles.expiredText, { color: theme.error.main }]}>
              {t('admin.expired').toUpperCase()}
            </Text>
          </View>
        )}

        <Text style={[localStyles.discountValue, { textAlign: isRTL ? 'right' : 'left' }]}>{formatDiscount(item)}</Text>

        {item.description && (
          <Text style={[localStyles.codeDescription, { textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        <View style={[localStyles.codeDetails, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={[localStyles.codeDetail, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Ionicons name="time-outline" size={16} color={theme.text.tertiary} />
            <Text style={[localStyles.codeDetailText, { [isRTL ? 'marginRight' : 'marginLeft']: 6 }]}>
              {item.validUntil
                ? `${t('admin.validUntil')} ${new Date(item.validUntil).toLocaleDateString()}`
                : t('admin.noExpiry')}
            </Text>
          </View>

          {item.maxUses && (
            <View style={[localStyles.codeDetail, { flexDirection: isRTL ? 'row-reverse' : 'row', [isRTL ? 'marginRight' : 'marginLeft']: 16 }]}>
              <Ionicons name="people-outline" size={16} color={theme.text.tertiary} />
              <Text style={[localStyles.codeDetailText, { [isRTL ? 'marginRight' : 'marginLeft']: 6 }]}>
                {item.usageCount || 0}/{item.maxUses} {t('admin.usage')}
              </Text>
            </View>
          )}
        </View>

        {item.maxUses && (
          <View style={localStyles.progressBarContainer}>
            <View
              style={[
                localStyles.progressBar,
                {
                  width: `${Math.min(usagePercent, 100)}%`,
                  backgroundColor: usagePercent >= 90 ? theme.error.main : theme.primary.main,
                },
              ]}
            />
          </View>
        )}

        {item.applicableTiers && item.applicableTiers.length > 0 && (
          <View style={[localStyles.tierTags, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            {item.applicableTiers.map((tier: string, index: number) => (
              <View key={index} style={[localStyles.tierTag, { [isRTL ? 'marginLeft' : 'marginRight']: 8 }]}>
                <Text style={localStyles.tierTagText}>{t(`admin.${tier}`)}</Text>
              </View>
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading && codes.length === 0) {
    return <LoadingState type="list" count={5} />;
  }

  const renderHeader = () => (
    <View style={[styles.header, isDesktop && { backgroundColor: theme.background.secondary, borderBottomColor: theme.ui.border, height: 80, paddingTop: 0, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
      <View style={[styles.headerLeft, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        {!isDesktop && (
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color={theme.text.primary} />
          </TouchableOpacity>
        )}
        <Text style={[styles.headerTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{isDesktop ? t('admin.discountCodesOverview') : t('admin.discountCodes')}</Text>
      </View>
      <TouchableOpacity
        style={localStyles.addButtonHeader}
        onPress={openCreateModal}
        activeOpacity={0.7}
      >
        <Ionicons name="add" size={24} color={theme.primary.contrast} />
      </TouchableOpacity>
    </View>
  );

  const renderMainContent = () => (
    <>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder={t('admin.searchCodes')}
        loading={loading}
      />

      <View style={localStyles.filtersRow}>
        <FilterBar
          options={statusOptions}
          selectedValue={isActive as any}
          onSelect={(value) => setActiveFilter(value as any)}
          label={t('admin.status')}
        />
      </View>

      <View style={localStyles.filtersRow}>
        <FilterBar
          options={typeOptions}
          selectedValue={type as any}
          onSelect={(value) => setTypeFilter(value as any)}
          label={t('admin.codeType')}
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
      ) : codes.length === 0 ? (
        <EmptyState
          icon="pricetag-outline"
          title={t('admin.noDiscountCodes')}
          message={t('admin.noDiscountCodesMessage')}
          actionLabel={t('admin.createCode')}
          onActionPress={openCreateModal}
          iconColor={theme.primary.main}
        />
      ) : (
        <FlatList
          data={codes}
          renderItem={renderCodeItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={localStyles.listContent}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
        />
      )}

      {totalPages > 1 && (
        <PaginationControls
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={20}
          onPageChange={goToPage}
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
            setSelectedCode(null);
          }}
          title={selectedCode?.code || t('admin.codeActions')}
          options={[
            {
              label: selectedCode?.isActive ? t('admin.deactivate') : t('admin.activate'),
              icon: selectedCode?.isActive ? 'close-circle-outline' : 'checkmark-circle-outline',
              onPress: handleToggleActive,
            },
            {
              label: t('admin.editCode'),
              icon: 'create-outline',
              onPress: () => {
                setShowActionSheet(false);
                if (selectedCode) openEditModal(selectedCode);
              },
            },
            {
              label: t('admin.viewAnalytics'),
              icon: 'analytics-outline',
              onPress: () => selectedCode && handleViewAnalytics(selectedCode),
            },
            {
              label: t('admin.viewUsage'),
              icon: 'list-outline',
              onPress: () => selectedCode && handleViewUsage(selectedCode),
            },
            {
              label: t('common.duplicate'),
              icon: 'copy-outline',
              onPress: () => selectedCode && handleDuplicate(selectedCode),
            },
            {
              label: t('common.delete'),
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
          visible={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          title={t('admin.deleteCode')}
          message={t('admin.deleteCodeMessage')}
          confirmText={t('common.delete')}
          destructive
          icon="trash"
        />

        {/* Usage Modal */}
        <Modal
          visible={showUsageModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowUsageModal(false)}
        >
          <View style={[localStyles.modalOverlay, isDesktop && { justifyContent: 'center' }]}>
            <View style={[localStyles.modalContent, isDesktop && localStyles.desktopModalContent]}>
              <View style={[localStyles.modalHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text style={[localStyles.modalTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{t('admin.usageStats')}</Text>
                <TouchableOpacity onPress={() => setShowUsageModal(false)}>
                  <Ionicons name="close" size={24} color={theme.text.primary} />
                </TouchableOpacity>
              </View>
              {isLoadingDetails ? (
                <ActivityIndicator size="large" color={theme.primary.main} />
              ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={[localStyles.statItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <Text style={[localStyles.statLabel, { textAlign: isRTL ? 'right' : 'left' }]}>{t('admin.timesUsed')}</Text>
                    <Text style={[localStyles.statValue, { textAlign: isRTL ? 'left' : 'right' }]}>{usageStats?.usageCount || 0}</Text>
                  </View>
                  <View style={[localStyles.statItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <Text style={[localStyles.statLabel, { textAlign: isRTL ? 'right' : 'left' }]}>{t('admin.revenueGenerated')}</Text>
                    <Text style={[localStyles.statValue, { textAlign: isRTL ? 'left' : 'right' }]}>{usageStats?.totalRevenue || 0} AED</Text>
                  </View>
                  {/* ... other stats if available */}
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>

        {/* Analytics Modal */}
        <Modal
          visible={showAnalyticsModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowAnalyticsModal(false)}
        >
          <View style={[localStyles.modalOverlay, isDesktop && { justifyContent: 'center' }]}>
            <View style={[localStyles.modalContent, isDesktop && localStyles.desktopModalContent]}>
              <View style={[localStyles.modalHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text style={[localStyles.modalTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{t('admin.viewAnalytics')}</Text>
                <TouchableOpacity onPress={() => setShowAnalyticsModal(false)}>
                  <Ionicons name="close" size={24} color={theme.text.primary} />
                </TouchableOpacity>
              </View>
              {isLoadingDetails ? (
                <ActivityIndicator size="large" color={theme.primary.main} />
              ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={[localStyles.statItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <Text style={[localStyles.statLabel, { textAlign: isRTL ? 'right' : 'left' }]}>{t('admin.revenueGenerated')}</Text>
                    <Text style={[localStyles.statValue, { textAlign: isRTL ? 'left' : 'right' }]}>{analyticsStats?.totalRevenue || 0} AED</Text>
                  </View>
                  <View style={[localStyles.statItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <Text style={[localStyles.statLabel, { textAlign: isRTL ? 'right' : 'left' }]}>{t('admin.conversionFunnel')}</Text>
                    <Text style={[localStyles.statValue, { textAlign: isRTL ? 'left' : 'right' }]}>{analyticsStats?.conversionRate || '0'}%</Text>
                  </View>
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>

        {/* Create/Edit Code Modal */}
        <Modal
          visible={showFormModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowFormModal(false)}
        >
          <View style={[localStyles.modalOverlay, isDesktop && { justifyContent: 'center' }]}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={[localStyles.modalContent, isDesktop && localStyles.desktopModalContent]}
            >
              <View style={[localStyles.modalHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text style={[localStyles.modalTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
                  {selectedCode ? t('admin.editCode') : t('admin.createCode')}
                </Text>
                <TouchableOpacity onPress={() => setShowFormModal(false)}>
                  <Ionicons name="close" size={24} color={theme.text.primary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={localStyles.formScroll} showsVerticalScrollIndicator={false}>
                <View style={localStyles.formGroup}>
                  <Text style={[localStyles.label, { textAlign: isRTL ? 'right' : 'left' }]}>{t('admin.codeLabel')} *</Text>
                  <TextInput
                    style={[localStyles.input, { textAlign: isRTL ? 'right' : 'left' }]}
                    value={formCode}
                    onChangeText={setFormCode}
                    placeholder="PROMO2024"
                    placeholderTextColor={theme.text.tertiary}
                    autoCapitalize="characters"
                  />
                </View>

                <View style={localStyles.formGroup}>
                  <Text style={[localStyles.label, { textAlign: isRTL ? 'right' : 'left' }]}>{t('admin.description')}</Text>
                  <TextInput
                    style={[localStyles.input, localStyles.textArea, { textAlign: isRTL ? 'right' : 'left' }]}
                    value={formDescription}
                    onChangeText={setFormDescription}
                    placeholder={t('admin.noDiscountCodesMessage')}
                    placeholderTextColor={theme.text.tertiary}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <View style={localStyles.formGroup}>
                  <Text style={[localStyles.label, { textAlign: isRTL ? 'right' : 'left' }]}>{t('admin.codeType')} *</Text>
                  <View style={[localStyles.typeContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    {(['percentage', 'fixed_amount', 'free_trial'] as const).map((tType) => (
                      <TouchableOpacity
                        key={tType}
                        style={[
                          localStyles.typeChip,
                          formType === tType && localStyles.typeChipActive,
                        ]}
                        onPress={() => setFormType(tType)}
                      >
                        <Text
                          style={[
                            localStyles.typeChipText,
                            formType === tType && localStyles.typeChipTextActive,
                          ]}
                        >
                          {t(`admin.${tType === 'fixed_amount' ? 'fixedAmount' : tType === 'percentage' ? 'percentage' : 'freeTrial'}`)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={[localStyles.row, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  {formType !== 'free_trial' ? (
                    <View style={[localStyles.formGroup, { flex: 1, [isRTL ? 'marginLeft' : 'marginRight']: 8 }]}>
                      <Text style={[localStyles.label, { textAlign: isRTL ? 'right' : 'left' }]}>{t('admin.codeValue')} *</Text>
                      <TextInput
                        style={[localStyles.input, { textAlign: isRTL ? 'right' : 'left' }]}
                        value={formValue}
                        onChangeText={setFormValue}
                        placeholder={formType === 'percentage' ? '20' : '50.00'}
                        placeholderTextColor={theme.text.tertiary}
                        keyboardType="numeric"
                      />
                    </View>
                  ) : (
                    <View style={[localStyles.formGroup, { flex: 1, [isRTL ? 'marginLeft' : 'marginRight']: 8 }]}>
                      <Text style={[localStyles.label, { textAlign: isRTL ? 'right' : 'left' }]}>{t('admin.trialDays')} *</Text>
                      <TextInput
                        style={[localStyles.input, { textAlign: isRTL ? 'right' : 'left' }]}
                        value={formTrialDays}
                        onChangeText={setFormTrialDays}
                        placeholder="7"
                        placeholderTextColor={theme.text.tertiary}
                        keyboardType="numeric"
                      />
                    </View>
                  )}
                  <View style={[localStyles.formGroup, { flex: 1, [isRTL ? 'marginRight' : 'marginLeft']: 8 }]}>
                    <Text style={[localStyles.label, { textAlign: isRTL ? 'right' : 'left' }]}>{t('admin.maxUses')}</Text>
                    <TextInput
                      style={[localStyles.input, { textAlign: isRTL ? 'right' : 'left' }]}
                      value={formMaxUses}
                      onChangeText={setFormMaxUses}
                      placeholder="100"
                      placeholderTextColor={theme.text.tertiary}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={localStyles.formGroup}>
                  <Text style={[localStyles.label, { textAlign: isRTL ? 'right' : 'left' }]}>{t('admin.validUntil')} (YYYY-MM-DD)</Text>
                  <View style={[localStyles.typeContainer, { marginBottom: 12, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    {EXPIRATION_PRESETS.map((preset) => (
                      <TouchableOpacity
                        key={preset.months}
                        style={[localStyles.typeChip, { [isRTL ? 'marginLeft' : 'marginRight']: 8 }]}
                        onPress={() => handlePresetSelect(preset.months)}
                      >
                        <Text style={localStyles.typeChipText}>{preset.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TextInput
                    style={[localStyles.input, { textAlign: isRTL ? 'right' : 'left' }]}
                    value={formValidUntil}
                    onChangeText={setFormValidUntil}
                    placeholder="2024-12-31"
                    placeholderTextColor={theme.text.tertiary}
                  />
                </View>

                <View style={localStyles.formGroup}>
                  <Text style={localStyles.label}>{t('admin.applicableTiers')}</Text>
                  <View style={localStyles.tierContainer}>
                    {TIERS.map((tier) => (
                      <TouchableOpacity
                        key={tier}
                        style={[
                          localStyles.tierChip,
                          formApplicableTiers.includes(tier) && localStyles.tierChipActive,
                        ]}
                        onPress={() => toggleTier(tier)}
                      >
                        <Text
                          style={[
                            localStyles.tierChipText,
                            formApplicableTiers.includes(tier) && localStyles.tierChipTextActive,
                          ]}
                        >
                          {t(`admin.${tier}`)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={localStyles.switchRow}>
                  <Text style={localStyles.label}>{t('admin.active')}</Text>
                  <Switch
                    value={formIsActive}
                    onValueChange={setFormIsActive}
                    trackColor={{ false: theme.border.main, true: theme.primary.main }}
                    thumbColor={Platform.OS === 'ios' ? undefined : theme.background.primary}
                  />
                </View>
              </ScrollView>

              <TouchableOpacity
                style={[localStyles.saveButton, (!formCode || (formType !== 'free_trial' && !formValue) || (formType === 'free_trial' && !formTrialDays)) && localStyles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={isSaving || !formCode}
              >
                {isSaving ? (
                  <ActivityIndicator color={theme.primary.contrast} />
                ) : (
                  <Text style={localStyles.saveButtonText}>{t('admin.saveCode')}</Text>
                )}
              </TouchableOpacity>
            </KeyboardAvoidingView>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const createLocalStyles = (theme: any, isRTL: boolean) => StyleSheet.create({
  addButtonHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  filtersRow: {
    marginBottom: 4,
  },
  listContent: {
    padding: 16,
    paddingBottom: 120, // Increased for Floating Tab Bar safety
  },
  codeItem: {
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
  codeHeader: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  codeInfo: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    gap: 8,
  },
  codeName: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text.primary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    textAlign: isRTL ? 'right' : 'left',
  },
  typeBadge: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  discountValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.primary.main,
    marginBottom: 8,
    textAlign: isRTL ? 'right' : 'left',
  },
  codeDescription: {
    fontSize: 14,
    color: theme.text.secondary,
    marginBottom: 12,
    textAlign: isRTL ? 'right' : 'left',
  },
  codeDetails: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 8,
  },
  codeDetail: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    gap: 6,
  },
  codeDetailText: {
    fontSize: 13,
    color: theme.text.tertiary,
    textAlign: isRTL ? 'right' : 'left',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: theme.border.main,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  tierTags: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  tierTag: {
    backgroundColor: theme.background.tertiary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tierTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.text.tertiary,
    textTransform: 'capitalize',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.background.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    padding: 24,
  },
  modalHeader: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.text.primary,
    textAlign: isRTL ? 'right' : 'left',
  },
  formScroll: {
    flex: 1,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text.secondary,
    marginBottom: 8,
    textAlign: isRTL ? 'right' : 'left',
  },
  input: {
    backgroundColor: theme.background.secondary,
    borderRadius: 12,
    padding: 12,
    color: theme.text.primary,
    fontSize: 16,
    borderWidth: 1,
    borderColor: theme.border.main,
    textAlign: isRTL ? 'right' : 'left',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
  },
  typeContainer: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: theme.background.secondary,
    borderWidth: 1,
    borderColor: theme.border.main,
  },
  typeChipActive: {
    backgroundColor: theme.primary.main,
    borderColor: theme.primary.main,
  },
  typeChipText: {
    fontSize: 12,
    color: theme.text.secondary,
  },
  typeChipTextActive: {
    color: theme.primary.contrast,
    fontWeight: '600',
  },
  tierContainer: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tierChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.background.secondary,
    borderWidth: 1,
    borderColor: theme.border.main,
  },
  tierChipActive: {
    backgroundColor: theme.primary.main,
    borderColor: theme.primary.main,
  },
  tierChipText: {
    fontSize: 13,
    color: theme.text.secondary,
  },
  tierChipTextActive: {
    color: theme.primary.contrast,
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: theme.primary.main,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  saveButtonDisabled: {
    backgroundColor: theme.text.tertiary,
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.primary.contrast,
  },
  expiredBadge: {
    alignSelf: isRTL ? 'flex-end' : 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 8,
  },
  expiredText: {
    fontSize: 10,
    fontWeight: '800',
  },
  statItem: {
    backgroundColor: theme.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 16,
    color: theme.text.secondary,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.primary.main,
  },
  desktopModalContent: {
    width: 600,
    alignSelf: 'center',
    marginVertical: 'auto',
    borderRadius: 24,
    maxHeight: '90%',
  },
});
