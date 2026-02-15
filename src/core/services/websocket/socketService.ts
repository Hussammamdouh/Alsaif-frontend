/**
 * WebSocket Service
 * Handles real-time communication with the backend using Socket.IO
 */

import { io, Socket } from 'socket.io-client';
import { loadAuthSession } from '../../../app/auth/auth.storage';
import { getApiBaseUrl } from '../../config/env';

const SOCKET_URL = getApiBaseUrl();

export enum SocketEvent {
  CONNECTION = 'connection',
  DISCONNECT = 'disconnect',
  AUTHENTICATE = 'authenticate',
  AUTHENTICATED = 'authenticated',
  AUTHENTICATION_ERROR = 'authentication_error',
  JOIN_CHAT = 'join_chat',
  LEAVE_CHAT = 'leave_chat',
  SEND_MESSAGE = 'send_message',
  MESSAGE_RECEIVED = 'message_received',
  MESSAGE_UPDATED = 'MESSAGE_UPDATED',
  MESSAGE_DELETED = 'MESSAGE_DELETED',
  MESSAGE_PINNED = 'MESSAGE_PINNED',
  REACTION_ADDED = 'REACTION_ADDED',
  REACTION_REMOVED = 'REACTION_REMOVED',
  CHAT_LIST_UPDATED = 'chat_list_updated',
  TYPING_START = 'typing_start',
  TYPING_STOP = 'typing_stop',
  ERROR = 'error',
}

class SocketService {
  private pendingEmissions: { event: string; data: any }[] = [];
  private currentChatId: string | null = null;

  /**
   * Initialize and connect to WebSocket server
   */
  async connect(): Promise<void> {
    if (this.socket?.connected) {
      console.log('[SocketService] Already connected');
      return;
    }

    if (this.isConnecting) {
      console.log('[SocketService] Connection already in progress');
      return;
    }

    try {
      this.isConnecting = true;

      // Load auth session to get access token
      const session = await loadAuthSession();

      if (!session || !session.tokens?.accessToken) {
        console.warn('[SocketService] No auth session or token found, cannot connect');
        this.isConnecting = false;
        return;
      }

      console.log('[SocketService] Connecting to WebSocket server with token...');

      // Create socket connection with auth token
      this.socket = io(SOCKET_URL, {
        auth: {
          token: session.tokens.accessToken,
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: this.maxReconnectAttempts,
      });

      // Connection event handlers
      this.socket.on('connect', () => {
        console.log('[SocketService] Connected to WebSocket server');
        this.reconnectAttempts = 0;
        this.isConnecting = false;

        // Process any pending emissions
        if (this.pendingEmissions.length > 0) {
          console.log(`[SocketService] Processing ${this.pendingEmissions.length} pending emissions`);
          this.pendingEmissions.forEach(({ event, data }) => {
            this.socket?.emit(event, data);
          });
          this.pendingEmissions = [];
        }

        // Auto-rejoin current chat if it exists
        if (this.currentChatId) {
          console.log('[SocketService] Auto-rejoining chat:', this.currentChatId);
          this.socket?.emit(SocketEvent.JOIN_CHAT, { chatId: this.currentChatId });
        }
      });

      this.socket.on('disconnect', (reason) => {
        console.log('[SocketService] Disconnected:', reason);
        this.isConnecting = false;
      });

      this.socket.on('error', (error) => {
        console.error('[SocketService] Socket error:', error);
        this.isConnecting = false;
      });

      this.socket.on(SocketEvent.AUTHENTICATION_ERROR, (error) => {
        console.error('[SocketService] Authentication error:', error);
        this.disconnect();
      });

      this.socket.on('connect_error', async (error) => {
        console.error('[SocketService] Connection error:', error.message);
        this.reconnectAttempts++;
        this.isConnecting = false;

        // If authentication error, try to get a fresh token
        if (error.message.includes('Not authorized') || error.message.includes('token')) {
          console.log('[SocketService] Auth error - attempting to reconnect with fresh token');
          const freshSession = await loadAuthSession();
          if (freshSession?.tokens?.accessToken && this.socket) {
            // Update the auth token for reconnection
            (this.socket.auth as any).token = freshSession.tokens.accessToken;
          }
        }

        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.error('[SocketService] Max reconnection attempts reached');
          this.disconnect();
        }
      });

    } catch (error) {
      console.error('[SocketService] Failed to connect:', error);
      this.isConnecting = false;
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      console.log('[SocketService] Disconnecting from WebSocket server');
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.currentChatId = null;
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Emit an event to the server
   */
  emit(event: SocketEvent | string, data?: any): void {
    if (!this.socket?.connected) {
      console.log(`[SocketService] Socket not connected. Buffering event: ${event}`);
      this.pendingEmissions.push({ event, data });
      return;
    }

    this.socket.emit(event, data);
  }

  /**
   * Listen for events from the server
   */
  on(event: SocketEvent | string, callback: (data: any) => void): void {
    if (!this.socket) {
      console.warn('[SocketService] Cannot listen - socket not initialized');
      return;
    }

    this.socket.on(event, callback);
  }

  /**
   * Remove event listener
   */
  off(event: SocketEvent | string, callback?: (data: any) => void): void {
    if (!this.socket) {
      return;
    }

    if (callback) {
      this.socket.off(event, callback);
    } else {
      this.socket.off(event);
    }
  }

  /**
   * Join a chat room
   */
  joinChat(chatId: string): void {
    this.currentChatId = chatId;
    this.emit(SocketEvent.JOIN_CHAT, { chatId });
  }

  /**
   * Leave a chat room
   */
  leaveChat(chatId: string): void {
    if (this.currentChatId === chatId) {
      this.currentChatId = null;
    }
    this.emit(SocketEvent.LEAVE_CHAT, { chatId });
  }

  /**
   * Send a message
   */
  sendMessage(chatId: string, content: string, replyTo?: string): void {
    this.emit(SocketEvent.SEND_MESSAGE, { chatId, content, replyTo });
  }

  /**
   * Start typing indicator
   */
  startTyping(chatId: string): void {
    this.emit(SocketEvent.TYPING_START, { chatId });
  }

  /**
   * Stop typing indicator
   */
  stopTyping(chatId: string): void {
    this.emit(SocketEvent.TYPING_STOP, { chatId });
  }
}

// Export singleton instance
export const socketService = new SocketService();
