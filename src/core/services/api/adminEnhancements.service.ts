/**
 * Admin Enhancements API Service
 * Centralized API calls for all new admin features
 */

import { apiClient } from './apiClient';


// ============================================================================
// ANALYTICS API
// ============================================================================

export interface DateRangeParams {
  startDate?: string;
  endDate?: string;
  period?: 'day' | 'week' | 'month' | 'year';
  limit?: number;
}

export interface Banner {
  id?: string;
  _id?: string;
  title: string;
  imageUrl: string;
  link?: string;
  partner?: string;
  isActive: boolean;
  order: number;
  type: 'free' | 'premium' | 'both';
  displayDurationDays?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export const analyticsService = {
  /**
   * Get analytics overview
   */
  getOverview: (params?: DateRangeParams) =>
    apiClient.get<any>('/api/admin/analytics/overview', params).then(res => res.data || res),

  /**
   * Get user growth metrics
   */
  getUserGrowth: (params?: DateRangeParams) =>
    apiClient.get<any>('/api/admin/analytics/users/growth', params).then(res => res.data || res),

  /**
   * Get user retention cohorts
   */
  getRetentionCohorts: (params?: DateRangeParams) =>
    apiClient.get<any>('/api/admin/analytics/users/retention', params).then(res => res.data || res),

  /**
   * Get user demographics
   */
  getUserDemographics: () =>
    apiClient.get<any>('/api/admin/analytics/users/demographics').then(res => res.data || res),

  /**
   * Get revenue overview
   */
  getRevenueOverview: (params?: DateRangeParams) =>
    apiClient.get<any>('/api/admin/analytics/revenue/overview', params).then(res => res.data || res),

  /**
   * Get revenue trends
   */
  getRevenueTrends: (params?: DateRangeParams) =>
    apiClient.get<any>('/api/admin/analytics/revenue/trends', params).then(res => res.data || res),

  /**
   * Get content performance
   */
  getContentPerformance: (params?: DateRangeParams) =>
    apiClient.get<any>('/api/admin/analytics/content/performance', params).then(res => res.data || res),

  /**
   * Get engagement overview
   */
  getEngagementOverview: (params?: DateRangeParams) =>
    apiClient.get<any>('/api/admin/analytics/engagement/overview', params).then(res => res.data || res),

  /**
   * Get conversion funnel
   */
  getConversionFunnel: (params?: DateRangeParams) =>
    apiClient.get<any>('/api/admin/analytics/conversion/funnel', params).then(res => res.data || res),

  /**
   * Get realtime stats
   */
  getRealtimeStats: () =>
    apiClient.get<any>('/api/admin/analytics/realtime/stats').then(res => res.data || res),

  /**
   * Compare periods
   */
  comparePeriods: (params: { currentStart: string; currentEnd: string; previousStart: string; previousEnd: string }) =>
    apiClient.get<any>('/api/admin/analytics/compare/periods', params).then(res => res.data || res),

  /**
   * Get top content
   */
  getTopContent: (params?: { limit?: number } & DateRangeParams) =>
    apiClient.get<any>('/api/admin/analytics/top/content', params).then(res => res.data || res),

  /**
   * Get subscription analytics (by tier, status, etc.)
   */
  getSubscriptionAnalytics: () =>
    apiClient.get<any>('/api/admin/analytics/revenue/overview').then(res => res.data || res),

  /**
   * Get feature usage stats
   */
  getFeatureUsage: (params?: DateRangeParams) =>
    apiClient.get<any>('/api/admin/analytics/features/usage', params).then(res => res.data || res),

  /**
   * Get geographic distribution of users
   */
  getGeoDistribution: () =>
    apiClient.get<any>('/api/admin/analytics/users/geo').then(res => res.data || res),

  /**
   * Get device type distribution
   */
  getDeviceAnalytics: () =>
    apiClient.get<any>('/api/admin/analytics/devices/distribution').then(res => res.data || res),

  /**
   * Export analytics data
   */
  exportAnalytics: (params: { type: string } & DateRangeParams) =>
    apiClient.post<any>('/api/admin/analytics/export', params, true).then(res => res.data || res),
};

// ============================================================================
// REVENUE API
// ============================================================================

export const revenueService = {
  /**
   * Get revenue overview (MRR, ARR, churn, ARPU, LTV)
   */
  getOverview: (params?: DateRangeParams) =>
    apiClient.get<any>('/api/admin/revenue/overview', params).then(res => res.data || res),

  /**
   * Get revenue trends
   */
  getTrends: (params?: DateRangeParams) =>
    apiClient.get<any>('/api/admin/revenue/trends', params).then(res => res.data || res),

  /**
   * Get payment breakdown by method
   */
  getPaymentBreakdown: (params?: DateRangeParams) =>
    apiClient.get<any>('/api/admin/revenue/payment-breakdown', params).then(res => res.data || res),

  /**
   * Get failed payments
   */
  getFailedPayments: (params?: PaginationParams & DateRangeParams) =>
    apiClient.get<any>('/api/admin/revenue/failed-payments', params).then(res => res.data || res),

  /**
   * Get refund statistics
   */
  getRefunds: (params?: DateRangeParams) =>
    apiClient.get<any>('/api/admin/revenue/refunds', params).then(res => res.data || res),

  /**
   * Get revenue by subscription tier
   */
  getByTier: (params?: DateRangeParams) =>
    apiClient.get<any>('/api/admin/revenue/by-tier', params).then(res => res.data || res),

  /**
   * Get top paying customers
   */
  getTopCustomers: (params?: { limit?: number }) =>
    apiClient.get<any>('/api/admin/revenue/top-customers', params).then(res => res.data || res),

  /**
   * Get payment timeline
   */
  getTimeline: (params?: DateRangeParams) =>
    apiClient.get<any>('/api/admin/revenue/timeline', params).then(res => res.data || res),

  /**
   * Get revenue forecast
   */
  getForecast: (params?: { months?: number }) =>
    apiClient.get<any>('/api/admin/revenue/forecast', params).then(res => res.data || res),

  /**
   * Export revenue data
   */
  exportData: (params: { type: 'payments' | 'subscriptions' } & DateRangeParams) =>
    apiClient.post<any>('/api/admin/revenue/export', params).then(res => res.data || res),
};

// ============================================================================
// BANNERS API
// ============================================================================

export const bannerService = {
  /**
   * Get all banners (Admin)
   */
  getAll: () =>
    apiClient.get<any>('/api/admin/banners').then(res => res.data || res),

  /**
   * Create a new banner (Admin)
   */
  create: (data: Partial<Banner>) =>
    apiClient.post<any>('/api/admin/banners', data).then(res => res.data || res),

  /**
   * Update a banner (Admin)
   */
  update: (id: string, data: Partial<Banner>) =>
    apiClient.patch<any>(`/api/admin/banners/${id}`, data).then(res => res.data || res),

  /**
   * Delete a banner (Admin)
   */
  delete: (id: string) =>
    apiClient.delete<any>(`/api/admin/banners/${id}`).then(res => res.data || res),

  /**
   * Get active banners (App)
   */
  getActive: (type?: 'free' | 'premium') =>
    apiClient.get<any>('/api/banners', { type }, false).then(res => res.data || res),
};

// ============================================================================
// SCHEDULER API
// ============================================================================

export interface ScheduleInsightData {
  publishAt: string;
  timezone?: string;
  recurring?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    interval?: number;
    endDate?: string;
  };
}

