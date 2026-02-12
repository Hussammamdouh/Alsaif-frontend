import { StyleSheet } from 'react-native';

export const createStyles = (theme: any, isRTL: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },

  // Header
  header: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: theme.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: theme.ui.border,
  },
  dashboardHeader: {
    height: 110,
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 45,
    paddingHorizontal: 20,
    backgroundColor: theme.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: theme.ui.border,
  },
  headerTitleContainer: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.text.primary,
    letterSpacing: 0.5,
    textAlign: isRTL ? 'right' : 'left',
  },
  unreadBadge: {
    backgroundColor: theme.accent.error,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: isRTL ? 0 : 8,
    marginRight: isRTL ? 8 : 0,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  markAllReadButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: theme.background.tertiary,
  },
  markAllReadButtonText: {
    fontSize: 14,
    color: theme.primary.main,
    fontWeight: '600',
  },
  markAllReadButtonTextDisabled: {
    color: theme.text.disabled,
  },

  // Category Filter
  categoryFilterContainer: {
    backgroundColor: theme.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: theme.ui.border,
  },
  categoryFilterContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    flexDirection: isRTL ? 'row-reverse' : 'row',
  },
  categoryFilterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: theme.background.tertiary,
    marginLeft: isRTL ? 8 : 0,
    marginRight: isRTL ? 0 : 8,
  },
  categoryFilterButtonActive: {
    backgroundColor: theme.primary.main,
  },
  categoryFilterText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.text.secondary,
  },
  categoryFilterTextActive: {
    color: '#fff',
    fontWeight: '700',
  },

  // Section Header
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: theme.background.tertiary,
    alignItems: isRTL ? 'flex-end' : 'flex-start',
  },
  sectionHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.text.disabled,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: isRTL ? 'right' : 'left',
  },

  // Notification Item
  notificationItem: {
    backgroundColor: theme.background.secondary,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.ui.border,
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'flex-start',
  },
  notificationItemUnread: {
    backgroundColor: theme.isDark ? 'rgba(45, 106, 79, 0.15)' : 'rgba(45, 106, 79, 0.08)',
  },
  notificationContent: {
    flex: 1,
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'flex-start',
  },
  notificationIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: isRTL ? 16 : 0,
    marginRight: isRTL ? 0 : 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationTextContainer: {
    flex: 1,
    alignItems: isRTL ? 'flex-end' : 'flex-start',
  },
  notificationHeader: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
    width: '100%',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text.primary,
    flex: 1,
    marginLeft: isRTL ? 8 : 0,
    marginRight: isRTL ? 0 : 8,
    lineHeight: 22,
    textAlign: isRTL ? 'right' : 'left',
  },
  notificationTitleUnread: {
    color: theme.isDark ? '#d4af37' : '#2d6a4f',
  },
  notificationTime: {
    fontSize: 11,
    color: theme.text.disabled,
    fontWeight: '500',
    textAlign: isRTL ? 'left' : 'right',
  },
  notificationBody: {
    fontSize: 14,
    color: theme.text.secondary,
    lineHeight: 22,
    textAlign: isRTL ? 'right' : 'left',
  },
  notificationBodyUnread: {
    color: theme.text.primary,
  },
  notificationImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginTop: 14,
    backgroundColor: theme.background.tertiary,
    borderWidth: 1,
    borderColor: theme.ui.border,
  },
  unreadIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#d4af37',
    marginRight: isRTL ? 8 : 0,
    marginLeft: isRTL ? 0 : 8,
    marginTop: 8,
  },

  // CTA Buttons
  ctaButtonsContainer: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    marginTop: 18,
    gap: 12,
  },
  ctaButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: theme.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.ui.border,
  },
  ctaButtonPrimary: {
    backgroundColor: '#2d6a4f',
    borderColor: '#2d6a4f',
  },
  ctaButtonDanger: {
    backgroundColor: theme.accent.error,
    borderColor: theme.accent.error,
  },
  ctaButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text.primary,
  },
  ctaButtonTextPrimary: {
    color: '#fff',
    fontWeight: '700',
  },
  ctaButtonTextDanger: {
    color: '#fff',
    fontWeight: '700',
  },

  // Priority Badge
  priorityBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#d4af37',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: theme.background.secondary,
  },
  priorityBadgeUrgent: {
    backgroundColor: theme.accent.error,
  },
  priorityBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#fff',
    textTransform: 'uppercase',
  },

  // Broadcast Badge
  broadcastBadge: {
    position: 'absolute',
    top: -6,
    left: isRTL ? -6 : undefined,
    right: isRTL ? undefined : -6,
    backgroundColor: theme.primary.main,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1.5,
    borderColor: theme.background.secondary,
    zIndex: 1,
  },

  // Dismiss Button
  dismissButton: {
    padding: 6,
    marginRight: isRTL ? 8 : 0,
    marginLeft: isRTL ? 0 : 8,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  desktopContentWrapper: {
    flex: 1,
    backgroundColor: theme.background.secondary,
  },
  listContent: {
    paddingBottom: 40,
  },

  // Empty State
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    backgroundColor: theme.background.primary,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 15,
    color: theme.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Error State
  errorStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    backgroundColor: theme.background.primary,
  },
  errorStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.accent.error,
    marginTop: 20,
    marginBottom: 12,
  },
  errorStateText: {
    fontSize: 15,
    color: theme.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  retryButton: {
    backgroundColor: theme.primary.main,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    elevation: 4,
    shadowColor: theme.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },

  // Loading Footer
  loadingFooter: {
    paddingVertical: 30,
    alignItems: 'center',
  },
});
