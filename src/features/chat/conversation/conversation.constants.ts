/**
 * Conversation Constants
 * Configuration and constants for conversation feature
 */

/**
 * Pagination Configuration
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 30,
  INITIAL_PAGE: 1,
} as const;

/**
 * Message Grouping Threshold
 * Messages from same sender within this time are grouped
 */
export const MESSAGE_GROUP_THRESHOLD_MS = 2 * 60 * 1000; // 2 minutes

/**
 * Time Formatting
 */
export const TIME_FORMAT = {
  MESSAGE: 'h:mm A',
  DAY_SEPARATOR: 'MMMM d, yyyy',
} as const;

/**
 * Message Bubble Styling
 */
export const MESSAGE_BUBBLE = {
  MAX_WIDTH_PERCENTAGE: 0.75,
  BORDER_RADIUS: 16,
  PADDING_HORIZONTAL: 14,
  PADDING_VERTICAL: 10,
  SPACING: 4,
  GROUP_SPACING: 16,
} as const;

/**
 * Input Configuration
 */
export const INPUT_CONFIG = {
  MAX_LINES: 5,
  PLACEHOLDER: 'Type a message...',
  PLACEHOLDER_GROUP: 'Discuss trends...',
  PLACEHOLDER_DISABLED: 'You cannot send messages in this chat',
} as const;

/**
 * Compliance Messages
 */
export const COMPLIANCE_MESSAGES = {
  MONITORED: 'CHATS ARE MONITORED FOR COMPLIANCE',
  ENCRYPTED: 'Messages in this group are encrypted and private.',
} as const;

/**
 * Empty State
 */
export const EMPTY_STATE = {
  TITLE: 'No messages yet',
  MESSAGE: 'Start the conversation by sending a message.',
  ICON: 'chatbubble-outline',
} as const;

/**
 * Permission Denied Messages
 */
export const PERMISSION_DENIED_MESSAGES = {
  READ_ONLY: 'You have read-only access to this conversation',
  REMOVED: 'You can no longer send messages in this conversation',
  BLOCKED: 'This conversation has been restricted',
  DEFAULT: 'You cannot send messages in this chat',
} as const;

/**
 * List Performance Configuration
 */
export const LIST_CONFIG = {
  WINDOW_SIZE: 15,
  MAX_TO_RENDER_PER_BATCH: 10,
  UPDATE_CELLS_BATCH_PERIOD: 50,
  INITIAL_NUM_TO_RENDER: 15,
  REMOVE_CLIPPED_SUBVIEWS: false, // Set to false for chat to avoid scroll issues
} as const;

/**
 * Animation Durations (ms)
 */
export const ANIMATION = {
  MESSAGE_SEND: 200,
  MESSAGE_FAILED_SHAKE: 400,
  KEYBOARD_TRANSITION: 250,
  SCROLL_TO_BOTTOM: 300,
} as const;

/**
 * File Size Limits
 */
export const FILE_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10 MB
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5 MB
} as const;
