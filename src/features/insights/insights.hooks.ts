/**
 * Insights Hooks
 * Custom hooks for insights and comments data fetching and state management
 */

import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import * as insightsApi from './insights.api';
import { MESSAGES, PAGINATION } from './insights.constants';
import type {
  Insight,
  InsightListItem,
  InsightComment,
  InsightsQueryParams,
  InsightCommentsQueryParams,
  CreateInsightCommentPayload,
  UpdateInsightCommentPayload,
  ReplyToInsightCommentPayload,
  FlagInsightCommentPayload,
} from './insights.types';

/**
 * Hook for fetching and managing insights list
 */
export const useInsights = (initialParams: InsightsQueryParams = {}) => {
  const [insights, setInsights] = useState<InsightListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const fetchInsights = useCallback(async (params: InsightsQueryParams = {}, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
        setPage(1);
      } else {
        setLoading(true);
      }

      setError(null);

      const currentPage = isRefresh ? 1 : params.page || page;
      const response = await insightsApi.getPublishedInsights({
        ...initialParams,
        ...params,
        page: currentPage,
      });

      if (response.success) {
        const newInsights = response.data.insights;

        if (isRefresh) {
          setInsights(newInsights);
        } else {
          setInsights(prev => currentPage === 1 ? newInsights : [...prev, ...newInsights]);
        }

        setHasMore(response.data.page < response.data.totalPages);
        setPage(currentPage);
      } else {
        setError(MESSAGES.LOAD_INSIGHTS_ERROR);
      }
    } catch (err: any) {
      console.error('Error fetching insights:', err);
      setError(err.message || MESSAGES.LOAD_INSIGHTS_ERROR);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [initialParams, page]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchInsights({ page: page + 1 });
    }
  }, [loading, hasMore, page, fetchInsights]);

  const refresh = useCallback((params: InsightsQueryParams = {}) => {
    fetchInsights(params, true);
  }, [fetchInsights]);

  const updateInsightInList = useCallback((insightId: string, updates: Partial<InsightListItem>) => {
    setInsights(prev =>
      prev.map(insight =>
        insight._id === insightId ? { ...insight, ...updates } : insight
      )
    );
  }, []);

  useEffect(() => {
    fetchInsights();
  }, []);

  return {
    insights,
    loading,
    refreshing,
    error,
    hasMore,
    refresh,
    loadMore,
    updateInsightInList,
  };
};

/**
 * Hook for fetching single insight detail
 */
export const useInsightDetail = (insightId: string) => {
  const [insight, setInsight] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLiked, setHasLiked] = useState(false);

  const fetchInsight = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await insightsApi.getInsightById(insightId);

      if (response.success) {
        setInsight(response.data.insight);
        setHasLiked(response.data.hasLiked || false);
      } else {
        setError('Failed to load insight');
      }
    } catch (err: any) {
      console.error('Error fetching insight:', err);
      setError(err.message || 'Failed to load insight');
    } finally {
      setLoading(false);
    }
  }, [insightId]);

  const toggleLike = useCallback(async () => {
    if (!insight) return;

    // Optimistic update
    const previousLiked = hasLiked;
    const previousLikes = insight.likes;

    setHasLiked(!hasLiked);
    setInsight(prev => prev ? {
      ...prev,
      likes: hasLiked ? prev.likes - 1 : prev.likes + 1
    } : null);

    try {
      const response = await insightsApi.toggleLikeInsight(insightId);

      if (response.success) {
        setHasLiked(response.data.liked);
        setInsight(prev => prev ? {
          ...prev,
          likes: response.data.likes
        } : null);
      } else {
        // Rollback on error
        setHasLiked(previousLiked);
        setInsight(prev => prev ? { ...prev, likes: previousLikes } : null);
      }
    } catch (err) {
      // Rollback on error
      setHasLiked(previousLiked);
      setInsight(prev => prev ? { ...prev, likes: previousLikes } : null);
      Alert.alert('Error', MESSAGES.LIKE_ERROR);
    }
  }, [insight, hasLiked, insightId]);

  const updateInsightCommentsCount = useCallback((delta: number) => {
    setInsight(prev => prev ? {
      ...prev,
      commentsCount: Math.max(0, prev.commentsCount + delta)
    } : null);
  }, []);

  useEffect(() => {
    fetchInsight();
  }, [fetchInsight]);

  return {
    insight,
    loading,
    error,
    hasLiked,
    toggleLike,
    updateInsightCommentsCount,
    refresh: fetchInsight,
  };
};

/**
 * Hook for fetching and managing comments for an insight
 */
