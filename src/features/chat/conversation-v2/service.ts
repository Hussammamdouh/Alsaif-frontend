/**
 * Conversation Service
 * Handles API communication and data transformation
 */

import { apiClient } from '../../../core/services/api/apiClient';
import { socketService } from '../../../core/services/websocket/socketService';
import { Message, Conversation, MessageReaction, MessageStatus, MessageType } from './types';

interface GetMessagesResponse {
  success: boolean;
  data: {
    messages: any[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasMore: boolean;
    };
  };
}

interface GetChatResponse {
  success: boolean;
  data: {
    chat: any;
  };
}

/**
 * Transform backend reaction format to frontend format
 */
const transformReactions = (reactions: any[]): MessageReaction[] => {
  if (!reactions || reactions.length === 0) return [];

  // Group reactions by emoji
  const reactionsMap = new Map<string, MessageReaction>();

  reactions.forEach((reaction: any) => {
    // Skip reactions without emoji or without valid user data
    if (!reaction?.emoji) return;
    if (!reaction?.user || !reaction.user._id) return;

    const emoji = reaction.emoji;

    if (reactionsMap.has(emoji)) {
      const existing = reactionsMap.get(emoji)!;
      existing.users.push({
        id: reaction.user._id,
        name: reaction.user.name || 'User',
        email: reaction.user.email,
        avatar: reaction.user.avatar,
      });
      existing.count = existing.users.length;
    } else {
      reactionsMap.set(emoji, {
        emoji,
        users: [{
          id: reaction.user._id,
          name: reaction.user.name || 'User',
          email: reaction.user.email,
          avatar: reaction.user.avatar,
        }],
        count: 1,
      });
    }
  });

  return Array.from(reactionsMap.values());
};

/**
 * Transform backend message to frontend Message type
 */
const transformMessage = (msg: any, conversationId: string): Message => {
  // Check if replyTo is valid (has _id field)
  const hasValidReplyTo = msg.replyTo && msg.replyTo._id;

  return {
    id: msg._id,
    conversationId,
    sender: {
      id: msg.sender._id || msg.sender,
      name: msg.sender.name || msg.sender.email || 'Unknown',
      email: msg.sender.email,
      avatar: msg.sender.avatar,
      role: msg.sender.role,
    },
    type: msg.type || MessageType.TEXT,
    content: {
      text: msg.content,
    },
    file: msg.file ? {
      url: msg.file.url,
      name: msg.file.name,
      size: msg.file.size,
      mimeType: msg.file.mimeType,
    } : undefined,
    createdAt: msg.createdAt,
    updatedAt: msg.updatedAt,
    status: msg.status || MessageStatus.SENT,

    // Optional fields
    reactions: transformReactions(msg.reactions),
    replyTo: hasValidReplyTo ? {
      messageId: msg.replyTo._id,
      text: msg.replyTo.content,
      senderName: msg.replyTo.sender?.name || 'Unknown',
    } : undefined,
    isPinned: msg.isPinned || false,
    isEdited: msg.isEdited || false,
    editedAt: msg.editedAt,
    isDeleted: msg.isDeleted || false,
    deletedAt: msg.deletedAt,
    readBy: msg.readBy?.map((r: any) => r.user) || [],
    forwardedFrom: msg.forwardedFrom,
  };
};

/**
 * Export transformMessage for use in hooks
 */
export { transformMessage };

/**
 * Get conversation messages
 */
