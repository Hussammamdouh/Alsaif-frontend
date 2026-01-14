/**
 * Chat List Screen
 * Displays list of conversations (private and group chats)
 * Production-grade implementation with performance optimizations
 */

import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  RefreshControl,
  ListRenderItemInfo,
  Pressable,
  Animated,
  Easing,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';

import { useTheme, useLocalization } from '../../../app/providers';
import { styles } from './chatList.styles';
import { useChatList, useConversationPress } from './chatList.hooks';
import { UIConversation, ChatFilter } from './chatList.types';
import { CHAT_FILTERS, EMPTY_STATES, LIST_CONFIG } from './chatList.constants';
import { formatUnreadCount } from './chatList.mapper';
import { NewChatModal } from './NewChatModal';

/**
 * Chat List Screen Props
 */
interface ChatListScreenProps {
  onNavigateToChat: (conversationId: string) => void;
  onNavigateToNewChat?: () => void;
}

/**
 * Conversation Row Component
 * Memoized for performance
 */
const ConversationRow = React.memo<{
  conversation: UIConversation;
  onPress: (conversation: UIConversation) => void;
  onLongPress: (conversation: UIConversation) => void;
}>(({ conversation, onPress, onLongPress }) => {
  const { theme } = useTheme();
  const { t } = useLocalization();

  const handlePress = useCallback(() => {
    onPress(conversation);
  }, [conversation, onPress]);

  const hasUnread = conversation.unreadCount > 0;

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={() => onLongPress(conversation)}
      style={({ pressed }) => [
        styles.conversationRow,
        { backgroundColor: theme.ui.card },
        pressed && { backgroundColor: theme.background.secondary },
      ]}
    >
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        {conversation.avatarUrls && conversation.avatarUrls.length > 1 ? (
          // Group chat with multiple avatars
          <View style={styles.groupAvatarContainer}>
            {conversation.avatarUrls[0] && (
              <Image
                source={{ uri: conversation.avatarUrls[0] }}
                style={styles.groupAvatar1}
              />
            )}
            {conversation.avatarUrls[1] && (
              <Image
                source={{ uri: conversation.avatarUrls[1] }}
                style={styles.groupAvatar2}
              />
            )}
          </View>
        ) : conversation.avatarUri ? (
          // Single avatar
          <Image
            source={{ uri: conversation.avatarUri }}
            style={styles.avatar}
          />
        ) : (
          // Placeholder
          <View style={[styles.avatarPlaceholder, { backgroundColor: theme.primary.main }]}>
            <Text style={[styles.avatarPlaceholderText, { color: theme.text.inverse }]}>
              {conversation.title.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        {/* Online indicator for private chats */}
        {conversation.type === 'private' && (
          <View style={[styles.onlineIndicator, { backgroundColor: theme.accent.success }]} />
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.contentHeader}>
          <Text
            style={[
              styles.conversationTitle,
              { color: theme.text.primary },
              hasUnread && { fontWeight: '700' },
            ]}
            numberOfLines={1}
          >
            {conversation.title}
          </Text>

          {/* Premium badge */}
          {conversation.badgeColor && (
            <Icon
              name="star"
              size={16}
              color={theme.accent.warning}
              style={styles.badgeIcon}
            />
          )}
        </View>

        <Text
          style={[
            styles.lastMessage,
            { color: theme.text.secondary },
            hasUnread && { color: theme.text.primary, fontWeight: '600' },
          ]}
          numberOfLines={1}
        >
          {conversation.lastMessageText || t('chatList.noMessages')}
        </Text>
      </View>

      {/* Meta (Timestamp + Badge) */}
      <View style={styles.meta}>
        <Text
          style={[
            styles.timestamp,
            { color: theme.text.tertiary },
            hasUnread && { color: theme.primary.main, fontWeight: '600' },
          ]}
        >
          {conversation.lastMessageTime}
        </Text>

        {hasUnread && (
          <View
            style={[styles.unreadBadge, { backgroundColor: theme.primary.main }]}
          >
            <Text style={[styles.unreadBadgeText, { color: theme.text.inverse }]}>
              {formatUnreadCount(conversation.unreadCount)}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
});

ConversationRow.displayName = 'ConversationRow';

/**
 * Section Header Component
 */
const SectionHeader = React.memo<{ title: string }>(({ title }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.sectionHeader, { backgroundColor: theme.background.primary }]}>
      <Text style={[styles.sectionTitle, { color: theme.text.tertiary }]}>{title}</Text>
    </View>
  );
});

SectionHeader.displayName = 'SectionHeader';

/**
 * Item Separator Component
 */
const ItemSeparator = React.memo(() => <View style={styles.separator} />);

ItemSeparator.displayName = 'ItemSeparator';

/**
 * Empty State Component
 */
const EmptyState = React.memo<{
  type: keyof typeof EMPTY_STATES;
  onRetry?: () => void;
}>(({ type, onRetry }) => {
  const { theme } = useTheme();
  const { t } = useLocalization();
  const emptyState = EMPTY_STATES[type];

  // Get translated content based on type
  const getEmptyStateContent = () => {
    switch (type) {
      case 'NO_CHATS':
        return {
          title: t('chatList.noConversations'),
          message: t('chatList.noConversationsMessage'),
        };
      case 'NO_RESULTS':
        return {
          title: t('chatList.noResults'),
          message: t('chatList.noResultsMessage'),
        };
      case 'ERROR':
        return {
          title: t('chatList.errorTitle'),
          message: t('chatList.errorMessage'),
        };
      default:
        return {
          title: emptyState.title,
          message: emptyState.message,
        };
    }
  };

  const content = getEmptyStateContent();

  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Icon name={emptyState.icon} size={40} color={theme.text.tertiary} />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.text.primary }]}>{content.title}</Text>
      <Text style={[styles.emptyMessage, { color: theme.text.secondary }]}>{content.message}</Text>

      {onRetry && (
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.primary.main }]}
          onPress={onRetry}
          activeOpacity={0.8}
        >
          <Text style={[styles.retryButtonText, { color: theme.text.inverse }]}>{t('chatList.tryAgain')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

EmptyState.displayName = 'EmptyState';

/**
 * Footer Loading Component
 */
const FooterLoading = React.memo(() => {
  const { theme } = useTheme();

  return (
    <View style={styles.footerLoading}>
      <ActivityIndicator size="small" color={theme.primary.main} />
    </View>
  );
});

FooterLoading.displayName = 'FooterLoading';

/**
 * Chat List Screen Component
 */
export const ChatListScreen: React.FC<ChatListScreenProps> = React.memo(
  ({ onNavigateToChat, onNavigateToNewChat }) => {
    const { theme } = useTheme();
    const { t, isRTL } = useLocalization();

    const [isNewChatModalVisible, setIsNewChatModalVisible] = useState(false);

    const {
      conversations,
      pinnedConversations,
      recentConversations,
      isLoading,
      isRefreshing,
      error,
      hasMore,
      activeFilter,
      searchQuery,
      handleRefresh,
      handleLoadMore,
      handleSearch,
      handleFilterChange,
      handleRetry,
      handleArchive,
      handleDelete,
      handleBlock,
    } = useChatList();

    const { handlePress } = useConversationPress(onNavigateToChat);

    // Animation values
    const headerOpacity = useRef(new Animated.Value(0)).current;
    const headerTranslateY = useRef(new Animated.Value(-20)).current;
    const searchOpacity = useRef(new Animated.Value(0)).current;
    const searchScale = useRef(new Animated.Value(0.95)).current;
    const filterOpacity = useRef(new Animated.Value(0)).current;
    const filterTranslateX = useRef(new Animated.Value(-20)).current;
    const listOpacity = useRef(new Animated.Value(0)).current;
    const fabScale = useRef(new Animated.Value(0)).current;

    // Entrance animations
    useEffect(() => {
      Animated.parallel([
        // Header animation
        Animated.timing(headerOpacity, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(headerTranslateY, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        // Search bar animation
        Animated.timing(searchOpacity, {
          toValue: 1,
          duration: 600,
          delay: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(searchScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          delay: 200,
          useNativeDriver: true,
        }),
        // Filter chips animation
        Animated.timing(filterOpacity, {
          toValue: 1,
          duration: 600,
          delay: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(filterTranslateX, {
          toValue: 0,
          duration: 600,
          delay: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        // List animation
        Animated.timing(listOpacity, {
          toValue: 1,
          duration: 600,
          delay: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        // FAB animation
        Animated.spring(fabScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          delay: 800,
          useNativeDriver: true,
        }),
      ]).start();
    }, []);

    // Dynamic container style
    const containerStyle = useMemo(() => ({
      flex: 1,
      backgroundColor: theme.background.primary,
    }), [theme.background.primary]);

    /**
     * Handle long press on conversation
     */
    const handleLongPress = useCallback((conversation: UIConversation) => {
      Alert.alert(
        conversation.title,
        t('chatList.manageChat'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('chatList.archive'),
            onPress: () => handleArchive(conversation.id)
          },
          {
            text: t('chatList.delete'),
            style: 'destructive',
            onPress: () => handleDelete(conversation.id)
          },
          {
            text: t('chatList.block'),
            style: 'destructive',
            onPress: () => handleBlock(conversation.id)
          },
        ]
      );
    }, [t, handleArchive, handleDelete, handleBlock]);

    /**
     * Render conversation row
     */
    const renderConversation = useCallback(
      ({ item }: ListRenderItemInfo<UIConversation>) => (
        <ConversationRow
          conversation={item}
          onPress={handlePress}
          onLongPress={handleLongPress}
        />
      ),
      [handlePress, handleLongPress]
    );

    /**
     * Render section headers
     */
    const renderSectionHeader = useCallback(
      (title: string) => <SectionHeader title={title} />,
      []
    );

    /**
     * Build list data with section headers
     */
    const listData = useMemo(() => {
      const data: Array<UIConversation | { type: 'header'; title: string }> = [];

      // Add pinned section
      if (pinnedConversations.length > 0) {
        data.push({ type: 'header', title: t('chatList.pinned') });
        data.push(...pinnedConversations);
      }

      // Add recent section
      if (recentConversations.length > 0) {
        data.push({ type: 'header', title: t('chatList.recent') });
        data.push(...recentConversations);
      }

      return data;
    }, [pinnedConversations, recentConversations, t]);

    /**
     * Render item (conversation or header)
     */
    const renderItem = useCallback(
      ({ item }: ListRenderItemInfo<any>) => {
        if ('type' in item && item.type === 'header') {
          return renderSectionHeader(item.title);
        }
        return renderConversation({ item, index: 0, separators: {} as any });
      },
      [renderConversation, renderSectionHeader]
    );

    /**
     * Handle end reached (pagination)
     */
    const handleEndReached = useCallback(() => {
      if (hasMore && !isLoading) {
        handleLoadMore();
      }
    }, [hasMore, isLoading, handleLoadMore]);

    /**
     * Render list footer
     */
    const renderListFooter = useCallback(() => {
      if (isLoading && conversations.length > 0) {
        return <FooterLoading />;
      }
      return null;
    }, [isLoading, conversations.length]);

    /**
     * Skeleton loading rows
     */
    const renderSkeletonRow = useCallback(() => (
      <View style={[styles.conversationRow, { backgroundColor: theme.ui.card, opacity: 0.6 }]}>
        <View style={[styles.avatarPlaceholder, { backgroundColor: theme.background.secondary }]} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={{ width: '60%', height: 14, backgroundColor: theme.background.secondary, borderRadius: 4, marginBottom: 8 }} />
          <View style={{ width: '80%', height: 12, backgroundColor: theme.background.secondary, borderRadius: 4 }} />
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <View style={{ width: 40, height: 12, backgroundColor: theme.background.secondary, borderRadius: 4, marginBottom: 4 }} />
          <ActivityIndicator size="small" color={theme.primary.main} />
        </View>
      </View>
    ), [theme]);

    /**
     * Render content area - either loading skeletons, error, empty, or actual conversations
     */
    const renderContent = useCallback(() => {
      // Show error state
      if (error && conversations.length === 0) {
        return (
          <Animated.View style={[{ flex: 1 }, { opacity: listOpacity }]}>
            <EmptyState type="ERROR" onRetry={handleRetry} />
          </Animated.View>
        );
      }

      // Show loading skeletons on initial load
      if (isLoading && conversations.length === 0) {
        return (
          <Animated.View style={[{ flex: 1, paddingTop: 8 }, { opacity: listOpacity }]}>
            {[1, 2, 3, 4, 5].map((i) => (
              <View key={i}>{renderSkeletonRow()}</View>
            ))}
          </Animated.View>
        );
      }

      // Show empty state
      if (conversations.length === 0) {
        return (
          <Animated.View style={[{ flex: 1 }, { opacity: listOpacity }]}>
            <EmptyState
              type={searchQuery ? 'NO_RESULTS' : 'NO_CHATS'}
              onRetry={error ? handleRetry : undefined}
            />
          </Animated.View>
        );
      }

      // Show actual conversation list
      return (
        <Animated.View style={[{ flex: 1 }, { opacity: listOpacity }]}>
          <FlatList
            data={listData}
            renderItem={renderItem}
            keyExtractor={(item: any) =>
              'type' in item ? `header-${item.title}` : item.id
            }
            ItemSeparatorComponent={ItemSeparator}
            ListFooterComponent={renderListFooter}
            refreshControl={
              <RefreshControl
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                tintColor={theme.primary.main}
                colors={[theme.primary.main]}
              />
            }
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={LIST_CONFIG.REMOVE_CLIPPED_SUBVIEWS}
            maxToRenderPerBatch={LIST_CONFIG.MAX_TO_RENDER_PER_BATCH}
            windowSize={LIST_CONFIG.WINDOW_SIZE}
            initialNumToRender={LIST_CONFIG.INITIAL_NUM_TO_RENDER}
            updateCellsBatchingPeriod={LIST_CONFIG.UPDATE_CELLS_BATCH_PERIOD}
          />
        </Animated.View>
      );
    }, [error, conversations.length, isLoading, searchQuery, handleRetry, listOpacity, renderSkeletonRow, listData, renderItem, renderListFooter, isRefreshing, handleRefresh, theme.primary.main, handleEndReached]);

    return (
      <LinearGradient
        colors={[theme.background.primary, '#1a1f3a', '#0f1729']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <SafeAreaView style={containerStyle} edges={['top']}>
          <View style={styles.container}>
            {/* Header */}
            <Animated.View
              style={[
                styles.header,
                { backgroundColor: 'transparent' },
                {
                  opacity: headerOpacity,
                  transform: [{ translateY: headerTranslateY }],
                },
              ]}
            >
              {/* Title and Notification */}
              <View style={[styles.headerRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text style={[styles.title, { color: theme.text.primary }]}>{t('chatList.title')}</Text>

                <View style={[styles.headerActions, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <TouchableOpacity
                    style={styles.notificationButton}
                    activeOpacity={0.7}
                  >
                    <Icon name="notifications-outline" size={24} color={theme.text.primary} />
                    <View style={[styles.notificationBadge, { backgroundColor: theme.accent.error }]} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Search Bar */}
              <Animated.View
                style={[
                  styles.searchContainer,
                  { backgroundColor: theme.ui.card },
                  {
                    opacity: searchOpacity,
                    transform: [{ scale: searchScale }],
                  },
                ]}
              >
                <Icon
                  name="search-outline"
                  size={20}
                  color={theme.text.tertiary}
                  style={styles.searchIcon}
                />
                <TextInput
                  style={[styles.searchInput, { color: theme.text.primary, textAlign: isRTL ? 'right' : 'left' }]}
                  placeholder={t('chatList.searchPlaceholder')}
                  placeholderTextColor={theme.text.tertiary}
                  value={searchQuery}
                  onChangeText={handleSearch}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity style={[styles.filterButton, { backgroundColor: theme.background.primary }]} activeOpacity={0.7}>
                  <Icon name="options-outline" size={20} color={theme.text.secondary} />
                </TouchableOpacity>
              </Animated.View>

              {/* Filter Chips */}
              <Animated.View
                style={[
                  styles.filterContainer,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                  {
                    opacity: filterOpacity,
                    transform: [{ translateX: filterTranslateX }],
                  },
                ]}
              >
                {CHAT_FILTERS.map(filter => {
                  const isActive = activeFilter === filter.id;

                  // Get translated label
                  const getFilterLabel = (filterId: ChatFilter) => {
                    switch (filterId) {
                      case ChatFilter.ALL: return t('chatList.filterAll');
                      case ChatFilter.UNREAD: return t('chatList.filterUnread');
                      case ChatFilter.PREMIUM: return t('chatList.filterPremium');
                      case ChatFilter.GROUPS: return t('chatList.filterGroups');
                      default: return filter.label;
                    }
                  };

                  return (
                    <TouchableOpacity
                      key={filter.id}
                      style={[
                        styles.filterChip,
                        isActive && [styles.filterChipActive, { backgroundColor: theme.primary.main }],
                        !isActive && { backgroundColor: theme.ui.card },
                      ]}
                      onPress={() => handleFilterChange(filter.id)}
                      activeOpacity={0.7}
                    >
                      {filter.icon && (
                        <Icon
                          name={filter.icon}
                          size={14}
                          color={isActive ? theme.text.inverse : theme.accent.warning}
                          style={styles.filterChipIcon}
                        />
                      )}
                      <Text
                        style={[
                          styles.filterChipText,
                          isActive && [styles.filterChipTextActive, { color: theme.text.inverse }],
                          !isActive && { color: theme.text.secondary },
                        ]}
                      >
                        {getFilterLabel(filter.id)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </Animated.View>
            </Animated.View>

            {/* Conversation List */}
            {renderContent()}

            {/* New Chat Modal */}
            <NewChatModal
              isVisible={isNewChatModalVisible}
              onClose={() => setIsNewChatModalVisible(false)}
              onChatCreated={(chatId) => {
                setIsNewChatModalVisible(false);
                onNavigateToChat(chatId);
                handleRefresh(); // Refresh list to show new chat
              }}
            />

            {/* Floating Action Button */}
            <Animated.View
              style={{
                position: 'absolute',
                bottom: 0, // Positioned via styles.fab, but container needs absolute
                right: 0,
                transform: [{ scale: fabScale }],
                opacity: fabScale, // Fade in with scale
              }}
            >
              <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.primary.main }]}
                onPress={() => setIsNewChatModalVisible(true)}
                activeOpacity={0.8}
              >
                <Icon name="create-outline" size={28} color="#FFFFFF" />
              </TouchableOpacity>
            </Animated.View>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }
);

ChatListScreen.displayName = 'ChatListScreen';
