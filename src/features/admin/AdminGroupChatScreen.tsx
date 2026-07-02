/**
 * Admin Group Chat Management Screen
 * Re-architected with List, Create, and Edit Views, member management, and icon uploads.
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    ActivityIndicator,
    Alert,
    Switch,
    Image,
    FlatList,
    Platform,
    Linking,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, useLocalization } from '../../app/providers';
import { apiClient } from '../../core/services/api/apiClient';
import { spacing } from '../../core/theme/spacing';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage } from '../../core/services/media/mediaService';

type ViewMode = 'LIST' | 'CREATE' | 'EDIT';

interface GroupChatParticipant {
    user: {
        _id: string;
        name: string;
        email: string;
        role: string;
    };
    permission: string;
    joinedAt: string;
}

interface GroupChat {
    _id: string;
    name: string;
    groupAvatar: string | null;
    type: string;
    participants: GroupChatParticipant[];
    isPremium: boolean;
    isSystemGroup: boolean;
    tierGroup: string | null;
    settings: {
        onlyAdminsCanSend: boolean;
    };
    createdBy: {
        _id: string;
        name: string;
        email: string;
    };
    createdAt: string;
    updatedAt: string;
}

const SUBSCRIPTION_TIERS = [
    { id: 'free', label: 'Free Tier', icon: 'people-outline' },
    { id: 'premium', label: 'Premium Tier', icon: 'star-outline' },
];

export const AdminGroupChatScreen: React.FC<{ onNavigateBack: () => void }> = ({
    onNavigateBack,
}) => {
    const { theme, isDark } = useTheme();
    const { t, isRTL } = useLocalization();
    const styles = useMemo(() => createLocalStyles(theme, isRTL), [theme, isRTL]);

    const [viewMode, setViewMode] = useState<ViewMode>('LIST');
    const [chats, setChats] = useState<GroupChat[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedChat, setSelectedChat] = useState<GroupChat | null>(null);

    // Create Group State
    const [groupName, setGroupName] = useState('');
    const [selectedTiers, setSelectedTiers] = useState<string[]>([]);
    const [identifiers, setIdentifiers] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [isSystemGroup, setIsSystemGroup] = useState(false);
    const [onlyAdminsCanSend, setOnlyAdminsCanSend] = useState(true);

    // Edit Group State
    const [editGroupName, setEditGroupName] = useState('');
    const [editIsSystemGroup, setEditIsSystemGroup] = useState(false);
    const [editOnlyAdminsCanSend, setEditOnlyAdminsCanSend] = useState(true);
    const [editSelectedTiers, setEditSelectedTiers] = useState<string[]>([]);
    const [editIdentifiers, setEditIdentifiers] = useState('');
    const [isSavingDetails, setIsSavingDetails] = useState(false);
    const [isAddingBulk, setIsAddingBulk] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [memberSearch, setMemberSearch] = useState('');
    const [modalConfig, setModalConfig] = useState<any>({
        visible: false,
        title: '',
        message: '',
        confirmText: '',
        cancelText: '',
        onConfirm: undefined,
        type: 'confirm',
        userId: '',
        currentRole: '',
    });

    // Fetch Group Chats
    const fetchGroupChats = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.get<any>('/api/admin/chats?type=group&limit=100');
            if (response.success && response.data?.chats) {
                setChats(response.data.chats);
            } else {
                throw new Error(response.message || 'Failed to fetch chats');
            }
        } catch (error: any) {
            console.error('[AdminGroupChat] Fetch Error:', error);
            Alert.alert(t('common.error'), error.message || 'Failed to load group chats');
        } finally {
            setIsLoading(false);
        }
    }, [t]);

    useEffect(() => {
        if (viewMode === 'LIST') {
            fetchGroupChats();
        }
    }, [viewMode, fetchGroupChats]);

    const toggleTier = (tierId: string) => {
        setSelectedTiers((prev) =>
            prev.includes(tierId)
                ? prev.filter((id) => id !== tierId)
                : [...prev, tierId]
        );
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim()) {
            Alert.alert(t('common.error'), 'Group name is required');
            return;
        }

        if (selectedTiers.length === 0 && !identifiers.trim()) {
            Alert.alert(t('common.error'), 'Please select at least one tier or provide identifiers');
            return;
        }

        setIsCreating(true);
        try {
            const createResponse = await apiClient.post<any>('/api/admin/chats/group', {
                name: groupName.trim(),
                isSystemGroup,
                settings: {
                    onlyAdminsCanSend,
                },
            });

            if (!createResponse.success) {
                throw new Error(createResponse.message || 'Failed to create group');
            }

            const chatId = createResponse.data.chat._id;

            const identifierList = identifiers
                .split(/[,\n]/)
                .map((s) => s.trim())
                .filter((s) => s.length > 0);

            const bulkResponse = await apiClient.post<any>(
                `/api/admin/chats/${chatId}/participants/bulk`,
                {
                    tiers: selectedTiers,
                    identifiers: identifierList,
                    reason: `Group creation: ${groupName}`,
                }
            );

            if (bulkResponse.success) {
                Alert.alert(
                    t('common.success'),
                    `Group created and ${bulkResponse.data.addedCount} participants added.`
                );
                // Reset inputs
                setGroupName('');
                setSelectedTiers([]);
                setIdentifiers('');
                setIsSystemGroup(false);
                setOnlyAdminsCanSend(true);
                setViewMode('LIST');
            } else {
                Alert.alert(t('common.error'), 'Group created but failed to add participants');
            }
        } catch (error: any) {
            console.error('[AdminGroupChat] Error creating group:', error);
            Alert.alert(t('common.error'), error.message || 'Operation failed');
        } finally {
            setIsCreating(false);
        }
    };

    // Edit view setup
    const openEditView = (chat: GroupChat) => {
        setSelectedChat(chat);
        setEditGroupName(chat.name || '');
        setEditIsSystemGroup(chat.isSystemGroup || false);
        setEditOnlyAdminsCanSend(chat.settings?.onlyAdminsCanSend || false);
        setEditSelectedTiers([]);
        setEditIdentifiers('');
        setViewMode('EDIT');
    };

    // Save details updates
    const handleSaveDetails = async () => {
        if (!selectedChat) return;
        if (!editGroupName.trim()) {
            Alert.alert(t('common.error'), 'Group name is required');
            return;
        }

        setIsSavingDetails(true);
        try {
            const response = await apiClient.patch<any>(`/api/admin/chats/${selectedChat._id}`, {
                name: editGroupName.trim(),
                isSystemGroup: editIsSystemGroup,
                settings: {
                    onlyAdminsCanSend: editOnlyAdminsCanSend,
                },
            });

            if (response.success) {
                // Update selectedChat local state
                setSelectedChat(response.data.chat);
                Alert.alert(t('common.success'), 'Group details updated successfully');
            } else {
                throw new Error(response.message || 'Failed to update details');
            }
        } catch (error: any) {
            console.error('[AdminGroupChat] Error updating details:', error);
            Alert.alert(t('common.error'), error.message || 'Update failed');
        } finally {
            setIsSavingDetails(false);
        }
    };

    // Upload Avatar
    const handleUploadAvatar = async () => {
        if (!selectedChat) return;
        try {
            const current = await ImagePicker.getMediaLibraryPermissionsAsync();
            if (current.status === 'denied') {
                Alert.alert(
                    'Photo Library Access',
                    'Please enable photo library access in your device Settings to change the group picture.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Settings', onPress: () => Linking.openSettings() }
                    ]
                );
                return;
            }

            if (current.status === 'undetermined') {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const selectedImage = result.assets[0];
                setIsUploadingAvatar(true);

                const imageUrl = await uploadImage(
                    selectedImage.uri,
                    'group_avatar.jpg',
                    'image/jpeg'
                );

                const response = await apiClient.patch<any>(`/api/admin/chats/${selectedChat._id}`, {
                    groupAvatar: imageUrl,
                });

                if (response.success) {
                    setSelectedChat(response.data.chat);
                    Alert.alert(t('common.success'), 'Group avatar updated successfully');
                } else {
                    throw new Error(response.message || 'Failed to save avatar');
                }
            }
        } catch (error: any) {
            console.error('[AdminGroupChat] Avatar upload error:', error);
            Alert.alert(t('common.error'), error.message || 'Could not upload image');
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    // Promote/Demote User Role
    const handleUpdateMemberRole = async (userId: string, currentPermission: string) => {
        if (!selectedChat) return;

        setModalConfig({
            visible: true,
            type: 'role',
            title: 'Change Participant Role',
            userId,
            currentRole: currentPermission,
        });
    };

    const changeRole = async (userId: string, permission: string) => {
        if (!selectedChat) return;
        try {
            const response = await apiClient.patch<any>(`/api/admin/chats/${selectedChat._id}/participants/${userId}/permission`, {
                permission
            });

            if (response.success) {
                // Refresh selected chat from server to reflect state changes
                const updated = await apiClient.get<any>(`/api/admin/chats?type=group&limit=100`);
                const matched = updated.data?.chats?.find((c: any) => c._id === selectedChat._id);
                if (matched) setSelectedChat(matched);
                Alert.alert(t('common.success'), 'Role updated successfully');
            } else {
                throw new Error(response.message || 'Failed to update role');
            }
        } catch (error: any) {
            Alert.alert(t('common.error'), error.message || 'Could not update role');
        }
    };

    // Kick User
    const handleKickUser = async (userId: string, name: string) => {
        if (!selectedChat) return;

        const kickAction = async () => {
            try {
                const response = await apiClient.delete<any>(`/api/admin/chats/${selectedChat._id}/participants/${userId}`);
                if (response.success) {
                    const updated = await apiClient.get<any>(`/api/admin/chats?type=group&limit=100`);
                    const matched = updated.data?.chats?.find((c: any) => c._id === selectedChat._id);
                    if (matched) setSelectedChat(matched);
                    Alert.alert(t('common.success'), 'Member removed successfully');
                } else {
                    throw new Error(response.message || 'Failed to remove member');
                }
            } catch (error: any) {
                Alert.alert(t('common.error'), error.message || 'Could not remove member');
            }
        };

        setModalConfig({
            visible: true,
            type: 'confirm',
            title: 'Remove Participant',
            message: `Are you sure you want to remove ${name} from this group?`,
            confirmText: 'Remove Member',
            cancelText: 'Cancel',
            onConfirm: kickAction,
        });
    };

    // Bulk Add to Selected
    const handleAddBulkParticipants = async () => {
        if (!selectedChat) return;
        if (editSelectedTiers.length === 0 && !editIdentifiers.trim()) {
            Alert.alert(t('common.error'), 'Please select a tier or provide identifiers');
            return;
        }

        setIsAddingBulk(true);
        try {
            const identifierList = editIdentifiers
                .split(/[,\n]/)
                .map((s) => s.trim())
                .filter((s) => s.length > 0);

            const response = await apiClient.post<any>(
                `/api/admin/chats/${selectedChat._id}/participants/bulk`,
                {
                    tiers: editSelectedTiers,
                    identifiers: identifierList,
                    reason: `Admin bulk add`,
                }
            );

            if (response.success) {
                const updated = await apiClient.get<any>(`/api/admin/chats?type=group&limit=100`);
                const matched = updated.data?.chats?.find((c: any) => c._id === selectedChat._id);
                if (matched) setSelectedChat(matched);
                
                Alert.alert(
                    t('common.success'),
                    `Successfully added ${response.data.addedCount} new participants.`
                );
                setEditIdentifiers('');
                setEditSelectedTiers([]);
            } else {
                throw new Error(response.message || 'Failed to bulk add participants');
            }
        } catch (error: any) {
            console.error('[AdminGroupChat] Bulk Add error:', error);
            Alert.alert(t('common.error'), error.message || 'Operation failed');
        } finally {
            setIsAddingBulk(false);
        }
    };

    // Delete Chat
    const handleDeleteChat = (chatId: string, name: string) => {
        const deleteAction = async () => {
            try {
                const response = await apiClient.delete<any>(`/api/admin/chats/${chatId}`, {
                    reason: 'Admin deletion via dashboard'
                });
                if (response.success) {
                    Alert.alert(t('common.success'), 'Group chat deleted successfully');
                    fetchGroupChats();
                } else {
                    throw new Error(response.message || 'Failed to delete chat');
                }
            } catch (error: any) {
                Alert.alert(t('common.error'), error.message || 'Deletion failed');
            }
        };

        setModalConfig({
            visible: true,
            type: 'confirm',
            title: 'Delete Group Chat',
            message: `Are you sure you want to permanently delete "${name}"? This will delete all messages and remove all participants.`,
            confirmText: 'Delete Group',
            cancelText: 'Cancel',
            onConfirm: deleteAction,
        });
    };

    // Filter Group Chats List
    const filteredChats = useMemo(() => {
        return chats.filter(chat =>
            chat.name?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [chats, searchQuery]);

    // Filter Members List in Edit View
    const filteredParticipants = useMemo(() => {
        if (!selectedChat) return [];
        return selectedChat.participants.filter(p =>
            p.user?.name?.toLowerCase().includes(memberSearch.toLowerCase()) ||
            p.user?.email?.toLowerCase().includes(memberSearch.toLowerCase())
        );
    }, [selectedChat, memberSearch]);

    // Go Back Navigation Helper
    const handleHeaderBack = () => {
        if (viewMode === 'CREATE' || viewMode === 'EDIT') {
            setViewMode('LIST');
        } else {
            onNavigateBack();
        }
    };

    const renderCustomModal = () => {
        if (!modalConfig.visible) return null;

        return (
            <Modal
                transparent
                visible={modalConfig.visible}
                animationType="fade"
                onRequestClose={() => setModalConfig((prev: any) => ({ ...prev, visible: false }))}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalBox, { backgroundColor: theme.ui.card, borderColor: theme.border.main }]}>
                        <Text style={[styles.modalTitle, { color: theme.text.primary }]}>{modalConfig.title}</Text>
                        
                        {modalConfig.type === 'confirm' ? (
                            <>
                                <Text style={[styles.modalMessage, { color: theme.text.secondary }]}>{modalConfig.message}</Text>
                                <View style={styles.modalButtons}>
                                    <TouchableOpacity 
                                        style={[styles.modalBtn, styles.modalCancelBtn, { borderColor: theme.border.main }]}
                                        onPress={() => setModalConfig((prev: any) => ({ ...prev, visible: false }))}
                                    >
                                        <Text style={[styles.modalCancelText, { color: theme.text.primary }]}>
                                            {modalConfig.cancelText || 'Cancel'}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        style={[
                                            styles.modalBtn, 
                                            { 
                                                backgroundColor: modalConfig.confirmText?.includes('Delete') || modalConfig.confirmText?.includes('Remove') 
                                                    ? '#ef4444' 
                                                    : theme.primary.main 
                                            }
                                        ]}
                                        onPress={() => {
                                            setModalConfig((prev: any) => ({ ...prev, visible: false }));
                                            if (modalConfig.onConfirm) modalConfig.onConfirm();
                                        }}
                                    >
                                        <Text style={styles.modalConfirmText}>{modalConfig.confirmText || 'Confirm'}</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        ) : (
                            <View style={{ width: '100%', gap: 10, marginTop: 10 }}>
                                {[
                                    { key: 'admin', label: 'Make Manager (Admin)' },
                                    { key: 'member', label: 'Make Member' },
                                    { key: 'read_only', label: 'Make Read-Only' },
                                ].map((roleOption) => {
                                    const isSelected = modalConfig.currentRole === roleOption.key;
                                    return (
                                        <TouchableOpacity
                                            key={roleOption.key}
                                            style={[
                                                styles.roleOptionBtn,
                                                { 
                                                    borderColor: isSelected ? theme.primary.main : theme.border.light,
                                                    backgroundColor: isSelected ? theme.primary.main + '10' : theme.background.secondary 
                                                }
                                            ]}
                                            onPress={() => {
                                                setModalConfig((prev: any) => ({ ...prev, visible: false }));
                                                if (modalConfig.userId) changeRole(modalConfig.userId, roleOption.key);
                                            }}
                                        >
                                            <Text style={[
                                                styles.roleOptionLabel, 
                                                { 
                                                    color: isSelected ? theme.primary.main : theme.text.primary,
                                                    fontWeight: isSelected ? '700' : '500'
                                                }
                                            ]}>
                                                {roleOption.label}
                                            </Text>
                                            {isSelected && <Icon name="checkmark-circle" size={20} color={theme.primary.main} />}
                                        </TouchableOpacity>
                                    );
                                })}
                                <TouchableOpacity 
                                    style={[styles.modalBtn, styles.modalCancelBtn, { borderColor: theme.border.main, marginTop: 10 }]}
                                    onPress={() => setModalConfig((prev: any) => ({ ...prev, visible: false }))}
                                >
                                    <Text style={[styles.modalCancelText, { color: theme.text.primary }]}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
            {/* Header */}
            <LinearGradient
                colors={isDark ? ['#1e293b', '#0f172a'] : ['#F8FAFC', '#F1F5F9']}
                style={styles.header}
            >
                <TouchableOpacity onPress={handleHeaderBack} style={styles.backButton}>
                    <Icon name={isRTL ? "chevron-forward" : "chevron-back"} size={28} color={theme.text.primary} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.text.primary }]}>
                    {viewMode === 'LIST' && (t('admin.groupChats') || 'Group Chat Manager')}
                    {viewMode === 'CREATE' && 'Create Group Chat'}
                    {viewMode === 'EDIT' && 'Group Settings & Members'}
                </Text>
                {viewMode === 'LIST' ? (
                    <TouchableOpacity onPress={() => setViewMode('CREATE')} style={styles.createIconButton}>
                        <Icon name="add-outline" size={28} color={theme.primary.main} />
                    </TouchableOpacity>
                ) : (
                    <View style={{ width: 40 }} />
                )}
            </LinearGradient>

            {/* List View */}
            {viewMode === 'LIST' && (
                <View style={{ flex: 1 }}>
                    <View style={styles.searchContainer}>
                        <View style={[styles.searchInputWrapper, { backgroundColor: theme.background.secondary, borderColor: theme.border.main }]}>
                            <Icon name="search-outline" size={20} color={theme.text.tertiary} />
                            <TextInput
                                style={[styles.searchInput, { color: theme.text.primary }]}
                                placeholder="Search groups..."
                                placeholderTextColor={theme.text.tertiary}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>
                    </View>

                    {isLoading ? (
                        <View style={styles.centerContainer}>
                            <ActivityIndicator size="large" color={theme.primary.main} />
                        </View>
                    ) : (
                        <FlatList
                            data={filteredChats}
                            keyExtractor={(item) => item._id}
                            contentContainerStyle={styles.listContent}
                            ListEmptyComponent={
                                <View style={styles.centerContainer}>
                                    <Text style={{ color: theme.text.tertiary }}>No group chats found.</Text>
                                </View>
                            }
                            renderItem={({ item }) => (
                                <View style={[styles.chatCard, { backgroundColor: theme.ui.card, borderColor: theme.border.light }]}>
                                    <View style={styles.chatCardHeader}>
                                        {item.groupAvatar ? (
                                            <Image source={{ uri: item.groupAvatar }} style={styles.avatar} />
                                        ) : (
                                            <View style={[styles.avatarFallback, { backgroundColor: theme.primary.main + '20' }]}>
                                                <Icon name="chatbubbles-outline" size={24} color={theme.primary.main} />
                                            </View>
                                        )}
                                        <View style={{ flex: 1 }}>
                                            <Text style={[styles.groupNameText, { color: theme.text.primary }]}>
                                                {item.name}
                                            </Text>
                                            <Text style={{ color: theme.text.tertiary, fontSize: 13 }}>
                                                {item.participants?.length || 0} participants
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Badges */}
                                    <View style={styles.badgeRow}>
                                        {item.isSystemGroup && (
                                            <View style={[styles.badge, { backgroundColor: '#3b82f620' }]}>
                                                <Text style={[styles.badgeText, { color: '#3b82f6' }]}>System</Text>
                                            </View>
                                        )}
                                        {item.settings?.onlyAdminsCanSend && (
                                            <View style={[styles.badge, { backgroundColor: '#f9731620' }]}>
                                                <Text style={[styles.badgeText, { color: '#f97316' }]}>Broadcast</Text>
                                            </View>
                                        )}
                                        {item.isPremium && (
                                            <View style={[styles.badge, { backgroundColor: '#af52de20' }]}>
                                                <Text style={[styles.badgeText, { color: '#af52de' }]}>Premium</Text>
                                            </View>
                                        )}
                                    </View>

                                    {/* Actions */}
                                    <View style={[styles.cardDivider, { backgroundColor: theme.border.light }]} />
                                    <View style={styles.chatCardActions}>
                                        <TouchableOpacity
                                            style={[styles.actionBtn, { backgroundColor: theme.background.secondary }]}
                                            onPress={() => openEditView(item)}
                                        >
                                            <Icon name="settings-outline" size={18} color={theme.text.primary} />
                                            <Text style={{ color: theme.text.primary, fontWeight: '600', fontSize: 13 }}>Manage</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.actionBtn, { backgroundColor: '#ef444415' }]}
                                            onPress={() => handleDeleteChat(item._id, item.name)}
                                        >
                                            <Icon name="trash-outline" size={18} color="#ef4444" />
                                            <Text style={{ color: '#ef4444', fontWeight: '600', fontSize: 13 }}>Delete</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        />
                    )}
                </View>
            )}

            {/* Create View */}
            {viewMode === 'CREATE' && (
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={[styles.section, { backgroundColor: theme.ui.card }]}>
                        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Group Details</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text.primary, borderColor: theme.border.main }]}
                            placeholder="Group Name (e.g. VIP Gold Traders)"
                            placeholderTextColor={theme.text.tertiary}
                            value={groupName}
                            onChangeText={setGroupName}
                        />

                        <View style={styles.settingRow}>
                            <View style={styles.settingTextContainer}>
                                <Text style={{ color: theme.text.primary, fontWeight: '600' }}>System Group</Text>
                                <Text style={{ color: theme.text.tertiary, fontSize: 12 }}>Auto-enroll for tiers applies</Text>
                            </View>
                            <Switch
                                value={isSystemGroup}
                                onValueChange={setIsSystemGroup}
                                trackColor={{ false: '#CBD5E1', true: theme.primary.main }}
                            />
                        </View>

                        <View style={styles.settingRow}>
                            <View style={styles.settingTextContainer}>
                                <Text style={{ color: theme.text.primary, fontWeight: '600' }}>Broadcast Mode</Text>
                                <Text style={{ color: theme.text.tertiary, fontSize: 12 }}>Only admins can send messages</Text>
                            </View>
                            <Switch
                                value={onlyAdminsCanSend}
                                onValueChange={setOnlyAdminsCanSend}
                                trackColor={{ false: '#CBD5E1', true: theme.primary.main }}
                            />
                        </View>
                    </View>

                    <View style={[styles.section, { backgroundColor: theme.ui.card }]}>
                        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Bulk Add by Tiers</Text>
                        <Text style={styles.sectionSubtitle}>Select subscription levels to add users.</Text>
                        <View style={styles.tierContainer}>
                            {SUBSCRIPTION_TIERS.map((tier) => {
                                const isSelected = selectedTiers.includes(tier.id);
                                return (
                                    <TouchableOpacity
                                        key={tier.id}
                                        style={[
                                            styles.tierButton,
                                            { borderColor: isSelected ? theme.primary.main : theme.border.light },
                                            isSelected && { backgroundColor: theme.primary.main + '10' },
                                        ]}
                                        onPress={() => toggleTier(tier.id)}
                                    >
                                        <Icon name={tier.icon as any} size={20} color={isSelected ? theme.primary.main : theme.text.tertiary} />
                                        <Text style={[styles.tierLabel, { color: isSelected ? theme.primary.main : theme.text.secondary }]}>
                                            {tier.label}
                                        </Text>
                                        {isSelected && <Icon name="checkmark-circle" size={18} color={theme.primary.main} />}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    <View style={[styles.section, { backgroundColor: theme.ui.card }]}>
                        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Specific Participants</Text>
                        <Text style={styles.sectionSubtitle}>Add users by Email, Phone Number, or Name (one per line).</Text>
                        <TextInput
                            style={[styles.textArea, { color: theme.text.primary, borderColor: theme.border.main }]}
                            placeholder="user@example.com&#10;+1234567890&#10;John Smith"
                            placeholderTextColor={theme.text.tertiary}
                            value={identifiers}
                            onChangeText={setIdentifiers}
                            multiline
                            numberOfLines={5}
                        />
                    </View>

                    <TouchableOpacity style={styles.createButton} onPress={handleCreateGroup} disabled={isCreating}>
                        {isCreating ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <>
                                <Icon name="chatbubbles" size={20} color="#FFFFFF" />
                                <Text style={styles.createButtonText}>Create Group & Add Participants</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            )}

            {/* Edit View */}
            {viewMode === 'EDIT' && selectedChat && (
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Header Details */}
                    <View style={[styles.avatarSection, { backgroundColor: theme.ui.card }]}>
                        <TouchableOpacity style={styles.avatarUploadWrapper} onPress={handleUploadAvatar} disabled={isUploadingAvatar}>
                            {isUploadingAvatar ? (
                                <ActivityIndicator size="small" color={theme.primary.main} />
                            ) : selectedChat.groupAvatar ? (
                                <Image source={{ uri: selectedChat.groupAvatar }} style={styles.editAvatar} />
                            ) : (
                                <View style={[styles.editAvatarFallback, { backgroundColor: theme.primary.main + '20' }]}>
                                    <Icon name="camera-outline" size={32} color={theme.primary.main} />
                                </View>
                            )}
                            <View style={[styles.editAvatarBadge, { backgroundColor: theme.primary.main }]}>
                                <Icon name="pencil" size={14} color="#FFFFFF" />
                            </View>
                        </TouchableOpacity>
                        <Text style={[styles.sectionTitle, { color: theme.text.primary, marginTop: 12, marginBottom: 4 }]}>
                            {selectedChat.name}
                        </Text>
                    </View>

                    {/* Group settings edit */}
                    <View style={[styles.section, { backgroundColor: theme.ui.card }]}>
                        <Text style={[styles.sectionSubHeader, { color: theme.text.primary }]}>Details</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text.primary, borderColor: theme.border.main }]}
                            placeholder="Group Name"
                            value={editGroupName}
                            onChangeText={setEditGroupName}
                        />

                        <View style={styles.settingRow}>
                            <View style={styles.settingTextContainer}>
                                <Text style={{ color: theme.text.primary, fontWeight: '600' }}>System Group</Text>
                            </View>
                            <Switch
                                value={editIsSystemGroup}
                                onValueChange={setEditIsSystemGroup}
                                trackColor={{ false: '#CBD5E1', true: theme.primary.main }}
                            />
                        </View>

                        <View style={styles.settingRow}>
                            <View style={styles.settingTextContainer}>
                                <Text style={{ color: theme.text.primary, fontWeight: '600' }}>Broadcast Mode</Text>
                            </View>
                            <Switch
                                value={editOnlyAdminsCanSend}
                                onValueChange={setEditOnlyAdminsCanSend}
                                trackColor={{ false: '#CBD5E1', true: theme.primary.main }}
                            />
                        </View>

                        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.primary.main }]} onPress={handleSaveDetails} disabled={isSavingDetails}>
                            {isSavingDetails ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveBtnText}>Save Group Info</Text>}
                        </TouchableOpacity>
                    </View>

                    {/* Bulk Add to Selected Chat */}
                    <View style={[styles.section, { backgroundColor: theme.ui.card }]}>
                        <Text style={[styles.sectionSubHeader, { color: theme.text.primary }]}>Add New Members</Text>
                        <View style={[styles.tierContainer, { marginBottom: 12 }]}>
                            {SUBSCRIPTION_TIERS.map((tier) => {
                                const isSelected = editSelectedTiers.includes(tier.id);
                                return (
                                    <TouchableOpacity
                                        key={tier.id}
                                        style={[
                                            styles.tierButton,
                                            { borderColor: isSelected ? theme.primary.main : theme.border.light },
                                            isSelected && { backgroundColor: theme.primary.main + '10' },
                                        ]}
                                        onPress={() =>
                                            setEditSelectedTiers(prev =>
                                                prev.includes(tier.id) ? prev.filter(id => id !== tier.id) : [...prev, tier.id]
                                            )
                                        }
                                    >
                                        <Icon name={tier.icon as any} size={20} color={isSelected ? theme.primary.main : theme.text.tertiary} />
                                        <Text style={[styles.tierLabel, { color: isSelected ? theme.primary.main : theme.text.secondary }]}>
                                            {tier.label}
                                        </Text>
                                        {isSelected && <Icon name="checkmark-circle" size={18} color={theme.primary.main} />}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                        <TextInput
                            style={[styles.textArea, { color: theme.text.primary, borderColor: theme.border.main }]}
                            placeholder="Add users by Email or Phone number..."
                            placeholderTextColor={theme.text.tertiary}
                            value={editIdentifiers}
                            onChangeText={setEditIdentifiers}
                            multiline
                            numberOfLines={3}
                        />
                        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.primary.main, marginTop: 12 }]} onPress={handleAddBulkParticipants} disabled={isAddingBulk}>
                            {isAddingBulk ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveBtnText}>Add Participants</Text>}
                        </TouchableOpacity>
                    </View>

                    {/* Members List */}
                    <View style={[styles.section, { backgroundColor: theme.ui.card }]}>
                        <Text style={[styles.sectionSubHeader, { color: theme.text.primary }]}>
                            Participants ({selectedChat.participants?.length || 0})
                        </Text>
                        <TextInput
                            style={[styles.miniInput, { color: theme.text.primary, borderColor: theme.border.main }]}
                            placeholder="Search members..."
                            placeholderTextColor={theme.text.tertiary}
                            value={memberSearch}
                            onChangeText={setMemberSearch}
                        />

                        {filteredParticipants.map((member) => (
                            <View key={member.user?._id} style={[styles.memberRow, { borderBottomColor: theme.border.light }]}>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: theme.text.primary, fontWeight: '600' }}>
                                        {member.user?.name || 'Unknown User'}
                                    </Text>
                                    <Text style={{ color: theme.text.tertiary, fontSize: 12 }}>
                                        {member.user?.email || 'No Email'}
                                    </Text>
                                </View>

                                {/* Permission Role Badge */}
                                <View style={[styles.badge, { marginRight: 8, backgroundColor: member.permission === 'admin' ? '#ef444420' : '#10b98120' }]}>
                                    <Text style={[styles.badgeText, { color: member.permission === 'admin' ? '#ef4444' : '#10b981' }]}>
                                        {member.permission}
                                    </Text>
                                </View>

                                {/* Row Actions */}
                                <View style={{ flexDirection: 'row', gap: 6 }}>
                                    <TouchableOpacity style={styles.memberActionIcon} onPress={() => handleUpdateMemberRole(member.user?._id, member.permission)}>
                                        <Icon name="shield-outline" size={18} color={theme.text.secondary} />
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.memberActionIcon} onPress={() => handleKickUser(member.user?._id, member.user?.name)}>
                                        <Icon name="close-circle-outline" size={18} color="#ef4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                </ScrollView>
            )}
            {renderCustomModal()}
        </SafeAreaView>
    );
};

