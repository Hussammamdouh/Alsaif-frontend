/**
 * Chat Events
 * Lightweight event bus for cross-screen chat state synchronization.
 * Used for optimistic UI updates when chats are deleted or left,
 * so the chat list updates instantly without needing a refresh.
 */

type ChatEventListener = (chatId: string) => void;

const chatRemovedListeners = new Set<ChatEventListener>();

export const chatEvents = {
    /**
     * Subscribe to chat removal events.
     * Returns an unsubscribe function.
     */
    onChatRemoved: (listener: ChatEventListener): (() => void) => {
        chatRemovedListeners.add(listener);
        return () => chatRemovedListeners.delete(listener);
    },

    /**
     * Emit a chat removed event (called after successful delete or leave).
     */
    emitChatRemoved: (chatId: string): void => {
        chatRemovedListeners.forEach(listener => listener(chatId));
    },
};
