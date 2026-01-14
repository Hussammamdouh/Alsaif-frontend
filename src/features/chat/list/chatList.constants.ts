/**
 * Chat List Constants
 * Shared constants and configuration for chat list feature
 */

import { ChatFilter } from './chatList.types';

/**
 * Pagination Configuration
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  INITIAL_PAGE: 1,
} as const;

/**
 * Chat Filters
 */
export const CHAT_FILTERS: Array<{
  id: ChatFilter;
  label: string;
  icon?: string;
}> = [
  { id: ChatFilter.ALL, label: 'All' },
  { id: ChatFilter.UNREAD, label: 'Unread' },
  { id: ChatFilter.PREMIUM, label: 'Premium', icon: 'star' },
  { id: ChatFilter.GROUPS, label: 'Groups' },
];

/**
 * Time Formatting Constants
 */
export const TIME_FORMAT = {
  TODAY: 'h:mm A',
  WEEK: 'ddd',
  OLDER: 'MMM d',
} as const;

/**
 * Avatar Configuration
 */
export const AVATAR_CONFIG = {
  SIZE: 56,
  GROUP_SIZE: 48,
  GROUP_MAX_VISIBLE: 3,
  BORDER_WIDTH: 2,
} as const;

/**
 * Badge Configuration
 */
export const BADGE_CONFIG = {
  MAX_COUNT: 99,
  MAX_COUNT_DISPLAY: '99+',
} as const;

/**
 * Empty State Messages
 */
export const EMPTY_STATES = {
  NO_CHATS: {
    title: 'No Conversations Yet',
    message: 'Start a conversation with an advisor or join a group to get started.',
    icon: 'chatbubbles-outline',
  },
  NO_RESULTS: {
    title: 'No Results Found',
    message: 'Try adjusting your search or filters.',
    icon: 'search-outline',
  },
  ERROR: {
    title: 'Something Went Wrong',
    message: 'Unable to load conversations. Please try again.',
    icon: 'alert-circle-outline',
  },
  UNAUTHORIZED: {
    title: 'Access Denied',
    message: 'You do not have permission to view conversations.',
    icon: 'lock-closed-outline',
  },
} as const;

/**
 * Animation Configuration
 */
export const ANIMATION = {
  ENTER_DURATION: 400,
  ENTER_DELAY: 50,
  BADGE_SCALE: 1.1,
  ROW_PRESS_SCALE: 0.98,
} as const;

/**
 * List Performance Configuration
 */
export const LIST_CONFIG = {
  WINDOW_SIZE: 10,
  MAX_TO_RENDER_PER_BATCH: 5,
  UPDATE_CELLS_BATCH_PERIOD: 50,
  INITIAL_NUM_TO_RENDER: 10,
  REMOVE_CLIPPED_SUBVIEWS: true,
} as const;