export const schedulerService = {
  /**
   * Schedule insight publishing
   */
  scheduleInsight: (insightId: string, data: ScheduleInsightData) =>
    apiClient.post<any>(`/api/admin/scheduler/insights/${insightId}/schedule`, data).then(res => res.data || res),

  /**
   * Get all scheduled insights
   */
  getScheduledInsights: (params?: PaginationParams & { status?: string }) =>
    apiClient.get<any>('/api/admin/scheduler/insights/scheduled', params).then(res => res.data || res),

  /**
   * Get calendar view
   */
  getCalendar: (params: { startDate: string; endDate: string }) =>
    apiClient.get<any>('/api/admin/scheduler/insights/calendar', params).then(res => res.data || res),

  /**
   * Get specific schedule
   */
  getSchedule: (scheduleId: string) =>
    apiClient.get<any>(`/api/admin/scheduler/insights/${scheduleId}`).then(res => res.data || res),

  /**
   * Update schedule
   */
  updateSchedule: (scheduleId: string, data: Partial<ScheduleInsightData>) =>
    apiClient.patch<any>(`/api/admin/scheduler/insights/${scheduleId}`, data).then(res => res.data || res),

  /**
   * Cancel schedule
   */
  cancelSchedule: (scheduleId: string) =>
    apiClient.delete<any>(`/api/admin/scheduler/insights/${scheduleId}`).then(res => res.data || res),

  /**
   * Publish now
   */
  publishNow: (scheduleId: string) =>
    apiClient.post<any>(`/api/admin/scheduler/insights/${scheduleId}/publish-now`).then(res => res.data || res),

  /**
   * Get publishing history
   */
  getHistory: (params?: PaginationParams & DateRangeParams) =>
    apiClient.get<any>('/api/admin/scheduler/insights/history', params).then(res => res.data || res),
};

