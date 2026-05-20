/**
 * Insights Feature - Public API
 * Export all screens, components, hooks, types, and utilities
 */

// Screens
export { InsightsListScreen } from './InsightsListScreen';
export { PremiumInsightsListScreen } from './PremiumInsightsListScreen';
export { InsightDetailsScreen } from './InsightDetailsScreen';

// Components
export { InsightCommentThread as CommentThread } from './CommentThread';
export { InsightCommentItem as CommentItem } from './CommentItem';
export { CommentInput } from './CommentInput';

// Hooks
export {
  useInsights,
  useInsightDetail,
  useInsightComments,
  useReplies,
  useCreateInsightComment,
  useReplyToInsightComment,
  useLikeInsightComment,
  useDeleteInsightComment,
  useUpdateInsightComment,
  useFlagInsightComment,
  useReport,
} from './insights.hooks';

// Types
export type {
  InsightType,
  InsightStatus,
  InsightCategory,
  Insight,
  InsightAuthor,
  InsightListItem,
  InsightComment,
  CommentAuthor,
  CreateInsightCommentPayload,
  UpdateInsightCommentPayload,
  ReplyToInsightCommentPayload,
  FlagInsightCommentPayload,
  InsightsListResponse,
  InsightDetailResponse,
  InsightCommentsResponse,
  RepliesResponse,
  CreateInsightCommentResponse,
  LikeResponse,
  InsightSortBy,
  InsightsQueryParams,
  InsightCommentsQueryParams,
} from './insights.types';

// Constants
export {
  CATEGORY_CONFIG,
  SORT_CONFIG,
  COLORS as INSIGHTS_COLORS,
  ICONS as INSIGHTS_ICONS,
  API_ENDPOINTS as INSIGHTS_API_ENDPOINTS,
  MESSAGES as INSIGHTS_MESSAGES,
  PAGINATION as INSIGHTS_PAGINATION,
  LIMITS as INSIGHTS_LIMITS,
} from './insights.constants';

// Utilities
export {
  formatTimeAgo,
  formatFullDate,
  formatReadTime,
  truncateText,
  getCategoryInfo,
  isTrending,
  isPopular,
  formatCount,
  stripHtml,
  generateExcerpt,
  getTypeBadgeColor,
  validateInsightComment,
  canReplyToInsightComment,
  sortInsights,
  filterInsightsByType,
  searchInsights,
  getUniqueTags,
  getCommentIndentation,
  extractMentions,
  sanitizeInput,
} from './insights.utils';

// Styles
export { createInsightsStyles } from './insights.styles';
