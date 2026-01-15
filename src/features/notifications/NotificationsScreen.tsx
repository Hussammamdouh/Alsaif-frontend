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
} from 'react-native';
import { useRouter } from 'expo-router';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNotifications } from './notifications.hooks';
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
import { styles } from './notifications.styles';
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

  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');

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
              router.push(actionUrl as any);
            }
          } catch (error) {
            console.error('Navigation failed:', error);
            Alert.alert('Error', 'Could not open the requested page');
          }
        }
      }
    },
    [markAsRead, trackClick, router]
  );

  /**
   * Handle dismiss notification
   */
  const handleDismiss = useCallback(
    (notificationId: string) => {
      Alert.alert(
        'Dismiss Notification',
        'Are you sure you want to dismiss this notification?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Dismiss',
            style: 'destructive',
            onPress: () => dismiss(notificationId),
          },
        ]
      );
    },
    [dismiss]
  );

  /**
   * Handle mark all as read
   */
  const handleMarkAllAsRead = useCallback(() => {
    if (unreadCount === 0) {
      Alert.alert('No Unread Notifications', 'All notifications are already read.');
      return;
    }

    Alert.alert(
      'Mark All as Read',
      `Mark all ${unreadCount} notification${unreadCount > 1 ? 's' : ''} as read?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Mark All Read', onPress: markAllAsRead },
      ]
    );
  }, [unreadCount, markAllAsRead]);

  /**
   * Filter notifications by selected category
   */
  const filteredNotifications = useMemo(() => {
    const filtered = filterNotificationsByCategory(notifications, selectedCategory);
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
      const time = formatNotificationTime(notification.createdAt);

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
                  {title}
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
                {notification.body}
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
                    {notification.richContent.ctaButtons.map((button, index) => (
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
                              router.push(button.url as any);
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

              {/* Priority Badge */}
              {(notification.priority === 'high' || notification.priority === 'urgent') && (
                <View
                  style={[
                    styles.priorityBadge,
                    notification.priority === 'urgent' && styles.priorityBadgeUrgent,
                  ]}
                >
                  <Text style={styles.priorityBadgeText}>
                    {notification.priority.toUpperCase()}
                  </Text>
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
            <Icon name="close-circle" size={20} color="#8e8e93" />
          </TouchableOpacity>
        </TouchableOpacity>
      );
    },
    [handleNotificationPress, handleDismiss]
  );

  /**
   * Render category filter
   */
  const renderCategoryFilter = () => {
    const categories = [
      { key: 'all', label: 'All' },
      { key: NOTIFICATION_CATEGORIES.SUBSCRIPTION, label: 'Subscription' },
      { key: NOTIFICATION_CATEGORIES.CONTENT, label: 'Content' },
      { key: NOTIFICATION_CATEGORIES.ENGAGEMENT, label: 'Engagement' },
      { key: NOTIFICATION_CATEGORIES.PREMIUM, label: 'Premium' },
      { key: NOTIFICATION_CATEGORIES.SYSTEM, label: 'System' },
    ];

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryFilterContainer}
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
    );
  };

  /**
   * Render section header
   */
  const renderSectionHeader = (title: string) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );

  /**
   * Render empty state
   */
  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Icon name="notifications-off-outline" size={80} color="#c7c7cc" />
      <Text style={styles.emptyStateTitle}>No Notifications</Text>
      <Text style={styles.emptyStateText}>
        You're all caught up! We'll notify you when something new happens.
      </Text>
    </View>
  );

  /**
   * Render error state
   */
  const renderErrorState = () => (
    <View style={styles.errorStateContainer}>
      <Icon name="alert-circle-outline" size={80} color="#ff3b30" />
      <Text style={styles.errorStateTitle}>Error Loading Notifications</Text>
      <Text style={styles.errorStateText}>{error}</Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={refreshNotifications}
      >
        <Text style={styles.retryButtonText}>Retry</Text>
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
        <ActivityIndicator size="small" color="#007aff" />
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
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
              Mark All Read
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
          data={[
            ...(groupedNotifications.today.length > 0
              ? [{ type: 'header', title: 'Today' }, ...groupedNotifications.today]
              : []),
            ...(groupedNotifications.yesterday.length > 0
              ? [
                { type: 'header', title: 'Yesterday' },
                ...groupedNotifications.yesterday,
              ]
              : []),
            ...(groupedNotifications.thisWeek.length > 0
              ? [{ type: 'header', title: 'This Week' }, ...groupedNotifications.thisWeek]
              : []),
            ...(groupedNotifications.older.length > 0
              ? [{ type: 'header', title: 'Older' }, ...groupedNotifications.older]
              : []),
          ]}
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
              tintColor="#007aff"
            />
          }
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderLoadingFooter}
          contentContainerStyle={
            notifications.length === 0 ? styles.emptyContentContainer : undefined
          }
        />
      )}
    </View>
  );
};

export default NotificationsScreen;
