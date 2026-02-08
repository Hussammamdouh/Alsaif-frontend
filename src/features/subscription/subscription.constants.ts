/**
 * Subscription Constants
 * Constants for subscription feature
 */

import { SubscriptionTier, SubscriptionStatus } from './subscription.types';

export const SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
  FREE: 'free',
  BASIC: 'basic',
  STARTER: 'starter',
  PREMIUM: 'premium',
  PRO: 'pro',
  ENTERPRISE: 'enterprise',
};

export const SUBSCRIPTION_STATUSES: Record<string, SubscriptionStatus> = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
  PENDING: 'pending',
  NONE: 'none',
};

export const TIER_COLORS = {
  free: '#8e8e93',
  basic: '#007aff',
  starter: '#5ac8fa',
  premium: '#af52de',
  pro: '#ff9500',
  enterprise: '#ff3b30',
} as const;

export const TIER_ICONS = {
  free: 'person-outline',
  basic: 'ribbon-outline',
  starter: 'rocket-outline',
  premium: 'star',
  pro: 'trophy',
  enterprise: 'business',
} as const;

export const STATUS_COLORS = {
  active: '#34c759',
  expired: '#ff3b30',
  cancelled: '#8e8e93',
  pending: '#ff9500',
  none: '#c7c7cc',
} as const;

export const BILLING_CYCLE_LABELS = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
} as const;

export const BILLING_CYCLE_SAVINGS = {
  monthly: 0,
  quarterly: 10, // 10% savings
  yearly: 20, // 20% savings
} as const;

// Warning thresholds
export const EXPIRY_WARNING_DAYS = 7;
export const GRACE_PERIOD_DAYS = 3;

// Free tier benefits
export const FREE_TIER_FEATURES = [
  'Access to all free insights',
  'Basic market analysis',
  'Community discussions',
  'Email support',
];

export const FREE_TIER_LIMITATIONS = [
  'No premium insights',
  'Limited technical analysis',
  'Ads supported',
];

// API endpoints
export const API_ENDPOINTS = {
  SUBSCRIPTION_ME: '/api/subscriptions/me',
  SUBSCRIPTION_PLANS: '/api/subscriptions/plans',
  SUBSCRIPTION_HISTORY: '/api/subscriptions/history',
  SUBSCRIPTION_CHECKOUT: '/api/subscriptions/checkout',
  SUBSCRIPTION_RENEW: '/api/subscriptions/renew',
  SUBSCRIPTION_CANCEL: '/api/subscriptions/cancel',
  SUBSCRIPTION_BENEFITS: '/api/subscriptions/benefits',
  SUBSCRIPTION_VALIDATE_PROMO: '/api/subscriptions/validate-promo',
  MAGIC_LINK_GENERATE: '/api/magic-link/generate',
} as const;

// Messages
export const MESSAGES = {
  UPGRADE_SUCCESS: 'Successfully upgraded your subscription!',
  CANCEL_SUCCESS: 'Your subscription has been cancelled. You will retain access until the end of the current billing period.',
  CANCEL_CONFIRM_TITLE: 'Cancel Subscription',
  CANCEL_CONFIRM_MESSAGE: 'Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.',
  RENEW_SUCCESS: 'Your subscription has been renewed!',
  PROMO_APPLIED: 'Promo code applied successfully!',
  PROMO_INVALID: 'Invalid or expired promo code.',
  ERROR_LOADING: 'Failed to load subscription information. Please try again.',
  ERROR_CHECKOUT: 'Failed to initiate checkout. Please try again.',
  ERROR_CANCEL: 'Failed to cancel subscription. Please try again.',
  ERROR_RENEW: 'Failed to renew subscription. Please try again.',
  NO_PLANS_AVAILABLE: 'No subscription plans are currently available.',
  ACTIVE_SUBSCRIPTION_EXISTS: 'You already have an active subscription. Please cancel it before upgrading.',
} as const;
