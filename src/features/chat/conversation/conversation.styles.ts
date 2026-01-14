/**
 * Conversation Styles
 * Styling for conversation screen matching design screenshots
 */

import { StyleSheet, Platform } from 'react-native';
import { fontSizes, fontWeights } from '../../../core/theme/typography';
import { spacing } from '../../../core/theme/spacing';

export const styles = StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Lighter, more premium background
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: Platform.OS === 'ios' ? spacing.sm : spacing.md,
    paddingBottom: spacing.sm + 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // Glassy look
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0.8)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },

  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E2E8F0',
    marginRight: spacing.sm,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  headerGroupBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },

  headerGroupBadgeText: {
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  headerOnlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: spacing.sm + 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  headerInfo: {
    flex: 1,
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.3,
  },

  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
    fontWeight: '500',
  },

  headerActions: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
  },

  // Messages List
  messagesList: {
    flex: 1,
  },

  messagesContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },

  // Day Separator
  daySeparator: {
    alignItems: 'center',
    marginVertical: spacing.lg,
  },

  daySeparatorText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    backgroundColor: '#EDF2F7',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Message Container
  messageContainer: {
    marginVertical: 2,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },

  messageContainerOwn: {
    flexDirection: 'row-reverse',
  },

  // Avatar
  messageAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: 8,
    backgroundColor: '#E2E8F0',
  },

  messageAvatarPlaceholder: {
    width: 28,
  },

  // Message Bubble
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },

  messageBubbleIncoming: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },

  messageBubbleOutgoing: {
    backgroundColor: '#4F46E5', // Primary indigo
    borderBottomRightRadius: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },

  messageBubbleFailed: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#EF4444',
  },

  // Sender Name (group chats)
  messageSenderName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 4,
    marginLeft: 4,
  },

  // Role Badge
  roleBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 4,
  },

  roleBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Message Text
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: -0.1,
  },

  messageTextIncoming: {
    color: '#1E293B',
  },

  messageTextOutgoing: {
    color: '#FFFFFF',
  },

  messageTextFailed: {
    color: '#991B1B',
  },

  // File Attachment
  fileAttachment: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 10,
    marginTop: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  fileIcon: {
    marginRight: 10,
  },

  fileInfo: {
    flex: 1,
  },

  fileName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  fileSize: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },

  // Message Footer
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    minWidth: 50,
  },

  messageTime: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
  },

  messageTimeOwn: {
    color: 'rgba(255, 255, 255, 0.7)',
  },

  messageStatus: {
    marginLeft: 4,
  },

  // Input Container
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? spacing.md + 10 : spacing.sm + 10,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },

  attachButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  inputWrapper: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
  },

  input: {
    fontSize: 16,
    color: '#0F172A',
    maxHeight: 120,
    padding: 0,
    margin: 0,
  },

  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  sendButtonDisabled: {
    backgroundColor: '#E2E8F0',
  },

  // Retry Button
  retryButton: {
    marginLeft: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: '#EF4444',
    borderRadius: 4,
  },

  retryButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Permission Denied Container
  permissionDeniedContainer: {
    backgroundColor: '#FEF3C7',
    borderTopWidth: 1,
    borderTopColor: '#FDE68A',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },

  permissionDeniedIcon: {
    marginRight: spacing.sm,
  },

  permissionDeniedText: {
    flex: 1,
    fontSize: fontSizes.sm,
    color: '#92400E',
    fontWeight: fontWeights.medium as any,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },

  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },

  emptyTitle: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold as any,
    color: '#1F2937',
    marginBottom: spacing.sm,
  },

  emptyMessage: {
    fontSize: fontSizes.base,
    color: '#6B7280',
    textAlign: 'center',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSizes.base,
    color: '#6B7280',
  },

  // Load More Indicator
  loadMoreIndicator: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
});
