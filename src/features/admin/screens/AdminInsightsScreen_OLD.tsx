/**
 * Admin Insights Management Screen
 * Create, edit, and manage insights/content
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { adminStyles } from '../admin.styles';
import { useAdminInsights } from '../hooks';
import {
  INSIGHT_TYPE_FILTER_OPTIONS,
  INSIGHT_STATUS_FILTER_OPTIONS,
  STATUS_COLORS,
  CATEGORY_LABELS,
  INSIGHT_CATEGORIES,
  VALIDATION_RULES,
} from '../admin.constants';
import type { AdminInsight, InsightCategory, InsightType } from '../admin.types';

export const AdminInsightsScreen: React.FC = () => {
  const navigation = useNavigation();
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
  } = useAdminInsights();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<AdminInsight | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formExcerpt, setFormExcerpt] = useState('');
  const [formType, setFormType] = useState<InsightType>('free');
  const [formCategory, setFormCategory] = useState<InsightCategory>('market_analysis');
  const [formTags, setFormTags] = useState('');

  useEffect(() => {
    refresh();
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
    setEditModalVisible(true);
  };

  const validateForm = (): string | null => {
    if (formTitle.length < VALIDATION_RULES.INSIGHT_TITLE_MIN) {
      return `Title must be at least ${VALIDATION_RULES.INSIGHT_TITLE_MIN} characters`;
    }
    if (formTitle.length > VALIDATION_RULES.INSIGHT_TITLE_MAX) {
      return `Title must not exceed ${VALIDATION_RULES.INSIGHT_TITLE_MAX} characters`;
    }
    if (formContent.length < VALIDATION_RULES.INSIGHT_CONTENT_MIN) {
      return `Content must be at least ${VALIDATION_RULES.INSIGHT_CONTENT_MIN} characters`;
    }
    if (formExcerpt && formExcerpt.length > VALIDATION_RULES.INSIGHT_EXCERPT_MAX) {
      return `Excerpt must not exceed ${VALIDATION_RULES.INSIGHT_EXCERPT_MAX} characters`;
    }
    return null;
  };

  const handleCreateInsight = async () => {
    const validationError = validateForm();
    if (validationError) {
      Alert.alert('Validation Error', validationError);
      return;
    }

    try {
      await createInsight({
        title: formTitle,
        content: formContent,
        excerpt: formExcerpt || undefined,
        type: formType,
        category: formCategory,
        tags: formTags.split(',').map(t => t.trim()).filter(Boolean),
      });
      setCreateModalVisible(false);
      resetForm();
      Alert.alert('Success', 'Insight created successfully');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create insight');
    }
  };

  const handleUpdateInsight = async () => {
    if (!selectedInsight) return;

    const validationError = validateForm();
    if (validationError) {
      Alert.alert('Validation Error', validationError);
      return;
    }

    try {
      await updateInsight(selectedInsight.id, {
        title: formTitle,
        content: formContent,
        excerpt: formExcerpt || undefined,
        type: formType,
        category: formCategory,
        tags: formTags.split(',').map(t => t.trim()).filter(Boolean),
      });
      setEditModalVisible(false);
      setSelectedInsight(null);
      resetForm();
      Alert.alert('Success', 'Insight updated successfully');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update insight');
    }
  };

  const handlePublish = async (insight: AdminInsight) => {
    Alert.alert(
      'Publish Insight',
      `Publish "${insight.title}"? This will make it visible to users.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Publish',
          onPress: async () => {
            try {
              await publishInsight(insight.id);
              Alert.alert('Success', 'Insight published successfully');
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to publish insight');
            }
          },
        },
      ]
    );
  };

  const handleFeature = async (insight: AdminInsight) => {
    const newFeaturedStatus = !insight.featured;
    try {
      await featureInsight(insight.id, newFeaturedStatus);
      Alert.alert(
        'Success',
        newFeaturedStatus ? 'Insight featured' : 'Insight unfeatured'
      );
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update featured status');
    }
  };

  const handleDelete = (insight: AdminInsight) => {
    Alert.prompt(
      'Delete Insight',
      `Delete "${insight.title}"? This action cannot be undone.\n\nProvide a reason:`,
      async (reason) => {
        if (!reason?.trim()) {
          Alert.alert('Error', 'Reason is required');
          return;
        }

        try {
          await deleteInsight(insight.id, reason);
          Alert.alert('Success', 'Insight deleted successfully');
        } catch (err: any) {
          Alert.alert('Error', err.message || 'Failed to delete insight');
        }
      }
    );
  };

  const showInsightActions = (insight: AdminInsight) => {
    const actions = [
      { text: 'Edit', onPress: () => openEditModal(insight) },
      insight.status === 'draft' && {
        text: 'Publish',
        onPress: () => handlePublish(insight),
      },
      {
        text: insight.featured ? 'Unfeature' : 'Feature',
        onPress: () => handleFeature(insight),
      },
      { text: 'Delete', onPress: () => handleDelete(insight), style: 'destructive' },
      { text: 'Cancel', style: 'cancel' },
    ].filter(Boolean);

    Alert.alert(`Manage "${insight.title}"`, 'Select an action', actions as any);
  };

  const renderInsightCard = (insight: AdminInsight) => {
    const statusColor = STATUS_COLORS[insight.status];
    const typeColor = insight.type === 'premium' ? '#af52de' : '#007aff';

    return (
      <View key={insight.id} style={adminStyles.card}>
        <View style={adminStyles.cardHeader}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Text style={adminStyles.cardTitle}>{insight.title}</Text>
              {insight.featured && (
                <Ionicons name="star" size={16} color="#ff9500" style={{ marginLeft: 8 }} />
              )}
            </View>
            {insight.excerpt && (
              <Text style={adminStyles.cardSubtitle} numberOfLines={2}>
                {insight.excerpt}
              </Text>
            )}
            <View style={adminStyles.badgeRow}>
              <View style={[adminStyles.badge, { backgroundColor: typeColor + '20' }]}>
                <Text style={[adminStyles.badgeText, { color: typeColor }]}>
                  {insight.type.toUpperCase()}
                </Text>
              </View>
              <View style={[adminStyles.badge, { backgroundColor: statusColor + '20' }]}>
                <Text style={[adminStyles.badgeText, { color: statusColor }]}>
                  {insight.status.toUpperCase()}
                </Text>
              </View>
              <View style={[adminStyles.badge, { backgroundColor: '#f2f2f7' }]}>
                <Text style={[adminStyles.badgeText, { color: '#8e8e93' }]}>
                  {CATEGORY_LABELS[insight.category]}
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="eye-outline" size={14} color="#8e8e93" />
                <Text style={[adminStyles.cardSubtitle, { marginLeft: 4, marginTop: 0 }]}>
                  {insight.viewCount}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="heart-outline" size={14} color="#8e8e93" />
                <Text style={[adminStyles.cardSubtitle, { marginLeft: 4, marginTop: 0 }]}>
                  {insight.likeCount}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={adminStyles.cardMenu}
            onPress={() => showInsightActions(insight)}
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#8e8e93" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderFilterTab = (
    option: { label: string; value: string },
    selected: string,
    onSelect: (value: string) => void
  ) => (
    <TouchableOpacity
      key={option.value}
      style={[
        adminStyles.filterTab,
        selected === option.value && adminStyles.filterTabActive,
      ]}
      onPress={() => onSelect(option.value)}
    >
      <Text
        style={[
          adminStyles.filterTabText,
          selected === option.value && adminStyles.filterTabTextActive,
        ]}
      >
        {option.label}
      </Text>
    </TouchableOpacity>
  );

  const renderFormModal = (
    visible: boolean,
    onClose: () => void,
    onSubmit: () => void,
    title: string
  ) => (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={adminStyles.modalOverlay}>
        <ScrollView style={{ flex: 1 }}>
          <View style={[adminStyles.modalContent, { marginTop: 60 }]}>
            <View style={adminStyles.modalHeader}>
              <Text style={adminStyles.modalTitle}>{title}</Text>
              <TouchableOpacity style={adminStyles.modalCloseButton} onPress={onClose}>
                <Ionicons name="close" size={24} color="#8e8e93" />
              </TouchableOpacity>
            </View>

            <View style={adminStyles.formGroup}>
              <Text style={adminStyles.label}>Title *</Text>
              <TextInput
                style={adminStyles.input}
                placeholder="Enter insight title..."
                placeholderTextColor="#8e8e93"
                value={formTitle}
                onChangeText={setFormTitle}
              />
            </View>

            <View style={adminStyles.formGroup}>
              <Text style={adminStyles.label}>Content *</Text>
              <TextInput
                style={[adminStyles.input, adminStyles.textArea]}
                placeholder="Enter insight content..."
                placeholderTextColor="#8e8e93"
                value={formContent}
                onChangeText={setFormContent}
                multiline
                numberOfLines={6}
              />
            </View>

            <View style={adminStyles.formGroup}>
              <Text style={adminStyles.label}>Excerpt (Optional)</Text>
              <TextInput
                style={[adminStyles.input, adminStyles.textArea]}
                placeholder="Brief summary..."
                placeholderTextColor="#8e8e93"
                value={formExcerpt}
                onChangeText={setFormExcerpt}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={adminStyles.formGroup}>
              <Text style={adminStyles.label}>Type *</Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                {['free', 'premium'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      adminStyles.button,
                      formType === type ? adminStyles.buttonPrimary : adminStyles.buttonSecondary,
                    ]}
                    onPress={() => setFormType(type as InsightType)}
                  >
                    <Text
                      style={[
                        adminStyles.buttonText,
                        formType === type
                          ? adminStyles.buttonTextPrimary
                          : adminStyles.buttonTextSecondary,
                      ]}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={adminStyles.formGroup}>
              <Text style={adminStyles.label}>Category *</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <TouchableOpacity
                    key={key}
                    style={[
                      adminStyles.filterTab,
                      formCategory === key && adminStyles.filterTabActive,
                    ]}
                    onPress={() => setFormCategory(key as InsightCategory)}
                  >
                    <Text
                      style={[
                        adminStyles.filterTabText,
                        formCategory === key && adminStyles.filterTabTextActive,
                      ]}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={adminStyles.formGroup}>
              <Text style={adminStyles.label}>Tags (comma-separated)</Text>
              <TextInput
                style={adminStyles.input}
                placeholder="e.g. stocks, trading, analysis"
                placeholderTextColor="#8e8e93"
                value={formTags}
                onChangeText={setFormTags}
              />
            </View>

            <TouchableOpacity
              style={[adminStyles.button, adminStyles.buttonPrimary]}
              onPress={onSubmit}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={[adminStyles.buttonText, adminStyles.buttonTextPrimary]}>
                  {title}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={adminStyles.safeArea}>
      <View style={adminStyles.container}>
        {/* Header */}
        <View style={adminStyles.header}>
          <View style={adminStyles.headerLeft}>
            <TouchableOpacity style={adminStyles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#007aff" />
            </TouchableOpacity>
            <Text style={adminStyles.headerTitle}>Insights</Text>
          </View>
          <TouchableOpacity style={adminStyles.addButton} onPress={openCreateModal}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={adminStyles.searchContainer}>
          <View style={adminStyles.searchBar}>
            <Ionicons name="search" size={20} color="#8e8e93" style={adminStyles.searchIcon} />
            <TextInput
              style={adminStyles.searchInput}
              placeholder="Search insights..."
              placeholderTextColor="#8e8e93"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Type Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={adminStyles.filterTabs}
          contentContainerStyle={adminStyles.filterTabsContent}
        >
          {INSIGHT_TYPE_FILTER_OPTIONS.map((opt) =>
            renderFilterTab(opt, selectedTypeFilter, handleTypeFilterChange)
          )}
        </ScrollView>

        {/* Status Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[adminStyles.filterTabs, { borderBottomWidth: 1 }]}
          contentContainerStyle={adminStyles.filterTabsContent}
        >
          {INSIGHT_STATUS_FILTER_OPTIONS.map((opt) =>
            renderFilterTab(opt, selectedStatusFilter, handleStatusFilterChange)
          )}
        </ScrollView>

        {/* Insights List */}
        <ScrollView style={adminStyles.content} contentContainerStyle={adminStyles.scrollContent}>
          {isLoading && insights.length === 0 ? (
            <View style={adminStyles.loadingContainer}>
              <ActivityIndicator size="large" color="#007aff" />
              <Text style={adminStyles.loadingText}>Loading insights...</Text>
            </View>
          ) : error && insights.length === 0 ? (
            <View style={adminStyles.errorContainer}>
              <Ionicons name="alert-circle" size={64} color="#ff3b30" />
              <Text style={adminStyles.errorTitle}>Error Loading Insights</Text>
              <Text style={adminStyles.errorMessage}>{error}</Text>
              <TouchableOpacity
                style={[adminStyles.button, adminStyles.buttonPrimary]}
                onPress={refresh}
              >
                <Text style={[adminStyles.buttonText, adminStyles.buttonTextPrimary]}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : insights.length === 0 ? (
            <View style={adminStyles.emptyContainer}>
              <Ionicons
                name="document-text-outline"
                size={64}
                color="#c7c7cc"
                style={adminStyles.emptyIcon}
              />
              <Text style={adminStyles.emptyTitle}>No Insights Found</Text>
              <Text style={adminStyles.emptyMessage}>
                Create your first insight or adjust filters
              </Text>
            </View>
          ) : (
            <>
              {insights.map(renderInsightCard)}
              {pagination && pagination.hasMore && (
                <TouchableOpacity
                  style={adminStyles.loadMoreButton}
                  onPress={loadMore}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#007aff" />
                  ) : (
                    <Text style={adminStyles.loadMoreText}>Load More</Text>
                  )}
                </TouchableOpacity>
              )}
            </>
          )}
        </ScrollView>

        {/* Create Modal */}
        {renderFormModal(
          createModalVisible,
          () => setCreateModalVisible(false),
          handleCreateInsight,
          'Create Insight'
        )}

        {/* Edit Modal */}
        {renderFormModal(
          editModalVisible,
          () => setEditModalVisible(false),
          handleUpdateInsight,
          'Update Insight'
        )}
      </View>
    </SafeAreaView>
  );
};
