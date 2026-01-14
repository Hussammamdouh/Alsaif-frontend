import React, { useState, useCallback, useMemo, useRef } from 'react';
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
  ActionSheetIOS,
} from 'react-native';
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
  useReport
} from './insights.hooks';
import { InsightCommentThread } from './CommentThread';
import { useSubscriptionAccess } from '../subscription';
import { ICONS, MESSAGES, COLORS } from './insights.constants';
import {
  formatTimeAgo,
  formatCount,
  formatReadTime,
  getCategoryInfo,
} from './insights.utils';
import type { CreateInsightCommentPayload, InsightComment } from './insights.types';

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
  const { t, isRTL } = useLocalization();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const inputRef = useRef<TextInput>(null);

  const { canAccessInsight, hasPremiumAccess } = useSubscriptionAccess();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<InsightComment | null>(null);

  // Insight detail hook
  const {
    insight,
    loading: insightLoading,
    error: insightError,
    hasLiked,
    toggleLike,
    updateInsightCommentsCount,
    refresh: refreshInsight,
  } = useInsightDetail(insightId);

  // Comments hook
  const {
    comments,
    loading: commentsLoading,
    error: commentsError,
    hasMore,
    loadMore,
    refresh: refreshComments,
    addInsightComment,
  } = useInsightComments(insightId);

  // Create comment hook
  const { createInsightComment, loading: createCommentLoading } = useCreateInsightComment(
    insightId,
    (newComment) => {
      addInsightComment(newComment);
      updateInsightCommentsCount(1);
      setCommentText('');
    }
  );

  // Reply to comment hook
  const { replyToInsightComment, loading: replyLoading } = useReplyToInsightComment(
    replyingTo?._id || '',
    (newReply) => {
      // Refresh current thread or the whole comments list
      refreshComments();
      updateInsightCommentsCount(1);
      setCommentText('');
      setReplyingTo(null);
    }
  );

  const hasAccess = insight ? canAccessInsight(insight.type) : true;

  const handleBack = () => {
    navigation.goBack();
  };

  const handleLike = async () => {
    if (!insight) return;
    if (insight.type === 'premium' && !hasPremiumAccess) {
      navigation.navigate('Paywall' as never);
      return;
    }
    await toggleLike();
  };

  const handleBookmark = () => {
    if (insight?.type === 'premium' && !hasPremiumAccess) {
      navigation.navigate('Paywall' as never);
      return;
    }
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = () => {
    if (insight?.type === 'premium' && !hasPremiumAccess) {
      navigation.navigate('Paywall' as never);
      return;
    }
    Alert.alert(t('insights.share'), t('insights.shareComingSoon'));
  };

  const { reportContent, loading: reporting } = useReport();

  const handleReport = () => {
    if (!insight) return;

    const reasons = [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('insights.reportSpam'), onPress: () => submitReport('spam') },
      { text: t('insights.reportHarassment'), onPress: () => submitReport('harassment') },
      { text: t('insights.reportInappropriate'), onPress: () => submitReport('inappropriate_content') },
      { text: t('insights.reportOther'), onPress: () => submitReport('other') },
    ];

    Alert.alert(
      t('insights.reportInsight'),
      t('insights.reportReason'),
      reasons as any
    );
  };

  const submitReport = async (reason: string) => {
    await reportContent({
      targetType: 'insight',
      targetId: insightId,
      reason,
    });
  };

  const handleMoreOptions = () => {
    const options = [t('insights.report'), t('common.cancel')];
    const cancelButtonIndex = 1;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) handleReport();
        }
      );
    } else {
      handleReport();
    }
  };

  const handleCommentPress = () => {
    if (insight?.type === 'premium' && !hasPremiumAccess) {
      navigation.navigate('Paywall' as never);
      return;
    }
    setReplyingTo(null);
    inputRef.current?.focus();
  };

  const handleReplyPress = (comment: InsightComment) => {
    if (insight?.type === 'premium' && !hasPremiumAccess) {
      navigation.navigate('Paywall' as never);
      return;
    }
    setReplyingTo(comment);
    inputRef.current?.focus();
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
    setCommentText('');
  };

  const handleSendComment = async () => {
    if (!commentText.trim()) return;

    if (replyingTo) {
      if (replyLoading) return;
      await replyToInsightComment({ content: commentText.trim() });
    } else {
      if (createCommentLoading) return;
      await createInsightComment({ content: commentText.trim() });
    }
  };

  const handleRefresh = useCallback(() => {
    refreshInsight();
    refreshComments();
  }, [refreshInsight, refreshComments]);

  // Loading state
  if (insightLoading && !insight) {
    return (
      <View style={styles.detailContainer}>
        <LinearGradient
          colors={isDark ? [theme.background.primary, '#0a1a0a'] : ['#FFFFFF', '#FFFFFF']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.detailHeader}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name={isRTL ? "chevron-forward" : "chevron-back"} size={24} color={isDark ? theme.text.primary : theme.text.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary.main} />
          <Text style={styles.loadingText}>{t('insights.loadingInsight')}</Text>
        </View>
      </View>
    );
  }

  // Error state
  if (insightError && !insight) {
    return (
      <View style={styles.detailContainer}>
        <LinearGradient
          colors={isDark ? [theme.background.primary, '#1a2e1a'] : ['#FFFFFF', '#FFFFFF']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.detailHeader}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Ionicons name={isRTL ? "chevron-forward" : "chevron-back"} size={24} color={isDark ? theme.text.primary : theme.text.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={theme.text.tertiary} />
          <Text style={styles.errorText}>{insightError}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>{t('insights.retry')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!insight) return null;

  const categoryInfo = getCategoryInfo(insight.category);

  return (
    <View style={styles.detailContainer}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <LinearGradient
        colors={isDark ? [theme.background.primary, '#1a2e1a', '#0a1a0a'] : ['#FFFFFF', '#F8FAF8', '#F1F5F1']}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.detailHeader}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name={isRTL ? "chevron-forward" : "chevron-back"} size={24} color={theme.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {t('insights.details')}
        </Text>
        <TouchableOpacity style={styles.shareButton} onPress={handleMoreOptions}>
          <Ionicons name={(ICONS.more as any)} size={22} color={theme.text.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name={(ICONS.share as any)} size={22} color={theme.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.detailContent}
        contentContainerStyle={styles.detailScrollContent}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={handleRefresh}
            tintColor={theme.primary.main}
            colors={[theme.primary.main]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <View style={styles.detailTitleSection}>
          <View style={styles.detailCategory}>
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: categoryInfo.color + '30' },
              ]}
            >
              <Text style={[styles.categoryText, { color: categoryInfo.color }]}>
                {categoryInfo.label.toUpperCase()}
              </Text>
            </View>

            {/* Type Badge */}
            <View
              style={[
                styles.typeBadge,
                {
                  backgroundColor:
                    insight.type === 'premium' ? '#FBBF24' : theme.primary.main,
                },
              ]}
            >
              {insight.type === 'premium' && (
                <Ionicons
                  name="star"
                  size={10}
                  color="#fff"
                  style={{ marginRight: 4 }}
                />
              )}
              <Text style={styles.typeBadgeText}>
                {insight.type.toUpperCase()}
              </Text>
            </View>
          </View>

          <Text style={styles.detailTitle}>{insight.title}</Text>

          <View style={styles.detailMeta}>
            <View style={styles.authorInfo}>
              {insight.author.avatar ? (
                <Image
                  source={{ uri: insight.author.avatar }}
                  style={styles.authorAvatar}
                />
              ) : (
                <View style={[styles.authorAvatar, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
                  <Ionicons name="person" size={20} color={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.2)"} />
                </View>
              )}
              <View>
                <Text style={styles.authorName}>{insight.author.name}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={styles.detailTimestamp}>
                    {formatTimeAgo(insight.publishedAt || insight.createdAt, t)}
                  </Text>
                  {insight.readTime && (
                    <>
                      <Text style={styles.detailTimestamp}>•</Text>
                      <Text style={styles.readTime}>
                        {formatReadTime(insight.readTime, t)}
                      </Text>
                    </>
                  )}
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Cover Image */}
        {insight.coverImage && (
          <View style={styles.detailImageContainer}>
            <Image
              source={{ uri: insight.coverImage }}
              style={styles.detailImage}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Body Content */}
        <View style={styles.glassContent}>
          <LinearGradient
            colors={isDark
              ? ['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.02)']
              : ['#FFFFFF', '#FFFFFF']
            }
            style={StyleSheet.absoluteFill}
          />
          {hasAccess ? (
            <View style={styles.detailBody}>
              <Text style={styles.detailText}>{insight.content}</Text>
            </View>
          ) : (
            <View style={styles.detailBody}>
              <Text style={styles.detailText} numberOfLines={5}>
                {insight.content}
              </Text>
              {/* Locked Overlay */}
              <View style={styles.lockedOverlay}>
                <LinearGradient
                  colors={isDark
                    ? ['transparent', 'rgba(10, 26, 10, 0.9)', '#0a1a0a']
                    : ['transparent', 'rgba(255, 255, 255, 0.9)', '#FFFFFF']
                  }
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.lockedContent}>
                  <View style={styles.lockCircle}>
                    <Ionicons
                      name="lock-closed"
                      size={32}
                      color="#FBBF24"
                    />
                  </View>
                  <Text style={styles.lockedTitle}>{t('insights.premiumInsight')}</Text>
                  <Text style={styles.lockedMessage}>
                    {t('insights.premiumMessage')}
                  </Text>
                  <TouchableOpacity
                    style={styles.upgradeButton}
                    onPress={() => navigation.navigate('Paywall' as never)}
                  >
                    <LinearGradient
                      colors={[theme.primary.main, theme.primary.dark]}
                      style={StyleSheet.absoluteFill}
                    />
                    <Text style={styles.upgradeButtonText}>{t('insights.unlockNow')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Engagement Bar */}
        <View style={styles.detailEngagement}>
          <View style={[styles.detailEngagementButtons, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <TouchableOpacity
              style={[styles.detailEngagementButton, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
              onPress={handleLike}
            >
              <Ionicons
                name={(hasLiked ? ICONS.like : ICONS.likeOutline) as any}
                size={22}
                color={hasLiked ? '#ef4444' : theme.text.tertiary}
              />
              <Text style={styles.detailEngagementText}>
                {formatCount(insight.likes)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.detailEngagementButton, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
              onPress={handleCommentPress}
            >
              <Ionicons
                name={(ICONS.commentOutline as any)}
                size={22}
                color={theme.text.tertiary}
              />
              <Text style={styles.detailEngagementText}>
                {formatCount(insight.commentsCount)}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handleBookmark}>
            <Ionicons
              name={(isBookmarked ? ICONS.bookmark : ICONS.bookmarkOutline) as any}
              size={22}
              color={isBookmarked ? theme.primary.main : theme.text.tertiary}
            />
          </TouchableOpacity>
        </View>

        {/* Comments Section */}
        {hasAccess && (
          <View style={styles.commentsSection}>
            <TouchableOpacity
              style={[styles.commentsSectionHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
              onPress={handleCommentPress}
            >
              <Text style={styles.commentsSectionTitle}>{t('insights.comments')}</Text>
              <View style={styles.commentsCountBadge}>
                <Text style={styles.commentsCountText}>
                  {insight.commentsCount}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Comments List */}
            <View style={styles.commentsList}>
              {commentsLoading && comments.length === 0 ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="small" color={theme.primary.main} />
                </View>
              ) : comments.length === 0 ? (
                <View style={styles.emptyCommentsContainer}>
                  <Ionicons
                    name="chatbubble-outline"
                    size={40}
                    color={theme.mode === 'dark' ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}
                  />
                  <Text style={styles.emptyCommentsText}>{t('insights.noComments')}</Text>
                </View>
              ) : (
                <>
                  {comments.map((comment) => (
                    <InsightCommentThread
                      key={comment._id}
                      comment={comment}
                      currentUserId={insight.author._id} // Assuming we want to show badges for author
                      onReply={handleReplyPress}
                      onUpdate={(id, updates) => refreshComments()}
                      onDelete={(id) => {
                        refreshComments();
                        updateInsightCommentsCount(-1);
                      }}
                    />
                  ))}

                  {hasMore && (
                    <TouchableOpacity
                      style={styles.loadMoreButton}
                      onPress={loadMore}
                      disabled={commentsLoading}
                    >
                      {commentsLoading ? (
                        <ActivityIndicator size="small" color={theme.primary.main} />
                      ) : (
                        <Text style={styles.loadMoreText}>{t('insights.loadMoreComments')}</Text>
                      )}
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Comment Input Stickey */}
      {hasAccess && (
        <View style={styles.commentInputContainer}>
          {replyingTo && (
            <View style={[styles.replyIndicator, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Text style={styles.replyIndicatorText}>
                {t('insights.replyingTo')} <Text style={styles.replyAuthorName}>{replyingTo.author.name}</Text>
              </Text>
              <TouchableOpacity onPress={handleCancelReply}>
                <Ionicons name="close-circle" size={18} color={theme.text.tertiary} />
              </TouchableOpacity>
            </View>
          )}
          <View style={[styles.commentInputWrapper, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <TextInput
              ref={inputRef}
              style={[
                styles.commentInputPlaceholder,
                {
                  flex: 1,
                  color: theme.text.primary,
                  textAlign: isRTL ? 'right' : 'left',
                  paddingVertical: 8
                }
              ]}
              placeholder={t('insights.addComment')}
              placeholderTextColor={theme.text.tertiary}
              value={commentText}
              onChangeText={setCommentText}
              multiline
            />
            <TouchableOpacity
              style={[styles.commentSendButton, { opacity: commentText.trim() ? 1 : 0.5 }]}
              onPress={handleSendComment}
              disabled={!commentText.trim() || createCommentLoading}
            >
              {createCommentLoading ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Ionicons name={isRTL ? "send" : "send"} size={18} color="#FFF" style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  detailContainer: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.text.primary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    borderWidth: 1,
    borderColor: theme.border.main,
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    borderWidth: 1,
    borderColor: theme.border.main,
  },
  detailContent: {
    flex: 1,
  },
  detailScrollContent: {
    paddingBottom: 140,
  },
  detailTitleSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 24,
  },
  detailCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  detailTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: theme.text.primary,
    lineHeight: 42,
    marginBottom: 20,
    letterSpacing: -0.8,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  detailMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  authorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: theme.border.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authorName: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.text.primary,
    marginBottom: 2,
  },
  detailTimestamp: {
    fontSize: 13,
    color: theme.text.tertiary,
    fontWeight: '500',
  },
  readTime: {
    fontSize: 13,
    color: theme.text.tertiary,
    fontWeight: '500',
  },
  detailImageContainer: {
    width: '100%',
    height: 280,
    marginBottom: 30,
    backgroundColor: theme.background.secondary,
  },
  detailImage: {
    width: '100%',
    height: '100%',
  },
  glassContent: {
    marginHorizontal: 16,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : theme.border.main,
    marginBottom: 32,
    backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#FFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  detailBody: {
    padding: 24,
  },
  detailText: {
    fontSize: 18,
    color: theme.text.secondary,
    lineHeight: 30,
    fontWeight: '400',
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  lockedOverlay: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40,
  },
  lockedContent: {
    alignItems: 'center',
    paddingHorizontal: 32,
    zIndex: 5,
  },
  lockCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  lockedTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: theme.text.primary,
    marginBottom: 12,
  },
  lockedMessage: {
    fontSize: 16,
    color: theme.text.tertiary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  upgradeButton: {
    width: '100%',
    height: 60,
    borderRadius: 18,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  upgradeButtonText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFF',
    zIndex: 1,
  },
  detailEngagement: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 18,
    backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border.main,
    marginHorizontal: 16,
    marginBottom: 40,
  },
  detailEngagementButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 28,
  },
  detailEngagementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailEngagementText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.text.secondary,
  },
  commentsSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  commentsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 28,
  },
  commentsSectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: theme.text.primary,
  },
  commentsCountBadge: {
    backgroundColor: theme.primary.main + '20',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  commentsCountText: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.primary.main,
  },
  commentsList: {
    gap: 32,
  },
  commentItem: {
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    gap: 16,
  },
  commentAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: theme.border.main,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background.secondary,
  },
  commentMain: {
    flex: 1,
  },
  commentAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  commentAuthor: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.text.primary,
  },
  commentTimestamp: {
    fontSize: 12,
    color: theme.text.tertiary,
    fontWeight: '500',
  },
  commentContent: {
    fontSize: 15,
    color: theme.text.secondary,
    lineHeight: 22,
    marginBottom: 10,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  commentActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  commentActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.text.tertiary,
  },
  commentDeleted: {
    fontSize: 14,
    color: theme.text.tertiary,
    fontStyle: 'italic',
  },
  loadMoreButton: {
    paddingVertical: 16,
    marginVertical: 10,
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
  },
  loadMoreText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.primary.main,
  },
  loaderContainer: {
    paddingVertical: 32,
  },
  emptyCommentsContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 16,
    backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)',
    borderRadius: 24,
    marginHorizontal: 10,
  },
  emptyCommentsText: {
    fontSize: 15,
    color: theme.text.tertiary,
    fontWeight: '600',
  },
  commentInputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    paddingTop: 16,
    backgroundColor: theme.background.primary,
    borderTopWidth: 1,
    borderColor: theme.border.main,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  commentInputWrapper: {
    minHeight: 56,
    backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
    borderRadius: 28,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.border.main,
  },
  commentInputPlaceholder: {
    fontSize: 16,
    color: theme.text.primary,
    fontWeight: '500',
  },
  commentSendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: theme.text.tertiary,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 20,
  },
  errorText: {
    fontSize: 16,
    color: theme.text.secondary,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: theme.primary.main,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  replyIndicator: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 12,
    backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.border.main,
  },
  replyIndicatorText: {
    fontSize: 13,
    color: theme.text.secondary,
    fontWeight: '500',
  },
  replyAuthorName: {
    fontWeight: '700',
    color: theme.primary.main,
  },
});
