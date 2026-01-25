/**
 * InsightsListScreen
 * Main insights feed matching Free Advices.png design
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
  StyleSheet,
  TextInput,
  I18nManager,
  Platform,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../app/providers/ThemeProvider';
import { ResponsiveContainer } from '../../shared/components';
import { useInsights } from './insights.hooks';
import { useLocalization } from '../../app/providers/LocalizationProvider';
import { useSubscriptionAccess } from '../subscription';
import {
  ICONS,
  MESSAGES,
} from './insights.constants';
import {
  formatTimeAgo,
  formatCount,
  getCategoryInfo,
  generateExcerpt,
} from './insights.utils';
import type { InsightListItem } from './insights.types';

interface InsightsListScreenProps {
  hideHeader?: boolean;
  ListHeaderComponent?: React.ReactElement;
}

export const InsightsListScreen: React.FC<InsightsListScreenProps> = ({ hideHeader, ListHeaderComponent }) => {
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();
  const { t } = useLocalization();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const columnCount = width > 1600 ? 3 : 2;
  const styles = React.useMemo(() => getStyles(theme, isDesktop), [theme, isDesktop]);
  const { canAccessInsight } = useSubscriptionAccess();
  const [searchQuery, setSearchQuery] = useState('');

  const {
    insights,
    loading,
    refreshing,
    error,
    hasMore,
    refresh,
    loadMore,
    updateInsightInList,
  } = useInsights();

  // Handle debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      refresh({ search: searchQuery });
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleInsightPress = (insight: InsightListItem) => {
    const hasAccess = canAccessInsight(insight.type);

    if (!hasAccess) {
      (navigation as any).navigate('Paywall');
    } else {
      (navigation as any).navigate('InsightDetail', { insightId: insight._id, title: insight.title });
    }
  };

  const handleLike = async (insight: InsightListItem) => {
    // Optimistic update
    const newHasLiked = !insight.hasLiked;
    const newLikes = newHasLiked ? insight.likes + 1 : insight.likes - 1;

    updateInsightInList(insight._id, {
      hasLiked: newHasLiked,
      likes: newLikes,
    });

    // TODO: Call API to toggle like
    // This will be handled in the detail screen or via a dedicated hook
  };


  const renderInsightCard = ({ item }: { item: InsightListItem }) => {
    const hasAccess = canAccessInsight(item.type);

    return (
      <TouchableOpacity
        style={styles.insightCard}
        onPress={() => handleInsightPress(item)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={isDark
            ? ['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.02)']
            : ['rgba(0, 0, 0, 0.03)', 'rgba(0, 0, 0, 0.01)']
          }
          style={StyleSheet.absoluteFill}
        />

        {/* Header */}
        <View style={styles.insightCardHeader}>
          <View style={styles.insightCardLeft}>
            {/* Symbol/Stock Badge */}
            {item.tags[0] && (
              <View style={styles.symbolBadge}>
                <Text style={styles.symbolText}>{item.tags[0].toUpperCase()}</Text>
              </View>
            )}

            {/* Type Badge */}
            <View
              style={[
                styles.typeBadge,
                { backgroundColor: item.type === 'premium' ? '#FBBF24' : theme.primary.main },
              ]}
            >
              <Text style={styles.typeBadgeText}>{item.type.toUpperCase()}</Text>
            </View>

            {/* Timestamp */}
            <Text style={styles.timestamp}>{formatTimeAgo(item.publishedAt || item.createdAt, t)}</Text>
          </View>

          {/* More Button */}
          <TouchableOpacity style={styles.moreButton} onPress={() => {/* Show options menu */ }}>
            <Ionicons name={ICONS.more as any} size={20} color={isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.3)"} />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <Text style={styles.insightTitle} numberOfLines={3}>
          {item.title}
        </Text>

        {/* Summary */}
        {(item.excerpt || item.content) && (
          <Text style={styles.insightExcerpt} numberOfLines={2}>
            {generateExcerpt(item.excerpt || item.content, 120)}
          </Text>
        )}

        {/* Cover Image */}
        {
          item.coverImage && (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: item.coverImage }}
                style={styles.insightImage}
                resizeMode="cover"
              />
            </View>
          )
        }

        {/* Footer with Engagement */}
        <View style={styles.insightFooter}>
          <View style={styles.engagementRow}>
            {/* Like Button */}
            <TouchableOpacity
              style={styles.engagementButton}
              onPress={() => handleLike(item)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={(item.hasLiked ? ICONS.like : ICONS.likeOutline) as any}
                size={20}
                color={item.hasLiked ? '#ef4444' : isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
              />
              <Text style={styles.engagementCount}>{formatCount(item.likes)}</Text>
            </TouchableOpacity>

            {/* InsightComment Count */}
            <TouchableOpacity
              style={styles.engagementButton}
              onPress={() => handleInsightPress(item)}
              activeOpacity={0.7}
            >
              <Ionicons name={ICONS.commentOutline as any} size={20} color={isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)"} />
              <Text style={styles.engagementCount}>{formatCount(item.commentsCount)}</Text>
            </TouchableOpacity>
          </View>

          {/* Bookmark Button */}
          <View style={styles.footerRight}>
            <TouchableOpacity
              style={styles.bookmarkButton}
              onPress={() => {/* Toggle bookmark */ }}
              activeOpacity={0.7}
            >
              <Ionicons
                name={(item.hasBookmarked ? ICONS.bookmark : ICONS.bookmarkOutline) as any}
                size={20}
                color={item.hasBookmarked ? theme.primary.main : isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Locked Indicator for Premium without Access */}
        {
          item.type === 'premium' && !hasAccess && (
            <View style={styles.lockBadge}>
              <Ionicons name="lock-closed" size={14} color="#FFF" />
            </View>
          )
        }
      </TouchableOpacity >
    );
  };

  const renderEmpty = () => {
    if (loading && !refreshing) return null;

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="document-text-outline" size={64} color={isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)"} style={styles.emptyIcon} />
        <Text style={styles.emptyTitle}>{t('insights.noInsights')}</Text>
        <Text style={styles.emptyText}>
          {t('insights.noInsightsMessage')}
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loading || refreshing) return null;

    return (
      <View style={styles.loadMoreContainer}>
        <ActivityIndicator size="small" color={theme.primary.main} />
        <Text style={styles.loadingText}>{t('insights.loading')}</Text>
      </View>
    );
  };

  if (error && insights.length === 0) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('insights.freeInsights')}</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={22} color={isDark ? "#FFF" : "#000"} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Error State */}
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refresh()}>
            <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ResponsiveContainer>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
        <LinearGradient
          colors={isDark ? [theme.background.primary, '#1a2e1a', '#0a1a0a'] : ['#FFFFFF', '#FFFFFF', '#FFFFFF']}
          style={StyleSheet.absoluteFill}
        />

        {/* Header - only show if not hidden */}
        {!hideHeader && (
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{t('insights.freeInsights')}</Text>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="notifications-outline" size={22} color={isDark ? "#FFF" : "#000"} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBarWrapper}>
            <Ionicons name="search" size={18} color={isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.3)"} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('insights.searchPlaceholder') || 'Search insights...'}
              placeholderTextColor={isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.3)"}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              clearButtonMode="while-editing"
            />
          </View>
        </View>


        {/* Insights List */}
        <FlatList
          key={isDesktop ? `grid-${columnCount}` : 'list'}
          data={insights}
          renderItem={renderInsightCard}
          keyExtractor={(item) => item._id}
          numColumns={isDesktop ? columnCount : 1}
          columnWrapperStyle={isDesktop && columnCount > 1 ? { gap: 24, paddingHorizontal: 24 } : null}
          contentContainerStyle={[styles.listContent, isDesktop && { paddingHorizontal: 24 }]}
          ListHeaderComponent={ListHeaderComponent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => refresh()}
              tintColor={theme.primary.main}
              colors={[theme.primary.main]}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
        />
      </ResponsiveContainer>
    </View>
  );
};

