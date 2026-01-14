/**
 * Conversation Types
 * Type definitions for chat conversation feature
 */

/**
 * Message Status
 */
export enum MessageStatus {
  SENDING = 'sending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

/**
 * Message Type
 */
export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  AUDIO = 'audio',
  VIDEO = 'video',
}

/**
 * User Role in Group Chat
 */
export enum GroupRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  ANALYST = 'analyst',
  READ_ONLY = 'read-only',
}

/**
 * Message Content
 */
export interface MessageContent {
  text?: string;
  type: MessageType;
  fileName?: string;
  fileSize?: number;
  fileUrl?: string;
  thumbnailUrl?: string;
}

/**
 * Message Sender Info
 */
export interface MessageSender {
  id: string;
  name: string;
  avatar?: string;
  role?: GroupRole;
}

/**
 * Message Reaction
 */
export interface MessageReaction {
  emoji: string;
  users: Array<{ id: string; name: string }>;
  count: number;
}

/**
 * Reply Information
 */
export interface ReplyInfo {
  messageId: string;
  senderId: string;
  senderName: string;
  text: string;
}

/**
 * Message Model (API Response)
 */
export interface Message {
  id: string;
  conversationId: string;
  sender: MessageSender;
  content: MessageContent;
  createdAt: string;
  updatedAt?: string;
  status: MessageStatus;
  isEdited?: boolean;
  editedAt?: string;
  replyTo?: ReplyInfo;
  reactions?: MessageReaction[];
  readBy?: string[];
  isPinned?: boolean;
  isDeleted?: boolean;
  deletedAt?: string;
  forwardedFrom?: {
    senderId: string;
    senderName: string;
    conversationId: string;
  };
}

/**
 * UI Message Model (for rendering)
 */
export interface UIMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  senderRole?: GroupRole;
  text: string;
  fileName?: string;
  fileSize?: number;
  timestamp: string;
  formattedTime: string;
  editedAt?: string;
  status: MessageStatus;
  isMine: boolean;
  showAvatar: boolean;
  showSenderName: boolean;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
  isEdited: boolean;
  isFailed: boolean;
  replyTo?: ReplyInfo;
  reactions?: MessageReaction[];
  readBy?: string[];
  isPinned?: boolean;
  isDeleted?: boolean;
  forwardedFrom?: {
    senderName: string;
  };
}

/**
 * Day Section (for grouping messages)
 */
export interface DaySection {
  type: 'day-separator';
  date: string;
  formattedDate: string;
}

/**
 * Conversation Info
 */
export interface ConversationInfo {
  id: string;
  type: 'private' | 'group';
  title: string;
  subtitle?: string;
  avatar?: string;
  memberCount?: number;
  onlineStatus?: boolean;
  isEncrypted?: boolean;
  complianceMessage?: string;
  participants?: Array<{
    user: {
      id?: string;
      _id?: string;
      name?: string;
      email?: string;
      avatar?: string;
    };
    role?: GroupRole;
    permission?: string;
  }>;
}

/**
 * User Permissions in Conversation
 */
export interface ConversationPermissions {
  canSend: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canReply: boolean;
  reason?: string;
}

/**
 * Typing User Info
 */
export interface TypingUser {
  id: string;
  name: string;
}

/**
 * Conversation State
 */
export interface ConversationState {
  conversationInfo: ConversationInfo | null;
  messages: UIMessage[];
  isLoading: boolean;
  isLoadingMore: boolean;
  isSending: boolean;
  error: string | null;
  hasMore: boolean;
  permissions: ConversationPermissions;
  replyingTo: UIMessage | null;
  editingMessage: UIMessage | null;
  typingUsers: TypingUser[];
  pinnedMessages: UIMessage[];
  searchQuery: string;
  searchResults: UIMessage[];
}

/**
 * API Response for Messages
 */
export interface MessagesApiResponse {
  success: boolean;
  message?: string;
  data: {
    conversation: ConversationInfo;
    messages: Message[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
    permissions: ConversationPermissions;
  };
}

/**
 * Send Message Request
 */
export interface SendMessageRequest {
  conversationId: string;
  content: MessageContent;
  tempId?: string;
  replyTo?: string; // Message ID to reply to
}

/**
 * Send Message Response
 */
export interface SendMessageResponse {
  success: boolean;
  message?: string;
  data: {
    message: Message;
  };
}

/**
 * Edit Message Request
 */
export interface EditMessageRequest {
  conversationId: string;
  messageId: string;
  newText: string;
}

/**
 * Edit Message Response
 */
export interface EditMessageResponse {
  success: boolean;
  message?: string;
  data: {
    message: Message;
  };
}

/**
 * Delete Message Request
 */
export interface DeleteMessageRequest {
  conversationId: string;
  messageId: string;
}

/**
 * Delete Message Response
 */
export interface DeleteMessageResponse {
  success: boolean;
  message?: string;
  data: {
    message: Message; // Returns tombstone message
  };
}

/**
 * Add Reaction Request
 */
export interface AddReactionRequest {
  conversationId: string;
  messageId: string;
  emoji: string;
}

/**
 * Add Reaction Response
 */
export interface AddReactionResponse {
  success: boolean;
  message?: string;
  data: {
    message: Message;
  };
}

/**
 * Remove Reaction Request
 */
export interface RemoveReactionRequest {
  conversationId: string;
  messageId: string;
  emoji: string;
}

/**
 * Remove Reaction Response
 */
export interface RemoveReactionResponse {
  success: boolean;
  message?: string;
  data: {
    message: Message;
  };
}

/**
 * Pin Message Request
 */
export interface PinMessageRequest {
  conversationId: string;
  messageId: string;
  isPinned: boolean;
}

/**
 * Pin Message Response
 */
export interface PinMessageResponse {
  success: boolean;
  message?: string;
  data: {
    message: Message;
  };
}

/**
 * Search Messages Request
 */
export interface SearchMessagesRequest {
  conversationId: string;
  query: string;
  limit?: number;
}

/**
 * Search Messages Response
 */
export interface SearchMessagesResponse {
  success: boolean;
  message?: string;
  data: {
    messages: Message[];
    total: number;
  };
}

/**
 * Forward Message Request
 */
export interface ForwardMessageRequest {
  messageId: string;
  fromConversationId: string;
  toConversationId: string;
}

/**
 * Forward Message Response
 */
export interface ForwardMessageResponse {
  success: boolean;
  message?: string;
  data: {
    message: Message;
  };
}

/**
 * Send Typing Indicator Request
 */
export interface SendTypingRequest {
  conversationId: string;
  isTyping: boolean;
}

/**
 * Typing Indicator Event (WebSocket)
 */
export interface TypingEvent {
  conversationId: string;
  user: TypingUser;
  isTyping: boolean;
}

/**
 * Mark as Read Request
 */
export interface MarkAsReadRequest {
  conversationId: string;
  messageIds: string[];
}

/**
 * Mark as Read Response
 */
export interface MarkAsReadResponse {
  success: boolean;
  message?: string;
  data: {
    messages: Message[];
  };
}
