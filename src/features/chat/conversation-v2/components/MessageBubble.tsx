/**
 * Message Bubble Component V2
 * Clean, modern design with premium gradients and vision-enhanced grouping
 * Fully theme-aware and dark mode compatible
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { Message, MessageReaction } from '../types';
import { useTheme } from '../../../../app/providers';

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
  showAvatar: boolean;
  showName: boolean;
  isGroupChat: boolean;
  currentUserId: string;
  isFirstInGroup?: boolean;
  isLastInGroup?: boolean;
  onLongPress?: () => void;
  onReactionPress?: (emoji: string) => void;
  onReplyPress?: () => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isMine,
  showAvatar,
  showName,
  isGroupChat,
  currentUserId,
  isFirstInGroup = true,
  isLastInGroup = true,
  onLongPress,
  onReactionPress,
  onReplyPress,
}) => {
  const { theme, isDark } = useTheme();

  const bubbleRadiusStyle = {
    borderTopLeftRadius: isFirstInGroup ? 20 : (isMine ? 20 : 4),
    borderTopRightRadius: isFirstInGroup ? 20 : (isMine ? 4 : 20),
    borderBottomLeftRadius: isLastInGroup ? (isMine ? 20 : 4) : (isMine ? 20 : 4),
    borderBottomRightRadius: isLastInGroup ? (isMine ? 4 : 20) : (isMine ? 4 : 20),
  };

  return (
    <View
      style={[
        styles.container,
        isMine && styles.containerMine,
        {
          marginBottom: isLastInGroup ? 12 : 2,
          paddingHorizontal: 12,
        },
      ]}
    >
      {/* Avatar (Incoming only) */}
      {!isMine && isGroupChat && (
        <View style={styles.avatarContainer}>
          {showAvatar ? (
            message.sender.avatar ? (
              <Image source={{ uri: message.sender.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: theme.primary.light, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={styles.avatarText}>
                  {message.sender.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )
          ) : (
            <View style={styles.avatarSpacer} />
          )}
        </View>
      )}

      <View style={[styles.content, { maxWidth: '80%', alignItems: isMine ? 'flex-end' : 'flex-start' }]}>
        {/* Sender name for group chats */}
        {showName && !isMine && isGroupChat && (
          <Text style={[styles.senderName, { color: theme.text.secondary, marginBottom: 4, marginLeft: 4 }]}>
            {message.sender.name}
          </Text>
        )}

        {/* Bubble with LinearGradient for mine, solid for theirs */}
        <TouchableOpacity
          activeOpacity={0.9}
          onLongPress={onLongPress}
          style={Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isDark ? 0.3 : 0.1,
              shadowRadius: 4
            },
            android: { elevation: 2 }
          })}
        >
          {isMine ? (
            <LinearGradient
              colors={[theme.primary.main, theme.primary.dark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.bubble, bubbleRadiusStyle]}
            >
              <Contents message={message} isMine={true} theme={theme} isDark={isDark} onReplyPress={onReplyPress} />
            </LinearGradient>
          ) : (
            <View style={[
              styles.bubble,
              styles.bubbleTheirs,
              bubbleRadiusStyle,
              {
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                borderColor: theme.ui.border,
                borderWidth: 1,
              }
            ]}>
              <Contents message={message} isMine={false} theme={theme} isDark={isDark} onReplyPress={onReplyPress} />
            </View>
          )}
        </TouchableOpacity>

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <View style={[styles.reactionsContainer, { alignSelf: isMine ? 'flex-end' : 'flex-start' }]}>
            {message.reactions.map((reaction: MessageReaction) => {
              const hasReacted = reaction.users.some(u => u.id === currentUserId);
              return (
                <TouchableOpacity
                  key={reaction.emoji}
                  style={[
                    styles.reactionBubble,
                    {
                      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                      borderColor: hasReacted ? theme.primary.main : theme.ui.border,
                      borderWidth: 1,
                    },
                  ]}
                  onPress={() => onReactionPress?.(reaction.emoji)}
                >
                  <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                  <Text style={[styles.reactionCount, { color: hasReacted ? theme.primary.main : theme.text.secondary }]}>
                    {reaction.count}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
};

const Contents: React.FC<{ message: Message; isMine: boolean; theme: any; isDark: boolean; onReplyPress?: () => void }> = ({
  message, isMine, theme, isDark, onReplyPress
}) => (
  <>
    {/* Pinned indicator */}
    {message.isPinned && (
      <View style={styles.metaLabel}>
        <Icon name="pin" size={10} color={isMine ? 'rgba(255,255,255,0.7)' : theme.text.tertiary} />
        <Text style={[styles.metaText, { color: isMine ? 'rgba(255,255,255,0.7)' : theme.text.tertiary }]}>Pinned</Text>
      </View>
    )}

    {/* Forwarded indicator */}
    {message.forwardedFrom && (
      <View style={styles.metaLabel}>
        <Icon name="arrow-redo-outline" size={10} color={isMine ? 'rgba(255,255,255,0.7)' : theme.text.tertiary} />
        <Text style={[styles.metaText, { color: isMine ? 'rgba(255,255,255,0.7)' : theme.text.tertiary }]}>
          Forwarded from {message.forwardedFrom.senderName}
        </Text>
      </View>
    )}

    {/* Reply preview */}
    {message.replyTo && (
      <TouchableOpacity
        style={[
          styles.replyContainer,
          {
            backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
            borderLeftColor: isMine ? '#FFFFFF' : theme.primary.main,
          },
        ]}
        onPress={onReplyPress}
      >
        <Text style={[styles.replyName, { color: isMine ? '#FFFFFF' : theme.primary.main }]}>
          {message.replyTo.senderName}
        </Text>
        <Text style={[styles.replyText, { color: isMine ? 'rgba(255,255,255,0.85)' : theme.text.secondary }]} numberOfLines={1}>
          {message.replyTo.text}
        </Text>
      </TouchableOpacity>
    )}

    {/* Message content based on type */}
    {message.type === 'image' && message.file?.url && (
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: message.file.url }}
          style={styles.imageMessage}
          resizeMode="cover"
        />
      </View>
    )}

    {message.type === 'file' && message.file && (
      <View style={[
        styles.fileContainer,
        { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }
      ]}>
        <Icon
          name="document-text-outline"
          size={24}
          color={isMine ? '#FFFFFF' : theme.primary.main}
        />
        <View style={styles.fileInfo}>
          <Text
            style={[styles.fileName, { color: isMine ? '#FFFFFF' : theme.text.primary }]}
            numberOfLines={1}
          >
            {message.file.name || 'document'}
          </Text>
          <Text style={[styles.fileSize, { color: isMine ? 'rgba(255,255,255,0.7)' : theme.text.tertiary }]}>
            {message.file.size ? (message.file.size / 1024).toFixed(1) : '0'} KB
          </Text>
        </View>
      </View>
    )}

    {/* Message text (if any) */}
    {message.content.text ? (
      <Text style={[styles.text, { color: isMine ? '#FFFFFF' : theme.text.primary, marginTop: message.type !== 'text' ? 8 : 0 }]}>
        {message.content.text}
      </Text>
    ) : null}

    {/* Footer */}
    <View style={styles.footer}>
      <Text style={[styles.time, { color: isMine ? 'rgba(255,255,255,0.7)' : theme.text.tertiary }]}>
        {formatTime(message.createdAt)}
        {message.isEdited && ' • Edited'}
      </Text>
      {isMine && (
        <Icon
          name={getStatusIcon(message.status)}
          size={14}
          color={message.status === 'read' ? (isDark ? '#60A5FA' : '#93C5FD') : 'rgba(255,255,255,0.7)'}
          style={{ marginLeft: 4 }}
        />
      )}
    </View>
  </>
);

const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
};

