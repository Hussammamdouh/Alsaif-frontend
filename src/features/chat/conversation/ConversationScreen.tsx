import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  ListRenderItemInfo,
  KeyboardAvoidingView,
  Platform,
  Modal,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme, useLocalization } from '../../../app/providers';
import { styles } from './conversation.styles';
import { useConversation, useMessageInput } from './conversation.hooks';
import { UIMessage, DaySection, MessageStatus } from './conversation.types';
import { EMPTY_STATE, LIST_CONFIG } from './conversation.constants';
import { formatFileSize } from './conversation.mapper';
import { getRoleBadgeColor, getRoleDisplayName } from './conversation.permissions';

/**
 * Conversation Screen Props
 */
interface ConversationScreenProps {
  conversationId: string;
  onNavigateBack: () => void;
}

/**
 * Day Separator Component
 */
const DaySeparatorComponent = React.memo<{ item: DaySection }>(({ item }) => {
  return (
    <View style={styles.daySeparator}>
      <Text style={styles.daySeparatorText}>
        {item.formattedDate}
      </Text>
    </View>
  );
});

DaySeparatorComponent.displayName = 'DaySeparatorComponent';

/**
 * Action Item Component for Message Menu
 */
interface ActionItemProps {
  icon: string;
  label: string;
  onPress: () => void;
  color?: string;
}

const ActionItem: React.FC<ActionItemProps> = ({ icon, label, onPress, color = '#64748B' }) => (
  <TouchableOpacity onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12 }}>
    <Icon name={icon} size={20} color={color} />
    <Text style={{ marginLeft: 16, fontSize: 16, color: color === '#EF4444' ? color : '#1E293B', fontWeight: '500' }}>{label}</Text>
  </TouchableOpacity>
);

/**
 * Message Contents Component
 */
interface ContentsProps {
  message: UIMessage;
  isMine: boolean;
  t: (key: string, params?: Record<string, string | number>) => string;
  theme: any;
  handleRetry: () => void;
}

