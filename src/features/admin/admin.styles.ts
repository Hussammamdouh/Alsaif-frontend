/**
 * Admin Styles
 * Shared styles for admin screens with theme support
 */

import { StyleSheet, I18nManager } from 'react-native';
import { ColorPalette } from '../../core/theme/colors';

export const createAdminStyles = (theme: ColorPalette, isRTL: boolean = I18nManager.isRTL) => StyleSheet.create({
  // Container
  container: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },
  desktopContentWrapper: {
    flex: 1,
    flexDirection: isRTL ? 'row-reverse' : 'row',
    backgroundColor: theme.background.primary,
  },
  safeArea: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },

  // Header
  header: {
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
  desktopSidebar: {
    width: 280,
    backgroundColor: theme.background.secondary,
    borderEndWidth: 1,
    borderEndColor: theme.ui.border,
    paddingTop: 45,
  },
  sidebarItem: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 12,
  },
  sidebarItemActive: {
    backgroundColor: theme.primary.main + '15',
  },
  sidebarItemLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text.secondary,
    marginStart: 12,
  },
  sidebarItemLabelActive: {
    color: theme.primary.main,
  },
  desktopMainContent: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },
  headerLeft: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
  },
  backButton: {
    marginStart: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.text.primary,
    letterSpacing: -0.5,
    textAlign: isRTL ? 'right' : 'left',
  },
  headerRight: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    gap: 12,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  // Search Bar
  searchContainer: {
    backgroundColor: theme.background.secondary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.main,
  },
  searchBar: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    backgroundColor: theme.background.tertiary,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginEnd: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.text.primary,
    textAlign: isRTL ? 'right' : 'left',
  },
  filterButton: {
    marginStart: 12,
    padding: 8,
  },

  // Filter Tabs
  filterTabs: {
    backgroundColor: theme.background.secondary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.main,
  },
  filterTabsContent: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    gap: 8,
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.background.tertiary,
    marginEnd: 8,
  },
  filterTabActive: {
    backgroundColor: theme.primary.main,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text.secondary,
  },
  filterTabTextActive: {
    color: theme.primary.contrast,
  },

  // Content
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },

  // Card
  card: {
    backgroundColor: theme.background.secondary,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.ui.border,
    overflow: 'hidden',
  },
  glassCard: {
    backgroundColor: 'transparent',
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  cardInner: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.text.primary,
    textAlign: isRTL ? 'right' : 'left',
  },
  cardSubtitle: {
    fontSize: 14,
    color: theme.text.secondary,
    marginTop: 4,
    textAlign: isRTL ? 'right' : 'left',
  },

  // List Items
  listItem: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    backgroundColor: theme.background.secondary,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.main,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text.primary,
    marginBottom: 4,
    textAlign: isRTL ? 'right' : 'left',
  },
  listItemSubtitle: {
    fontSize: 14,
    color: theme.text.secondary,
    textAlign: isRTL ? 'right' : 'left',
  },
  listItemRight: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: isRTL ? 'right' : 'left',
  },

  // Dashboard Specific
  dashboardGrid: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  desktopStatCard: {
    width: '48%', // 2 per row on smaller desktops
    maxWidth: 350,
  },
  dashboardStatCard: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.ui.border,
    overflow: 'hidden',
    width: '100%',
  },
  dashboardStatLeft: {
    flex: 1,
  },
  dashboardStatValue: {
    fontSize: 32,
    fontWeight: '700',
    color: theme.text.primary,
    marginBottom: 4,
    textAlign: isRTL ? 'right' : 'left',
  },
  dashboardStatLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text.secondary,
    marginBottom: 2,
    textAlign: isRTL ? 'right' : 'left',
  },
  dashboardStatSubtext: {
    fontSize: 12,
    color: theme.text.tertiary,
    textAlign: isRTL ? 'right' : 'left',
  },
  dashboardStatIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Quick Actions
  quickActionsGrid: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  desktopQuickAction: {
    width: '23%', // 4 per row on desktop
    minWidth: 180,
  },
  quickActionItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.background.secondary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border.main,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text.primary,
    textAlign: 'center',
  },
  settingRow: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingLeft: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    flex: 1,
  },

  // Section
  sectionHeader: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text.primary,
    textAlign: isRTL ? 'right' : 'left',
  },
  sectionAction: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.primary.main,
    textAlign: isRTL ? 'left' : 'right',
  },

  // Buttons
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: theme.primary.main,
  },
  buttonSecondary: {
    backgroundColor: theme.background.tertiary,
    borderWidth: 1,
    borderColor: theme.border.main,
  },
  buttonDanger: {
    backgroundColor: theme.error.main,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextPrimary: {
    color: theme.primary.contrast,
  },
  buttonTextSecondary: {
    color: theme.text.primary,
  },
  loadMoreButton: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.primary.main,
  },

  // Loading & Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: theme.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: theme.text.secondary,
    textAlign: 'center',
  },
  emptyIcon: {
    marginBottom: 16,
  },

  // Badge
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeSuccess: {
    backgroundColor: theme.success.light,
  },
  badgeWarning: {
    backgroundColor: theme.warning.light,
  },
  badgeError: {
    backgroundColor: theme.error.light,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  badgeTextSuccess: {
    color: theme.success.dark,
  },
  badgeTextWarning: {
    color: theme.warning.dark,
  },
  badgeTextError: {
    color: theme.error.dark,
  },

  // Stats
  statRow: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.main,
  },
  statLabel: {
    fontSize: 14,
    color: theme.text.secondary,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text.primary,
  },

  // Form
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text.primary,
    marginBottom: 8,
    textAlign: isRTL ? 'right' : 'left',
  },
  formInput: {
    backgroundColor: theme.background.tertiary,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: theme.text.primary,
    borderWidth: 1,
    borderColor: theme.border.main,
    textAlign: isRTL ? 'right' : 'left',
  },
  formTextArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.ui.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: theme.background.secondary,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.text.primary,
    marginBottom: 16,
    textAlign: isRTL ? 'right' : 'left',
  },
  modalButtons: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
  },
});

// Export for backward compatibility (will be deprecated)
export const adminStyles = createAdminStyles({
  mode: 'dark',
  primary: { main: '#438730', dark: '#2d5a20', light: '#5fa948', contrast: '#FFFFFF', gradient: ['#438730', '#5fa948'] },
  background: { primary: '#121212', secondary: '#1e1e1e', tertiary: '#2a2a2a' },
  text: { primary: '#FFFFFF', secondary: '#B3B3B3', tertiary: '#808080', inverse: '#121212' },
  accent: { success: '#5fa948', error: '#EF4444', warning: '#F59E0B', info: '#6ba854' },
  ui: { border: '#333333', divider: '#2a2a2a', overlay: 'rgba(0, 0, 0, 0.7)', card: '#1e1e1e' },
  semantic: { positive: '#5fa948', negative: '#EF4444' },
  success: { main: '#5fa948', light: '#c3e0bc', dark: '#2d5a20', contrast: '#FFFFFF' },
  error: { main: '#EF4444', light: '#FEE2E2', dark: '#B91C1C', contrast: '#FFFFFF' },
  warning: { main: '#F59E0B', light: '#FEF3C7', dark: '#92400E', contrast: '#000000' },
  border: { light: '#404040', main: '#333333', dark: '#262626' },
  shadow: { color: '#000000' },
  transparent: 'transparent',
});
