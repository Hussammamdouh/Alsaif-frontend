/**
 * Insights Feature - Public API
 * Export all screens, components, hooks, types, and utilities
 */

// Screens
export { InsightsListScreen } from './InsightsListScreen';
export { PremiumInsightsListScreen } from './PremiumInsightsListScreen';
export { InsightDetailsScreen } from './InsightDetailsScreen';

// Components
export { CommentThread } from './CommentThread';
export { CommentItem } from './CommentItem';
export { CommentInput } from './CommentInput';

// Hooks
export {
  useInsights,
  useInsightDetail,
  useComments,
  useReplies,
  useCreateComment,
  useReplyToComment,
  useLikeComment,
  useDeleteComment,
  useUpdateComment,
  useFlagComment,
} from './insights.hooks';

// Types
export type {
  InsightType,
  InsightStatus,
  InsightCategory,
  Insight,
  InsightAuthor,
  InsightListItem,
  Comment,
  CommentAuthor,
  CreateCommentPayload,
  UpdateCommentPayload,
  ReplyToCommentPayload,
  FlagCommentPayload,
  InsightsListResponse,
  InsightDetailResponse,
  CommentsResponse,
  RepliesResponse,
  CreateCommentResponse,
  LikeResponse,
  InsightFilter,
  InsightSortBy,
  InsightsQueryParams,
  CommentsQueryParams,
} from './insights.types';

// Constants
export {
  CATEGORY_CONFIG,
  FILTER_CONFIG,
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
  validateComment,
  canReplyToComment,
  sortInsights,
  filterInsightsByType,
  searchInsights,
  getUniqueTags,
  getCommentIndentation,
  extractMentions,
  sanitizeInput,
} from './insights.utils';

// Styles
export { insightsStyles } from './insights.styles';
