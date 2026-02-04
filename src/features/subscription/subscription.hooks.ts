/**
 * Subscription Hooks
 * Custom React hooks for subscription management
 */

import { useState, useEffect, useCallback } from 'react';
import { Linking, Alert, Platform } from 'react-native';
import apiClient from '../../core/services/api/apiClient';
import {
  UserSubscription,
  SubscriptionPlan,
  SubscriptionHistory,
  BillingCycle,
} from './subscription.types';
import {
  mapSubscriptionResponse,
  mapPlanResponse,
  mapHistoryResponse,
  mapCheckoutResponse,
} from './subscription.mapper';
import { API_ENDPOINTS, MESSAGES } from './subscription.constants';
import { mapStripeError } from './subscription.utils';

/**
 * Hook to manage current user's subscription
 */
export const useSubscription = () => {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get(API_ENDPOINTS.SUBSCRIPTION_ME) as any;

      if (response.success && response.data.subscription) {
        const mappedSubscription = mapSubscriptionResponse(response.data.subscription);
        setSubscription(mappedSubscription);
      }
    } catch (err: any) {
      console.error('Error fetching subscription:', err);
      setError(err.message || MESSAGES.ERROR_LOADING);
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelSubscription = useCallback(async (reason?: string) => {
    try {
      setLoading(true);
      setError(null);

      await apiClient.post(API_ENDPOINTS.SUBSCRIPTION_CANCEL, { reason });

      // Refresh subscription data
      await fetchSubscription();

      Alert.alert('Success', MESSAGES.CANCEL_SUCCESS);
      return true;
    } catch (err: any) {
      console.error('Error cancelling subscription:', err);
      setError(err.message || MESSAGES.ERROR_CANCEL);
      Alert.alert('Error', err.message || MESSAGES.ERROR_CANCEL);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchSubscription]);

  const promptCancelSubscription = useCallback(() => {
    Alert.alert(
      MESSAGES.CANCEL_CONFIRM_TITLE,
      MESSAGES.CANCEL_CONFIRM_MESSAGE,
      [
        {
          text: 'Keep Subscription',
          style: 'cancel',
        },
        {
          text: 'Cancel Subscription',
          style: 'destructive',
          onPress: () => cancelSubscription(),
        },
      ]
    );
  }, [cancelSubscription]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  return {
    subscription,
    loading,
    error,
    refetch: fetchSubscription,
    cancelSubscription: promptCancelSubscription,
  };
};

/**
 * Hook to manage available subscription plans
 */
export const useSubscriptionPlans = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get(API_ENDPOINTS.SUBSCRIPTION_PLANS) as any;

      if (response.success && response.data.plans) {
        const mappedPlans = response.data.plans.map(mapPlanResponse);
        setPlans(mappedPlans);
      }
    } catch (err: any) {
      console.error('Error fetching plans:', err);
      setError(err.message || MESSAGES.ERROR_LOADING);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  return {
    plans,
    loading,
    error,
    refetch: fetchPlans,
  };
};

/**
 * Hook to manage subscription history
 */
export const useSubscriptionHistory = () => {
  const [history, setHistory] = useState<SubscriptionHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const fetchHistory = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get(
        `${API_ENDPOINTS.SUBSCRIPTION_HISTORY}?page=${page}&limit=20`
      ) as any;

      if (response.success && response.data.subscriptions) {
        const mappedHistory = response.data.subscriptions.map(mapHistoryResponse);
        setHistory(mappedHistory);
        setPagination(response.data.pagination);
      }
    } catch (err: any) {
      console.error('Error fetching history:', err);
      setError(err.message || MESSAGES.ERROR_LOADING);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (pagination.page < pagination.totalPages && !loading) {
      fetchHistory(pagination.page + 1);
    }
  }, [pagination, loading, fetchHistory]);

  return {
    history,
    loading,
    error,
    pagination,
    fetchHistory,
    loadMore,
  };
};

/**
 * Hook to handle subscription checkout
 * Web: Direct Stripe checkout redirect
 * Native: Magic link + external browser for "Reader App" compliance
 */
