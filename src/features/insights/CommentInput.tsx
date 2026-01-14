/**
 * CommentInput
 * Text input component for creating and editing comments
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { insightsStyles as styles } from './insights.styles';
import { COLORS, LIMITS } from './insights.constants';
import { validateComment } from './insights.utils';
import type { Comment } from './insights.types';

interface CommentInputProps {
  insightId: string;
  placeholder?: string;
  replyTo?: Comment | null;
  editComment?: Comment | null;
  onSubmit: (content: string) => Promise<void>;
  onCancel?: () => void;
  autoFocus?: boolean;
}

export const CommentInput: React.FC<CommentInputProps> = ({
  insightId,
  placeholder = 'Add a comment...',
  replyTo,
  editComment,
  onSubmit,
  onCancel,
  autoFocus = false,
}) => {
  const [content, setContent] = useState(editComment?.content || '');
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const isEditing = !!editComment;
  const isReplying = !!replyTo;

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    if (editComment) {
      setContent(editComment.content);
    }
  }, [editComment]);

  const handleCancel = () => {
    setContent('');
    onCancel?.();
  };

  const handleSubmit = async () => {
    const validation = validateComment(content);
    if (!validation.valid) {
      Alert.alert('Invalid Comment', validation.error);
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(content);
      setContent('');
      inputRef.current?.blur();
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const characterCount = content.length;
  const isValid = content.trim().length > 0 && characterCount <= LIMITS.MAX_COMMENT_LENGTH;
  const isNearLimit = characterCount > LIMITS.MAX_COMMENT_LENGTH * 0.9;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.commentInputContainer}>
        {/* Reply/Edit Indicator */}
        {(isReplying || isEditing) && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              paddingVertical: 8,
              backgroundColor: '#f5f5f5',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Ionicons
                name={isEditing ? 'create-outline' : 'arrow-undo'}
                size={16}
                color={COLORS.text.secondary}
                style={{ marginRight: 8 }}
              />
              <Text style={{ fontSize: 13, color: COLORS.text.secondary }}>
                {isEditing
                  ? 'Editing comment'
                  : `Replying to ${replyTo?.author.name}`}
              </Text>
            </View>
            <TouchableOpacity onPress={handleCancel}>
              <Ionicons name="close" size={20} color={COLORS.text.secondary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Input Row */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            paddingHorizontal: 20,
            paddingVertical: 12,
            backgroundColor: COLORS.background.primary,
            borderTopWidth: 1,
            borderTopColor: COLORS.border.light,
          }}
        >
          {/* Avatar placeholder (only show if not editing/replying) */}
          {!isEditing && !isReplying && <View style={styles.commentInputAvatar} />}

          {/* Input Wrapper */}
          <View
            style={[
              styles.commentInputWrapper,
              { marginLeft: isEditing || isReplying ? 0 : 12 },
            ]}
          >
            <TextInput
              ref={inputRef}
              style={styles.commentInput}
              placeholder={placeholder}
              placeholderTextColor={COLORS.text.tertiary}
              value={content}
              onChangeText={setContent}
              multiline
              maxLength={LIMITS.MAX_COMMENT_LENGTH}
              editable={!submitting}
              autoFocus={autoFocus}
            />

            {/* Character Count */}
            {characterCount > 0 && (
              <Text
                style={{
                  fontSize: 11,
                  color: isNearLimit ? '#ff3b30' : COLORS.text.tertiary,
                  textAlign: 'right',
                  marginTop: 4,
                }}
              >
                {characterCount}/{LIMITS.MAX_COMMENT_LENGTH}
              </Text>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.commentInputActions}>
            {/* Cancel Button (for edit mode) */}
            {(isEditing || isReplying) && (
              <TouchableOpacity
                onPress={handleCancel}
                disabled={submitting}
              >
                <Text style={styles.commentActionText}>Cancel</Text>
              </TouchableOpacity>
            )}

            {/* Send Button */}
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!isValid || submitting) && styles.sendButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!isValid || submitting}
            >
              <Ionicons
                name={submitting ? 'hourglass' : 'send'}
                size={18}
                color={isValid && !submitting ? '#fff' : COLORS.text.tertiary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};
