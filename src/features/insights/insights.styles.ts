/**
 * Insights Styles
 * StyleSheet for all insights-related screens and components
 */

import { StyleSheet, Platform } from 'react-native';
import { COLORS } from './insights.constants';

export const insightsStyles = StyleSheet.create({
  // ==================== LIST SCREEN ====================
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 16,
    backgroundColor: COLORS.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
  },

  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },

  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background.secondary,
  },

  // Filter Tabs
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.background.primary,
  },

  filterScroll: {
    flexDirection: 'row',
  },

  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: COLORS.background.secondary,
  },

  filterTabActive: {
    backgroundColor: '#007aff',
  },

  filterTabText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },

  filterTabTextActive: {
    color: '#fff',
  },

  // List
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },

  listSeparator: {
    height: 12,
  },

  // ==================== INSIGHT CARD ====================
  insightCard: {
    backgroundColor: COLORS.background.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
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
    flex: 1,
  },

  symbolBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
  },

  symbolIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 6,
  },

  symbolText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text.primary,
  },

  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },

  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },

  timestamp: {
    fontSize: 13,
    color: COLORS.text.secondary,
  },

  moreButton: {
    padding: 4,
  },

  insightTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text.primary,
    lineHeight: 24,
    marginBottom: 8,
  },

  insightExcerpt: {
    fontSize: 15,
    color: COLORS.text.secondary,
    lineHeight: 22,
    marginBottom: 12,
  },

  insightImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: COLORS.background.secondary,
  },

  insightFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  engagementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  engagementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  engagementCount: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },

  bookmarkButton: {
    padding: 4,
  },

  // ==================== DETAIL SCREEN ====================
  detailContainer: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },

  detailHeader: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 16,
    backgroundColor: COLORS.background.primary,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background.secondary,
  },

  detailContent: {
    flex: 1,
  },

  detailScrollContent: {
    paddingBottom: 100,
  },

  detailTitleSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },

  detailCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },

  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },

  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },

  detailTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text.primary,
    lineHeight: 36,
    marginBottom: 16,
  },

  detailMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background.secondary,
    marginRight: 8,
  },

  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
  },

  detailTimestamp: {
    fontSize: 13,
    color: COLORS.text.secondary,
  },

  readTime: {
    fontSize: 13,
    color: COLORS.text.secondary,
  },

  detailImageContainer: {
    width: '100%',
    height: 240,
    backgroundColor: COLORS.background.secondary,
  },

  detailImage: {
    width: '100%',
    height: '100%',
  },

  detailBody: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },

  detailText: {
    fontSize: 17,
    lineHeight: 28,
    color: COLORS.text.primary,
  },

  detailEngagement: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border.light,
    backgroundColor: COLORS.background.primary,
  },

  detailEngagementButtons: {
    flexDirection: 'row',
    gap: 24,
  },

  detailEngagementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  detailEngagementText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },

  // ==================== COMMENTS SECTION ====================
  commentsSection: {
    paddingTop: 20,
  },

  commentsSectionHeader: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },

  commentsSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
  },

  commentsCount: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginTop: 4,
  },

  commentsList: {
    paddingHorizontal: 20,
  },

  // Comment Item
  commentItem: {
    marginBottom: 16,
  },

  commentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },

  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background.secondary,
    marginRight: 12,
  },

  commentMain: {
    flex: 1,
  },

  commentAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  commentAuthor: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginRight: 8,
  },

  commentTimestamp: {
    fontSize: 13,
    color: COLORS.text.secondary,
  },

  commentContent: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.text.primary,
    marginBottom: 8,
  },

  commentDeleted: {
    fontSize: 15,
    fontStyle: 'italic',
    color: COLORS.text.tertiary,
    marginBottom: 8,
  },

  commentEdited: {
    fontSize: 12,
    color: COLORS.text.tertiary,
    marginBottom: 8,
  },

  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  commentActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  commentActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },

  // Nested Replies
  repliesContainer: {
    marginLeft: 48,
    marginTop: 8,
  },

  replyItem: {
    marginBottom: 12,
  },

  viewRepliesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 6,
  },

  viewRepliesText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007aff',
  },

  // Comment Input
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.background.primary,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.light,
  },

  commentInputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background.secondary,
    marginRight: 12,
  },

  commentInputWrapper: {
    flex: 1,
    backgroundColor: COLORS.background.secondary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
  },

  commentInput: {
    fontSize: 15,
    color: COLORS.text.primary,
    minHeight: 36,
  },

  commentInputActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginLeft: 8,
  },

  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007aff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  sendButtonDisabled: {
    backgroundColor: COLORS.background.secondary,
  },

  // ==================== EMPTY STATES ====================
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },

  emptyIcon: {
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 15,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // ==================== LOADING STATES ====================
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },

  loadingText: {
    fontSize: 15,
    color: COLORS.text.secondary,
    marginTop: 12,
  },

  loadMoreContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },

  // ==================== ERROR STATES ====================
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },

  errorText: {
    fontSize: 15,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
  },

  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#007aff',
  },

  retryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },

  // ==================== MODALS ====================
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },

  modalContainer: {
    backgroundColor: COLORS.background.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
  },

  modalCloseButton: {
    padding: 4,
  },

  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 16,
  },

  modalOptionText: {
    fontSize: 16,
    color: COLORS.text.primary,
  },

  modalOptionDanger: {
    color: '#ff3b30',
  },

  // ==================== LOCKED CONTENT ====================
  lockedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },

  lockedIcon: {
    marginBottom: 16,
  },

  lockedTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },

  lockedMessage: {
    fontSize: 15,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },

  upgradeButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#6366f1',
  },

  upgradeButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
});
