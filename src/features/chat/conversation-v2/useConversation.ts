/**
 * Conversation Hook
 * Clean state management with no data transformation gymnastics
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Message, ConversationState } from './types';
import * as conversationService from './service';
import { socketService, SocketEvent } from '../../../core/services/websocket/socketService';

const INITIAL_STATE: ConversationState = {
  conversation: null,
  messages: [],
  isLoading: true,
  isLoadingMore: false,
  isSending: false,
  error: null,
  hasMore: false,
  currentPage: 1,
  replyingTo: null,
  editingMessage: null,
  selectedMessages: [],
  typingUsers: [],
};

export const useConversation = (conversationId: string) => {
  const [state, setState] = useState<ConversationState>(INITIAL_STATE);
  const flatListRef = useRef<any>(null);

  /**
   * Load messages
   */
  const loadMessages = useCallback(
    async (page: number = 1, append: boolean = false) => {
      try {
        setState(prev => ({
          ...prev,
          isLoading: !append,
          isLoadingMore: append,
          error: null,
        }));

        const { conversation, messages, hasMore } = await conversationService.getConversationMessages(
          conversationId,
          page
        );

        // If messages are returned in ascending order (oldest first) and we're using an inverted FlatList,
        // we need to reverse them for correct chronological display (newest at index 0).
        const reversedMessages = [...messages].reverse();

        setState(prev => ({
          ...prev,
          conversation,
          messages: append ? [...prev.messages, ...reversedMessages] : reversedMessages,
          hasMore,
          currentPage: page,
          isLoading: false,
          isLoadingMore: false,
        }));

        // Scroll to bottom (top of inverted list) on initial load
        if (!append && reversedMessages.length > 0) {
          setTimeout(() => {
            flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
          }, 100);
        }
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to load messages',
          isLoading: false,
          isLoadingMore: false,
        }));
      }
    },
    [conversationId]
  );

  /**
   * Load more (older) messages
   */
  const loadMore = useCallback(() => {
    if (!state.isLoadingMore && state.hasMore) {
      loadMessages(state.currentPage + 1, true);
    }
  }, [state.isLoadingMore, state.hasMore, state.currentPage, loadMessages]);

  /**
   * Send message via WebSocket
   * Actual message will be received via WebSocket event
   */
  const sendMessage = useCallback(
    async (content: string) => {
      try {
        setState(prev => ({ ...prev, isSending: true, error: null }));

        await conversationService.sendMessage(
          conversationId,
          content,
          state.replyingTo?.id
        );

        setState(prev => ({
          ...prev,
          isSending: false,
          replyingTo: null,
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to send message',
          isSending: false,
        }));
      }
    },
    [conversationId, state.replyingTo]
  );

  /**
   * Add reaction
   */
  const addReaction = useCallback(
    async (messageId: string, emoji: string) => {
      try {
        const updatedMessage = await conversationService.addReaction(conversationId, messageId, emoji);

        setState(prev => ({
          ...prev,
          messages: prev.messages.map(msg =>
            msg.id === messageId ? updatedMessage : msg
          ),
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to add reaction',
        }));
      }
    },
    [conversationId]
  );

  /**
   * Remove reaction
   */
  const removeReaction = useCallback(
    async (messageId: string, emoji: string) => {
      try {
        const updatedMessage = await conversationService.removeReaction(conversationId, messageId, emoji);

        setState(prev => ({
          ...prev,
          messages: prev.messages.map(msg =>
            msg.id === messageId ? updatedMessage : msg
          ),
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to remove reaction',
        }));
      }
    },
    [conversationId]
  );

  /**
   * Edit message
   */
  const editMessage = useCallback(
    async (messageId: string, content: string) => {
      console.log('[useConversation] Editing message:', messageId, content);
      try {
        setState(prev => ({ ...prev, isSending: true, error: null }));

        const updatedMessage = await conversationService.editMessage(conversationId, messageId, content);

        setState(prev => {
          console.log('[useConversation] Updating messages state for edit:', messageId);
          return {
            ...prev,
            messages: prev.messages.map(msg =>
              msg.id === messageId ? updatedMessage : msg
            ),
            isSending: false,
            editingMessage: null,
          };
        });
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to edit message',
          isSending: false,
        }));
      }
    },
    [conversationId]
  );

  /**
   * Delete message
   */
  const deleteMessage = useCallback(
    async (messageId: string) => {
      console.log('[useConversation] Deleting message:', messageId);
      try {
        await conversationService.deleteMessage(conversationId, messageId);

        setState(prev => {
          console.log('[useConversation] Updating messages state for delete:', messageId);
          return {
            ...prev,
            messages: prev.messages.filter(msg => msg.id !== messageId),
          };
        });
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to delete message',
        }));
      }
    },
    [conversationId]
  );

  /**
   * Toggle pin message
   */
  const togglePin = useCallback(
    async (messageId: string, isPinned: boolean) => {
      try {
        const updatedMessage = await conversationService.togglePinMessage(conversationId, messageId, isPinned);

        setState(prev => ({
          ...prev,
          messages: prev.messages.map(msg =>
            msg.id === messageId ? updatedMessage : msg
          ),
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to toggle pin',
        }));
      }
    },
    [conversationId]
  );

  /**
   * Set replying to
   */
  const setReplyingTo = useCallback((message: Message | null) => {
    setState(prev => ({ ...prev, replyingTo: message }));
  }, []);

  /**
   * Start editing
   */
  const startEditing = useCallback((message: Message) => {
    setState(prev => ({ ...prev, editingMessage: message }));
  }, []);

  /**
   * Cancel editing
   */
  const cancelEditing = useCallback(() => {
    setState(prev => ({ ...prev, editingMessage: null }));
  }, []);

  /**
   * Load initial messages on mount
   */
  useEffect(() => {
    loadMessages(1, false);
  }, [conversationId, loadMessages]); // Added loadMessages to dependencies

  /**
   * WebSocket event handlers
   */
  useEffect(() => {
    // Join chat room
    socketService.joinChat(conversationId);

    // Handle incoming messages
    const handleMessageReceived = (data: any) => {
      const newMessage = conversationService.transformMessage(data.message, conversationId);
      setState(prev => ({
        ...prev,
        messages: [newMessage, ...prev.messages],
      }));
    };

    // Handle message updates (edit)
    const handleMessageUpdated = (data: any) => {
      const updatedMessage = conversationService.transformMessage(data.message, conversationId);
      setState(prev => ({
        ...prev,
        messages: prev.messages.map(msg =>
          msg.id === updatedMessage.id ? updatedMessage : msg
        ),
      }));
    };

    // Handle message deletion
    const handleMessageDeleted = (data: any) => {
      console.log('[useConversation] Received MESSAGE_DELETED event:', data);
      setState(prev => ({
        ...prev,
        messages: prev.messages.filter(msg => {
          const match = msg.id === data.messageId;
          if (match) console.log('[useConversation] Filtering out message:', msg.id);
          return !match;
        }),
      }));
    };

    // Handle pin/unpin
    const handleMessagePinned = (data: any) => {
      setState(prev => ({
        ...prev,
        messages: prev.messages.map(msg =>
          msg.id === data.messageId ? { ...msg, isPinned: data.isPinned } : msg
        ),
      }));
    };

    // Handle reaction added
    const handleReactionAdded = (data: any) => {
      const updatedMessage = conversationService.transformMessage(data.message, conversationId);
      setState(prev => ({
        ...prev,
        messages: prev.messages.map(msg =>
          msg.id === updatedMessage.id ? updatedMessage : msg
        ),
      }));
    };

    // Handle reaction removed
    const handleReactionRemoved = (data: any) => {
      const updatedMessage = conversationService.transformMessage(data.message, conversationId);
      setState(prev => ({
        ...prev,
        messages: prev.messages.map(msg =>
          msg.id === updatedMessage.id ? updatedMessage : msg
        ),
      }));
    };

    // Subscribe to events
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
  }, [conversationId]);

  return {
    // State
    conversation: state.conversation,
    messages: state.messages,
    isLoading: state.isLoading,
    isLoadingMore: state.isLoadingMore,
    isSending: state.isSending,
    error: state.error,
    hasMore: state.hasMore,
    replyingTo: state.replyingTo,
    editingMessage: state.editingMessage,
    typingUsers: state.typingUsers,

    // Actions
    sendMessage,
    addReaction,
    removeReaction,
    editMessage,
    deleteMessage,
    togglePin,
    setReplyingTo,
    startEditing,
    cancelEditing,
    loadMore,
    flatListRef,
  };
};