// ============================================================================
// MODERATION API
// ============================================================================

export const moderationService = {
  /**
   * Get moderation queue
   */
  getModerationQueue: (params?: { type?: string; status?: string } & PaginationParams) =>
    apiClient.get<any>('/api/admin/moderation/queue', params).then(res => res.data || res),

  /**
   * Approve content
   */
  approveContent: (contentId: string, notes?: string) =>
    apiClient.post<any>(`/api/admin/moderation/insights/${contentId}/approve`, { note: notes }).then(res => res.data || res),

  /**
   * Reject content
   */
  rejectContent: (contentId: string, reason: string) =>
    apiClient.post<any>(`/api/admin/moderation/insights/${contentId}/reject`, { reason }).then(res => res.data || res),

  /**
   * Request changes
   */
  requestChanges: (contentId: string, feedback: string) =>
    apiClient.post<any>(`/api/admin/moderation/insights/${contentId}/request-changes`, { changes: feedback }).then(res => res.data || res),

  /**
   * Flag content
   */
  flagContent: (params: { contentType: string; contentId: string; reason: string; severity?: string; description?: string }) =>
    apiClient.post<any>(`/api/admin/moderation/insights/${params.contentId}/flag`, params).then(res => res.data || res),

  /**
   * Get flagged content
   */
  getFlaggedContent: (params?: { severity?: string; status?: string; page?: number; limit?: number }) =>
    apiClient.get<any>('/api/admin/moderation/flagged', params).then(res => res.data || res),

  /**
   * Resolve flag
   */
  resolveFlaggedContent: (flagId: string, action: string, notes?: string) =>
    apiClient.post<any>(`/api/admin/moderation/flagged/${flagId}/resolve`, { action, note: notes }).then(res => res.data || res),

  /**
   * Get moderation stats
   */
  getModerationStats: () =>
    apiClient.get<any>('/api/admin/moderation/stats').then(res => res.data || res),

  /**
   * Get moderation history
   */
  getModerationHistory: (params?: { moderatorId?: string } & DateRangeParams) =>
    apiClient.get<any>('/api/admin/moderation/history', params).then(res => res.data || res),
};

// ============================================================================
// SUBSCRIPTION PLANS API
// ============================================================================

export interface SubscriptionPlanData {
  name: string;
  tier: 'basic' | 'starter' | 'premium' | 'pro' | 'enterprise';
  price: number;
  currency?: string;
  billingCycle: 'monthly' | 'quarterly' | 'yearly';
  features: Array<{
    name: string;
    included: boolean;
    value?: string | number | boolean;
    description?: string;
  }>;
  isActive?: boolean;
  isFeatured?: boolean;
  description?: string;
  stripeProductId?: string;
  stripePriceId?: string;
}

