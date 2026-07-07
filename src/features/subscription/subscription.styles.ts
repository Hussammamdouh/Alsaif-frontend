/**
 * Subscription Styles
 * Theme-aware and RTL-supported StyleSheet for subscription screen
 */

import { StyleSheet, Platform } from 'react-native';
import { ColorPalette } from '../../core/theme/colors';

export const createSubscriptionStyles = (theme: ColorPalette, isRTL: boolean) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background.primary,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 32,
      paddingHorizontal: Platform.OS === 'web' ? 20 : 0,
    },

    // Header Section
    header: {
      backgroundColor: theme.background.secondary,
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.ui.border,
      alignItems: isRTL ? 'flex-end' : 'flex-start',
    },
    headerTitle: {
      fontSize: 32,
      fontWeight: '700',
      color: theme.text.primary,
      marginBottom: 8,
      textAlign: isRTL ? 'right' : 'left',
    },
    headerSubtitle: {
      fontSize: 16,
      color: theme.text.secondary,
      textAlign: isRTL ? 'right' : 'left',
    },

    // Current Plan Card
    currentPlanCard: {
      backgroundColor: theme.background.secondary,
      margin: 16,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: theme.ui.border,
      shadowColor: theme.shadow.color,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.mode === 'dark' ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 4,
      alignItems: isRTL ? 'flex-end' : 'flex-start',
    },
    planBadge: {
      alignSelf: isRTL ? 'flex-end' : 'flex-start',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      marginBottom: 12,
    },
    planBadgeText: {
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
      color: theme.primary.contrast,
    },
    planName: {
      fontSize: 28,
      fontWeight: '700',
      color: theme.text.primary,
      marginBottom: 8,
      textAlign: isRTL ? 'right' : 'left',
    },
    planStatus: {
      fontSize: 16,
      marginBottom: 16,
      textAlign: isRTL ? 'right' : 'left',
    },
    statusActive: {
      color: theme.success.main,
    },
    statusExpired: {
      color: theme.error.main,
    },
    statusCancelled: {
      color: theme.text.tertiary,
    },
    planDetails: {
      marginTop: 12,
      width: '100%',
    },
    planDetailRow: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.ui.divider,
    },
    planDetailLabel: {
      fontSize: 15,
      color: theme.text.secondary,
      textAlign: isRTL ? 'right' : 'left',
    },
    planDetailValue: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.text.primary,
      textAlign: isRTL ? 'left' : 'right',
    },

    // Warning Banner
    warningBanner: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      backgroundColor: theme.warning.main + '20',
      marginHorizontal: 16,
      marginBottom: 16,
      padding: 16,
      borderRadius: 12,
      borderLeftWidth: isRTL ? 0 : 4,
      borderLeftColor: theme.warning.main,
      borderRightWidth: isRTL ? 4 : 0,
      borderRightColor: theme.warning.main,
    },
    warningIcon: {
      marginRight: isRTL ? 0 : 12,
      marginLeft: isRTL ? 12 : 0,
    },
    warningText: {
      flex: 1,
      fontSize: 14,
      color: theme.warning.main,
      lineHeight: 20,
      textAlign: isRTL ? 'right' : 'left',
    },

    // Section
    section: {
      marginTop: 8,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.text.primary,
      marginHorizontal: 16,
      marginTop: 16,
      marginBottom: 12,
      textAlign: isRTL ? 'right' : 'left',
    },

    // Plan Cards
    planCard: {
      backgroundColor: theme.background.secondary,
      marginHorizontal: 16,
      marginBottom: 16,
      borderRadius: 16,
      padding: 20,
      shadowColor: theme.shadow.color,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.mode === 'dark' ? 0.3 : 0.1,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: 2,
      borderColor: theme.ui.border,
      alignItems: isRTL ? 'flex-end' : 'flex-start',
    },
    planCardFeatured: {
      borderColor: theme.primary.main,
    },
    featuredBadge: {
      position: 'absolute',
      top: 16,
      right: isRTL ? undefined : 16,
      left: isRTL ? 16 : undefined,
      backgroundColor: theme.primary.main,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    featuredBadgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.primary.contrast,
      textTransform: 'uppercase',
    },
    planHeader: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      marginBottom: 16,
      width: '100%',
    },
    planIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: isRTL ? 0 : 12,
      marginLeft: isRTL ? 12 : 0,
    },
    planTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.text.primary,
      textAlign: isRTL ? 'right' : 'left',
    },
    planPrice: {
      fontSize: 36,
      fontWeight: '700',
      color: theme.text.primary,
      marginBottom: 4,
      textAlign: isRTL ? 'right' : 'left',
    },
    planCycle: {
      fontSize: 14,
      color: theme.text.secondary,
      marginBottom: 16,
      textAlign: isRTL ? 'right' : 'left',
    },
    planDescription: {
      fontSize: 14,
      color: theme.text.secondary,
      marginBottom: 16,
      lineHeight: 20,
      textAlign: isRTL ? 'right' : 'left',
    },
    featuresList: {
      marginBottom: 20,
      width: '100%',
    },
    featureItem: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'flex-start',
      marginBottom: 12,
      width: '100%',
    },
    featureIcon: {
      marginRight: isRTL ? 0 : 10,
      marginLeft: isRTL ? 10 : 0,
      marginTop: 2,
    },
    featureText: {
      flex: 1,
      fontSize: 14,
      color: theme.text.primary,
      lineHeight: 20,
      textAlign: isRTL ? 'right' : 'left',
    },
    selectButton: {
      backgroundColor: theme.primary.main,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      width: '100%',
    },
    selectButtonDisabled: {
      backgroundColor: theme.ui.border,
    },
    selectButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.primary.contrast,
    },

    // Billing Cycle Selector
    billingCycleContainer: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      backgroundColor: theme.background.tertiary,
      padding: 4,
      borderRadius: 12,
      marginBottom: 16,
      marginHorizontal: 16,
    },
    billingCycleButton: {
      flex: 1,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 10,
      alignItems: 'center',
    },
    billingCycleButtonActive: {
      backgroundColor: theme.background.secondary,
      shadowColor: theme.shadow.color,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    billingCycleText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.text.secondary,
    },
    billingCycleTextActive: {
      color: theme.primary.main,
    },
    billingSavings: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.success.main,
      marginTop: 2,
    },

    // Action Buttons
    actionButton: {
      backgroundColor: theme.background.secondary,
      marginHorizontal: 16,
      marginBottom: 12,
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.ui.border,
    },
    actionButtonDestructive: {
      borderColor: theme.error.main,
    },
    actionButtonContent: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    actionButtonLeft: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      flex: 1,
    },
    actionButtonIcon: {
      marginRight: isRTL ? 0 : 12,
      marginLeft: isRTL ? 12 : 0,
    },
    actionButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.primary.main,
    },
    actionButtonTextDestructive: {
      color: theme.error.main,
    },

    // Empty State
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 40,
    },
    emptyStateIcon: {
      marginBottom: 16,
    },
    emptyStateTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.text.primary,
      marginBottom: 8,
      textAlign: 'center',
    },
    emptyStateText: {
      fontSize: 15,
      color: theme.text.secondary,
      textAlign: 'center',
    },

    // Loading State
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
      backgroundColor: theme.background.primary,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: theme.text.secondary,
    },

    // History Item
    historyCard: {
      backgroundColor: theme.background.secondary,
      marginHorizontal: 16,
      marginBottom: 12,
      padding: 16,
      borderRadius: 12,
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      borderLeftWidth: isRTL ? 0 : 4,
      borderRightWidth: isRTL ? 4 : 0,
    },
    historyContent: {
      flex: 1,
      alignItems: isRTL ? 'flex-end' : 'flex-start',
    },
    historyTier: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text.primary,
      marginBottom: 4,
    },
    historyDate: {
      fontSize: 13,
      color: theme.text.secondary,
    },
    historyStatus: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    historyStatusText: {
      fontSize: 12,
      fontWeight: '600',
    },

    // Comparison Table
    comparisonTable: {
      backgroundColor: theme.background.secondary,
      marginHorizontal: 16,
      marginBottom: 16,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: theme.ui.border,
    },
    comparisonRow: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.ui.divider,
    },
    comparisonFeature: {
      flex: 2,
      fontSize: 14,
      color: theme.text.primary,
      textAlign: isRTL ? 'right' : 'left',
    },
    comparisonCell: {
      flex: 1,
      alignItems: 'center',
    },
    portalButton: {
      marginTop: 16,
      borderRadius: 12,
      overflow: 'hidden',
      width: '100%',
    },
    portalButtonGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 20,
    },
    portalButtonText: {
      color: '#FFF',
      fontSize: 15,
      fontWeight: '700',
    },
    backButton: {
      marginRight: isRTL ? 0 : 12,
      marginLeft: isRTL ? 12 : 0,
      padding: 4,
    },
    maintenanceBanner: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      padding: 16,
      borderRadius: 12,
      marginHorizontal: 16,
      marginBottom: 20,
      gap: 12,
    },
    maintenanceText: {
      fontSize: 14,
      color: '#EF4444',
      fontWeight: '600',
      flex: 1,
      textAlign: isRTL ? 'right' : 'left',
    },
  });
};
