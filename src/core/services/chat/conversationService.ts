/**
 * Conversation Service
 * Handles conversation/message API calls
 * Integrated with backend
 */

import { apiClient } from '../api/apiClient';
import {
  Message,
  MessageStatus,
  MessageType,
  GroupRole,
  MessagesApiResponse,
  SendMessageRequest,
  SendMessageResponse,
  ConversationInfo,
  EditMessageRequest,
  EditMessageResponse,
  DeleteMessageRequest,
  DeleteMessageResponse,
  AddReactionRequest,
  AddReactionResponse,
  RemoveReactionRequest,
  RemoveReactionResponse,
  PinMessageRequest,
  PinMessageResponse,
  SearchMessagesRequest,
  SearchMessagesResponse,
  ForwardMessageRequest,
  ForwardMessageResponse,
  SendTypingRequest,
  MarkAsReadRequest,
  MarkAsReadResponse,
} from '../../../features/chat/conversation/conversation.types';
import { buildConversationPermissions } from '../../../features/chat/conversation/conversation.permissions';
import { loadAuthSession } from '../../../app/auth/auth.storage';

/**
 * Get Current User ID from session
 */
const getCurrentUserId = async (): Promise<string | null> => {
  const session = await loadAuthSession();
  return session?.user?.id || null;
};

/**
 * Mock Conversations Data
 */
const MOCK_CONVERSATIONS_INFO: Record<string, ConversationInfo> = {
  'conv-1': {
    id: 'conv-1',
    type: 'private',
    title: 'Jonathan Reynolds',
    subtitle: 'Senior Portfolio Manager',
    avatar: 'https://i.pravatar.cc/150?img=12',
    onlineStatus: true,
    isEncrypted: false,
    complianceMessage: 'CHATS ARE MONITORED FOR COMPLIANCE',
  },
  'conv-2': {
    id: 'conv-2',
    type: 'group',
    title: 'VIP Market Movers',
    subtitle: '124 Members Online',
    avatar: undefined,
    memberCount: 124,
    isEncrypted: true,
    complianceMessage: 'Messages in this group are encrypted and private.',
  },
};

/**
 * Mock Messages Data
 */
const MOCK_MESSAGES: Record<string, Message[]> = {
  'conv-1': [
    {
      id: 'msg-1',
      conversationId: 'conv-1',
      sender: {
        id: 'user-jonathan',
        name: 'Jonathan Reynolds',
        avatar: 'https://i.pravatar.cc/150?img=12',
      },
      content: {
        type: MessageType.TEXT,
        text: "Good morning. I've analyzed the Q3 reports for NVDA regarding your portfolio allocation.",
      },
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      status: MessageStatus.READ,
    },
    {
      id: 'msg-2',
      conversationId: 'conv-1',
      sender: {
        id: 'current-user-123',
        name: 'You',
      },
      content: {
        type: MessageType.TEXT,
        text: 'Thanks, Jonathan. What is the current buy rating?',
      },
      createdAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
      status: MessageStatus.READ,
    },
    {
      id: 'msg-3',
      conversationId: 'conv-1',
      sender: {
        id: 'user-jonathan',
        name: 'Jonathan Reynolds',
        avatar: 'https://i.pravatar.cc/150?img=12',
      },
      content: {
        type: MessageType.TEXT,
        text: "We are upgrading to 'Strong Buy'. The technicals look solid above the 200-day moving average.",
      },
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: MessageStatus.READ,
    },
    {
      id: 'msg-4',
      conversationId: 'conv-1',
      sender: {
        id: 'user-jonathan',
        name: 'Jonathan Reynolds',
        avatar: 'https://i.pravatar.cc/150?img=12',
      },
      content: {
        type: MessageType.FILE,
        text: '',
        fileName: 'NVDA_Technical_Analysis_Q3.pdf',
        fileSize: 2.4 * 1024 * 1024,
        fileUrl: '/files/nvda-q3.pdf',
      },
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30000).toISOString(),
      status: MessageStatus.READ,
    },
    {
      id: 'msg-5',
      conversationId: 'conv-1',
      sender: {
        id: 'current-user-123',
        name: 'You',
      },
      content: {
        type: MessageType.TEXT,
        text: "Understood. Let's proceed with a position increase.",
      },
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      status: MessageStatus.READ,
    },
  ],
  'conv-2': [
    {
      id: 'msg-g1',
      conversationId: 'conv-2',
      sender: {
        id: 'user-sarah',
        name: 'Sarah Chen',
        avatar: 'https://i.pravatar.cc/150?img=41',
        role: GroupRole.ANALYST,
      },
      content: {
        type: MessageType.TEXT,
        text: 'Nvidia $NVDA creates a new high today, breaking key resistance levels at 480.\n\nVolume is spiking. I\'m seeing institutional buy orders coming through. 🚀',
      },
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      status: MessageStatus.READ,
    },
    {
      id: 'msg-g2',
      conversationId: 'conv-2',
      sender: {
        id: 'user-john',
        name: 'John Doe',
        avatar: 'https://i.pravatar.cc/150?img=33',
      },
      content: {
        type: MessageType.TEXT,
        text: 'Is it too late to enter? The RSI looks a bit overbought on the 4H chart.',
      },
      createdAt: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(),
      status: MessageStatus.READ,
    },
    {
      id: 'msg-g3',
      conversationId: 'conv-2',
      sender: {
        id: 'user-elena',
        name: 'Elena R.',
        avatar: 'https://i.pravatar.cc/150?img=45',
      },
      content: {
        type: MessageType.TEXT,
        text: 'Watching $TSLA closely too.',
      },
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      status: MessageStatus.READ,
    },
    {
      id: 'msg-g4',
      conversationId: 'conv-2',
      sender: {
        id: 'current-user-123',
        name: 'You',
      },
      content: {
        type: MessageType.TEXT,
        text: "I'm holding until earnings. The momentum looks incredibly strong, specifically with the new AI announcements.",
      },
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: MessageStatus.READ,
    },
    {
      id: 'msg-g5',
      conversationId: 'conv-2',
      sender: {
        id: 'user-sarah',
        name: 'Sarah Chen',
        avatar: 'https://i.pravatar.cc/150?img=41',
        role: GroupRole.ANALYST,
      },
      content: {
        type: MessageType.TEXT,
        text: 'Smart move. Fundamentals are strong.',
      },
      createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
      status: MessageStatus.READ,
    },
  ],
};