export const subscriptionPlansService = {
  /**
   * Get all plans
   */
  getAllPlans: (params?: { includeInactive?: boolean }) =>
    apiClient.get<any>('/api/admin/subscription-plans', params).then(res => res.data || res),

  /**
   * Get active plans
   */
  getActivePlans: () =>
    apiClient.get<any>('/api/admin/subscription-plans', { includeInactive: false }).then(res => res.data || res),

  /**
   * Get featured plans
   */
  getFeaturedPlans: () =>
    apiClient.get<any>('/api/admin/subscription-plans', { includeInactive: false }).then((response: any) => {
      // If response has data property (standard API structure)
      const plans = response.data || response;
      return plans.filter((plan: any) => plan.isFeatured);
    }),

  /**
   * Get specific plan
   */
  getPlanById: (planId: string) =>
    apiClient.get<any>(`/api/admin/subscription-plans/${planId}`).then(res => res.data || res),

  /**
   * Create plan
   */
  createPlan: (data: SubscriptionPlanData) =>
    apiClient.post<any>('/api/admin/subscription-plans', data).then(res => res.data || res),

  /**
   * Update plan
   */
  updatePlan: (planId: string, data: Partial<SubscriptionPlanData>) =>
    apiClient.patch<any>(`/api/admin/subscription-plans/${planId}`, data).then(res => res.data || res),

  /**
   * Delete plan
   */
  deletePlan: (planId: string) =>
    apiClient.delete<any>(`/api/admin/subscription-plans/${planId}`).then(res => res.data || res),

  /**
   * Activate plan
   */
  activatePlan: (planId: string) =>
    apiClient.post<any>(`/api/admin/subscription-plans/${planId}/activate`).then(res => res.data || res),

  /**
   * Deactivate plan
   */
  deactivatePlan: (planId: string) =>
    apiClient.post<any>(`/api/admin/subscription-plans/${planId}/deactivate`).then(res => res.data || res),

  /**
   * Get plan subscribers
   */
  getPlanSubscribers: (planId: string, params?: PaginationParams & { status?: string }) =>
    apiClient.get<any>(`/api/admin/subscription-plans/${planId}/subscribers`, params).then(res => res.data || res),
};

// ============================================================================
// DISCOUNT CODES API
// ============================================================================

export interface DiscountCodeData {
  code: string;
  description?: string;
  type: 'percentage' | 'fixed_amount' | 'free_trial';
  value: number;
  currency?: string;
  applicableTiers?: string[];
  applicableBillingCycles?: string[];
  validFrom: string;
  validUntil: string;
  maxUses?: number;
  maxUsesPerUser?: number;
  minimumPurchaseAmount?: number;
  firstTimeUsersOnly?: boolean;
  stackable?: boolean;
}

export const discountCodesService = {
  /**
   * Get all discount codes
   */
  getAllCodes: (params?: { isActive?: boolean; type?: string } & PaginationParams) =>
    apiClient.get<any>('/api/admin/discount-codes', params).then(res => res.data || res),

  /**
   * Get analytics
   */
  getAnalytics: (params?: DateRangeParams) =>
    apiClient.get<any>('/api/admin/discount-codes/analytics', params).then(res => res.data || res),

  /**
   * Alias for getAnalytics
   */
  getCodeAnalytics: (codeId: string) =>
    apiClient.get<any>(`/api/admin/discount-codes/${codeId}/analytics`).then(res => res.data || res),

  /**
   * Get specific code
   */
  getCode: (codeId: string) =>
    apiClient.get<any>(`/api/admin/discount-codes/${codeId}`).then(res => res.data || res),

  /**
   * Alias for getCode
   */
  getCodeById: (codeId: string) =>
    apiClient.get<any>(`/api/admin/discount-codes/${codeId}`).then(res => res.data || res),

  /**
   * Create code
   */
  createCode: (data: DiscountCodeData) =>
    apiClient.post<any>('/api/admin/discount-codes', data).then(res => res.data || res),

  /**
   * Update code
   */
  updateCode: (codeId: string, data: Partial<DiscountCodeData>) =>
    apiClient.patch<any>(`/api/admin/discount-codes/${codeId}`, data).then(res => res.data || res),

  /**
   * Delete code
   */
  deleteCode: (codeId: string) =>
    apiClient.delete<any>(`/api/admin/discount-codes/${codeId}`).then(res => res.data || res),

  /**
   * Activate code
   */
  activateCode: (codeId: string) =>
    apiClient.post<any>(`/api/admin/discount-codes/${codeId}/activate`).then(res => res.data || res),

  /**
   * Deactivate code
   */
  deactivateCode: (codeId: string) =>
    apiClient.post<any>(`/api/admin/discount-codes/${codeId}/deactivate`).then(res => res.data || res),

  /**
   * Get code usage stats
   */
  getStats: (codeId: string) =>
    apiClient.get<any>(`/api/admin/discount-codes/${codeId}/stats`).then(res => res.data || res),

  /**
   * Alias for getStats
   */
  getCodeUsage: (codeId: string) =>
    apiClient.get<any>(`/api/admin/discount-codes/${codeId}/stats`).then(res => res.data || res),

  /**
   * Validate code
   */
  validateCode: (code: string, userId?: string, params?: { tier?: string; billingCycle?: string; purchaseAmount?: number }) =>
    apiClient.get<any>(`/api/admin/discount-codes/validate/${code}`, { userId, ...params }).then(res => res.data || res),
};

