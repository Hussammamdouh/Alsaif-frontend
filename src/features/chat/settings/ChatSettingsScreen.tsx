/**
 * Chat Settings Screen
 * Shows group info, member list, and admin controls
 */

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Switch,
    Alert,
    RefreshControl,
    Platform,
    StatusBar,
    Dimensions,
    Modal,
    TextInput,
    Image,
    ScrollView,
} from 'react-native';
import { apiClient } from '../../../core/services/api/apiClient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, useLocalization } from '../../../app/providers';
import { ResponsiveContainer } from '../../../shared/components';
import { useChatSettings } from './chatSettings.hooks';
import { ChatParticipant } from './chatSettings.types';
import { ConfirmationModal } from '../../admin/components/ConfirmationModal';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage } from '../../../core/services/media/mediaService';
import { useUser } from '../../../app/auth/auth.hooks';
import { Linking } from 'react-native';

const { width } = Dimensions.get('window');
const isDesktop = width > 768;

interface ChatSettingsScreenProps {
    chatId: string;
    onNavigateBack: () => void;
    onChatRemoved?: (chatId: string) => void;
}

export const ChatSettingsScreen: React.FC<ChatSettingsScreenProps> = ({
    chatId,
    onNavigateBack,
    onChatRemoved,
}) => {
    const { theme, isDark } = useTheme();
    const { t } = useLocalization();
    const styles = useMemo(() => getStyles(theme, isDark), [theme, isDark]);
    const {
        settings,
        isLoading,
        isUpdating,
        error,
        refresh,
        updateSettings,
        grantSendPermission,
        revokeSendPermission,
        kickUser,
        deleteGroup,
        leaveGroup,
        addParticipants,
        updateParticipantPermission,
    } = useChatSettings(chatId);

    const [selectedMember, setSelectedMember] = useState<ChatParticipant | null>(null);
    const user = useUser();
    const currentUserId = user?.id || '';

    const changeUserRole = useCallback(async (targetUserId: string, permission: 'admin' | 'moderator' | 'member' | 'read_only') => {
        const success = await updateParticipantPermission(targetUserId, permission);
        if (success) {
            showAlert(t('common.success') || 'Success', t('chat.settings.roleChanged') || 'Role updated successfully');
        } else {
            showAlert(t('common.error') || 'Error', t('chat.settings.updateFailed') || 'Failed to update role');
        }
    }, [updateParticipantPermission, showAlert, t]);

    const handleMemberPress = useCallback((member: ChatParticipant) => {
        const currentUserPerm = settings?.currentUserPermission;
        if (!currentUserPerm) return;

        const options: { text: string; onPress: () => void; style?: 'default' | 'cancel' | 'destructive' }[] = [];

        if (currentUserPerm === 'admin') {
            options.push({
                text: t('chat.settings.admin') || 'Admin',
                onPress: () => changeUserRole(member.id, 'admin'),
            });
            options.push({
                text: t('chat.settings.moderator') || 'Moderator',
                onPress: () => changeUserRole(member.id, 'moderator'),
            });
            options.push({
                text: t('chat.settings.youAreMember') || 'Member',
                onPress: () => changeUserRole(member.id, 'member'),
            });
            options.push({
                text: t('chat.settings.read_only') || 'Read Only',
                onPress: () => changeUserRole(member.id, 'read_only'),
            });
        } else if (currentUserPerm === 'moderator') {
            options.push({
                text: t('chat.settings.youAreMember') || 'Member',
                onPress: () => changeUserRole(member.id, 'member'),
            });
            options.push({
                text: t('chat.settings.read_only') || 'Read Only',
                onPress: () => changeUserRole(member.id, 'read_only'),
            });
        }

        options.push({
            text: t('common.cancel') || 'Cancel',
            style: 'cancel',
            onPress: () => {},
        });

        Alert.alert(
            t('chat.settings.changeRole') || 'Change Participant Role',
            t('chat.settings.changeRoleDescription', { name: member.name }) || `Update role for ${member.name}`,
            options
        );
    }, [settings, t, changeUserRole]);

    const handleSelectGroupPicture = useCallback(async () => {
        try {
            const current = await ImagePicker.getMediaLibraryPermissionsAsync();
            if (current.status === 'denied') {
                Alert.alert(
                    t('common.photoLibraryAccess') || 'Photo Library Access',
                    'Please enable photo library access in your device Settings to change the group picture.',
                    [
                        { text: t('common.cancel') || 'Cancel', style: 'cancel' },
                        { text: t('common.settings') || 'Settings', onPress: () => Linking.openSettings() }
                    ]
                );
                return;
            }

            if (current.status === 'undetermined') {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                    return;
                }
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const selectedImage = result.assets[0];

                const MAX_FILE_SIZE = 5 * 1024 * 1024;
                let fileSize = selectedImage.fileSize;
                if (!fileSize && selectedImage.uri) {
                    try {
                        const response = await fetch(selectedImage.uri);
                        const blob = await response.blob();
                        fileSize = blob.size;
                    } catch (e) {
                        console.log('Error getting size from blob:', e);
                    }
                }

                if (fileSize && fileSize > MAX_FILE_SIZE) {
                    Alert.alert(t('common.error'), t('media.fileTooLarge') || 'File size too large');
                    return;
                }

                const imageUrl = await uploadImage(
                    selectedImage.uri,
                    'group_avatar.jpg',
                    'image/jpeg'
                );

                const success = await updateSettings({ groupAvatar: imageUrl });
                if (success) {
                    Alert.alert(t('common.success') || 'Success', 'Group picture updated successfully');
                } else {
                    Alert.alert(t('common.error'), 'Failed to update group picture');
                }
            }
        } catch (error: any) {
            console.error('[ChatSettingsScreen] Group picture update error:', error);
            Alert.alert(t('common.error'), error.message || 'Could not update group picture');
        }
    }, [updateSettings, t]);
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditNameModal, setShowEditNameModal] = useState(false);
    const [newName, setNewName] = useState('');
    const [showAddMembersModal, setShowAddMembersModal] = useState(false);
    const [memberToKick, setMemberToKick] = useState<ChatParticipant | null>(null);
    const searchInputRef = useRef<TextInput>(null);

    // Search and select state for AddMembersModal
    const [memberSearch, setMemberSearch] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedMembers, setSelectedMembers] = useState<any[]>([]);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Toast states for Edit Name Modal
    const [editNameSuccess, setEditNameSuccess] = useState<string | null>(null);
    const [editNameError, setEditNameError] = useState<string | null>(null);

    // Debounced search for AddMembersModal
    useEffect(() => {
        if (memberSearch.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        const timeoutId = setTimeout(async () => {
            try {
                const response = await apiClient.get<any>('/api/users/search', { q: memberSearch });
                if (response.success) {
                    const users = (response.data.users || []).map((u: any) => ({
                        id: u._id || u.id,
                        name: u.name,
                        email: u.email,
                        avatar: u.avatar,
                        role: u.role,
                    }));
                    setSearchResults(users);
                }
            } catch (error) {
                console.error('[AddMembersModal] Search error:', error);
            } finally {
                setIsSearching(false);
            }
        }, 400);

        return () => clearTimeout(timeoutId);
    }, [memberSearch]);

    const selectMemberForAdd = useCallback((user: any) => {
        setSelectedMembers((prev) => {
            if (prev.some((m) => m.id === user.id)) return prev;
            return [...prev, user];
        });
        setMemberSearch('');
        setSearchResults([]);
        setTimeout(() => searchInputRef.current?.focus(), 100);
    }, []);

    const removeMemberForAdd = useCallback((userId: string) => {
        setSelectedMembers((prev) => prev.filter((m) => m.id !== userId));
    }, []);

    // Filter out already selected and existing members from search results
    const filteredResults = useMemo(() => {
        const selectedIds = new Set(selectedMembers.map((m) => m.id));
        const existingIds = new Set((settings?.participants || []).map((p) => p.id));
        return searchResults.filter((u) => !selectedIds.has(u.id) && !existingIds.has(u.id));
    }, [searchResults, selectedMembers, settings?.participants]);

    const showAlert = useCallback((title: string, message: string) => {
        if (Platform.OS === 'web') {
            window.alert(`${title}: ${message}`);
        } else {
            Alert.alert(title, message);
        }
    }, []);

    /**
     * Handle leaving the group
     */
    const handleLeaveGroup = useCallback(() => {
        setShowLeaveModal(true);
    }, []);

    /**
     * Confirm leaving the group
     */
    const confirmLeaveGroup = useCallback(async () => {
        const success = await leaveGroup();
        if (success) {
            if (onChatRemoved) {
                onChatRemoved(chatId);
            } else {
                onNavigateBack();
            }
        } else {
            throw new Error(t('chat.settings.leaveFailed'));
        }
    }, [leaveGroup, onNavigateBack, onChatRemoved, chatId, t]);

    /**
     * Handle deleting the group
     */
    const handleDeleteGroup = useCallback(() => {
        setShowDeleteModal(true);
    }, []);

    /**
     * Confirm deleting the group
     */
    const confirmDeleteGroup = useCallback(async () => {
        const success = await deleteGroup();
        if (success) {
            if (onChatRemoved) {
                onChatRemoved(chatId);
            } else {
                onNavigateBack();
            }
        } else {
            throw new Error(t('chat.settings.deleteFailed'));
        }
    }, [deleteGroup, onNavigateBack, onChatRemoved, chatId, t]);

    /**
     * Handle updating group name
     */
    const handleUpdateName = useCallback(async () => {
        if (!newName.trim()) {
            setEditNameError(t('chat.settings.nameRequired') || 'Group name is required');
            return;
        }

        setEditNameError(null);
        setEditNameSuccess(null);

        const success = await updateSettings({ name: newName.trim() });
        if (success) {
            setEditNameSuccess(t('chat.settings.updateSuccess') || 'Group name updated successfully');
            setTimeout(() => {
                setShowEditNameModal(false);
                setEditNameSuccess(null);
            }, 2000);
        } else {
            setEditNameError(t('chat.settings.updateFailed') || 'Failed to update group name');
        }
    }, [newName, updateSettings, t]);

    /**
     * Open edit name modal
     */
    const openEditNameModal = useCallback(() => {
        setNewName(settings?.name || '');
        setEditNameSuccess(null);
        setEditNameError(null);
        setShowEditNameModal(true);
    }, [settings?.name]);

    /**
     * Handle adding members
     */
    const handleAddMembers = useCallback(async () => {
        const memberIds = selectedMembers.map((m) => m.id);
        if (memberIds.length === 0) {
            setErrorMessage(t('chat.settings.enterIdentifiers') || 'Please select at least one user');
            return;
        }

        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            const success = await addParticipants(memberIds);
            if (success) {
                setSuccessMessage(t('chat.settings.addSuccess') || 'Successfully added participants');
                setSelectedMembers([]);
                setMemberSearch('');
                setSearchResults([]);
                
                // Keep modal open for 2 seconds to show success state, then close
                setTimeout(() => {
                    setShowAddMembersModal(false);
                    setSuccessMessage(null);
                }, 2000);
            } else {
                setErrorMessage(t('chat.settings.addFailed') || 'Failed to add participants');
            }
        } catch (error: any) {
            setErrorMessage(error.message || t('chat.settings.addFailed'));
        }
    }, [selectedMembers, addParticipants, t]);

    /**
     * Open add members modal
     */
    const openAddMembersModal = useCallback(() => {
        setSelectedMembers([]);
        setMemberSearch('');
        setSearchResults([]);
        setSuccessMessage(null);
        setErrorMessage(null);
        setShowAddMembersModal(true);
    }, []);

    /**
     * Toggle admin-only messaging
     */
    const handleToggleAdminOnly = useCallback(async (value: boolean) => {
        const success = await updateSettings({ onlyAdminsCanSend: value });
        if (!success) {
            showAlert(t('common.error'), t('chat.settings.updateFailed'));
        }
    }, [updateSettings, showAlert, t]);

    /**
     * Toggle send permission for a member
     */
    const handleToggleSendPermission = useCallback(async (member: ChatParticipant) => {
        if (member.canSend) {
            const success = await revokeSendPermission(member.id);
            if (!success) {
                showAlert(t('common.error'), t('chat.settings.revokeFailed'));
            }
        } else {
            const success = await grantSendPermission(member.id);
            if (!success) {
                showAlert(t('common.error'), t('chat.settings.grantFailed'));
            }
        }
    }, [grantSendPermission, revokeSendPermission, showAlert, t]);

    /**
     * Kick member from group
     */
    const handleKickMember = useCallback((member: ChatParticipant) => {
        setMemberToKick(member);
    }, []);

    /**
     * Render member item
     */
    const renderMemberItem = useCallback(({ item }: { item: ChatParticipant }) => {
        const isTargetAdmin = item.permission === 'admin';
        const isTargetMod = item.permission === 'moderator';
        const isSelf = item.id === currentUserId;
        
        const currentUserPerm = settings?.currentUserPermission;
        const canManage = currentUserPerm === 'admin'
            ? (!isTargetAdmin && !isSelf)
            : (currentUserPerm === 'moderator' && !isTargetAdmin && !isTargetMod && !isSelf);

        const isAdmin = isTargetAdmin;

        return (
            <View style={[styles.memberItem, {
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
                borderColor: theme.border.light,
            }]}>
                <TouchableOpacity 
                    style={styles.memberInfo}
                    disabled={!canManage}
                    onPress={() => handleMemberPress(item)}
                    activeOpacity={0.7}
                >
                    <LinearGradient
                        colors={isAdmin 
                            ? [theme.primary.main, theme.primary.dark] 
                            : isTargetMod
                                ? [theme.warning.main, theme.warning.dark || theme.warning.main]
                                : [theme.background.tertiary, theme.background.tertiary]
                        }
                        style={styles.memberAvatar}
                    >
                        <Text style={[styles.memberAvatarText, { color: (isAdmin || isTargetMod) ? '#FFFFFF' : theme.text.secondary }]}>
                            {item.name.charAt(0).toUpperCase()}
                        </Text>
                    </LinearGradient>

                    <View style={styles.memberDetails}>
                        <View style={styles.memberNameRow}>
                            <Text style={[styles.memberName, { color: theme.text.primary }]}>
                                {item.name}
                            </Text>
                            {isAdmin ? (
                                <View style={[styles.roleBadge, { backgroundColor: theme.primary.main + '20' }]}>
                                    <Text style={[styles.roleText, { color: theme.primary.main }]}>{t('chat.settings.admin')}</Text>
                                </View>
                            ) : isTargetMod ? (
                                <View style={[styles.roleBadge, { backgroundColor: theme.warning.main + '20' }]}>
                                    <Text style={[styles.roleText, { color: theme.warning.main }]}>{t('chat.settings.moderator') || 'Moderator'}</Text>
                                </View>
                            ) : null}
                        </View>
                        <Text style={[styles.memberEmail, { color: theme.text.tertiary }]}>
                            {item.email}
                        </Text>
                    </View>
                </TouchableOpacity>

                {canManage ? (
                    <View style={styles.memberActions}>
                        {settings?.settings.onlyAdminsCanSend && (
                            <View style={styles.actionColumn}>
                                <Text style={[styles.actionLabel, { color: theme.text.tertiary }]}>{t('chat.settings.canSend')}</Text>
                                <Switch
                                    value={item.canSend}
                                    onValueChange={() => handleToggleSendPermission(item)}
                                    disabled={isUpdating}
                                    trackColor={{ false: theme.border.main, true: theme.primary.main }}
                                    thumbColor={'#FFFFFF'}
                                    ios_backgroundColor={theme.border.main}
                                    style={{ transform: [{ scale: 0.8 }] }}
                                />
                            </View>
                        )}
                        <TouchableOpacity
                            style={[styles.kickButton, { backgroundColor: theme.error.main + '10' }]}
                            onPress={() => handleKickMember(item)}
                            disabled={isUpdating}
                        >
                            <Icon name="log-out-outline" size={18} color={theme.error.main} />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.statusContainer}>
                        {/* Status indicator if needed */}
                    </View>
                )}
            </View>
        );
    }, [settings, theme, isUpdating, isDark, handleToggleSendPermission, handleKickMember, handleMemberPress, currentUserId, t]);

    const renderHeader = () => (
        <View style={styles.groupHeaderContainer}>
            <View style={styles.groupCard}>
                <View style={styles.groupInfoRow}>
                    <TouchableOpacity
                        disabled={!settings?.isAdmin && settings?.currentUserPermission !== 'moderator'}
                        onPress={handleSelectGroupPicture}
                        activeOpacity={0.7}
                    >
                        {settings?.groupAvatar ? (
                            <Image source={{ uri: settings.groupAvatar }} style={styles.largeGroupIcon} />
                        ) : (
                            <LinearGradient
                                colors={[theme.primary.light, theme.primary.main]}
                                style={styles.largeGroupIcon}
                            >
                                <Icon name="people" size={32} color="#FFFFFF" />
                            </LinearGradient>
                        )}
                        {(settings?.isAdmin || settings?.currentUserPermission === 'moderator') && (
                            <View style={styles.cameraIconBadge}>
                                <Icon name="camera" size={14} color="#FFFFFF" />
                            </View>
                        )}
                    </TouchableOpacity>

                    <View style={styles.groupTextInfo}>
                        <Text style={[styles.groupNameTitle, { color: theme.text.primary }]}>
                            {settings?.name}
                        </Text>

                        <View style={styles.statsRow}>
                            <View style={[styles.statPill, { backgroundColor: theme.background.tertiary }]}>
                                <Icon name="people-outline" size={12} color={theme.text.secondary} />
                                <Text style={[styles.statText, { color: theme.text.secondary }]}>
                                    {t('chat.settings.memberCount', { count: settings?.participantCount || 0 })}
                                </Text>
                            </View>

                            {settings?.tierGroup && (
                                <View style={[styles.statPill, {
                                    backgroundColor: settings.tierGroup === 'premium' ? theme.warning.main + '20' : theme.primary.main + '20',
                                    marginLeft: 8
                                }]}>
                                    <Text style={[styles.statText, {
                                        color: settings.tierGroup === 'premium' ? theme.warning.main : theme.primary.main,
                                        fontWeight: '700'
                                    }]}>
                                        {settings.tierGroup === 'premium' ? 'PREMIUM' : 'FREE'}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                {settings?.isAdmin && (
                    <View style={[styles.settingsSection, {
                        backgroundColor: isDark ? theme.background.secondary : '#FFFFFF',
                        borderColor: theme.border.light,
                        marginTop: 24,
                        marginHorizontal: 0
                    }]}>
                        <View style={styles.sectionHeaderRow}>
                            <Icon name="settings-outline" size={18} color={theme.text.secondary} />
                            <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>
                                {t('chat.settings.adminControls')}
                            </Text>
                        </View>

                        <View style={styles.settingRow}>
                            <View style={styles.settingInfo}>
                                <Text style={[styles.settingLabel, { color: theme.text.primary }]}>
                                    {t('chat.settings.onlyAdminsCanSend')}
                                </Text>
                                <Text style={[styles.settingDescription, { color: theme.text.tertiary }]}>
                                    {t('chat.settings.onlyAdminsCanSendDescription')}
                                </Text>
                            </View>
                            <Switch
                                value={settings?.settings.onlyAdminsCanSend || false}
                                onValueChange={handleToggleAdminOnly}
                                disabled={isUpdating}
                                trackColor={{ false: theme.border.main, true: theme.primary.main }}
                                thumbColor={'#FFFFFF'}
                            />
                        </View>
                    </View>
                )}

                <View style={[styles.settingsSection, {
                    backgroundColor: isDark ? theme.background.secondary : '#FFFFFF',
                    borderColor: theme.border.light,
                    marginTop: 16,
                    marginHorizontal: 0
                }]}>
                    <View style={styles.sectionHeaderRow}>
                        <Icon name="shield-outline" size={18} color={theme.text.secondary} />
                        <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>
                            {t('chat.settings.yourPermissions')}
                        </Text>
                    </View>

                    <View style={styles.permissionRow}>
                        <View style={[styles.statusItem, { backgroundColor: settings?.canSend ? theme.success.main + '15' : theme.error.main + '15' }]}>
                            <Icon
                                name={settings?.canSend ? 'checkmark-circle' : 'close-circle'}
                                size={18}
                                color={settings?.canSend ? theme.success.main : theme.error.main}
                            />
                            <Text style={[styles.statusText, { color: settings?.canSend ? theme.success.main : theme.error.main }]}>
                                {settings?.canSend ? t('chat.settings.youCanSend') : t('chat.settings.youCannotSend')}
                            </Text>
                        </View>

                        <View style={[styles.statusItem, { backgroundColor: theme.primary.main + '15' }]}>
                            <Icon
                                name={settings?.currentUserPermission === 'admin' 
                                    ? 'shield-checkmark' 
                                    : settings?.currentUserPermission === 'moderator'
                                        ? 'shield'
                                        : 'person'
                                }
                                size={18}
                                color={theme.primary.main}
                            />
                            <Text style={[styles.statusText, { color: theme.primary.main }]}>
                                {settings?.currentUserPermission === 'admin' 
                                    ? t('chat.settings.youAreAdmin') 
                                    : settings?.currentUserPermission === 'moderator'
                                        ? (t('chat.settings.youAreModerator') || 'You are a moderator')
                                        : t('chat.settings.youAreMember')
                                }
                            </Text>
                        </View>
                    </View>
                </View>

                {(!settings?.isSystemGroup || (settings?.isSystemGroup && settings?.isAdmin)) && (
                    <View style={[styles.settingsSection, {
                        backgroundColor: isDark ? theme.background.secondary : '#FFFFFF',
                        borderColor: theme.border.light,
                        marginTop: 16,
                        marginHorizontal: 0
                    }]}>
                        <View style={styles.sectionHeaderRow}>
                            <Icon name="cog-outline" size={18} color={theme.text.secondary} />
                            <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>
                                {settings?.type === 'private'
                                    ? t('chat.settings.chatActions') || 'Chat Actions'
                                    : t('chat.settings.groupActions')}
                            </Text>
                        </View>

                        <View style={styles.actionRow}>
                            {settings?.type === 'private' ? (
                                /* Private chats: Delete Chat for any participant */
                                <TouchableOpacity
                                    style={[styles.actionButton, { backgroundColor: theme.error.main + '15' }]}
                                    onPress={handleDeleteGroup}
                                    disabled={isUpdating}
                                >
                                    <Icon name="trash-outline" size={20} color={theme.error.main} />
                                    <Text style={[styles.actionButtonText, { color: theme.error.main, fontWeight: '700' }]}>
                                        {t('chat.settings.deleteChat') || 'Delete Chat'}
                                    </Text>
                                </TouchableOpacity>
                            ) : (
                                /* Group chats: Leave Group + admin-only Change/Delete Group */
                                <>
                                    {settings?.isAdmin && !settings?.isSystemGroup && (
                                        <TouchableOpacity
                                            style={[styles.actionButton, { backgroundColor: theme.primary.main + '10', marginBottom: 12 }]}
                                            onPress={openAddMembersModal}
                                            disabled={isUpdating}
                                        >
                                            <Icon name="person-add-outline" size={20} color={theme.primary.main} />
                                            <Text style={[styles.actionButtonText, { color: theme.primary.main }]}>
                                                {t('chat.settings.addMembers')}
                                            </Text>
                                        </TouchableOpacity>
                                    )}

                                    {settings?.isAdmin && (
                                        <TouchableOpacity
                                            style={[styles.actionButton, { backgroundColor: theme.primary.main + '10', marginBottom: (!settings?.isSystemGroup ? 12 : 0) }]}
                                            onPress={openEditNameModal}
                                            disabled={isUpdating}
                                        >
                                            <Icon name="create-outline" size={20} color={theme.primary.main} />
                                            <Text style={[styles.actionButtonText, { color: theme.primary.main }]}>
                                                {t('chat.settings.changeName')}
                                            </Text>
                                        </TouchableOpacity>
                                    )}

                                    {!settings?.isSystemGroup && (
                                        <TouchableOpacity
                                            style={[styles.actionButton, { backgroundColor: theme.error.main + '10' }]}
                                            onPress={handleLeaveGroup}
                                            disabled={isUpdating}
                                        >
                                            <Icon name="log-out-outline" size={20} color={theme.error.main} />
                                            <Text style={[styles.actionButtonText, { color: theme.error.main }]}>
                                                {t('chat.settings.leaveGroup')}
                                            </Text>
                                        </TouchableOpacity>
                                    )}

                                    {settings?.isAdmin && !settings?.isSystemGroup && (
                                        <TouchableOpacity
                                            style={[styles.actionButton, { backgroundColor: theme.error.main + '15', marginTop: 12 }]}
                                            onPress={handleDeleteGroup}
                                            disabled={isUpdating}
                                        >
                                            <Icon name="trash-outline" size={20} color={theme.error.main} />
                                            <View style={{ flex: 1 }}>
                                                <Text style={[styles.actionButtonText, { color: theme.error.main, fontWeight: '700' }]}>
                                                    {t('chat.settings.deleteGroup')}
                                                </Text>
                                                <Text style={[styles.actionButtonSubtext, { color: theme.error.main + '80' }]}>
                                                    {t('chat.settings.deleteGroupDescription')}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    )}
                                </>
                            )}
                        </View>
                    </View>
                )}

                <View style={styles.listHeaderContainer}>
                    <Text style={[styles.listHeaderTitle, { color: theme.text.primary }]}>
                        {t('chat.settings.members')}
                    </Text>
                </View>
            </View>
        </View >
    );

    if (isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
                <ActivityIndicator size="large" color={theme.primary.main} style={{ marginTop: 100 }} />
            </View>
        );
    }

    if (error) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background.primary, justifyContent: 'center', alignItems: 'center' }]}>
                <Icon name="alert-circle-outline" size={60} color={theme.error.main} />
                <Text style={[styles.errorText, { color: theme.text.secondary }]}>{error}</Text>
                <TouchableOpacity
                    style={[styles.retryButton, { backgroundColor: theme.primary.main }]}
                    onPress={refresh}
                >
                    <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
            <StatusBar barStyle="light-content" />

            {/* Immersive Desktop Header */}
            <View style={[styles.headerDesktop, { backgroundColor: theme.background.secondary, height: isDesktop ? 110 : 80, borderBottomColor: theme.ui.border }]}>
                <TouchableOpacity
                    onPress={onNavigateBack}
                    style={styles.backButtonDesktop}
                >
                    <Icon name="chevron-back" size={24} color={theme.text.primary} />
                    <Text style={[styles.backTextDesktop, { color: theme.text.primary }]}>{t('chat.settings.title')}</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.desktopContentWrapper}>
                <FlatList
                    data={settings?.participants || []}
                    renderItem={renderMemberItem}
                    keyExtractor={(item) => item.id}
                    ListHeaderComponent={renderHeader}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={isLoading}
                            onRefresh={refresh}
                            tintColor={theme.primary.main}
                        />
                    }
                    showsVerticalScrollIndicator={false}
                />
            </View>

            {/* Leave Group Confirmation Modal */}
            <ConfirmationModal
                visible={showLeaveModal}
                onClose={() => setShowLeaveModal(false)}
                onConfirm={confirmLeaveGroup}
                title={t('chat.settings.leaveTitle')}
                message={t('chat.settings.leaveConfirm')}
                confirmText={t('chat.settings.leave') || t('chat.settings.leaveGroup')}
                cancelText={t('common.cancel')}
                destructive
                icon="log-out-outline"
            />

            {/* Delete Group/Chat Confirmation Modal */}
            <ConfirmationModal
                visible={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDeleteGroup}
                title={settings?.type === 'private'
                    ? (t('chat.settings.deleteChatTitle') || 'Delete Chat')
                    : t('chat.settings.deleteTitle')}
                message={settings?.type === 'private'
                    ? (t('chat.settings.deleteChatConfirm') || 'Are you sure you want to delete this chat?')
                    : t('chat.settings.deleteConfirm')}
                confirmText={settings?.type === 'private'
                    ? (t('chat.settings.deleteChat') || 'Delete Chat')
                    : (t('chat.settings.delete') || t('chat.settings.deleteGroup'))}
                cancelText={t('common.cancel')}
                destructive
                icon="trash-outline"
            />

            {/* Kick Member Confirmation Modal */}
            <ConfirmationModal
                visible={memberToKick !== null}
                onClose={() => setMemberToKick(null)}
                onConfirm={async () => {
                    if (memberToKick) {
                        const success = await kickUser(memberToKick.id);
                        setMemberToKick(null);
                        if (!success) {
                            showAlert(t('common.error'), t('chat.settings.kickFailed'));
                        }
                    }
                }}
                title={t('chat.settings.kickTitle')}
                message={t('chat.settings.kickConfirm', { name: memberToKick?.name || '' })}
                confirmText={t('chat.settings.kick') || 'Remove'}
                cancelText={t('common.cancel')}
                destructive
                icon="log-out-outline"
            />

            {/* Edit Group Name Modal */}
            <Modal
                visible={showEditNameModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowEditNameModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.background.secondary, borderColor: theme.border.main }]}>
                        <View style={styles.modalHeader}>
                            <Icon name="create-outline" size={24} color={theme.primary.main} />
                            <Text style={[styles.modalTitle, { color: theme.text.primary }]}>
                                {t('chat.settings.editNameTitle')}
                            </Text>
                        </View>

                        {/* Status Messages */}
                        {editNameSuccess && (
                            <View style={[styles.toastMessage, { backgroundColor: theme.success.main + '20', borderColor: theme.success.main }]}>
                                <Icon name="checkmark-circle-outline" size={20} color={theme.success.main} />
                                <Text style={[styles.toastText, { color: theme.success.main }]}>{editNameSuccess}</Text>
                            </View>
                        )}
                        
                        {editNameError && (
                            <View style={[styles.toastMessage, { backgroundColor: theme.error.main + '20', borderColor: theme.error.main }]}>
                                <Icon name="alert-circle-outline" size={20} color={theme.error.main} />
                                <Text style={[styles.toastText, { color: theme.error.main }]}>{editNameError}</Text>
                            </View>
                        )}

                        <TextInput
                            style={[styles.nameInput, {
                                backgroundColor: isDark ? theme.background.primary : '#F5F7FA',
                                color: theme.text.primary,
                                borderColor: theme.border.main
                            }]}
                            value={newName}
                            onChangeText={setNewName}
                            placeholder={t('chat.settings.newNamePlaceholder')}
                            placeholderTextColor={theme.text.tertiary}
                            autoFocus
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: theme.background.primary }]}
                                onPress={() => setShowEditNameModal(false)}
                            >
                                <Text style={[styles.modalButtonText, { color: theme.text.secondary }]}>
                                    {t('common.cancel')}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: theme.primary.main }]}
                                onPress={handleUpdateName}
                                disabled={isUpdating}
                            >
                                {isUpdating ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text style={[styles.modalButtonText, { color: '#FFFFFF', fontWeight: '700' }]}>
                                        {t('common.save')}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Add Members Modal */}
            <Modal
                visible={showAddMembersModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowAddMembersModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.background.secondary, borderColor: theme.border.main }]}>
                        <View style={styles.modalHeader}>
                            <Icon name="person-add-outline" size={24} color={theme.primary.main} />
                            <Text style={[styles.modalTitle, { color: theme.text.primary }]}>
                                {t('chat.settings.addMembers')}
                            </Text>
                        </View>

                        {/* Status Messages */}
                        {successMessage && (
                            <View style={[styles.toastMessage, { backgroundColor: theme.success.main + '20', borderColor: theme.success.main }]}>
                                <Icon name="checkmark-circle-outline" size={20} color={theme.success.main} />
                                <Text style={[styles.toastText, { color: theme.success.main }]}>{successMessage}</Text>
                            </View>
                        )}
                        
                        {errorMessage && (
                            <View style={[styles.toastMessage, { backgroundColor: theme.error.main + '20', borderColor: theme.error.main }]}>
                                <Icon name="alert-circle-outline" size={20} color={theme.error.main} />
                                <Text style={[styles.toastText, { color: theme.error.main }]}>{errorMessage}</Text>
                            </View>
                        )}

                        <Text style={[styles.settingDescription, { color: theme.text.tertiary, marginBottom: 12 }]}>
                            {t('chat.settings.addMembersDescription')}
                        </Text>

                        {/* Selected Members Chips */}
                        {selectedMembers.length > 0 && (
                            <View style={styles.chipsContainer}>
                                {selectedMembers.map((member) => (
                                    <View
                                        key={member.id}
                                        style={[styles.chip, {
                                            backgroundColor: theme.primary.main + '15',
                                            borderColor: theme.primary.main + '30',
                                        }]}
                                    >
                                        <View style={[styles.chipAvatar, { backgroundColor: theme.primary.main }]}>
                                            <Text style={styles.chipAvatarText}>
                                                {member.name.charAt(0).toUpperCase()}
                                            </Text>
                                        </View>
                                        <Text
                                            style={[styles.chipName, { color: theme.text.primary }]}
                                            numberOfLines={1}
                                        >
                                            {member.name}
                                        </Text>
                                        <TouchableOpacity
                                            onPress={() => removeMemberForAdd(member.id)}
                                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                        >
                                            <Icon name="close-circle" size={18} color={theme.text.tertiary} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Search Input Container */}
                        <View style={[styles.searchContainer, {
                            borderColor: theme.border.main,
                            backgroundColor: isDark ? theme.background.primary : '#F5F7FA',
                            marginBottom: 8,
                        }]}>
                            <Icon name="search" size={18} color={theme.text.tertiary} />
                            <TextInput
                                ref={searchInputRef}
                                style={[styles.searchInput, { color: theme.text.primary }]}
                                placeholder={t('chat.settings.enterIdentifiers') || "Search user by email or name..."}
                                placeholderTextColor={theme.text.tertiary}
                                value={memberSearch}
                                onChangeText={setMemberSearch}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            {isSearching && <ActivityIndicator size="small" color={theme.primary.main} />}
                            {memberSearch.length > 0 && !isSearching && (
                                <TouchableOpacity onPress={() => { setMemberSearch(''); setSearchResults([]); }}>
                                    <Icon name="close-circle" size={18} color={theme.text.tertiary} />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Search Results Dropdown List */}
                        <ScrollView style={{ flex: 1, maxHeight: 200 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={true}>
                            {filteredResults.length > 0 && (
                                <View style={styles.resultsContainer}>
                                    {filteredResults.slice(0, 6).map((user) => (
                                        <TouchableOpacity
                                            key={user.id}
                                            style={[styles.userItem, { backgroundColor: isDark ? theme.background.primary : '#FFFFFF', borderBottomWidth: 1, borderBottomColor: theme.border.light }]}
                                            onPress={() => selectMemberForAdd(user)}
                                            activeOpacity={0.7}
                                        >
                                            <View style={styles.avatarContainer}>
                                                {user.avatar ? (
                                                    <Image source={{ uri: user.avatar }} style={styles.avatar} />
                                                ) : (
                                                    <LinearGradient
                                                        colors={[theme.primary.main, theme.primary.dark || theme.primary.main]}
                                                        style={styles.avatarPlaceholder}
                                                    >
                                                        <Text style={styles.avatarText}>
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </Text>
                                                    </LinearGradient>
                                                )}
                                            </View>

                                            <View style={styles.userInfo}>
                                                <View style={styles.userNameRow}>
                                                    <Text style={[styles.userName, { color: theme.text.primary }]} numberOfLines={1}>
                                                        {user.name}
                                                    </Text>
                                                    {(user.role === 'admin' || user.role === 'superadmin') && (
                                                        <View style={[styles.roleBadge, { backgroundColor: theme.primary.main + '20' }]}>
                                                            <Text style={[styles.roleBadgeText, { color: theme.primary.main }]}>
                                                                {user.role}
                                                            </Text>
                                                        </View>
                                                    )}
                                                </View>
                                                <Text style={[styles.userEmail, { color: theme.text.tertiary }]} numberOfLines={1}>
                                                    {user.email}
                                                </Text>
                                            </View>

                                            <View style={[styles.addButton, { backgroundColor: theme.primary.main + '15' }]}>
                                                <Icon name="add" size={18} color={theme.primary.main} />
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            {/* Empty state */}
                            {memberSearch.length >= 2 && !isSearching && filteredResults.length === 0 && (
                                <View style={styles.emptySearch}>
                                    <Icon name="person-outline" size={24} color={theme.text.tertiary} />
                                    <Text style={[styles.emptySearchText, { color: theme.text.tertiary }]}>
                                        {t('createGroup.noUsersFound') || 'No users found'}
                                    </Text>
                                </View>
                            )}
                        </ScrollView>

                        {/* Modal Action Buttons */}
                        <View style={[styles.modalActions, { marginTop: 16 }]}>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: theme.background.primary }]}
                                onPress={() => setShowAddMembersModal(false)}
                            >
                                <Text style={[styles.modalButtonText, { color: theme.text.secondary }]}>
                                    {t('common.cancel')}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: theme.primary.main }]}
                                onPress={handleAddMembers}
                                disabled={isUpdating || selectedMembers.length === 0}
                            >
                                {isUpdating ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text style={[styles.modalButtonText, { color: '#FFFFFF', fontWeight: '700' }]}>
                                        {selectedMembers.length > 0 
                                            ? `${t('chat.settings.add') || 'Add'} (${selectedMembers.length})`
                                            : t('chat.settings.add') || 'Add'}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const getStyles = (theme: any, isDark: boolean) => StyleSheet.create({
    container: {
        flex: 1,
    },
    headerDesktop: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 45,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: theme.ui.border,
        zIndex: 100,
    },
    backButtonDesktop: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    backTextDesktop: {
        fontSize: 18,
        fontWeight: '700',
    },
    desktopContentWrapper: {
        flex: 1,
    },
    groupHeaderContainer: {
        backgroundColor: theme.background.secondary,
        marginBottom: 8,
    },
    groupInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    groupTextInfo: {
        flex: 1,
    },
    groupCard: {
        width: '100%',
        padding: 24,
    },
    groupIconContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    largeGroupIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    premiumBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#FFB800',
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    cameraIconBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: theme.primary.main,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    groupNameTitle: {
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 4,
        letterSpacing: -0.5,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statText: {
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 6,
    },
    settingsSection: {
        marginHorizontal: 16,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginLeft: 8,
        letterSpacing: 1,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    settingInfo: {
        flex: 1,
        paddingRight: 16,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    settingDescription: {
        fontSize: 13,
        lineHeight: 18,
    },
    permissionRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    statusItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 13,
        fontWeight: '600',
        marginLeft: 6,
    },
    listHeaderContainer: {
        marginTop: 24,
        marginHorizontal: 20,
        marginBottom: 12,
    },
    listHeaderTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    listContent: {
        paddingBottom: 40,
        backgroundColor: theme.background.primary,
    },
    memberItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 0,
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.ui.border,
    },
    memberInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    memberAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    memberAvatarText: {
        fontSize: 18,
        fontWeight: '700',
    },
    memberDetails: {
        marginLeft: 12,
        flex: 1,
    },
    memberNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    memberName: {
        fontSize: 16,
        fontWeight: '600',
        marginRight: 8,
    },
    roleBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    roleText: {
        fontSize: 10,
        fontWeight: '700',
    },
    memberEmail: {
        fontSize: 13,
        marginTop: 2,
    },
    memberActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    actionColumn: {
        alignItems: 'center',
        marginRight: 4,
    },
    actionLabel: {
        fontSize: 10,
        marginBottom: 2,
    },
    kickButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionRow: {
        marginTop: 8,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 12,
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    actionButtonSubtext: {
        fontSize: 12,
        marginTop: 2,
    },
    statusContainer: {},
    errorText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    retryButton: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    nameInput: {
        width: '100%',
        height: 56,
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        borderWidth: 1,
        marginBottom: 24,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
    toastMessage: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        marginBottom: 12,
        gap: 8,
    },
    toastText: {
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 12,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        paddingLeft: 4,
        paddingRight: 10,
        borderRadius: 20,
        borderWidth: 1,
        gap: 6,
    },
    chipAvatar: {
        width: 26,
        height: 26,
        borderRadius: 13,
        justifyContent: 'center',
        alignItems: 'center',
    },
    chipAvatarText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },
    chipName: {
        fontSize: 13,
        fontWeight: '500',
        maxWidth: 100,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 14,
        paddingHorizontal: 14,
        height: 46,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        height: 46,
    },
    resultsContainer: {
        marginTop: 8,
        gap: 4,
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderRadius: 12,
        gap: 12,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 38,
        height: 38,
        borderRadius: 19,
    },
    avatarPlaceholder: {
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
    userInfo: {
        flex: 1,
    },
    userNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    userName: {
        fontSize: 14,
        fontWeight: '600',
    },
    userEmail: {
        fontSize: 12,
        marginTop: 1,
    },
    roleBadgeText: {
        fontSize: 9,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    addButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptySearch: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        gap: 8,
    },
    emptySearchText: {
        fontSize: 14,
    },
});

export default ChatSettingsScreen;
