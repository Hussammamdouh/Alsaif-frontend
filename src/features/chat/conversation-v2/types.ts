/**
 * Clean Conversation Types
 * Single source of truth for message data structure
 */

export enum MessageStatus {
  SENDING = 'sending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

export enum MessageType {
  TEXT = 'text',
  FILE = 'file',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
}

export interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  role?: string;
}

export interface MessageReaction {
  emoji: string;
  users: User[];
  count: number;
}

export interface ReplyInfo {
  messageId: string;
  text: string;
  senderName: string;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: User;
  content: {
    text?: string;
  };
  type: MessageType;
  file?: {
    url: string;
    name?: string;
    size?: number;
    mimeType?: string;
  };
  createdAt: string;
  updatedAt?: string;
  status: MessageStatus;

  // Optional features
  reactions?: MessageReaction[];
  replyTo?: ReplyInfo;
  isPinned?: boolean;
  isEdited?: boolean;
  editedAt?: string;
  isDeleted?: boolean;
  deletedAt?: string;
  readBy?: string[];

  // Forward info
  forwardedFrom?: {
    senderName: string;
  };
}

export interface Participant {
  user: User;
  permission: 'admin' | 'member' | 'read_only';
  joinedAt: string;
}

export interface Conversation {
  id: string;
  type: 'private' | 'group';
  name?: string;
  avatar?: string;
  participants: Participant[];
  createdBy: User;
  createdAt: string;
  updatedAt: string;
  lastMessage?: {
    content: string;
    sender: string;
    timestamp: string;
  };
  isPremium: boolean;
  isSystemGroup?: boolean;
  settings?: {
    onlyAdminsCanSend?: boolean;
  };
}

export interface ConversationState {
  conversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  isLoadingMore: boolean;
  isSending: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;

  // UI state
  replyingTo: Message | null;
  editingMessage: Message | null;
  selectedMessages: string[];
  typingUsers: string[];
}

export interface ConversationPermissions {
  canSendMessage: boolean;
  canEditMessage: boolean;
  canDeleteMessage: boolean;
  canPinMessage: boolean;
  canManageParticipants: boolean;
}
