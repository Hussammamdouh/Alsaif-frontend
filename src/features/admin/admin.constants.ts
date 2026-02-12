/**
 * Admin Feature Constants
 * Constants, enums, and configuration for admin dashboard
 */

import type {
  UserRole,
  UserStatus,
  SubscriptionStatus,
  SubscriptionTier,
  InsightType,
  InsightStatus,
  InsightCategory,
  BroadcastTarget,
  NotificationPriority,
  AuditAction,
  AuditSeverity,
} from './admin.types';

// User Management Constants
export const USER_ROLES: Record<string, UserRole> = {
  USER: 'user',
  ADMIN: 'admin',
  SUPERADMIN: 'superadmin',
};

export const USER_STATUSES: Record<string, UserStatus> = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  PENDING: 'pending',
};

export const SUBSCRIPTION_STATUSES: Record<string, SubscriptionStatus> = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled',
  PENDING: 'pending',
  NONE: 'none',
};

export const SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
  PREMIUM: 'premium',
};

// Insight Management Constants
export const INSIGHT_TYPES: Record<string, InsightType> = {
  FREE: 'free',
  PREMIUM: 'premium',
};

export const INSIGHT_STATUSES: Record<string, InsightStatus> = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
  UNDER_REVIEW: 'under_review',
  SCHEDULED: 'scheduled',
};

export const INSIGHT_CATEGORIES: Record<string, InsightCategory> = {
  MARKET_ANALYSIS: 'market_analysis',
  TRADING_TIPS: 'trading_tips',
  TECHNICAL_ANALYSIS: 'technical_analysis',
  FUNDAMENTAL_ANALYSIS: 'fundamental_analysis',
  RISK_MANAGEMENT: 'risk_management',
  STRATEGY: 'strategy',
  NEWS: 'news',
  EDUCATION: 'education',
  OTHER: 'other',
};

export const CATEGORY_LABELS: Record<InsightCategory, string> = {
  market_analysis: 'Market Analysis',
  trading_tips: 'Trading Tips',
  technical_analysis: 'Technical Analysis',
  fundamental_analysis: 'Fundamental Analysis',
  risk_management: 'Risk Management',
  strategy: 'Strategy',
  news: 'News',
  education: 'Education',
  other: 'Other',
};

// Broadcast Notification Constants
export const BROADCAST_TARGETS: Record<string, BroadcastTarget> = {
  ALL: 'all',
  PREMIUM: 'premium',
  BASIC: 'basic',
  ADMINS: 'admins',
  ACTIVE: 'active',
};

export const BROADCAST_TARGET_LABELS: Record<BroadcastTarget, string> = {
  all: 'All Users',
  premium: 'Premium Subscribers',
  basic: 'Basic Users',
  admins: 'Administrators',
  active: 'Recently Active Users',
};

export const NOTIFICATION_PRIORITIES: Record<string, NotificationPriority> = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

// Status Badge Colors
export const STATUS_COLORS = {
  active: '#34c759',
  suspended: '#ff3b30',
  pending: '#ff9500',
  expired: '#8e8e93',
  cancelled: '#ff3b30',
  none: '#c7c7cc',
  published: '#34c759',
  draft: '#8e8e93',
  archived: '#c7c7cc',
  under_review: '#ff9500',
  scheduled: '#007aff',
} as const;

export const ROLE_COLORS = {
  user: '#007aff',
  admin: '#ff9500',
  superadmin: '#ff3b30',
} as const;

export const TIER_COLORS = {
  free: '#8e8e93',
  premium: '#af52de',
} as const;

export const PRIORITY_COLORS = {
  low: '#8e8e93',
  medium: '#007aff',
  high: '#ff9500',
  critical: '#ff3b30',
} as const;

// Icons
export const STATUS_ICONS = {
  active: 'checkmark-circle',
  suspended: 'ban',
  pending: 'time',
  expired: 'alert-circle',
  cancelled: 'close-circle',
} as const;

export const ROLE_ICONS = {
  user: 'person',
  admin: 'shield',
  superadmin: 'shield-checkmark',
} as const;