const getStyles = (theme: any, isDesktop: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    zIndex: 10,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: theme.text.primary,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: theme.text.primary,
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    borderWidth: 1,
    borderColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 40,
  },
  insightCard: {
    flex: 1,
    marginHorizontal: isDesktop ? 12 : 20,
    borderRadius: 24,
    padding: 16,
    marginBottom: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    backgroundColor: 'transparent',
  },
  insightCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  insightCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  symbolBadge: {
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  symbolText: {
    fontSize: 12,
    fontWeight: '800',
    color: theme.isDark ? '#FFF' : '#333',
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  timestamp: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '500',
  },
  moreButton: {
    padding: 4,
  },
  insightTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.text.primary,
    lineHeight: 28,
    marginBottom: 10,
  },
  insightExcerpt: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 22,
    marginBottom: 16,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    borderRadius: 18,
    marginBottom: 16,
    overflow: 'hidden',
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
  },
  insightImage: {
    width: '100%',
    height: '100%',
  },
  insightFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  engagementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  engagementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  engagementCount: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookmarkButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(251, 191, 36, 0.9)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  emptyContainer: {
    paddingTop: 100,
    alignItems: 'center',
  },
  emptyIcon: {
    marginBottom: 20,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.text.primary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  loadMoreContainer: {
    paddingVertical: 30,
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: theme.primary.main,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
});
