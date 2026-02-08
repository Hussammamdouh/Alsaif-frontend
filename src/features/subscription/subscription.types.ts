/**
 * Subscription Types
 * TypeScript type definitions for subscription management
 */

export type SubscriptionTier = 'free' | 'basic' | 'starter' | 'premium' | 'pro' | 'enterprise';

export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'pending' | 'none';

export type BillingCycle = 'monthly' | 'quarterly' | 'yearly';

export interface SubscriptionPlanFeature {
  name: string;
  included: boolean;
  value?: string | number | boolean;
  description?: string;
}

export interface SubscriptionPlan {
  _id: string;
  name: string;
  tier: SubscriptionTier;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  features: SubscriptionPlanFeature[];
  description?: string;
  isFeatured: boolean;
  stripeProductId?: string;
  stripePriceId?: string;
}

export interface UserSubscription {
  id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  startDate: string;
  endDate?: string;
  autoRenew: boolean;
  daysRemaining: number;
  isExpiringSoon: boolean;
  canUpgrade: boolean;
  canRenew: boolean;
  source: string;
}

export interface SubscriptionHistory {
  _id: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  startDate: string;
  endDate?: string;
  cancelledAt?: string;
  source: string;
}

export interface CheckoutSession {
  checkoutUrl: string;
  sessionId: string;
  amount: number;
  currency: string;
  planName: string;
  billingCycle: BillingCycle;
}

export interface PromoValidation {
  code: string;
  type: 'percentage' | 'fixed_amount' | 'free_trial';
  value: number;
  description?: string;
}

export interface SubscriptionState {
  currentSubscription: UserSubscription | null;
  availablePlans: SubscriptionPlan[];
  history: SubscriptionHistory[];
  loading: boolean;
  error: string | null;
}