/**
 * Fetch Messages for Conversation
 *
 * @param conversationId - Conversation ID
 * @param page - Page number
 * @param limit - Items per page
 * @returns Messages response
 */
export const fetchMessages = async (
  conversationId: string,
  page: number = 1,
  limit: number = 30
): Promise<MessagesApiResponse> => {
  try {
    const currentUserId = await getCurrentUserId();

    // Call backend API to get messages and chat details in parallel
    const [messagesResponse, chatResponse] = await Promise.all([
      apiClient.get<any>(`/api/chats/${conversationId}/messages?page=${page}&limit=${limit}`),
      apiClient.get<any>(`/api/chats/${conversationId}`)
    ]);

    const chat = chatResponse.data.chat;

    // Find the OTHER participant (not the current user) for private chats
    const otherParticipant = chat.participants.find((p: any) => {
      const participantId = p.user._id || p.user;
      return participantId.toString() !== currentUserId;
    });

    // Build conversation info from chat
    const conversationInfo: ConversationInfo = {
      id: chat._id,
      type: chat.type === 'group' ? 'group' : 'private',
      title: chat.name || (otherParticipant?.user?.name || 'Private Chat'),
      subtitle: chat.type === 'group'
        ? `${chat.participants.length} members`
        : (otherParticipant?.user?.email || ''),
      avatar: chat.type === 'group' ? chat.groupAvatar : (otherParticipant?.user?.avatar),
      memberCount: chat.type === 'group' ? chat.participants.length : undefined,
      isEncrypted: false,
      complianceMessage: undefined,
      onlineStatus: false,
    };

    // Transform backend messages to frontend format
    const messages: Message[] = messagesResponse.data.messages.map((msg: any) => {
      // Transform reactions: group by emoji and count users
      const reactionsMap = new Map<string, { emoji: string; users: Array<{id: string; name: string; avatar?: string}>; count: number }>();

      if (msg.reactions && Array.isArray(msg.reactions)) {
        msg.reactions.forEach((reaction: any) => {
          // Only process reactions with valid user data
          if (reaction && reaction.emoji && reaction.user && reaction.user._id) {
            const emoji = reaction.emoji;

            if (reactionsMap.has(emoji)) {
              // Add user to existing emoji group
              const existing = reactionsMap.get(emoji)!;
              existing.users.push({
                id: reaction.user._id,
                name: reaction.user.name || 'User',
                avatar: reaction.user.avatar,
              });
              existing.count = existing.users.length;
            } else {
              // Create new emoji group
              reactionsMap.set(emoji, {
                emoji,
                users: [{
                  id: reaction.user._id,
                  name: reaction.user.name || 'User',
                  avatar: reaction.user.avatar,
                }],
                count: 1,
              });
            }
          }
        });
      }

      const groupedReactions = Array.from(reactionsMap.values());

      // Transform replyTo if exists
      let replyToInfo = undefined;
      if (msg.replyTo) {
        replyToInfo = {
          messageId: msg.replyTo._id,
          text: msg.replyTo.content,
          senderName: msg.replyTo.sender?.name || 'Unknown',
        };
      }

      return {
        id: msg._id,
        conversationId: chat._id,
        sender: {
          id: msg.sender._id || msg.sender,
          name: msg.sender.name || msg.sender.email || 'Unknown',
          avatar: msg.sender.avatar,
        },
        content: {
          type: MessageType.TEXT,
          text: msg.content,
        },
        createdAt: msg.createdAt,
        status: msg.status || MessageStatus.SENT,
        isEdited: msg.isEdited || false,
        editedAt: msg.editedAt,
        reactions: groupedReactions,
        replyTo: replyToInfo,
        isPinned: msg.isPinned || false,
        isDeleted: msg.isDeleted || false,
        deletedAt: msg.deletedAt,
        readBy: msg.readBy || [],
      };
    });

    // Determine user role and permissions
    const userParticipant = chat.participants.find((p: any) => p.user._id === currentUserId);
    let userRole: GroupRole | undefined;
    if (chat.type === 'group' && userParticipant) {
      userRole = userParticipant.permission === 'admin' ? GroupRole.ADMIN : GroupRole.MEMBER;
    }

    const permissions = buildConversationPermissions(userRole);

    return {
      success: true,
      message: 'Messages fetched successfully',
      data: {
        conversation: conversationInfo,
        messages,
        total: messagesResponse.data.pagination.total,
        page: messagesResponse.data.pagination.page,
        limit: messagesResponse.data.pagination.limit,
        hasMore: messagesResponse.data.pagination.hasMore,
        permissions,
      },
    };
  } catch (error) {
    console.error('[ConversationService] Failed to fetch messages:', error);

    // Fallback to mock data
    console.log('[ConversationService] Using fallback mock data');
    await new Promise<void>(resolve => setTimeout(() => resolve(), 600));

    const conversationInfo = MOCK_CONVERSATIONS_INFO[conversationId];
    const messages = MOCK_MESSAGES[conversationId] || [];

    if (!conversationInfo) {
      throw new Error('Conversation not found');
    }

    let userRole: GroupRole | undefined;
    if (conversationInfo.type === 'group') {
      userRole = GroupRole.MEMBER;
    }

    const permissions = buildConversationPermissions(userRole);
    const reversedMessages = [...messages].reverse();
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedMessages = reversedMessages.slice(startIndex, endIndex);

    return {
      success: true,
      message: 'Messages fetched successfully (mock data)',
      data: {
        conversation: conversationInfo,
        messages: paginatedMessages.reverse(),
        total: messages.length,
        page,
        limit,
        hasMore: endIndex < messages.length,
        permissions,
      },
    };
  }
};

