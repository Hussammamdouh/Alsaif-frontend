/**
 * Conversation Hooks
 * Custom hooks for conversation screen business logic
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { FlatList } from 'react-native';
import {
  fetchMessages,
  sendMessage as sendMessageApi,
  retryMessage as retryMessageApi,
  editMessage as editMessageApi,
  deleteMessage as deleteMessageApi,
  addReaction as addReactionApi,
  removeReaction as removeReactionApi,
  pinMessage as pinMessageApi,
  searchMessages as searchMessagesApi,
  forwardMessage as forwardMessageApi,
  sendTyping as sendTypingApi,
  markAsRead as markAsReadApi,
} from '../../../core/services/chat/conversationService';
import {
  mapMessagesToUI,
  createOptimisticMessage,
  reconcileOptimisticMessage,
} from './conversation.mapper';
import {
  ConversationState,
  UIMessage,
  MessageType,
  MessageStatus,
} from './conversation.types';
import { PAGINATION } from './conversation.constants';
import { socketService, SocketEvent } from '../../../core/services/websocket/socketService';

/**
 * Initial Conversation State
 */
const INITIAL_STATE: ConversationState = {
  conversationInfo: null,
  messages: [],
  isLoading: false,
  isLoadingMore: false,
  isSending: false,
  error: null,
  hasMore: true,
  permissions: {
    canSend: true,
    canEdit: false,
    canDelete: false,
    canReply: true,
  },
  replyingTo: null,
  editingMessage: null,
  typingUsers: [],
  pinnedMessages: [],
  searchQuery: '',
  searchResults: [],
};

/**
 * useConversation Hook
 * Manages conversation state and operations
 */