const Contents: React.FC<ContentsProps> = ({ message, isMine, t, theme, handleRetry }) => (
  <>
    {/* Pinned label */}
    {message.isPinned && (
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
        <Icon name="pin" size={10} color={isMine ? 'rgba(255,255,255,0.7)' : '#64748B'} />
        <Text style={{ fontSize: 10, color: isMine ? 'rgba(255,255,255,0.7)' : '#64748B', marginLeft: 4 }}>{t('conversation.pinned')}</Text>
      </View>
    )}

    {/* Forwarded label */}
    {message.forwardedFrom && (
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
        <Icon name="arrow-redo-outline" size={10} color={isMine ? 'rgba(255,255,255,0.7)' : '#64748B'} />
        <Text style={{ fontSize: 10, color: isMine ? 'rgba(255,255,255,0.7)' : '#64748B', marginLeft: 4, fontStyle: 'italic' }}>{t('conversation.forwarded')} {message.forwardedFrom.senderName}</Text>
      </View>
    )}

    {/* Reply Preview */}
    {message.replyTo && (
      <View style={{ backgroundColor: isMine ? 'rgba(255,255,255,0.2)' : '#F1F5F9', padding: 8, borderRadius: 12, borderLeftWidth: 3, borderLeftColor: isMine ? '#FFFFFF' : '#4F46E5', marginBottom: 6 }}>
        <Text style={{ fontSize: 11, fontWeight: '700', color: isMine ? '#FFFFFF' : '#4F46E5', marginBottom: 2 }}>{message.replyTo.senderName}</Text>
        <Text style={{ fontSize: 12, color: isMine ? 'rgba(255,255,255,0.9)' : '#475569' }} numberOfLines={1}>{message.replyTo.text}</Text>
      </View>
    )}

    {/* Message Text */}
    {message.isDeleted ? (
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Icon name="ban-outline" size={14} color="#94A3B8" />
        <Text style={{ fontSize: 14, color: '#94A3B8', fontStyle: 'italic', marginLeft: 6 }}>{t('conversation.deleted')}</Text>
      </View>
    ) : (
      <Text style={[styles.messageText, isMine ? styles.messageTextOutgoing : styles.messageTextIncoming]}>
        {message.text}
      </Text>
    )}

    {/* File */}
    {message.fileName && (
      <View style={styles.fileAttachment}>
        <Icon name="document-outline" size={20} color={isMine ? '#FFFFFF' : '#4F46E5'} />
        <View style={styles.fileInfo}>
          <Text style={[styles.fileName, { color: isMine ? '#FFFFFF' : '#1E293B' }]} numberOfLines={1}>{message.fileName}</Text>
          <Text style={[styles.fileSize, { color: isMine ? 'rgba(255,255,255,0.7)' : '#64748B' }]}>{formatFileSize(message.fileSize || 0)}</Text>
        </View>
      </View>
    )}

    {/* Footer */}
    <View style={styles.messageFooter}>
      <Text style={[styles.messageTime, isMine && styles.messageTimeOwn]}>
        {message.formattedTime}
        {message.isEdited && ` • ${t('conversation.edited')}`}
      </Text>
      {isMine && (
        <View style={{ marginLeft: 4 }}>
          {message.status === MessageStatus.SENDING ? (
            <ActivityIndicator size="small" color="#FFFFFF" style={{ transform: [{ scale: 0.6 }] }} />
          ) : (
            <Icon
              name={message.status === MessageStatus.READ ? "checkmark-done" : "checkmark"}
              size={14}
              color={message.status === MessageStatus.READ ? '#93C5FD' : 'rgba(255,255,255,0.7)'}
            />
          )}
        </View>
      )}
    </View>

    {isMine && message.isFailed && (
      <TouchableOpacity onPress={handleRetry} style={{ marginTop: 8, paddingVertical: 4, alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)' }}>
        <Text style={{ fontSize: 12, color: '#FFFFFF', fontWeight: '700' }}>{t('conversation.retry')}</Text>
      </TouchableOpacity>
    )}
  </>
);

/**
 * Message Bubble Component
 * Specialized for premium aesthetics
 */
const MessageBubble = React.memo<{
  message: UIMessage;
  isGroupChat: boolean;
  onRetry: (messageId: string) => void;
  onEdit?: (message: UIMessage) => void;
  onDelete?: (messageId: string) => void;
  onReply?: (message: UIMessage) => void;
  onReact?: (messageId: string, emoji: string) => void;
  onRemoveReact?: (messageId: string, emoji: string) => void;
  onTogglePin?: (messageId: string, isPinned: boolean) => void;
}>(({ message, isGroupChat, onRetry, onEdit, onDelete, onReply, onReact, onRemoveReact, onTogglePin }) => {
  const { theme } = useTheme();
  const { t } = useLocalization();
  const [showActions, setShowActions] = useState(false);

  const handleRetry = useCallback(() => {
    onRetry(message.id);
  }, [message.id, onRetry]);

  const handleLongPress = useCallback(() => {
    setShowActions(true);
  }, []);

  const handleEdit = useCallback(() => {
    setShowActions(false);
    onEdit?.(message);
  }, [message, onEdit]);

  const handleDelete = useCallback(() => {
    setShowActions(false);
    onDelete?.(message.id);
  }, [message.id, onDelete]);

  const handleReply = useCallback(() => {
    setShowActions(false);
    onReply?.(message);
  }, [message, onReply]);

  const handleTogglePin = useCallback(() => {
    setShowActions(false);
    onTogglePin?.(message.id, !message.isPinned);
  }, [message.id, message.isPinned, onTogglePin]);

  const bubbleRadiusStyle = {
    borderTopLeftRadius: message.isMine ? 20 : (message.isFirstInGroup ? 20 : 4),
    borderTopRightRadius: !message.isMine ? 20 : (message.isFirstInGroup ? 20 : 4),
    borderBottomLeftRadius: message.isMine ? 20 : (message.isLastInGroup ? 4 : 4),
    borderBottomRightRadius: !message.isMine ? 20 : (message.isLastInGroup ? 4 : 4),
  };

  return (
    <View
      style={[
        styles.messageContainer,
        message.isMine && styles.messageContainerOwn,
        { marginBottom: message.isLastInGroup ? 12 : 2 },
      ]}
    >
      {/* Avatar (Incoming only) */}
      {!message.isMine && isGroupChat && (
        <View style={styles.messageAvatarPlaceholder}>
          {message.showAvatar && (
            message.senderAvatar ? (
              <Image source={{ uri: message.senderAvatar }} style={styles.messageAvatar} />
            ) : (
              <View style={[styles.messageAvatar, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#E2E8F0' }]}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text.primary }}>
                  {message.senderName?.charAt(0).toUpperCase()}
                </Text>
              </View>
            )
          )}
        </View>
      )}

      {/* Bubble with LinearGradient for mine, solid for theirs */}
      <View style={{ maxWidth: '80%' }}>
        {/* Sender Name */}
        {!message.isMine && isGroupChat && message.showSenderName && (
          <Text style={styles.messageSenderName}>{message.senderName}</Text>
        )}

        <TouchableOpacity
          onLongPress={handleLongPress}
          activeOpacity={0.9}
          disabled={message.isDeleted}
        >
          {message.isMine ? (
            <LinearGradient
              colors={['#4F46E5', '#6366F1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.messageBubble, bubbleRadiusStyle, message.isFailed && styles.messageBubbleFailed]}
            >
              <Contents message={message} isMine={true} t={t} theme={theme} handleRetry={handleRetry} />
            </LinearGradient>
          ) : (
            <View style={[styles.messageBubble, styles.messageBubbleIncoming, bubbleRadiusStyle, message.isDeleted && { backgroundColor: '#F1F5F9' }]}>
              <Contents message={message} isMine={false} t={t} theme={theme} handleRetry={handleRetry} />
            </View>
          )}
        </TouchableOpacity>

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4, gap: 4, alignSelf: message.isMine ? 'flex-end' : 'flex-start' }}>
            {message.reactions.map((reaction) => (
              <TouchableOpacity
                key={reaction.emoji}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#FFFFFF',
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#E2E8F0',
                }}
                onPress={() => {
                  // Logic for reactions
                }}
              >
                <Text style={{ fontSize: 12 }}>{reaction.emoji}</Text>
                <Text style={{ fontSize: 10, marginLeft: 3, fontWeight: '700', color: '#64748B' }}>{reaction.count}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Actions Modal */}
      <Modal visible={showActions} transparent animationType="fade" onRequestClose={() => setShowActions(false)}>
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }} activeOpacity={1} onPress={() => setShowActions(false)}>
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 20, width: '80%', padding: 16 }}>
            <ActionItem icon="arrow-undo-outline" label={t('conversation.reply')} onPress={handleReply} />
            {message.isMine && !message.isDeleted && <ActionItem icon="create-outline" label={t('conversation.edit')} onPress={handleEdit} />}
            <ActionItem icon={message.isPinned ? "pin" : "pin-outline"} label={message.isPinned ? t('conversation.unpin') : t('conversation.pin')} onPress={handleTogglePin} />
            {message.isMine && !message.isDeleted && <ActionItem icon="trash-outline" label={t('conversation.delete')} onPress={handleDelete} color="#EF4444" />}
            <ActionItem icon="close-outline" label={t('common.cancel')} onPress={() => setShowActions(false)} />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
});