// ============================================================================
// NOTIFICATION TEMPLATES API
// ============================================================================

export interface NotificationTemplateData {
  name: string;
  slug?: string;
  description?: string;
  category: 'user' | 'subscription' | 'content' | 'payment' | 'system' | 'marketing';
  eventTrigger: string;
  channels: {
    email?: {
      enabled: boolean;
      subject?: string;
      body?: string;
      htmlBody?: string;
    };
    push?: {
      enabled: boolean;
      title?: string;
      body?: string;
    };
    sms?: {
      enabled: boolean;
      body?: string;
    };
    inApp?: {
      enabled: boolean;
      title?: string;
      body?: string;
      priority?: 'low' | 'medium' | 'high' | 'urgent';
    };
  };
  variables?: Array<{
    name: string;
    description?: string;
    example?: string;
    required?: boolean;
  }>;
  targetAudience?: {
    roles?: string[];
    tiers?: string[];
  };
  scheduling?: {
    delay?: number;
    delayUnit?: 'minutes' | 'hours' | 'days';
  };
  isActive?: boolean;
}

export const notificationTemplatesService = {
  /**
   * Get all templates
   */
  getAllTemplates: (params?: { category?: string; eventTrigger?: string; isActive?: boolean } & PaginationParams) =>
    apiClient.get<any>('/api/admin/notification-templates', params).then(res => res.data || res),

  /**
   * Get templates by category
   */
  getByCategory: () =>
    apiClient.get<any>('/api/admin/notification-templates/by-category').then(res => res.data || res),

  /**
   * Get specific template
   */
  getTemplate: (templateId: string) =>
    apiClient.get<any>(`/api/admin/notification-templates/${templateId}`).then(res => res.data || res),

  /**
   * Alias for getTemplate
   */
  getTemplateById: (templateId: string) =>
    apiClient.get<any>(`/api/admin/notification-templates/${templateId}`).then(res => res.data || res),

  /**
   * Create template
   */
  createTemplate: (data: NotificationTemplateData) =>
    apiClient.post<any>('/api/admin/notification-templates', data).then(res => res.data || res),

  /**
   * Update template
   */
  updateTemplate: (templateId: string, data: Partial<NotificationTemplateData>) =>
    apiClient.patch<any>(`/api/admin/notification-templates/${templateId}`, data).then(res => res.data || res),

  /**
   * Delete template
   */
  deleteTemplate: (templateId: string) =>
    apiClient.delete<any>(`/api/admin/notification-templates/${templateId}`).then(res => res.data || res),

  /**
   * Clone template
   */
  cloneTemplate: (templateId: string, data: { name: string; slug: string }) =>
    apiClient.post<any>(`/api/admin/notification-templates/${templateId}/clone`, data).then(res => res.data || res),

  /**
   * Alias for cloneTemplate
   */
  duplicateTemplate: (templateId: string) =>
    apiClient.post<any>(`/api/admin/notification-templates/${templateId}/clone`, {
      name: `Copy of template`,
      slug: `copy-${Date.now()}`
    }).then(res => res.data || res),

  /**
   * Activate template
   */
  activateTemplate: (templateId: string) =>
    apiClient.post<any>(`/api/admin/notification-templates/${templateId}/activate`).then(res => res.data || res),

  /**
   * Deactivate template
   */
  deactivateTemplate: (templateId: string) =>
    apiClient.post<any>(`/api/admin/notification-templates/${templateId}/deactivate`).then(res => res.data || res),

  /**
   * Preview template
   */
  previewTemplate: (templateId: string, variables?: Record<string, any>) =>
    apiClient.post<any>(`/api/admin/notification-templates/${templateId}/preview`, { variables }).then(res => res.data || res),

  /**
   * Get analytics
   */
  getAnalytics: (templateId: string) =>
    apiClient.get<any>(`/api/admin/notification-templates/${templateId}/analytics`).then(res => res.data || res),

  /**
   * Alias for getAnalytics
   */
  getTemplateAnalytics: (templateId: string) =>
    apiClient.get<any>(`/api/admin/notification-templates/${templateId}/analytics`).then(res => res.data || res),

  /**
   * Test send
   */
  testSend: (templateId: string, data: { channel: string; variables?: Record<string, any>; recipient: string }) =>
    apiClient.post<any>(`/api/admin/notification-templates/${templateId}/test-send`, data).then(res => res.data || res),

  /**
   * Alias for testSend
   */
  sendTestNotification: (templateId: string, recipient: string, variables?: Record<string, any>) =>
    apiClient.post<any>(`/api/admin/notification-templates/${templateId}/test-send`, {
      recipient,
      variables,
      channel: 'email' // Default channel
    }).then(res => res.data || res),
};

