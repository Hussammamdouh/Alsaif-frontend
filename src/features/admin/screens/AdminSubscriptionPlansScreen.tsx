/**
 * AdminSubscriptionPlansScreen
 * Manage subscription plans, pricing, and features
 * Now with theme and language support
 */

import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  Switch,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme, useLocalization } from '../../../app/providers';
import { createAdminStyles } from '../admin.styles';
import { useSubscriptionPlans } from '../hooks';
import {
  LoadingState,
  EmptyState,
  ActionSheet,
  ConfirmationModal,
  AdminSidebar,
} from '../components';
import { ResponsiveContainer } from '../../../shared/components';

export const AdminSubscriptionPlansScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { t } = useLocalization();
  const styles = useMemo(() => createAdminStyles(theme), [theme]);
  const localStyles = useMemo(() => createLocalStyles(theme), [theme]);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formBillingCycle, setFormBillingCycle] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [formTier, setFormTier] = useState<'basic' | 'starter' | 'premium' | 'pro' | 'enterprise'>('premium');
  const [formFeatures, setFormFeatures] = useState<Array<{ name: string; included: boolean }>>([]);
  const [newFeature, setNewFeature] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formCurrency, setFormCurrency] = useState('AED');

  const {
    plans,
    loading,
    error,
    togglePlanActive,
    deletePlan,
    createPlan,
    updatePlan,
    refresh,
  } = useSubscriptionPlans();
  const resetForm = () => {
    setFormName('');
    setFormDescription('');
    setFormPrice('');
    setFormBillingCycle('monthly');
    setFormTier('premium');
    setFormFeatures([]);
    setNewFeature('');
    setFormIsActive(true);
    setFormIsFeatured(false);
    setFormCurrency('AED');
    setSelectedPlan(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowFormModal(true);
  };

  const openEditModal = (plan: any) => {
    setSelectedPlan(plan);
    setFormName(plan.name || '');
    setFormDescription(plan.description || '');
    setFormPrice(String(plan.price || ''));
    setFormBillingCycle(plan.billingCycle || 'monthly');
    setFormTier(plan.tier || 'premium');
    setFormFeatures(
      plan.features?.map((f: any) =>
        typeof f === 'string' ? { name: f, included: true } : f
      ) || []
    );
    setFormIsActive(plan.isActive !== false);
    setFormIsFeatured(plan.isFeatured === true);
    setFormCurrency(plan.currency || 'AED');
    setShowFormModal(true);
  };

  const handleSave = async () => {
    if (!formName || !formPrice) return;

    setIsSaving(true);
    try {
      const planData: any = {
        name: formName,
        description: formDescription,
        price: Number(formPrice),
        billingCycle: formBillingCycle,
        tier: formTier,
        features: formFeatures,
        isActive: formIsActive,
        isFeatured: formIsFeatured,
        currency: formCurrency,
      };

      if (selectedPlan) {
        await updatePlan(selectedPlan._id, planData);
      } else {
        await createPlan(planData);
      }

      setShowFormModal(false);
      resetForm();
    } catch (error) {
      console.error('Failed to save plan:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormFeatures([...formFeatures, { name: newFeature.trim(), included: true }]);
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormFeatures(formFeatures.filter((_, i) => i !== index));
  };

  const handlePlanPress = (plan: any) => {
    setSelectedPlan(plan);
    setShowActionSheet(true);
  };

  const handleToggleActive = async () => {
    if (selectedPlan) {
      try {
        await togglePlanActive(selectedPlan._id, selectedPlan.isActive);
        setSelectedPlan(null);
      } catch (error) {
        console.error('Failed to toggle plan:', error);
      }
    }
  };

  const handleDelete = async () => {
    if (selectedPlan) {
      try {
        await deletePlan(selectedPlan._id);
        setSelectedPlan(null);
        setShowDeleteModal(false);
      } catch (error) {
        console.error('Failed to delete plan:', error);
      }
    }
  };

  const renderPlanItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={localStyles.planCard}
      onPress={() => handlePlanPress(item)}
      activeOpacity={0.7}
    >
      <View style={localStyles.planHeader}>
        <View style={{ flex: 1 }}>
          <Text style={localStyles.planName}>{item.name}</Text>
          <Text style={localStyles.planPrice}>
            {item.currency || 'USD'} {item.price}/{item.billingCycle || item.interval}
          </Text>
        </View>
        <View
          style={[
            localStyles.statusIndicator,
            { backgroundColor: item.isActive ? theme.success.main : theme.text.tertiary },
          ]}
        />
      </View>

      {item.description && (
        <Text style={localStyles.planDescription}>{item.description}</Text>
      )}

      <View style={localStyles.planStats}>
        <View style={localStyles.planStat}>
          <Ionicons name="people-outline" size={16} color={theme.text.tertiary} />
          <Text style={localStyles.planStatText}>
            {item.subscriberCount || 0} subscribers
          </Text>
        </View>
        <View style={localStyles.planStat}>
          <Ionicons name="cash-outline" size={16} color={theme.text.tertiary} />
          <Text style={localStyles.planStatText}>
            ${item.revenue || 0} MRR
          </Text>
        </View>
      </View>

      {item.features && item.features.length > 0 && (
        <View style={localStyles.featuresContainer}>
          {item.features.slice(0, 3).map((feature: any, index: number) => (
            <View key={index} style={localStyles.featureItem}>
              <Ionicons name="checkmark-circle" size={14} color={theme.success.main} />
              <Text style={localStyles.featureText}>
                {typeof feature === 'string' ? feature : feature.name}
              </Text>
            </View>
          ))}
          {item.features.length > 3 && (
            <Text style={localStyles.moreFeatures}>
              +{item.features.length - 3} more features
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading && plans.length === 0) {
    return <LoadingState type="list" count={3} />;
  }

  const renderHeader = () => (
    <View style={[styles.header, isDesktop && { backgroundColor: theme.background.secondary, borderBottomColor: theme.ui.border, height: 80, paddingTop: 0 }]}>
      <View style={styles.headerLeft}>
        {!isDesktop && (
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.text.primary} />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>{isDesktop ? t('admin.subscriptionPlansOverview') : t('admin.subscriptionPlans')}</Text>
      </View>
      <TouchableOpacity
        style={localStyles.addButton}
        onPress={openCreateModal}
        activeOpacity={0.7}
      >
        <Ionicons name="add" size={24} color={theme.primary.contrast} />
      </TouchableOpacity>
    </View>
  );

  const renderMainContent = () => (
    <>
      {error ? (
        <EmptyState
          icon="alert-circle"
          title={t('common.error')}
          message={error}
          actionLabel={t('common.retry')}
          onActionPress={refresh}
          iconColor={theme.error.main}
        />
      ) : plans.length === 0 ? (
        <EmptyState
          icon="card-outline"
          title={t('admin.noSubscriptionPlans')}
          message={t('admin.noSubscriptionPlansMessage')}
          actionLabel={t('admin.createPlan')}
          onActionPress={openCreateModal}
          iconColor={theme.primary.main}
        />
      ) : (
        <FlatList
          data={plans}
          renderItem={renderPlanItem}
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background.primary }]}>
      <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
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
            setSelectedPlan(null);
          }}
          title={selectedPlan?.name || t('admin.planActions')}
          options={[
            {
              label: selectedPlan?.isActive ? t('admin.deactivate') : t('admin.activate'),
              icon: selectedPlan?.isActive ? 'close-circle-outline' : 'checkmark-circle-outline',
              onPress: handleToggleActive,
            },
            {
              label: t('admin.editPlan'),
              icon: 'create-outline',
              onPress: () => {
                setShowActionSheet(false);
                if (selectedPlan) openEditModal(selectedPlan);
              },
            },
            {
              label: t('admin.viewSubscribers'),
              icon: 'people-outline',
              onPress: () => setShowActionSheet(false),
            },
            {
              label: t('common.duplicate'),
              icon: 'copy-outline',
              onPress: () => setShowActionSheet(false),
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
          title={t('admin.deletePlan')}
          message={t('admin.deletePlanMessage')}
          confirmText={t('common.delete')}
          cancelText={t('common.cancel')}
          destructive
          icon="trash"
        />

        {/* Plan Form Modal */}
        <Modal
          visible={showFormModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowFormModal(false)}
        >
          <View style={localStyles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={[localStyles.modalContent, isDesktop && localStyles.desktopModalContent]}
            >
              <View style={localStyles.modalHeader}>
                <Text style={localStyles.modalTitle}>
                  {selectedPlan ? t('admin.editPlan') : t('admin.createPlan')}
                </Text>
                <TouchableOpacity onPress={() => setShowFormModal(false)}>
                  <Ionicons name="close" size={24} color={theme.text.primary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={localStyles.formScroll} showsVerticalScrollIndicator={false}>
                <View style={localStyles.formGroup}>
                  <Text style={localStyles.label}>{t('admin.planName')} *</Text>
                  <TextInput
                    style={localStyles.input}
                    value={formName}
                    onChangeText={setFormName}
                    placeholder={t('admin.planName')}
                    placeholderTextColor={theme.text.tertiary}
                  />
                </View>

                <View style={localStyles.formGroup}>
                  <Text style={localStyles.label}>{t('admin.description')}</Text>
                  <TextInput
                    style={[localStyles.input, localStyles.textArea]}
                    value={formDescription}
                    onChangeText={setFormDescription}
                    placeholder={t('admin.description')}
                    placeholderTextColor={theme.text.tertiary}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <View style={localStyles.row}>
                  <View style={[localStyles.formGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={localStyles.label}>{t('admin.planPrice')} *</Text>
                    <TextInput
                      style={localStyles.input}
                      value={formPrice}
                      onChangeText={setFormPrice}
                      placeholder="0.00"
                      placeholderTextColor={theme.text.tertiary}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={[localStyles.formGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={localStyles.label}>{t('admin.billingCycle')} *</Text>
                    <View style={localStyles.cycleContainer}>
                      {(['monthly', 'quarterly', 'yearly'] as const).map((cycle) => (
                        <TouchableOpacity
                          key={cycle}
                          style={[
                            localStyles.cycleChip,
                            formBillingCycle === cycle && localStyles.cycleChipActive,
                          ]}
                          onPress={() => setFormBillingCycle(cycle)}
                        >
                          <Text
                            style={[
                              localStyles.cycleChipText,
                              formBillingCycle === cycle && localStyles.cycleChipTextActive,
                            ]}
                          >
                            {t(`admin.${cycle === 'monthly' ? 'monthly' : cycle === 'quarterly' ? 'quarterly' : 'yearly'}`)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                <View style={localStyles.formGroup}>
                  <Text style={localStyles.label}>{t('admin.planTier')} *</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={localStyles.tierScroll}>
                    {(['basic', 'starter', 'premium', 'pro', 'enterprise'] as const).map((tier) => (
                      <TouchableOpacity
                        key={tier}
                        style={[
                          localStyles.tierChip,
                          formTier === tier && localStyles.tierChipActive,
                        ]}
                        onPress={() => setFormTier(tier)}
                      >
                        <Text
                          style={[
                            localStyles.tierChipText,
                            formTier === tier && localStyles.tierChipTextActive,
                          ]}
                        >
                          {t(`admin.${tier}`)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={localStyles.row}>
                  <View style={[localStyles.formGroup, { flex: 1 }]}>
                    <Text style={localStyles.label}>{t('admin.currency')} *</Text>
                    <TextInput
                      style={localStyles.input}
                      value={formCurrency}
                      onChangeText={setFormCurrency}
                      placeholder="AED or USD"
                      placeholderTextColor={theme.text.tertiary}
                      autoCapitalize="characters"
                    />
                  </View>
                </View>

                {selectedPlan && (selectedPlan.stripeProductId || selectedPlan.stripePriceId) && (
                  <View style={localStyles.stripeIdsContainer}>
                    <Ionicons name="sync-outline" size={16} color={theme.primary.main} style={{ marginRight: 8 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={localStyles.stripeSyncTitle}>Stripe Synchronization</Text>
                      {selectedPlan.stripeProductId && (
                        <View style={localStyles.stripeIdRow}>
                          <Text style={localStyles.stripeIdLabel}>{t('admin.stripeProductId')}:</Text>
                          <Text style={localStyles.stripeIdValue} numberOfLines={1}>{selectedPlan.stripeProductId}</Text>
                        </View>
                      )}
                      {selectedPlan.stripePriceId && (
                        <View style={localStyles.stripeIdRow}>
                          <Text style={localStyles.stripeIdLabel}>{t('admin.stripePriceId')}:</Text>
                          <Text style={localStyles.stripeIdValue} numberOfLines={1}>{selectedPlan.stripePriceId}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}

                <View style={localStyles.formGroup}>
                  <Text style={localStyles.label}>{t('admin.features')}</Text>
                  <View style={localStyles.featureInputRow}>
                    <TextInput
                      style={[localStyles.input, { flex: 1, marginBottom: 0 }]}
                      value={newFeature}
                      onChangeText={setNewFeature}
                      placeholder={t('admin.addFeature')}
                      placeholderTextColor={theme.text.tertiary}
                    />
                    <TouchableOpacity style={localStyles.addFeatureButton} onPress={addFeature}>
                      <Ionicons name="add" size={24} color={theme.primary.contrast} />
                    </TouchableOpacity>
                  </View>
                  <View style={localStyles.formFeaturesList}>
                    {formFeatures.map((feature, index) => (
                      <View key={index} style={localStyles.formFeatureItem}>
                        <Ionicons name="checkmark-circle" size={16} color={theme.success.main} />
                        <Text style={localStyles.formFeatureText}>{feature.name}</Text>
                        <TouchableOpacity onPress={() => removeFeature(index)}>
                          <Ionicons name="trash-outline" size={16} color={theme.error.main} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={localStyles.switchRow}>
                  <Text style={localStyles.label}>{t('admin.isFeatured')}</Text>
                  <Switch
                    value={formIsFeatured}
                    onValueChange={setFormIsFeatured}
                    trackColor={{ false: theme.border.main, true: theme.primary.main }}
                    thumbColor={Platform.OS === 'ios' ? undefined : theme.background.primary}
                  />
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
                style={[localStyles.saveButton, (!formName || !formPrice) && localStyles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={isSaving || !formName || !formPrice}
              >
                {isSaving ? (
                  <ActivityIndicator color={theme.primary.contrast} />
                ) : (
                  <Text style={localStyles.saveButtonText}>{t('admin.savePlan')}</Text>
                )}
              </TouchableOpacity>
            </KeyboardAvoidingView>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const createLocalStyles = (theme: any) => StyleSheet.create({
  planCard: {
    backgroundColor: theme.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: theme.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text.primary,
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.primary.main,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  planDescription: {
    fontSize: 14,
    color: theme.text.secondary,
    marginBottom: 12,
  },
  planStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.main,
  },
  planStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  planStatText: {
    fontSize: 13,
    color: theme.text.tertiary,
  },
  featuresContainer: {
    marginTop: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  featureText: {
    fontSize: 13,
    color: theme.text.secondary,
  },
  moreFeatures: {
    fontSize: 12,
    color: theme.text.tertiary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  addButton: {
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
  desktopModalContent: {
    width: 700,
    alignSelf: 'center',
    marginVertical: 40,
    borderRadius: 24,
    minHeight: 'auto',
    maxHeight: '90%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.background.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: '80%',
    maxHeight: '90%',
    padding: 24,
    flexShrink: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.text.primary,
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
  },
  input: {
    backgroundColor: theme.background.secondary,
    borderRadius: 12,
    padding: 12,
    color: theme.text.primary,
    fontSize: 16,
    borderWidth: 1,
    borderColor: theme.border.main,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  cycleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cycleChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: theme.background.secondary,
    borderWidth: 1,
    borderColor: theme.border.main,
  },
  cycleChipActive: {
    backgroundColor: theme.primary.main,
    borderColor: theme.primary.main,
  },
  cycleChipText: {
    fontSize: 12,
    color: theme.text.secondary,
  },
  cycleChipTextActive: {
    color: theme.primary.contrast,
    fontWeight: '600',
  },
  tierScroll: {
    flexDirection: 'row',
  },
  tierChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.background.secondary,
    borderWidth: 1,
    borderColor: theme.border.main,
    marginRight: 8,
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
  featureInputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  addFeatureButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formFeaturesList: {
    marginTop: 12,
  },
  formFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: theme.background.secondary,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  formFeatureText: {
    flex: 1,
    fontSize: 14,
    color: theme.text.primary,
  },
  switchRow: {
    flexDirection: 'row',
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
  stripeIdsContainer: {
    backgroundColor: theme.background.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.border.main,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stripeSyncTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.primary.main,
    marginBottom: 8,
  },
  stripeIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  stripeIdLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.text.secondary,
    width: 100,
  },
  stripeIdValue: {
    flex: 1,
    fontSize: 12,
    color: theme.text.primary,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});
