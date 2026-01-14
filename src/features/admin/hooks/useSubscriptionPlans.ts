/**
 * useSubscriptionPlans Hook
 * Manages subscription plans operations
 */

import { useState, useEffect, useCallback } from 'react';
import { subscriptionPlansService, SubscriptionPlanData } from '../../../core/services/api/adminEnhancements.service';

interface UseSubscriptionPlansOptions {
  autoFetch?: boolean;
}

export const useSubscriptionPlans = (options: UseSubscriptionPlansOptions = {}) => {
  const { autoFetch = true } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Plans list
  const [plans, setPlans] = useState<any[]>([]);
  const [activePlans, setActivePlans] = useState<any[]>([]);
  const [featuredPlans, setFeaturedPlans] = useState<any[]>([]);

  // Single plan
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);

  // Fetch all plans
  const fetchAllPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = (await subscriptionPlansService.getAllPlans()) as any;
      setPlans(data.data || data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch plans');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch active plans
  const fetchActivePlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = (await subscriptionPlansService.getActivePlans()) as any;
      setActivePlans(data.data || data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch active plans');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch featured plans
  const fetchFeaturedPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = (await subscriptionPlansService.getFeaturedPlans()) as any;
      setFeaturedPlans(data.data || data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch featured plans');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch plan by ID
  const fetchPlanById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await subscriptionPlansService.getPlanById(id);
      setSelectedPlan(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch plan');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create plan
  const createPlan = useCallback(
    async (data: SubscriptionPlanData) => {
      setLoading(true);
      setError(null);
      try {
        const result = await subscriptionPlansService.createPlan(data);
        await fetchAllPlans(); // Refresh list
        return result;
      } catch (err: any) {
        setError(err.message || 'Failed to create plan');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchAllPlans]
  );

  // Update plan
  const updatePlan = useCallback(
    async (id: string, data: Partial<SubscriptionPlanData>) => {
      setLoading(true);
      setError(null);
      try {
        const result = await subscriptionPlansService.updatePlan(id, data);
        await fetchAllPlans(); // Refresh list
        if (selectedPlan?._id === id) {
          setSelectedPlan(result);
        }
        return result;
      } catch (err: any) {
        setError(err.message || 'Failed to update plan');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchAllPlans, selectedPlan]
  );

  // Delete plan
  const deletePlan = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        await subscriptionPlansService.deletePlan(id);
        await fetchAllPlans(); // Refresh list
        if (selectedPlan?._id === id) {
          setSelectedPlan(null);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to delete plan');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchAllPlans, selectedPlan]
  );

  // Get plan subscribers
  const getPlanSubscribers = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = (await subscriptionPlansService.getPlanSubscribers(id)) as any;
      return data.data || data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch plan subscribers');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Toggle plan active status
  const togglePlanActive = useCallback(
    async (id: string, currentStatus: boolean) => {
      setLoading(true);
      setError(null);
      try {
        if (currentStatus) {
          await subscriptionPlansService.deactivatePlan(id);
        } else {
          await subscriptionPlansService.activatePlan(id);
        }
        await fetchAllPlans(); // Refresh list
      } catch (err: any) {
        setError(err.message || 'Failed to toggle plan status');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchAllPlans]
  );

  // Refresh
  const refresh = useCallback(async () => {
    await Promise.all([fetchAllPlans(), fetchActivePlans(), fetchFeaturedPlans()]);
  }, [fetchAllPlans, fetchActivePlans, fetchFeaturedPlans]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      refresh();
    }
  }, [autoFetch]);

  return {
    // Data
    plans,
    activePlans,
    featuredPlans,
    selectedPlan,
    loading,
    error,

    // CRUD operations
    createPlan,
    updatePlan,
    deletePlan,
    togglePlanActive,

    // Queries
    fetchAllPlans,
    fetchActivePlans,
    fetchFeaturedPlans,
    fetchPlanById,
    getPlanSubscribers,

    // Utilities
    refresh,
    setSelectedPlan,
  };
};
