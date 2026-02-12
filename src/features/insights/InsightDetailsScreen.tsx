import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  RefreshControl,
  Alert,
  StyleSheet,
  Platform,
  StatusBar,
  TextInput,
  I18nManager,
  Animated,
  useWindowDimensions,
} from 'react-native';
import RenderHtml from 'react-native-render-html';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../app/providers/ThemeProvider';
import { useLocalization } from '../../app/providers/LocalizationProvider';
import {
  useInsightDetail,
  useInsightComments,
  useCreateInsightComment,
  useReplyToInsightComment,
  useReport,
  useDeleteInsightComment,
  useLikeInsightComment
} from './insights.hooks';
import { useIsAuthenticated } from '../../app/auth/auth.hooks';
import { InsightCommentThread } from './CommentThread';
import { useSubscriptionAccess } from '../subscription';
import { createInsightsStyles } from './insights.styles';
import { ICONS, MESSAGES, COLORS } from './insights.constants';
import { ResponsiveContainer } from '../../shared/components';
import {
  formatTimeAgo,
  formatCount,
  formatReadTime,
  getCategoryInfo,
} from './insights.utils';
import type { InsightComment } from './insights.types';

type InsightDetailRouteParams = {
  InsightDetail: {
    insightId: string;
    title?: string;
  };
};

