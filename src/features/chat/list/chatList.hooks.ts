/**
 * Chat List Hooks
 * Custom hooks for chat list business logic
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { fetchConversations, searchConversations } from '../../../core/services/chat/chatService';
import { mapConversationsToUI, mapConversationToUI } from './chatList.mapper';
import {
  ChatListState,
  ChatFilter,
  UIConversation,
  Conversation,
  ConversationType,
} from './chatList.types';
import { PAGINATION } from './chatList.constants';
import { socketService, SocketEvent } from '../../../core/services/websocket/socketService';
import { useUser } from '../../../app/auth/auth.hooks';
import * as chatService from '../../../core/services/chat/chatService';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../../app/navigation/types';
import { useLocalization } from '../../../app/providers';
import { useSubscriptionAccess } from '../../subscription/useSubscriptionAccess';
import { chatEvents } from '../chatEvents';

/**
 * Initial Chat List State
 */
const INITIAL_STATE: ChatListState = {
  conversations: [],
  isLoading: false,
  isRefreshing: false,
  error: null,
  hasMore: true,
  currentPage: PAGINATION.INITIAL_PAGE,
};

/**
 * useChatList Hook
 * Manages chat list state and operations
 */
export const useChatList = () => {
  const [state, setState] = useState<ChatListState>(INITIAL_STATE);
  const [activeFilter, setActiveFilter] = useState<ChatFilter>(ChatFilter.ALL);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const user = useUser();
  const { t } = useLocalization();

  /**
   * Load conversations from API
   */
  const loadConversations = useCallback(
    async (page: number = PAGINATION.INITIAL_PAGE, append: boolean = false) => {
      try {
        // Set loading state
        setState(prev => ({
          ...prev,
          isLoading: !append,
          error: null,
        }));

        // Fetch conversations
        const response = await fetchConversations(page, PAGINATION.DEFAULT_PAGE_SIZE);


        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to fetch conversations');
        }

        // Map to UI models
        const uiConversations = mapConversationsToUI(response.data.conversations, user?.id);


        // Update state
        setState(prev => {
          return {
            ...prev,
            conversations: append
              ? [...prev.conversations, ...uiConversations]
              : uiConversations,
            isLoading: false,
            isRefreshing: false,
            hasMore: response.data.hasMore,
            currentPage: page,
            error: null,
          };
        });
      } catch (error) {
        console.error('[useChatList] Load conversations error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load conversations';
        setState(prev => ({
          ...prev,
          isLoading: false,
          isRefreshing: false,
          error: errorMessage,
        }));
      }
    },
    []
  );

  /**
   * Handle chat list update from WebSocket
   */
  const handleChatListUpdate = useCallback((data: { chat: any }) => {

    const updatedChat: Conversation = {
      id: data.chat._id,
      type: data.chat.type === 'group' ? ConversationType.GROUP : ConversationType.PRIVATE,
      title: data.chat.name || 'Private Chat',
      participants: data.chat.participants.map((p: any) => ({
        id: p.user._id || p.user,
        name: p.user.name || p.user.email || 'Unknown',
        avatar: p.user.avatar || undefined,
        role: p.permission === 'admin' ? 'admin' : 'member',
        isOnline: false,
      })),
      lastMessage: data.chat.lastMessage && data.chat.lastMessage.content ? {
        id: data.chat.lastMessage._id || 'last-msg',
        text: data.chat.lastMessage.content,
        senderId: typeof data.chat.lastMessage.sender === 'object'
          ? (data.chat.lastMessage.sender._id || data.chat.lastMessage.sender)
          : data.chat.lastMessage.sender,
        senderName: typeof data.chat.lastMessage.sender === 'object'
          ? (data.chat.lastMessage.sender.name || data.chat.lastMessage.sender.email || 'Unknown')
          : 'Unknown',
        timestamp: data.chat.lastMessage.timestamp || data.chat.updatedAt,
        isRead: true,
      } : undefined,
      unreadCount: 0,
      isMuted: false,
      isPinned: data.chat.isPinned || false,
      isArchived: false,
      createdAt: data.chat.createdAt,
      updatedAt: data.chat.updatedAt,
      permissions: {
        canSend: true,
        canView: true,
        canEdit: false,
        canDelete: false,
      },
      groupAvatar: data.chat.type === 'group' ? data.chat.groupAvatar : undefined,
    };

    const uiConversation = mapConversationToUI(updatedChat, user?.id);

    setState(prev => {
      // Find if chat already exists in the list
      const existingIndex = prev.conversations.findIndex(conv => conv.id === uiConversation.id);

      let updatedConversations: UIConversation[];
      if (existingIndex >= 0) {
        // Update existing chat
        updatedConversations = [...prev.conversations];
        updatedConversations[existingIndex] = uiConversation;
      } else {
        // Add new chat to the beginning
        updatedConversations = [uiConversation, ...prev.conversations];
      }

      // Sort by updatedAt to keep most recent first
      updatedConversations.sort((a, b) => {
        const aTime = new Date(a.lastMessageTime || 0).getTime();
        const bTime = new Date(b.lastMessageTime || 0).getTime();
        return bTime - aTime;
      });

      return {
        ...prev,
        conversations: updatedConversations,
      };
    });
  }, []);

  /**
   * Initial load and WebSocket connection
   */
  useEffect(() => {
    loadConversations();

    // Connect to WebSocket
    socketService.connect();

    // Listen for chat list updates
    socketService.on(SocketEvent.CHAT_LIST_UPDATED, handleChatListUpdate);

    // Cleanup on unmount
    return () => {
      socketService.off(SocketEvent.CHAT_LIST_UPDATED, handleChatListUpdate);
      // Don't disconnect socket here - it should stay connected for the app session
    };
  }, [loadConversations, handleChatListUpdate]);

  // Listen for chat removal events (optimistic UI from any screen)
  useEffect(() => {
    const unsubscribe = chatEvents.onChatRemoved((chatId: string) => {
      setState(prev => ({
        ...prev,
        conversations: prev.conversations.filter(c => c.id !== chatId),
      }));
    });
    return unsubscribe;
  }, []);

  /**
   * Refresh conversations (pull-to-refresh)
   */
  const handleRefresh = useCallback(async () => {
    setState(prev => ({ ...prev, isRefreshing: true }));
    await loadConversations(PAGINATION.INITIAL_PAGE, false);
  }, [loadConversations]);

  /**
   * Load more conversations (pagination)
   */
  const handleLoadMore = useCallback(() => {
    if (!state.isLoading && state.hasMore) {
      const nextPage = state.currentPage + 1;
      loadConversations(nextPage, true);
    }
  }, [state.isLoading, state.hasMore, state.currentPage, loadConversations]);

  /**
   * Search conversations
   */
  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      // Reset to full list
      await loadConversations(PAGINATION.INITIAL_PAGE, false);
      return;
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await searchConversations(query);

      if (!response.success || !response.data) {
        throw new Error('Search failed');
      }

      const uiConversations = mapConversationsToUI(response.data.conversations, user?.id);

      setState(prev => ({
        ...prev,
        conversations: uiConversations,
        isLoading: false,
        hasMore: false, // No pagination for search results
        error: null,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Search failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, [loadConversations]);

  /**
   * Handle filter change
   */
  const handleFilterChange = useCallback((filter: ChatFilter) => {
    setActiveFilter(filter);
  }, []);

  /**
   * Filter conversations based on active filter
   */
  const filteredConversations = useMemo((): UIConversation[] => {
    let filtered = state.conversations;

    switch (activeFilter) {
      case ChatFilter.UNREAD:
        filtered = filtered.filter(conv => conv.unreadCount > 0);
        break;

      case ChatFilter.PREMIUM:
        filtered = filtered.filter(conv => conv.badgeColor !== undefined);
        break;

      case ChatFilter.GROUPS:
        filtered = filtered.filter(conv => conv.type === 'group');
        break;

      case ChatFilter.ALL:
      default:
        // No filtering
        break;
    }

    return filtered;
  }, [state.conversations, activeFilter]);

  /**
   * Separate pinned and recent conversations
   */
  const { pinnedConversations, recentConversations } = useMemo(() => {
    const pinned = filteredConversations.filter(conv => conv.isPinned);
    const recent = filteredConversations.filter(conv => !conv.isPinned);

    return {
      pinnedConversations: pinned,
      recentConversations: recent,
    };
  }, [filteredConversations]);

  /**
   * Retry loading after error
   */
  const handleRetry = useCallback(() => {
    loadConversations(PAGINATION.INITIAL_PAGE, false);
  }, [loadConversations]);

  /**
   * Archive a conversation
   */
  const handleArchive = useCallback(async (conversationId: string) => {
    try {
      const success = await chatService.archiveChat(conversationId);
      if (success) {
        setState(prev => ({
          ...prev,
          conversations: prev.conversations.filter(c => c.id !== conversationId)
        }));
      }
    } catch (error) {
      console.error('[useChatList] Archive failed:', error);
      Alert.alert(t('common.error'), t('chatList.archiveError'));
    }
  }, [t]);

  /**
   * Delete a conversation
   */
  const handleDelete = useCallback(async (conversationId: string) => {
    Alert.alert(
      t('chatList.deleteTitle'),
      t('chatList.deleteConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await chatService.deleteChat(conversationId);
              if (success) {
                setState(prev => ({
                  ...prev,
                  conversations: prev.conversations.filter(c => c.id !== conversationId)
                }));
              }
            } catch (error) {
              console.error('[useChatList] Delete failed:', error);
              Alert.alert(t('common.error'), t('chatList.deleteError'));
            }
          }
        }
      ]
    );
  }, [t]);

  /**
   * Block a user
   */
  const handleBlock = useCallback(async (participantId: string) => {
    Alert.alert(
      t('chatList.blockTitle'),
      t('chatList.blockConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.block'),
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await chatService.blockUser(participantId);
              if (success) {
                // After blocking, maybe delete the chat too?
                // For now just show success
                Alert.alert(t('common.success'), t('chatList.blockSuccess'));
              }
            } catch (error) {
              console.error('[useChatList] Block failed:', error);
              Alert.alert(t('common.error'), t('chatList.blockError'));
            }
          }
        }
      ]
    );
  }, [t]);

  /**
   * Remove a conversation from the list (optimistic UI)
   * Used when user leaves or deletes a group
   */
  const removeConversation = useCallback((conversationId: string) => {
    setState(prev => ({
      ...prev,
      conversations: prev.conversations.filter(c => c.id !== conversationId),
    }));
  }, []);

  return {
    // State
    conversations: filteredConversations,
    pinnedConversations,
    recentConversations,
    isLoading: state.isLoading,
    isRefreshing: state.isRefreshing,
    error: state.error,
    hasMore: state.hasMore,
    activeFilter,
    searchQuery,

    // Actions
    handleRefresh,
    handleLoadMore,
    handleSearch,
    handleFilterChange,
    handleRetry,
    handleArchive,
    handleDelete,
    handleBlock,
    removeConversation,
  };
};

/**
 * useConversationPress Hook
 * Handles conversation row press with permission checking
 */
export const useConversationPress = (
  onNavigateToChat: (conversationId: string) => void
) => {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { hasPremiumAccess } = useSubscriptionAccess();

  const handlePress = useCallback(
    (conversation: UIConversation) => {
      // Check if this is a premium chat and user has access
      const isPremiumChat = !!conversation.badgeColor;

      if (isPremiumChat && !hasPremiumAccess) {
        // Redirect to paywall for premium chats if no access
        navigation.navigate('Paywall');
        return;
      }

      // Check if user has permission to view
      if (!conversation.hasPermission) {
        // Could show an alert or permission denied message
        console.warn('User does not have permission to view this conversation');
        return;
      }

      // Navigate to chat room
      onNavigateToChat(conversation.id);
    },
    [onNavigateToChat, navigation, hasPremiumAccess]
  );

  return { handlePress };
};