export const useInsightComments = (insightId: string, initialParams: InsightCommentsQueryParams = {}) => {
  const [comments, setInsightComments] = useState<InsightComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const fetchInsightComments = useCallback(async (params: InsightCommentsQueryParams = {}, reset = false) => {
    try {
      setLoading(true);
      setError(null);

      const currentPage = reset ? 1 : params.page || page;
      const response = await insightsApi.getInsightCommentsForInsight(insightId, {
        ...initialParams,
        ...params,
        page: currentPage,
      });

      if (response.success) {
        const newInsightComments = response.data.comments;

        if (reset) {
          setInsightComments(newInsightComments);
          setPage(1);
        } else {
          setInsightComments(prev => currentPage === 1 ? newInsightComments : [...prev, ...newInsightComments]);
          setPage(currentPage);
        }

        setHasMore(response.data.page < response.data.totalPages);
      } else {
        setError(MESSAGES.LOAD_COMMENTS_ERROR);
      }
    } catch (err: any) {
      console.error('Error fetching comments:', err);
      setError(err.message || MESSAGES.LOAD_COMMENTS_ERROR);
    } finally {
      setLoading(false);
    }
  }, [insightId, initialParams, page]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchInsightComments({ page: page + 1 });
    }
  }, [loading, hasMore, page, fetchInsightComments]);

  const addInsightComment = useCallback((comment: InsightComment) => {
    setInsightComments(prev => [comment, ...prev]);
  }, []);

  const updateInsightComment = useCallback((commentId: string, updates: Partial<InsightComment>) => {
    setInsightComments(prev =>
      prev.map(comment =>
        comment._id === commentId ? { ...comment, ...updates } : comment
      )
    );
  }, []);

  const removeInsightComment = useCallback((commentId: string) => {
    setInsightComments(prev => prev.filter(comment => comment._id !== commentId));
  }, []);

  useEffect(() => {
    fetchInsightComments();
  }, []);

  return {
    comments,
    loading,
    error,
    hasMore,
    loadMore,
    refresh: () => fetchInsightComments({}, true),
    addInsightComment,
    updateInsightComment,
    removeInsightComment,
  };
};

/**
 * Hook for fetching replies for a comment
 */
export const useReplies = (commentId: string) => {
  const [replies, setReplies] = useState<InsightComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);

  const fetchReplies = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      setError(null);

      const currentPage = reset ? 1 : page;
      const response = await insightsApi.getRepliesForInsightComment(commentId, {
        page: currentPage,
      });

      if (response.success) {
        const newReplies = response.data.replies;

        if (reset) {
          setReplies(newReplies);
          setPage(1);
        } else {
          setReplies(prev => [...prev, ...newReplies]);
          setPage(currentPage);
        }

        setHasMore(response.data.page < response.data.totalPages);
        setIsExpanded(true);
      } else {
        setError(MESSAGES.LOAD_COMMENTS_ERROR);
      }
    } catch (err: any) {
      console.error('Error fetching replies:', err);
      setError(err.message || MESSAGES.LOAD_COMMENTS_ERROR);
    } finally {
      setLoading(false);
    }
  }, [commentId, page]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchReplies();
    }
  }, [loading, hasMore, fetchReplies]);

  const toggleExpanded = useCallback(() => {
    if (!isExpanded && replies.length === 0) {
      fetchReplies(true);
    } else {
      setIsExpanded(!isExpanded);
    }
  }, [isExpanded, replies.length, fetchReplies]);

  const addReply = useCallback((reply: InsightComment) => {
    setReplies(prev => [...prev, reply]);
    setIsExpanded(true);
  }, []);

  const updateReply = useCallback((replyId: string, updates: Partial<InsightComment>) => {
    setReplies(prev =>
      prev.map(reply =>
        reply._id === replyId ? { ...reply, ...updates } : reply
      )
    );
  }, []);

  return {
    replies,
    loading,
    error,
    hasMore,
    isExpanded,
    loadMore,
    toggleExpanded,
    addReply,
    updateReply,
  };
};

/**
 * Hook for creating comments with optimistic updates
 */
export const useCreateInsightComment = (insightId: string, onSuccess?: (comment: InsightComment) => void) => {
  const [loading, setLoading] = useState(false);

  const createInsightComment = useCallback(async (payload: CreateInsightCommentPayload) => {
    try {
      setLoading(true);

      const response = await insightsApi.createInsightComment(insightId, payload);

      if (response.success) {
        onSuccess?.(response.data.comment);
        return response.data.comment;
      } else {
        Alert.alert('Error', response.message || MESSAGES.CREATE_COMMENT_ERROR);
        return null;
      }
    } catch (err: any) {
      console.error('Error creating comment:', err);
      Alert.alert('Error', err.message || MESSAGES.CREATE_COMMENT_ERROR);
      return null;
    } finally {
      setLoading(false);
    }
  }, [insightId, onSuccess]);

  return { createInsightComment, loading };
};

/**
 * Hook for replying to comments
 */
