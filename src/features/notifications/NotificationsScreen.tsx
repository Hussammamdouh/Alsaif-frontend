/**
 * NotificationsScreen
 * Displays user notifications with read/unread states, actions, and preferences
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  Image,
  Linking,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../app/navigation/types';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNotifications } from './notifications.hooks';
import { useTheme } from '../../app/providers/ThemeProvider';
import { useLocalization } from '../../app/providers/LocalizationProvider';
import {
  getNotificationIcon,
  getNotificationColor,
  getNotificationTitle,
  isNotificationUnread,
  formatNotificationTime,
  hasNotificationAction,
  getNotificationActionUrl,
  groupNotificationsByDate,
  filterNotificationsByCategory,
  sortNotifications,
} from './notifications.mapper';
import { Notification } from './notifications.types';
import { createStyles } from './notifications.styles';
import { NOTIFICATION_CATEGORIES } from './notifications.constants';

const NotificationsScreen: React.FC = () => {
  const {
    notifications,
    unreadCount,
    isFetching,
    isUpdating,
    error,
    hasMore,
    refreshNotifications,
    loadMoreNotifications,
    markAsRead,
    markAllAsRead,
    trackClick,
    dismiss,
  } = useNotifications();

  const { theme, isDark } = useTheme();
  const { t, language } = useLocalization();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const route = useRoute<RouteProp<MainStackParamList, 'Notifications'>>();
  const initialCategory = route.params?.category || 'all';

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);

  // Update selected category if route params change
  React.useEffect(() => {
    if (route.params?.category) {
      setSelectedCategory(route.params.category);
    }
  }, [route.params?.category]);

  /**
   * Handle notification press
   */
  const handleNotificationPress = useCallback(
    async (notification: Notification) => {
      // Mark as read if unread
      if (isNotificationUnread(notification)) {
        await markAsRead(notification.id);
      }

      // Track click
      await trackClick(notification.id);

      // Handle action if available
      if (hasNotificationAction(notification)) {
        const actionUrl = getNotificationActionUrl(notification);
        if (actionUrl) {
          try {
            if (actionUrl.startsWith('http')) {
              await Linking.openURL(actionUrl);
            } else {
              navigation.navigate(actionUrl as any);
            }
          } catch (error) {
            console.error('Navigation failed:', error);
            Alert.alert(t('common.error'), t('error.navigationFailed') || 'Could not open the requested page');
          }
        }
      }
    },
    [markAsRead, trackClick, navigation, t]
  );

  /**
   * Handle dismiss notification
   */
  const handleDismiss = useCallback(
    (notificationId: string) => {
      Alert.alert(
        t('notifications.dismiss'),
        t('notifications.dismissConfirm') || 'Are you sure you want to dismiss this notification?',
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('notifications.dismiss'),
            style: 'destructive',
            onPress: () => dismiss(notificationId),
          },
        ]
      );
    },
    [dismiss, t]
  );

  /**
   * Handle mark all as read
   */
  const handleMarkAllAsRead = useCallback(() => {
    if (unreadCount === 0) {
      Alert.alert(t('notifications.noUnread'), t('notifications.allReadMessage') || 'All notifications are already read.');
      return;
    }

    Alert.alert(
      t('notifications.markAllRead'),
      t('notifications.markAllReadConfirm', { count: unreadCount }) || `Mark all ${unreadCount} notifications as read?`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('notifications.markAllRead'), onPress: markAllAsRead },
      ]
    );
  }, [unreadCount, markAllAsRead, t]);

  /**
   * Filter notifications by selected category
   */
  const filteredNotifications = useMemo(() => {
    const safeNotifications = Array.isArray(notifications) ? notifications : [];
    const filtered = filterNotificationsByCategory(safeNotifications, selectedCategory);
    return sortNotifications(filtered);
  }, [notifications, selectedCategory]);

  /**
   * Group notifications by date
   */
  const groupedNotifications = useMemo(() => {
    return groupNotificationsByDate(filteredNotifications);
  }, [filteredNotifications]);

  /**
   * Render notification item
   */
  const renderNotificationItem = useCallback(
    (notification: Notification) => {
      const unread = isNotificationUnread(notification);
      const icon = getNotificationIcon(notification.type);
      const color = getNotificationColor(notification.type);
      const title = getNotificationTitle(notification.type, notification);
      const time = formatNotificationTime(notification.createdAt, t, language);

      return (
        <TouchableOpacity
          key={notification.id}
          style={[styles.notificationItem, unread && styles.notificationItemUnread]}
          onPress={() => handleNotificationPress(notification)}
          activeOpacity={0.7}
        >
          <View style={styles.notificationContent}>
            {/* Icon */}
            <View style={[styles.notificationIcon, { backgroundColor: color }]}>
              <Icon name={icon} size={24} color="#fff" />

              {/* Priority Badge */}
              {(notification.priority === 'high' || notification.priority === 'urgent') && (
                <View
                  style={[
                    styles.priorityBadge,
                    notification.priority === 'urgent' && styles.priorityBadgeUrgent,
                  ]}
                >
                  <Text style={styles.priorityBadgeText}>
                    {notification.priority[0].toUpperCase()}
                  </Text>
                </View>
              )}
            </View>

            {/* Text Content */}
            <View style={styles.notificationTextContainer}>
              <View style={styles.notificationHeader}>
                <Text
                  style={[
                    styles.notificationTitle,
                    unread && styles.notificationTitleUnread,
                  ]}
                  numberOfLines={1}
                >
                  {t(title)}
                </Text>
                <Text style={styles.notificationTime}>{time}</Text>
              </View>

              <Text
                style={[
                  styles.notificationBody,
                  unread && styles.notificationBodyUnread,
                ]}
                numberOfLines={2}
              >
                {t(notification.body)}
              </Text>

              {/* Rich Content - Image */}
              {notification.richContent?.imageUrl && (
                <Image
                  source={{ uri: notification.richContent.imageUrl }}
                  style={styles.notificationImage}
                  resizeMode="cover"
                />
              )}

              {/* Rich Content - CTA Buttons */}
              {notification.richContent?.ctaButtons &&
                notification.richContent.ctaButtons.length > 0 && (
                  <View style={styles.ctaButtonsContainer}>
                    {notification.richContent.ctaButtons.map((button: any, index: number) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.ctaButton,
                          button.style === 'primary' && styles.ctaButtonPrimary,
                          button.style === 'danger' && styles.ctaButtonDanger,
                        ]}
                        onPress={async () => {
                          try {
                            if (button.url.startsWith('http')) {
                              await Linking.openURL(button.url);
                            } else {
                              navigation.navigate(button.url as any);
                            }
                            await trackClick(notification.id);
                          } catch (error) {
                            console.error('CTA Navigation failed:', error);
                          }
                        }}
                      >
                        <Text
                          style={[
                            styles.ctaButtonText,
                            button.style === 'primary' && styles.ctaButtonTextPrimary,
                            button.style === 'danger' && styles.ctaButtonTextDanger,
                          ]}
                        >
                          {button.text}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
            </View>

            {/* Unread Indicator */}
            {unread && <View style={styles.unreadIndicator} />}
          </View>

          {/* Dismiss Button */}
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={() => handleDismiss(notification.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon name="close" size={16} color={theme.text.disabled} />
          </TouchableOpacity>
        </TouchableOpacity>
      );
    },
    [handleNotificationPress, handleDismiss, styles, theme, navigation]
  );

  /**
   * Render category filter
   */
  const renderCategoryFilter = () => {
    const categories = [
      { key: 'all', label: t('notifications.category.all') },
      { key: NOTIFICATION_CATEGORIES.SUBSCRIPTION, label: t('notifications.category.subscription') },
      { key: NOTIFICATION_CATEGORIES.CONTENT, label: t('notifications.category.content') },
      { key: NOTIFICATION_CATEGORIES.ENGAGEMENT, label: t('notifications.category.engagement') },
      { key: NOTIFICATION_CATEGORIES.PREMIUM, label: t('notifications.category.premium') },
      { key: NOTIFICATION_CATEGORIES.SYSTEM, label: t('notifications.category.system') },
    ];

    return (
      <View style={styles.categoryFilterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryFilterContent}
        >
          {categories.map(category => (
            <TouchableOpacity
              key={category.key}
              style={[
                styles.categoryFilterButton,
                selectedCategory === category.key && styles.categoryFilterButtonActive,
              ]}
              onPress={() => setSelectedCategory(category.key)}
            >
              <Text
                style={[
                  styles.categoryFilterText,
                  selectedCategory === category.key && styles.categoryFilterTextActive,
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  /**
   * Render section header
   */
  const renderSectionHeader = (titleKey: string) => {
    let title = titleKey;
    if (titleKey === 'Today') title = t('notifications.group.today');
    else if (titleKey === 'Yesterday') title = t('notifications.group.yesterday');
    else if (titleKey === 'This Week') title = t('notifications.group.thisWeek');
    else if (titleKey === 'Older') title = t('notifications.group.older');

    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>{title}</Text>
      </View>
    );
  };

  /**
   * Render empty state
   */
  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <View style={styles.emptyIconContainer}>
        <Icon name="notifications-outline" size={50} color={theme.text.disabled} />
      </View>
      <Text style={styles.emptyStateTitle}>{t('notifications.emptyTitle')}</Text>
      <Text style={styles.emptyStateText}>{t('notifications.emptySubtitle')}</Text>
    </View>
  );

  /**
   * Render error state
   */
  const renderErrorState = () => (
    <View style={styles.errorStateContainer}>
      <Icon name="alert-circle-outline" size={70} color={theme.accent.error} />
      <Text style={styles.errorStateTitle}>{t('notifications.errorTitle')}</Text>
      <Text style={styles.errorStateText}>{error || t('notifications.errorSubtitle')}</Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={refreshNotifications}
      >
        <Text style={styles.retryButtonText}>{t('notifications.retry')}</Text>
      </TouchableOpacity>
    </View>
  );

  /**
   * Render loading footer
   */
  const renderLoadingFooter = () => {
    if (!isFetching || notifications.length === 0) return null;

    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={theme.primary.main} />
      </View>
    );
  };

  /**
   * Handle load more
   */
  const handleEndReached = useCallback(() => {
    if (hasMore && !isFetching) {
      loadMoreNotifications();
    }
  }, [hasMore, isFetching, loadMoreNotifications]);

  const listData = useMemo(() => {
    const data: any[] = [];
    if (groupedNotifications.today.length > 0) {
      data.push({ type: 'header', title: 'Today' });
      data.push(...groupedNotifications.today);
    }
    if (groupedNotifications.yesterday.length > 0) {
      data.push({ type: 'header', title: 'Yesterday' });
      data.push(...groupedNotifications.yesterday);
    }
    if (groupedNotifications.thisWeek.length > 0) {
      data.push({ type: 'header', title: 'This Week' });
      data.push(...groupedNotifications.thisWeek);
    }
    if (groupedNotifications.older.length > 0) {
      data.push({ type: 'header', title: 'Older' });
      data.push(...groupedNotifications.older);
    }
    return data;
  }, [groupedNotifications]);

  return (
    <SafeAreaView
      style={styles.container}
      edges={['top']}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginRight: 12 }}
          >
            <Icon name="arrow-back" size={24} color={theme.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('notifications.title')}</Text>
          {unreadCount > 0 ? (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          ) : null}
        </View>

        {notifications.length > 0 && (
          <TouchableOpacity
            style={styles.markAllReadButton}
            onPress={handleMarkAllAsRead}
            disabled={isUpdating || unreadCount === 0}
          >
            <Text
              style={[
                styles.markAllReadButtonText,
                (isUpdating || unreadCount === 0) && styles.markAllReadButtonTextDisabled,
              ]}
            >
              {t('notifications.markAllRead')}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter */}
      {notifications.length > 0 && renderCategoryFilter()}

      {/* Content */}
      {error ? (
        renderErrorState()
      ) : notifications.length === 0 && !isFetching ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={listData}
          renderItem={({ item }: any) => {
            if (item.type === 'header') {
              return renderSectionHeader(item.title);
            }
            return renderNotificationItem(item);
          }}
          keyExtractor={(item: any, index) =>
            item.type === 'header' ? `header-${item.title}` : item.id || `item-${index}`
          }
          refreshControl={
            <RefreshControl
              refreshing={isFetching && notifications.length === 0}
              onRefresh={refreshNotifications}
              tintColor={theme.primary.main}
            />
          }
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderLoadingFooter}
          contentContainerStyle={
            notifications.length === 0 ? { flex: 1, justifyContent: 'center' } : undefined
          }
        />
      )}
    </SafeAreaView>
  );
};

export default NotificationsScreen;
