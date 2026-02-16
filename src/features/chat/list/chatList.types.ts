/**
 * Chat List Types
 * Type definitions for chat list feature
 */

/**
 * Conversation Type
 */
export enum ConversationType {
  PRIVATE = 'private',
  GROUP = 'group',
}

/**
 * User Permissions in Conversation
 */
export interface ConversationPermissions {
  canSend: boolean;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

/**
 * Participant in Conversation
 */
export interface Participant {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
  isOnline?: boolean;
}

/**
 * Last Message in Conversation
 */
export interface LastMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  isRead: boolean;
}

/**
 * Conversation Model (API Response)
 */
export interface Conversation {
  id: string;
  type: ConversationType;
  title: string;
  participants: Participant[];
  lastMessage?: LastMessage;
  unreadCount: number;
  isMuted: boolean;
  isPinned: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  permissions: ConversationPermissions;
  groupAvatar?: string;
}

/**
 * UI Conversation Model (for rendering)
 */
export interface UIConversation {
  id: string;
  type: ConversationType;
  title: string;
  subtitle: string;
  avatarUri?: string;
  avatarUrls?: string[]; // For group chats with multiple avatars
  lastMessageText: string;
  lastMessageTime: string;
  unreadCount: number;
  isMuted: boolean;
  isPinned: boolean;
  showBadge: boolean;
  badgeColor?: string;
  hasPermission: boolean;
  isRead: boolean;
  sortableTimestamp: number;
}

/**
 * Chat List State
 */
export interface ChatListState {
  conversations: UIConversation[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
}

/**
 * API Response for Conversations
 */
export interface ConversationsApiResponse {
  success: boolean;
  message?: string;
  data: {
    conversations: Conversation[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

/**
 * Chat Filter Type
 */
export enum ChatFilter {
  ALL = 'all',
  UNREAD = 'unread',
  PREMIUM = 'premium',
  GROUPS = 'groups',
}
