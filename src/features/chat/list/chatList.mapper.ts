/**
 * Chat List Mapper
 * Transforms API conversation models to UI-friendly models
 */

import {
  Conversation,
  UIConversation,
  ConversationType,
} from './chatList.types';
import { BADGE_CONFIG } from './chatList.constants';

/**
 * Format timestamp to human-readable format
 * - "10:42 AM" for today
 * - "Yesterday" for yesterday
 * - "Mon" for this week
 * - "Jan 15" for older
 */
export const formatTimestamp = (timestamp: string): string => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Today - show time
  if (diffDays === 0) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${ampm}`;
  }

  // Yesterday
  if (diffDays === 1) {
    return 'Yesterday';
  }

  // This week - show day name
  if (diffDays < 7) {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return dayNames[date.getDay()];
  }

  // Older - show date
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${monthNames[date.getMonth()]} ${date.getDate()}`;
};

/**
 * Format unread count for display
 * Shows "99+" if count exceeds max
 */
export const formatUnreadCount = (count: number): string => {
  if (count > BADGE_CONFIG.MAX_COUNT) {
    return BADGE_CONFIG.MAX_COUNT_DISPLAY;
  }
  return count.toString();
};

/**
 * Get conversation title
 * For private chats, returns participant name
 * For group chats, returns group title
 */
const getConversationTitle = (conversation: Conversation, currentUserId?: string): string => {
  if (conversation.type === ConversationType.PRIVATE) {
    // For private chats, use the other participant's name
    const otherParticipant = conversation.participants.find(p => p.id !== currentUserId) || conversation.participants[0];
    return otherParticipant?.name || 'Unknown User';
  }

  // For group chats, use the group title
  return conversation.title;
};

/**
 * Get conversation subtitle
 * Returns role or participant count
 */
const getConversationSubtitle = (conversation: Conversation, currentUserId?: string): string => {
  if (conversation.type === ConversationType.PRIVATE) {
    const participant = conversation.participants.find(p => p.id !== currentUserId) || conversation.participants[0];
    return participant?.role ? `(${participant.role.toUpperCase()})` : '';
  }

  // For groups, show participant count
  const count = conversation.participants.length;
  return count > 0 ? `${count} member${count !== 1 ? 's' : ''}` : '';
};

/**
 * Get avatar URI
 * For private chats, returns participant avatar
 * For group chats, returns group avatar or participant avatars
 */
const getAvatarData = (
  conversation: Conversation,
  currentUserId?: string
): { avatarUri?: string; avatarUrls?: string[] } => {
  if (conversation.type === ConversationType.PRIVATE) {
    const participant = conversation.participants.find(p => p.id !== currentUserId) || conversation.participants[0];
    return {
      avatarUri: participant?.avatar,
    };
  }

  // For group chats
  if (conversation.groupAvatar) {
    return {
      avatarUri: conversation.groupAvatar,
    };
  }

  // Use participant avatars
  const avatarUrls = conversation.participants
    .slice(0, 3)
    .map(p => p.avatar)
    .filter((avatar): avatar is string => !!avatar);

  return {
    avatarUrls: avatarUrls.length > 0 ? avatarUrls : undefined,
  };
};

/**
 * Get last message text
 * Formats with sender name for group chats
 */
const getLastMessageText = (conversation: Conversation): string => {
  if (!conversation.lastMessage) {
    return '';
  }

  const { text, senderName } = conversation.lastMessage;

  // For group chats, prefix with sender name
  if (conversation.type === ConversationType.GROUP) {
    // Find sender's first name
    const firstName = senderName.split(' ')[0];
    return `${firstName}: ${text}`;
  }

  return text;
};

/**
 * Get badge color based on conversation type
 */
const getBadgeColor = (conversation: Conversation): string | undefined => {
  // Premium badge for advisors
  const hasPremiumParticipant = conversation.participants.some(
    p => p.role === 'advisor' || p.role === 'analyst'
  );

  if (hasPremiumParticipant && conversation.type === ConversationType.PRIVATE) {
    return '#F59E0B'; // Gold/amber color for premium
  }

  return undefined;
};

/**
 * Map Conversation to UIConversation
 * Transforms API model to UI-friendly model
 *
 * @param conversation - API conversation model
 * @param currentUserId - ID of current user to filter participants
 * @returns UI conversation model
 */
export const mapConversationToUI = (conversation: Conversation, currentUserId?: string): UIConversation => {
  const avatarData = getAvatarData(conversation, currentUserId);
  const lastMessageText = getLastMessageText(conversation);
  const lastMessageTime = conversation.lastMessage
    ? formatTimestamp(conversation.lastMessage.timestamp)
    : '';

  const sortableTimestamp = conversation.lastMessage?.timestamp
    ? new Date(conversation.lastMessage.timestamp).getTime()
    : new Date(conversation.updatedAt || conversation.createdAt).getTime();

  return {
    id: conversation.id,
    type: conversation.type,
    title: getConversationTitle(conversation, currentUserId),
    subtitle: getConversationSubtitle(conversation, currentUserId),
    avatarUri: avatarData.avatarUri,
    avatarUrls: avatarData.avatarUrls,
    lastMessageText,
    lastMessageTime,
    sortableTimestamp,
    unreadCount: conversation.unreadCount,
    isMuted: conversation.isMuted,
    isPinned: conversation.isPinned,
    showBadge: conversation.unreadCount > 0,
    badgeColor: getBadgeColor(conversation),
    hasPermission: conversation.permissions.canView,
    isRead: conversation.lastMessage?.isRead ?? true,
  };
};

/**
 * Map array of Conversations to UIConversations
 *
 * @param conversations - Array of API conversation models
 * @param currentUserId - ID of current user to filter participants
 * @returns Array of UI conversation models
 */
export const mapConversationsToUI = (
  conversations: Conversation[],
  currentUserId?: string
): UIConversation[] => {
  return conversations.map(c => mapConversationToUI(c, currentUserId));
};