const createLocalStyles = (theme: any, isRTL: boolean) => StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: isRTL ? 'row-reverse' : 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: 16,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    backButton: {
        padding: 4,
    },
    createIconButton: {
        padding: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
    },
    searchContainer: {
        padding: spacing.md,
    },
    searchInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 14,
        paddingHorizontal: 12,
        height: 48,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 15,
    },
    listContent: {
        padding: spacing.md,
        paddingBottom: 40,
    },
    centerContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    chatCard: {
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
    },
    chatCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 46,
        height: 46,
        borderRadius: 23,
    },
    avatarFallback: {
        width: 46,
        height: 46,
        borderRadius: 23,
        alignItems: 'center',
        justifyContent: 'center',
    },
    groupNameText: {
        fontSize: 16,
        fontWeight: '700',
    },
    badgeRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
    },
    badge: {
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: 8,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    cardDivider: {
        height: 1,
        marginVertical: 12,
    },
    chatCardActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        height: 38,
        borderRadius: 10,
    },
    scrollContent: {
        padding: spacing.lg,
    },
    section: {
        padding: 16,
        borderRadius: 20,
        marginBottom: spacing.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    avatarSection: {
        alignItems: 'center',
        padding: 20,
        borderRadius: 20,
        marginBottom: spacing.lg,
    },
    avatarUploadWrapper: {
        position: 'relative',
    },
    editAvatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
    },
    editAvatarFallback: {
        width: 90,
        height: 90,
        borderRadius: 45,
        alignItems: 'center',
        justifyContent: 'center',
    },
    editAvatarBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 16,
        textAlign: isRTL ? 'right' : 'left',
    },
    sectionSubHeader: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 12,
        textAlign: isRTL ? 'right' : 'left',
    },
    sectionSubtitle: {
        color: theme.text.tertiary,
        fontSize: 13,
        marginBottom: 12,
        textAlign: isRTL ? 'right' : 'left',
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 15,
        marginBottom: 16,
        textAlign: isRTL ? 'right' : 'left',
    },
    miniInput: {
        height: 42,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        fontSize: 14,
        marginBottom: 12,
        textAlign: isRTL ? 'right' : 'left',
    },
    settingRow: {
        flexDirection: isRTL ? 'row-reverse' : 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
    },
    settingTextContainer: {
        alignItems: isRTL ? 'flex-end' : 'flex-start',
    },
    tierContainer: {
        gap: 12,
    },
    tierButton: {
        flexDirection: isRTL ? 'row-reverse' : 'row',
        alignItems: 'center',
        padding: 14,
        borderWidth: 1.5,
        borderRadius: 12,
        gap: 12,
    },
    tierLabel: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        textAlign: isRTL ? 'right' : 'left',
    },
    textArea: {
        minHeight: 80,
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        fontSize: 15,
        textAlignVertical: 'top',
        textAlign: isRTL ? 'right' : 'left',
    },
    createButton: {
        flexDirection: isRTL ? 'row-reverse' : 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        borderRadius: 16,
        gap: 12,
        marginTop: 8,
        backgroundColor: theme.primary.main,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
    },
    createButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
    saveBtn: {
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
    },
    saveBtnText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 15,
    },
    memberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    memberActionIcon: {
        padding: 6,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    modalBox: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 15,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 12,
        textAlign: 'center',
    },
    modalMessage: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 20,
        lineHeight: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    modalBtn: {
        flex: 1,
        height: 46,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalCancelBtn: {
        borderWidth: 1,
        backgroundColor: 'transparent',
    },
    modalCancelText: {
        fontWeight: '600',
    },
    modalConfirmText: {
        color: '#FFFFFF',
        fontWeight: '700',
    },
    roleOptionBtn: {
        width: '100%',
        height: 50,
        borderRadius: 12,
        borderWidth: 1.5,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        marginTop: 8,
    },
    roleOptionLabel: {
        fontSize: 15,
    },
});