export const getConversationMessages = async (
  conversationId: string,
  page: number = 1,
  limit: number = 50
): Promise<{ conversation: Conversation; messages: Message[]; hasMore: boolean }> => {
  // Fetch messages and chat details in parallel
  const [messagesResponse, chatResponse] = await Promise.all([
    apiClient.get<GetMessagesResponse>(
      `/api/chats/${conversationId}/messages?page=${page}&limit=${limit}`
    ),
    apiClient.get<GetChatResponse>(`/api/chats/${conversationId}`)
  ]);

  if (!messagesResponse.success || !chatResponse.success) {
    throw new Error('Failed to fetch messages');
  }

  const { messages: messagesData, pagination } = messagesResponse.data;
  const chatData = chatResponse.data.chat;

  // Transform conversation
  const conversation: Conversation = {
    id: chatData._id,
    type: chatData.type,
    name: chatData.name,
    avatar: chatData.avatar,
    participants: chatData.participants.map((p: any) => ({
      user: {
        id: p.user?._id || p.user || 'unknown',
        name: p.user?.name || p.user?.email || 'Unknown User',
        email: p.user?.email || '',
        avatar: p.user?.avatar,
        role: p.user?.role || 'user',
      },
      permission: p.permission,
      joinedAt: p.joinedAt,
    })),
    createdBy: chatData.createdBy ? {
      id: chatData.createdBy._id,
      name: chatData.createdBy.name || 'Unknown',
      email: chatData.createdBy.email || '',
    } : {
      id: 'unknown',
      name: 'Unknown',
      email: '',
    },
    createdAt: chatData.createdAt,
    updatedAt: chatData.updatedAt,
    lastMessage: chatData.lastMessage,
    isPremium: chatData.isPremium || false,
    isSystemGroup: chatData.isSystemGroup || false,
    settings: chatData.settings || {},
  };

  // Transform messages
  const messages = messagesData.map(msg => transformMessage(msg, conversationId));

  return { conversation, messages, hasMore: pagination.hasMore };
};

/**
 * Send a message via WebSocket
 * Returns null immediately - actual message will come via WebSocket event
 */
export const sendMessage = async (
  conversationId: string,
  content: string,
  replyToId?: string
): Promise<void> => {
  socketService.sendMessage(conversationId, content, replyToId);
};

/**
 * Add reaction to message
 */
export const addReaction = async (
  conversationId: string,
  messageId: string,
  emoji: string
): Promise<Message> => {
  const response = await apiClient.post<{ success: boolean; data: { message: any } }>(
    `/api/messages/${messageId}/reactions`,
    { emoji }
  );

  if (!response.success) {
    throw new Error('Failed to add reaction');
  }

  return transformMessage(response.data.message, conversationId);
};

/**
 * Remove reaction from message
 */
export const removeReaction = async (
  conversationId: string,
  messageId: string,
  emoji: string
): Promise<Message> => {
  const response = await apiClient.delete<{ success: boolean; data: { message: any } }>(
    `/api/messages/${messageId}/reactions/${emoji}`
  );

  if (!response.success) {
    throw new Error('Failed to remove reaction');
  }

  return transformMessage(response.data.message, conversationId);
};

/**
 * Edit message
 */
export const editMessage = async (
  conversationId: string,
  messageId: string,
  content: string
): Promise<Message> => {
  const response = await apiClient.put<{ success: boolean; data: { message: any } }>(
    `/api/messages/${messageId}`,
    { content }
  );

  if (!response.success) {
    throw new Error('Failed to edit message');
  }

  return transformMessage(response.data.message, conversationId);
};

/**
 * Delete message
 */
export const deleteMessage = async (
  _conversationId: string,
  messageId: string
): Promise<void> => {
  const response = await apiClient.delete<{ success: boolean }>(
    `/api/messages/${messageId}`
  );

  if (!response.success) {
    throw new Error('Failed to delete message');
  }
};

/**
 * Toggle pin message
 */
export const togglePinMessage = async (
  conversationId: string,
  messageId: string,
  isPinned: boolean
): Promise<Message> => {
  const response = await apiClient.post<{ success: boolean; data: { message: any } }>(
    `/api/messages/${messageId}/pin`,
    { isPinned }
  );

  if (!response.success) {
    throw new Error('Failed to toggle pin');
  }

  return transformMessage(response.data.message, conversationId);
};
