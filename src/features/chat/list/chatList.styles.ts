import { StyleSheet, Platform } from 'react-native';
import { fontSizes, fontWeights } from '../../../core/theme/typography';
import { spacing } from '../../../core/theme/spacing';
import { ColorPalette } from '../../../core/theme/colors';

export const getStyles = (theme: ColorPalette) => StyleSheet.create({
  // Gradient
  gradient: {
    flex: 1,
  },

  // Container
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 45 : 20,
    backgroundColor: theme.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: theme.ui.border,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8, // Compact
  },

  title: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
  },

  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.accent.error,
  },

  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
    marginRight: 4,
  },

  createButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  // Search Bar
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent', // Handled by theme.ui.card in component
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    marginBottom: 8, // Compact
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  searchIcon: {
    marginRight: spacing.sm,
  },

  searchInput: {
    flex: 1,
    fontSize: fontSizes.base,
    color: 'inherit', // Handled by inline style
    padding: 0,
    margin: 0,
  },

  searchPlaceholder: {
    color: theme.text.tertiary,
  },

  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },

  // Filter Chips
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },

  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm - 2,
    borderRadius: 20,
    marginRight: spacing.sm,
    backgroundColor: 'transparent', // Handled by inline style
    flexDirection: 'row',
    alignItems: 'center',
  },

  filterChipActive: {
    backgroundColor: theme.primary.main,
  },

  filterChipText: {
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium as any,
    color: theme.text.secondary,
  },

  filterChipTextActive: {
    color: theme.text.inverse,
  },

  filterChipIcon: {
    marginRight: 4,
  },

  // Section Header
  sectionHeader: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'transparent',
  },

  sectionTitle: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold as any,
    color: theme.text.tertiary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // Conversation Row
  conversationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: 'transparent', // Handled by theme.ui.card
  },

  conversationRowPressed: {
    backgroundColor: theme.background.secondary,
  },

  // Avatar
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: spacing.md,
    position: 'relative',
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.background.tertiary,
  },

  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarPlaceholderText: {
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semibold as any,
    color: theme.text.tertiary,
  },

  // Group Avatar (Multiple Avatars)
  groupAvatarContainer: {
    width: 56,
    height: 56,
    position: 'relative',
  },

  groupAvatar1: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    top: 0,
    left: 0,
    borderWidth: 2,
    borderColor: theme.background.primary,
  },

  groupAvatar2: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: theme.background.primary,
  },

  // Online Indicator
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: theme.accent.success,
    borderWidth: 2,
    borderColor: theme.background.primary,
  },

  // Content
  content: {
    flex: 1,
    justifyContent: 'center',
    marginRight: spacing.sm,
  },

  contentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  conversationTitle: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold as any,
    color: theme.text.primary,
    flex: 1,
  },

  conversationTitleUnread: {
    fontWeight: fontWeights.bold as any,
  },

  badgeIcon: {
    marginLeft: 4,
  },

  lastMessage: {
    fontSize: fontSizes.sm,
    color: theme.text.secondary,
    lineHeight: 20,
  },

  lastMessageUnread: {
    color: theme.text.primary,
    fontWeight: fontWeights.medium as any,
  },

  // Meta (Right side)
  meta: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minHeight: 56,
    paddingVertical: 2,
  },

  timestamp: {
    fontSize: fontSizes.xs,
    color: theme.text.tertiary,
    marginBottom: 6,
  },

  timestampUnread: {
    color: theme.primary.main,
    fontWeight: fontWeights.semibold as any,
  },

  unreadBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },

  unreadBadgeText: {
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.bold as any,
    color: theme.text.inverse,
  },

  // Separator
  separator: {
    height: 1,
    backgroundColor: theme.ui.divider,
    marginLeft: 88, // Align with content (56 avatar + 16 margin + 16 padding)
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },

  emptyIconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: theme.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  emptyTitle: {
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semibold as any,
    color: theme.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },

  emptyMessage: {
    fontSize: fontSizes.base,
    color: theme.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },

  retryButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: 12,
    backgroundColor: theme.primary.main,
  },

  retryButtonText: {
    fontSize: fontSizes.base,
    fontWeight: fontWeights.semibold as any,
    color: theme.text.inverse,
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
    color: theme.text.secondary,
  },

  // Footer Loading (Pagination)
  footerLoading: {
    paddingVertical: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Floating Action Button (for new chat)
  fab: {
    position: 'absolute',
    bottom: 110, // Moved up to sit above floating tab bar
    right: spacing.md,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: theme.primary.main,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 12,
      },
    }),
  },

  // List
  list: {
    flex: 1,
  },

  listContent: {
    paddingBottom: spacing.xl + 120, // Increased for Floating Tab Bar + "Top Gap" safety
  },

  // Desktop Split-View Styles
  desktopCenterContainer: {
    flex: 1,
    padding: 0,
  },

  splitViewCard: {
    flexDirection: 'row',
    overflow: 'hidden',
    flex: 1,
    backgroundColor: theme.background.secondary,
  },

  sidebar: {
    width: 350,
    flexDirection: 'column',
    borderRightWidth: 1,
    borderRightColor: theme.ui.border,
    backgroundColor: theme.background.secondary,
    overflow: 'hidden', // Contain scrolling
  },

  mainArea: {
    flex: 1,
    backgroundColor: theme.background.secondary,
    overflow: 'hidden', // Contain scrolling
  },

  desktopHeader: {
    minHeight: 110,
    justifyContent: 'center',
    paddingTop: 20,
    paddingBottom: 0,
  },

  noChatSelected: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  noChatText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },

  noChatMessage: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});
