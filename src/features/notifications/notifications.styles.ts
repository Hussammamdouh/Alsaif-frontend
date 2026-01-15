import { StyleSheet } from 'react-native';

export const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: theme.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.main,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.text.primary,
    letterSpacing: 0.5,
  },
  unreadBadge: {
    backgroundColor: theme.accent.error,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
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
    backgroundColor: theme.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.main,
  },
  categoryFilterContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  categoryFilterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: theme.background.tertiary,
    marginRight: 8,
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
    backgroundColor: theme.background.secondary,
  },
  sectionHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.text.disabled,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Notification Item
  notificationItem: {
    backgroundColor: theme.background.primary,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.main,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationItemUnread: {
    backgroundColor: theme.isDark ? 'rgba(0, 122, 255, 0.1)' : 'rgba(0, 122, 255, 0.05)',
  },
  notificationContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text.primary,
    flex: 1,
    marginRight: 8,
    lineHeight: 20,
  },
  notificationTitleUnread: {
    fontWeight: '700',
  },
  notificationTime: {
    fontSize: 11,
    color: theme.text.disabled,
    fontWeight: '500',
  },
  notificationBody: {
    fontSize: 14,
    color: theme.text.secondary,
    lineHeight: 20,
  },
  notificationBodyUnread: {
    color: theme.text.primary,
  },
  notificationImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginTop: 12,
    backgroundColor: theme.background.tertiary,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.primary.main,
    marginLeft: 8,
    marginTop: 6,
  },

  // CTA Buttons
  ctaButtonsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 10,
  },
  ctaButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: theme.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonPrimary: {
    backgroundColor: theme.primary.main,
  },
  ctaButtonDanger: {
    backgroundColor: theme.accent.error,
  },
  ctaButtonText: {
    fontSize: 13,
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
    top: -4,
    right: -4,
    backgroundColor: theme.accent.warning,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.background.primary,
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

  // Dismiss Button
  dismissButton: {
    padding: 6,
    marginLeft: 8,
    borderRadius: 14,
    backgroundColor: theme.background.secondary,
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
