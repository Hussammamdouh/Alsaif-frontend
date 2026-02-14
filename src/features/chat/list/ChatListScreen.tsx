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
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../../app/navigation/types';

import { useTheme, useLocalization } from '../../../app/providers';
import { ResponsiveContainer, AuthRequiredGate } from '../../../shared/components';
import { useUser } from '../../../app/auth/auth.hooks';
import { getStyles } from './chatList.styles';
import { useChatList, useConversationPress } from './chatList.hooks';
import { UIConversation, ChatFilter } from './chatList.types';
import { CHAT_FILTERS, EMPTY_STATES, LIST_CONFIG } from './chatList.constants';
import { formatUnreadCount } from './chatList.mapper';
import { NewChatModal } from './NewChatModal';
import { CreateGroupChatModal } from './CreateGroupChatModal';
import { ConversationView } from '../conversation-v2/ConversationView';

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
  isSelected?: boolean;
}>(({ conversation, onPress, onLongPress, isSelected }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  const { t, isRTL } = useLocalization();

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
        { backgroundColor: isSelected ? theme.primary.main + '10' : theme.ui.card },
        pressed && { backgroundColor: theme.background.secondary },
        isSelected && (isRTL ? { borderRightWidth: 4, borderRightColor: theme.primary.main } : { borderLeftWidth: 4, borderLeftColor: theme.primary.main }),
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
          <View style={[styles.onlineIndicator, { backgroundColor: theme.accent.success, borderColor: theme.ui.card }]} />
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.contentHeader}>
          <Text
            style={[
              styles.conversationTitle,
              { color: theme.text.primary },
              (hasUnread || isSelected) && { fontWeight: '700' },
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
  const styles = getStyles(theme);

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
const ItemSeparator = React.memo(() => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
  return <View style={[styles.separator, { backgroundColor: theme.ui.divider }]} />;
});

ItemSeparator.displayName = 'ItemSeparator';

/**
 * Empty State Component
 */
const EmptyState = React.memo<{
  type: keyof typeof EMPTY_STATES;
  onRetry?: () => void;
}>(({ type, onRetry }) => {
  const { theme } = useTheme();
  const styles = getStyles(theme);
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
      <View style={[styles.emptyIconContainer, { backgroundColor: theme.background.secondary }]}>
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
  const styles = getStyles(theme);

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
    const { theme, isDark } = useTheme();
    const { t, isRTL } = useLocalization();
    const user = useUser();
    const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
    const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
    const { width } = useWindowDimensions();
    const isDesktop = width >= 1024;

    const [isNewChatModalVisible, setIsNewChatModalVisible] = useState(false);
    const [isCreateGroupModalVisible, setIsCreateGroupModalVisible] = useState(false);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const styles = useMemo(() => getStyles(theme), [theme]);

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

    // Desktop: Select first conversation automatically if none selected
    useEffect(() => {
      if (isDesktop && !selectedConversationId && conversations.length > 0) {
        setSelectedConversationId(conversations[0].id);
      }
    }, [isDesktop, conversations, selectedConversationId]);

    /**
     * Handle conversation press
     */
    const handlePress = useCallback((conversation: UIConversation) => {
      if (isDesktop) {
        setSelectedConversationId(conversation.id);
      } else {
        onNavigateToChat(conversation.id);
      }
    }, [isDesktop, onNavigateToChat]);

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
        Animated.timing(listOpacity, {
          toValue: 1,
          duration: 600,
          delay: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(fabScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          delay: 800,
          useNativeDriver: true,
        }),
      ]).start();
    }, []);

    const handleLongPress = useCallback((conversation: UIConversation) => {
      Alert.alert(
        conversation.title,
        t('chatList.manageChat'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('chatList.archive'), onPress: () => handleArchive(conversation.id) },
          { text: t('chatList.delete'), style: 'destructive', onPress: () => handleDelete(conversation.id) },
          { text: t('chatList.block'), style: 'destructive', onPress: () => handleBlock(conversation.id) },
        ]
      );
    }, [t, handleArchive, handleDelete, handleBlock]);

    const renderConversation = useCallback(
      ({ item }: ListRenderItemInfo<UIConversation>) => (
        <ConversationRow
          conversation={item}
          onPress={handlePress}
          onLongPress={handleLongPress}
          isSelected={isDesktop && selectedConversationId === item.id}
        />
      ),
      [handlePress, handleLongPress, isDesktop, selectedConversationId]
    );

    const renderSectionHeader = useCallback(
      (title: string) => <SectionHeader title={title} />,
      []
    );

    const listData = useMemo(() => {
      const data: Array<UIConversation | { type: 'header'; title: string }> = [];
      if (pinnedConversations.length > 0) {
        data.push({ type: 'header', title: t('chatList.pinned') });
        data.push(...pinnedConversations);
      }
      if (recentConversations.length > 0) {
        data.push({ type: 'header', title: t('chatList.recent') });
        data.push(...recentConversations);
      }
      return data;
    }, [pinnedConversations, recentConversations, t]);

    const renderItem = useCallback(
      ({ item }: ListRenderItemInfo<any>) => {
        if ('type' in item && item.type === 'header') {
          return renderSectionHeader(item.title);
        }
        return renderConversation({ item, index: 0, separators: {} as any });
      },
      [renderConversation, renderSectionHeader]
    );

    const handleEndReached = useCallback(() => {
      if (hasMore && !isLoading) {
        handleLoadMore();
      }
    }, [hasMore, isLoading, handleLoadMore]);

    const renderListFooter = useCallback(() => {
      if (isLoading && conversations.length > 0) {
        return <FooterLoading />;
      }
      return null;
    }, [isLoading, conversations.length]);

    const renderSkeletonRow = useCallback(() => (
      <View style={[styles.conversationRow, { backgroundColor: theme.ui.card, opacity: 0.6 }]}>
        <View style={[styles.avatarPlaceholder, { backgroundColor: theme.background.secondary }]} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={{ width: '60%', height: 14, backgroundColor: theme.background.secondary, borderRadius: 4, marginBottom: 8 }} />
          <View style={{ width: '80%', height: 12, backgroundColor: theme.background.secondary, borderRadius: 4 }} />
        </View>
      </View>
    ), [theme]);

    const renderChatListContent = () => {
      if (error && conversations.length === 0) {
        return <EmptyState type="ERROR" onRetry={handleRetry} />;
      }

      if (isLoading && conversations.length === 0) {
        return (
          <View style={{ flex: 1, paddingTop: 8 }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <View key={i}>{renderSkeletonRow()}</View>
            ))}
          </View>
        );
      }

      if (conversations.length === 0) {
        return (
          <EmptyState
            type={searchQuery ? 'NO_RESULTS' : 'NO_CHATS'}
            onRetry={error ? handleRetry : undefined}
          />
        );
      }

      return (
        <FlatList
          data={listData}
          renderItem={renderItem}
          keyExtractor={(item: any) => 'type' in item ? `header-${item.title}` : item.id}
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
          contentContainerStyle={[styles.listContent, isDesktop && { paddingBottom: 20 }]}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={LIST_CONFIG.REMOVE_CLIPPED_SUBVIEWS}
          maxToRenderPerBatch={LIST_CONFIG.MAX_TO_RENDER_PER_BATCH}
          windowSize={LIST_CONFIG.WINDOW_SIZE}
          initialNumToRender={LIST_CONFIG.INITIAL_NUM_TO_RENDER}
        />
      );
    };

    const renderHeader = () => (
      <View style={[styles.header, isDesktop && styles.desktopHeader]}>
        <View style={[styles.headerRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Text style={[styles.title, { color: theme.text.primary }]}>{t('chatList.title')}</Text>
          <View style={styles.headerActions}>
            {isAdmin && (
              <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', gap: 8 }}>
                <TouchableOpacity
                  style={[styles.createButton, { backgroundColor: theme.primary.main, flexDirection: isRTL ? 'row-reverse' : 'row' }]}
                  activeOpacity={0.8}
                  onPress={() => setIsCreateGroupModalVisible(true)}
                >
                  <Icon name="people" size={18} color="#FFFFFF" />
                  <Text style={styles.createButtonText}>{t('chatList.group')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.createButton, { backgroundColor: theme.primary.main, flexDirection: isRTL ? 'row-reverse' : 'row' }]}
                  activeOpacity={0.8}
                  onPress={() => setIsNewChatModalVisible(true)}
                >
                  <Icon name="add" size={20} color="#FFFFFF" />
                  <Text style={styles.createButtonText}>{t('chatList.create')}</Text>
                </TouchableOpacity>
              </View>
            )}
            {!isDesktop && (
              <TouchableOpacity
                style={[styles.notificationButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }]}
                activeOpacity={0.7}
                onPress={() => (navigation as any).navigate('Notifications', { category: 'engagement' })}
              >
                <Icon name="notifications-outline" size={22} color={theme.text.primary} />
                <View style={[styles.notificationBadge, { backgroundColor: theme.accent.error }]} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={[styles.searchContainer, { backgroundColor: theme.ui.card, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Icon name="search-outline" size={20} color={theme.text.tertiary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: theme.text.primary, textAlign: isRTL ? 'right' : 'left' }]}
            placeholder={t('chatList.searchPlaceholder')}
            placeholderTextColor={theme.text.tertiary}
            value={searchQuery}
            onChangeText={handleSearch}
            autoCapitalize="none"
          />
        </View>

        <View style={[styles.filterContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          {CHAT_FILTERS.map(filter => {
            const isActive = activeFilter === filter.id;
            const getFilterLabel = (id: ChatFilter) => {
              switch (id) {
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
                style={[styles.filterChip, isActive ? { backgroundColor: theme.primary.main } : { backgroundColor: theme.ui.card }]}
                onPress={() => handleFilterChange(filter.id)}
              >
                {filter.icon && <Icon name={filter.icon} size={14} color={isActive ? theme.text.inverse : theme.accent.warning} style={styles.filterChipIcon} />}
                <Text style={[styles.filterChipText, isActive ? { color: theme.text.inverse } : { color: theme.text.secondary }]}>{getFilterLabel(filter.id)}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );

    const mainContent = (
      <View style={styles.container}>
        {renderHeader()}
        {renderChatListContent()}
        <NewChatModal
          isVisible={isNewChatModalVisible}
          onClose={() => setIsNewChatModalVisible(false)}
          onChatCreated={(chatId) => {
            setIsNewChatModalVisible(false);
            if (isDesktop) setSelectedConversationId(chatId);
            else onNavigateToChat(chatId);
            handleRefresh();
          }}
        />
        <CreateGroupChatModal
          isVisible={isCreateGroupModalVisible}
          onClose={() => setIsCreateGroupModalVisible(false)}
          onGroupCreated={(chatId) => {
            setIsCreateGroupModalVisible(false);
            if (isDesktop) setSelectedConversationId(chatId);
            else onNavigateToChat(chatId);
            handleRefresh();
          }}
        />
        <Animated.View style={[styles.fab, { backgroundColor: theme.primary.main, transform: [{ scale: fabScale }], opacity: fabScale }]}>
          <TouchableOpacity onPress={() => setIsNewChatModalVisible(true)} activeOpacity={0.8}>
            <Icon name="create-outline" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>
      </View>
    );

    if (isDesktop) {
      return (
        <View
          style={[styles.gradient, { backgroundColor: theme.background.primary }]}
        >
          <AuthRequiredGate
            title={t('chatList.loginRequired') || 'Chat Required Login'}
            message={t('chatList.loginMessage') || 'Please log in to chat with our experts and community.'}
            icon="chatbubbles-outline"
          >
            <View style={[styles.desktopCenterContainer, { flex: 1 }]}>
              <View style={[styles.splitViewCard, { flex: 1, backgroundColor: theme.background.secondary, borderColor: theme.border.main, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                {/* Sidebar */}
                <View style={[styles.sidebar, isRTL ? { borderLeftWidth: 1, borderLeftColor: theme.border.main, borderRightWidth: 0 } : { borderRightColor: theme.border.main }]}>
                  {renderHeader()}
                  {renderChatListContent()}
                </View>

                {/* Chat Detail Area */}
                <View style={styles.mainArea}>
                  {selectedConversationId ? (
                    <ConversationView
                      conversationId={selectedConversationId}
                      hideBackButton
                      isSplitView
                    />
                  ) : (
                    <View style={styles.noChatSelected}>
                      <Icon name="chatbubbles-outline" size={64} color={theme.text.tertiary} />
                      <Text style={[styles.noChatText, { color: theme.text.primary }]}>{t('chatList.noChatSelected')}</Text>
                      <Text style={[styles.noChatMessage, { color: theme.text.secondary }]}>{t('chatList.noChatSelectedMessage')}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
            <NewChatModal
              isVisible={isNewChatModalVisible}
              onClose={() => setIsNewChatModalVisible(false)}
              onChatCreated={(chatId) => {
                setIsNewChatModalVisible(false);
                setSelectedConversationId(chatId);
                handleRefresh();
              }}
            />
            <CreateGroupChatModal
              isVisible={isCreateGroupModalVisible}
              onClose={() => setIsCreateGroupModalVisible(false)}
              onGroupCreated={(chatId) => {
                setIsCreateGroupModalVisible(false);
                setSelectedConversationId(chatId);
                handleRefresh();
              }}
            />
          </AuthRequiredGate>
        </View>
      );
    }

    return (
      <View
        style={[styles.gradient, { backgroundColor: theme.background.primary }]}
      >
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          <AuthRequiredGate
            title={t('chatList.loginRequired') || 'Chat Required Login'}
            message={t('chatList.loginMessage') || 'Please log in to chat with our experts and community.'}
            icon="chatbubbles-outline"
          >
            {mainContent}
          </AuthRequiredGate>
        </SafeAreaView>
      </View>
    );
  }
);

ChatListScreen.displayName = 'ChatListScreen';
