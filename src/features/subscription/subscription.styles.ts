/**
 * Subscription Styles
 * StyleSheet for subscription screen
 */

import { StyleSheet } from 'react-native';

export const subscriptionStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },

  // Header Section
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#8e8e93',
  },

  // Current Plan Card
  currentPlanCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  planBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  planBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: '#fff',
  },
  planName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  planStatus: {
    fontSize: 16,
    marginBottom: 16,
  },
  statusActive: {
    color: '#34c759',
  },
  statusExpired: {
    color: '#ff3b30',
  },
  statusCancelled: {
    color: '#8e8e93',
  },
  planDetails: {
    marginTop: 12,
  },
  planDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f7',
  },
  planDetailLabel: {
    fontSize: 15,
    color: '#8e8e93',
  },
  planDetailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },

  // Warning Banner
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff950020',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9500',
  },
  warningIcon: {
    marginRight: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#ff9500',
    lineHeight: 20,
  },

  // Section
  section: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
  },

  // Plan Cards
  planCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  planCardFeatured: {
    borderColor: '#007aff',
  },
  featuredBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#007aff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  featuredBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  planIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  planTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
  },
  planPrice: {
    fontSize: 36,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  planCycle: {
    fontSize: 14,
    color: '#8e8e93',
    marginBottom: 16,
  },
  planDescription: {
    fontSize: 14,
    color: '#8e8e93',
    marginBottom: 16,
    lineHeight: 20,
  },
  featuresList: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  featureIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: '#000',
    lineHeight: 20,
  },
  selectButton: {
    backgroundColor: '#007aff',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  selectButtonDisabled: {
    backgroundColor: '#c7c7cc',
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },

  // Billing Cycle Selector
  billingCycleContainer: {
    flexDirection: 'row',
    backgroundColor: '#f2f2f7',
    padding: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  billingCycleButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  billingCycleButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  billingCycleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8e8e93',
  },
  billingCycleTextActive: {
    color: '#007aff',
  },
  billingSavings: {
    fontSize: 10,
    fontWeight: '700',
    color: '#34c759',
    marginTop: 2,
  },

  // Action Buttons
  actionButton: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5ea',
  },
  actionButtonDestructive: {
    borderColor: '#ff3b30',
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionButtonIcon: {
    marginRight: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007aff',
  },
  actionButtonTextDestructive: {
    color: '#ff3b30',
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
    color: '#000',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 15,
    color: '#8e8e93',
    textAlign: 'center',
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8e8e93',
  },

  // History Item
  historyCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
  },
  historyContent: {
    flex: 1,
  },
  historyTier: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 13,
    color: '#8e8e93',
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
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
  },
  comparisonRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f7',
  },
  comparisonFeature: {
    flex: 2,
    fontSize: 14,
    color: '#000',
  },
  comparisonCell: {
    flex: 1,
    alignItems: 'center',
  },
});
