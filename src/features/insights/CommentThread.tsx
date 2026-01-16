/**
 * InsightCommentThread
 * Threaded comment display with nested replies
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  ActivityIndicator,
  TouchableOpacity,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createInsightsStyles } from './insights.styles';
import { useTheme } from '../../app/providers/ThemeProvider';
import { InsightCommentItem } from './CommentItem';
import { useReplies } from './insights.hooks';
import { COLORS, LIMITS } from './insights.constants';
import { canReplyToInsightComment } from './insights.utils';
import type { InsightComment } from './insights.types';

interface InsightCommentThreadProps {
  comment: InsightComment;
  currentUserId?: string;
  onReply?: (parentInsightComment: InsightComment) => void;
  onUpdate?: (commentId: string, updates: Partial<InsightComment>) => void;
  onDelete?: (commentId: string) => void;
}

export const InsightCommentThread: React.FC<InsightCommentThreadProps> = ({
  comment,
  currentUserId,
  onReply,
  onUpdate,
  onDelete,
}) => {
  const { theme } = useTheme();
  const styles = React.useMemo(() => createInsightsStyles(theme), [theme]);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());

  const {
    replies,
    loading,
    hasMore,
    isExpanded,
    loadMore,
    toggleExpanded,
    addReply,
    updateReply,
  } = useReplies(comment._id);

  const handleToggleReplies = useCallback(() => {
    toggleExpanded();
  }, [toggleExpanded]);

  const handleUpdate = useCallback(
    (commentId: string, updates: Partial<InsightComment>) => {
      // Update reply in local state
      updateReply(commentId, updates);
      // Propagate to parent
      onUpdate?.(commentId, updates);
    },
    [updateReply, onUpdate]
  );

  const handleDelete = useCallback(
    (commentId: string) => {
      // Update comment count on parent comment
      onUpdate?.(comment._id, {
        replyCount: Math.max(0, comment.replyCount - 1),
      });
      // Propagate to parent
      onDelete?.(commentId);
    },
    [comment._id, comment.replyCount, onUpdate, onDelete]
  );

  const handleReplyToReply = useCallback(
    (replyInsightComment: InsightComment) => {
      onReply?.(replyInsightComment);
    },
    [onReply]
  );

  return (
    <View>
      {/* Main InsightComment */}
      <InsightCommentItem
        comment={comment}
        currentUserId={currentUserId}
        onReply={onReply}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onToggleReplies={comment.replyCount > 0 ? handleToggleReplies : undefined}
        repliesExpanded={isExpanded}
        showReplyButton={canReplyToInsightComment(comment.level, LIMITS.MAX_REPLY_DEPTH)}
      />

      {/* Nested Replies */}
      {isExpanded && (
        <View style={styles.repliesContainer}>
          {loading && replies.length === 0 ? (
            <View style={[styles.loadingContainer, { paddingVertical: 20 }]}>
              <ActivityIndicator size="small" color={theme.primary.main} />
            </View>
          ) : (
            <>
              {replies.map((reply) => (
                <InsightCommentThreadReply
                  key={reply._id}
                  comment={reply}
                  currentUserId={currentUserId}
                  onReply={handleReplyToReply}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              ))}

              {/* Load More Replies */}
              {hasMore && (
                <TouchableOpacity
                  style={[styles.viewRepliesButton, { paddingVertical: 12 }]}
                  onPress={loadMore}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={theme.primary.main} />
                  ) : (
                    <>
                      <Ionicons name="chevron-down" size={16} color={theme.primary.main} />
                      <Text style={[styles.viewRepliesText, { color: theme.primary.main }]}>Load more replies</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      )}
    </View>
  );
};

/**
 * InsightCommentThreadReply
 * Handles nested reply rendering (supports up to max depth)
 */
interface InsightCommentThreadReplyProps {
  comment: InsightComment;
  currentUserId?: string;
  onReply?: (comment: InsightComment) => void;
  onUpdate?: (commentId: string, updates: Partial<InsightComment>) => void;
  onDelete?: (commentId: string) => void;
}

const InsightCommentThreadReply: React.FC<InsightCommentThreadReplyProps> = ({
  comment,
  currentUserId,
  onReply,
  onUpdate,
  onDelete,
}) => {
  const { theme } = useTheme();
  const styles = React.useMemo(() => createInsightsStyles(theme), [theme]);
  const {
    replies,
    loading,
    hasMore,
    isExpanded,
    loadMore,
    toggleExpanded,
    updateReply,
  } = useReplies(comment._id);

  const handleToggleReplies = useCallback(() => {
    toggleExpanded();
  }, [toggleExpanded]);

  const handleUpdate = useCallback(
    (commentId: string, updates: Partial<InsightComment>) => {
      // Update reply in local state
      updateReply(commentId, updates);
      // Propagate to parent
      onUpdate?.(commentId, updates);
    },
    [updateReply, onUpdate]
  );

  const handleDelete = useCallback(
    (commentId: string) => {
      // Update comment count on parent comment
      onUpdate?.(comment._id, {
        replyCount: Math.max(0, comment.replyCount - 1),
      });
      // Propagate to parent
      onDelete?.(commentId);
    },
    [comment._id, comment.replyCount, onUpdate, onDelete]
  );

  const canHaveReplies = canReplyToInsightComment(comment.level, LIMITS.MAX_REPLY_DEPTH);

  return (
    <View style={styles.replyItem}>
      {/* Reply InsightComment */}
      <InsightCommentItem
        comment={comment}
        currentUserId={currentUserId}
        onReply={canHaveReplies ? onReply : undefined}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onToggleReplies={
          comment.replyCount > 0 && canHaveReplies ? handleToggleReplies : undefined
        }
        repliesExpanded={isExpanded}
        showReplyButton={canHaveReplies}
      />

      {/* Nested Replies (recursive) */}
      {isExpanded && canHaveReplies && (
        <View style={styles.repliesContainer}>
          {loading && replies.length === 0 ? (
            <View style={[styles.loadingContainer, { paddingVertical: 20 }]}>
              <ActivityIndicator size="small" color="#6366f1" />
            </View>
          ) : (
            <>
              {replies.map((nestedReply) => (
                <InsightCommentThreadReply
                  key={nestedReply._id}
                  comment={nestedReply}
                  currentUserId={currentUserId}
                  onReply={onReply}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              ))}

              {/* Load More Nested Replies */}
              {hasMore && (
                <TouchableOpacity
                  style={[styles.viewRepliesButton, { paddingVertical: 12 }]}
                  onPress={loadMore}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={theme.primary.main} />
                  ) : (
                    <>
                      <Ionicons name="chevron-down" size={16} color={theme.primary.main} />
                      <Text style={[styles.viewRepliesText, { color: theme.primary.main }]}>Load more replies</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      )}
    </View>
  );
};
