/**
 * Conversation Screen V2
 * Clean, modern implementation with premium redesign, theme support, and interactions
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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, useLocalization } from '../../../app/providers';
import { useUser } from '../../../app/auth/auth.hooks';
import { useConversation } from './useConversation';
import { MessageBubble } from './components/MessageBubble';
import { Message } from './types';
import { ChatSettingsScreen } from '../settings';

const { width } = Dimensions.get('window');

interface ConversationScreenProps {
  conversationId: string;
  onNavigateBack: () => void;
}

export const ConversationScreen: React.FC<ConversationScreenProps> = ({
  conversationId,
  onNavigateBack,
}) => {
  const { theme, isDark } = useTheme();
  const { t } = useLocalization();
  const user = useUser();

  const {
    conversation,
    messages,
    isLoading,
    isLoadingMore,
    isSending,
    error,
    hasMore,
    replyingTo,
    editingMessage,
    sendMessage,
    addReaction,
    removeReaction,
    editMessage: editMessageAction,
    deleteMessage,
    togglePin,
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

  // Get current user ID from auth hook
  const currentUserId = user?.id || '';

  /**
   * Handle send message
   */
  const handleSend = useCallback(async () => {
    if (!inputText.trim() || isSending) return;

    const text = inputText.trim();
    setInputText('');
    console.log('[ConversationScreen] handleSend', { text, editingMessage: editingMessage?.id, replyingTo: replyingTo?.id });

    if (editingMessage) {
      try {
        await editMessageAction(editingMessage.id, text);
        console.log('[ConversationScreen] Edit success');
        cancelEditing();
      } catch (err) {
        console.error('[ConversationScreen] Edit failed:', err);
      }
    } else {
      try {
        await sendMessage(text);
        console.log('[ConversationScreen] Send success');
      } catch (err) {
        console.error('[ConversationScreen] Send failed:', err);
      }
    }
  }, [inputText, isSending, editingMessage, replyingTo, sendMessage, editMessageAction, cancelEditing]);

  /**
   * Message Actions
   */
  const handleEdit = () => {
    console.log('[ConversationScreen] handleEdit triggered', selectedMessage?.id);
    if (selectedMessage) {
      const messageToEdit = selectedMessage;
      console.log('[ConversationScreen] Starting edit for:', messageToEdit.id);
      setShowOptions(false);
      setSelectedMessage(null);

      startEditing(messageToEdit);
      setInputText(messageToEdit.content.text || '');
    }
  };

  const handleDelete = () => {
    console.log('[ConversationScreen] handleDelete triggered for:', selectedMessage?.id);
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

  /**
   * Render message item
   */
  const renderMessage = useCallback(
    ({ item, index }: { item: Message; index: number }) => {
      const isMine = item.sender.id === currentUserId;
      const prevMessage = index < messages.length - 1 ? messages[index + 1] : null;
      const nextMessage = index > 0 ? messages[index - 1] : null;

      // Group consecutive messages from same sender
      const showAvatar =
        !isMine &&
        (!nextMessage || nextMessage.sender.id !== item.sender.id);

      const showName =
        !isMine &&
        conversation?.type === 'group' &&
        (!prevMessage || prevMessage.sender.id !== item.sender.id);

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
            const hasReacted = item.reactions?.some(r =>
              r.emoji === emoji && r.users.some(u => u.id === currentUserId)
            );
            if (hasReacted) removeReaction(item.id, emoji);
            else addReaction(item.id, emoji);
          }}
          onReplyPress={() => setReplyingTo(item)}
        />
      );
    },
    [messages, currentUserId, conversation, addReaction, removeReaction, setReplyingTo, setSelectedMessage, setShowOptions]
  );

  /**
   * Render header
   */
  const renderHeader = () => (
    <View
      style={[
        styles.header,
        {
          backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          borderBottomColor: theme.border.light,
          borderBottomWidth: isDark ? 1 : 0,
          elevation: isDark ? 0 : 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
        },
      ]}
    >
      <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
        <Icon name="chevron-back" size={28} color={theme.text.primary} />
      </TouchableOpacity>

      <View style={styles.headerCenter}>
        {conversation?.type === 'group' ? (
          <View
            style={[
              styles.groupBadge,
              { backgroundColor: theme.primary.main },
            ]}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>
              {conversation.name?.substring(0, 2).toUpperCase() || 'GC'}
            </Text>
          </View>
        ) : (
          <View
            style={[
              styles.avatar,
              { backgroundColor: theme.primary.light },
            ]}
          >
            <Text style={styles.avatarText}>
              {conversation?.participants.find(p => p.user.id !== currentUserId)?.user.name.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
        )}

        <View style={styles.headerInfo}>
          <Text
            style={[styles.headerTitle, { color: theme.text.primary }]}
            numberOfLines={1}
          >
            {conversation?.type === 'group'
              ? conversation.name || t('conversation.groupChat')
              : conversation?.participants.find(p => p.user.id !== currentUserId)?.user.name ||
              t('conversation.chat')}
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.text.secondary }]}>
            {conversation?.type === 'group'
              ? t('conversation.participants', { count: conversation.participants.length })
              : t('conversation.online')}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.headerAction}
        onPress={() => setShowSettings(true)}
      >
        <Icon name="ellipsis-vertical" size={20} color={theme.text.tertiary} />
      </TouchableOpacity>
    </View>
  );

  /**
   * Render input bar
   */
  const renderInputBar = () => (
    <View
      style={[
        styles.inputContainer,
        {
          backgroundColor: theme.ui.card,
          borderTopColor: theme.border.light,
        },
      ]}
    >
      {/* Reply/Edit preview */}
      {(replyingTo || editingMessage) && (
        <View
          style={[
            styles.previewBar,
            { backgroundColor: theme.background.secondary, borderLeftWidth: 4, borderLeftColor: theme.primary.main },
          ]}
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.previewTitle, { color: theme.primary.main }]}>
              {editingMessage ? t('conversation.editing') : t('conversation.replyingTo')}
            </Text>
            <Text
              style={[styles.previewText, { color: theme.text.secondary }]}
              numberOfLines={1}
            >
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

      {/* Input row */}
      <View style={styles.inputRow}>
        <TouchableOpacity style={styles.attachButton}>
          <Icon name="add-circle-outline" size={28} color={theme.text.secondary} />
        </TouchableOpacity>

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.background.secondary,
              color: theme.text.primary,
            },
          ]}
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
            {
              backgroundColor: inputText.trim() ? theme.primary.main : theme.background.tertiary,
            },
            Platform.select({
              ios: { shadowColor: theme.primary.main, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
              android: { elevation: 4 }
            })
          ]}
          onPress={handleSend}
          disabled={!inputText.trim() || isSending}
        >
          {isSending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Icon
              name={editingMessage ? "checkmark" : "send"}
              size={18}
              color={inputText.trim() ? '#FFFFFF' : theme.text.tertiary}
            />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      {renderHeader()}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          inverted
          ListFooterComponent={() => isLoadingMore ? (
            <ActivityIndicator style={{ margin: 16 }} color={theme.primary.main} />
          ) : null}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        />

        {renderInputBar()}
      </KeyboardAvoidingView>

      {/* Message Options Modal */}
      <Modal
        visible={showOptions}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowOptions(false);
          setIsDeletingConfirm(false);
        }}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setShowOptions(false);
            setIsDeletingConfirm(false);
          }}
        >
          <View style={[styles.optionsMenu, { backgroundColor: theme.ui.card }]}>
            {isDeletingConfirm ? (
              <View style={styles.confirmDeleteContainer}>
                <Text style={[styles.confirmDescription, { color: theme.text.primary }]}>
                  {t('conversation.deleteConfirm')}
                </Text>
                <TouchableOpacity
                  style={[styles.deleteButton, { backgroundColor: theme.error.main }]}
                  onPress={async () => {
                    if (selectedMessage) {
                      console.log('[ConversationScreen] Custom Delete Confirmed:', selectedMessage.id);
                      try {
                        await deleteMessage(selectedMessage.id);
                        console.log('[ConversationScreen] Delete success');
                      } catch (err) {
                        console.error('[ConversationScreen] Delete failed:', err);
                      }
                      setSelectedMessage(null);
                      setIsDeletingConfirm(false);
                      setShowOptions(false);
                    }
                  }}
                >
                  <Text style={styles.deleteButtonText}>{t('common.delete')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setIsDeletingConfirm(false)}
                >
                  <Text style={[styles.cancelButtonText, { color: theme.text.secondary }]}>
                    {t('common.cancel')}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <TouchableOpacity style={styles.optionItem} onPress={handleReply}>
                  <Icon name="arrow-undo-outline" size={22} color={theme.text.primary} />
                  <Text style={[styles.optionText, { color: theme.text.primary }]}>{t('conversation.reply')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.optionItem} onPress={() => {/* Copy and close */ setShowOptions(false); }}>
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

      {/* Loading Overlay */}
      {isLoading && (
        <View style={[StyleSheet.absoluteFill, styles.loadingOverlay, { backgroundColor: theme.background.primary }]}>
          <ActivityIndicator size="large" color={theme.primary.main} />
        </View>
      )}

      {/* Chat Settings Modal */}
      <Modal
        visible={showSettings}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowSettings(false)}
      >
        <ChatSettingsScreen
          chatId={conversationId}
          onNavigateBack={() => setShowSettings(false)}
        />
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    zIndex: 100,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  groupBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  headerAction: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  messagesContent: {
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  inputContainer: {
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 8 : 4,
  },
  previewBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  previewTitle: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
  },
  previewText: {
    fontSize: 13,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  attachButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 15,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  optionsMenu: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  confirmDeleteContainer: {
    padding: 20,
    alignItems: 'center',
  },
  confirmDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  deleteButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});
