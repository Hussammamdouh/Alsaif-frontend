/**
 * Subscription Mappers
 * Transform API responses to frontend types
 */

import {
  UserSubscription,
  SubscriptionPlan,
  SubscriptionHistory,
  CheckoutSession,
} from './subscription.types';
import { EXPIRY_WARNING_DAYS } from './subscription.constants';

/**
 * Map API subscription response to UserSubscription
 */
export const mapSubscriptionResponse = (apiResponse: any): UserSubscription => {
  const { tier, status, startDate, endDate, daysRemaining, source, payment } = apiResponse;

  // Calculate if expiring soon
  const isExpiringSoon = status === 'active' && daysRemaining !== undefined && daysRemaining <= EXPIRY_WARNING_DAYS;

  // Determine if can upgrade (free tier or expired)
  const canUpgrade = tier === 'free' || status === 'expired';

  // Determine if can renew (active but expiring soon, or expired)
  const canRenew = (status === 'active' && isExpiringSoon) || status === 'expired';

  return {
    id: apiResponse._id || 'no-subscription',
    tier,
    status,
    startDate,
    endDate,
    autoRenew: payment?.autoRenew || false,
    daysRemaining: daysRemaining || 0,
    isExpiringSoon,
    canUpgrade,
    canRenew,
    source: source || 'manual',
  };
};

/**
 * Map API plan response to SubscriptionPlan
 */
export const mapPlanResponse = (apiPlan: any): SubscriptionPlan => {
  return {
    _id: apiPlan._id,
    name: apiPlan.name,
    tier: apiPlan.tier,
    price: apiPlan.price,
    currency: apiPlan.currency || 'USD',
    billingCycle: apiPlan.billingCycle,
    features: apiPlan.features || [],
    description: apiPlan.description,
    isFeatured: apiPlan.isFeatured || false,
  };
};

/**
 * Map API history response to SubscriptionHistory
 */
export const mapHistoryResponse = (apiHistory: any): SubscriptionHistory => {
  return {
    _id: apiHistory._id,
    tier: apiHistory.tier,
    status: apiHistory.status,
    startDate: apiHistory.startDate,
    endDate: apiHistory.endDate,
    cancelledAt: apiHistory.cancelledAt,
    source: apiHistory.source || 'manual',
  };
};

/**
 * Map checkout session response
 */
export const mapCheckoutResponse = (apiCheckout: any): CheckoutSession => {
  return {
    checkoutUrl: apiCheckout.checkoutUrl,
    sessionId: apiCheckout.sessionId,
    amount: apiCheckout.amount,
    currency: apiCheckout.currency,
    planName: apiCheckout.planName,
    billingCycle: apiCheckout.billingCycle,
  };
};

/**
 * Format currency amount
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
};

/**
 * Format date
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

/**
 * Format relative time (e.g., "in 5 days", "2 days ago")
 */
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = date.getTime() - now.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays > 0) {
    return `in ${diffInDays} ${diffInDays === 1 ? 'day' : 'days'}`;
  } else if (diffInDays === 0) {
    return 'today';
  } else {
    const absDays = Math.abs(diffInDays);
    return `${absDays} ${absDays === 1 ? 'day' : 'days'} ago`;
  }
};

/**
 * Calculate price with billing cycle discount
 */
export const calculateDiscountedPrice = (
  basePrice: number,
  billingCycle: 'monthly' | 'quarterly' | 'yearly'
): number => {
  const discounts = {
    monthly: 0,
    quarterly: 0.1, // 10% off
    yearly: 0.2, // 20% off
  };

  const discount = discounts[billingCycle] || 0;
  return basePrice * (1 - discount);
};

/**
 * Get total price for billing cycle
 */
export const getTotalPrice = (
  monthlyPrice: number,
  billingCycle: 'monthly' | 'quarterly' | 'yearly'
): number => {
  const multipliers = {
    monthly: 1,
    quarterly: 3,
    yearly: 12,
  };

  const baseTotal = monthlyPrice * multipliers[billingCycle];
  return calculateDiscountedPrice(baseTotal, billingCycle);
};
