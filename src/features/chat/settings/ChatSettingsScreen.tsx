/**
 * Chat Settings Screen
 * Shows group info, member list, and admin controls
 */

import React, { useState, useCallback } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, useLocalization } from '../../../app/providers';
import { useChatSettings } from './chatSettings.hooks';
import { ChatParticipant } from './chatSettings.types';

const { width } = Dimensions.get('window');

interface ChatSettingsScreenProps {
    chatId: string;
    onNavigateBack: () => void;
}

export const ChatSettingsScreen: React.FC<ChatSettingsScreenProps> = ({
    chatId,
    onNavigateBack,
}) => {
    const { theme, isDark } = useTheme();
    const { t } = useLocalization();
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
    } = useChatSettings(chatId);

    const [selectedMember, setSelectedMember] = useState<ChatParticipant | null>(null);

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
        const isSelf = item.id === settings?.participants.find(p => p.email === item.email)?.id; // Approximate check

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
        <View style={styles.headerContent}>
            {/* Header Background */}
            <LinearGradient
                colors={isDark
                    ? [theme.primary.dark, theme.background.primary]
                    : [theme.primary.main, theme.background.primary]}
                style={styles.headerGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            />

            {/* Back Button */}
            <TouchableOpacity
                onPress={onNavigateBack}
                style={[styles.headerBackButton, { backgroundColor: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)' }]}
            >
                <Icon name="chevron-down" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Group Info Card */}
            <View style={styles.groupCardWrapper}>
                <View style={[styles.groupCard, {
                    backgroundColor: isDark ? theme.background.secondary : '#FFFFFF',
                    shadowColor: theme.shadow.color,
                }]}>
                    <View style={styles.groupIconContainer}>
                        <LinearGradient
                            colors={[theme.primary.light, theme.primary.main]}
                            style={styles.largeGroupIcon}
                        >
                            <Icon name="people" size={40} color="#FFFFFF" />
                        </LinearGradient>
                        {settings?.isSystemGroup && settings?.tierGroup === 'premium' && (
                            <View style={styles.premiumBadge}>
                                <Icon name="star" size={12} color="#FFFFFF" />
                            </View>
                        )}
                    </View>

                    <Text style={[styles.groupNameTitle, { color: theme.text.primary }]}>
                        {settings?.name}
                    </Text>

                    <View style={styles.statsRow}>
                        <View style={[styles.statPill, { backgroundColor: theme.background.tertiary }]}>
                            <Icon name="people-outline" size={14} color={theme.text.secondary} />
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

            {/* Settings Content */}
            {settings?.isAdmin && (
                <View style={[styles.settingsSection, {
                    backgroundColor: isDark ? theme.background.secondary : '#FFFFFF',
                    borderColor: theme.border.light
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

            {/* Permissions Card */}
            <View style={[styles.settingsSection, {
                backgroundColor: isDark ? theme.background.secondary : '#FFFFFF',
                borderColor: theme.border.light,
                marginTop: 16
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

            <View style={styles.listHeaderContainer}>
                <Text style={[styles.listHeaderTitle, { color: theme.text.primary }]}>
                    {t('chat.settings.members')}
                </Text>
            </View>
        </View>
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
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 200,
    },
    headerContent: {
        marginBottom: 8,
        paddingTop: Platform.OS === 'ios' ? 40 : 20,
    },
    headerBackButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 30,
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    groupCardWrapper: {
        alignItems: 'center',
        marginTop: 60,
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    groupCard: {
        width: '100%',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        elevation: 8,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
    },
    groupIconContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    largeGroupIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
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
        fontSize: 24,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
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
    },
    memberItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginVertical: 6,
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
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
});

export default ChatSettingsScreen;