const getStatusIcon = (status: string): string => {
  switch (status) {
    case 'sending': return 'time-outline';
    case 'sent': return 'checkmark-outline';
    case 'delivered':
    case 'read': return 'checkmark-done-outline';
    case 'failed': return 'alert-circle-outline';
    default: return 'checkmark-outline';
  }
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  containerMine: {
    flexDirection: 'row-reverse',
  },
  avatarContainer: {
    marginRight: 8,
    width: 32,
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  avatarSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  bubbleTheirs: {
    // Other styles handled dynamically
  },
  text: {
    fontSize: 15,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  time: {
    fontSize: 10,
  },
  metaLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 4,
  },
  metaText: {
    fontSize: 10,
    fontStyle: 'italic',
  },
  replyContainer: {
    borderLeftWidth: 3,
    paddingLeft: 8,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 6,
  },
  replyName: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
  },
  replyText: {
    fontSize: 12,
  },
  reactionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: -8, // Pull reactions up slightly to overlap bubble
    zIndex: 1,
  },
  reactionBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  reactionEmoji: {
    fontSize: 12,
  },
  reactionCount: {
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
  },
  imageContainer: {
    width: 240,
    height: 180,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 4,
  },
  imageMessage: {
    width: '100%',
    height: '100%',
  },
  fileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    gap: 12,
    width: 200,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
  },
  fileSize: {
    fontSize: 12,
  },
});
