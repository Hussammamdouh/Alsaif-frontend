/**
 * Chat Settings Types
 * Type definitions for chat settings API responses
 */

/**
 * Participant in a chat group
 */
export interface ChatParticipant {
    id: string;
    name: string;
    email?: string;
    avatar?: string;
    role?: 'user' | 'admin' | 'superadmin';
    permission: 'read_only' | 'member' | 'admin';
    joinedAt: string;
    canSend: boolean;
}

/**
 * Chat settings from API
 */
export interface ChatSettings {
    id: string;
    name: string;
    type: 'private' | 'group';
    isSystemGroup: boolean;
    tierGroup: 'free' | 'premium' | null;
    participantCount: number;
    settings: {
        onlyAdminsCanSend: boolean;
        allowedSenders: string[];
    };
    participants: ChatParticipant[];
    currentUserPermission: 'read_only' | 'member' | 'admin';
    isAdmin: boolean;
    canSend: boolean;
}

/**
 * API response for chat settings
 */
export interface ChatSettingsResponse {
    success: boolean;
    data: ChatSettings;
    message?: string;
}

/**
 * Update settings request
 */
export interface UpdateSettingsRequest {
    name?: string;
    onlyAdminsCanSend?: boolean;
}
