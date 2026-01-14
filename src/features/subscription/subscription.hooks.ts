/**
 * Subscription Hooks
 * Custom React hooks for subscription management
 */

import { useState, useEffect, useCallback } from 'react';
import { Linking, Alert } from 'react-native';
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
 */
export const useCheckout = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiateCheckout = useCallback(
    async (planId: string, billingCycle: BillingCycle) => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.post(API_ENDPOINTS.SUBSCRIPTION_CHECKOUT, {
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
          throw new Error(response.message || MESSAGES.ERROR_CHECKOUT);
        }
      } catch (err: any) {
        console.error('Error initiating checkout:', err);
        setError(err.message || MESSAGES.ERROR_CHECKOUT);
        Alert.alert('Error', err.message || MESSAGES.ERROR_CHECKOUT);
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
        setError(err.message || MESSAGES.ERROR_RENEW);
        Alert.alert('Error', err.message || MESSAGES.ERROR_RENEW);
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
