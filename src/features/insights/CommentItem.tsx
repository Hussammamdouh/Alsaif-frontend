/**
 * InsightCommentItem
 * Individual comment display with engagement actions
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ActionSheetIOS,
  Platform,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { insightsStyles as styles } from './insights.styles';
import {
  useLikeInsightComment,
  useDeleteInsightComment,
  useUpdateInsightComment,
  useReport
} from './insights.hooks';
import { COLORS, ICONS, LIMITS } from './insights.constants';
import { useLocalization } from '../../app/providers/LocalizationProvider';
import {
  formatTimeAgo,
  formatCount,
  canReplyToInsightComment,
  validateInsightComment,
} from './insights.utils';
import type { InsightComment } from './insights.types';

interface InsightCommentItemProps {
  comment: InsightComment;
  currentUserId?: string;
  onReply?: (comment: InsightComment) => void;
  onUpdate?: (commentId: string, updates: Partial<InsightComment>) => void;
  onDelete?: (commentId: string) => void;
  onToggleReplies?: (commentId: string) => void;
  repliesExpanded?: boolean;
  showReplyButton?: boolean;
}

export const InsightCommentItem: React.FC<InsightCommentItemProps> = ({
  comment,
  currentUserId,
  onReply,
  onUpdate,
  onDelete,
  onToggleReplies,
  repliesExpanded = false,
  showReplyButton = true,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [localLiked, setLocalLiked] = useState(comment.hasLiked || false);
  const [localLikes, setLocalLikes] = useState(comment.likes);
  const { t } = useLocalization();

  const { toggleLike, loading: likingInsightComment } = useLikeInsightComment();
  const { deleteInsightComment, loading: deletingInsightComment } = useDeleteInsightComment(() => {
    onDelete?.(comment._id);
  });
  const { updateInsightComment, loading: updatingInsightComment } = useUpdateInsightComment(
    (updatedInsightComment) => {
      onUpdate?.(comment._id, updatedInsightComment);
      setIsEditing(false);
    }
  );

  const isOwnInsightComment = currentUserId && comment.author._id === currentUserId;
  const canReply = showReplyButton && canReplyToInsightComment(comment.level, LIMITS.MAX_REPLY_DEPTH);

  const handleLike = async () => {
    await toggleLike(
      comment._id,
      localLiked,
      localLikes,
      (liked, likes) => {
        setLocalLiked(liked);
        setLocalLikes(likes);
        onUpdate?.(comment._id, { hasLiked: liked, likes });
      }
    );
  };

  const handleReply = () => {
    if (!canReply) {
      Alert.alert('Notice', 'Maximum reply depth reached');
      return;
    }
    onReply?.(comment);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(comment.content);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(comment.content);
  };

  const handleSaveEdit = async () => {
    const validation = validateInsightComment(editContent);
    if (!validation.valid) {
      Alert.alert('Invalid InsightComment', validation.error);
      return;
    }

    await updateInsightComment(comment._id, { content: editContent });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete InsightComment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteInsightComment(comment._id);
          },
        },
      ]
    );
  };

  const handleFlag = () => {
    Alert.alert(
      'Report InsightComment',
      'Why are you reporting this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Spam',
          onPress: () => submitFlag('spam'),
        },
        {
          text: 'Harassment',
          onPress: () => submitFlag('harassment'),
        },
        {
          text: 'Inappropriate',
          onPress: () => submitFlag('inappropriate_content'),
        },
        {
          text: 'Other',
          onPress: () => submitFlag('other'),
        },
      ]
    );
  };

  const { reportContent, loading: reporting } = useReport();

  const submitFlag = async (reason: string) => {
    if (reporting) return;
    await reportContent({
      targetType: 'comment',
      targetId: comment._id,
      reason,
    });
  };

  const handleMoreOptions = () => {
    const options = isOwnInsightComment
      ? ['Edit', 'Delete', 'Cancel']
      : ['Report', 'Cancel'];
    const destructiveButtonIndex = isOwnInsightComment ? 1 : undefined;
    const cancelButtonIndex = options.length - 1;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          destructiveButtonIndex,
          cancelButtonIndex,
        },
        (buttonIndex) => {
          if (isOwnInsightComment) {
            if (buttonIndex === 0) handleEdit();
            if (buttonIndex === 1) handleDelete();
          } else {
            if (buttonIndex === 0) handleFlag();
          }
        }
      );
    } else {
      // Android: Show alert with options
      const actions = isOwnInsightComment
        ? [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Edit', onPress: handleEdit },
          { text: 'Delete', onPress: handleDelete, style: 'destructive' },
        ]
        : [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Report', onPress: handleFlag },
        ];

      Alert.alert('InsightComment Options', undefined, actions as any);
    }
  };

  if (comment.isDeleted) {
    return (
      <View style={styles.commentItem}>
        <View style={styles.commentHeader}>
          <View style={styles.commentAvatar} />
          <View style={styles.commentMain}>
            <Text style={styles.commentDeleted}>[deleted]</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.commentItem}>
      <View style={styles.commentHeader}>
        {/* Avatar */}
        {comment.author.avatar ? (
          <Image
            source={{ uri: comment.author.avatar }}
            style={styles.commentAvatar}
          />
        ) : (
          <View style={styles.commentAvatar} />
        )}

        <View style={styles.commentMain}>
          {/* Author and Timestamp */}
          <View style={styles.commentAuthorRow}>
            <Text style={styles.commentAuthor}>{comment.author.name}</Text>
            <Text style={styles.commentTimestamp}>
              {formatTimeAgo(comment.createdAt, t)}
            </Text>
          </View>

          {/* InsightComment Content */}
          {isEditing ? (
            <View>
              <TextInput
                style={[styles.commentContent, { borderWidth: 1, borderColor: '#e0e0e0', padding: 8, borderRadius: 8, color: COLORS.text.primary }]}
                onChangeText={setEditContent}
                value={editContent}
                multiline
              />
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                <TouchableOpacity
                  style={[styles.sendButton, { width: 'auto', paddingHorizontal: 16 }]}
                  onPress={handleSaveEdit}
                  disabled={updatingInsightComment}
                >
                  <Text style={styles.upgradeButtonText}>
                    {updatingInsightComment ? 'Saving...' : 'Save'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.sendButton, styles.sendButtonDisabled, { width: 'auto', paddingHorizontal: 16 }]}
                  onPress={handleCancelEdit}
                  disabled={updatingInsightComment}
                >
                  <Text style={styles.commentActionText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <Text style={styles.commentContent}>{comment.content}</Text>
              {comment.isEdited && (
                <Text style={styles.commentEdited}>(edited)</Text>
              )}

              {/* Actions */}
              <View style={styles.commentActions}>
                {/* Like */}
                <TouchableOpacity
                  style={styles.commentActionButton}
                  onPress={handleLike}
                  disabled={likingInsightComment}
                >
                  <Ionicons
                    name={(localLiked ? ICONS.like : ICONS.likeOutline) as any}
                    size={16}
                    color={localLiked ? COLORS.liked : COLORS.text.secondary}
                  />
                  <Text style={styles.commentActionText}>
                    {localLikes > 0 ? formatCount(localLikes) : 'Like'}
                  </Text>
                </TouchableOpacity>

                {/* Reply */}
                {canReply && (
                  <TouchableOpacity
                    style={styles.commentActionButton}
                    onPress={handleReply}
                  >
                    <Text style={styles.commentActionText}>Reply</Text>
                  </TouchableOpacity>
                )}

                {/* More Options */}
                <TouchableOpacity
                  style={styles.commentActionButton}
                  onPress={handleMoreOptions}
                >
                  <Ionicons
                    name={ICONS.more as any}
                    size={16}
                    color={COLORS.text.secondary}
                  />
                </TouchableOpacity>
              </View>
            </>
          )}

          {/* View Replies Button */}
          {comment.replyCount > 0 && onToggleReplies && (
            <TouchableOpacity
              style={styles.viewRepliesButton}
              onPress={() => onToggleReplies(comment._id)}
            >
              <Ionicons
                name={repliesExpanded ? 'chevron-up' : 'chevron-down'}
                size={16}
                color="#007aff"
              />
              <Text style={styles.viewRepliesText}>
                {repliesExpanded ? 'Hide' : 'View'} {comment.replyCount}{' '}
                {comment.replyCount === 1 ? 'reply' : 'replies'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};