// ============================================================================
// BULK ACTIONS API
// ============================================================================

export const bulkActionsService = {
  // User Bulk Actions
  bulkSuspendUsers: (userIds: string[], reason?: string) =>
    apiClient.post<any>('/api/admin/bulk/users/suspend', { userIds, reason }).then(res => res.data || res),

  /**
   * Alias for bulkSuspendUsers
   */
  bulkDeactivateUsers: (userIds: string[]) =>
    apiClient.post<any>('/api/admin/bulk/users/suspend', { userIds, reason: 'Deactivated by admin' }).then(res => res.data || res),

  bulkActivateUsers: (userIds: string[], reason?: string) =>
    apiClient.post<any>('/api/admin/bulk/users/activate', { userIds, reason }).then(res => res.data || res),

  bulkDeleteUsers: (userIds: string[], reason?: string) =>
    apiClient.post<any>('/api/admin/bulk/users/delete', { userIds, reason }).then(res => res.data || res),

  bulkUpdateUserRole: (userIds: string[], role: string) =>
    apiClient.post<any>('/api/admin/bulk/users/update-role', { userIds, role }).then(res => res.data || res),

  exportUsers: (userIds: string[], fields?: string[]) =>
    apiClient.post<any>('/api/admin/bulk/users/export', { userIds, fields }).then(res => res.data || res),

  bulkMessageUsers: (userIds: string[], title: string, body: string, priority?: string) =>
    apiClient.post<any>('/api/admin/bulk/users/message', { userIds, title, body, priority }).then(res => res.data || res),

  // Insight Bulk Actions
  bulkPublishInsights: (insightIds: string[]) =>
    apiClient.post<any>('/api/admin/bulk/insights/publish', { insightIds }).then(res => res.data || res),

  bulkUnpublishInsights: (insightIds: string[]) =>
    apiClient.post<any>('/api/admin/bulk/insights/unpublish', { insightIds }).then(res => res.data || res),

  bulkArchiveInsights: (insightIds: string[]) =>
    apiClient.post<any>('/api/admin/bulk/insights/archive', { insightIds }).then(res => res.data || res),

  bulkDeleteInsights: (insightIds: string[], reason?: string) =>
    apiClient.post<any>('/api/admin/bulk/insights/delete', { insightIds, reason }).then(res => res.data || res),

  bulkUpdateInsightCategory: (insightIds: string[], category: string) =>
    apiClient.post<any>('/api/admin/bulk/insights/update-category', { insightIds, category }).then(res => res.data || res),

  bulkFeatureInsights: (insightIds: string[], featured: boolean) =>
    apiClient.post<any>('/api/admin/bulk/insights/feature', { insightIds, featured }).then(res => res.data || res),

  // Subscription Bulk Actions
  bulkGrantSubscriptions: (userIds: string[], tier: string, durationDays: number, reason: string) =>
    apiClient.post<any>('/api/admin/bulk/subscriptions/grant', { userIds, tier, durationDays, reason }).then(res => res.data || res),

  bulkExtendSubscriptions: (subscriptionIds: string[], durationDays: number, reason: string) =>
    apiClient.post<any>('/api/admin/bulk/subscriptions/extend', { subscriptionIds, durationDays, reason }).then(res => res.data || res),

  bulkRevokeSubscriptions: (subscriptionIds: string[], reason: string) =>
    apiClient.post<any>('/api/admin/bulk/subscriptions/revoke', { subscriptionIds, reason }).then(res => res.data || res),

  bulkApplyDiscount: (subscriptionIds: string[], discountCode: string) =>
    apiClient.post<any>('/api/admin/bulk/subscriptions/apply-discount', { subscriptionIds, discountCode }).then(res => res.data || res),
};