/**
 * Send Message
 * Sends message via WebSocket for real-time delivery
 *
 * @param request - Send message request
 * @returns Send message response
 */
export const sendMessage = async (
  request: SendMessageRequest
): Promise<SendMessageResponse> => {
  // Import socket service dynamically to avoid circular dependencies
  const { socketService } = await import('../websocket/socketService');

  const currentUserId = await getCurrentUserId();
  const currentUserSession = await loadAuthSession();

  // Create optimistic message for immediate UI update
  const optimisticMessage: Message = {
    id: `temp-${Date.now()}`,
    conversationId: request.conversationId,
    sender: {
      id: currentUserId || 'current-user',
      name: currentUserSession?.user?.name || 'You',
      avatar: currentUserSession?.user?.avatar,
    },
    content: request.content,
    createdAt: new Date().toISOString(),
    status: MessageStatus.SENDING,
  };

  // Send message via WebSocket with optional replyTo
  socketService.sendMessage(request.conversationId, request.content.text || '', request.replyTo);

  // Return optimistic message immediately
  // The actual message will be received via WebSocket MESSAGE_RECEIVED event
  return {
    success: true,
    message: 'Message sent successfully',
    data: {
      message: optimisticMessage,
    },
  };
};

/**
 * Retry Failed Message
 *
 * @param messageId - Message ID to retry
 * @returns Send message response
 */
