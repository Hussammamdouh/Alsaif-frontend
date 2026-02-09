/**
 * Insights API Client
 * API functions for insights and comments
 */

import apiClient from '../../core/services/api/apiClient';
import {
  API_ENDPOINTS,
  PAGINATION,
} from './insights.constants';
import type {
  InsightsQueryParams,
  InsightCommentsQueryParams,
  InsightsListResponse,
  InsightDetailResponse,
  InsightCommentsResponse,
  RepliesResponse,
  CreateInsightCommentPayload,
  CreateInsightCommentResponse,
  UpdateInsightCommentPayload,
  ReplyToInsightCommentPayload,
  FlagInsightCommentPayload,
  LikeResponse,
} from './insights.types';

// ==================== INSIGHTS API ====================

/**
 * Get published insights with optional filters
 */
export const getPublishedInsights = async (
  params: InsightsQueryParams = {}
): Promise<InsightsListResponse> => {
  const queryParams = {
    page: params.page || 1,
    limit: params.limit || PAGINATION.INSIGHTS_PER_PAGE,
    ...(params.type && { type: params.type }),
    ...(params.category && { category: params.category }),
    ...(params.search && { search: params.search }),
    ...(params.market && { market: params.market }),
    ...(params.insightFormat && { insightFormat: params.insightFormat }),
  };

  return apiClient.get(API_ENDPOINTS.INSIGHTS_PUBLISHED, queryParams);
};

/**
 * Get featured insights
 */
export const getFeaturedInsights = async (): Promise<InsightsListResponse> => {
  return apiClient.get(API_ENDPOINTS.INSIGHTS_FEATURED);
};

/**
 * Get single insight by ID
 */
export const getInsightById = async (id: string): Promise<InsightDetailResponse> => {
  return apiClient.get(API_ENDPOINTS.INSIGHT_BY_ID(id));
};

/**
 * Like/unlike an insight
 */
export const toggleLikeInsight = async (id: string): Promise<LikeResponse> => {
  return apiClient.post(API_ENDPOINTS.LIKE_INSIGHT(id));
};

// ==================== COMMENTS API ====================

/**
 * Get comments for an insight
 */
export const getInsightCommentsForInsight = async (
  insightId: string,
  params: InsightCommentsQueryParams = {}
): Promise<InsightCommentsResponse> => {
  const queryParams = {
    page: params.page || 1,
    limit: params.limit || PAGINATION.COMMENTS_PER_PAGE,
    ...(params.sortBy && { sortBy: params.sortBy }),
  };

  return apiClient.get(API_ENDPOINTS.INSIGHT_COMMENTS(insightId), queryParams);
};

/**
 * Get replies for a comment
 */
export const getRepliesForInsightComment = async (
  commentId: string,
  params: InsightCommentsQueryParams = {}
): Promise<RepliesResponse> => {
  const queryParams = {
    page: params.page || 1,
    limit: params.limit || PAGINATION.REPLIES_PER_PAGE,
  };

  return apiClient.get(API_ENDPOINTS.COMMENT_REPLIES(commentId), queryParams);
};

/**
 * Create a new comment on an insight
 */
export const createInsightComment = async (
  insightId: string,
  payload: CreateInsightCommentPayload
): Promise<CreateInsightCommentResponse> => {
  return apiClient.post(API_ENDPOINTS.CREATE_COMMENT(insightId), payload);
};

/**
 * Reply to a comment
 */
export const replyToInsightComment = async (
  commentId: string,
  payload: ReplyToInsightCommentPayload
): Promise<CreateInsightCommentResponse> => {
  return apiClient.post(API_ENDPOINTS.REPLY_TO_COMMENT(commentId), payload);
};

/**
 * Update a comment
 */
export const updateInsightComment = async (
  commentId: string,
  payload: UpdateInsightCommentPayload
): Promise<CreateInsightCommentResponse> => {
  return apiClient.patch(API_ENDPOINTS.UPDATE_COMMENT(commentId), payload);
};

/**
 * Delete a comment
 */
export const deleteInsightComment = async (commentId: string): Promise<{ success: boolean; message: string }> => {
  return apiClient.delete(API_ENDPOINTS.DELETE_COMMENT(commentId));
};

/**
 * Like/unlike a comment
 */
export const toggleLikeInsightComment = async (commentId: string): Promise<LikeResponse> => {
  return apiClient.post(API_ENDPOINTS.LIKE_COMMENT(commentId));
};

/**
 * Flag a comment for moderation
 */
export const flagInsightComment = async (
  commentId: string,
  payload: FlagInsightCommentPayload
): Promise<{ success: boolean; message: string }> => {
  return apiClient.post(API_ENDPOINTS.FLAG_COMMENT(commentId), payload);
};

/**
 * Report an insight or comment (new system)
 */
export const createReport = async (payload: {
  targetType: 'insight' | 'comment';
  targetId: string;
  reason: string;
  description?: string;
}): Promise<{ success: boolean; message: string }> => {
  return apiClient.post(API_ENDPOINTS.REPORTS, payload);
};