export const useCheckout = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiateCheckout = useCallback(
    async (planId: string, billingCycle: BillingCycle) => {
      try {
        setLoading(true);
        setError(null);

        const isWeb = Platform.OS === 'web';

        if (isWeb) {
          // Web: Direct Stripe checkout
          const response = await apiClient.post(API_ENDPOINTS.SUBSCRIPTION_CHECKOUT, {
            planId,
            billingCycle,
          }) as any;

          if (response.success && response.data.checkoutUrl) {
            const checkout = mapCheckoutResponse(response.data);
            const checkoutUrl = checkout.checkoutUrl;

            // Use multiple redirect methods for maximum Safari compatibility
            // Method 1: Try location.assign (works in most cases)
            try {
              window.location.assign(checkoutUrl);
            } catch (e) {
              // Method 2: Fallback to programmatic anchor click
              // This simulates a user clicking a link, which Safari respects
              const link = document.createElement('a');
              link.href = checkoutUrl;
              link.style.display = 'none';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }

            // Method 3: Final fallback with setTimeout
            setTimeout(() => {
              if (window.location.href.indexOf('stripe.com') === -1) {
                window.location.href = checkoutUrl;
              }
            }, 100);

            return true;
          } else {
            throw new Error(response.message || MESSAGES.ERROR_CHECKOUT);
          }
        } else {
          // Native: Generate magic link and open in external browser
          const response = await apiClient.post(API_ENDPOINTS.MAGIC_LINK_GENERATE, {
            purpose: 'checkout',
            planId,
            billingCycle,
            returnUrl: 'alsaif-analysis://payment-success',
          }) as any;

          if (response.success && response.data.checkoutUrl) {
            // Show info alert about external browser
            Alert.alert(
              'Secure Payment',
              'You will be redirected to our secure web payment page. After completing payment, you will be returned to the app.',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'Continue',
                  onPress: async () => {
                    const canOpen = await Linking.canOpenURL(response.data.checkoutUrl);
                    if (canOpen) {
                      await Linking.openURL(response.data.checkoutUrl);
                    } else {
                      throw new Error('Cannot open payment URL');
                    }
                  },
                },
              ]
            );
            return true;
          } else {
            throw new Error(response.message || MESSAGES.ERROR_CHECKOUT);
          }
        }
      } catch (err: any) {
        console.error('Error initiating checkout:', err);
        const userFriendlyError = mapStripeError(err);
        setError(userFriendlyError);
        Alert.alert('Payment Error', userFriendlyError);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const initiateRenewal = useCallback(
    async (planId: string, billingCycle: BillingCycle) => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.post(API_ENDPOINTS.SUBSCRIPTION_RENEW, {
          planId,
          billingCycle,
        }) as any;

        if (response.success && response.data.checkoutUrl) {
          const checkout = mapCheckoutResponse(response.data);

          // Open checkout URL in external browser
          const canOpen = await Linking.canOpenURL(checkout.checkoutUrl);

          if (canOpen) {
            await Linking.openURL(checkout.checkoutUrl);
            return true;
          } else {
            throw new Error('Cannot open payment URL');
          }
        } else {
          throw new Error(response.message || MESSAGES.ERROR_RENEW);
        }
      } catch (err: any) {
        console.error('Error initiating renewal:', err);
        const userFriendlyError = mapStripeError(err);
        setError(userFriendlyError);
        Alert.alert('Payment Error', userFriendlyError);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    initiateCheckout,
    initiateRenewal,
  };
};

/**
 * Hook to manage system settings (lockouts, pauses)
 */
export const useSystemSettings = () => {
  const [settings, setSettings] = useState<{
    isSubscriptionsPaused: boolean;
    isNewSubscriptionsEnabled: boolean;
    subscriptionDisabledMessage: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // This is a superadmin endpoint, but we need a public or general authenticated one for users to see status
      // Actually, let's assume we made getSystemSettings accessible or we need a public endpoint.
      // For now, I'll use the superadmin one but typically you'd want a common/config endpoint.
      const response = await apiClient.get('/superadmin/system/settings') as any;

      if (response.success && response.data) {
        setSettings(response.data);
      }
    } catch (err: any) {
      console.error('Error fetching system settings:', err);
      setError(err.message || MESSAGES.ERROR_LOADING);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const toggleSubscriptionPause = async () => {
    try {
      setLoading(true);
      const response = await apiClient.post('/superadmin/subscriptions/pause', {}) as any;
      if (response.success && response.data) {
        setSettings(response.data);
      } else {
        setError(response.error || 'Failed to toggle pause');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleNewSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await apiClient.post('/superadmin/subscriptions/toggle-new', {}) as any;
      if (response.success && response.data) {
        setSettings(response.data);
      } else {
        setError(response.error || 'Failed to toggle new subscriptions');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return {
    settings,
    loading,
    error,
    refetch: fetchSettings,
    toggleSubscriptionPause,
    toggleNewSubscriptions,
  };
};