export const INSIGHT_ICONS = {
  free: 'document-text',
  premium: 'star',
} as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// Filters
export const USER_FILTER_OPTIONS = [
  { label: 'All Users', value: '', labelKey: 'admin.allUsers' },
  { label: 'Users Only', value: 'user', labelKey: 'admin.usersOnly' },
  { label: 'Admins', value: 'admin', labelKey: 'admin.admins' },
  { label: 'Superadmins', value: 'superadmin', labelKey: 'admin.superadmins' },
];

export const SUBSCRIPTION_FILTER_OPTIONS = [
  { label: 'All Subscriptions', value: '', labelKey: 'admin.allSubscriptions' },
  { label: 'Active', value: 'active', labelKey: 'admin.activeSubscriptions' },
  { label: 'Pending', value: 'pending', labelKey: 'admin.pendingSubscriptions' },
  { label: 'Expired', value: 'expired', labelKey: 'admin.expiredSubscriptions' },
];

export const INSIGHT_TYPE_FILTER_OPTIONS = [
  { label: 'All', value: '', labelKey: 'filter.all' },
  { label: 'Premium', value: 'premium', labelKey: 'filter.premium' },
  { label: 'Free', value: 'free', labelKey: 'filter.free' },
];

export const INSIGHT_STATUS_FILTER_OPTIONS = [
  { label: 'All', value: '', labelKey: 'filter.all' },
  { label: 'Published', value: 'published', labelKey: 'filter.published' },
  { label: 'Drafts', value: 'draft', labelKey: 'filter.drafts' },
  { label: 'Scheduled', value: 'scheduled', labelKey: 'filter.scheduled' },
];

// Quick Actions
export const QUICK_ACTIONS = [
  {
    id: 'create_insight',
    label: 'Create Insight',
    icon: 'add-circle',
    color: '#007aff',
  },
  {
    id: 'broadcast',
    label: 'Broadcast Notification',
    icon: 'megaphone',
    color: '#ff9500',
  },
  {
    id: 'manage_users',
    label: 'Manage Users',
    icon: 'people',
    color: '#34c759',
  },
  {
    id: 'view_analytics',
    label: 'View Analytics',
    icon: 'stats-chart',
    color: '#af52de',
  },
] as const;

// Audit Log Constants
export const AUDIT_SEVERITIES: Record<string, AuditSeverity> = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical',
};

export const SEVERITY_COLORS = {
  info: '#007aff',
  warning: '#ff9500',
  error: '#ff3b30',
  critical: '#ff3b30',
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  INSIGHT_TITLE_MIN: 5,
  INSIGHT_TITLE_MAX: 200,
  INSIGHT_CONTENT_MIN: 20,
  INSIGHT_EXCERPT_MAX: 500,
  BROADCAST_TITLE_MAX: 100,
  BROADCAST_BODY_MAX: 500,
  REASON_MAX: 500,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'You do not have permission to perform this action',
  NETWORK_ERROR: 'Network error. Please check your connection',
  SERVER_ERROR: 'Server error. Please try again later',
  INVALID_DATA: 'Invalid data provided',
  NOT_FOUND: 'Resource not found',
  DUPLICATE: 'Resource already exists',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  USER_UPDATED: 'User updated successfully',
  USER_SUSPENDED: 'User suspended successfully',
  USER_ACTIVATED: 'User activated successfully',
  INSIGHT_CREATED: 'Insight created successfully',
  INSIGHT_UPDATED: 'Insight updated successfully',
  INSIGHT_DELETED: 'Insight deleted successfully',
  INSIGHT_PUBLISHED: 'Insight published successfully',
  BROADCAST_SENT: 'Notification broadcast successfully',
  SUBSCRIPTION_GRANTED: 'Subscription granted successfully',
  SUBSCRIPTION_REVOKED: 'Subscription revoked successfully',
} as const;

// Admin Navigation
export const ADMIN_ROUTES = {
  DASHBOARD: 'AdminDashboard',
  USERS: 'AdminUsers',
  INSIGHTS: 'AdminInsights',
  SUBSCRIPTIONS: 'AdminSubscriptions',
  BROADCAST: 'AdminBroadcast',
  AUDIT_LOGS: 'AdminAuditLogs',
  // New Admin Enhancement Routes
  ANALYTICS: 'AdminAnalytics',
  MODERATION: 'AdminModeration',
  SUBSCRIPTION_PLANS: 'AdminSubscriptionPlans',
  DISCOUNT_CODES: 'AdminDiscountCodes',
  BANNERS: 'AdminBanners',
} as const;

