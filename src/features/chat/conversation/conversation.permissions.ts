/**
 * Conversation Permissions
 * Centralized permission logic for chat functionality
 */

import { GroupRole, ConversationPermissions } from './conversation.types';
import { PERMISSION_DENIED_MESSAGES } from './conversation.constants';

/**
 * Check if user can send messages based on role
 *
 * @param role - User's role in the conversation
 * @returns Whether user can send messages
 */
export const canSendMessages = (role?: GroupRole): boolean => {
  if (!role) {
    // Private chat - both participants can send
    return true;
  }

  // Group chat - check role permissions
  switch (role) {
    case GroupRole.OWNER:
    case GroupRole.ADMIN:
    case GroupRole.MEMBER:
    case GroupRole.ANALYST:
      return true;
    case GroupRole.READ_ONLY:
      return false;
    default:
      return false;
  }
};

/**
 * Check if user can edit messages based on role
 *
 * @param role - User's role in the conversation
 * @returns Whether user can edit messages
 */
export const canEditMessages = (role?: GroupRole): boolean => {
  if (!role) {
    // Private chat - can edit own messages
    return true;
  }

  // Group chat - owners and admins can edit any, members can edit own
  switch (role) {
    case GroupRole.OWNER:
    case GroupRole.ADMIN:
    case GroupRole.MEMBER:
    case GroupRole.ANALYST:
      return true;
    case GroupRole.READ_ONLY:
      return false;
    default:
      return false;
  }
};

/**
 * Check if user can delete messages based on role
 *
 * @param role - User's role in the conversation
 * @param isOwnMessage - Whether the message belongs to the user
 * @returns Whether user can delete the message
 */
export const canDeleteMessage = (
  role?: GroupRole,
  isOwnMessage: boolean = false
): boolean => {
  if (!role) {
    // Private chat - can delete own messages
    return isOwnMessage;
  }

  // Group chat permissions
  switch (role) {
    case GroupRole.OWNER:
    case GroupRole.ADMIN:
      // Can delete any message
      return true;
    case GroupRole.MEMBER:
    case GroupRole.ANALYST:
      // Can only delete own messages
      return isOwnMessage;
    case GroupRole.READ_ONLY:
      return false;
    default:
      return false;
  }
};

/**
 * Check if user can reply to messages
 *
 * @param role - User's role in the conversation
 * @returns Whether user can reply
 */
export const canReplyToMessages = (role?: GroupRole): boolean => {
  // Reply permission same as send permission
  return canSendMessages(role);
};

/**
 * Get permission denied reason based on role
 *
 * @param role - User's role in the conversation
 * @returns Reason message for denied permission
 */
export const getPermissionDeniedReason = (role?: GroupRole): string => {
  if (!role) {
    return PERMISSION_DENIED_MESSAGES.DEFAULT;
  }

  switch (role) {
    case GroupRole.READ_ONLY:
      return PERMISSION_DENIED_MESSAGES.READ_ONLY;
    default:
      return PERMISSION_DENIED_MESSAGES.DEFAULT;
  }
};

/**
 * Build conversation permissions object
 *
 * @param role - User's role in the conversation
 * @param isBlocked - Whether conversation is blocked
 * @param isRemoved - Whether user is removed from conversation
 * @returns Complete permissions object
 */
export const buildConversationPermissions = (
  role?: GroupRole,
  isBlocked: boolean = false,
  isRemoved: boolean = false
): ConversationPermissions => {
  // If blocked or removed, no permissions
  if (isBlocked) {
    return {
      canSend: false,
      canEdit: false,
      canDelete: false,
      canReply: false,
      reason: PERMISSION_DENIED_MESSAGES.BLOCKED,
    };
  }

  if (isRemoved) {
    return {
      canSend: false,
      canEdit: false,
      canDelete: false,
      canReply: false,
      reason: PERMISSION_DENIED_MESSAGES.REMOVED,
    };
  }

  // Normal permissions based on role
  const canSend = canSendMessages(role);

  return {
    canSend,
    canEdit: canEditMessages(role),
    canDelete: false, // Message-specific, checked per message
    canReply: canReplyToMessages(role),
    reason: canSend ? undefined : getPermissionDeniedReason(role),
  };
};

/**
 * Get role badge color for UI
 *
 * @param role - User's role
 * @returns Color hex code
 */
export const getRoleBadgeColor = (role: GroupRole): string => {
  switch (role) {
    case GroupRole.OWNER:
      return '#F59E0B'; // Amber
    case GroupRole.ADMIN:
      return '#10B981'; // Green
    case GroupRole.ANALYST:
      return '#6366F1'; // Indigo
    case GroupRole.MEMBER:
      return '#6B7280'; // Gray
    case GroupRole.READ_ONLY:
      return '#9CA3AF'; // Light gray
    default:
      return '#6B7280';
  }
};

/**
 * Get role display name
 *
 * @param role - User's role
 * @returns Display name
 */
export const getRoleDisplayName = (role: GroupRole): string => {
  switch (role) {
    case GroupRole.OWNER:
      return 'Owner';
    case GroupRole.ADMIN:
      return 'Admin';
    case GroupRole.ANALYST:
      return 'ANALYST';
    case GroupRole.MEMBER:
      return 'Member';
    case GroupRole.READ_ONLY:
      return 'Read Only';
    default:
      return '';
  }
};
