/**
 * useAnalytics Hook
 * Manages analytics data fetching and state
 */

import { useState, useEffect, useCallback } from 'react';
import { analyticsService, revenueService } from '../../../core/services/api/adminEnhancements.service';

interface UseAnalyticsOptions {
  startDate?: Date;
  endDate?: Date;
  period?: 'day' | 'week' | 'month' | 'year';
  limit?: number;
  autoFetch?: boolean;
}

export const useAnalytics = (options: UseAnalyticsOptions = {}) => {
  const {
    startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate = new Date(),
    period = 'day',
    autoFetch = true,
  } = options;

  // Use string versions of dates for stable dependencies
  const startStr = startDate.toISOString();
  const endStr = endDate.toISOString();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // User Growth
  const [userGrowth, setUserGrowth] = useState<any[]>([]);
  const [userGrowthLoading, setUserGrowthLoading] = useState(false);

  // Engagement Metrics
  const [engagementMetrics, setEngagementMetrics] = useState<any>(null);
  const [engagementLoading, setEngagementLoading] = useState(false);

  // Content Performance
  const [contentPerformance, setContentPerformance] = useState<any[]>([]);
  const [contentLoading, setContentLoading] = useState(false);

  // Subscription Analytics
  const [subscriptionAnalytics, setSubscriptionAnalytics] = useState<any>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  // Conversion Funnel
  const [conversionFunnel, setConversionFunnel] = useState<any[]>([]);
  const [conversionLoading, setConversionLoading] = useState(false);

  // Retention Cohorts
  const [retentionCohorts, setRetentionCohorts] = useState<any[]>([]);
  const [retentionLoading, setRetentionLoading] = useState(false);

  // Feature Usage
  const [featureUsage, setFeatureUsage] = useState<any[]>([]);
  const [featureLoading, setFeatureLoading] = useState(false);

  // Geographic Distribution
  const [geoDistribution, setGeoDistribution] = useState<any[]>([]);
  const [geoLoading, setGeoLoading] = useState(false);

  // Device Analytics
  const [deviceAnalytics, setDeviceAnalytics] = useState<any>(null);
  const [deviceLoading, setDeviceLoading] = useState(false);

  // Revenue Overview (Merged from Revenue screen)
  const [revenueOverview, setRevenueOverview] = useState<any>(null);
  const [revenueLoading, setRevenueLoading] = useState(false);

  // Financial Metrics (Detailed)
  const [churnRate, setChurnRate] = useState<any>(null);
  const [arpu, setArpu] = useState<any>(null);
  const [ltv, setLtv] = useState<any>(null);
  const [revenueTrends, setRevenueTrends] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [failedPayments, setFailedPayments] = useState<any[]>([]);
  const [revenueForecast, setRevenueForecast] = useState<any[]>([]);
  const [breakdownLoading, setBreakdownLoading] = useState(false);

  // Comparison Data
  const [comparison, setComparison] = useState<any>(null);
  const [comparisonLoading, setComparisonLoading] = useState(false);

  // Fetch User Growth
  const fetchUserGrowth = useCallback(async () => {
    setUserGrowthLoading(true);
    setError(null);
    try {
      const data = await analyticsService.getUserGrowth({
        startDate: startStr,
        endDate: endStr,
        period,
      }) as any[];
      setUserGrowth(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch user growth');
    } finally {
      setUserGrowthLoading(false);
    }
  }, [startStr, endStr, period]);

  // Fetch Engagement Metrics
  const fetchEngagementMetrics = useCallback(async () => {
    setEngagementLoading(true);
    setError(null);
    try {
      const data = await analyticsService.getEngagementOverview({
        startDate: startStr,
        endDate: endStr,
      });
      setEngagementMetrics(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch engagement metrics');
    } finally {
      setEngagementLoading(false);
    }
  }, [startStr, endStr]);

  // Fetch Content Performance
  const fetchContentPerformance = useCallback(async () => {
    setContentLoading(true);
    setError(null);
    try {
      const data = await analyticsService.getContentPerformance({
        startDate: startStr,
        endDate: endStr,
        limit: 10,
      }) as any[];
      setContentPerformance(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch content performance');
    } finally {
      setContentLoading(false);
    }
  }, [startStr, endStr]);

  // Fetch Subscription Analytics
  const fetchSubscriptionAnalytics = useCallback(async () => {
    setSubscriptionLoading(true);
    setError(null);
    try {
      const data = await analyticsService.getSubscriptionAnalytics();
      setSubscriptionAnalytics(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch subscription analytics');
    } finally {
      setSubscriptionLoading(false);
    }
  }, []);

  // Fetch Conversion Funnel
  const fetchConversionFunnel = useCallback(async () => {
    setConversionLoading(true);
    setError(null);
    try {
      const data = await analyticsService.getConversionFunnel({
        startDate: startStr,
        endDate: endStr,
      }) as any[];
      setConversionFunnel(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch conversion funnel');
    } finally {
      setConversionLoading(false);
    }
  }, [startStr, endStr]);

  // Fetch Retention Cohorts
  const fetchRetentionCohorts = useCallback(async () => {
    setRetentionLoading(true);
    setError(null);
    try {
      const data = await analyticsService.getRetentionCohorts({
        startDate: startStr,
        endDate: endStr,
      }) as any[];
      setRetentionCohorts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch retention cohorts');
    } finally {
      setRetentionLoading(false);
    }
  }, [startStr, endStr]);

  // Fetch Feature Usage
  const fetchFeatureUsage = useCallback(async () => {
    setFeatureLoading(true);
    setError(null);
    try {
      const data = await analyticsService.getFeatureUsage({
        startDate: startStr,
        endDate: endStr,
      }) as any[];
      setFeatureUsage(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch feature usage');
    } finally {
      setFeatureLoading(false);
    }
  }, [startStr, endStr]);

  // Fetch Geographic Distribution
  const fetchGeoDistribution = useCallback(async () => {
    setGeoLoading(true);
    setError(null);
    try {
      const data = await analyticsService.getGeoDistribution() as any[];
      setGeoDistribution(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch geographic distribution');
    } finally {
      setGeoLoading(false);
    }
  }, []);

  // Fetch Device Analytics
  const fetchDeviceAnalytics = useCallback(async () => {
    setDeviceLoading(true);
    setError(null);
    try {
      const data = await analyticsService.getDeviceAnalytics();
      setDeviceAnalytics(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch device analytics');
    } finally {
      setDeviceLoading(false);
    }
  }, []);

  // Fetch Revenue Overview
  const fetchRevenueOverview = useCallback(async () => {
    setRevenueLoading(true);
    try {
      const data = await analyticsService.getRevenueOverview({
        startDate: startStr,
        endDate: endStr,
      });
      setRevenueOverview(data);
    } catch (err: any) {
      console.error('Failed to fetch revenue overview:', err);
    } finally {
      setRevenueLoading(false);
    }
  }, [startStr, endStr]);

  // Fetch Detailed Revenue Breakdown (Merged from useRevenue)
  const fetchRevenueBreakdown = useCallback(async () => {
    setBreakdownLoading(true);
    try {
      const [trends, methods, failed, forecast, churn, arpuData, ltvData] = await Promise.all([
        revenueService.getTrends({ startDate: startStr, endDate: endStr, period: 'month' }),
        revenueService.getPaymentBreakdown({ startDate: startStr, endDate: endStr }),
        revenueService.getFailedPayments({ limit: 5, startDate: startStr, endDate: endStr }),
        revenueService.getForecast({ months: 6 }),
        revenueService.getOverview({ startDate: startStr, endDate: endStr }), // Churn
        revenueService.getOverview({ startDate: startStr, endDate: endStr }), // ARPU
        revenueService.getOverview({ startDate: startStr, endDate: endStr }), // LTV
      ]) as [any, any, any, any, any, any, any];

      setRevenueTrends(trends || []);
      setPaymentMethods(methods || []);
      setFailedPayments(failed?.payments || []);
      setRevenueForecast(forecast?.forecast || []);

      // Use data directly
      if (churn) {
        setChurnRate(churn.churnRate);
        setArpu(churn.arpu);
        setLtv(churn.ltv || churn.averageLTV);
      }
    } catch (err: any) {
      console.error('Failed to fetch revenue breakdown:', err);
    } finally {
      setBreakdownLoading(false);
    }
  }, [startStr, endStr]);

  // Fetch Comparison data
  const fetchComparison = useCallback(async () => {
    setComparisonLoading(true);
    try {
      const start = new Date(startStr);
      const end = new Date(endStr);
      const duration = end.getTime() - start.getTime();
      const previousStart = new Date(start.getTime() - duration);
      const previousEnd = new Date(end.getTime() - duration);

      const data = await analyticsService.comparePeriods({
        currentStart: startStr,
        currentEnd: endStr,
        previousStart: previousStart.toISOString(),
        previousEnd: previousEnd.toISOString(),
      });
      setComparison(data);
    } catch (err: any) {
      console.error('Failed to fetch comparison data:', err);
    } finally {
      setComparisonLoading(false);
    }
  }, [startStr, endStr]);

  // Fetch All Analytics
  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      fetchUserGrowth(),
      fetchEngagementMetrics(),
      fetchContentPerformance(),
      fetchSubscriptionAnalytics(),
      fetchConversionFunnel(),
      fetchRetentionCohorts(),
      fetchFeatureUsage(),
      fetchGeoDistribution(),
      fetchDeviceAnalytics(),
      fetchRevenueOverview(),
      fetchRevenueBreakdown(),
      fetchComparison(),
    ]);
    setLoading(false);
  }, [
    fetchUserGrowth,
    fetchEngagementMetrics,
    fetchContentPerformance,
    fetchSubscriptionAnalytics,
    fetchConversionFunnel,
    fetchRetentionCohorts,
    fetchFeatureUsage,
    fetchGeoDistribution,
    fetchDeviceAnalytics,
    fetchRevenueOverview,
    fetchRevenueBreakdown,
    fetchComparison,
  ]);

  // Refresh data
  const refresh = useCallback(async () => {
    await fetchAll();
  }, [fetchAll]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchAll();
    }
  }, [autoFetch, fetchAll]);

  return {
    // Global state
    loading,
    error,

    // User Growth
    userGrowth,
    userGrowthLoading,
    fetchUserGrowth,

    // Engagement
    engagementMetrics,
    engagementLoading,
    fetchEngagementMetrics,

    // Content
    contentPerformance,
    contentLoading,
    fetchContentPerformance,

    // Subscriptions
    subscriptionAnalytics,
    subscriptionLoading,
    fetchSubscriptionAnalytics,

    // Conversion
    conversionFunnel,
    conversionLoading,
    fetchConversionFunnel,

    // Retention
    retentionCohorts,
    retentionLoading,
    fetchRetentionCohorts,

    // Features
    featureUsage,
    featureLoading,
    fetchFeatureUsage,

    // Geography
    geoDistribution,
    geoLoading,
    fetchGeoDistribution,

    // Devices
    deviceAnalytics,
    deviceLoading,
    fetchDeviceAnalytics,

    // Revenue
    revenueOverview,
    revenueLoading,
    fetchRevenueOverview,
    revenueTrends,
    paymentMethods,
    failedPayments,
    revenueForecast,
    churnRate,
    arpu,
    ltv,
    breakdownLoading,
    fetchRevenueBreakdown,

    // Comparison
    comparison,
    comparisonLoading,
    fetchComparison,

    // Utilities
    refresh,
    fetchAll,
  };
};
