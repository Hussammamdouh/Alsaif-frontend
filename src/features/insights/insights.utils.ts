/**
 * Insights Utilities
 * Helper functions for formatting, filtering, and processing insights data
 */

import { InsightCategory, InsightType, Insight, InsightListItem } from './insights.types';
import { CATEGORY_CONFIG, THRESHOLDS } from './insights.constants';

/**
 * Format time ago (e.g., "2h ago", "3 days ago")
 */
export const formatTimeAgo = (dateString: string, t: (key: string, params?: any) => string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return t('time.justNow');
  if (seconds < 3600) return t('time.minutesAgo', { count: Math.floor(seconds / 60) });
  if (seconds < 86400) return t('time.hoursAgo', { count: Math.floor(seconds / 3600) });
  if (seconds < 604800) return t('time.daysAgo', { count: Math.floor(seconds / 86400) });
  if (seconds < 2592000) return t('time.weeksAgo', { count: Math.floor(seconds / 604800) });
  return t('time.monthsAgo', { count: Math.floor(seconds / 2592000) });
};

/**
 * Format full date (e.g., "Jan 4, 2026")
 */
export const formatFullDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format read time (e.g., "5 min read")
 */
export const formatReadTime = (minutes: number | undefined, t: (key: string, params?: any) => string): string => {
  if (!minutes) return '';
  return t('time.readTime', { count: minutes });
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Get category display info
 */
export const getCategoryInfo = (category: InsightCategory) => {
  return CATEGORY_CONFIG[category] || CATEGORY_CONFIG.other;
};

/**
 * Check if insight is trending
 */
export const isTrending = (insight: InsightListItem | Insight): boolean => {
  return (
    insight.likes >= THRESHOLDS.TRENDING_LIKES ||
    insight.commentsCount >= THRESHOLDS.TRENDING_COMMENTS ||
    insight.views >= THRESHOLDS.TRENDING_VIEWS
  );
};

/**
 * Check if insight is popular
 */
export const isPopular = (insight: InsightListItem | Insight): boolean => {
  return insight.likes >= THRESHOLDS.POPULAR_LIKES;
};

/**
 * Format engagement count (e.g., "1.2k", "500")
 */
export const formatCount = (count: number): string => {
  if (count === undefined || count === null || isNaN(count)) {
    return '0';
  }
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
};

/**
 * Strip HTML tags from content
 */
export const stripHtml = (html: string): string => {
  return html.replace(/<[^>]*>/g, '');
};

/**
 * Generate excerpt from content if not provided
 */
export const generateExcerpt = (content: string, maxLength: number = 150): string => {
  const plainText = stripHtml(content);
  return truncateText(plainText, maxLength);
};

/**
 * Get insight type badge color
 */
export const getTypeBadgeColor = (type: InsightType): string => {
  return type === 'premium' ? '#6366f1' : '#34c759';
};

/**
 * Validate comment content
 */
export const validateInsightComment = (content: string): { valid: boolean; error?: string } => {
  const trimmed = content.trim();

  if (!trimmed) {
    return { valid: false, error: 'InsightComment cannot be empty' };
  }

  if (trimmed.length < 1) {
    return { valid: false, error: 'InsightComment is too short' };
  }

  if (trimmed.length > 2000) {
    return { valid: false, error: 'InsightComment is too long (max 2000 characters)' };
  }

  return { valid: true };
};

/**
 * Check if user can reply to comment (based on nesting level)
 */
export const canReplyToInsightComment = (level: number, maxDepth: number = 3): boolean => {
  return level < maxDepth;
};

/**
 * Sort insights by criteria
 */
export const sortInsights = (
  insights: InsightListItem[],
  sortBy: 'latest' | 'popular' | 'most_liked' | 'most_commented'
): InsightListItem[] => {
  const sorted = [...insights];

  switch (sortBy) {
    case 'latest':
      return sorted.sort((a, b) =>
        new Date(b.publishedAt || b.createdAt).getTime() -
        new Date(a.publishedAt || a.createdAt).getTime()
      );

    case 'popular':
      return sorted.sort((a, b) => b.views - a.views);

    case 'most_liked':
      return sorted.sort((a, b) => b.likes - a.likes);

    case 'most_commented':
      return sorted.sort((a, b) => b.commentsCount - a.commentsCount);

    default:
      return sorted;
  }
};

/**
 * Filter insights by type
 */
export const filterInsightsByType = (
  insights: InsightListItem[],
  type?: InsightType
): InsightListItem[] => {
  if (!type) return insights;
  return insights.filter(insight => insight.type === type);
};

/**
 * Search insights by title or excerpt
 */
export const searchInsights = (
  insights: InsightListItem[],
  query: string
): InsightListItem[] => {
  if (!query.trim()) return insights;

  const lowerQuery = query.toLowerCase();
  return insights.filter(insight =>
    insight.title.toLowerCase().includes(lowerQuery) ||
    insight.excerpt?.toLowerCase().includes(lowerQuery) ||
    insight.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
  );
};

/**
 * Get unique tags from insights
 */
export const getUniqueTags = (insights: InsightListItem[]): string[] => {
  const tagsSet = new Set<string>();
  insights.forEach(insight => {
    insight.tags.forEach(tag => tagsSet.add(tag));
  });
  return Array.from(tagsSet).sort();
};

/**
 * Calculate comment depth indentation
 */
export const getCommentIndentation = (level: number): number => {
  return Math.min(level, 3) * 16; // Max 48px indentation
};

/**
 * Check if content contains mentions (for future feature)
 */
export const extractMentions = (content: string): string[] => {
  const mentionRegex = /@(\w+)/g;
  const mentions: string[] = [];
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[1]);
  }

  return mentions;
};

/**
 * Sanitize user input (basic XSS prevention)
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};
