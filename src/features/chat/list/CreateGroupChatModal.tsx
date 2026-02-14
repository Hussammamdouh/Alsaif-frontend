/**
 * Create Group Chat Modal
 * Admin-only modal for creating custom group chats
 * Features: group settings, tier selection, WhatsApp-style member search + multi-select
 */

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
    View,
    Text,
    Modal,
    TextInput,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Alert,
    Switch,
    Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, useLocalization } from '../../../app/providers';
import { spacing } from '../../../core/theme/spacing';
import { fontSizes, fontWeights } from '../../../core/theme/typography';
import { apiClient } from '../../../core/services/api/apiClient';

const SUBSCRIPTION_TIERS = [
    { id: 'free', labelKey: 'createGroup.freeTier', icon: 'people-outline', descKey: 'createGroup.freeTierDesc' },
    { id: 'premium', labelKey: 'createGroup.premiumTier', icon: 'star-outline', descKey: 'createGroup.premiumTierDesc' },
];

interface User {
    id: string;
    _id?: string;
    name: string;
    email: string;
    avatar?: string;
    role?: string;
}

interface CreateGroupChatModalProps {
    isVisible: boolean;
    onClose: () => void;
    onGroupCreated: (chatId: string) => void;
}

export const CreateGroupChatModal: React.FC<CreateGroupChatModalProps> = ({
    isVisible,
    onClose,
    onGroupCreated,
}) => {
    const { theme, isDark } = useTheme();
    const { t, isRTL } = useLocalization();
    const styles = useMemo(() => getStyles(theme, isDark, isRTL), [theme, isDark, isRTL]);
    const searchInputRef = useRef<TextInput>(null);

    // Form state
    const [groupName, setGroupName] = useState('');
    const [isSystemGroup, setIsSystemGroup] = useState(false);
    const [onlyAdminsCanSend, setOnlyAdminsCanSend] = useState(false);
    const [selectedTiers, setSelectedTiers] = useState<string[]>([]);
    const [isCreating, setIsCreating] = useState(false);

    // Member search state – WhatsApp-style
    const [memberSearch, setMemberSearch] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedMembers, setSelectedMembers] = useState<User[]>([]);

    // Debounced user search
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
                console.error('[CreateGroupChatModal] Search error:', error);
            } finally {
                setIsSearching(false);
            }
        }, 400);

        return () => clearTimeout(timeoutId);
    }, [memberSearch]);

    const toggleTier = useCallback((tierId: string) => {
        setSelectedTiers((prev) =>
            prev.includes(tierId)
                ? prev.filter((id) => id !== tierId)
                : [...prev, tierId]
        );
    }, []);

    /** WhatsApp-style: tap user → add to chips → clear search → refocus input */
    const selectMember = useCallback((user: User) => {
        setSelectedMembers((prev) => {
            if (prev.some((m) => m.id === user.id)) return prev;
            return [...prev, user];
        });
        // Clear search immediately so admin can search for next person
        setMemberSearch('');
        setSearchResults([]);
        // Re-focus input for next search
        setTimeout(() => searchInputRef.current?.focus(), 100);
    }, []);

    const removeMember = useCallback((userId: string) => {
        setSelectedMembers((prev) => prev.filter((m) => m.id !== userId));
    }, []);

    const handleClose = useCallback(() => {
        setGroupName('');
        setIsSystemGroup(false);
        setOnlyAdminsCanSend(false);
        setSelectedTiers([]);
        setMemberSearch('');
        setSearchResults([]);
        setSelectedMembers([]);
        onClose();
    }, [onClose]);

    const handleCreate = useCallback(async () => {
        if (!groupName.trim()) {
            Alert.alert(t('common.error'), t('createGroup.groupNameRequired'));
            return;
        }

        setIsCreating(true);
        try {
            // 1. Create the group
            const createResponse = await apiClient.post<any>('/api/admin/chats/group', {
                name: groupName.trim(),
                isSystemGroup,
                settings: { onlyAdminsCanSend },
            });

            if (!createResponse.success) {
                throw new Error(createResponse.message || 'Failed to create group');
            }

            const chatId = createResponse.data.chat._id;

            // 2. Bulk add participants (tiers + selected member IDs)
            const memberIds = selectedMembers.map((m) => m.id);

            if (selectedTiers.length > 0 || memberIds.length > 0) {
                const bulkResponse = await apiClient.post<any>(
                    `/api/admin/chats/${chatId}/participants/bulk`,
                    { tiers: selectedTiers, identifiers: memberIds },
                );

                if (bulkResponse.success) {
                    const count = bulkResponse.data.addedCount || 0;
                    Alert.alert(
                        t('common.success'),
                        t('createGroup.createdSuccess', { name: groupName.trim(), count: String(count) }),
                    );
                } else {
                    Alert.alert(t('common.success'), t('createGroup.createdPartial'));
                }
            } else {
                Alert.alert(
                    t('common.success'),
                    t('createGroup.createdEmpty', { name: groupName.trim() }),
                );
            }

            onGroupCreated(chatId);
            handleClose();
        } catch (error) {
            console.error('[CreateGroupChatModal] Error:', error);
            Alert.alert(
                t('common.error'),
                error instanceof Error ? error.message : 'Failed to create group',
            );
        } finally {
            setIsCreating(false);
        }
    }, [groupName, isSystemGroup, onlyAdminsCanSend, selectedTiers, selectedMembers, t, onGroupCreated, handleClose]);

    const canCreate = groupName.trim().length >= 3;

    // Filter out already selected members from results
    const filteredResults = useMemo(() => {
        const selectedIds = new Set(selectedMembers.map((m) => m.id));
        return searchResults.filter((u) => !selectedIds.has(u.id));
    }, [searchResults, selectedMembers]);

    return (
        <Modal
            visible={isVisible}
            animationType="fade"
            transparent={true}
            onRequestClose={handleClose}
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.centeredCardContainer, { backgroundColor: theme.background.primary }]}>
                    {/* ── Header ── */}
                    <View style={[styles.headerSection, { backgroundColor: theme.background.secondary }]}>
                        <View style={styles.header}>
                            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                                <Icon name="close" size={24} color={theme.text.primary} />
                            </TouchableOpacity>
                            <View style={styles.headerTitleContainer}>
                                <Icon name="people" size={20} color={theme.primary.main} />
                                <Text style={[styles.headerTitle, { color: theme.text.primary }]}>
                                    {t('createGroup.title')}
                                </Text>
                            </View>
                            <View style={styles.headerActions} />
                        </View>
                    </View>

                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.content}
                    >
                        <ScrollView
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            {/* ── Group Details ── */}
                            <View style={[styles.section, { backgroundColor: theme.ui.card }]}>
                                <View style={styles.sectionHeader}>
                                    <Icon name="chatbubbles-outline" size={18} color={theme.primary.main} />
                                    <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
                                        {t('createGroup.groupDetails')}
                                    </Text>
                                </View>
                                <TextInput
                                    style={[styles.input, {
                                        color: theme.text.primary,
                                        borderColor: theme.border.main,
                                        backgroundColor: theme.background.primary,
                                    }]}
                                    placeholder={t('createGroup.groupNamePlaceholder')}
                                    placeholderTextColor={theme.text.tertiary}
                                    value={groupName}
                                    onChangeText={setGroupName}
                                    maxLength={100}
                                    autoFocus
                                />

                                {/* System Group */}
                                <View style={[styles.settingRow, { borderColor: theme.border.main }]}>
                                    <View style={styles.settingInfo}>
                                        <Icon name="shield-checkmark-outline" size={20} color={theme.primary.main} />
                                        <View style={styles.settingTextContainer}>
                                            <Text style={[styles.settingLabel, { color: theme.text.primary }]}>
                                                {t('createGroup.systemGroup')}
                                            </Text>
                                            <Text style={[styles.settingDescription, { color: theme.text.tertiary }]}>
                                                {t('createGroup.systemGroupDesc')}
                                            </Text>
                                        </View>
                                    </View>
                                    <Switch
                                        value={isSystemGroup}
                                        onValueChange={setIsSystemGroup}
                                        trackColor={{ false: isDark ? '#374151' : '#CBD5E1', true: theme.primary.main + '80' }}
                                        thumbColor={isSystemGroup ? theme.primary.main : isDark ? '#6B7280' : '#F9FAFB'}
                                    />
                                </View>

                                {/* Broadcast Mode */}
                                <View style={[styles.settingRow, { borderColor: theme.border.main }]}>
                                    <View style={styles.settingInfo}>
                                        <Icon name="megaphone-outline" size={20} color={theme.accent.warning} />
                                        <View style={styles.settingTextContainer}>
                                            <Text style={[styles.settingLabel, { color: theme.text.primary }]}>
                                                {t('createGroup.broadcastMode')}
                                            </Text>
                                            <Text style={[styles.settingDescription, { color: theme.text.tertiary }]}>
                                                {t('createGroup.broadcastModeDesc')}
                                            </Text>
                                        </View>
                                    </View>
                                    <Switch
                                        value={onlyAdminsCanSend}
                                        onValueChange={setOnlyAdminsCanSend}
                                        trackColor={{ false: isDark ? '#374151' : '#CBD5E1', true: theme.accent.warning + '80' }}
                                        thumbColor={onlyAdminsCanSend ? theme.accent.warning : isDark ? '#6B7280' : '#F9FAFB'}
                                    />
                                </View>
                            </View>

                            {/* ── Add Members (WhatsApp-style) ── */}
                            <View style={[styles.section, { backgroundColor: theme.ui.card }]}>
                                <View style={styles.sectionHeader}>
                                    <Icon name="person-add-outline" size={18} color={theme.primary.main} />
                                    <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
                                        {t('createGroup.addMembers')}
                                    </Text>
                                    {selectedMembers.length > 0 && (
                                        <View style={[styles.countBadge, { backgroundColor: theme.primary.main }]}>
                                            <Text style={styles.countBadgeText}>{selectedMembers.length}</Text>
                                        </View>
                                    )}
                                </View>

                                {/* Selected Members Chips – shown above search like WhatsApp */}
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
                                                    onPress={() => removeMember(member.id)}
                                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                                >
                                                    <Icon name="close-circle" size={18} color={theme.text.tertiary} />
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                {/* Search Input */}
                                <View style={[styles.searchContainer, {
                                    borderColor: theme.border.main,
                                    backgroundColor: theme.background.primary,
                                }]}>
                                    <Icon name="search" size={18} color={theme.text.tertiary} />
                                    <TextInput
                                        ref={searchInputRef}
                                        style={[styles.searchInput, { color: theme.text.primary }]}
                                        placeholder={t('createGroup.searchPlaceholder')}
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

                                {/* Search Results Dropdown */}
                                {filteredResults.length > 0 && (
                                    <View style={styles.resultsContainer}>
                                        {filteredResults.slice(0, 6).map((user) => (
                                            <TouchableOpacity
                                                key={user.id}
                                                style={[styles.userItem, { backgroundColor: theme.background.primary }]}
                                                onPress={() => selectMember(user)}
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
                                                                    {user.role === 'superadmin' ? t('createGroup.superadmin') : t('createGroup.admin')}
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
                                            {t('createGroup.noUsersFound')}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {/* ── Add by Tier ── */}
                            <View style={[styles.section, { backgroundColor: theme.ui.card }]}>
                                <View style={styles.sectionHeader}>
                                    <Icon name="layers-outline" size={18} color={theme.primary.main} />
                                    <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
                                        {t('createGroup.addByTier')}
                                    </Text>
                                    <Text style={[styles.optionalBadge, { color: theme.text.tertiary }]}>
                                        {t('createGroup.optional')}
                                    </Text>
                                </View>
                                <Text style={[styles.sectionSubtitle, { color: theme.text.tertiary }]}>
                                    {t('createGroup.addByTierDesc')}
                                </Text>
                                <View style={styles.tierContainer}>
                                    {SUBSCRIPTION_TIERS.map((tier) => {
                                        const isSelected = selectedTiers.includes(tier.id);
                                        return (
                                            <TouchableOpacity
                                                key={tier.id}
                                                style={[
                                                    styles.tierButton,
                                                    {
                                                        borderColor: isSelected ? theme.primary.main : theme.border.main,
                                                        backgroundColor: isSelected
                                                            ? theme.primary.main + '10'
                                                            : theme.background.primary,
                                                    },
                                                ]}
                                                onPress={() => toggleTier(tier.id)}
                                                activeOpacity={0.7}
                                            >
                                                <View style={[
                                                    styles.tierIconContainer,
                                                    { backgroundColor: isSelected ? theme.primary.main + '20' : theme.background.secondary }
                                                ]}>
                                                    <Icon
                                                        name={tier.icon as any}
                                                        size={20}
                                                        color={isSelected ? theme.primary.main : theme.text.tertiary}
                                                    />
                                                </View>
                                                <View style={styles.tierInfo}>
                                                    <Text
                                                        style={[
                                                            styles.tierLabel,
                                                            { color: isSelected ? theme.primary.main : theme.text.primary },
                                                        ]}
                                                    >
                                                        {t(tier.labelKey)}
                                                    </Text>
                                                    <Text style={[styles.tierDescription, { color: theme.text.tertiary }]}>
                                                        {t(tier.descKey)}
                                                    </Text>
                                                </View>
                                                {isSelected && (
                                                    <View style={[styles.tierCheck, { backgroundColor: theme.primary.main }]}>
                                                        <Icon name="checkmark" size={14} color="#FFFFFF" />
                                                    </View>
                                                )}
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>

                            {/* Spacer for fixed footer */}
                            <View style={{ height: 100 }} />
                        </ScrollView>
                    </KeyboardAvoidingView>

                    {/* ── Fixed Bottom Button ── */}
                    <LinearGradient
                        colors={['transparent', theme.background.primary, theme.background.primary]}
                        style={styles.footerGradient}
                        pointerEvents="box-none"
                    >
                        <View style={styles.footer}>
                            <TouchableOpacity
                                style={[
                                    styles.createButtonTouchable,
                                    { backgroundColor: canCreate ? theme.primary.main : theme.text.tertiary + '40' },
                                ]}
                                onPress={handleCreate}
                                disabled={isCreating || !canCreate}
                                activeOpacity={0.8}
                            >
                                {isCreating ? (
                                    <ActivityIndicator color="#FFFFFF" />
                                ) : (
                                    <>
                                        <Icon name="chatbubbles" size={20} color="#FFFFFF" />
                                        <Text style={styles.createButtonText}>
                                            {selectedMembers.length > 0
                                                ? t('createGroup.createButtonWithCount', { count: String(selectedMembers.length) })
                                                : t('createGroup.createButton')}
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </LinearGradient>
                </View>
            </View>
        </Modal>
    );
};

/* ────────────────────────── Styles ─────────────────────────── */

const getStyles = (theme: any, isDark: boolean, isRTL: boolean) => StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.md,
    },
    centeredCardContainer: {
        width: '100%',
        maxWidth: 600,
        maxHeight: '90%',
        borderRadius: 24,
        overflow: 'hidden',
        elevation: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
    },
    headerSection: {
        paddingTop: spacing.lg,
        paddingBottom: spacing.md,
    },
    header: {
        flexDirection: isRTL ? 'row-reverse' : 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
    },
    headerTitleContainer: {
        flexDirection: isRTL ? 'row-reverse' : 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerTitle: {
        fontSize: fontSizes.lg,
        fontWeight: fontWeights.bold as any,
        letterSpacing: 0.5,
    },
    closeButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerActions: {
        width: 44,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.lg,
        paddingTop: spacing.md,
    },
    section: {
        padding: spacing.md,
        borderRadius: 20,
        marginBottom: spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    sectionHeader: {
        flexDirection: isRTL ? 'row-reverse' : 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '700',
        flex: 1,
        textAlign: isRTL ? 'right' : 'left',
    },
    sectionSubtitle: {
        fontSize: 13,
        marginBottom: 12,
        lineHeight: 18,
        textAlign: isRTL ? 'right' : 'left',
    },
    optionalBadge: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderRadius: 14,
        paddingHorizontal: 16,
        fontSize: 15,
        marginBottom: 12,
        textAlign: isRTL ? 'right' : 'left',
    },
    settingRow: {
        flexDirection: isRTL ? 'row-reverse' : 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderTopWidth: StyleSheet.hairlineWidth,
    },
    settingInfo: {
        flexDirection: isRTL ? 'row-reverse' : 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    settingTextContainer: {
        alignItems: isRTL ? 'flex-end' : 'flex-start',
    },
    settingLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    settingDescription: {
        fontSize: 12,
        marginTop: 1,
    },

    // Member search – WhatsApp-style
    countBadge: {
        minWidth: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    countBadgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
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
        flexDirection: isRTL ? 'row-reverse' : 'row',
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
        textAlign: isRTL ? 'right' : 'left',
    },
    resultsContainer: {
        marginTop: 8,
        gap: 4,
    },
    userItem: {
        flexDirection: isRTL ? 'row-reverse' : 'row',
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
        flexDirection: isRTL ? 'row-reverse' : 'row',
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
    roleBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
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
        alignItems: 'center',
        paddingVertical: 16,
        gap: 8,
    },
    emptySearchText: {
        fontSize: 13,
        fontWeight: '500',
    },

    // Tier selection
    tierContainer: {
        gap: 10,
    },
    tierButton: {
        flexDirection: isRTL ? 'row-reverse' : 'row',
        alignItems: 'center',
        padding: 12,
        borderWidth: 1.5,
        borderRadius: 14,
        gap: 12,
    },
    tierIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tierInfo: {
        flex: 1,
        alignItems: isRTL ? 'flex-end' : 'flex-start',
    },
    tierLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    tierDescription: {
        fontSize: 12,
        marginTop: 2,
    },
    tierCheck: {
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Footer
    footerGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingTop: 30,
    },
    footer: {
        paddingHorizontal: spacing.lg,
        paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    },
    createButtonTouchable: {
        flexDirection: isRTL ? 'row-reverse' : 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 54,
        borderRadius: 16,
        gap: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 8,
    },
    createButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
    },
});
