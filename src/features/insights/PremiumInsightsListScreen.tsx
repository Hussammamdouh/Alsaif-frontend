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
  useWindowDimensions,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../app/providers/ThemeProvider';
import { ResponsiveContainer } from '../../shared/components';
import { useInsights } from './insights.hooks';
import { useMarketData } from '../../core/hooks/useMarketData';
import { useLocalization } from '../../app/providers/LocalizationProvider';
import { useSubscriptionAccess } from '../subscription';
import {
  ICONS,
} from './insights.constants';
import { FilterChips } from '../../shared/components/FilterChips';
import {
  formatTimeAgo,
  formatCount,
  generateExcerpt,
} from './insights.utils';
import type { InsightListItem } from './insights.types';

interface PremiumInsightsListScreenProps {
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

const PremiumInsightCard: React.FC<InsightCardProps> = ({
  item, index, theme, isDark, isDesktop, t, styles, hasAccess, onPress, onLike
}) => {
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
            <View style={[styles.typeBadge, { backgroundColor: '#FBBF24' }]}>
              <Text style={styles.typeBadgeText}>PREMIUM</Text>
            </View>
            <Text style={[styles.timestamp, { color: theme.text.tertiary }]}>{formatTimeAgo(item.publishedAt || item.createdAt, t)}</Text>
          </View>
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

        {!hasAccess && (
          <View style={[styles.lockBadge, { backgroundColor: theme.primary.main }]}>
            <Ionicons name="lock-closed" size={12} color="#FFF" />
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

export const PremiumInsightsListScreen: React.FC<PremiumInsightsListScreenProps> = ({
  hideHeader,
  hideAccessFilter,
  ListHeaderComponent
}) => {
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();
  const { t } = useLocalization();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const columnCount = width > 1600 ? 3 : 2;
  const styles = React.useMemo(() => getStyles(theme, isDesktop), [theme, isDesktop]);
  const { hasPremiumAccess } = useSubscriptionAccess();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter state
  const [typeFilter, setTypeFilter] = useState<'all' | 'free' | 'premium'>('premium');
  const [marketFilter, setMarketFilter] = useState<'all' | 'ADX' | 'DFM' | 'Other' | 'signal'>('all');

  // Build query params based on filters
  const queryParams = React.useMemo(() => {
    const params: any = { search: searchQuery, type: 'premium' };
    if (marketFilter === 'signal') {
      params.insightFormat = 'signal';
    } else if (marketFilter !== 'all') {
      params.market = marketFilter;
    }
    return params;
  }, [searchQuery, marketFilter]);
  const {
    insights,
    loading: insightsLoading,
    refreshing,
    error,
    refresh,
    loadMore,
    updateInsightInList,
  } = useInsights(queryParams);

  const { marketData, loading: marketLoading } = useMarketData(0);
  const loading = insightsLoading || marketLoading;

  const activeSymbols = React.useMemo(() => {
    return new Set(
      marketData
        .filter(item => (item.price && item.price > 0) || (item.volume && item.volume > 0))
        .map(item => item.symbol.toUpperCase())
    );
  }, [marketData]);

  const filteredInsights = React.useMemo(() => {
    if (marketLoading || marketData.length === 0) return insights;
    return insights.filter(insight => {
      const symbol = insight.tags && insight.tags[0]?.toUpperCase();
      if (!symbol) return true;
      const isSymbolInMarket = marketData.some(m => m.symbol.toUpperCase() === symbol);
      if (isSymbolInMarket && !activeSymbols.has(symbol)) return false;
      return true;
    });
  }, [insights, activeSymbols, marketData, marketLoading]);

  // Refresh when filters change
  React.useEffect(() => {
    refresh(queryParams);
  }, [marketFilter, searchQuery]);

  const handleInsightPress = (insight: InsightListItem) => {
    if (!hasPremiumAccess) {
      (navigation as any).navigate('Paywall');
    } else {
      (navigation as any).navigate('InsightDetail', { insightId: insight._id, title: insight.title });
    }
  };

  const handleLike = async (insight: InsightListItem) => {
    if (!hasPremiumAccess) {
      (navigation as any).navigate('Paywall');
      return;
    }

    const newHasLiked = !insight.hasLiked;
    const newLikes = newHasLiked ? insight.likes + 1 : insight.likes - 1;

    updateInsightInList(insight._id, {
      hasLiked: newHasLiked,
      likes: newLikes,
    });
  };

  const renderInsightCard = ({ item, index }: { item: InsightListItem; index: number }) => (
    <PremiumInsightCard
      item={item}
      index={index}
      theme={theme}
      isDark={isDark}
      isDesktop={isDesktop}
      t={t}
      styles={styles}
      hasAccess={hasPremiumAccess}
      onPress={handleInsightPress}
      onLike={handleLike}
    />
  );

  const renderEmpty = () => {
    if (insightsLoading && !refreshing) return null;

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
          <TouchableOpacity style={styles.retryButton} onPress={() => refresh({})}>
            <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ResponsiveContainer style={{ flex: 1 }}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
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

        {!hasPremiumAccess && (
          <TouchableOpacity style={styles.premiumBanner} onPress={() => (navigation as any).navigate('Paywall')}>
            <LinearGradient colors={[theme.primary.main, theme.primary.dark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
            <View style={styles.bannerContent}>
              <View style={styles.bannerLeft}>
                <View style={styles.bannerIconContainer}><Ionicons name="lock-closed" size={18} color="#fff" /></View>
                <Text style={styles.bannerText}>Upgrade to Premium to unlock exclusive insights</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#fff" />
            </View>
          </TouchableOpacity>
        )}

        <FlatList
          key={isDesktop ? `grid-${columnCount}` : 'list'}
          data={filteredInsights}
          renderItem={renderInsightCard}
          keyExtractor={(item) => item._id}
          numColumns={isDesktop ? columnCount : 1}
          columnWrapperStyle={isDesktop && columnCount > 1 ? { gap: 24, paddingHorizontal: 24 } : null}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={theme.primary.main} />}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              {ListHeaderComponent}
              {!hideAccessFilter && (
                <FilterChips
                  title={t('filter.accessType')}
                  options={[
                    { key: 'all', labelKey: 'filter.all' },
                    { key: 'free', labelKey: 'filter.free' },
                    { key: 'premium', labelKey: 'filter.premium' },
                  ]}
                  selected={typeFilter}
                  onSelect={(key: string) => {
                    if (key === 'premium' && !hasPremiumAccess) {
                      (navigation as any).navigate('Paywall');
                    } else {
                      setTypeFilter(key as any);
                    }
                  }}
                />
              )}
              <FilterChips
                title={t('filter.market')}
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
            </>
          }
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
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    height: 60,
  },
  bannerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bannerIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
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
    color: theme.text.primary,
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
    color: theme.isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)',
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
    color: theme.text.primary,
    lineHeight: 24,
    marginBottom: 8,
  },
  insightExcerpt: {
    fontSize: 14,
    color: theme.text.secondary,
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
    color: theme.text.secondary,
  },
  bookmarkButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
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
    color: theme.text.primary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: theme.text.secondary,
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
    color: theme.text.secondary,
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
