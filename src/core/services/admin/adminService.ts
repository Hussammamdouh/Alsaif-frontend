/**
 * Admin Service
 * API service layer for admin operations
 */

import { Alert, Linking } from 'react-native';
import apiClient from '../api/apiClient';
import { loadAuthSession } from '../../../app/auth/auth.storage';
import { getApiBaseUrl } from '../../config/env';
import type {
  AdminUser,
  AdminInsight,
  AdminSubscription,
  AuditLog,
  DashboardStats,
  UserActionData,
  RoleChangeData,
  CreateInsightData,
  UpdateInsightData,
  BroadcastNotificationData,
  SubscriptionGrantData,
  PaginatedResponse,
  ApiResponse,
  UserFilters,
  InsightFilters,
  SubscriptionFilters,
  AuditLogFilters,
} from '../../../features/admin/admin.types';

// ==================== DASHBOARD ====================

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await apiClient.get<ApiResponse<DashboardStats>>(
    '/api/admin/dashboard'
  );

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to fetch dashboard stats');
  }

  return response.data;
};

// ==================== USER MANAGEMENT ====================

export const getUsers = async (
  page = 1,
  limit = 20,
  filters?: UserFilters
): Promise<PaginatedResponse<AdminUser>> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  if (filters?.role) params.append('role', filters.role);
  if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());
  if (filters?.subscriptionStatus) params.append('subscriptionStatus', filters.subscriptionStatus);
  if (filters?.search) params.append('search', filters.search);

  const response = await apiClient.get<ApiResponse<{ users: AdminUser[]; pagination: any }>>(
    `/api/admin/users?${params.toString()}`
  );

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to fetch users');
  }

  return {
    data: response.data.users,
    pagination: response.data.pagination,
  };
};

export const suspendUser = async (data: UserActionData): Promise<void> => {
  const response = await apiClient.patch<ApiResponse>(
    `/api/admin/users/${data.userId}/status`,
    { isActive: false, reason: data.reason }
  );

  if (!response.success) {
    throw new Error(response.message || 'Failed to suspend user');
  }
};

export const activateUser = async (data: UserActionData): Promise<void> => {
  const response = await apiClient.patch<ApiResponse>(
    `/api/admin/users/${data.userId}/status`,
    { isActive: true, reason: data.reason }
  );

  if (!response.success) {
    throw new Error(response.message || 'Failed to activate user');
  }
};

export const changeUserRole = async (data: RoleChangeData): Promise<void> => {
  const response = await apiClient.patch<ApiResponse>(
    `/api/superadmin/users/${data.userId}/role`,
    { role: data.newRole, reason: data.reason }
  );

  if (!response.success) {
    throw new Error(response.message || 'Failed to change user role');
  }
};

export const createUser = async (data: {
  name: string;
  email: string;
  password: string;
  role: string;
  phoneNumber?: string;
  nationality?: string;
}): Promise<AdminUser> => {
  const response = await apiClient.post<ApiResponse<{ user: AdminUser }>>(
    '/api/admin/users',
    data
  );

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to create user');
  }

  return response.data.user;
};

export const updateUser = async (
  userId: string,
  data: {
    name?: string;
    email?: string;
    role?: string;
    phoneNumber?: string;
    nationality?: string;
  }
): Promise<AdminUser> => {
  const response = await apiClient.patch<ApiResponse<{ user: AdminUser }>>(
    `/api/admin/users/${userId}`,
    data
  );

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to update user');
  }

  return response.data.user;
};

export const deleteUser = async (userId: string, reason?: string): Promise<void> => {
  const response = await apiClient.delete<ApiResponse>(
    `/api/admin/users/${userId}`,
    { reason }
  );

  if (!response.success) {
    throw new Error(response.message || 'Failed to delete user');
  }
};

export const toggleInsightBan = async (userId: string): Promise<{ isBannedFromInsights: boolean }> => {
  const response = await apiClient.post<ApiResponse<{ isBannedFromInsights: boolean }>>(
    `/api/admin/insight-requests/ban/${userId}`
  );

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to toggle insight ban');
  }

  return response.data;
};