export const useConversation = (conversationId: string) => {
  const [state, setState] = useState<ConversationState>(INITIAL_STATE);
  const [currentPage, setCurrentPage] = useState<number>(PAGINATION.INITIAL_PAGE);
  const flatListRef = useRef<FlatList>(null);

  /**
   * Load messages from API
   */
  const loadMessages = useCallback(
    async (page: number = PAGINATION.INITIAL_PAGE, append: boolean = false) => {
      try {
        setState(prev => ({
          ...prev,
          isLoading: !append,
          isLoadingMore: append,
          error: null,
        }));

        const response = await fetchMessages(
          conversationId,
          page,
          PAGINATION.DEFAULT_PAGE_SIZE
        );

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to fetch messages');
        }

        // Get current user ID for message mapping
        const { loadAuthSession } = await import('../../../app/auth/auth.storage');
        const session = await loadAuthSession();
        const currentUserId = session?.user?.id || '';

        // Map to UI messages with day separators
        const uiMessages = mapMessagesToUI(
          response.data.messages,
          response.data.conversation.type === 'group',
          currentUserId
        );

        // Extract only UIMessage items (filter out day separators for state)
        const messageItems = uiMessages.filter(
          (item): item is UIMessage => !('type' in item)
        );

        setState(prev => {
          // Newest at index 0, so older messages (paginated) go to the end
          const newMessages = append ? [...prev.messages, ...messageItems] : messageItems;

          return {
            ...prev,
            conversationInfo: response.data.conversation,
            messages: newMessages,
            isLoading: false,
            isLoadingMore: false,
            hasMore: response.data.hasMore,
            permissions: response.data.permissions,
            error: null,
          };
        });

        setCurrentPage(page);

        // Scroll to bottom on initial load (not when loading more/older messages)
        if (!append && messageItems.length > 0) {
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: false });
          }, 100);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to load messages';
        setState(prev => ({
          ...prev,
          isLoading: false,
          isLoadingMore: false,
          error: errorMessage,
        }));
      }
    },
    [conversationId]
  );

  /**
   * Handle incoming message from WebSocket
   */
  const handleMessageReceived = useCallback(async (data: { chatId: string; message: any }) => {
    console.log('[Conversation] Received message:', data.message._id);

    // Only add message if it's for this conversation
    if (data.chatId !== conversationId) {
      return;
    }

    // Get current user ID to determine if this is our message
    const { loadAuthSession } = await import('../../../app/auth/auth.storage');
    const session = await loadAuthSession();
    const currentUserId = session?.user?.id;

    const senderId = data.message.sender._id || data.message.sender;
    const isMine = currentUserId ? senderId.toString() === currentUserId.toString() : false;

    // Transform replyTo if exists
    let replyToInfo = undefined;
    if (data.message.replyTo) {
      replyToInfo = {
        messageId: data.message.replyTo._id,
        text: data.message.replyTo.content,
        senderName: data.message.replyTo.sender?.name || 'Unknown',
        senderId: data.message.replyTo.sender?._id || data.message.replyTo.sender || '',
      };
    }

    // Transform reactions if exists
    const reactions = (data.message.reactions || [])
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

    const newMessage: UIMessage = {
      id: data.message._id,
      text: data.message.content,
      senderId,
      senderName: data.message.sender.name || 'Unknown',
      senderAvatar: data.message.sender.avatar,
      timestamp: data.message.createdAt,
      formattedTime: new Date(data.message.createdAt).toLocaleTimeString(),
      isMine,
      status: data.message.status || MessageStatus.SENT,
      showAvatar: false,
      showSenderName: false,
      isFirstInGroup: false,
      isLastInGroup: false,
      reactions: groupedReactions,
      replyTo: replyToInfo,
      isPinned: data.message.isPinned || false,
      isEdited: data.message.isEdited || false,
      isDeleted: data.message.isDeleted || false,
      isFailed: false,
    };

    setState(prev => {
      // If this is our message, remove any optimistic messages (temp-*)
      // Otherwise, just add the new message
      const messagesWithoutOptimistic = isMine
        ? prev.messages.filter(msg => !msg.id.startsWith('temp-'))
        : prev.messages;

      // Check if message already exists (prevent duplicates)
      const messageExists = messagesWithoutOptimistic.some(msg => msg.id === newMessage.id);
      if (messageExists) {
        return prev;
      }

      // Add new message
      return {
        ...prev,
        messages: [newMessage, ...messagesWithoutOptimistic],
        isSending: false,
      };
    });

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [conversationId]);

  /**
   * Handle message updated via WebSocket
   */
  const handleMessageUpdated = useCallback((data: any) => {
    if (data.chatId !== conversationId) return;

    const msg = data.message;
    setState(prev => ({
      ...prev,
      messages: prev.messages.map(m =>
        m.id === msg._id
          ? {
            ...m,
            text: msg.content,
            isEdited: msg.isEdited,
            editedAt: msg.editedAt,
          }
          : m
      ),
    }));
  }, [conversationId]);

  /**
   * Handle message deleted via WebSocket
   */
  const handleMessageDeleted = useCallback((data: any) => {
    if (data.chatId !== conversationId) return;

    const msg = data.message;
    setState(prev => ({
      ...prev,
      messages: prev.messages.map(m =>
        m.id === msg._id
          ? {
            ...m,
            text: 'This message was deleted',
            isDeleted: true,
            deletedAt: msg.deletedAt,
          }
          : m
      ),
    }));
  }, [conversationId]);

  /**
   * Handle message pinned/unpinned via WebSocket
   */
  const handleMessagePinned = useCallback((data: any) => {
    if (data.chatId !== conversationId) return;

    const msg = data.message;
    setState(prev => ({
      ...prev,
      messages: prev.messages.map(m =>
        m.id === msg._id
          ? {
            ...m,
            isPinned: msg.isPinned,
          }
          : m
      ),
    }));
  }, [conversationId]);

  /**
   * Handle reaction added via WebSocket
   */
  const handleReactionAdded = useCallback((data: any) => {
    if (data.chatId !== conversationId) return;

    const msg = data.message;
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

    setState(prev => ({
      ...prev,
      messages: prev.messages.map(m =>
        m.id === msg._id
          ? {
            ...m,
            reactions: groupedReactions,
          }
          : m
      ),
    }));
  }, [conversationId]);

  /**
   * Handle reaction removed via WebSocket
   */
  const handleReactionRemoved = useCallback((data: any) => {
    if (data.chatId !== conversationId) return;

    const msg = data.message;
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

    setState(prev => ({
      ...prev,
      messages: prev.messages.map(m =>
        m.id === msg._id
          ? {
            ...m,
            reactions: groupedReactions,
          }
          : m
      ),
    }));
  }, [conversationId]);

  /**
   * Initial load and WebSocket setup
   */
  useEffect(() => {
    loadMessages();

    // Join chat room for real-time updates
    socketService.joinChat(conversationId);

    // Listen for incoming messages and updates
    socketService.on(SocketEvent.MESSAGE_RECEIVED, handleMessageReceived);
    socketService.on(SocketEvent.MESSAGE_UPDATED, handleMessageUpdated);
    socketService.on(SocketEvent.MESSAGE_DELETED, handleMessageDeleted);
    socketService.on(SocketEvent.MESSAGE_PINNED, handleMessagePinned);
    socketService.on(SocketEvent.REACTION_ADDED, handleReactionAdded);
    socketService.on(SocketEvent.REACTION_REMOVED, handleReactionRemoved);

    // Cleanup on unmount
    return () => {
      socketService.off(SocketEvent.MESSAGE_RECEIVED, handleMessageReceived);
      socketService.off(SocketEvent.MESSAGE_UPDATED, handleMessageUpdated);
      socketService.off(SocketEvent.MESSAGE_DELETED, handleMessageDeleted);
      socketService.off(SocketEvent.MESSAGE_PINNED, handleMessagePinned);
      socketService.off(SocketEvent.REACTION_ADDED, handleReactionAdded);
      socketService.off(SocketEvent.REACTION_REMOVED, handleReactionRemoved);
      socketService.leaveChat(conversationId);
    };
  }, [
    loadMessages,
    conversationId,
    handleMessageReceived,
    handleMessageUpdated,
    handleMessageDeleted,
    handleMessagePinned,
    handleReactionAdded,
    handleReactionRemoved,
  ]);

  /**
   * Load more messages (pagination - load older)
   */
  const handleLoadMore = useCallback(() => {
    if (!state.isLoadingMore && state.hasMore) {
      const nextPage = currentPage + 1;
      loadMessages(nextPage, true);
    }
  }, [state.isLoadingMore, state.hasMore, currentPage, loadMessages]);

  /**
   * Send message with optimistic UI
   */
  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || !state.permissions.canSend) {
        return;
      }

      // Get current user info for optimistic message
      const { loadAuthSession } = await import('../../../app/auth/auth.storage');
      const session = await loadAuthSession();
      const currentUserId = session?.user?.id || '';
      const currentUserName = session?.user?.name || 'You';

      const tempId = `temp-${Date.now()}`;
      const optimisticMessage = createOptimisticMessage(
        conversationId,
        text.trim(),
        tempId,
        currentUserId,
        currentUserName
      );

      // Add optimistic message at the start (visual bottom)
      setState(prev => ({
        ...prev,
        messages: [optimisticMessage, ...prev.messages],
        isSending: true,
      }));

      // Scroll to bottom (index 0)
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      }, 100);

      try {
        // Send to backend with reply info if replying
        const response = await sendMessageApi({
          conversationId,
          content: {
            type: MessageType.TEXT,
            text: text.trim(),
          },
          tempId,
          replyTo: state.replyingTo?.id,
        });

        if (!response.success || !response.data) {
          throw new Error('Failed to send message');
        }

        // Reconcile optimistic message with server response
        const reconciledMessage = reconcileOptimisticMessage(
          optimisticMessage,
          response.data.message,
          state.conversationInfo?.type === 'group'
        );

        setState(prev => ({
          ...prev,
          messages: prev.messages.map(msg =>
            msg.id === tempId ? reconciledMessage : msg
          ),
          isSending: false,
          replyingTo: null, // Clear reply state after sending
        }));
      } catch (error) {
        // Mark message as failed
        setState(prev => ({
          ...prev,
          messages: prev.messages.map(msg =>
            msg.id === tempId
              ? { ...msg, status: MessageStatus.FAILED, isFailed: true }
              : msg
          ),
          isSending: false,
        }));
      }
    },
    [conversationId, state.permissions.canSend, state.conversationInfo?.type, state.replyingTo]
  );

  /**
   * Retry failed message
   */
  const handleRetryMessage = useCallback(
    async (messageId: string) => {
      setState(prev => ({
        ...prev,
        messages: prev.messages.map(msg =>
          msg.id === messageId
            ? { ...msg, status: MessageStatus.SENDING, isFailed: false }
            : msg
        ),
      }));

      try {
        const response = await retryMessageApi(messageId);

        if (!response.success || !response.data) {
          throw new Error('Retry failed');
        }

        setState(prev => ({
          ...prev,
          messages: prev.messages.map(msg =>
            msg.id === messageId
              ? { ...msg, status: MessageStatus.SENT, isFailed: false }
              : msg
          ),
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          messages: prev.messages.map(msg =>
            msg.id === messageId
              ? { ...msg, status: MessageStatus.FAILED, isFailed: true }
              : msg
          ),
        }));
      }
    },
    []
  );

  /**
   * Get current user ID for list data mapping
   */
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    (async () => {
      const { loadAuthSession } = await import('../../../app/auth/auth.storage');
      const session = await loadAuthSession();
      setCurrentUserId(session?.user?.id || '');
    })();
  }, []);

  /**
   * Build list data with day separators for rendering
   */
  const listData = mapMessagesToUI(
    // Convert UIMessages back to Message format for mapping
    state.messages.map(msg => {
      // Fix "Unknown" sender names by looking up from participants
      let senderName = msg.senderName;
      if (!senderName || senderName === 'Unknown') {
        console.log('[hooks] Looking up sender for:', msg.senderId, 'participants:', state.conversationInfo?.participants);
        const participant = state.conversationInfo?.participants?.find(
          (p: any) => {
            const userId = p.user?._id || p.user;
            console.log('[hooks] Comparing:', userId, 'with', msg.senderId, 'match?', userId === msg.senderId);
            return userId === msg.senderId;
          }
        );
        console.log('[hooks] Found participant:', participant);
        senderName = participant?.user?.name || participant?.user?.email || 'Unknown';
        console.log('[hooks] Final senderName:', senderName);
      }

      return {
        id: msg.id,
        conversationId,
        sender: {
          id: msg.senderId,
          name: senderName,
          avatar: msg.senderAvatar,
          role: msg.senderRole,
        },
        content: {
          type: MessageType.TEXT,
          text: msg.text,
          fileName: msg.fileName,
          fileSize: msg.fileSize,
        },
        createdAt: msg.timestamp,
        status: msg.status,
        isEdited: msg.isEdited,
        editedAt: msg.editedAt,
        reactions: msg.reactions,
        replyTo: msg.replyTo,
        isPinned: msg.isPinned,
        isDeleted: msg.isDeleted,
        readBy: msg.readBy,
      };
    }),
    state.conversationInfo?.type === 'group',
    currentUserId
  );

  /**
   * Scroll to bottom
   */
  const scrollToBottom = useCallback((animated: boolean = true) => {
    flatListRef.current?.scrollToEnd({ animated });
  }, []);

  /**
   * Start editing a message
   */
  const startEditingMessage = useCallback((message: UIMessage) => {
    setState(prev => ({
      ...prev,
      editingMessage: message,
    }));
  }, []);

  /**
   * Cancel editing
   */
  const cancelEditing = useCallback(() => {
    setState(prev => ({
      ...prev,
      editingMessage: null,
    }));
  }, []);

  /**
   * Edit message
   */
  const handleEditMessage = useCallback(
    async (messageId: string, newText: string) => {
      if (!newText.trim() || !state.permissions.canEdit) {
        return;
      }

      try {
        const response = await editMessageApi({
          conversationId,
          messageId,
          newText: newText.trim(),
        });

        if (!response.success || !response.data) {
          throw new Error('Failed to edit message');
        }

        // Update message in state
        setState(prev => ({
          ...prev,
          messages: prev.messages.map(msg =>
            msg.id === messageId
              ? {
                ...msg,
                text: newText.trim(),
                isEdited: true,
                editedAt: response.data.message.editedAt,
              }
              : msg
          ),
          editingMessage: null,
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to edit message';
        setState(prev => ({
          ...prev,
          error: errorMessage,
        }));
      }
    },
    [conversationId, state.permissions.canEdit]
  );

  /**
   * Delete message
   */
  const handleDeleteMessage = useCallback(
    async (messageId: string) => {
      if (!state.permissions.canDelete) {
        return;
      }

      try {
        const response = await deleteMessageApi({
          conversationId,
          messageId,
        });

        if (!response.success || !response.data) {
          throw new Error('Failed to delete message');
        }

        // Update message to show as deleted
        setState(prev => ({
          ...prev,
          messages: prev.messages.map(msg =>
            msg.id === messageId
              ? {
                ...msg,
                text: 'This message was deleted',
                isDeleted: true,
              }
              : msg
          ),
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to delete message';
        setState(prev => ({
          ...prev,
          error: errorMessage,
        }));
      }
    },
    [conversationId, state.permissions.canDelete]
  );

  /**
   * Add reaction to message
   */
  const handleAddReaction = useCallback(
    async (messageId: string, emoji: string) => {
      try {
        const response = await addReactionApi({
          conversationId,
          messageId,
          emoji,
        });

        if (!response.success || !response.data) {
          throw new Error('Failed to add reaction');
        }

        // Update message with new reaction
        setState(prev => ({
          ...prev,
          messages: prev.messages.map(msg =>
            msg.id === messageId
              ? {
                ...msg,
                reactions: response.data.message.reactions,
              }
              : msg
          ),
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to add reaction';
        setState(prev => ({
          ...prev,
          error: errorMessage,
        }));
      }
    },
    [conversationId]
  );

  /**
   * Remove reaction from message
   */
  const handleRemoveReaction = useCallback(
    async (messageId: string, emoji: string) => {
      try {
        const response = await removeReactionApi({
          conversationId,
          messageId,
          emoji,
        });

        if (!response.success || !response.data) {
          throw new Error('Failed to remove reaction');
        }

        // Update message with updated reactions
        setState(prev => ({
          ...prev,
          messages: prev.messages.map(msg =>
            msg.id === messageId
              ? {
                ...msg,
                reactions: response.data.message.reactions,
              }
              : msg
          ),
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to remove reaction';
        setState(prev => ({
          ...prev,
          error: errorMessage,
        }));
      }
    },
    [conversationId]
  );

  /**
   * Toggle pin status of message
   */
  const handleTogglePin = useCallback(
    async (messageId: string, isPinned: boolean) => {
      try {
        const response = await pinMessageApi({
          conversationId,
          messageId,
          isPinned,
        });

        if (!response.success || !response.data) {
          throw new Error('Failed to pin message');
        }

        // Update message pin status
        setState(prev => {
          const updatedMessages = prev.messages.map(msg =>
            msg.id === messageId ? { ...msg, isPinned } : msg
          );

          const pinnedMessages = updatedMessages.filter(msg => msg.isPinned);

          return {
            ...prev,
            messages: updatedMessages,
            pinnedMessages,
          };
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to pin message';
        setState(prev => ({
          ...prev,
          error: errorMessage,
        }));
      }
    },
    [conversationId]
  );

  /**
   * Search messages
   */
  const handleSearchMessages = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setState(prev => ({
          ...prev,
          searchQuery: '',
          searchResults: [],
        }));
        return;
      }

      try {
        const response = await searchMessagesApi({
          conversationId,
          query: query.trim(),
          limit: 50,
        });

        if (!response.success || !response.data) {
          throw new Error('Failed to search messages');
        }

        // Get current user ID for search results mapping
        const { loadAuthSession } = await import('../../../app/auth/auth.storage');
        const session = await loadAuthSession();
        const searchCurrentUserId = session?.user?.id || '';

        // Map search results to UI messages
        const searchResults = mapMessagesToUI(
          response.data.messages,
          state.conversationInfo?.type === 'group',
          searchCurrentUserId
        ).filter((item): item is UIMessage => !('type' in item));

        setState(prev => ({
          ...prev,
          searchQuery: query.trim(),
          searchResults,
        }));
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to search messages';
        setState(prev => ({
          ...prev,
          error: errorMessage,
        }));
      }
    },
    [conversationId, state.conversationInfo?.type]
  );

  /**
   * Clear search
   */
  const clearSearch = useCallback(() => {
    setState(prev => ({
      ...prev,
      searchQuery: '',
      searchResults: [],
    }));
  }, []);

  /**
   * Forward message
   */
  const handleForwardMessage = useCallback(
    async (messageId: string, toConversationId: string) => {
      try {
        const response = await forwardMessageApi({
          messageId,
          fromConversationId: conversationId,
          toConversationId,
        });

        if (!response.success || !response.data) {
          throw new Error('Failed to forward message');
        }

        // Success - could show toast notification
        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to forward message';
        setState(prev => ({
          ...prev,
          error: errorMessage,
        }));
        return false;
      }
    },
    [conversationId]
  );

  /**
   * Set reply target
   */
  const setReplyingTo = useCallback((message: UIMessage | null) => {
    setState(prev => ({
      ...prev,
      replyingTo: message,
    }));
  }, []);

  /**
   * Send typing indicator
   */
  const sendTypingIndicator = useCallback(
    async (isTyping: boolean) => {
      try {
        await sendTypingApi({
          conversationId,
          isTyping,
        });
      } catch (error) {
        // Silently fail - typing indicators are not critical
      }
    },
    [conversationId]
  );

  /**
   * Mark messages as read
   */
  const handleMarkAsRead = useCallback(
    async (messageIds: string[]) => {
      try {
        const response = await markAsReadApi({
          conversationId,
          messageIds,
        });

        if (!response.success || !response.data) {
          throw new Error('Failed to mark messages as read');
        }

        // Update message statuses
        setState(prev => ({
          ...prev,
          messages: prev.messages.map(msg => {
            if (messageIds.includes(msg.id)) {
              return {
                ...msg,
                status: MessageStatus.READ,
              };
            }
            return msg;
          }),
        }));
      } catch (error) {
        // Silently fail - read receipts are not critical
      }
    },
    [conversationId]
  );

  /**
   * Update typing users (would be called from WebSocket listener)
   */
  const updateTypingUsers = useCallback((typingUsers: Array<{ id: string; name: string }>) => {
    setState(prev => ({
      ...prev,
      typingUsers,
    }));
  }, []);

  return {
    // State
    conversationInfo: state.conversationInfo,
    messages: listData,
    isLoading: state.isLoading,
    isLoadingMore: state.isLoadingMore,
    isSending: state.isSending,
    error: state.error,
    hasMore: state.hasMore,
    permissions: state.permissions,
    replyingTo: state.replyingTo,
    editingMessage: state.editingMessage,
    typingUsers: state.typingUsers,
    pinnedMessages: state.pinnedMessages,
    searchQuery: state.searchQuery,
    searchResults: state.searchResults,

    // Actions
    handleLoadMore,
    handleSendMessage,
    handleRetryMessage,
    scrollToBottom,
    startEditingMessage,
    cancelEditing,
    handleEditMessage,
    handleDeleteMessage,
    handleAddReaction,
    handleRemoveReaction,
    handleTogglePin,
    handleSearchMessages,
    clearSearch,
    handleForwardMessage,
    setReplyingTo,
    sendTypingIndicator,
    handleMarkAsRead,
    updateTypingUsers,

    // Refs
    flatListRef,
  };
};

/**
 * useMessageInput Hook
 * Manages message input state
 */
export const useMessageInput = () => {
  const [text, setText] = useState('');

  const handleChangeText = useCallback((newText: string) => {
    setText(newText);
  }, []);

  const clearText = useCallback(() => {
    setText('');
  }, []);

  const isSubmitDisabled = !text.trim();

  return {
    text,
    setText: handleChangeText,
    clearText,
    isSubmitDisabled,
  };
};
