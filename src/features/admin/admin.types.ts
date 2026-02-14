/**
 * Admin Feature Types
 * Type definitions for admin dashboard and management screens
 */

// User Management Types
export type UserRole = 'user' | 'admin' | 'superadmin';
export type UserStatus = 'active' | 'suspended' | 'pending';
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'pending' | 'none' | 'trial';
export type SubscriptionTier = 'free' | 'premium';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  subscriptionStatus?: SubscriptionStatus;
  subscriptionTier?: SubscriptionTier;
  subscriptionEndDate?: string;
  avatar?: string;
  phoneNumber?: string;
  nationality?: string;
  status: UserStatus; // Alias for isActive/subscriptionStatus
  tier?: SubscriptionTier; // Alias for subscriptionTier
  createdAt: string;
  lastActiveAt?: string;
  isBannedFromInsights?: boolean;
}

export interface UserFilters {
  role?: UserRole;
  isActive?: boolean;
  subscriptionStatus?: SubscriptionStatus;
  search?: string;
}

// Insight Management Types
export type InsightType = 'free' | 'premium';
export type InsightFormat = 'article' | 'signal';
export type InsightMarket = 'ADX' | 'DFM' | 'Other';
export type InsightStatus = 'draft' | 'published' | 'archived' | 'under_review' | 'scheduled';
export type InsightCategory =
  | 'market_analysis'
  | 'trading_tips'
  | 'technical_analysis'
  | 'fundamental_analysis'
  | 'risk_management'
  | 'strategy'
  | 'news'
  | 'education'
  | 'other';

export interface AdminInsight {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  type: InsightType;
  status: InsightStatus;
  category: InsightCategory;
  author: {
    id: string;
    name: string;
    email: string;
  };
  tags?: string[];
  featured: boolean;
  imageUrl?: string;
  viewCount: number;
  likeCount: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  scheduledFor?: string;
  // Specific Insight Fields (Trade Signals)
  insightFormat: InsightFormat;
  market?: InsightMarket;
  symbol?: string;
  stockName?: string;
  stockNameAr?: string;
  buyPrice?: number;
  firstGoal?: number;
  secondGoal?: number;
  stopLoss?: number;
}

export interface InsightFilters {
  type?: InsightType;
  status?: InsightStatus;
  category?: InsightCategory;
  featured?: boolean;
  search?: string;
  authorId?: string;
}

export interface CreateInsightData {
  title: string;
  content: string;
  excerpt?: string;
  type: InsightType;
  category: InsightCategory;
  tags?: string[];
  status?: InsightStatus;
  imageUrl?: string;
  scheduledFor?: string;
  // Specific Insight Fields (Trade Signals)
  insightFormat?: InsightFormat;
  market?: InsightMarket;
  symbol?: string;
  stockName?: string;
  stockNameAr?: string;
  buyPrice?: number;
  firstGoal?: number;
  secondGoal?: number;
  stopLoss?: number;
}

export interface UpdateInsightData extends Partial<CreateInsightData> {
  featured?: boolean;
}

// Subscription Management Types
export interface AdminSubscription {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  price: number;
  currency: string;
  startDate: string;
  endDate?: string;
  renewalDate?: string;
  autoRenew: boolean;
  paymentMethod?: string;
  lastPaymentDate?: string;
  nextPaymentDate?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  revenue?: number;
  stripeSubscriptionId?: string;
  stripeProductId?: string;
}

export interface SubscriptionFilters {
  status?: SubscriptionStatus;
  tier?: SubscriptionTier;
  search?: string;
}

// Notification Broadcast Types
export type BroadcastTarget = 'all' | 'premium' | 'basic' | 'admins' | 'active';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

export interface BroadcastNotificationData {
  title: string;
  body: string;
  target: BroadcastTarget;
  priority?: NotificationPriority;
  actionUrl?: string;
  imageUrl?: string;
  scheduledFor?: string;
}

export interface BroadcastHistory {
  id: string;
  title: string;
  body: string;
  target: BroadcastTarget;
  priority: NotificationPriority;
  recipientCount: number;
  status: 'sent' | 'pending' | 'failed';
  adminEmail: string;
  scheduledFor?: string;
  sentAt: string;
}

// Audit Log Types
export type AuditAction =
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USER_DELETED'
  | 'USER_ACTIVATED'
  | 'USER_SUSPENDED'
  | 'USER_ROLE_CHANGED'
  | 'INSIGHT_CREATED'
  | 'INSIGHT_UPDATED'
  | 'INSIGHT_DELETED'
  | 'INSIGHT_PUBLISHED'
  | 'INSIGHT_FEATURED'
  | 'SUBSCRIPTION_GRANTED'
  | 'SUBSCRIPTION_REVOKED'
  | 'SUBSCRIPTION_EXTENDED'
  | 'BROADCAST_NOTIFICATION'
  | 'ADMIN_CREATED'
  | 'ADMIN_DELETED'
  | 'SECURITY_ALERT'
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'PERMISSION_DENIED';

export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface AuditLog {
  id: string;
  action: AuditAction;
  severity: AuditSeverity;
  actor: {
    id: string;
    email: string;
    role: UserRole;
  };
  target?: {
    resourceType: string;
    resourceId: string;
    resourceName?: string;
  };
  changes?: {
    before: Record<string, any>;
    after: Record<string, any>;
  };
  metadata?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

export interface AuditLogFilters {
  action?: AuditAction;
  severity?: AuditSeverity;
  actorId?: string;
  resourceType?: string;
  startDate?: string;
  endDate?: string;
}

// Dashboard Stats Types
export interface DashboardStats {
  users: {
    total: number;
    active: number;
    suspended: number;
    admins: number;
    premium: number;
  };
  subscriptions: {
    total: number;
    active: number;
    expired: number;
    revenue: number;
  };
  insights: {
    total: number;
    published: number;
    drafts: number;
    premium: number;
  };
  notifications: {
    sent: number;
    pending: number;
    failed: number;
  };
}

// Pagination Types
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  hasMore?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// State Management Types
export interface AdminState {
  dashboard: {
    stats: DashboardStats | null;
    isLoading: boolean;
    error: string | null;
  };
  users: {
    list: AdminUser[];
    pagination: PaginationMeta | null;
    filters: UserFilters;
    isLoading: boolean;
    error: string | null;
  };
  insights: {
    list: AdminInsight[];
    pagination: PaginationMeta | null;
    filters: InsightFilters;
    isLoading: boolean;
    error: string | null;
  };
  subscriptions: {
    list: AdminSubscription[];
    pagination: PaginationMeta | null;
    filters: SubscriptionFilters;
    isLoading: boolean;
    error: string | null;
  };
  auditLogs: {
    list: AuditLog[];
    pagination: PaginationMeta | null;
    filters: AuditLogFilters;
    isLoading: boolean;
    error: string | null;
  };
}

// Action Types
export interface UserActionData {
  userId: string;
  reason?: string;
}

export interface RoleChangeData {
  userId: string;
  newRole: UserRole;
  reason?: string;
}

export interface SubscriptionGrantData {
  email: string;
  tier: SubscriptionTier;
  endDate?: string;
  durationDays: number;
  reason?: string;
}
