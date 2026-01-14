/**
 * Notifications Constants
 * Constants for notification types, icons, and configurations
 */

export const NOTIFICATION_EVENTS = {
  // Subscription events
  SUBSCRIPTION_CREATED: 'subscription:created',
  SUBSCRIPTION_UPGRADED: 'subscription:upgraded',
  SUBSCRIPTION_DOWNGRADED: 'subscription:downgraded',
  SUBSCRIPTION_RENEWED: 'subscription:renewed',
  SUBSCRIPTION_CANCELLED: 'subscription:cancelled',
  SUBSCRIPTION_EXPIRED: 'subscription:expired',
  SUBSCRIPTION_EXPIRING_SOON: 'subscription:expiring-soon',
  SUBSCRIPTION_PAYMENT_FAILED: 'subscription:payment-failed',
  SUBSCRIPTION_TRIAL_STARTED: 'subscription:trial-started',
  SUBSCRIPTION_TRIAL_ENDING_SOON: 'subscription:trial-ending-soon',
  SUBSCRIPTION_TRIAL_ENDED: 'subscription:trial-ended',

  // Content events
  INSIGHT_PUBLISHED: 'insight:published',
  INSIGHT_PREMIUM_PUBLISHED: 'insight:premium-published',
  INSIGHT_FEATURED: 'insight:featured',
  INSIGHT_TRENDING: 'insight:trending',
  INSIGHT_SAVED: 'insight:saved',

  // Engagement events
  INSIGHT_LIKED: 'engagement:insight-liked',
  INSIGHT_COMMENTED: 'engagement:insight-commented',
  USER_FOLLOWED: 'engagement:user-followed',
  USER_MENTIONED: 'engagement:user-mentioned',
  COMMENT_REPLIED: 'engagement:comment-replied',

  // Premium events
  PREMIUM_CONTENT_AVAILABLE: 'premium:content-available',
  PREMIUM_EARLY_ACCESS: 'premium:early-access',
  PREMIUM_SPECIAL_OFFER: 'premium:special-offer',
  PREMIUM_WEBINAR: 'premium:webinar',

  // System events
  WELCOME_NEW_USER: 'system:welcome',
  SECURITY_ALERT: 'system:security-alert',
  ACCOUNT_ACTIVITY: 'system:account-activity',
  POLICY_UPDATE: 'system:policy-update',
  MAINTENANCE_SCHEDULED: 'system:maintenance',
  APP_UPDATE_AVAILABLE: 'system:app-update',

  // Marketing events
  PROMOTION: 'marketing:promotion',
  NEWSLETTER: 'marketing:newsletter',
  SURVEY: 'marketing:survey',
  ANNOUNCEMENT: 'marketing:announcement',
} as const;

export type NotificationEventType = typeof NOTIFICATION_EVENTS[keyof typeof NOTIFICATION_EVENTS];

export const NOTIFICATION_ICONS: Record<string, string> = {
  // Subscription
  'subscription:created': 'checkmark-circle',
  'subscription:upgraded': 'arrow-up-circle',
  'subscription:downgraded': 'arrow-down-circle',
  'subscription:renewed': 'sync',
  'subscription:cancelled': 'close-circle',
  'subscription:expired': 'alert-circle',
  'subscription:expiring-soon': 'time',
  'subscription:payment-failed': 'warning',
  'subscription:trial-started': 'star',
  'subscription:trial-ending-soon': 'timer',
  'subscription:trial-ended': 'hourglass',

  // Content
  'insight:published': 'document-text',
  'insight:premium-published': 'star',
  'insight:featured': 'flame',
  'insight:trending': 'trending-up',
  'insight:saved': 'bookmark',

  // Engagement
  'engagement:insight-liked': 'heart',
  'engagement:insight-commented': 'chatbubble',
  'engagement:user-followed': 'person-add',
  'engagement:user-mentioned': 'at',
  'engagement:comment-replied': 'chatbubbles',

  // Premium
  'premium:content-available': 'diamond',
  'premium:early-access': 'rocket',
  'premium:special-offer': 'gift',
  'premium:webinar': 'videocam',

  // System
  'system:welcome': 'hand-right',
  'system:security-alert': 'shield-checkmark',
  'system:account-activity': 'person-circle',
  'system:policy-update': 'document',
  'system:maintenance': 'construct',
  'system:app-update': 'download',

  // Marketing
  'marketing:promotion': 'pricetag',
  'marketing:newsletter': 'mail',
  'marketing:survey': 'help-circle',
  'marketing:announcement': 'megaphone',
};

