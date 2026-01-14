/**
 * Notifications Styles
 * Styling for notifications feature
 */

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
  },
  unreadBadge: {
    backgroundColor: '#ff3b30',
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
  },
  markAllReadButtonText: {
    fontSize: 16,
    color: '#007aff',
    fontWeight: '600',
  },
  markAllReadButtonTextDisabled: {
    color: '#c7c7cc',
  },

  // Category Filter
  categoryFilterContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  categoryFilterContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  categoryFilterButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#f2f2f7',
    marginRight: 8,
  },
  categoryFilterButtonActive: {
    backgroundColor: '#007aff',
  },
  categoryFilterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  categoryFilterTextActive: {
    color: '#fff',
  },

  // Section Header
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f2f2f7',
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8e8e93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Notification Item
  notificationItem: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationItemUnread: {
    backgroundColor: '#f0f8ff',
  },
  notificationContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  notificationIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    marginRight: 8,
  },
  notificationTitleUnread: {
    fontWeight: '700',
  },
  notificationTime: {
    fontSize: 12,
    color: '#8e8e93',
  },
  notificationBody: {
    fontSize: 14,
    color: '#3c3c43',
    lineHeight: 20,
  },
  notificationBodyUnread: {
    color: '#000',
  },
  notificationImage: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    marginTop: 12,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007aff',
    marginLeft: 8,
    marginTop: 6,
  },

  // CTA Buttons
  ctaButtonsContainer: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  ctaButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f2f2f7',
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  ctaButtonPrimary: {
    backgroundColor: '#007aff',
    borderColor: '#007aff',
  },
  ctaButtonDanger: {
    backgroundColor: '#ff3b30',
    borderColor: '#ff3b30',
  },
  ctaButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  ctaButtonTextPrimary: {
    color: '#fff',
  },
  ctaButtonTextDanger: {
    color: '#fff',
  },

  // Priority Badge
  priorityBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#ff9500',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityBadgeUrgent: {
    backgroundColor: '#ff3b30',
  },
  priorityBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },

  // Dismiss Button
  dismissButton: {
    padding: 4,
    marginLeft: 8,
  },

  // Empty State
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyContentContainer: {
    flexGrow: 1,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#8e8e93',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Error State
  errorStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  errorStateTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ff3b30',
    marginTop: 20,
    marginBottom: 8,
  },
  errorStateText: {
    fontSize: 16,
    color: '#8e8e93',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#007aff',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },

  // Loading Footer
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