export const retryMessage = async (
  messageId: string
): Promise<SendMessageResponse> => {
  // TODO: Implement retry logic with backend
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));

  // Mock successful retry
  return {
    success: true,
    message: 'Message sent successfully',
    data: {
      message: {
        id: messageId,
        conversationId: 'conv-1',
        sender: {
          id: 'current-user-123',
          name: 'You',
        },
        content: {
          type: MessageType.TEXT,
          text: 'Retried message',
        },
        createdAt: new Date().toISOString(),
        status: MessageStatus.SENT,
      },
    },
  };
};

/**
 * Edit Message
 *
 * @param request - Edit message request
 * @returns Edit message response
 */
export const editMessage = async (
  request: EditMessageRequest
): Promise<EditMessageResponse> => {
  try {
    const response = await apiClient.put<any>(
      `/api/messages/${request.messageId}`,
      { content: request.newText }
    );

    const msg = response.data.message;
    const currentUserId = await getCurrentUserId();

    const updatedMessage: Message = {
      id: msg._id,
      conversationId: request.conversationId,
      sender: {
        id: msg.sender._id || msg.sender,
        name: msg.sender.name || msg.sender.email || 'Unknown',
        avatar: msg.sender.avatar,
      },
      content: {
        type: MessageType.TEXT,
        text: msg.content,
      },
      createdAt: msg.createdAt,
      status: msg.status || MessageStatus.SENT,
      isEdited: msg.isEdited || false,
      editedAt: msg.editedAt,
    };

    return {
      success: true,
      message: 'Message edited successfully',
      data: {
        message: updatedMessage,
      },
    };
  } catch (error) {
    console.error('[ConversationService] Failed to edit message:', error);
    throw new Error('Failed to edit message');
  }
};

/**
 * Delete Message
 *
 * @param request - Delete message request
 * @returns Delete message response (with tombstone)
 */
export const deleteMessage = async (
  request: DeleteMessageRequest
): Promise<DeleteMessageResponse> => {
  try {
    const response = await apiClient.delete<any>(
      `/api/messages/${request.messageId}`
    );

    const msg = response.data.message;

    const deletedMessage: Message = {
      id: msg._id,
      conversationId: request.conversationId,
      sender: {
        id: msg.sender._id || msg.sender,
        name: msg.sender.name || msg.sender.email || 'Unknown',
        avatar: msg.sender.avatar,
      },
      content: {
        type: MessageType.TEXT,
        text: 'This message was deleted',
      },
      createdAt: msg.createdAt,
      status: msg.status || MessageStatus.SENT,
      isDeleted: msg.isDeleted || true,
      deletedAt: msg.deletedAt || new Date().toISOString(),
    };

    return {
      success: true,
      message: 'Message deleted successfully',
      data: {
        message: deletedMessage,
      },
    };
  } catch (error) {
    console.error('[ConversationService] Failed to delete message:', error);
    throw new Error('Failed to delete message');
  }
};

/**
 * Add Reaction to Message
 *
 * @param request - Add reaction request
 * @returns Add reaction response
 */
