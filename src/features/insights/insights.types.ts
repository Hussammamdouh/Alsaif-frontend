/**
 * Insights Types
 * Type definitions for insights, comments, and engagement features
 */

export type InsightType = 'free' | 'premium';

export type InsightStatus = 'draft' | 'published' | 'archived' | 'under_review';

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

export interface Insight {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  type: InsightType;
  category: InsightCategory;
  tags: string[];
  author: InsightAuthor;
  status: InsightStatus;
  featured: boolean;
  publishedAt?: string;
  views: number;
  likes: number;
  commentsCount: number;
  readTime?: number;
  coverImage?: string;
  insightFormat?: 'article' | 'signal';
  market?: 'ADX' | 'DFM' | 'Other';
  symbol?: string;
  stockName?: string;
  stockNameAr?: string;
  buyPrice?: number;
  firstGoal?: number;
  secondGoal?: number;
  stopLoss?: number;
  createdAt: string;
  updatedAt: string;
}

export interface InsightAuthor {
  _id: string;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
}

export interface InsightListItem extends Insight {
  // List view can include content for fallback excerpts
  hasLiked?: boolean;
  hasBookmarked?: boolean;
}

export interface InsightComment {
  _id: string;
  insightId: string;
  author: CommentAuthor;
  content: string;
  parentComment?: string | null;
  level: number;
  likes: number;
  hasLiked?: boolean;
  replyCount: number;
  isEdited: boolean;
  editedAt?: string;
  isDeleted: boolean;
  deletedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CommentAuthor {
  _id: string;
  name: string;
  email?: string;
  avatar?: string;
}

export interface CreateInsightCommentPayload {
  content: string;
}

export interface UpdateInsightCommentPayload {
  content: string;
}

export interface ReplyToInsightCommentPayload {
  content: string;
}

export interface FlagInsightCommentPayload {
  reason: string;
}

// API Response Types

export interface InsightsListResponse {
  success: boolean;
  data: {
    insights: InsightListItem[];
    total: number;
    page: number;
    totalPages: number;
    hasMore?: boolean;
  };
}

export interface InsightDetailResponse {
  success: boolean;
  data: {
    insight: Insight;
    hasLiked?: boolean;
    hasBookmarked?: boolean;
  };
}

export interface InsightCommentsResponse {
  success: boolean;
  data: {
    comments: InsightComment[];
    total: number;
    page: number;
    totalPages: number;
  };
}

export interface RepliesResponse {
  success: boolean;
  data: {
    replies: InsightComment[];
    total: number;
    page: number;
    totalPages: number;
  };
}

export interface CreateInsightCommentResponse {
  success: boolean;
  data: {
    comment: InsightComment;
  };
  message: string;
}

export interface LikeResponse {
  success: boolean;
  data: {
    liked: boolean;
    likes: number;
  };
  message: string;
}

// Filter and Sort Options

export type InsightSortBy = 'latest' | 'popular' | 'most_liked' | 'most_commented';

export interface InsightsQueryParams {
  page?: number;
  limit?: number;
  type?: InsightType;
  category?: InsightCategory;
  sortBy?: InsightSortBy;
  search?: string;
}

export interface InsightCommentsQueryParams {
  page?: number;
  limit?: number;
  sortBy?: 'latest' | 'popular';
}
