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
  mapPromoValidationResponse,
} from './subscription.mapper';
import { API_ENDPOINTS, MESSAGES } from './subscription.constants';
import { mapStripeError } from './subscription.utils';
import { purchaseAppleSubscription } from './subscription.iap';

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
    async (planId: string, billingCycle: BillingCycle, promoCode?: string) => {
      try {
        setLoading(true);
        setError(null);

        const isWeb = Platform.OS === 'web';
        const isIOS = Platform.OS === 'ios';

        if (isIOS) {
          console.log(`[useCheckout] Initiating iOS In-App Purchase for plan: ${planId}`);
          // Fetch plans from API to retrieve the appleProductId
          const plansResponse = await apiClient.get(API_ENDPOINTS.SUBSCRIPTION_PLANS) as any;
          if (!plansResponse.success || !plansResponse.data?.plans) {
            throw new Error('Failed to load subscription plans details.');
          }
          const targetPlan = plansResponse.data.plans.find((p: any) => p._id === planId);
          if (!targetPlan || !targetPlan.appleProductId) {
            throw new Error('This plan is not configured for In-App Purchase on iOS.');
          }

          // Trigger native StoreKit purchase flow
          const success = await purchaseAppleSubscription(targetPlan.appleProductId, () => {
            // Success callback - verification completed
            console.log('[useCheckout] Apple subscription verified successfully.');
          });
          return success;
        }

        if (isWeb) {
          // Web: Direct Stripe checkout
          const response = await apiClient.post(API_ENDPOINTS.SUBSCRIPTION_CHECKOUT, {
            planId,
            billingCycle,
            promoCode,
          }) as any;

          if (response.success && response.data.checkoutUrl) {
            const checkout = mapCheckoutResponse(response.data);
            const checkoutUrl = checkout.checkoutUrl;

            // Use browser confirm dialog directly on web to ensure interactive callback is called synchronously
            const confirmed = window.confirm(
              'Secure Payment\n\nYou will be redirected to our secure payment gateway (Stripe) to complete your payment.'
            );
            if (confirmed) {
              window.location.href = checkoutUrl;
            }

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
            promoCode,
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
          const checkoutUrl = checkout.checkoutUrl;
          const isWeb = Platform.OS === 'web';
          const isIOS = Platform.OS === 'ios';

          if (isIOS) {
            // iOS: Auto-renewing subscriptions are managed by StoreKit.
            // If manual renewal is requested, route via regular In-App Purchase checkout.
            return initiateCheckout(planId, billingCycle);
          }

          if (isWeb) {
            // Use browser confirm dialog directly on web to ensure interactive callback is called synchronously
            const confirmed = window.confirm(
              'Secure Payment\n\nYou will be redirected to our secure payment gateway (Stripe) to renew your subscription.'
            );
            if (confirmed) {
              window.location.href = checkoutUrl;
            }
            return true;
          } else {
            // Show secure redirect dialog to satisfy Safari blockers on mobile Safari
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
                    const canOpen = await Linking.canOpenURL(checkoutUrl);
                    if (canOpen) {
                      await Linking.openURL(checkoutUrl);
                    } else {
                      throw new Error('Cannot open payment URL');
                    }
                  },
                },
              ]
            );
            return true;
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

  const validatePromoCode = useCallback(
    async (code: string, planId: string, billingCycle: BillingCycle) => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get(
          `${API_ENDPOINTS.SUBSCRIPTION_VALIDATE_PROMO}/${code}?tier=${planId}&billingCycle=${billingCycle}`
        ) as any;

        if (response.success && response.data) {
          return mapPromoValidationResponse(response.data);
        } else {
          throw new Error(response.message || 'Invalid promo code');
        }
      } catch (err: any) {
        console.error('Error validating promo code:', err);
        setError(err.message || 'Error validating promo code');
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const initiateWebPortal = useCallback(
    async () => {
      try {
        setLoading(true);
        setError(null);

        const isWeb = Platform.OS === 'web';

        if (isWeb) {
          return true;
        }

        // Native: Generate magic link and open in external browser
        const response = await apiClient.post(API_ENDPOINTS.MAGIC_LINK_GENERATE, {
          purpose: 'subscription',
          returnUrl: 'alsaif-analysis://subscription-plans',
        }) as any;

        if (response.success && response.data.checkoutUrl) {
          const portalUrl = response.data.checkoutUrl;
          
          // Show info alert about external browser
          Alert.alert(
            'Redirecting to Web',
            'You will be redirected to our website to manage your account. You will be logged in automatically.',
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Continue',
                onPress: async () => {
                  const canOpen = await Linking.canOpenURL(portalUrl);
                  if (canOpen) {
                    await Linking.openURL(portalUrl);
                  } else {
                    throw new Error('Cannot open portal URL');
                  }
                },
              },
            ]
          );
          return true;
        } else {
          throw new Error(response.message || 'Failed to generate portal link');
        }
      } catch (err: any) {
        console.error('Error initiating web portal:', err);
        setError(err.message || 'An error occurred. Please try again.');
        Alert.alert('Error', err.message || 'An error occurred. Please try again.');
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
    validatePromoCode,
    initiateWebPortal,
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
    financialLicenseUrl?: string;
    supportEmails?: string[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch system settings from the public/authenticated subscription endpoint
      const response = await apiClient.get(API_ENDPOINTS.SUBSCRIPTION_SYSTEM_SETTINGS) as any;

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

  const toggleSubscriptionPause = async (pausedState?: boolean) => {
    if (!settings && pausedState === undefined) return;
    try {
      setLoading(true);
      const paused = pausedState !== undefined ? pausedState : !settings?.isSubscriptionsPaused;
      const response = await apiClient.post('/api/superadmin/subscriptions/pause', { paused }) as any;
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

  const toggleNewSubscriptions = async (enabledState?: boolean, customMessage?: string) => {
    if (!settings && enabledState === undefined) return;
    try {
      setLoading(true);
      const enabled = enabledState !== undefined ? enabledState : !settings?.isNewSubscriptionsEnabled;
      const message = customMessage || settings?.subscriptionDisabledMessage || 'New subscriptions are temporarily disabled';
      const response = await apiClient.post('/api/superadmin/subscriptions/toggle-new', { enabled, message }) as any;
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