export const useReplyToInsightComment = (commentId: string, onSuccess?: (reply: InsightComment) => void) => {
  const [loading, setLoading] = useState(false);

  const replyToInsightComment = useCallback(async (payload: ReplyToInsightCommentPayload) => {
    try {
      setLoading(true);

      const response = await insightsApi.replyToInsightComment(commentId, payload);

      if (response.success) {
        onSuccess?.(response.data.comment);
        return response.data.comment;
      } else {
        Alert.alert('Error', response.message || MESSAGES.CREATE_COMMENT_ERROR);
        return null;
      }
    } catch (err: any) {
      console.error('Error replying to comment:', err);
      Alert.alert('Error', err.message || MESSAGES.CREATE_COMMENT_ERROR);
      return null;
    } finally {
      setLoading(false);
    }
  }, [commentId, onSuccess]);

  return { replyToInsightComment, loading };
};

/**
 * Hook for liking comments with optimistic updates
 */
export const useLikeInsightComment = () => {
  const [loading, setLoading] = useState(false);

  const toggleLike = useCallback(async (
    commentId: string,
    currentLiked: boolean,
    currentLikes: number,
    onOptimisticUpdate: (liked: boolean, likes: number) => void
  ) => {
    // Optimistic update
    const newLiked = !currentLiked;
    const newLikes = newLiked ? currentLikes + 1 : currentLikes - 1;
    onOptimisticUpdate(newLiked, newLikes);

    try {
      setLoading(true);

      const response = await insightsApi.toggleLikeInsightComment(commentId);

      if (response.success) {
        // Update with actual values from server
        onOptimisticUpdate(response.data.liked, response.data.likes);
      } else {
        // Rollback on error
        onOptimisticUpdate(currentLiked, currentLikes);
      }
    } catch (err) {
      // Rollback on error
      onOptimisticUpdate(currentLiked, currentLikes);
      console.error('Error liking comment:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { toggleLike, loading };
};

/**
 * Hook for deleting comments
 */
export const useDeleteInsightComment = (onSuccess?: () => void) => {
  const [loading, setLoading] = useState(false);

  const deleteInsightComment = useCallback(async (commentId: string) => {
    try {
      setLoading(true);

      const response = await insightsApi.deleteInsightComment(commentId);

      if (response.success) {
        Alert.alert('Success', MESSAGES.COMMENT_DELETED);
        onSuccess?.();
        return true;
      } else {
        Alert.alert('Error', response.message || MESSAGES.DELETE_COMMENT_ERROR);
        return false;
      }
    } catch (err: any) {
      console.error('Error deleting comment:', err);
      Alert.alert('Error', err.message || MESSAGES.DELETE_COMMENT_ERROR);
      return false;
    } finally {
      setLoading(false);
    }
  }, [onSuccess]);

  return { deleteInsightComment, loading };
};

/**
 * Hook for updating comments
 */
export const useUpdateInsightComment = (onSuccess?: (comment: InsightComment) => void) => {
  const [loading, setLoading] = useState(false);

  const updateInsightComment = useCallback(async (commentId: string, payload: UpdateInsightCommentPayload) => {
    try {
      setLoading(true);

      const response = await insightsApi.updateInsightComment(commentId, payload);

      if (response.success) {
        Alert.alert('Success', MESSAGES.COMMENT_UPDATED);
        onSuccess?.(response.data.comment);
        return response.data.comment;
      } else {
        Alert.alert('Error', response.message || MESSAGES.UPDATE_COMMENT_ERROR);
        return null;
      }
    } catch (err: any) {
      console.error('Error updating comment:', err);
      Alert.alert('Error', err.message || MESSAGES.UPDATE_COMMENT_ERROR);
      return null;
    } finally {
      setLoading(false);
    }
  }, [onSuccess]);

  return { updateInsightComment, loading };
};

/**
 * Hook for flagging comments
 */
export const useFlagInsightComment = () => {
  const [loading, setLoading] = useState(false);

  const flagInsightComment = useCallback(async (commentId: string, payload: FlagInsightCommentPayload) => {
    try {
      setLoading(true);

      const response = await insightsApi.flagInsightComment(commentId, payload);

      if (response.success) {
        Alert.alert('Success', MESSAGES.COMMENT_FLAGGED);
        return true;
      } else {
        Alert.alert('Error', response.message || 'Failed to report comment');
        return false;
      }
    } catch (err: any) {
      console.error('Error flagging comment:', err);
      Alert.alert('Error', err.message || 'Failed to report comment');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { flagInsightComment, loading };
};

/**
 * Hook for reporting content (insight or comment)
 */
export const useReport = () => {
  const [loading, setLoading] = useState(false);

  const reportContent = useCallback(async (payload: {
    targetType: 'insight' | 'comment';
    targetId: string;
    reason: string;
    description?: string;
  }) => {
    try {
      setLoading(true);

      const response = await insightsApi.createReport(payload);

      if (response.success) {
        Alert.alert('Report Submitted', 'Thank you for your report. Our moderators will review it shortly.');
        return true;
      } else {
        Alert.alert('Error', response.message || 'Failed to submit report');
        return false;
      }
    } catch (err: any) {
      console.error('Error reporting content:', err);
      Alert.alert('Error', err.message || 'Failed to submit report');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { reportContent, loading };
};