export const addReaction = async (
  request: AddReactionRequest
): Promise<AddReactionResponse> => {
  try {
    const response = await apiClient.post<any>(
      `/api/messages/${request.messageId}/reactions`,
      { emoji: request.emoji }
    );

    const msg = response.data.message;

    // Transform backend reactions to frontend format
    const reactions = (msg.reactions || [])
      .filter((r: any) => r && r.user) // Filter out invalid reactions
      .map((r: any) => ({
        emoji: r.emoji,
        users: [{
          id: r.user._id || r.user,
          name: r.user.name || 'User',
          avatar: r.user.avatar,
        }],
        count: 1,
      }));

    // Group reactions by emoji
    const groupedReactions = reactions.reduce((acc: any[], curr: any) => {
      const existing = acc.find(r => r.emoji === curr.emoji);
      if (existing) {
        existing.users.push(...curr.users);
        existing.count += 1;
      } else {
        acc.push(curr);
      }
      return acc;
    }, []);

    const updatedMessage: Message = {
      id: msg._id,
      conversationId: request.conversationId,
      sender: {
        id: msg.sender._id || msg.sender,
        name: msg.sender.name || msg.sender.email || 'Unknown',
        avatar: msg.sender.avatar,
      },
      content: {
        type: MessageType.TEXT,
        text: msg.content,
      },
      createdAt: msg.createdAt,
      status: msg.status || MessageStatus.SENT,
      reactions: groupedReactions,
    };

    return {
      success: true,
      message: 'Reaction added successfully',
      data: {
        message: updatedMessage,
      },
    };
  } catch (error) {
    console.error('[ConversationService] Failed to add reaction:', error);
    throw new Error('Failed to add reaction');
  }
};

/**
 * Remove Reaction from Message
 *
 * @param request - Remove reaction request
 * @returns Remove reaction response
 */
export const removeReaction = async (
  request: RemoveReactionRequest
): Promise<RemoveReactionResponse> => {
  try {
    const response = await apiClient.delete<any>(
      `/api/messages/${request.messageId}/reactions/${encodeURIComponent(request.emoji)}`
    );

    const msg = response.data.message;

    // Transform backend reactions to frontend format
    const reactions = (msg.reactions || [])
      .filter((r: any) => r && r.user) // Filter out invalid reactions
      .map((r: any) => ({
        emoji: r.emoji,
        users: [{
          id: r.user._id || r.user,
          name: r.user.name || 'User',
          avatar: r.user.avatar,
        }],
        count: 1,
      }));

    // Group reactions by emoji
    const groupedReactions = reactions.reduce((acc: any[], curr: any) => {
      const existing = acc.find(r => r.emoji === curr.emoji);
      if (existing) {
        existing.users.push(...curr.users);
        existing.count += 1;
      } else {
        acc.push(curr);
      }
      return acc;
    }, []);

    const updatedMessage: Message = {
      id: msg._id,
      conversationId: request.conversationId,
      sender: {
        id: msg.sender._id || msg.sender,
        name: msg.sender.name || msg.sender.email || 'Unknown',
        avatar: msg.sender.avatar,
      },
      content: {
        type: MessageType.TEXT,
        text: msg.content,
      },
      createdAt: msg.createdAt,
      status: msg.status || MessageStatus.SENT,
      reactions: groupedReactions,
    };

    return {
      success: true,
      message: 'Reaction removed successfully',
      data: {
        message: updatedMessage,
      },
    };
  } catch (error) {
    console.error('[ConversationService] Failed to remove reaction:', error);
    throw new Error('Failed to remove reaction');
  }
};

/**
 * Pin or Unpin Message
 *
 * @param request - Pin message request
 * @returns Pin message response
 */
export const pinMessage = async (
  request: PinMessageRequest
): Promise<PinMessageResponse> => {
  try {
    const response = await apiClient.post<any>(
      `/api/messages/${request.messageId}/pin`,
      { isPinned: request.isPinned }
    );

    const msg = response.data.message;

    const updatedMessage: Message = {
      id: msg._id,
      conversationId: request.conversationId,
      sender: {
        id: msg.sender._id || msg.sender,
        name: msg.sender.name || msg.sender.email || 'Unknown',
        avatar: msg.sender.avatar,
      },
      content: {
        type: MessageType.TEXT,
        text: msg.content,
      },
      createdAt: msg.createdAt,
      status: msg.status || MessageStatus.SENT,
      isPinned: msg.isPinned || false,
    };

    return {
      success: true,
      message: request.isPinned ? 'Message pinned successfully' : 'Message unpinned successfully',
      data: {
        message: updatedMessage,
      },
    };
  } catch (error) {
    console.error('[ConversationService] Failed to pin message:', error);
    throw new Error('Failed to pin message');
  }
};

/**
 * Search Messages in Conversation
 *
 * @param request - Search messages request
 * @returns Search messages response
 */
