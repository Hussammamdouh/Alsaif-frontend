/**
 * Chat Service
 * Handles all chat-related API calls
 * Integrated with backend API
 */

import { apiClient } from '../api/apiClient';
import {
  Conversation,
  ConversationsApiResponse,
  ConversationType,
} from '../../../features/chat/list/chatList.types';

/**
 * Helper function to get private chat title
 * Extracts the other participant's name from a private chat
 */
const getPrivateChatTitle = async (chat: any): Promise<string> => {
  if (chat.type !== 'private' || !chat.participants || chat.participants.length === 0) {
    return 'Private Chat';
  }

  // Get current user ID
  const { loadAuthSession } = await import('../../../app/auth/auth.storage');
  const session = await loadAuthSession();
  const currentUserId = session?.user?.id;

  if (!currentUserId) {
    // Fallback to first participant if no current user
    const firstParticipant = chat.participants[0];
    if (firstParticipant && firstParticipant.user) {
      return firstParticipant.user.name || firstParticipant.user.email || 'Unknown User';
    }
    return 'Private Chat';
  }

  // Get the other participant (not the current user)
  const otherParticipant = chat.participants.find((p: any) => {
    if (!p || !p.user) return false;
    const participantId = p.user._id || p.user;
    return participantId.toString() !== currentUserId.toString();
  });

  if (otherParticipant && otherParticipant.user) {
    return otherParticipant.user.name || otherParticipant.user.email || 'Unknown User';
  }

  return 'Private Chat';
};


/**
 * Fetch Conversations
 * Retrieves paginated list of conversations
 *
 * @param page - Page number
 * @param limit - Items per page
 * @returns Conversations response
 */
