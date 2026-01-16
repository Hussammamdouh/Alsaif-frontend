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
  useReport,
  useDeleteInsightComment,
  useLikeInsightComment
} from './insights.hooks';
import { InsightCommentThread } from './CommentThread';
import { useSubscriptionAccess } from '../subscription';
import { createInsightsStyles } from './insights.styles';
import { ICONS, MESSAGES, COLORS } from './insights.constants';
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
  const { t, isRTL } = useLocalization();
  const styles = useMemo(() => createInsightsStyles(theme), [theme]);
  const inputRef = useRef<TextInput>(null);

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
  });

  const { deleteInsightComment } = useDeleteInsightComment();
  const { reportContent } = useReport();

  const handleRefresh = useCallback(async () => {
    await Promise.all([refreshInsight(), refreshComments()]);
  }, [refreshInsight, refreshComments]);

  const handleSendComment = useCallback(async () => {
    if (!commentText.trim()) return;

    try {
      if (replyingTo) {
        // useReplyToInsightComment hook logic is a bit different, it needs a parentId
        // but it's initialized with commentId. This hook usage might need care.
        // Let's use the API directly for simple logic if hook is too specific.
        // Actually, let's keep it simple for now and fix hook usage if it errors.
        Alert.alert('Reply feature coming soon');
      } else {
        await createInsightComment({
          content: commentText.trim(),
        });
      }
      setCommentText('');
    } catch (error) {
      console.error('Error sending comment:', error);
    }
  }, [commentText, replyingTo, createInsightComment]);

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

  const handleReport = useCallback((type: 'insight' | 'comment', id: string) => {
    Alert.alert(
      t('common.report'),
      t('insights.confirmReport'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.report'),
          style: 'destructive',
          onPress: async () => {
            try {
              await reportContent({
                targetType: type,
                targetId: id,
                reason: 'inappropriate', // Default reason
              });
            } catch (error) {
              console.error('Report error:', error);
            }
          },
        },
      ]
    );
  }, [reportContent, t]);

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

  const categoryInfo = getCategoryInfo(insight.category);
  const canAccess = canAccessInsight(insight.type);

  return (
    <View style={styles.detailContainer}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <LinearGradient
        colors={isDark ? [theme.background.primary, '#1a2e1a', '#0a1a0a'] : ['#FFFFFF', '#FFFFFF', '#FFFFFF']}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.detailHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name={isRTL ? "chevron-forward" : "chevron-back"} size={24} color={theme.text.primary} />
        </TouchableOpacity>

        <Text style={styles.headerTitleDetail} numberOfLines={1}>
          {insight.title}
        </Text>

        <TouchableOpacity
          style={styles.shareButton}
          onPress={handleShare}
        >
          <Ionicons name="share-outline" size={22} color={theme.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.detailContent}
        contentContainerStyle={styles.detailScrollContent}
        refreshControl={
          <RefreshControl
            refreshing={insightLoading && !!insight}
            onRefresh={handleRefresh}
            tintColor={theme.primary.main}
          />
        }
      >
        {/* Title Section */}
        <View style={styles.detailTitleSection}>
          <View style={[styles.typeBadge, { backgroundColor: insight.type === 'premium' ? COLORS.premium : COLORS.free, alignSelf: 'flex-start', marginBottom: 16 }]}>
            <Ionicons name={insight.type === 'premium' ? "star" : "lock-open-outline"} size={12} color="#FFF" style={{ marginRight: 4 }} />
            <Text style={styles.typeBadgeText}>
              {t(`insights.types.${insight.type}`)}
            </Text>
          </View>

          <Text style={styles.detailTitle}>{insight.title}</Text>

          <View style={styles.detailMeta}>
            <View style={styles.authorInfo}>
              <View style={styles.authorAvatar}>
                <Ionicons name="person" size={24} color={theme.text.tertiary} />
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

        {/* Featured Image */}
        {insight.coverImage && (
          <View style={styles.detailImageContainer}>
            <Image
              source={{ uri: insight.coverImage }}
              style={styles.detailImage}
              resizeMode="cover"
            />
          </View>
        )}

        {/* Content Card */}
        <View style={styles.detailBodyContainer}>
          <LinearGradient
            colors={isDark
              ? ['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.02)']
              : ['rgba(0, 0, 0, 0.03)', 'rgba(0, 0, 0, 0.01)']
            }
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.detailBody}>
            <Text style={styles.detailText}>
              {canAccess ? insight.content : insight.excerpt}
            </Text>
          </View>

          {!canAccess && (
            <LinearGradient
              colors={['transparent', isDark ? 'rgba(10, 26, 10, 0.8)' : 'rgba(255, 255, 255, 0.9)', isDark ? '#0a1a0a' : '#FFFFFF']}
              style={styles.lockedOverlay}
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

        {/* Engagement Summary */}
        <View style={styles.detailEngagement}>
          <LinearGradient
            colors={isDark
              ? ['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.02)']
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
                size={22}
                color={insightHasLiked ? COLORS.liked : theme.text.secondary}
              />
              <Text style={styles.detailEngagementText}>{formatCount(insight.likes)}</Text>
            </TouchableOpacity>

            <View style={styles.detailEngagementButton}>
              <Ionicons name="chatbubble-outline" size={20} color={theme.text.secondary} />
              <Text style={styles.detailEngagementText}>{formatCount(insight.commentsCount)}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.detailEngagementButton}
            onPress={() => setIsBookmarked(!isBookmarked)}
          >
            <Ionicons
              name={isBookmarked ? "bookmark" : "bookmark-outline"}
              size={22}
              color={isBookmarked ? theme.primary.main : theme.text.secondary}
            />
          </TouchableOpacity>
        </View>

        {/* Comments List */}
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
      </ScrollView>

      {/* Comment Input Sticky */}
      <View style={[styles.commentInputContainer, { bottom: 0 }]}>
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
            {createCommentLoading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Ionicons name={isRTL ? "send" : "send"} size={18} color="#FFF" style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
