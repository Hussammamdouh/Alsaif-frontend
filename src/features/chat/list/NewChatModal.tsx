/**
 * New Chat Modal
 * Premium Redesign with glassmorphism, gradients, and refined typography
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    TextInput,
    TouchableOpacity,
    FlatList,
    Image,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Alert,
    Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, useLocalization } from '../../../app/providers';
import { spacing } from '../../../core/theme/spacing';
import { fontSizes, fontWeights } from '../../../core/theme/typography';
import { apiClient } from '../../../core/services/api/apiClient';

const { width } = Dimensions.get('window');

interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role?: string;
}

interface NewChatModalProps {
    isVisible: boolean;
    onClose: () => void;
    onChatCreated: (chatId: string) => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
    isVisible,
    onClose,
    onChatCreated,
}) => {
    const { theme } = useTheme();
    const { t, isRTL } = useLocalization();

    const [searchQuery, setSearchQuery] = useState('');
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [initialMessage, setInitialMessage] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    // Search logic
    useEffect(() => {
        const searchUsers = async () => {
            if (searchQuery.length < 2) {
                setUsers([]);
                return;
            }

            setIsLoading(true);
            try {
                const response = await apiClient.get<any>('/api/users/search', { q: searchQuery });
                if (response.success) {
                    setUsers(response.data.users);
                }
            } catch (error) {
                console.error('[NewChatModal] Search error:', error);
            } finally {
                setIsLoading(false);
            }
        };

        const timeoutId = setTimeout(searchUsers, 500);
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const handleStartChat = async () => {
        if (!selectedUser) return;

        setIsCreating(true);
        try {
            const response = await apiClient.post<any>('/api/chats/private', {
                userId: selectedUser.id,
                initialMessage: initialMessage.trim() || undefined
            });

            if (response.success) {
                onChatCreated(response.data.chat._id);
                handleClose();
            }
        } catch (error) {
            console.error('[NewChatModal] Create chat error:', error);
            Alert.alert(t('common.error'), t('chatList.createError'));
        } finally {
            setIsCreating(false);
        }
    };

    const handleClose = () => {
        setSearchQuery('');
        setUsers([]);
        setSelectedUser(null);
        setInitialMessage('');
        onClose();
    };

    const renderUserItem = ({ item }: { item: User }) => {
        const isSelected = selectedUser?.id === item.id;
        return (
            <TouchableOpacity
                style={[
                    styles.userItem,
                    { backgroundColor: theme.ui.card },
                    isSelected && { borderColor: theme.primary.main, borderWidth: 2, transform: [{ scale: 1.02 }] }
                ]}
                onPress={() => setSelectedUser(item)}
                activeOpacity={0.8}
            >
                <View style={styles.avatarContainer}>
                    {item.avatar ? (
                        <Image source={{ uri: item.avatar }} style={styles.avatar} />
                    ) : (
                        <LinearGradient
                            colors={[theme.primary.main, theme.primary.dark]}
                            style={styles.avatarPlaceholder}
                        >
                            <Text style={styles.avatarPlaceholderText}>{item.name.charAt(0).toUpperCase()}</Text>
                        </LinearGradient>
                    )}
                    <View style={[styles.statusIndicator, { backgroundColor: theme.accent.success }]} />
                </View>

                <View style={styles.userInfo}>
                    <View style={styles.userNameRow}>
                        <Text style={[styles.userName, { color: theme.text.primary }]}>{item.name}</Text>
                        {item.role === 'admin' && (
                            <View style={[styles.roleBadge, { backgroundColor: theme.primary.main + '20' }]}>
                                <Text style={[styles.roleBadgeText, { color: theme.primary.main }]}>ADVISOR</Text>
                            </View>
                        )}
                    </View>
                    <Text style={[styles.userEmail, { color: theme.text.tertiary }]}>{item.email}</Text>
                </View>

                {isSelected ? (
                    <View style={[styles.checkContainer, { backgroundColor: theme.primary.main }]}>
                        <Icon name="checkmark" size={16} color="#FFFFFF" />
                    </View>
                ) : (
                    <Icon name="chevron-forward" size={20} color={theme.text.tertiary} />
                )}
            </TouchableOpacity>
        );
    };

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            transparent={false}
            onRequestClose={handleClose}
        >
            <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
                {/* Premium Header */}
                <LinearGradient
                    colors={['#1e293b', '#0f172a']}
                    style={styles.headerGradient}
                >
                    <View style={styles.header}>
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                            <Icon name="close" size={28} color="#FFFFFF" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>{t('chatList.newChat')}</Text>
                        <View style={styles.headerActions}>
                            <TouchableOpacity style={styles.actionIcon}>
                                <Icon name="ellipsis-horizontal" size={24} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Integrated Search Bar */}
                    <View style={styles.searchSection}>
                        <View style={[styles.searchBar, { backgroundColor: 'rgba(255,255,255,0.08)' }]}>
                            <Icon name="search" size={20} color="rgba(255,255,255,0.4)" style={styles.searchIcon} />
                            <TextInput
                                style={[styles.searchInput, { color: '#FFFFFF', textAlign: isRTL ? 'right' : 'left' }]}
                                placeholder={t('chatList.searchUsers')}
                                placeholderTextColor="rgba(255,255,255,0.4)"
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                autoFocus
                                selectionColor={theme.primary.main}
                            />
                            {isLoading && <ActivityIndicator size="small" color={theme.primary.main} />}
                        </View>
                    </View>
                </LinearGradient>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.content}
                >
                    {/* User List */}
                    <FlatList
                        data={users}
                        keyExtractor={(item) => item.id}
                        renderItem={renderUserItem}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={() => (
                            <View style={styles.emptyContainer}>
                                <View style={[styles.emptyIconCircle, { backgroundColor: theme.background.secondary }]}>
                                    <Icon name="people-outline" size={48} color={theme.text.tertiary} />
                                </View>
                                <Text style={[styles.emptyTitle, { color: theme.text.primary }]}>
                                    {searchQuery.length < 2 ? t('chatList.startTyping') : t('chatList.noUsersFound')}
                                </Text>
                                <Text style={[styles.emptySubtitle, { color: theme.text.tertiary }]}>
                                    {searchQuery.length < 2
                                        ? 'Search for advisors or fellow investors'
                                        : 'Check the spelling or try another name'}
                                </Text>
                            </View>
                        )}
                        showsVerticalScrollIndicator={false}
                    />

                    {/* Premium Footer with Integrated Message Box */}
                    {selectedUser && (
                        <LinearGradient
                            colors={['transparent', theme.background.primary]}
                            style={styles.footerGradient}
                            pointerEvents="box-none"
                        >
                            <View style={[styles.footer, {
                                backgroundColor: theme.ui.card,
                                borderTopColor: theme.border.main + '20',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: -10 },
                                shadowOpacity: 0.1,
                                shadowRadius: 15,
                                elevation: 15
                            }]}>
                                <View style={styles.selectedUserBanner}>
                                    <Text style={[styles.selectedLabel, { color: theme.text.secondary }]}>
                                        Starting conversation with
                                    </Text>
                                    <Text style={[styles.selectedName, { color: theme.primary.main }]}>
                                        {selectedUser.name}
                                    </Text>
                                </View>

                                <View style={[styles.messageInputWrapper, { backgroundColor: theme.background.primary }]}>
                                    <TextInput
                                        style={[styles.messageInput, { color: theme.text.primary, maxHeight: 120 }]}
                                        placeholder={t('chatList.initialMessagePlaceholder')}
                                        placeholderTextColor={theme.text.tertiary}
                                        value={initialMessage}
                                        onChangeText={setInitialMessage}
                                        multiline
                                    />
                                    <TouchableOpacity
                                        style={[styles.sendButton, { backgroundColor: theme.primary.main }]}
                                        onPress={handleStartChat}
                                        disabled={isCreating}
                                    >
                                        {isCreating ? (
                                            <ActivityIndicator color="#FFFFFF" size="small" />
                                        ) : (
                                            <Icon name="send" size={20} color="#FFFFFF" />
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </LinearGradient>
                    )}
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerGradient: {
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: spacing.lg,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.lg,
    },
    headerTitle: {
        fontSize: fontSizes.xl,
        fontWeight: fontWeights.bold as any,
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
    closeButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    headerActions: {
        width: 44,
    },
    actionIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        flex: 1,
    },
    searchSection: {
        paddingHorizontal: spacing.lg,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 16,
        paddingHorizontal: spacing.md,
        height: 54,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    searchIcon: {
        marginRight: spacing.sm,
    },
    searchInput: {
        flex: 1,
        fontSize: fontSizes.base,
        fontWeight: '500',
    },
    listContent: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
        paddingBottom: 150,
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: 20,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: 'transparent',
        // Shadow for premium feel
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    avatarContainer: {
        marginRight: spacing.md,
        position: 'relative',
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    avatarPlaceholder: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarPlaceholderText: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: '700',
    },
    statusIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    userInfo: {
        flex: 1,
    },
    userNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    userName: {
        fontSize: fontSizes.lg,
        fontWeight: '700',
    },
    roleBadge: {
        marginLeft: spacing.sm,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    roleBadgeText: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    userEmail: {
        fontSize: fontSizes.sm,
        letterSpacing: 0.2,
    },
    checkContainer: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 60,
        paddingHorizontal: 40,
    },
    emptyIconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    emptyTitle: {
        fontSize: fontSizes.lg,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: spacing.sm,
    },
    emptySubtitle: {
        fontSize: fontSizes.base,
        textAlign: 'center',
        lineHeight: 22,
    },
    footerGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingTop: 40,
    },
    footer: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: spacing.lg,
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    },
    selectedUserBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    selectedLabel: {
        fontSize: fontSizes.sm,
        marginRight: 6,
    },
    selectedName: {
        fontSize: fontSizes.sm,
        fontWeight: '700',
    },
    messageInputWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        borderRadius: 24,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    messageInput: {
        flex: 1,
        fontSize: fontSizes.base,
        minHeight: 44,
        paddingTop: 10,
        paddingBottom: 10,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: spacing.sm,
        marginBottom: 2,
    },
});
