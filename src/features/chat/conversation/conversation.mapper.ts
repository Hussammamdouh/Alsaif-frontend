/**
 * Conversation Mapper
 * Transforms API message models to UI-friendly models
 */

import {
  Message,
  UIMessage,
  MessageStatus,
  DaySection,
} from './conversation.types';
import { MESSAGE_GROUP_THRESHOLD_MS } from './conversation.constants';

/**
 * Format message timestamp to time string
 */
export const formatMessageTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');
  return `${displayHours}:${displayMinutes} ${ampm}`;
};

/**
 * Format day separator date
 */
export const formatDaySeparator = (timestamp: string): string => {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Check if same day as today
  if (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  ) {
    return 'Today';
  }

  // Check if yesterday
  if (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  ) {
    return 'Yesterday';
  }

  // Format as "January 15, 2024"
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

/**
 * Get day key for grouping messages
 */
const getDayKey = (timestamp: string): string => {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
};

/**
 * Check if message should show avatar
 * Shows avatar if:
 * - Not user's own message
 * - Is last message in group from this sender
 */
const shouldShowAvatar = (
  message: Message,
  nextMessage: Message | undefined,
  isGroupChat: boolean,
  currentUserId: string
): boolean => {
  if (!isGroupChat || message.sender.id === currentUserId) {
    return false;
  }

  // Show if last message in group or next message is from different sender
  return !nextMessage || nextMessage.sender.id !== message.sender.id;
};

/**
 * Check if message should show sender name
 * Shows name if:
 * - Group chat
 * - Not user's own message
 * - First message in group from this sender
 */
const shouldShowSenderName = (
  message: Message,
  prevMessage: Message | undefined,
  isGroupChat: boolean,
  currentUserId: string
): boolean => {
  if (!isGroupChat || message.sender.id === currentUserId) {
    return false;
  }

  // Show if first message in group or prev message is from different sender
  return !prevMessage || prevMessage.sender.id !== message.sender.id;
};

/**
 * Check if message is first in visual group
 */
const isFirstInGroup = (
  message: Message,
  prevMessage: Message | undefined
): boolean => {
  if (!prevMessage) return true;

  // Different sender = new group
  if (prevMessage.sender.id !== message.sender.id) return true;

  // Time gap too large = new group
  const timeDiff =
    new Date(message.createdAt).getTime() -
    new Date(prevMessage.createdAt).getTime();

  return timeDiff > MESSAGE_GROUP_THRESHOLD_MS;
};

/**
 * Check if message is last in visual group
 */
const isLastInGroup = (
  message: Message,
  nextMessage: Message | undefined
): boolean => {
  if (!nextMessage) return true;

  // Different sender = end of group
  if (nextMessage.sender.id !== message.sender.id) return true;

  // Time gap too large = end of group
  const timeDiff =
    new Date(nextMessage.createdAt).getTime() -
    new Date(message.createdAt).getTime();

  return timeDiff > MESSAGE_GROUP_THRESHOLD_MS;
};

/**
 * Format file size to human-readable string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * Map Message to UIMessage
 */
export const mapMessageToUI = (
  message: Message,
  prevMessage: Message | undefined,
  nextMessage: Message | undefined,
  isGroupChat: boolean,
  currentUserId: string
): UIMessage => {
  const isMine = String(message.sender.id) === String(currentUserId);
  const showAvatar = shouldShowAvatar(message, nextMessage, isGroupChat, currentUserId);
  const showSenderName = shouldShowSenderName(message, prevMessage, isGroupChat, currentUserId);

  // Extract text from content
  let text = message.content.text || '';
  if (message.content.type === 'file' && message.content.fileName) {
    text = message.content.fileName;
  }

  return {
    id: message.id,
    senderId: message.sender.id,
    senderName: message.sender.name,
    senderAvatar: message.sender.avatar,
    senderRole: message.sender.role,
    text,
    fileName: message.content.fileName,
    fileSize: message.content.fileSize,
    timestamp: message.createdAt,
    formattedTime: formatMessageTime(message.createdAt),
    editedAt: message.editedAt,
    status: message.status,
    isMine,
    showAvatar,
    showSenderName,
    isFirstInGroup: isFirstInGroup(message, prevMessage),
    isLastInGroup: isLastInGroup(message, nextMessage),
    isEdited: message.isEdited || false,
    isFailed: message.status === MessageStatus.FAILED,
    replyTo: message.replyTo,
    reactions: message.reactions,
    readBy: message.readBy,
    isPinned: message.isPinned,
    isDeleted: message.isDeleted,
    forwardedFrom: message.forwardedFrom
      ? {
        senderName: message.forwardedFrom.senderName,
      }
      : undefined,
  };
};

/**
 * Map Messages to UI Messages with day separators
 */
export const mapMessagesToUI = (
  messages: Message[],
  isGroupChat: boolean,
  currentUserId: string
): Array<UIMessage | DaySection> => {
  const result: Array<UIMessage | DaySection> = [];

  // We expect messages to be [Newest, ..., Oldest] for an inverted FlatList
  messages.forEach((message, index) => {
    const prevMessage = index > 0 ? messages[index - 1] : undefined;
    const nextMessage = index < messages.length - 1 ? messages[index + 1] : undefined;

    // Add the message first (index 0 is at the bottom visually)
    result.push(mapMessageToUI(message, prevMessage, nextMessage, isGroupChat, currentUserId));

    // Check if we need a day separator ABOVE this message group
    // In an inverted list, "ABOVE" means later in the array/data
    const currentDay = getDayKey(message.createdAt);
    const nextDay = nextMessage ? getDayKey(nextMessage.createdAt) : null;

    if (currentDay !== nextDay) {
      result.push({
        type: 'day-separator',
        date: message.createdAt,
        formattedDate: formatDaySeparator(message.createdAt),
      });
    }
  });

  return result;
};

/**
 * Create optimistic UI message (before server confirms)
 */
export const createOptimisticMessage = (
  _conversationId: string,
  text: string,
  tempId: string,
  currentUserId: string,
  currentUserName: string
): UIMessage => {
  return {
    id: tempId,
    senderId: currentUserId,
    senderName: currentUserName,
    senderAvatar: undefined,
    senderRole: undefined,
    text,
    timestamp: new Date().toISOString(),
    formattedTime: formatMessageTime(new Date().toISOString()),
    status: MessageStatus.SENDING,
    isMine: true,
    showAvatar: false,
    showSenderName: false,
    isFirstInGroup: true,
    isLastInGroup: true,
    isEdited: false,
    isFailed: false,
  };
};

/**
 * Update optimistic message with server response
 */
export const reconcileOptimisticMessage = (
  optimisticMessage: UIMessage,
  serverMessage: Message,
  _isGroupChat: boolean
): UIMessage => {
  return {
    ...optimisticMessage,
    id: serverMessage.id,
    timestamp: serverMessage.createdAt,
    formattedTime: formatMessageTime(serverMessage.createdAt),
    status: serverMessage.status,
    isFailed: false,
  };
};