export const InsightDetailsScreen: React.FC = () => {
  const route = useRoute<RouteProp<InsightDetailRouteParams, 'InsightDetail'>>();
  const navigation = useNavigation();
  const { insightId } = route.params;
  const { theme, isDark } = useTheme();
  const { t, isRTL, language } = useLocalization();
  const { width: contentWidth, width: screenWidth } = useWindowDimensions();
  const isDesktop = screenWidth >= 1024;
  const isAuthenticated = useIsAuthenticated();
  const styles = useMemo(() => createInsightsStyles(theme), [theme]);
  const inputRef = useRef<TextInput>(null);

  const scrollY = useRef(new Animated.Value(0)).current;
  const { canAccessInsight } = useSubscriptionAccess();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<InsightComment | null>(null);

  const {
    insight,
    loading: insightLoading,
    error: insightError,
    refresh: refreshInsight,
    toggleLike: toggleInsightLike,
    hasLiked: insightHasLiked,
  } = useInsightDetail(insightId);

  const {
    comments,
    loading: commentsLoading,
    hasMore,
    loadMore,
    refresh: refreshComments,
    removeInsightComment,
  } = useInsightComments(insightId);

  const { createInsightComment, loading: createCommentLoading } = useCreateInsightComment(insightId, (newComment) => {
    refreshComments();
    setCommentText('');
  });

  const { replyToInsightComment, loading: replyLoading } = useReplyToInsightComment(
    replyingTo?._id || '',
    (newReply) => {
      refreshComments();
      setReplyingTo(null);
      setCommentText('');
    }
  );

  const { deleteInsightComment } = useDeleteInsightComment();
  const { reportContent } = useReport();

  const handleRefresh = useCallback(async () => {
    await Promise.all([refreshInsight(), refreshComments()]);
  }, [refreshInsight, refreshComments]);

  const handleSendComment = useCallback(async () => {
    if (!commentText.trim()) return;

    try {
      if (replyingTo) {
        await replyToInsightComment({
          content: commentText.trim(),
        });
      } else {
        await createInsightComment({
          content: commentText.trim(),
        });
      }
    } catch (error) {
      console.error('Error sending comment:', error);
    }
  }, [commentText, replyingTo, createInsightComment, replyToInsightComment]);

  const handleReply = useCallback((comment: InsightComment) => {
    setReplyingTo(comment);
    inputRef.current?.focus();
  }, []);

  const handleDelete = useCallback(async (commentId: string) => {
    Alert.alert(
      t('common.delete'),
      t('insights.confirmDeleteComment'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              const success = await deleteInsightComment(commentId);
              if (success) {
                removeInsightComment(commentId);
              }
            } catch (error) {
              console.error('Delete error:', error);
            }
          },
        },
      ]
    );
  }, [deleteInsightComment, removeInsightComment, t]);

  const handleShare = useCallback(async () => {
    if (!insight) return;
    Alert.alert('Share', 'Share functionality coming soon');
  }, [insight]);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 150, 250],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, 250, 300],
    outputRange: [20, 10, 0],
    extrapolate: 'clamp',
  });

  const imageScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.2, 1],
    extrapolateLeft: 'extend',
    extrapolateRight: 'clamp',
  });

  const imageTranslateY = scrollY.interpolate({
    inputRange: [0, 380],
    outputRange: [0, -100],
    extrapolate: 'clamp',
  });

  if (insightLoading && !insight) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary.main} />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  if (insightError || !insight) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={64} color={theme.text.tertiary} />
        <Text style={styles.errorText}>{insightError || t('insights.loadError')}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refreshInsight}>
          <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const canAccess = canAccessInsight(insight.type);

  return (
    <View style={styles.detailContainer}>
      <ResponsiveContainer>
        <StatusBar barStyle={(!insight.coverImage && !isDark) ? 'dark-content' : 'light-content'} translucent backgroundColor="transparent" />

        {/* Parallax Background Image */}
        {insight.coverImage && (
          <Animated.View
            style={[
              styles.parallaxHeader,
              {
                transform: [
                  { translateY: imageTranslateY },
                  { scale: imageScale }
                ]
              }
            ]}
          >
            <Image
              source={{ uri: insight.coverImage }}
              style={styles.parallaxImage}
              resizeMode="cover"
            />
            <View style={styles.headerOverlay} />
            <LinearGradient
              colors={['transparent', isDark ? theme.background.primary : '#FFFFFF']}
              style={styles.headerGradient}
            />
          </Animated.View>
        )}

        {/* Floating Header (Desktop: Hidden, Mobile: Visible on Scroll) */}
        {!isDesktop && (
          <Animated.View
            style={[
              styles.detailHeader,
              {
                backgroundColor: isDark ? theme.background.primary : '#FFFFFF',
                opacity: headerOpacity,
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                paddingTop: Platform.OS === 'ios' ? 50 : 30,
                zIndex: 30,
              }
            ]}
          >
            <Animated.Text
              style={[
                styles.headerTitleDetail,
                {
                  transform: [{ translateY: headerTranslateY }]
                }
              ]}
              numberOfLines={1}
            >
              {insight.title}
            </Animated.Text>
          </Animated.View>
        )}

        {/* Static Actions (Back/Share) - Always Visible */}
        <View style={[styles.detailHeader, { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: 'transparent', borderBottomWidth: 0, zIndex: 40, paddingTop: Platform.OS === 'ios' ? 50 : 30, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: 'rgba(0,0,0,0.3)', borderColor: 'rgba(255,255,255,0.2)' }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name={isRTL ? "chevron-forward" : "chevron-back"} size={24} color="#FFF" />
          </TouchableOpacity>

          <View style={{ flex: 1 }} />

          <TouchableOpacity
            style={[styles.shareButton, { backgroundColor: 'rgba(0,0,0,0.3)', borderColor: 'rgba(255,255,255,0.2)' }]}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>

        <Animated.ScrollView
          style={styles.detailContent}
          contentContainerStyle={styles.detailScrollContent}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={insightLoading && !!insight}
              onRefresh={handleRefresh}
              tintColor={theme.primary.main}
              progressViewOffset={80}
            />
          }
        >
          <View style={[isDesktop && { maxWidth: 1200, alignSelf: 'center', width: '100%', paddingHorizontal: 24 }]}>
            {/* Desktop Hero Header */}
            {isDesktop && (
              <View style={[localStyles.heroHeader, { backgroundColor: theme.background.secondary }]}>
                <View style={localStyles.heroContent}>
                  <View style={localStyles.topMeta}>
                    <View style={[styles.typeBadge, { backgroundColor: insight.type === 'premium' ? COLORS.premium : COLORS.free }]}>
                      <Ionicons name={insight.type === 'premium' ? "star" : "lock-open-outline"} size={12} color="#FFF" style={{ marginRight: 4 }} />
                      <Text style={styles.typeBadgeText}>
                        {t(`insights.types.${insight.type}`)}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <Text style={styles.detailTimestamp}>{formatTimeAgo(insight.createdAt, t)}</Text>
                      <Text style={styles.readTime}>{formatReadTime(insight.readTime, t)}</Text>
                    </View>
                  </View>

                  <Text style={[localStyles.heroTitle, { color: theme.text.primary }]}>
                    {insight.title}
                  </Text>

                  <View style={styles.authorInfo}>
                    <View style={[styles.authorAvatar, { backgroundColor: theme.background.tertiary }]}>
                      <Ionicons name="person" size={24} color={theme.primary.main} />
                    </View>
                    <View>
                      <Text style={styles.authorName}>{insight.author?.name || t('common.author')}</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* Mobile Title Section */}
            {!isDesktop && (
              <View style={[styles.detailTitleSection, !insight.coverImage && { paddingTop: Platform.OS === 'ios' ? 100 : 80 }]}>
                <View style={[styles.typeBadge, { backgroundColor: insight.type === 'premium' ? COLORS.premium : COLORS.free, alignSelf: 'flex-start', marginBottom: 16 }]}>
                  <Ionicons name={insight.type === 'premium' ? "star" : "lock-open-outline"} size={12} color="#FFF" style={{ marginRight: 4 }} />
                  <Text style={styles.typeBadgeText}>
                    {t(`insights.types.${insight.type}`)}
                  </Text>
                </View>

                <Text style={styles.detailTitle}>{insight.title}</Text>

                <View style={styles.detailMeta}>
                  <View style={styles.authorInfo}>
                    <View style={[styles.authorAvatar, { backgroundColor: theme.background.tertiary }]}>
                      <Ionicons name="person" size={24} color={theme.primary.main} />
                    </View>
                    <View>
                      <Text style={styles.authorName}>{insight.author?.name || t('common.author')}</Text>
                      <Text style={styles.detailTimestamp}>{formatTimeAgo(insight.createdAt, t)}</Text>
                    </View>
                  </View>
                  <View style={{ flex: 1 }} />
                  <Text style={styles.readTime}>
                    {formatReadTime(insight.readTime, t)}
                  </Text>
                </View>
              </View>
            )}

            <View style={[isDesktop && { flexDirection: 'row', gap: 24, alignItems: 'flex-start' }]}>
              {/* Main Content Column */}
              <View style={{ flex: 2 }}>
                <View style={[styles.detailBodyContainer, isDesktop && localStyles.card]}>
                  <LinearGradient
                    colors={isDark
                      ? ['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.02)']
                      : ['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.85)']
                    }
                    style={[StyleSheet.absoluteFill, isDesktop && { borderRadius: 24 }]}
                  />
                  <View style={styles.detailBody}>
                    {insight.insightFormat === 'signal' && (
                      <View style={[styles.signalCard, isDesktop && { backgroundColor: theme.background.secondary }]}>
                        <View style={styles.signalHeader}>
                          <View style={styles.signalSymbolContainer}>
                            <View style={styles.signalSymbolIcon}>
                              <Ionicons name="trending-up" size={24} color={theme.primary.main} />
                            </View>
                            <View>
                              <Text style={styles.signalSymbol}>{insight.symbol}</Text>
                              <Text style={styles.signalStockName}>
                                {isRTL ? (insight.stockNameAr || insight.stockName) : (insight.stockName || insight.stockNameAr)}
                              </Text>
                            </View>
                          </View>
                          <View style={styles.signalMarketBadge}>
                            <Text style={styles.signalMarketText}>{insight.market}</Text>
                          </View>
                        </View>

                        <View style={styles.signalGrid}>
                          <View style={styles.signalRow}>
                            <View style={styles.signalItem}>
                              <Text style={styles.signalLabel}>{t('admin.buyPrice')}</Text>
                              <Text style={[styles.signalValue, styles.signalBuyValue]}>
                                {insight.buyPrice?.toFixed(2) || '---'}
                              </Text>
                            </View>
                            <View style={styles.signalItem}>
                              <Text style={styles.signalLabel}>{t('admin.stopLoss')}</Text>
                              <Text style={[styles.signalValue, styles.signalStopValue]}>
                                {insight.stopLoss?.toFixed(2) || '---'}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.signalRow}>
                            <View style={styles.signalItem}>
                              <Text style={styles.signalLabel}>{t('admin.firstGoal')}</Text>
                              <Text style={[styles.signalValue, styles.signalGoalValue]}>
                                {insight.firstGoal?.toFixed(2) || '---'}
                              </Text>
                            </View>
                            <View style={styles.signalItem}>
                              <Text style={styles.signalLabel}>{t('admin.secondGoal')}</Text>
                              <Text style={[styles.signalValue, styles.signalGoalValue]}>
                                {insight.secondGoal?.toFixed(2) || '---'}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                    )}

                    {/* HTML Content */}
                    {canAccess ? (
                      <RenderHtml
                        contentWidth={isDesktop ? 700 : contentWidth - 32}
                        source={{ html: insight.content || '' }}
                        baseStyle={{
                          color: theme.text.secondary,
                          fontSize: 16,
                          lineHeight: 26,
                          textAlign: isRTL ? 'right' : 'left',
                        }}
                        tagsStyles={{
                          b: { fontWeight: '700' },
                          strong: { fontWeight: '700' },
                          i: { fontStyle: 'italic' },
                          em: { fontStyle: 'italic' },
                          u: { textDecorationLine: 'underline' },
                          h1: { fontSize: 24, fontWeight: '800', marginVertical: 12 },
                          h2: { fontSize: 20, fontWeight: '700', marginVertical: 10 },
                          h3: { fontSize: 18, fontWeight: '700', marginVertical: 8 },
                          p: { marginVertical: 8 },
                          ul: { paddingLeft: 16 },
                          ol: { paddingLeft: 16 },
                          li: { marginVertical: 4 },
                        }}
                      />
                    ) : (
                      <Text style={styles.detailText}>{insight.excerpt}</Text>
                    )}
                  </View>

                  {!canAccess && (
                    <LinearGradient
                      colors={['transparent', isDark ? 'rgba(10, 26, 10, 0.8)' : 'rgba(255, 255, 255, 0.9)', isDark ? '#0a1a0a' : '#FFFFFF']}
                      style={[styles.lockedOverlay, isDesktop && { borderRadius: 24 }]}
                    >
                      <View style={styles.lockedIcon}>
                        <View style={[styles.iconButton, { backgroundColor: 'rgba(251, 191, 36, 0.15)', width: 76, height: 76, borderRadius: 38 }]}>
                          <Ionicons name="lock-closed" size={32} color="#FBBF24" />
                        </View>
                        <Text style={styles.lockedTitle}>{t('insights.premiumTitle')}</Text>
                        <Text style={styles.lockedMessage}>{t('insights.premiumMessage')}</Text>

                        <TouchableOpacity
                          style={styles.upgradeButton}
                          onPress={() => navigation.navigate('Subscription' as never)}
                        >
                          <LinearGradient
                            colors={[COLORS.premium, '#D97706']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={StyleSheet.absoluteFill}
                          />
                          <Text style={styles.upgradeButtonText}>{t('insights.upgradeAction')}</Text>
                        </TouchableOpacity>
                      </View>
                    </LinearGradient>
                  )}
                </View>
              </View>

              {/* Sidebar (Desktop) */}
              {isDesktop && (
                <View style={{ flex: 1 }}>
                  <View style={[localStyles.card, { backgroundColor: theme.background.secondary, borderColor: theme.ui.border }]}>
                    {/* Desktop Engagement */}
                    <View style={styles.detailEngagement}>
                      <View style={styles.detailEngagementButtons}>
                        <TouchableOpacity
                          style={styles.detailEngagementButton}
                          onPress={toggleInsightLike}
                        >
                          <Ionicons
                            name={insightHasLiked ? "heart" : "heart-outline"}
                            size={24}
                            color={insightHasLiked ? COLORS.liked : theme.text.secondary}
                          />
                          <Text style={styles.detailEngagementText}>{formatCount(insight.likes)}</Text>
                        </TouchableOpacity>

                        <View style={styles.detailEngagementButton}>
                          <Ionicons name="chatbubble-outline" size={22} color={theme.text.secondary} />
                          <Text style={styles.detailEngagementText}>{formatCount(insight.commentsCount)}</Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={styles.detailEngagementButton}
                        onPress={() => setIsBookmarked(!isBookmarked)}
                      >
                        <Ionicons
                          name={isBookmarked ? "bookmark" : "bookmark-outline"}
                          size={24}
                          color={isBookmarked ? theme.primary.main : theme.text.secondary}
                        />
                      </TouchableOpacity>
                    </View>

                    {/* Comments List Desktop */}
                    <View style={styles.commentsSection}>
                      <View style={styles.commentsSectionHeader}>
                        <Text style={styles.commentsSectionTitle}>{t('insights.comments')}</Text>
                        <View style={styles.commentsCountBadge}>
                          <Text style={styles.commentsCountText}>{insight.commentsCount}</Text>
                        </View>
                      </View>

                      <View style={styles.commentsList}>
                        {comments.map(comment => (
                          <InsightCommentThread
                            key={comment._id}
                            comment={comment}
                            currentUserId={insight.author?._id || ''}
                            onReply={handleReply}
                            onUpdate={refreshComments}
                            onDelete={handleDelete}
                          />
                        ))}

                        {comments.length === 0 && !commentsLoading && (
                          <View style={styles.emptyCommentsContainer}>
                            <Ionicons name="chatbubbles-outline" size={48} color={theme.text.tertiary} />
                            <Text style={styles.emptyCommentsText}>{t('insights.noComments')}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* Mobile Bottom Section (Engagement + Comments) */}
            {!isDesktop && (
              <View>
                {/* Engagement Summary */}
                <View style={styles.detailEngagement}>
                  <LinearGradient
                    colors={isDark
                      ? ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.01)']
                      : ['rgba(0, 0, 0, 0.03)', 'rgba(0, 0, 0, 0.01)']
                    }
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={styles.detailEngagementButtons}>
                    <TouchableOpacity
                      style={styles.detailEngagementButton}
                      onPress={toggleInsightLike}
                    >
                      <Ionicons
                        name={insightHasLiked ? "heart" : "heart-outline"}
                        size={24}
                        color={insightHasLiked ? COLORS.liked : theme.text.secondary}
                      />
                      <Text style={styles.detailEngagementText}>{formatCount(insight.likes)}</Text>
                    </TouchableOpacity>

                    <View style={styles.detailEngagementButton}>
                      <Ionicons name="chatbubble-outline" size={22} color={theme.text.secondary} />
                      <Text style={styles.detailEngagementText}>{formatCount(insight.commentsCount)}</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.detailEngagementButton}
                    onPress={() => setIsBookmarked(!isBookmarked)}
                  >
                    <Ionicons
                      name={isBookmarked ? "bookmark" : "bookmark-outline"}
                      size={24}
                      color={isBookmarked ? theme.primary.main : theme.text.secondary}
                    />
                  </TouchableOpacity>
                </View>

                {/* Comments List Mobile */}
                <View style={styles.commentsSection}>
                  <View style={styles.commentsSectionHeader}>
                    <Text style={styles.commentsSectionTitle}>{t('insights.comments')}</Text>
                    <View style={styles.commentsCountBadge}>
                      <Text style={styles.commentsCountText}>{insight.commentsCount}</Text>
                    </View>
                  </View>

                  <View style={styles.commentsList}>
                    {comments.map(comment => (
                      <InsightCommentThread
                        key={comment._id}
                        comment={comment}
                        currentUserId={insight.author?._id || ''}
                        onReply={handleReply}
                        onUpdate={refreshComments}
                        onDelete={handleDelete}
                      />
                    ))}

                    {comments.length === 0 && !commentsLoading && (
                      <View style={styles.emptyCommentsContainer}>
                        <Ionicons name="chatbubbles-outline" size={48} color={theme.text.tertiary} />
                        <Text style={styles.emptyCommentsText}>{t('insights.noComments')}</Text>
                      </View>
                    )}

                    {hasMore && (
                      <TouchableOpacity
                        style={styles.loadMoreButton}
                        onPress={loadMore}
                        disabled={commentsLoading}
                      >
                        {commentsLoading ? (
                          <ActivityIndicator size="small" color={theme.primary.main} />
                        ) : (
                          <Text style={styles.loadMoreText}>{t('insights.loadMore')}</Text>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            )}
          </View>
        </Animated.ScrollView>

        {/* Comment Input Sticky */}
        <View style={[styles.commentInputContainer, { bottom: 0, paddingBottom: Platform.OS === 'ios' ? 34 : 16 }]}>
          {replyingTo && (
            <View style={styles.replyIndicator}>
              <Text style={styles.replyIndicatorText} numberOfLines={1}>
                {t('insights.replyingTo')} <Text style={styles.replyAuthorName}>{replyingTo.author?.name || t('common.author')}</Text>
              </Text>
              <TouchableOpacity onPress={() => setReplyingTo(null)}>
                <Ionicons name="close-circle" size={20} color={theme.text.tertiary} />
              </TouchableOpacity>
            </View>
          )}

          {isAuthenticated ? (
            <View style={styles.commentInputWrapper}>
              <TextInput
                ref={inputRef}
                style={styles.commentInput}
                placeholder={t('insights.addComment')}
                placeholderTextColor={theme.text.tertiary}
                value={commentText}
                onChangeText={setCommentText}
                multiline
                maxLength={1000}
              />

              <TouchableOpacity
                style={[styles.commentSendButton, !commentText.trim() && styles.sendButtonDisabled]}
                onPress={handleSendComment}
                disabled={!commentText.trim() || createCommentLoading}
              >
                <LinearGradient
                  colors={!commentText.trim() ? [theme.background.secondary, theme.background.secondary] : [theme.primary.main, theme.primary.dark]}
                  style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
                />
                {createCommentLoading ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Ionicons name={isRTL ? "send" : "send"} size={18} color="#FFF" style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }} />
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={localStyles.loginToCommentSticky}
              onPress={() => navigation.navigate('Auth' as any, { screen: 'Login' } as any)}
            >
              <Ionicons name="lock-closed-outline" size={20} color={theme.text.tertiary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.replyAuthorName, { color: theme.text.primary }]}>{t('common.loginRequired' as any) || (language === 'ar' ? 'تسجيل الدخول مطلوب' : 'Login Required')}</Text>
                <Text style={{ fontSize: 12, color: theme.text.tertiary }}>{language === 'ar' ? 'سجل الدخول للمشاركة في النقاش' : 'Login to participate in the discussion'}</Text>
              </View>
              <View style={{ backgroundColor: theme.primary.main, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }}>
                <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 13 }}>{t('common.login' as any) || (language === 'ar' ? 'دخول' : 'Login')}</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </ResponsiveContainer>
    </View>
  );
};

const localStyles = StyleSheet.create({
  heroHeader: {
    paddingBottom: 20,
    marginBottom: 16,
    borderRadius: 24,
    marginTop: 16,
  },
  heroContent: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  topMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 36,
    marginBottom: 16,
  },
  card: {
    borderWidth: 1,
    marginBottom: 24,
    overflow: 'hidden',
  },
  loginToCommentSticky: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    gap: 12,
  }
});
