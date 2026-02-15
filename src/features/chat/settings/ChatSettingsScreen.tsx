/**
 * Chat Settings Screen
 * Shows group info, member list, and admin controls
 */

import React, { useState, useCallback, useMemo } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, useLocalization } from '../../../app/providers';
import { ResponsiveContainer } from '../../../shared/components';
import { useChatSettings } from './chatSettings.hooks';
import { ChatParticipant } from './chatSettings.types';
import { ConfirmationModal } from '../../admin/components/ConfirmationModal';

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
    } = useChatSettings(chatId);

    const [selectedMember, setSelectedMember] = useState<ChatParticipant | null>(null);
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditNameModal, setShowEditNameModal] = useState(false);
    const [newName, setNewName] = useState('');

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
            Alert.alert(t('common.error'), t('chat.settings.nameRequired'));
            return;
        }

        const success = await updateSettings({ name: newName.trim() });
        if (success) {
            setShowEditNameModal(false);
            Alert.alert(t('common.success'), t('chat.settings.updateSuccess'));
        } else {
            Alert.alert(t('common.error'), t('chat.settings.updateFailed'));
        }
    }, [newName, updateSettings, t]);

    /**
     * Open edit name modal
     */
    const openEditNameModal = useCallback(() => {
        setNewName(settings?.name || '');
        setShowEditNameModal(true);
    }, [settings?.name]);

    /**
     * Toggle admin-only messaging
     */
    const handleToggleAdminOnly = useCallback(async (value: boolean) => {
        const success = await updateSettings({ onlyAdminsCanSend: value });
        if (!success) {
            Alert.alert(t('common.error'), t('chat.settings.updateFailed'));
        }
    }, [updateSettings, t]);

    /**
     * Toggle send permission for a member
     */
    const handleToggleSendPermission = useCallback(async (member: ChatParticipant) => {
        if (member.canSend) {
            const success = await revokeSendPermission(member.id);
            if (!success) {
                Alert.alert(t('common.error'), t('chat.settings.revokeFailed'));
            }
        } else {
            const success = await grantSendPermission(member.id);
            if (!success) {
                Alert.alert(t('common.error'), t('chat.settings.grantFailed'));
            }
        }
    }, [grantSendPermission, revokeSendPermission, t]);

    /**
     * Kick member from group
     */
    const handleKickMember = useCallback((member: ChatParticipant) => {
        Alert.alert(
            t('chat.settings.kickTitle'),
            t('chat.settings.kickConfirm', { name: member.name }),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('chat.settings.kick'),
                    style: 'destructive',
                    onPress: async () => {
                        const success = await kickUser(member.id);
                        if (!success) {
                            Alert.alert(t('common.error'), t('chat.settings.kickFailed'));
                        }
                    },
                },
            ]
        );
    }, [kickUser, t]);

    /**
     * Render member item
     */
    const renderMemberItem = useCallback(({ item }: { item: ChatParticipant }) => {
        const isAdmin = item.permission === 'admin';
        const canManage = settings?.isAdmin && !isAdmin;

        return (
            <View style={[styles.memberItem, {
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#FFFFFF',
                borderColor: theme.border.light,
            }]}>
                <View style={styles.memberInfo}>
                    <LinearGradient
                        colors={isAdmin ? [theme.primary.main, theme.primary.dark] : [theme.background.tertiary, theme.background.tertiary]}
                        style={styles.memberAvatar}
                    >
                        <Text style={[styles.memberAvatarText, { color: isAdmin ? '#FFFFFF' : theme.text.secondary }]}>
                            {item.name.charAt(0).toUpperCase()}
                        </Text>
                    </LinearGradient>

                    <View style={styles.memberDetails}>
                        <View style={styles.memberNameRow}>
                            <Text style={[styles.memberName, { color: theme.text.primary }]}>
                                {item.name}
                            </Text>
                            {isAdmin && (
                                <View style={[styles.roleBadge, { backgroundColor: theme.primary.main + '20' }]}>
                                    <Text style={[styles.roleText, { color: theme.primary.main }]}>{t('chat.settings.admin')}</Text>
                                </View>
                            )}
                        </View>
                        <Text style={[styles.memberEmail, { color: theme.text.tertiary }]}>
                            {item.email}
                        </Text>
                    </View>
                </View>

                {canManage && settings?.settings.onlyAdminsCanSend ? (
                    <View style={styles.memberActions}>
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
    }, [settings, theme, isUpdating, isDark, handleToggleSendPermission, handleKickMember, t]);

    const renderHeader = () => (
        <View style={styles.groupHeaderContainer}>
            <View style={styles.groupCard}>
                <View style={styles.groupInfoRow}>
                    <LinearGradient
                        colors={[theme.primary.light, theme.primary.main]}
                        style={styles.largeGroupIcon}
                    >
                        <Icon name="people" size={32} color="#FFFFFF" />
                    </LinearGradient>

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
                                name={settings?.isAdmin ? 'shield-checkmark' : 'person'}
                                size={18}
                                color={theme.primary.main}
                            />
                            <Text style={[styles.statusText, { color: theme.primary.main }]}>
                                {settings?.isAdmin ? t('chat.settings.youAreAdmin') : t('chat.settings.youAreMember')}
                            </Text>
                        </View>
                    </View>
                </View>

                {!settings?.isSystemGroup && (
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
                                    {settings?.isAdmin && (
                                        <TouchableOpacity
                                            style={[styles.actionButton, { backgroundColor: theme.primary.main + '10', marginBottom: 12 }]}
                                            onPress={openEditNameModal}
                                            disabled={isUpdating}
                                        >
                                            <Icon name="create-outline" size={20} color={theme.primary.main} />
                                            <Text style={[styles.actionButtonText, { color: theme.primary.main }]}>
                                                {t('chat.settings.changeName')}
                                            </Text>
                                        </TouchableOpacity>
                                    )}

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

                                    {settings?.isAdmin && (
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
});

export default ChatSettingsScreen;