export const exportUsers = async (): Promise<void> => {
  const baseUrl = getApiBaseUrl();
  const session = await loadAuthSession();

  if (!session || !session.tokens.accessToken) {
    throw new Error('Authentication required for export');
  }

  // Use backticks for URL Construction
  // Construct URL with access token as query parameter
  const downloadUrl = `${baseUrl}/api/export/users?token=${session.tokens.accessToken}`;

  console.log('[AdminService] Exporting users via:', downloadUrl);

  // Trigger download via external browser
  const supported = await Linking.canOpenURL(downloadUrl);
  if (supported) {
    await Linking.openURL(downloadUrl);
  } else {
    Alert.alert('Error', 'Unable to open download link');
  }
};

// ==================== INSIGHT MANAGEMENT ====================

export const getInsights = async (
  page = 1,
  limit = 20,
  filters?: InsightFilters
): Promise<PaginatedResponse<AdminInsight>> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  if (filters?.type) params.append('type', filters.type);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.category) params.append('category', filters.category);
  if (filters?.featured !== undefined) params.append('featured', filters.featured.toString());
  if (filters?.search) params.append('search', filters.search);

  const response = await apiClient.get<ApiResponse<{ insights: AdminInsight[]; pagination: any }>>(
    `/api/insights?${params.toString()}`
  );

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to fetch insights');
  }

  return {
    data: response.data.insights,
    pagination: response.data.pagination,
  };
};

export const createInsight = async (data: CreateInsightData): Promise<AdminInsight> => {
  const response = await apiClient.post<ApiResponse<{ insight: AdminInsight }>>(
    '/api/insights',
    data
  );

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to create insight');
  }

  return response.data.insight;
};

export const updateInsight = async (
  insightId: string,
  data: UpdateInsightData
): Promise<AdminInsight> => {
  const response = await apiClient.patch<ApiResponse<{ insight: AdminInsight }>>(
    `/api/insights/${insightId}`,
    data
  );

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to update insight');
  }

  return response.data.insight;
};

export const deleteInsight = async (insightId: string, reason?: string): Promise<void> => {
  const response = await apiClient.delete<ApiResponse>(
    `/api/admin/insights/${insightId}`,
    { reason }
  );

  if (!response.success) {
    throw new Error(response.message || 'Failed to delete insight');
  }
};

export const publishInsight = async (insightId: string): Promise<AdminInsight> => {
  return await updateInsight(insightId, { status: 'published' });
};

export const featureInsight = async (insightId: string, featured: boolean): Promise<AdminInsight> => {
  const response = await apiClient.patch<ApiResponse<{ insight: AdminInsight }>>(
    `/api/insights/${insightId}/feature`,
    { featured }
  );

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to feature insight');
  }

  return response.data.insight;
};

export const scheduleInsight = async (
  insightId: string,
  publishAt: string
): Promise<AdminInsight> => {
  const response = await apiClient.post<ApiResponse<{ insight: AdminInsight }>>(
    `/api/insights/${insightId}/schedule`,
    { publishAt }
  );

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to schedule insight');
  }

  return response.data.insight;
};

export const getScheduledInsights = async (
  page = 1,
  limit = 20
): Promise<PaginatedResponse<AdminInsight>> => {
  const response = await apiClient.get<ApiResponse<{ insights: AdminInsight[]; pagination: any }>>(
    `/api/insights/scheduled/all?page=${page}&limit=${limit}`
  );

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to fetch scheduled insights');
  }

  return {
    data: response.data.insights,
    pagination: response.data.pagination,
  };
};

export const cancelInsightSchedule = async (insightId: string): Promise<AdminInsight> => {
  const response = await apiClient.post<ApiResponse<{ insight: AdminInsight }>>(
    `/api/insights/${insightId}/cancel-schedule`
  );

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to cancel schedule');
  }

  return response.data.insight;
};

// ==================== SUBSCRIPTION MANAGEMENT ====================