MessageBubble.displayName = 'MessageBubble';

/**
 * Settings Modal Component
 */
const SettingsModal = React.memo<{
  visible: boolean;
  onClose: () => void;
}>(({ visible, onClose }) => {
  const { theme, toggleTheme, themeMode } = useTheme();
  const { t, language, toggleLanguage } = useLocalization();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' }} activeOpacity={1} onPress={onClose}>
        <View style={{ backgroundColor: theme.background.primary, borderRadius: 16, padding: 24, width: '80%', maxWidth: 400 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: '600', color: theme.text.primary }}>{t('common.settings')}</Text>
            <TouchableOpacity onPress={onClose}><Icon name="close" size={24} color={theme.text.secondary} /></TouchableOpacity>
          </View>
          <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: theme.border.light }} onPress={toggleTheme}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name={themeMode === 'dark' ? 'moon' : 'sunny'} size={24} color={theme.primary.main} style={{ marginRight: 12 }} />
              <Text style={{ fontSize: 16, color: theme.text.primary }}>{t('common.theme')}</Text>
            </View>
            <Text style={{ fontSize: 14, color: theme.text.secondary }}>{themeMode === 'dark' ? t('common.dark') : t('common.light')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 }} onPress={toggleLanguage}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="language" size={24} color={theme.primary.main} style={{ marginRight: 12 }} />
              <Text style={{ fontSize: 16, color: theme.text.primary }}>{t('common.language')}</Text>
            </View>
            <Text style={{ fontSize: 14, color: theme.text.secondary }}>{language === 'en' ? 'English' : 'العربية'}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
});

