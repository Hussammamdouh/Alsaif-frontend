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
    const participantId = p.user._id || p.user;
    return participantId.toString() !== currentUserId.toString();
  });

  if (otherParticipant && otherParticipant.user) {
    return otherParticipant.user.name || otherParticipant.user.email || 'Unknown User';
  }

  return 'Private Chat';
};

/**
 * Mock Conversations Data
 * Fallback data for development/offline mode
 */
const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    type: ConversationType.GROUP,
    title: 'Goldman Sachs Group',
    participants: [
      {
        id: 'user-1',
        name: 'John Smith',
        avatar: 'https://i.pravatar.cc/150?img=12',
        role: 'analyst',
        isOnline: true,
      },
      {
        id: 'user-2',
        name: 'Sarah Johnson',
        avatar: 'https://i.pravatar.cc/150?img=20',
        role: 'advisor',
        isOnline: false,
      },
    ],
    lastMessage: {
      id: 'msg-1',
      text: 'Latest Q3 analysis attached...',
      senderId: 'user-1',
      senderName: 'John Smith',
      timestamp: new Date().toISOString(),
      isRead: false,
    },
    unreadCount: 2,
    isMuted: false,
    isPinned: true,
    isArchived: false,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: new Date().toISOString(),
    permissions: {
      canSend: true,
      canView: true,
      canEdit: false,
      canDelete: false,
    },
    groupAvatar: 'https://i.pravatar.cc/150?img=50',
  },
  {
    id: 'conv-2',
    type: ConversationType.PRIVATE,
    title: 'Sarah Jenkins (CFA)',
    participants: [
      {
        id: 'user-3',
        name: 'Sarah Jenkins',
        avatar: 'https://i.pravatar.cc/150?img=25',
        role: 'advisor',
        isOnline: true,
      },
    ],
    lastMessage: {
      id: 'msg-2',
      text: 'Your portfolio is looking strong...',
      senderId: 'user-3',
      senderName: 'Sarah Jenkins',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      isRead: false,
    },
    unreadCount: 1,
    isMuted: false,
    isPinned: true,
    isArchived: false,
    createdAt: '2024-01-15T14:00:00Z',
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    permissions: {
      canSend: true,
      canView: true,
      canEdit: false,
      canDelete: false,
    },
  },
  {
    id: 'conv-3',
    type: ConversationType.GROUP,
    title: 'Crypto Trends 2024',
    participants: [
      {
        id: 'user-4',
        name: 'Mike Chen',
        avatar: 'https://i.pravatar.cc/150?img=33',
        role: 'member',
        isOnline: false,
      },
      {
        id: 'user-5',
        name: 'Lisa Wang',
        avatar: 'https://i.pravatar.cc/150?img=41',
        role: 'member',
        isOnline: true,
      },
    ],
    lastMessage: {
      id: 'msg-3',
      text: 'Bitcoin just broke resistance at...',
      senderId: 'user-4',
      senderName: 'Mike Chen',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
      isRead: true,
    },
    unreadCount: 0,
    isMuted: false,
    isPinned: false,
    isArchived: false,
    createdAt: '2024-01-01T09:00:00Z',
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    permissions: {
      canSend: true,
      canView: true,
      canEdit: false,
      canDelete: false,
    },
  },
  {
    id: 'conv-4',
    type: ConversationType.GROUP,
    title: 'Market Alerts',
    participants: [
      {
        id: 'bot-1',
        name: 'Market Bot',
        avatar: 'https://i.pravatar.cc/150?img=60',
        role: 'bot',
        isOnline: true,
      },
    ],
    lastMessage: {
      id: 'msg-4',
      text: 'AAPL is down 2% in pre-market...',
      senderId: 'bot-1',
      senderName: 'Market Bot',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      isRead: true,
    },
    unreadCount: 0,
    isMuted: false,
    isPinned: false,
    isArchived: false,
    createdAt: '2024-01-05T08:00:00Z',
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    permissions: {
      canSend: false,
      canView: true,
      canEdit: false,
      canDelete: false,
    },
  },
  {
    id: 'conv-5',
    type: ConversationType.PRIVATE,
    title: 'Robert Chen',
    participants: [
      {
        id: 'user-6',
        name: 'Robert Chen',
        avatar: 'https://i.pravatar.cc/150?img=15',
        role: 'analyst',
        isOnline: false,
      },
    ],
    lastMessage: {
      id: 'msg-5',
      text: 'Did you see the FED announcement?',
      senderId: 'user-6',
      senderName: 'Robert Chen',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      isRead: true,
    },
    unreadCount: 0,
    isMuted: false,
    isPinned: false,
    isArchived: false,
    createdAt: '2024-01-08T11:00:00Z',
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    permissions: {
      canSend: true,
      canView: true,
      canEdit: false,
      canDelete: false,
    },
  },
  {
    id: 'conv-6',
    type: ConversationType.GROUP,
    title: 'Tech Ventures ETF',
    participants: [
      {
        id: 'user-7',
        name: 'David Park',
        avatar: 'https://i.pravatar.cc/150?img=52',
        role: 'member',
        isOnline: true,
      },
      {
        id: 'user-8',
        name: 'Emma Wilson',
        avatar: 'https://i.pravatar.cc/150?img=44',
        role: 'member',
        isOnline: false,
      },
    ],
    lastMessage: {
      id: 'msg-6',
      text: 'Rebalancing scheduled for next...',
      senderId: 'user-7',
      senderName: 'David Park',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      isRead: true,
    },
    unreadCount: 0,
    isMuted: false,
    isPinned: false,
    isArchived: false,
    createdAt: '2024-01-03T13:00:00Z',
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    permissions: {
      canSend: true,
      canView: true,
      canEdit: false,
      canDelete: false,
    },
  },
];

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
    const conversations: Conversation[] = await Promise.all(response.data.chats.map(async (chat: any) => ({
      id: chat._id,
      type: chat.type === 'group' ? ConversationType.GROUP : ConversationType.PRIVATE,
      title: chat.name || await getPrivateChatTitle(chat),
      participants: chat.participants.map((p: any) => ({
        id: p.user._id || p.user,
        name: p.user.name || p.user.email || 'Unknown',
        avatar: p.user.avatar || undefined,
        role: p.permission === 'admin' ? 'admin' : 'member',
        isOnline: false, // Will be updated via WebSocket
      })),
      lastMessage: chat.lastMessage && chat.lastMessage.content ? {
        id: chat.lastMessage._id || 'last-msg',
        text: chat.lastMessage.content,
        senderId: typeof chat.lastMessage.sender === 'object'
          ? (chat.lastMessage.sender._id || chat.lastMessage.sender)
          : chat.lastMessage.sender,
        senderName: typeof chat.lastMessage.sender === 'object'
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
    console.error('[ChatService] Failed to fetch conversations:', error);

    // Fallback to mock data in case of error (development mode)
    console.log('[ChatService] Using fallback mock data');

    // Mock delay to simulate network request
    await new Promise<void>(resolve => setTimeout(() => resolve(), 800));

    // Sort by pinned first, then by last message timestamp
    const sortedConversations = [...MOCK_CONVERSATIONS].sort((a, b) => {
      // Pinned conversations first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      // Then by last message timestamp
      const aTime = a.lastMessage?.timestamp || a.updatedAt;
      const bTime = b.lastMessage?.timestamp || b.updatedAt;
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });

    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedConversations = sortedConversations.slice(startIndex, endIndex);

    return {
      success: true,
      message: 'Conversations fetched successfully (mock data)',
      data: {
        conversations: paginatedConversations,
        total: MOCK_CONVERSATIONS.length,
        page,
        limit,
        hasMore: endIndex < MOCK_CONVERSATIONS.length,
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
    const conversations: Conversation[] = await Promise.all(response.data.chats.map(async (chat: any) => ({
      id: chat._id,
      type: chat.type === 'group' ? ConversationType.GROUP : ConversationType.PRIVATE,
      title: chat.name || await getPrivateChatTitle(chat),
      participants: chat.participants.map((p: any) => ({
        id: p.user._id || p.user,
        name: p.user.name || p.user.email || 'Unknown',
        avatar: p.user.avatar || undefined,
        role: p.permission === 'admin' ? 'admin' : 'member',
        isOnline: false,
      })),
      lastMessage: chat.lastMessage && chat.lastMessage.content ? {
        id: chat.lastMessage._id || 'last-msg',
        text: chat.lastMessage.content,
        senderId: typeof chat.lastMessage.sender === 'object'
          ? (chat.lastMessage.sender._id || chat.lastMessage.sender)
          : chat.lastMessage.sender,
        senderName: typeof chat.lastMessage.sender === 'object'
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
    console.error('[ChatService] Search failed:', error);

    // Fallback to local search in mock data
    await new Promise<void>(resolve => setTimeout(() => resolve(), 500));

    const lowerQuery = query.toLowerCase();
    const filtered = MOCK_CONVERSATIONS.filter(
      conv =>
        conv.title.toLowerCase().includes(lowerQuery) ||
        conv.lastMessage?.text.toLowerCase().includes(lowerQuery)
    );

    return {
      success: true,
      message: 'Search completed (mock data)',
      data: {
        conversations: filtered,
        total: filtered.length,
        page: 1,
        limit: filtered.length,
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