export const fetchConversations = async (
  page: number = 1,
  limit: number = 20
): Promise<ConversationsApiResponse> => {
  try {
    // Call backend API
    const response = await apiClient.get<any>(
      `/api/chats?page=${page}&limit=${limit}`
    );

    console.log('[ChatService] fetchConversations response:', {
      success: response.success,
      hasData: !!response.data,
      dataKeys: response.data ? Object.keys(response.data) : [],
      chatsCount: response.data?.chats?.length || 0,
    });

    // Backend returns: { success: true, message: "...", data: { chats: [], pagination: {...} } }
    // Transform backend response to match frontend expectations
    const chatArray = Array.isArray(response.data?.chats) ? response.data.chats : [];
    const conversations: Conversation[] = await Promise.all(chatArray
      .filter((chat: any) => chat)
      .map(async (chat: any) => ({
        id: chat._id,
        type: chat.type === 'group' ? ConversationType.GROUP : ConversationType.PRIVATE,
        title: chat.name || await getPrivateChatTitle(chat),
        participants: (chat.participants || [])
          .filter((p: any) => p && p.user)
          .map((p: any) => ({
            id: p.user._id || p.user,
            name: p.user.name || p.user.email || 'Unknown',
            avatar: p.user.avatar || undefined,
            role: p.permission === 'admin' ? 'admin' : 'member',
            isOnline: false, // Will be updated via WebSocket
          })),
        lastMessage: chat.lastMessage && chat.lastMessage.content ? {
          id: chat.lastMessage._id || 'last-msg',
          text: chat.lastMessage.content,
          senderId: (chat.lastMessage.sender && typeof chat.lastMessage.sender === 'object')
            ? (chat.lastMessage.sender._id || chat.lastMessage.sender)
            : chat.lastMessage.sender,
          senderName: (chat.lastMessage.sender && typeof chat.lastMessage.sender === 'object')
            ? (chat.lastMessage.sender.name || chat.lastMessage.sender.email || 'Unknown')
            : 'Unknown',
          timestamp: chat.lastMessage.timestamp || chat.updatedAt,
          isRead: true, // Simplified for now
        } : undefined,
        unreadCount: 0, // Will be calculated based on messages
        isMuted: false,
        isPinned: chat.isPinned || false,
        isArchived: false,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
        permissions: {
          canSend: true, // All users can send in their chats
          canView: true,
          canEdit: false,
          canDelete: false,
        },
        groupAvatar: chat.type === 'group' ? chat.groupAvatar : undefined,
      })));

    const pagination = response.data.pagination || {};

    return {
      success: true,
      message: response.message || 'Conversations fetched successfully',
      data: {
        conversations,
        total: pagination.total || conversations.length,
        page: pagination.page || page,
        limit: pagination.limit || limit,
        hasMore: pagination.hasMore !== undefined ? pagination.hasMore : false,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch conversations',
      data: {
        conversations: [],
        total: 0,
        page,
        limit,
        hasMore: false,
      },
    };
  }
};

/**
 * Search Conversations
 * Searches conversations by title or last message
 *
 * @param query - Search query
 * @returns Filtered conversations
 */
export const searchConversations = async (
  query: string
): Promise<ConversationsApiResponse> => {
  try {
    // Call backend API with search query
    const response = await apiClient.get<any>(
      `/api/chats/search?q=${encodeURIComponent(query)}`
    );

    // Transform backend response similar to fetchConversations
    const chatArray = Array.isArray(response.data?.chats) ? response.data.chats : [];
    const conversations: Conversation[] = await Promise.all(chatArray
      .filter((chat: any) => chat)
      .map(async (chat: any) => ({
        id: chat._id,
        type: chat.type === 'group' ? ConversationType.GROUP : ConversationType.PRIVATE,
        title: chat.name || await getPrivateChatTitle(chat),
        participants: (chat.participants || [])
          .filter((p: any) => p && p.user)
          .map((p: any) => ({
            id: p.user._id || p.user,
            name: p.user.name || p.user.email || 'Unknown',
            avatar: p.user.avatar || undefined,
            role: p.permission === 'admin' ? 'admin' : 'member',
            isOnline: false,
          })),
        lastMessage: chat.lastMessage && chat.lastMessage.content ? {
          id: chat.lastMessage._id || 'last-msg',
          text: chat.lastMessage.content,
          senderId: (chat.lastMessage.sender && typeof chat.lastMessage.sender === 'object')
            ? (chat.lastMessage.sender._id || chat.lastMessage.sender)
            : chat.lastMessage.sender,
          senderName: (chat.lastMessage.sender && typeof chat.lastMessage.sender === 'object')
            ? (chat.lastMessage.sender.name || chat.lastMessage.sender.email || 'Unknown')
            : 'Unknown',
          timestamp: chat.lastMessage.timestamp || chat.updatedAt,
          isRead: true,
        } : undefined,
        unreadCount: 0,
        isMuted: false,
        isPinned: chat.isPinned || false,
        isArchived: false,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
        permissions: {
          canSend: true,
          canView: true,
          canEdit: false,
          canDelete: false,
        },
        groupAvatar: chat.type === 'group' ? chat.groupAvatar : undefined,
      })));

    return {
      success: true,
      message: 'Search completed',
      data: {
        conversations,
        total: conversations.length,
        page: 1,
        limit: conversations.length,
        hasMore: false,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: 'Search failed',
      data: {
        conversations: [],
        total: 0,
        page: 1,
        limit: 0,
        hasMore: false,
      },
    };
  }
};

/**
 * Archive a conversation
 */
export const archiveChat = async (chatId: string): Promise<boolean> => {
  const response = await apiClient.patch<any>(`/api/chats/${chatId}/archive`);
  return response.success;
};

/**
 * Unarchive a conversation
 */
export const unarchiveChat = async (chatId: string): Promise<boolean> => {
  const response = await apiClient.delete<any>(`/api/chats/${chatId}/archive`);
  return response.success;
};

/**
 * Delete a conversation for the current user
 */
export const deleteChat = async (chatId: string): Promise<boolean> => {
  const response = await apiClient.delete<any>(`/api/chats/${chatId}`);
  return response.success;
};

/**
 * Block a user
 */
export const blockUser = async (userId: string): Promise<boolean> => {
  const response = await apiClient.post<any>('/api/chats/block', { userId });
  return response.success;
};
