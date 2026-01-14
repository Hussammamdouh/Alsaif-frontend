import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../app/providers/ThemeProvider';
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

interface PremiumInsightsListScreenProps {
  hideHeader?: boolean;
  ListHeaderComponent?: React.ReactElement;
}

export const PremiumInsightsListScreen: React.FC<PremiumInsightsListScreenProps> = ({ hideHeader, ListHeaderComponent }) => {
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();
  const { t } = useLocalization();
  const styles = React.useMemo(() => getStyles(theme), [theme]);
  const { hasPremiumAccess } = useSubscriptionAccess();

  // Always filter for premium insights only
  const {
    insights,
    loading,
    refreshing,
    error,
    hasMore,
    refresh,
    loadMore,
    updateInsightInList,
  } = useInsights({
    type: 'premium', // Always show premium
  });

  const handleInsightPress = (insight: InsightListItem) => {
    if (!hasPremiumAccess) {
      (navigation as any).navigate('Paywall');
    } else {
      (navigation as any).navigate('InsightDetail', { insightId: insight._id, title: insight.title });
    }
  };

  const handleLike = async (insight: InsightListItem) => {
    if (!hasPremiumAccess) {
      navigation.navigate('Paywall' as never);
      return;
    }

    // Optimistic update
    const newHasLiked = !insight.hasLiked;
    const newLikes = newHasLiked ? insight.likes + 1 : insight.likes - 1;

    updateInsightInList(insight._id, {
      hasLiked: newHasLiked,
      likes: newLikes,
    });
  };


  const renderInsightCard = ({ item }: { item: InsightListItem }) => {
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

            {/* Premium Badge */}
            <View
              style={[
                styles.typeBadge,
                { backgroundColor: '#FBBF24' },
              ]}
            >
              <Ionicons name="star" size={10} color="#fff" style={{ marginRight: 4 }} />
              <Text style={styles.typeBadgeText}>PREMIUM</Text>
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
        {item.coverImage && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: item.coverImage }}
              style={styles.insightImage}
              resizeMode="cover"
            />
          </View>
        )}

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

        {/* Lock Indicator for Premium without Access */}
        {!hasPremiumAccess && (
          <View style={styles.lockBadge}>
            <Ionicons name="lock-closed" size={14} color="#FFF" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => {
    if (loading && !refreshing) return null;

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="star-outline" size={64} color={isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)"} style={styles.emptyIcon} />
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
          <Text style={styles.headerTitle}>{t('insights.premiumInsights')}</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={22} color={isDark ? "#FFF" : "#000"} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Error State */}
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refresh}>
            <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <LinearGradient
        colors={isDark ? [theme.background.primary, '#1a2e1a', '#0a1a0a'] : ['#FFFFFF', '#FFFFFF', '#FFFFFF']}
        style={StyleSheet.absoluteFill}
      />

      {/* Header - only show if not hidden */}
      {!hideHeader && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('insights.premiumInsights')}</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={22} color={isDark ? "#FFF" : "#000"} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Premium Access Banner */}
      {!hasPremiumAccess && (
        <TouchableOpacity
          style={styles.premiumBanner}
          onPress={() => navigation.navigate('Paywall' as never)}
        >
          <LinearGradient
            colors={[theme.primary.main, theme.primary.dark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.bannerContent}>
            <View style={styles.bannerLeft}>
              <View style={styles.bannerIconContainer}>
                <Ionicons name="lock-closed" size={18} color="#fff" />
              </View>
              <Text style={styles.bannerText}>
                Upgrade to Premium to unlock exclusive insights
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </View>
        </TouchableOpacity>
      )}


      {/* Insights List */}
      <FlatList
        data={insights}
        renderItem={renderInsightCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={ListHeaderComponent}
        refreshControl={
          <RefreshControl

            refreshing={refreshing}
            onRefresh={refresh}
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
    </View>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
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
  premiumBanner: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 4,
    shadowColor: theme.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  bannerIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
    flex: 1,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: 40,
  },
  insightCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 16,
    marginBottom: 20,
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
    flexDirection: 'row',
    alignItems: 'center',
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
