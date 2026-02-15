/**
 * Chat Settings Hooks
 * Hooks for fetching and managing chat settings
 */

import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '../../../core/services/api/apiClient';
import { ChatSettings, ChatSettingsResponse, UpdateSettingsRequest } from './chatSettings.types';
import { chatEvents } from '../chatEvents';

/**
 * Hook for fetching and managing chat settings
 */
export function useChatSettings(chatId: string) {
    const [settings, setSettings] = useState<ChatSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    /**
     * Fetch chat settings
     */
    const fetchSettings = useCallback(async () => {
        if (!chatId) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await apiClient.get<ChatSettingsResponse>(`/api/chats/${chatId}/settings`);

            if (response.success) {
                setSettings(response.data);
            } else {
                setError(response.message || 'Failed to load settings');
            }
        } catch (err: any) {
            console.error('[useChatSettings] Fetch error:', err);
            setError(err.message || 'Failed to load settings');
        } finally {
            setIsLoading(false);
        }
    }, [chatId]);

    /**
     * Update chat settings
     */
    const updateSettings = useCallback(async (updates: UpdateSettingsRequest) => {
        if (!chatId) return;

        setIsUpdating(true);
        setError(null);

        try {
            const response = await apiClient.patch<{ success: boolean; message?: string }>(
                `/api/chats/${chatId}/settings`,
                updates
            );

            if (response.success) {
                // Refresh settings
                await fetchSettings();
                return true;
            } else {
                setError(response.message || 'Failed to update settings');
                return false;
            }
        } catch (err: any) {
            console.error('[useChatSettings] Update error:', err);
            setError(err.message || 'Failed to update settings');
            return false;
        } finally {
            setIsUpdating(false);
        }
    }, [chatId, fetchSettings]);

    /**
     * Grant send permission to a user
     */
    const grantSendPermission = useCallback(async (userId: string) => {
        if (!chatId) return false;

        setIsUpdating(true);

        try {
            const response = await apiClient.post<{ success: boolean }>(
                `/api/chats/${chatId}/grant-send/${userId}`
            );

            if (response.success) {
                await fetchSettings();
                return true;
            }
            return false;
        } catch (err: any) {
            console.error('[useChatSettings] Grant error:', err);
            setError(err.message);
            return false;
        } finally {
            setIsUpdating(false);
        }
    }, [chatId, fetchSettings]);

    /**
     * Revoke send permission from a user
     */
    const revokeSendPermission = useCallback(async (userId: string) => {
        if (!chatId) return false;

        setIsUpdating(true);

        try {
            const response = await apiClient.delete<{ success: boolean }>(
                `/api/chats/${chatId}/revoke-send/${userId}`
            );

            if (response.success) {
                await fetchSettings();
                return true;
            }
            return false;
        } catch (err: any) {
            console.error('[useChatSettings] Revoke error:', err);
            setError(err.message);
            return false;
        } finally {
            setIsUpdating(false);
        }
    }, [chatId, fetchSettings]);

    /**
     * Kick a user from the group
     */
    const kickUser = useCallback(async (userId: string) => {
        if (!chatId) return false;

        setIsUpdating(true);

        try {
            const response = await apiClient.delete<{ success: boolean }>(
                `/api/chats/${chatId}/kick/${userId}`
            );

            if (response.success) {
                await fetchSettings();
                return true;
            }
            return false;
        } catch (err: any) {
            console.error('[useChatSettings] Kick error:', err);
            setError(err.message);
            return false;
        } finally {
            setIsUpdating(false);
        }
    }, [chatId, fetchSettings]);

    /**
     * Delete the group
     */
    const deleteGroup = useCallback(async () => {
        if (!chatId) return false;

        setIsUpdating(true);

        try {
            const response = await apiClient.delete<{ success: boolean }>(
                `/api/chats/${chatId}`
            );

            if (response.success) {
                chatEvents.emitChatRemoved(chatId);
                return true;
            }
            return false;
        } catch (err: any) {
            console.error('[useChatSettings] Delete error:', err);
            setError(err.message);
            return false;
        } finally {
            setIsUpdating(false);
        }
    }, [chatId]);

    /**
     * Leave the group
     */
    const leaveGroup = useCallback(async () => {
        if (!chatId) return false;

        setIsUpdating(true);

        try {
            const response = await apiClient.post<{ success: boolean }>(
                `/api/chats/${chatId}/leave`
            );

            if (response.success) {
                chatEvents.emitChatRemoved(chatId);
                return true;
            }
            return false;
        } catch (err: any) {
            console.error('[useChatSettings] Leave error:', err);
            setError(err.message);
            return false;
        } finally {
            setIsUpdating(false);
        }
    }, [chatId]);

    // Fetch settings on mount
    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    return {
        settings,
        isLoading,
        isUpdating,
        error,
        refresh: fetchSettings,
        updateSettings,
        grantSendPermission,
        revokeSendPermission,
        kickUser,
        deleteGroup,
        leaveGroup,
    };
}