export const getSubscriptions = async (
  page = 1,
  limit = 20,
  filters?: SubscriptionFilters
): Promise<PaginatedResponse<AdminSubscription>> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  if (filters?.status) params.append('status', filters.status);
  if (filters?.tier) params.append('tier', filters.tier);
  if (filters?.search) params.append('search', filters.search);

  const response = await apiClient.get<ApiResponse<{ subscriptions: AdminSubscription[]; pagination: any }>>(
    `/api/subscriptions?${params.toString()}`
  );

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to fetch subscriptions');
  }

  return {
    data: response.data.subscriptions,
    pagination: response.data.pagination,
  };
};

export const grantSubscription = async (data: SubscriptionGrantData): Promise<void> => {
  const response = await apiClient.post<ApiResponse>(
    '/api/subscriptions/grant',
    data
  );

  if (!response.success) {
    throw new Error(response.message || 'Failed to grant subscription');
  }
};

export const revokeSubscription = async (userId: string, reason?: string): Promise<void> => {
  const response = await apiClient.post<ApiResponse>(
    '/api/subscriptions/revoke',
    { userId, reason }
  );

  if (!response.success) {
    throw new Error(response.message || 'Failed to revoke subscription');
  }
};

// ==================== BROADCAST NOTIFICATIONS ====================

export const broadcastNotification = async (
  data: BroadcastNotificationData
): Promise<{ recipientCount: number }> => {
  const response = await apiClient.post<ApiResponse<{ recipientCount: number }>>(
    '/api/admin/notifications/broadcast',
    data
  );

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to broadcast notification');
  }

  return response.data;
};

export const getBroadcastHistory = async (
  page = 1,
  limit = 20
): Promise<PaginatedResponse<any>> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  const response = await apiClient.get<ApiResponse<{ notifications: any[]; pagination: any }>>(
    `/api/admin/notifications/history?${params.toString()}`
  );

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to fetch broadcast history');
  }

  // Transform the response to match frontend expectations
  const transformedData = response.data.notifications.map((n: any) => ({
    id: n._id || n.id,
    title: n.title,
    body: n.body,
    priority: n.priority || 'medium',
    target: n.richContent?.metadata?.target || 'all',
    recipientCount: n.recipientCount || n.richContent?.metadata?.recipientCount || 1,
    status: n.overallStatus === 'pending' ? 'pending' : (n.overallStatus === 'failed' ? 'failed' : 'sent'),
    adminEmail: n.richContent?.metadata?.adminEmail || '',
    sender: {
      name: n.richContent?.metadata?.adminEmail?.split('@')[0] || 'Admin',
      email: n.richContent?.metadata?.adminEmail || ''
    },
    sentAt: n.createdAt,
    createdAt: n.createdAt,
    scheduledFor: n.scheduledFor || n.richContent?.metadata?.scheduledFor,
    actionUrl: n.richContent?.actionUrl,
    imageUrl: n.richContent?.imageUrl,
  }));

  return {
    data: transformedData,
    pagination: response.data.pagination,
  };
};

// ==================== AUDIT LOGS ====================

export const getAuditLogs = async (
  page = 1,
  limit = 20,
  filters?: AuditLogFilters
): Promise<PaginatedResponse<AuditLog>> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());

  if (filters?.action) params.append('action', filters.action);
  if (filters?.severity) params.append('severity', filters.severity);
  if (filters?.actorId) params.append('actorId', filters.actorId);
  if (filters?.resourceType) params.append('resourceType', filters.resourceType);
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);

  const response = await apiClient.get<ApiResponse<{ logs: AuditLog[]; pagination: any }>>(
    `/api/superadmin/audit-logs?${params.toString()}`
  );

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to fetch audit logs');
  }

  return {
    data: response.data.logs,
    pagination: response.data.pagination,
  };
};

export default {
  // Dashboard
  getDashboardStats,

  // Users
  getUsers,
  suspendUser,
  activateUser,
  changeUserRole,

  // Insights
  getInsights,
  createInsight,
  updateInsight,
  deleteInsight,
  publishInsight,
  featureInsight,

  // Subscriptions
  getSubscriptions,
  grantSubscription,
  revokeSubscription,

  // Notifications
  broadcastNotification,
  getBroadcastHistory,

  // Audit Logs
  getAuditLogs,
};
