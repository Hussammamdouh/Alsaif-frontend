/**
 * Subscription Feature - Public API
 * Export all components, hooks, types, and utilities
 */

// Screen Components
export { SubscriptionScreen } from './SubscriptionScreen';
export { PaywallScreen } from './PaywallScreen';
export { SubscriptionPlansScreen } from './SubscriptionPlansScreen';

// Access Control Components
export { UpgradePrompt, UpgradePromptInline } from './UpgradePrompt';

// Custom Hooks
export {
  useSubscription,
  useSubscriptionPlans,
  useSubscriptionHistory,
  useCheckout,
} from './subscription.hooks';

// Access Control Hook
export { useSubscriptionAccess } from './useSubscriptionAccess';

// Types
export type {
  SubscriptionTier,
  SubscriptionStatus,
  BillingCycle,
  SubscriptionPlan,
  SubscriptionPlanFeature,
  UserSubscription,
  SubscriptionHistoryEntry,
  CheckoutSession,
  SubscriptionApiResponse,
  SubscriptionPlansApiResponse,
  SubscriptionHistoryApiResponse,
  CheckoutApiResponse,
} from './subscription.types';

// Constants (select exports)
export {
  TIER_COLORS,
  TIER_ICONS,
  STATUS_COLORS,
  BILLING_CYCLE_LABELS,
  BILLING_CYCLE_SAVINGS,
  EXPIRY_WARNING_DAYS,
  MESSAGES,
} from './subscription.constants';

// Utilities
export {
  mapSubscriptionResponse,
  mapSubscriptionPlanResponse,
  mapSubscriptionHistoryResponse,
  mapCheckoutResponse,
  formatCurrency,
  formatDate,
  formatRelativeTime,
  calculateDiscountedPrice,
  calculateEndDate,
} from './subscription.mapper';