// ============================================================================
// FILTERS API
// ============================================================================

export interface FilterPresetData {
  name: string;
  description?: string;
  resourceType: 'users' | 'insights' | 'subscriptions';
  filters: Record<string, any>;
  isPublic?: boolean;
}

export const filtersService = {
  /**
   * Filter users
   */
  filterUsers: (data: { filters: Record<string, any>; sort?: Record<string, any> } & PaginationParams) =>
    apiClient.post<any>('/api/admin/filters/users', data).then(res => res.data || res),

  /**
   * Filter insights
   */
  filterInsights: (data: { filters: Record<string, any>; sort?: Record<string, any> } & PaginationParams) =>
    apiClient.post<any>('/api/admin/filters/insights', data).then(res => res.data || res),

  /**
   * Filter subscriptions
   */
  filterSubscriptions: (data: { filters: Record<string, any>; sort?: Record<string, any> } & PaginationParams) =>
    apiClient.post<any>('/api/admin/filters/subscriptions', data).then(res => res.data || res),

  /**
   * General apply filters method
   */
  applyFilters: (resourceType: 'users' | 'insights' | 'subscriptions', data: { filters: Record<string, any>; sort?: Record<string, any> } & PaginationParams) => {
    switch (resourceType) {
      case 'users': return filtersService.filterUsers(data).then(res => res.data || res);
      case 'insights': return filtersService.filterInsights(data).then(res => res.data || res);
      case 'subscriptions': return filtersService.filterSubscriptions(data).then(res => res.data || res);
    }
  },

  /**
   * Create filter preset
   */
  createPreset: (data: FilterPresetData) =>
    apiClient.post('/api/admin/filters/presets', data),

  /**
   * Get all presets
   */
  getPresets: (resourceType?: string) =>
    apiClient.get('/api/admin/filters/presets', { resourceType }),

  /**
   * Alias for getPresets
   */
  getSavedPresets: (resourceType?: string) =>
    apiClient.get('/api/admin/filters/presets', { resourceType }),

  /**
   * Get specific preset
   */
  getPreset: (presetId: string) =>
    apiClient.get(`/api/admin/filters/presets/${presetId}`),

  /**
   * Alias for getPreset
   */
  getPresetById: (presetId: string) =>
    apiClient.get(`/api/admin/filters/presets/${presetId}`),

  /**
   * Update preset
   */
  updatePreset: (presetId: string, data: Partial<FilterPresetData>) =>
    apiClient.patch(`/api/admin/filters/presets/${presetId}`, data),

  /**
   * Delete preset
   */
  deletePreset: (presetId: string) =>
    apiClient.delete(`/api/admin/filters/presets/${presetId}`),

  /**
   * Apply preset
   */
  applyPreset: (presetId: string, params?: PaginationParams) =>
    apiClient.post(`/api/admin/filters/presets/${presetId}/apply`, params),

  /**
   * Export filtered data
   */
  exportFilteredData: (resourceType: string, filters: Record<string, any>, format: string) =>
    apiClient.post(`/api/admin/filters/${resourceType}/export`, { filters, format }, true),
};