// Permission Checks
export const ADMIN_ROLES = ['admin', 'superadmin'];
export const SUPERADMIN_ONLY_ROLES = ['superadmin'];

export const isAdmin = (role: string): boolean => ADMIN_ROLES.includes(role);
export const isSuperadmin = (role: string): boolean => role === 'superadmin';

// Chart Colors (for analytics)
export const CHART_COLORS = {
  PRIMARY: '#007aff',
  SECONDARY: '#5ac8fa',
  SUCCESS: '#34c759',
  WARNING: '#ff9500',
  DANGER: '#ff3b30',
  INFO: '#af52de',
  GRAY: '#8e8e93',
} as const;

// Admin Dashboard Sections - Translation Keys
export const DASHBOARD_SECTION_TRANSLATIONS = {
  users: {
    titleKey: 'admin.userManagement',
    descriptionKey: 'admin.manageUsersRoles',
  },
  insights: {
    titleKey: 'admin.contentManagement',
    descriptionKey: 'admin.createManageInsights',
  },
  subscriptions: {
    titleKey: 'admin.subscriptions',
    descriptionKey: 'admin.viewManageSubscriptions',
  },
  broadcast: {
    titleKey: 'admin.notifications',
    descriptionKey: 'admin.broadcastNotifications',
  },
  analytics: {
    titleKey: 'admin.analyticsDashboard',
    descriptionKey: 'admin.viewComprehensiveAnalytics',
  },
  moderation: {
    titleKey: 'admin.contentModeration',
    descriptionKey: 'admin.reviewModerateContent',
  },
  subscription_plans: {
    titleKey: 'admin.subscriptionPlans',
    descriptionKey: 'admin.manageSubscriptionTiers',
  },
  discount_codes: {
    titleKey: 'admin.discountCodes',
    descriptionKey: 'admin.createManageCodes',
  },
  banners: {
    titleKey: 'admin.bannerManagement',
    descriptionKey: 'admin.manageHomeBanners',
  },
} as const;

// Admin Dashboard Sections
export const DASHBOARD_SECTIONS = [
  {
    id: 'users',
    title: 'User Management',
    icon: 'people',
    route: ADMIN_ROUTES.USERS,
    description: 'Manage users, roles, and permissions',
    color: '#007aff',
  },
  {
    id: 'insights',
    title: 'Content Management',
    icon: 'document-text',
    route: ADMIN_ROUTES.INSIGHTS,
    description: 'Create and manage insights',
    color: '#34c759',
  },
  {
    id: 'subscriptions',
    title: 'Subscriptions',
    icon: 'card',
    route: ADMIN_ROUTES.SUBSCRIPTIONS,
    description: 'View and manage subscriptions',
    color: '#af52de',
  },
  {
    id: 'broadcast',
    title: 'Notifications',
    icon: 'megaphone',
    route: ADMIN_ROUTES.BROADCAST,
    description: 'Broadcast notifications to users',
    color: '#ff9500',
  },
  {
    id: 'analytics',
    title: 'Analytics Dashboard',
    icon: 'stats-chart',
    route: ADMIN_ROUTES.ANALYTICS,
    description: 'View comprehensive analytics and insights',
    color: '#5856d6',
  },
  {
    id: 'moderation',
    title: 'Content Moderation',
    icon: 'shield-checkmark',
    route: ADMIN_ROUTES.MODERATION,
    description: 'Review and moderate user content',
    color: '#ff453a',
  },
  {
    id: 'subscription_plans',
    title: 'Subscription Plans',
    icon: 'layers',
    route: ADMIN_ROUTES.SUBSCRIPTION_PLANS,
    description: 'Manage subscription tiers and pricing',
    color: '#bf5af2',
  },
  {
    id: 'discount_codes',
    title: 'Discount Codes',
    icon: 'pricetag',
    route: ADMIN_ROUTES.DISCOUNT_CODES,
    description: 'Create and manage promotional codes',
    color: '#ffd60a',
  },
  {
    id: 'banners',
    title: 'Banners & Ads',
    icon: 'image',
    route: ADMIN_ROUTES.BANNERS,
    description: 'Manage home screen carousel banners and partner ads',
    color: '#ff9f0a',
  },
];
