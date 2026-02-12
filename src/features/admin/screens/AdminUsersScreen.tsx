/**
 * Admin Users Management Screen
 * Manage users, roles, and permissions
 * Redesigned with full CRUD operations and proper translations
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
  StyleSheet,
  RefreshControl,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { createAdminStyles } from '../admin.styles';
import { AdminSidebar } from '../components/AdminSidebar';
import { useAdminUsers } from '../hooks';
import {
  STATUS_COLORS,
  ROLE_COLORS,
  TIER_COLORS,
  USER_ROLES,
} from '../admin.constants';
import type { AdminUser, UserRole } from '../admin.types';
import { useTheme, useLocalization } from '../../../app/providers';
import {
  LoadingState,
  EmptyState,
  ActionSheet,
  ConfirmationModal,
  SearchBar,
  FilterBar,
} from '../components';
import {
  createUser as createUserAPI,
  updateUser as updateUserAPI,
  deleteUser as deleteUserAPI,
  exportUsers as exportUsersAPI,
} from '../../../core/services/admin/adminService';
import { Alert, Linking } from 'react-native';
import { loadAuthSession } from '../../../app/auth/auth.storage';
import { getApiBaseUrl } from '../../../core/config/env';
import { ResponsiveContainer } from '../../../shared/components';

export const AdminUsersScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { t, isRTL } = useLocalization();
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;
  const styles = useMemo(() => createAdminStyles(theme, isRTL), [theme, isRTL]);
  const localStyles = useMemo(() => createLocalStyles(theme, isRTL), [theme, isRTL]);

  const {
    users,
    pagination,
    filters,
    isLoading,
    isUpdating,
    error,
    setFilters,
    loadMore,
    refresh,
    suspendUser,
    changeUserRole,
    toggleInsightBan,
  } = useAdminUsers();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('');
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Form states for create/edit
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('user');
  const [formNationality, setFormNationality] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter options without superadmin
  const FILTER_OPTIONS = [
    { label: 'All Users', value: '', labelKey: 'admin.allUsers' },
    { label: 'Users Only', value: 'user', labelKey: 'admin.usersOnly' },
    { label: 'Admins', value: 'admin', labelKey: 'admin.admins' },
  ];


  // Filter out superadmin users
  const filteredUsers = useMemo(() => {
    return users.filter(user => user.role !== 'superadmin');
  }, [users]);

  // Search handling with debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== filters.search) {
        setFilters({ ...filters, search: searchQuery });
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (filter: string | number | boolean) => {
    const roleValue = filter as string;
    setSelectedFilter(roleValue);
    setFilters({ ...filters, role: roleValue === '' ? undefined : (roleValue as any) });
  };

  const handleStatusFilterChange = (isActive: boolean | undefined) => {
    setFilters({ ...filters, isActive });
    setShowStatusFilter(false);
  };

  const handleUserPress = (user: AdminUser) => {
    setSelectedUser(user);
    setShowActionSheet(true);
  };

  const handleSuspend = async () => {
    if (!selectedUser) return;
    try {
      await suspendUser({ userId: selectedUser.id, reason: 'Suspended by admin' });
      setSelectedUser(null);
      setShowSuspendModal(false);
      refresh();
    } catch (error: any) {
      console.error('Failed to suspend user:', error);
      setFormError(error.message || 'Failed to suspend user');
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) {
      console.log('handleDelete: No selected user');
      return;
    }

    console.log('handleDelete: Deleting user', selectedUser.id);

    try {
      setIsSubmitting(true);
      await deleteUserAPI(selectedUser.id, 'Deleted by admin');
      console.log('handleDelete: User deleted successfully');
      setShowDeleteModal(false);
      setSelectedUser(null);
      setFormError('');
      refresh();
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      setFormError(error.message || 'Failed to delete user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportUsers = async () => {
    try {
      const baseUrl = getApiBaseUrl();
      const session = await loadAuthSession();
      if (!session) throw new Error('No session available');

      const url = `${baseUrl}/api/export/users?token=${session.tokens.accessToken}`;

      Alert.alert(
        'Export Users',
        'Your user list is being prepared. Would you like to download it?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Download',
            onPress: async () => {
              const supported = await Linking.canOpenURL(url);
              if (supported) {
                await Linking.openURL(url);
              } else {
                Alert.alert('Error', 'Cannot open download link');
              }
            }
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Export Failed', error.message || 'Failed to export users');
    }
  };

  const openCreateModal = () => {
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setFormRole('user');
    setFormNationality('');
    setFormError('');
    setShowCreateModal(true);
  };

  const openEditModal = () => {
    if (!selectedUser) return;

    setFormName(selectedUser.name);
    setFormEmail(selectedUser.email);
    setFormPassword('');
    setFormRole(selectedUser.role);
    setFormError('');
    setShowActionSheet(false);
    setShowEditModal(true);
  };

  const handleCreateUser = async () => {
    // Validation
    if (!formName.trim()) {
      setFormError(t('admin.nameRequired'));
      return;
    }
    if (!formEmail.trim()) {
      setFormError(t('admin.emailRequired'));
      return;
    }
    if (!formPassword.trim()) {
      setFormError(t('admin.passwordRequired'));
      return;
    }
    if (formPassword.length < 6) {
      setFormError(t('admin.passwordMinLength'));
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError('');

      await createUserAPI({
        name: formName,
        email: formEmail,
        password: formPassword,
        role: formRole,
        nationality: formNationality,
      });

      setShowCreateModal(false);
      setFormName('');
      setFormEmail('');
      setFormPassword('');
      setFormRole('user');
      refresh();
    } catch (error: any) {
      console.error('Failed to create user:', error);
      setFormError(error.message || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) {
      console.log('handleUpdateUser: No selected user');
      return;
    }

    console.log('handleUpdateUser: Updating user', selectedUser.id);

    // Validation
    if (!formName.trim()) {
      setFormError(t('admin.nameRequired'));
      return;
    }
    if (!formEmail.trim()) {
      setFormError(t('admin.emailRequired'));
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError('');

      console.log('handleUpdateUser: Calling API with data', {
        name: formName,
        email: formEmail,
        role: formRole,
      });

      // Update user details
      await updateUserAPI(selectedUser.id, {
        name: formName,
        email: formEmail,
        role: formRole,
        nationality: formNationality,
      });

      console.log('handleUpdateUser: User updated successfully');
      setShowEditModal(false);
      setSelectedUser(null);
      setFormName('');
      setFormEmail('');
      setFormRole('user');
      setFormNationality('');
      refresh();
    } catch (error: any) {
      console.error('Failed to update user:', error);
      setFormError(error.message || 'Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return 'checkmark-circle';
      case 'suspended':
        return 'ban';
      case 'pending':
        return 'time';
      default:
        return 'help-circle';
    }
  };

  const renderUserItem = ({ item }: { item: AdminUser }) => (
    <TouchableOpacity
      style={localStyles.userCard}
      onPress={() => handleUserPress(item)}
      activeOpacity={0.7}
    >
      <View style={localStyles.userHeader}>
        <View style={localStyles.userAvatar}>
          <Ionicons name="person" size={24} color={theme.text.tertiary} />
        </View>
        <View style={localStyles.userInfo}>
          <Text style={localStyles.userName}>{item.name}</Text>
          <Text style={localStyles.userEmail}>{item.email}</Text>
        </View>
        <Ionicons
          name={getStatusIcon(item.status)}
          size={20}
          color={STATUS_COLORS[item.status] || theme.text.tertiary}
        />
      </View>

      <View style={localStyles.userBadges}>
        {item.role && (
          <View style={[localStyles.badge, { backgroundColor: ROLE_COLORS[item.role] + '20' }]}>
            <Ionicons
              name={item.role === 'admin' ? 'shield' : 'person'}
              size={12}
              color={ROLE_COLORS[item.role]}
            />
            <Text style={[localStyles.badgeText, { color: ROLE_COLORS[item.role] }]}>
              {t(`role.${item.role}`).toUpperCase()}
            </Text>
          </View>
        )}
        {item.tier && (
          <View style={[localStyles.badge, { backgroundColor: TIER_COLORS[item.tier] + '20' }]}>
            <Ionicons
              name={item.tier === 'premium' ? 'star' : 'person-outline'}
              size={12}
              color={TIER_COLORS[item.tier]}
            />
            <Text style={[localStyles.badgeText, { color: TIER_COLORS[item.tier] }]}>
              {t(`tier.${item.tier}`).toUpperCase()}
            </Text>
          </View>
        )}
        {item.status && (
          <View style={[localStyles.badge, { backgroundColor: STATUS_COLORS[item.status] + '20' }]}>
            <Text style={[localStyles.badgeText, { color: STATUS_COLORS[item.status] }]}>
              {t(`status.${item.status}`).toUpperCase()}
            </Text>
          </View>
        )}
        {item.isBannedFromInsights && (
          <View style={[localStyles.badge, { backgroundColor: theme.error.main + '20' }]}>
            <Ionicons name="close-circle" size={12} color={theme.error.main} />
            <Text style={[localStyles.badgeText, { color: theme.error.main }]}>
              {t('admin.banned').toUpperCase()}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderRoleOption = (roleValue: UserRole, label: string) => {
    const isSelected = formRole === roleValue;

    return (
      <TouchableOpacity
        key={roleValue}
        style={[
          localStyles.roleChip,
          isSelected && localStyles.roleChipActive,
        ]}
        onPress={() => setFormRole(roleValue)}
      >
        <Text
          style={[
            localStyles.roleChipText,
            isSelected && localStyles.roleChipTextActive,
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={[styles.header, isDesktop && { height: 80, paddingTop: 0, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
      <View style={[styles.headerLeft, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        {!isDesktop && (
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color={theme.text.primary} />
          </TouchableOpacity>
        )}
        <Text style={[styles.headerTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{t('admin.users')}</Text>
      </View>
      <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={openCreateModal} style={{ [isRTL ? 'marginLeft' : 'marginRight']: 16 }}>
          <Ionicons name="person-add" size={24} color={theme.primary.main} />
        </TouchableOpacity>
        <TouchableOpacity onPress={refresh} style={{ [isRTL ? 'marginLeft' : 'marginRight']: 16 }}>
          <Ionicons name="refresh" size={24} color={theme.primary.main} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleExportUsers}>
          <Ionicons name="cloud-download-outline" size={24} color={theme.primary.main} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderUsersList = () => (
    <>
      {/* Search Bar & Advanced Filters */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder={t('admin.searchUsers')}
        onFilterPress={() => setShowStatusFilter(true)}
        loading={isLoading && users.length > 0}
      />

      {/* Role Filters */}
      <FilterBar
        options={FILTER_OPTIONS.map(opt => ({
          label: t(opt.labelKey),
          value: opt.value,
          icon: opt.value === 'admin' ? 'shield-outline' : 'people-outline'
        }))}
        selectedValue={selectedFilter}
        onSelect={handleFilterChange}
        label={t('admin.filterByRole')}
      />

      {error ? (
        <EmptyState
          icon="alert-circle"
          title={t('common.error')}
          message={error}
          actionLabel={t('common.retry')}
          onActionPress={refresh}
          iconColor={theme.error.main}
        />
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title={t('admin.noUsersFound')}
          message={t('admin.noUsersMessage')}
          actionLabel=""
          onActionPress={() => { }}
          iconColor={theme.text.tertiary}
        />
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[localStyles.listContent, isDesktop && { paddingHorizontal: 32 }]}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refresh} />}
          ListFooterComponent={
            pagination?.hasMore ? (
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

  if (isLoading && filteredUsers.length === 0) {
    return <LoadingState type="list" count={5} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      {isDesktop ? (
        <View style={styles.desktopContentWrapper}>
          <AdminSidebar />
          <View style={styles.desktopMainContent}>
            {renderHeader()}
            <View style={{ flex: 1, padding: 32 }}>
              {renderUsersList()}
            </View>
          </View>
        </View>
      ) : (
        <SafeAreaView style={styles.safeArea}>
          {renderHeader()}
          <ResponsiveContainer style={{ flex: 1 }}>
            {renderUsersList()}
          </ResponsiveContainer>
        </SafeAreaView>
      )}

      {/* Status Filter Action Sheet */}
      <ActionSheet
        visible={showStatusFilter}
        onClose={() => setShowStatusFilter(false)}
        title={t('admin.filterByStatus')}
        options={[
          {
            label: t('admin.allStatuses'),
            icon: 'apps-outline',
            onPress: () => handleStatusFilterChange(undefined),
          },
          {
            label: t('status.active'),
            icon: 'checkmark-circle-outline',
            onPress: () => handleStatusFilterChange(true),
          },
          {
            label: t('status.suspended'),
            icon: 'ban-outline',
            onPress: () => handleStatusFilterChange(false),
          },
        ]}
      />

      {/* User Actions Action Sheet */}
      <ActionSheet
        visible={showActionSheet}
        onClose={() => {
          setShowActionSheet(false);
        }}
        title={selectedUser?.name || t('admin.userActions')}
        options={[
          {
            label: t('admin.editUser'),
            icon: 'create-outline',
            onPress: openEditModal,
          },
          {
            label: selectedUser?.isBannedFromInsights
              ? t('admin.unbanFromInsights')
              : t('admin.banFromInsights'),
            icon: selectedUser?.isBannedFromInsights ? 'checkmark-circle' : 'close-circle',
            onPress: async () => {
              if (!selectedUser) return;
              try {
                await toggleInsightBan(selectedUser.id);
                setShowActionSheet(false);
                setSelectedUser(null);
              } catch (err) {
                // Error handled in hook
              }
            },
          },
          {
            label: t('admin.suspendUser'),
            icon: 'ban',
            onPress: () => {
              setShowActionSheet(false);
              setShowSuspendModal(true);
            },
            destructive: true,
          },
          {
            label: t('admin.deleteUser'),
            icon: 'trash-outline',
            onPress: () => {
              setShowActionSheet(false);
              setShowDeleteModal(true);
            },
            destructive: true,
          },
        ]}
      />

      {/* Suspend Confirmation Modal */}
      <ConfirmationModal
        visible={showSuspendModal}
        onClose={() => {
          setShowSuspendModal(false);
          setSelectedUser(null);
        }}
        onConfirm={handleSuspend}
        title={t('admin.confirmSuspend')}
        message={t('admin.confirmSuspendMessage')}
        confirmText={t('admin.suspend')}
        cancelText={t('common.cancel')}
        destructive
        icon="ban"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        visible={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedUser(null);
        }}
        onConfirm={handleDelete}
        title={t('admin.deleteUser')}
        message={t('admin.deleteUserMessage')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        destructive
        icon="trash"
      />

      {/* Create User Modal */}
      <Modal visible={showCreateModal} transparent animationType="slide">
        <View style={localStyles.modalOverlay}>
          <View style={localStyles.modalContainer}>
            <View style={localStyles.modalContent}>
              {/* Modal Header */}
              <View style={localStyles.modalHeader}>
                <Text style={localStyles.modalTitle}>{t('admin.createUser')}</Text>
                <TouchableOpacity
                  style={localStyles.modalCloseButton}
                  onPress={() => setShowCreateModal(false)}
                >
                  <Ionicons name="close" size={24} color={theme.text.tertiary} />
                </TouchableOpacity>
              </View>

              {/* Error Banner */}
              {formError ? (
                <View style={localStyles.errorBanner}>
                  <Ionicons name="alert-circle" size={20} color={theme.error.main} />
                  <Text style={localStyles.errorBannerText}>{formError}</Text>
                </View>
              ) : null}

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Name Input */}
                <View style={localStyles.formGroup}>
                  <Text style={localStyles.formLabel}>{t('admin.name')} *</Text>
                  <TextInput
                    style={localStyles.formInput}
                    placeholder={t('admin.namePlaceholder')}
                    placeholderTextColor={theme.text.tertiary}
                    value={formName}
                    onChangeText={setFormName}
                  />
                </View>

                {/* Email Input */}
                <View style={localStyles.formGroup}>
                  <Text style={localStyles.formLabel}>{t('admin.email')} *</Text>
                  <TextInput
                    style={localStyles.formInput}
                    placeholder={t('admin.emailPlaceholder')}
                    placeholderTextColor={theme.text.tertiary}
                    value={formEmail}
                    onChangeText={setFormEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                {/* Password Input */}
                <View style={localStyles.formGroup}>
                  <Text style={localStyles.formLabel}>{t('admin.password')} *</Text>
                  <TextInput
                    style={localStyles.formInput}
                    placeholder={t('admin.passwordPlaceholder')}
                    placeholderTextColor={theme.text.tertiary}
                    value={formPassword}
                    onChangeText={setFormPassword}
                    secureTextEntry
                  />
                </View>

                {/* Nationality Input */}
                <View style={localStyles.formGroup}>
                  <Text style={localStyles.formLabel}>{t('register.nationality')}</Text>
                  <TextInput
                    style={localStyles.formInput}
                    placeholder={t('register.nationalityPlaceholder')}
                    placeholderTextColor={theme.text.tertiary}
                    value={formNationality}
                    onChangeText={setFormNationality}
                  />
                </View>

                {/* Role Selection */}
                <View style={localStyles.formGroup}>
                  <Text style={localStyles.formLabel}>{t('admin.role')} *</Text>
                  <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', flexWrap: 'wrap', marginTop: 8 }}>
                    {renderRoleOption('user', t('role.user'))}
                    {renderRoleOption('admin', t('role.admin'))}
                  </View>
                </View>

                {/* Create Button */}
                <TouchableOpacity
                  style={localStyles.submitButton}
                  onPress={handleCreateUser}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color={theme.primary.contrast} />
                  ) : (
                    <Text style={localStyles.submitButtonText}>
                      {t('admin.createUser')}
                    </Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit User Modal */}
      <Modal visible={showEditModal} transparent animationType="slide">
        <View style={localStyles.modalOverlay}>
          <View style={localStyles.modalContainer}>
            <View style={localStyles.modalContent}>
              {/* Modal Header */}
              <View style={localStyles.modalHeader}>
                <Text style={localStyles.modalTitle}>{t('admin.editUser')}</Text>
                <TouchableOpacity
                  style={localStyles.modalCloseButton}
                  onPress={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                  }}
                >
                  <Ionicons name="close" size={24} color={theme.text.tertiary} />
                </TouchableOpacity>
              </View>

              {/* Error Banner */}
              {formError ? (
                <View style={localStyles.errorBanner}>
                  <Ionicons name="alert-circle" size={20} color={theme.error.main} />
                  <Text style={localStyles.errorBannerText}>{formError}</Text>
                </View>
              ) : null}

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Name Input */}
                <View style={localStyles.formGroup}>
                  <Text style={localStyles.formLabel}>{t('admin.name')} *</Text>
                  <TextInput
                    style={localStyles.formInput}
                    placeholder={t('admin.namePlaceholder')}
                    placeholderTextColor={theme.text.tertiary}
                    value={formName}
                    onChangeText={setFormName}
                  />
                </View>

                {/* Email Input */}
                <View style={localStyles.formGroup}>
                  <Text style={localStyles.formLabel}>{t('admin.email')} *</Text>
                  <TextInput
                    style={localStyles.formInput}
                    placeholder={t('admin.emailPlaceholder')}
                    placeholderTextColor={theme.text.tertiary}
                    value={formEmail}
                    onChangeText={setFormEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                {/* Nationality Input */}
                <View style={localStyles.formGroup}>
                  <Text style={localStyles.formLabel}>{t('register.nationality')}</Text>
                  <TextInput
                    style={localStyles.formInput}
                    placeholder={t('register.nationalityPlaceholder')}
                    placeholderTextColor={theme.text.tertiary}
                    value={formNationality}
                    onChangeText={setFormNationality}
                  />
                </View>

                {/* Role Selection */}
                <View style={localStyles.formGroup}>
                  <Text style={localStyles.formLabel}>{t('admin.role')} *</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
                    {renderRoleOption('user', t('role.user'))}
                    {renderRoleOption('admin', t('role.admin'))}
                  </View>
                </View>

                {/* Update Button */}
                <TouchableOpacity
                  style={localStyles.submitButton}
                  onPress={handleUpdateUser}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color={theme.primary.contrast} />
                  ) : (
                    <Text style={localStyles.submitButtonText}>
                      {t('admin.updateUser')}
                    </Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const createLocalStyles = (theme: any, isRTL: boolean) => StyleSheet.create({
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
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.text.primary,
    textAlign: isRTL ? 'right' : 'left',
  },
  filterContainer: {
    maxHeight: 70, // Increased to prevent crushing
  },
  filterContent: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    paddingHorizontal: 16,
    paddingVertical: 14, // Increased padding
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
    minWidth: 80, // Added minWidth
    alignItems: 'center',
    justifyContent: 'center',
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
  userCard: {
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
    backgroundColor: theme.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    [isRTL ? 'marginLeft' : 'marginRight']: 12,
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
  userBadges: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    flexWrap: 'wrap',
    justifyContent: isRTL ? 'flex-start' : 'flex-start', // Keep buttons on the start side of current direction
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
  roleChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: theme.background.secondary,
    [isRTL ? 'marginLeft' : 'marginRight']: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.border.main,
  },
  roleChipActive: {
    backgroundColor: theme.primary.main,
    borderColor: theme.primary.main,
  },
  roleChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text.primary,
  },
  roleChipTextActive: {
    color: theme.primary.contrast,
  },
  errorBanner: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    backgroundColor: theme.error.main + '15',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorBannerText: {
    flex: 1,
    [isRTL ? 'marginRight' : 'marginLeft']: 8,
    fontSize: 14,
    color: theme.error.main,
    fontWeight: '500',
    textAlign: isRTL ? 'right' : 'left',
  },
  // Modal Styles - Improved for both light and dark mode
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '85%',
  },
  modalContent: {
    backgroundColor: theme.surface?.main || theme.background.primary,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
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
    textAlign: isRTL ? 'right' : 'left',
  },
  modalCloseButton: {
    padding: 4,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text.primary,
    marginBottom: 8,
    textAlign: isRTL ? 'right' : 'left',
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
    textAlign: isRTL ? 'right' : 'left',
  },
  submitButton: {
    backgroundColor: theme.primary.main,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.primary.contrast,
  },
});