export const searchMessages = async (
  request: SearchMessagesRequest
): Promise<SearchMessagesResponse> => {
  try {
    const queryParams = new URLSearchParams({
      conversationId: request.conversationId,
      query: request.query,
    });

    if (request.limit) {
      queryParams.append('limit', request.limit.toString());
    }

    const response = await apiClient.get<any>(
      `/api/messages/search?${queryParams.toString()}`
    );

    const messages: Message[] = response.data.messages.map((msg: any) => ({
      id: msg._id,
      conversationId: request.conversationId,
      sender: {
        id: msg.sender._id || msg.sender,
        name: msg.sender.name || msg.sender.email || 'Unknown',
        avatar: msg.sender.avatar,
      },
      content: {
        type: MessageType.TEXT,
        text: msg.content,
      },
      createdAt: msg.createdAt,
      status: msg.status || MessageStatus.SENT,
    }));

    return {
      success: true,
      message: 'Search completed successfully',
      data: {
        messages,
        total: response.data.total,
      },
    };
  } catch (error) {
    console.error('[ConversationService] Failed to search messages:', error);
    throw new Error('Failed to search messages');
  }
};

/**
 * Forward Message to Another Conversation
 *
 * @param request - Forward message request
 * @returns Forward message response
 */
export const forwardMessage = async (
  request: ForwardMessageRequest
): Promise<ForwardMessageResponse> => {
  try {
    const response = await apiClient.post<any>(
      `/api/messages/${request.messageId}/forward`,
      { targetChatIds: [request.toConversationId] }
    );

    const currentUserId = await getCurrentUserId();
    const currentUserSession = await loadAuthSession();

    // Get the first forwarded message from the response
    const forwardedMsg = response.data.forwardedMessages[0];

    const forwardedMessage: Message = {
      id: forwardedMsg._id,
      conversationId: request.toConversationId,
      sender: {
        id: currentUserId || 'current-user',
        name: currentUserSession?.user?.name || 'You',
        avatar: currentUserSession?.user?.avatar,
      },
      content: {
        type: MessageType.TEXT,
        text: forwardedMsg.content,
      },
      createdAt: forwardedMsg.createdAt,
      status: MessageStatus.SENT,
      forwardedFrom: forwardedMsg.forwardedFrom ? {
        senderId: forwardedMsg.forwardedFrom.sender,
        senderName: forwardedMsg.forwardedFrom.senderName || 'Unknown',
        conversationId: forwardedMsg.forwardedFrom.originalChat,
      } : undefined,
    };

    return {
      success: true,
      message: 'Message forwarded successfully',
      data: {
        message: forwardedMessage,
      },
    };
  } catch (error) {
    console.error('[ConversationService] Failed to forward message:', error);
    throw new Error('Failed to forward message');
  }
};

/**
 * Send Typing Indicator
 *
 * @param _request - Send typing request
 */
export const sendTyping = async (_request: SendTypingRequest): Promise<void> => {
  // TODO: Replace with WebSocket or real API call
  // webSocket.send({ type: 'typing', ...request });

  // Mock - no-op for now
  await new Promise<void>(resolve => setTimeout(() => resolve(), 100));
};

/**
 * Mark Messages as Read
 *
 * @param request - Mark as read request
 * @returns Mark as read response
 */
export const markAsRead = async (
  request: MarkAsReadRequest
): Promise<MarkAsReadResponse> => {
  // TODO: Replace with real API call
  // return apiClient.post<MarkAsReadResponse>(
  //   `/api/chat/conversations/${request.conversationId}/read`,
  //   { messageIds: request.messageIds }
  // );

  await new Promise<void>(resolve => setTimeout(() => resolve(), 300));

  const messages = MOCK_MESSAGES[request.conversationId];
  if (!messages) {
    throw new Error('Conversation not found');
  }

  const updatedMessages: Message[] = [];

  request.messageIds.forEach(msgId => {
    const messageIndex = messages.findIndex(m => m.id === msgId);
    if (messageIndex !== -1) {
      const message = messages[messageIndex];
      const readBy = message.readBy || [];

      if (!readBy.includes('current-user-123')) {
        readBy.push('current-user-123');
      }

      const updatedMessage: Message = {
        ...message,
        status: MessageStatus.READ,
        readBy,
        updatedAt: new Date().toISOString(),
      };

      messages[messageIndex] = updatedMessage;
      updatedMessages.push(updatedMessage);
    }
  });

  return {
    success: true,
    message: 'Messages marked as read',
    data: {
      messages: updatedMessages,
    },
  };
};
