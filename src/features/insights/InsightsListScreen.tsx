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
  Animated,
  Easing,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../app/providers/ThemeProvider';
import { ResponsiveContainer, FilterChips, AuthRequiredGate } from '../../shared/components';
import { useInsights } from './insights.hooks';
import { useMarketData } from '../../core/hooks/useMarketData';
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
  hideAccessFilter?: boolean;
  ListHeaderComponent?: React.ReactElement;
}

interface InsightCardProps {
  item: InsightListItem;
  index: number;
  theme: any;
  isDark: boolean;
  isDesktop: boolean;
  t: any;
  styles: any;
  hasAccess: boolean;
  onPress: (insight: InsightListItem) => void;
  onLike: (insight: InsightListItem) => void;
}

const InsightCard: React.FC<InsightCardProps> = ({
  item, index, theme, isDark, isDesktop, t, styles, hasAccess, onPress, onLike
}) => {
  // Animation logic
  const translateY = React.useRef(new Animated.Value(30)).current;
  const opacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 450,
        delay: Math.min(index * 70, 700),
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1)),
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 450,
        delay: Math.min(index * 70, 700),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }], flex: 1 }}>
      <TouchableOpacity
        style={[styles.insightCard, { backgroundColor: theme.background.secondary, borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]}
        onPress={() => onPress(item)}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={isDark
            ? ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.01)']
            : ['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.4)']
          }
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.insightCardHeader}>
          <View style={styles.insightCardLeft}>
            {item.tags[0] && (
              <View style={[styles.symbolBadge, { backgroundColor: theme.primary.main + '15' }]}>
                <Text style={[styles.symbolText, { color: theme.primary.main }]}>{item.tags[0].toUpperCase()}</Text>
              </View>
            )}
            <View
              style={[
                styles.typeBadge,
                { backgroundColor: item.type === 'premium' ? '#FBBF24' : theme.primary.main },
              ]}
            >
              <Text style={styles.typeBadgeText}>
                {item.type === 'premium' ? t('filter.premium') : t('filter.free')}
              </Text>
            </View>
            <Text style={[styles.timestamp, { color: theme.text.tertiary }]}>{formatTimeAgo(item.publishedAt || item.createdAt, t)}</Text>
          </View>

          <TouchableOpacity style={styles.moreButton}>
            <Ionicons name={ICONS.more as any} size={18} color={theme.text.tertiary} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.insightTitle, { color: theme.text.primary }]} numberOfLines={2}>
          {item.title}
        </Text>

        {(item.excerpt || item.content) && (
          <Text style={[styles.insightExcerpt, { color: theme.text.secondary }]} numberOfLines={2}>
            {generateExcerpt(item.excerpt || item.content, 100)}
          </Text>
        )}

        {item.coverImage && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: item.coverImage }}
              style={styles.insightImage}
              resizeMode="cover"
            />
          </View>
        )}

        <View style={styles.insightFooter}>
          <View style={styles.engagementRow}>
            <TouchableOpacity
              style={[styles.engagementButton, { backgroundColor: theme.background.tertiary }]}
              onPress={() => onLike(item)}
            >
              <Ionicons
                name={(item.hasLiked ? ICONS.like : ICONS.likeOutline) as any}
                size={18}
                color={item.hasLiked ? '#ef4444' : theme.text.tertiary}
              />
              <Text style={[styles.engagementCount, { color: theme.text.secondary }]}>{formatCount(item.likes)}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.engagementButton, { backgroundColor: theme.background.tertiary }]}
              onPress={() => onPress(item)}
            >
              <Ionicons name={ICONS.commentOutline as any} size={18} color={theme.text.tertiary} />
              <Text style={[styles.engagementCount, { color: theme.text.secondary }]}>{formatCount(item.commentsCount)}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.bookmarkButton, { backgroundColor: theme.background.tertiary }]}>
            <Ionicons
              name={(item.hasBookmarked ? ICONS.bookmark : ICONS.bookmarkOutline) as any}
              size={18}
              color={item.hasBookmarked ? theme.primary.main : theme.text.tertiary}
            />
          </TouchableOpacity>
        </View>

        {item.type === 'premium' && !hasAccess && (
          <View style={[styles.lockBadge, { backgroundColor: theme.primary.main }]}>
            <Ionicons name="lock-closed" size={12} color="#FFF" />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export const InsightsListScreen: React.FC<InsightsListScreenProps> = ({
  hideHeader,
  hideAccessFilter,
  ListHeaderComponent
}) => {
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();
  const { t, isRTL } = useLocalization();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const columnCount = width > 1600 ? 3 : 2;
  const styles = React.useMemo(() => getStyles(theme, isDesktop, isDark), [theme, isDesktop, isDark]);
  const { canAccessInsight } = useSubscriptionAccess();


  // Filter state
  const [typeFilter, setTypeFilter] = useState<'all' | 'free' | 'premium'>('all');
  const [marketFilter, setMarketFilter] = useState<'all' | 'ADX' | 'DFM' | 'Other' | 'signal'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Build query params based on filters
  const queryParams = React.useMemo(() => {
    const params: any = {};
    if (typeFilter !== 'all') params.type = typeFilter;
    if (searchQuery) params.search = searchQuery;
    if (marketFilter === 'signal') {
      params.insightFormat = 'signal';
    } else if (marketFilter !== 'all') {
      params.market = marketFilter;
    }
    return params;
  }, [typeFilter, marketFilter, searchQuery]);

  const {
    insights,
    loading: insightsLoading,
    refreshing,
    error,
    refresh,
    loadMore,
    updateInsightInList,
  } = useInsights(queryParams);

  const { marketData, loading: marketLoading } = useMarketData(0); // Fetch once for filtering
  const loading = insightsLoading || marketLoading;

  // Memoized active symbols for efficient filtering
  const activeSymbols = React.useMemo(() => {
    return new Set(
      marketData
        .filter(item => (item.price && item.price > 0) || (item.volume && item.volume > 0))
        .map(item => item.symbol.toUpperCase())
    );
  }, [marketData]);

  // Filter insights based on active market data
  const filteredInsights = React.useMemo(() => {
    if (marketLoading || marketData.length === 0) return insights;

    return insights.filter(insight => {
      // Always show free insights
      if (insight.type === 'free') return true;

      // If the insight has tags, check if the first tag (usually symbol) is active
      // If no tags, or symbol not in market, we show it (general insight)
      const symbol = insight.tags && insight.tags[0]?.toUpperCase();
      if (!symbol) return true;

      // If it's a known symbol but not active, hide it
      const isSymbolInMarket = marketData.some(m => m.symbol.toUpperCase() === symbol);
      if (isSymbolInMarket && !activeSymbols.has(symbol)) {
        return false;
      }

      return true;
    });
  }, [insights, activeSymbols, marketData, marketLoading]);

  // Refresh when filters change
  React.useEffect(() => {
    refresh(queryParams);
  }, [typeFilter, marketFilter]);

  const handleInsightPress = (insight: InsightListItem) => {
    if (insight.type === 'premium' && !canAccessInsight('premium')) {
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
  };

  const renderInsightCard = ({ item, index }: { item: InsightListItem; index: number }) => (
    <InsightCard
      item={item}
      index={index}
      theme={theme}
      isDark={isDark}
      isDesktop={isDesktop}
      t={t}
      styles={styles}
      hasAccess={canAccessInsight(item.type)}
      onPress={handleInsightPress}
      onLike={handleLike}
    />
  );

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
    if (!insightsLoading || refreshing) return null;

    return (
      <View style={styles.loadMoreContainer}>
        <ActivityIndicator size="small" color={theme.primary.main} />
      </View>
    );
  };

  if (error && filteredInsights.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="cloud-offline-outline" size={64} color={theme.accent.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => refresh()}>
            <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <AuthRequiredGate
      title={t('insights.loginRequired') || 'Insights Access'}
      message={t('insights.loginMessage') || 'Log in to view expert market insights and analysis.'}
      icon="bulb-outline"
    >
      <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <ResponsiveContainer style={{ flex: 1 }}>
          <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

          {!hideHeader && (
            <View style={[
              styles.headerWrapper,
              isDesktop && styles.desktopHeaderWrapper,
              { borderBottomWidth: 1, borderBottomColor: theme.ui.border, paddingBottom: 24 },
              !isDesktop && { paddingTop: 20, borderBottomWidth: 0 }
            ]}>
              <View style={{ marginBottom: isDesktop ? 6 : 8, alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                <Text style={[styles.headerTitle, { color: theme.text.primary, textAlign: isRTL ? 'right' : 'left' }]}>
                  {t('insights.freeInsights')}
                </Text>
                <Text style={[styles.headerSubtitle, { color: theme.text.tertiary, textAlign: isRTL ? 'right' : 'left' }]}>
                  {t('common.tagline')}
                </Text>
              </View>

              <View style={{ gap: 12 }}>
                {!hideAccessFilter && (
                  <FilterChips
                    options={[
                      { key: 'all', labelKey: 'filter.all' },
                      { key: 'free', labelKey: 'filter.free' },
                      { key: 'premium', labelKey: 'filter.premium' },
                    ]}
                    selected={typeFilter}
                    onSelect={(key: string) => setTypeFilter(key as any)}
                  />
                )}
                <FilterChips
                  options={[
                    { key: 'all', labelKey: 'filter.general' },
                    { key: 'ADX', labelKey: 'filter.adx' },
                    { key: 'DFM', labelKey: 'filter.dfm' },
                    { key: 'Other', labelKey: 'filter.others' },
                    { key: 'signal', labelKey: 'filter.specific' },
                  ]}
                  selected={marketFilter}
                  onSelect={(key: string) => setMarketFilter(key as any)}
                />
              </View>
            </View>
          )}


          {/* Insights List */}
          <FlatList
            style={{ flex: 1 }}
            key={isDesktop ? `grid-${columnCount}` : 'list'}
            data={filteredInsights}
            renderItem={renderInsightCard}
            keyExtractor={(item) => item._id}
            numColumns={isDesktop ? columnCount : 1}
            columnWrapperStyle={isDesktop && columnCount > 1 ? { gap: 24, paddingHorizontal: 24 } : null}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              <>
                {ListHeaderComponent}
              </>
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => refresh()}
                tintColor={theme.primary.main}
                colors={[theme.primary.main]}
              />
            }
            onEndReached={!isDesktop ? loadMore : undefined}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={renderEmpty}
            ListFooterComponent={
              isDesktop && filteredInsights.length > 0 ? (
                <View style={styles.desktopFooter}>
                  <TouchableOpacity
                    style={[styles.loadMoreButton, { backgroundColor: theme.primary.main }]}
                    onPress={loadMore}
                  >
                    {insightsLoading ? (
                      <ActivityIndicator color="#FFF" />
                    ) : (
                      <Text style={styles.loadMoreText}>{t('common.loadMore') || 'Load More'}</Text>
                    )}
                  </TouchableOpacity>
                </View>
              ) : renderFooter()
            }
            showsVerticalScrollIndicator={false}
          />
        </ResponsiveContainer>
      </View>
    </AuthRequiredGate>
  );
};

const getStyles = (theme: any, isDesktop: boolean, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
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
    borderWidth: 1,
  },
  headerWrapper: {
    paddingHorizontal: isDesktop ? 24 : 16,
    paddingBottom: 16,
  },
  desktopHeaderWrapper: {
    paddingHorizontal: 32,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: isDesktop ? 32 : 28,
    fontWeight: '900',
    letterSpacing: -1,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: isDesktop ? 24 : 16,
    paddingBottom: 40,
    gap: 20,
  },
  insightCard: {
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 180,
  },
  insightCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  insightCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  symbolBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  symbolText: {
    fontSize: 11,
    fontWeight: '800',
  },
  typeBadge: {
    paddingHorizontal: 8,
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
    fontWeight: '500',
  },
  moreButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
    marginBottom: 8,
  },
  insightExcerpt: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  insightImage: {
    width: '100%',
    height: '100%',
  },
  insightFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  engagementRow: {
    flexDirection: 'row',
    gap: 8,
  },
  engagementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  engagementCount: {
    fontSize: 13,
    fontWeight: '700',
  },
  bookmarkButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 22,
  },
  loadMoreContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
  desktopFooter: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadMoreButton: {
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 16,
    minWidth: 200,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: theme.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  loadMoreText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