export const NOTIFICATION_COLORS: Record<string, string> = {
  // Subscription
  'subscription:created': '#34c759',
  'subscription:upgraded': '#007aff',
  'subscription:downgraded': '#ff9500',
  'subscription:renewed': '#34c759',
  'subscription:cancelled': '#8e8e93',
  'subscription:expired': '#ff3b30',
  'subscription:expiring-soon': '#ff9500',
  'subscription:payment-failed': '#ff3b30',
  'subscription:trial-started': '#af52de',
  'subscription:trial-ending-soon': '#ff9500',
  'subscription:trial-ended': '#8e8e93',

  // Content
  'insight:published': '#007aff',
  'insight:premium-published': '#ffd700',
  'insight:featured': '#ff3b30',
  'insight:trending': '#ff9500',
  'insight:saved': '#34c759',

  // Engagement
  'engagement:insight-liked': '#ff3b30',
  'engagement:insight-commented': '#007aff',
  'engagement:user-followed': '#34c759',
  'engagement:user-mentioned': '#ff9500',
  'engagement:comment-replied': '#007aff',

  // Premium
  'premium:content-available': '#af52de',
  'premium:early-access': '#ff9500',
  'premium:special-offer': '#34c759',
  'premium:webinar': '#007aff',

  // System
  'system:welcome': '#34c759',
  'system:security-alert': '#ff3b30',
  'system:account-activity': '#007aff',
  'system:policy-update': '#8e8e93',
  'system:maintenance': '#ff9500',
  'system:app-update': '#007aff',

  // Marketing
  'marketing:promotion': '#34c759',
  'marketing:newsletter': '#007aff',
  'marketing:survey': '#ff9500',
  'marketing:announcement': '#af52de',
};

export const NOTIFICATION_TITLES: Record<string, string> = {
  // Subscription
  'subscription:created': 'Subscription Active',
  'subscription:upgraded': 'Plan Upgraded',
  'subscription:downgraded': 'Plan Changed',
  'subscription:renewed': 'Subscription Renewed',
  'subscription:cancelled': 'Subscription Cancelled',
  'subscription:expired': 'Subscription Expired',
  'subscription:expiring-soon': 'Subscription Expiring Soon',
  'subscription:payment-failed': 'Payment Failed',
  'subscription:trial-started': 'Trial Started',
  'subscription:trial-ending-soon': 'Trial Ending Soon',
  'subscription:trial-ended': 'Trial Ended',

  // Content
  'insight:published': 'New Insight Available',
  'insight:premium-published': 'Premium Insight Available',
  'insight:featured': 'Featured Content',
  'insight:trending': 'Trending Now',
  'insight:saved': 'Content Saved',

  // Engagement
  'engagement:insight-liked': 'Someone liked your insight',
  'engagement:insight-commented': 'New comment',
  'engagement:user-followed': 'New follower',
  'engagement:user-mentioned': 'You were mentioned',
  'engagement:comment-replied': 'Reply to your comment',

  // Premium
  'premium:content-available': 'Exclusive Content',
  'premium:early-access': 'Early Access',
  'premium:special-offer': 'Special Offer',
  'premium:webinar': 'Webinar Invitation',

  // System
  'system:welcome': 'Welcome to Vertex Capital',
  'system:security-alert': 'Security Alert',
  'system:account-activity': 'Account Activity',
  'system:policy-update': 'Policy Update',
  'system:maintenance': 'Scheduled Maintenance',
  'system:app-update': 'Update Available',

  // Marketing
  'marketing:promotion': 'Special Promotion',
  'marketing:newsletter': 'Newsletter',
  'marketing:survey': 'Your Feedback Needed',
  'marketing:announcement': 'Announcement',
};

export const NOTIFICATION_CATEGORIES = {
  SUBSCRIPTION: 'subscription',
  CONTENT: 'content',
  ENGAGEMENT: 'engagement',
  PREMIUM: 'premium',
  SYSTEM: 'system',
  MARKETING: 'marketing',
} as const;

export const PRIORITY_COLORS = {
  low: '#8e8e93',
  medium: '#007aff',
  high: '#ff9500',
  urgent: '#ff3b30',
} as const;

export const CHANNEL_LABELS = {
  email: 'Email',
  push: 'Push Notifications',
  sms: 'SMS',
  inApp: 'In-App',
} as const;

export const FREQUENCY_LABELS = {
  instant: 'Instant',
  hourly: 'Hourly Digest',
  daily: 'Daily Digest',
  weekly: 'Weekly Digest',
} as const;

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_NOTIFICATIONS_PER_PAGE = 50;
