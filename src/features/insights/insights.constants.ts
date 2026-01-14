/**
 * Insights Constants
 * Colors, icons, messages, and configuration for insights feature
 */

import { InsightCategory, InsightSortBy } from './insights.types';

// Category Configuration
export const CATEGORY_CONFIG: Record<
  InsightCategory,
  { label: string; icon: string; color: string }
> = {
  market_analysis: {
    label: 'Market Analysis',
    icon: 'analytics',
    color: '#007aff',
  },
  trading_tips: {
    label: 'Trading Tips',
    icon: 'bulb',
    color: '#ff9500',
  },
  technical_analysis: {
    label: 'Technical Analysis',
    icon: 'trending-up',
    color: '#34c759',
  },
  fundamental_analysis: {
    label: 'Fundamental Analysis',
    icon: 'stats-chart',
    color: '#5ac8fa',
  },
  risk_management: {
    label: 'Risk Management',
    icon: 'shield-checkmark',
    color: '#ff3b30',
  },
  strategy: {
    label: 'Strategy',
    icon: 'map',
    color: '#af52de',
  },
  news: {
    label: 'News',
    icon: 'newspaper',
    color: '#ff2d55',
  },
  education: {
    label: 'Education',
    icon: 'school',
    color: '#5856d6',
  },
  other: {
    label: 'Other',
    icon: 'ellipsis-horizontal',
    color: '#8e8e93',
  },
};


// Sort Configuration
export const SORT_CONFIG: Record<InsightSortBy, { label: string }> = {
  latest: { label: 'Latest' },
  popular: { label: 'Popular' },
  most_liked: { label: 'Most Liked' },
  most_commented: { label: 'Most Commented' },
};

// Colors
export const COLORS = {
  free: '#34c759',
  premium: '#6366f1',
  liked: '#ff3b30',
  unliked: '#8e8e93',
  comment: '#007aff',
  bookmark: '#ff9500',
  trending: '#ff2d55',
  featured: '#af52de',
  background: {
    primary: '#fff',
    secondary: '#f2f2f7',
    card: '#fff',
  },
  text: {
    primary: '#000',
    secondary: '#8e8e93',
    tertiary: '#c7c7cc',
  },
  border: {
    default: '#e5e5ea',
    light: '#f2f2f7',
  },
};

// Icons
export const ICONS = {
  like: 'heart',
  likeOutline: 'heart-outline',
  comment: 'chatbubble',
  commentOutline: 'chatbubble-outline',
  bookmark: 'bookmark',
  bookmarkOutline: 'bookmark-outline',
  share: 'share-social',
  more: 'ellipsis-horizontal',
  send: 'send',
  reply: 'arrow-undo',
  edit: 'create',
  delete: 'trash',
  flag: 'flag',
  close: 'close',
  search: 'search',
  filter: 'funnel',
  back: 'arrow-back',
};

// API Endpoints
export const API_ENDPOINTS = {
  // Insights
  INSIGHTS_PUBLISHED: '/api/insights/published',
  INSIGHTS_FEATURED: '/api/insights/featured',
  INSIGHT_BY_ID: (id: string) => `/api/insights/published/${id}`,
  LIKE_INSIGHT: (id: string) => `/api/insights/${id}/like`,

  // Comments
  INSIGHT_COMMENTS: (id: string) => `/api/comments/insights/${id}/comments`,
  COMMENT_REPLIES: (id: string) => `/api/comments/${id}/replies`,
  CREATE_COMMENT: (insightId: string) => `/api/comments/insights/${insightId}/comments`,
  REPLY_TO_COMMENT: (commentId: string) => `/api/comments/${commentId}/reply`,
  UPDATE_COMMENT: (commentId: string) => `/api/comments/${commentId}`,
  DELETE_COMMENT: (commentId: string) => `/api/comments/${commentId}`,
  LIKE_COMMENT: (commentId: string) => `/api/comments/${commentId}/like`,
  FLAG_COMMENT: (commentId: string) => `/api/comments/${commentId}/flag`,

  // Reports
  REPORTS: '/api/reports',
};

// Messages
export const MESSAGES = {
  // Success
  COMMENT_CREATED: 'Comment posted successfully',
  COMMENT_UPDATED: 'Comment updated successfully',
  COMMENT_DELETED: 'Comment deleted successfully',
  COMMENT_FLAGGED: 'Comment reported for moderation',
  INSIGHT_LIKED: 'Added to liked insights',
  INSIGHT_UNLIKED: 'Removed from liked insights',

  // Error
  LOAD_INSIGHTS_ERROR: 'Failed to load insights',
  LOAD_COMMENTS_ERROR: 'Failed to load comments',
  CREATE_COMMENT_ERROR: 'Failed to post comment',
  UPDATE_COMMENT_ERROR: 'Failed to update comment',
  DELETE_COMMENT_ERROR: 'Failed to delete comment',
  LIKE_ERROR: 'Failed to like insight',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED_ERROR: 'Please log in to continue',
  PREMIUM_REQUIRED: 'This content requires a premium subscription',

  // Info
  NO_INSIGHTS: 'No insights available',
  NO_COMMENTS: 'No comments yet. Be the first to comment!',
  NO_REPLIES: 'No replies yet',
  COMMENT_DELETED_PLACEHOLDER: '[deleted]',
  MAX_NESTING_REACHED: 'Maximum reply depth reached',
  LOADING: 'Loading...',
  LOAD_MORE: 'Load more',
  PULL_TO_REFRESH: 'Pull to refresh',
};

// Pagination
export const PAGINATION = {
  INSIGHTS_PER_PAGE: 10,
  COMMENTS_PER_PAGE: 20,
  REPLIES_PER_PAGE: 10,
};

// Limits
export const LIMITS = {
  MAX_COMMENT_LENGTH: 2000,
  MAX_REPLY_DEPTH: 3,
  MIN_COMMENT_LENGTH: 1,
};

// Time Formatting
export const TIME_FORMATS = {
  SHORT: 'short', // "2h ago"
  LONG: 'long', // "2 hours ago"
  FULL: 'full', // "Jan 4, 2026 at 3:30 PM"
};

// Engagement Thresholds
export const THRESHOLDS = {
  TRENDING_LIKES: 50,
  TRENDING_COMMENTS: 10,
  TRENDING_VIEWS: 1000,
  POPULAR_LIKES: 20,
};

// Animation Durations (ms)
export const ANIMATION = {
  SHORT: 200,
  MEDIUM: 300,
  LONG: 500,
};

// Cache Keys (for local storage/async storage)
export const CACHE_KEYS = {
  INSIGHTS_LIST: 'insights_list',
  INSIGHT_DETAIL: (id: string) => `insight_${id}`,
  COMMENTS: (insightId: string) => `comments_${insightId}`,
  LIKED_INSIGHTS: 'liked_insights',
};

// Cache Duration (ms)
export const CACHE_DURATION = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 15 * 60 * 1000, // 15 minutes
  LONG: 60 * 60 * 1000, // 1 hour
};
