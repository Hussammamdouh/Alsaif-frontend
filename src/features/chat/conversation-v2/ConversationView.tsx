/**
 * Conversation View
 * Reusable component for the core chat interface (messages + input)
 * Used in both full-screen ConversationScreen and desktop split-view
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    StatusBar,
    Modal,
    Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme, useLocalization } from '../../../app/providers';
import { useUser } from '../../../app/auth/auth.hooks';
import { useConversation } from './useConversation';
import { MessageBubble } from './components/MessageBubble';
import { Message } from './types';
import { ChatSettingsScreen } from '../settings';

interface ConversationViewProps {
    conversationId: string;
    hideBackButton?: boolean;
    onNavigateBack?: () => void;
    isSplitView?: boolean;
}

export const ConversationView: React.FC<ConversationViewProps> = ({
    conversationId,
    hideBackButton = false,
    onNavigateBack,
    isSplitView = false,
}) => {
    const { theme, isDark } = useTheme();
    const { t } = useLocalization();
    const user = useUser();
    const styles = useMemo(() => getStyles(theme, isDark), [theme, isDark]);

    const {
        conversation,
        messages,
        isLoading,
        isLoadingMore,
        isSending,
        editingMessage,
        replyingTo,
        sendMessage,
        addReaction,
        removeReaction,
        editMessage: editMessageAction,
        deleteMessage,
        setReplyingTo,
        startEditing,
        cancelEditing,
        loadMore,
        flatListRef,
    } = useConversation(conversationId);

    const [inputText, setInputText] = useState('');
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const [showOptions, setShowOptions] = useState(false);
    const [isDeletingConfirm, setIsDeletingConfirm] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    const currentUserId = user?.id || '';

    const handleSend = useCallback(async () => {
        if (!inputText.trim() || isSending) return;

        const text = inputText.trim();
        setInputText('');

        if (editingMessage) {
            try {
                await editMessageAction(editingMessage.id, text);
                cancelEditing();
            } catch (err) {
                console.error('[ConversationView] Edit failed:', err);
            }
        } else {
            try {
                await sendMessage(text);
            } catch (err) {
                console.error('[ConversationView] Send failed:', err);
            }
        }
    }, [inputText, isSending, editingMessage, sendMessage, editMessageAction, cancelEditing]);

    const handleEdit = () => {
        if (selectedMessage) {
            startEditing(selectedMessage);
            setInputText(selectedMessage.content.text || '');
            setShowOptions(false);
            setSelectedMessage(null);
        }
    };

    const handleDelete = () => {
        if (selectedMessage) {
            setIsDeletingConfirm(true);
        }
    };

    const handleReply = () => {
        if (selectedMessage) {
            setReplyingTo(selectedMessage);
            setShowOptions(false);
        }
    };

    const renderMessage = useCallback(
        ({ item, index }: { item: Message; index: number }) => {
            const isMine = item.sender.id === currentUserId;
            const prevMessage = index < messages.length - 1 ? messages[index + 1] : null;
            const nextMessage = index > 0 ? messages[index - 1] : null;

            const showAvatar = !isMine && (!nextMessage || nextMessage.sender.id !== item.sender.id);
            const showName = !isMine && conversation?.type === 'group' && (!prevMessage || prevMessage.sender.id !== item.sender.id);

            return (
                <MessageBubble
                    message={item}
                    isMine={isMine}
                    showAvatar={showAvatar}
                    showName={showName}
                    isGroupChat={conversation?.type === 'group' || false}
                    currentUserId={currentUserId}
                    isFirstInGroup={!nextMessage || nextMessage.sender.id !== item.sender.id}
                    isLastInGroup={!prevMessage || prevMessage.sender.id !== item.sender.id}
                    onLongPress={() => {
                        setSelectedMessage(item);
                        setShowOptions(true);
                    }}
                    onReactionPress={(emoji) => {
                        const hasReacted = item.reactions?.some(r => r.emoji === emoji && r.users.some(u => u.id === currentUserId));
                        if (hasReacted) removeReaction(item.id, emoji);
                        else addReaction(item.id, emoji);
                    }}
                    onReplyPress={() => setReplyingTo(item)}
                />
            );
        },
        [messages, currentUserId, conversation, addReaction, removeReaction, setReplyingTo]
    );

    const renderHeader = () => (
        <View
            style={[
                styles.header,
                {
                    backgroundColor: theme.background.secondary,
                    borderBottomColor: theme.ui.border,
                    borderBottomWidth: 1,
                    height: isSplitView ? 100 : 80, // Compact height as requested
                    justifyContent: 'center',
                    paddingTop: isSplitView ? 45 : 0, // Match sidebar header top gap
                },
            ]}
        >
            {!hideBackButton && onNavigateBack && (
                <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
                    <Icon name="chevron-back" size={28} color={theme.text.primary} />
                </TouchableOpacity>
            )}

            <View style={[styles.headerCenter, hideBackButton && { marginLeft: 0 }]}>
                {conversation?.type === 'group' ? (
                    <View style={[styles.groupBadge, { backgroundColor: theme.primary.main }]}>
                        <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>
                            {conversation.name?.substring(0, 2).toUpperCase() || 'GC'}
                        </Text>
                    </View>
                ) : (
                    <View style={[styles.avatar, { backgroundColor: theme.primary.light }]}>
                        <Text style={styles.avatarText}>
                            {conversation?.participants.find(p => p.user.id !== currentUserId)?.user.name.charAt(0).toUpperCase() || 'U'}
                        </Text>
                    </View>
                )}

                <View style={styles.headerInfo}>
                    <Text style={[styles.headerTitle, { color: theme.text.primary }]} numberOfLines={1}>
                        {conversation?.type === 'group'
                            ? conversation.name || t('conversation.groupChat')
                            : conversation?.participants.find(p => p.user.id !== currentUserId)?.user.name || t('conversation.chat')}
                    </Text>
                    <Text style={[styles.headerSubtitle, { color: theme.text.secondary }]}>
                        {conversation?.type === 'group'
                            ? t('conversation.participants', { count: conversation.participants.length })
                            : t('conversation.online')}
                    </Text>
                </View>
            </View>

            <TouchableOpacity style={styles.headerAction} onPress={() => setShowSettings(true)}>
                <Icon name="ellipsis-vertical" size={20} color={theme.text.tertiary} />
            </TouchableOpacity>
        </View>
    );

    const renderInputBar = () => (
        <View style={[styles.inputContainer, { backgroundColor: theme.background.secondary, borderTopColor: theme.ui.border }]}>
            {(replyingTo || editingMessage) && (
                <View style={[styles.previewBar, { backgroundColor: theme.background.tertiary, borderLeftWidth: 4, borderLeftColor: theme.primary.main }]}>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.previewTitle, { color: theme.primary.main }]}>
                            {editingMessage ? t('conversation.editing') : t('conversation.replyingTo')}
                        </Text>
                        <Text style={[styles.previewText, { color: theme.text.secondary }]} numberOfLines={1}>
                            {editingMessage?.content.text || replyingTo?.content.text}
                        </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => {
                            if (editingMessage) {
                                cancelEditing();
                                setInputText('');
                            } else {
                                setReplyingTo(null);
                            }
                        }}
                    >
                        <Icon name="close-circle" size={20} color={theme.text.tertiary} />
                    </TouchableOpacity>
                </View>
            )}

            <View style={styles.inputRow}>
                <TouchableOpacity style={styles.attachButton}>
                    <Icon name="add-circle-outline" size={28} color={theme.text.secondary} />
                </TouchableOpacity>

                <TextInput
                    style={[styles.input, { backgroundColor: theme.background.secondary, color: theme.text.primary }]}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder={t('conversation.typeMessage')}
                    placeholderTextColor={theme.text.tertiary}
                    multiline
                    maxLength={5000}
                />

                <TouchableOpacity
                    style={[
                        styles.sendButton,
                        { backgroundColor: inputText.trim() ? theme.primary.main : theme.background.tertiary },
                    ]}
                    onPress={handleSend}
                    disabled={!inputText.trim() || isSending}
                >
                    {isSending ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <Icon name={editingMessage ? "checkmark" : "send"} size={18} color={inputText.trim() ? '#FFFFFF' : theme.text.tertiary} />
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: 'transparent' }]}>
            {renderHeader()}

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={isSplitView ? undefined : (Platform.OS === 'ios' ? 'padding' : 'height')}
                keyboardVerticalOffset={isSplitView ? 0 : (Platform.OS === 'ios' ? 90 : 0)}
            >
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id}
                    inverted
                    ListFooterComponent={() => isLoadingMore ? <ActivityIndicator style={{ margin: 16 }} color={theme.primary.main} /> : null}
                    onEndReached={loadMore}
                    onEndReachedThreshold={0.5}
                    contentContainerStyle={styles.messagesContent}
                    showsVerticalScrollIndicator={false}
                />

                {renderInputBar()}
            </KeyboardAvoidingView>

            <Modal
                visible={showOptions}
                transparent={true}
                animationType="fade"
                onRequestClose={() => { setShowOptions(false); setIsDeletingConfirm(false); }}
            >
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => { setShowOptions(false); setIsDeletingConfirm(false); }}>
                    <View style={[styles.optionsMenu, { backgroundColor: theme.ui.card }]}>
                        {isDeletingConfirm ? (
                            <View style={styles.confirmDeleteContainer}>
                                <Text style={[styles.confirmDescription, { color: theme.text.primary }]}>{t('conversation.deleteConfirm')}</Text>
                                <TouchableOpacity
                                    style={[styles.deleteButton, { backgroundColor: theme.error.main }]}
                                    onPress={async () => {
                                        if (selectedMessage) {
                                            await deleteMessage(selectedMessage.id);
                                            setSelectedMessage(null);
                                            setIsDeletingConfirm(false);
                                            setShowOptions(false);
                                        }
                                    }}
                                >
                                    <Text style={styles.deleteButtonText}>{t('common.delete')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.cancelButton} onPress={() => setIsDeletingConfirm(false)}>
                                    <Text style={[styles.cancelButtonText, { color: theme.text.secondary }]}>{t('common.cancel')}</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <>
                                <TouchableOpacity style={styles.optionItem} onPress={handleReply}>
                                    <Icon name="arrow-undo-outline" size={22} color={theme.text.primary} />
                                    <Text style={[styles.optionText, { color: theme.text.primary }]}>{t('conversation.reply')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.optionItem} onPress={() => setShowOptions(false)}>
                                    <Icon name="copy-outline" size={22} color={theme.text.primary} />
                                    <Text style={[styles.optionText, { color: theme.text.primary }]}>{t('common.copy')}</Text>
                                </TouchableOpacity>
                                {selectedMessage?.sender.id === currentUserId && (
                                    <>
                                        <TouchableOpacity style={styles.optionItem} onPress={handleEdit}>
                                            <Icon name="create-outline" size={22} color={theme.text.primary} />
                                            <Text style={[styles.optionText, { color: theme.text.primary }]}>{t('common.edit')}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.optionItem} onPress={handleDelete}>
                                            <Icon name="trash-outline" size={22} color={theme.error.main} />
                                            <Text style={[styles.optionText, { color: theme.error.main }]}>{t('common.delete')}</Text>
                                        </TouchableOpacity>
                                    </>
                                )}
                            </>
                        )}
                    </View>
                </TouchableOpacity>
            </Modal>

            {isLoading && (
                <View style={[StyleSheet.absoluteFill, styles.loadingOverlay, { backgroundColor: 'rgba(0,0,0,0.1)' }]}>
                    <ActivityIndicator size="large" color={theme.primary.main} />
                </View>
            )}

            <Modal visible={showSettings} animationType="slide" presentationStyle="fullScreen" onRequestClose={() => setShowSettings(false)}>
                <ChatSettingsScreen chatId={conversationId} onNavigateBack={() => setShowSettings(false)} />
            </Modal>
        </View>
    );
};

const getStyles = (theme: any, isDark: boolean) => StyleSheet.create({
    container: { flex: 1 },
    flex: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, zIndex: 100 },
    backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
    headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 8 },
    avatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    avatarText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
    groupBadge: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    headerInfo: { flex: 1 },
    headerTitle: { fontSize: 16, fontWeight: '700' },
    headerSubtitle: { fontSize: 12, marginTop: 2 },
    headerAction: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-end' },
    messagesContent: { paddingVertical: 16, paddingHorizontal: 8 },
    inputContainer: { borderTopWidth: 1, paddingBottom: Platform.OS === 'ios' ? 8 : 4 },
    previewBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 },
    previewTitle: { fontSize: 11, fontWeight: '700', marginBottom: 2 },
    previewText: { fontSize: 13 },
    inputRow: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
    attachButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
    input: { flex: 1, minHeight: 44, maxHeight: 120, borderRadius: 22, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10, fontSize: 15, borderWidth: 1, borderColor: theme.ui.border },
    sendButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    optionsMenu: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20 },
    optionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 12 },
    optionText: { fontSize: 16, fontWeight: '500' },
    confirmDeleteContainer: { padding: 20, alignItems: 'center' },
    confirmDescription: { fontSize: 16, textAlign: 'center', marginBottom: 20, lineHeight: 22 },
    deleteButton: { width: '100%', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
    deleteButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
    cancelButton: { width: '100%', paddingVertical: 12, alignItems: 'center' },
    cancelButtonText: { fontSize: 16, fontWeight: '600' },
    loadingOverlay: { justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
});