SettingsModal.displayName = 'SettingsModal';

/**
 * Conversation Screen Component
 */
export const ConversationScreen: React.FC<ConversationScreenProps> = React.memo(
  ({ conversationId, onNavigateBack }) => {
    const { theme } = useTheme();
    const { t } = useLocalization();

    const {
      conversationInfo,
      messages,
      isLoading,
      permissions,
      replyingTo,
      editingMessage,
      typingUsers,
      handleLoadMore,
      handleSendMessage,
      handleRetryMessage,
      handleEditMessage,
      handleDeleteMessage,
      handleAddReaction,
      handleRemoveReaction,
      handleTogglePin,
      setReplyingTo,
      sendTypingIndicator,
      startEditingMessage,
      cancelEditing,
      flatListRef,
    } = useConversation(conversationId);

    const { text, setText, clearText, isSubmitDisabled } = useMessageInput();
    const [showSettings, setShowSettings] = useState(false);

    const isGroupChat = conversationInfo?.type === 'group';

    const handleSend = useCallback(() => {
      if (!isSubmitDisabled) {
        if (editingMessage) {
          handleEditMessage(editingMessage.id, text);
          clearText();
          cancelEditing();
        } else {
          if (permissions.canSend) {
            handleSendMessage(text);
            clearText();
            setReplyingTo(null);
          }
        }
      }
    }, [text, isSubmitDisabled, permissions.canSend, editingMessage, handleSendMessage, handleEditMessage, clearText, cancelEditing, setReplyingTo]);

    const handleEditPress = useCallback((message: UIMessage) => {
      startEditingMessage(message);
      setText(message.text);
    }, [startEditingMessage, setText]);

    React.useEffect(() => {
      sendTypingIndicator(text.trim().length > 0);
    }, [text, sendTypingIndicator]);

    const renderItem = useCallback(({ item }: ListRenderItemInfo<UIMessage | DaySection>) => {
      if ('type' in item && item.type === 'day-separator') {
        return <DaySeparatorComponent item={item} />;
      }
      return (
        <MessageBubble
          message={item as UIMessage}
          isGroupChat={isGroupChat}
          onRetry={handleRetryMessage}
          onEdit={handleEditPress}
          onDelete={handleDeleteMessage}
          onReply={setReplyingTo}
          onReact={handleAddReaction}
          onRemoveReact={handleRemoveReaction}
          onTogglePin={handleTogglePin}
        />
      );
    }, [isGroupChat, handleRetryMessage, handleEditPress, handleDeleteMessage, setReplyingTo, handleAddReaction, handleRemoveReaction, handleTogglePin]);

    if (isLoading && messages.length === 0) {
      return (
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }]}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      );
    }

    return (
      <View style={[styles.container, { backgroundColor: '#F8FAFC' }]}>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView edges={['top']} style={{ flex: 1 }}>
          {/* Custom Premium Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={onNavigateBack}>
              <Icon name="chevron-back" size={24} color="#475569" />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              {isGroupChat ? (
                <View style={[styles.headerGroupBadge, { backgroundColor: '#4F46E5' }]}>
                  <Text style={styles.headerGroupBadgeText}>{conversationInfo?.title?.substring(0, 2).toUpperCase() || 'GC'}</Text>
                </View>
              ) : (
                <View>
                  {conversationInfo?.avatar ? (
                    <Image source={{ uri: conversationInfo.avatar }} style={styles.headerAvatar} />
                  ) : (
                    <View style={[styles.headerAvatar, { backgroundColor: '#E2E8F0' }]} />
                  )}
                  {conversationInfo?.onlineStatus && <View style={[styles.headerOnlineIndicator, { backgroundColor: '#10B981' }]} />}
                </View>
              )}
              <View style={styles.headerInfo}>
                <Text style={styles.headerTitle} numberOfLines={1}>{conversationInfo?.title || 'Chat'}</Text>
                <Text style={styles.headerSubtitle}>{isGroupChat ? t('conversation.participants', { count: conversationInfo?.memberCount || 0 }) : (conversationInfo?.onlineStatus ? t('conversation.online') : t('conversation.offline'))}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.headerActions} onPress={() => setShowSettings(true)}>
              <Icon name="settings-outline" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Typing Indicator Overlay */}
          {typingUsers.length > 0 && (
            <View style={{ position: 'absolute', top: 90, alignSelf: 'center', backgroundColor: 'rgba(255, 255, 255, 0.9)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, zIndex: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
              <Text style={{ fontSize: 11, color: '#4F46E5', fontWeight: '700' }}>
                {typingUsers[0].name} {t('conversation.typing')}
              </Text>
            </View>
          )}

          {/* Messages List - INVERTED */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderItem}
            keyExtractor={(item) => ('type' in item ? `day-${item.date}` : item.id)}
            inverted={true}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContent}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            initialNumToRender={15}
            showsVerticalScrollIndicator={false}
          />

          {/* Input Area */}
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
            {/* Reply/Edit Indicator */}
            {(replyingTo || editingMessage) && (
              <View style={{ padding: 12, backgroundColor: '#F1F5F9', borderTopWidth: 1, borderTopColor: '#E2E8F0', flexDirection: 'row', alignItems: 'center' }}>
                <Icon name={editingMessage ? "create" : "arrow-undo"} size={16} color="#4F46E5" />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#4F46E5' }}>{editingMessage ? t('conversation.editing') : t('conversation.replyTo')}</Text>
                  <Text style={{ fontSize: 11, color: '#64748B' }} numberOfLines={1}>{editingMessage ? editingMessage.text : replyingTo?.text}</Text>
                </View>
                <TouchableOpacity onPress={cancelEditing}>
                  <Icon name="close-circle" size={20} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            )}

            <View style={[styles.inputContainer, { backgroundColor: '#FFFFFF' }]}>
              <View style={styles.inputRow}>
                <TouchableOpacity style={styles.attachButton}>
                  <Icon name="add-circle-outline" size={28} color="#64748B" />
                </TouchableOpacity>
                <View style={[styles.inputWrapper, { backgroundColor: '#F1F5F9' }]}>
                  <TextInput
                    style={[styles.input, { color: '#1E293B' }]}
                    placeholder={t('conversation.typeMessage')}
                    placeholderTextColor="#94A3B8"
                    value={text}
                    onChangeText={setText}
                    multiline
                  />
                </View>
                {permissions.canSend ? (
                  <TouchableOpacity
                    style={[styles.sendButton, isSubmitDisabled && styles.sendButtonDisabled]}
                    onPress={handleSend}
                    disabled={isSubmitDisabled}
                  >
                    <Icon name={editingMessage ? "checkmark" : "send"} size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                ) : (
                  <View style={{ padding: 10 }}>
                    <Icon name="lock-closed" size={20} color="#94A3B8" />
                  </View>
                )}
              </View>
              {!permissions.canSend && (
                <Text style={{ fontSize: 10, color: '#EF4444', textAlign: 'center', marginTop: 4 }}>
                  {permissions.reason || t('conversation.cannotSendMessages')}
                </Text>
              )}
            </View>
          </KeyboardAvoidingView>

          {/* Settings Modal */}
          <SettingsModal visible={showSettings} onClose={() => setShowSettings(false)} />
        </SafeAreaView>
      </View>
    );
  }
);

ConversationScreen.displayName = 'ConversationScreen';
