/**
 * Insights Styles
 * StyleSheet for all insights-related screens and components
 */

import { StyleSheet, Platform, I18nManager } from 'react-native';

export const createInsightsStyles = (theme: any) => StyleSheet.create({
  // ==================== LIST SCREEN ====================
  container: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 16,
    backgroundColor: theme.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.light,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.text.primary,
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
    backgroundColor: theme.background.secondary,
  },

  // Filter Tabs
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: theme.background.primary,
  },

  filterScroll: {
    flexDirection: 'row',
  },

  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: theme.background.secondary,
  },

  filterTabActive: {
    backgroundColor: theme.primary.main,
  },

  filterTabText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text.secondary,
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
    backgroundColor: theme.ui?.card || theme.background.secondary,
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
    backgroundColor: theme.background.tertiary,
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
    color: theme.text.primary,
  },

  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },

  typeBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.5,
  },

  timestamp: {
    fontSize: 13,
    color: theme.text.secondary,
  },

  moreButton: {
    padding: 4,
  },

  insightTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.text.primary,
    lineHeight: 24,
    marginBottom: 8,
  },

  insightExcerpt: {
    fontSize: 15,
    color: theme.text.secondary,
    lineHeight: 22,
    marginBottom: 12,
  },

  insightImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: theme.background.secondary,
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
    color: theme.text.secondary,
  },

  bookmarkButton: {
    padding: 4,
  },

  // ==================== DETAIL SCREEN ====================
  detailContainer: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },

  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
    paddingBottom: 16,
    zIndex: 10,
  },

  headerTitleDetail: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.text.primary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    borderWidth: 1,
    borderColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
  },

  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    borderWidth: 1,
    borderColor: theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
  },

  parallaxHeader: {
    height: 380,
    width: '100%',
    overflow: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
  },

  parallaxImage: {
    width: '100%',
    height: '100%',
  },

  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },

  headerGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },

  detailContent: {
    flex: 1,
  },

  detailScrollContent: {
    paddingBottom: 140,
  },

  detailTitleSection: {
    paddingHorizontal: 20,
    paddingTop: 300,
    marginBottom: 24,
    zIndex: 1,
  },

  detailBodyContainer: {
    marginHorizontal: 16,
    borderRadius: 24,
    backgroundColor: 'transparent',
    padding: 2,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
  },

  detailTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: theme.text.primary,
    lineHeight: 34,
    marginBottom: 16,
    letterSpacing: -0.5,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },

  detailMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    backgroundColor: theme.background.secondary,
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

  detailBody: {
    padding: 24,
  },

  detailText: {
    fontSize: 15,
    color: theme.text.secondary,
    lineHeight: 24,
    fontWeight: '400',
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },

  detailEngagement: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'transparent',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
    marginHorizontal: 16,
    marginVertical: 24,
    overflow: 'hidden',
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

  // ==================== SIGNAL CARD ====================
  signalCard: {
    backgroundColor: theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
  },

  signalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
  },

  signalSymbolContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  signalSymbolIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.primary.main + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },

  signalSymbol: {
    fontSize: 20,
    fontWeight: '900',
    color: theme.text.primary,
  },

  signalMarketBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: theme.primary.main,
  },

  signalMarketText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFF',
  },

  signalGrid: {
    gap: 16,
  },

  signalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  signalItem: {
    flex: 1,
  },

  signalLabel: {
    fontSize: 13,
    color: theme.text.tertiary,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },

  signalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.text.primary,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },

  signalBuyValue: {
    color: theme.primary.main,
  },

  signalGoalValue: {
    color: '#10B981', // Green
  },

  signalStopValue: {
    color: '#EF4444', // Red
  },

  signalStockName: {
    fontSize: 14,
    color: theme.text.secondary,
    fontWeight: '600',
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },

  // ==================== COMMENTS SECTION ====================
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

  replyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.background.secondary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.light,
  },

  replyIndicatorText: {
    fontSize: 13,
    color: theme.text.secondary,
    flex: 1,
  },

  replyAuthorName: {
    fontWeight: '700',
    color: theme.primary.main,
  },

  commentsList: {
    gap: 32,
  },

  // Comment Item
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

  commentDeleted: {
    fontSize: 14,
    fontStyle: 'italic',
    color: theme.text.tertiary,
  },

  commentEdited: {
    fontSize: 12,
    color: theme.text.tertiary,
    marginBottom: 8,
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
    paddingVertical: 12,
    gap: 6,
  },

  viewRepliesText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.primary.main,
  },

  // Comment Input
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

  commentInputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.background.secondary,
    marginRight: 12,
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

  commentInput: {
    flex: 1,
    fontSize: 16,
    color: theme.text.primary,
    minHeight: 40,
    paddingVertical: 10,
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

  sendButtonDisabled: {
    backgroundColor: theme.background.secondary,
    opacity: 0.5,
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
    color: theme.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 15,
    color: theme.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
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

  // ==================== LOADING STATES ====================
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },

  loadingText: {
    fontSize: 15,
    color: theme.text.tertiary,
    marginTop: 16,
    fontWeight: '600',
  },

  loadMoreContainer: {
    paddingVertical: 20,
    alignItems: 'center',
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

  // ==================== ERROR STATES ====================
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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

  // ==================== MODALS ====================
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },

  modalContainer: {
    backgroundColor: theme.background.primary,
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
    borderBottomColor: theme.border.light,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text.primary,
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
    color: theme.text.primary,
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
    backgroundColor: theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.95)',
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
    color: theme.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },

  lockedMessage: {
    fontSize: 15,
    color: theme.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },

  upgradeButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: theme.primary.main,
  },

  upgradeButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
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
});
