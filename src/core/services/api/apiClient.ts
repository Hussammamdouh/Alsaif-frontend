/**
 * API Client
 * Centralized HTTP client with authentication and error handling
 * Automatically injects auth tokens and handles token refresh
 */

import {
  loadAuthSession,
  saveAuthSession,
  clearAllAuthData,
} from '../../../app/auth/auth.storage';
import { AuthSession } from '../../../app/auth/auth.types';
import { getApiBaseUrl, getApiTimeout } from '../../config/env';

/**
 * API Configuration
 */
const API_BASE_URL = getApiBaseUrl();
const API_TIMEOUT = getApiTimeout();

/**
 * API Error
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Request Configuration
 */
interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  requiresAuth?: boolean;
  skipRefresh?: boolean; // Skip automatic token refresh
}

/**
 * Refresh Subscribers & Callbacks
 */
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];
let onUnauthorizedCallback: (() => void) | null = null;

/**
 * Register Unauthorized Callback
 * Sets a callback to be executed when session is completely invalid
 */
export const setOnUnauthorizedCallback = (callback: () => void) => {
  onUnauthorizedCallback = callback;
};

/**
 * Subscribe to Token Refresh
 * Queues requests waiting for token refresh
 */
const subscribeToRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

/**
 * Notify Refresh Subscribers
 * Notifies all queued requests that token has been refreshed
 */
const notifyRefreshSubscribers = (token: string) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

/**
 * Trigger Unauthorized Logout
 * Clears session and notifies application
 */
const triggerUnauthorized = async () => {
  console.warn('[ApiClient] Unrecoverable 401 - Triggering logout');
  await clearAllAuthData();
  if (onUnauthorizedCallback) {
    onUnauthorizedCallback();
  }
};

/**
 * Refresh Access Token
 * Refreshes expired access token using refresh token
 */
const refreshAccessToken = async (): Promise<string> => {
  try {
    const session = await loadAuthSession();

    if (!session || !session.tokens.refreshToken) {
      console.warn('[ApiClient] No refresh token available - cannot refresh');
      throw new Error('No refresh token available');
    }

    console.log('[ApiClient] Attempting to refresh access token');

    // Call backend refresh endpoint
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken: session.tokens.refreshToken,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ApiClient] Token refresh failed:', response.status, errorText);

      // If unauthorized, clear session and redirect to login
      if (response.status === 401) {
        await triggerUnauthorized();
      }

      throw new Error('Token refresh failed');
    }

    const result = await response.json();

    // Backend returns: { success: true, message: "...", data: { accessToken, refreshToken } }
    const data = result.data;

    // Update session with new tokens
    const now = Date.now();
    const updatedSession: AuthSession = {
      ...session,
      tokens: {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken || session.tokens.refreshToken,
        expiresIn: 900, // 15 minutes (900 seconds) - matches backend JWT expiration
      },
      expiresAt: now + 900 * 1000,
    };

    // Save updated session
    await saveAuthSession(updatedSession);

    console.log('[ApiClient] Token refresh successful');
    return data.accessToken;
  } catch (error) {
    console.error('[ApiClient] Token refresh failed:', error);
    throw error;
  }
};

/**
 * Make API Request
 * Core HTTP request function with auth and error handling
 *
 * @param endpoint - API endpoint (e.g., '/users/profile')
 * @param config - Request configuration
 * @returns Response data
 */
export const apiRequest = async <T = unknown>(
  endpoint: string,
  config: RequestConfig
): Promise<T> => {
  const { method, headers = {}, body, requiresAuth = true, skipRefresh = false } = config;

  // Build request URL
  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`[ApiClient] Request: ${method} ${url}`, { requiresAuth, body });

  // Build headers
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Inject auth token if required
  if (requiresAuth) {
    const session = await loadAuthSession();

    if (!session) {
      throw new ApiError(401, 'Not authenticated');
    }

    requestHeaders['Authorization'] = `Bearer ${session.tokens.accessToken}`;
  }

  // Build request options
  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
  };

  // Add timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
  requestOptions.signal = controller.signal;

  try {
    // Make request
    const response = await fetch(url, requestOptions);
    console.log(`[ApiClient] Response: ${response.status} ${url}`);

    clearTimeout(timeoutId);

    // Handle 401 Unauthorized - try to refresh token
    if (response.status === 401 && requiresAuth && !skipRefresh) {
      // Check if already refreshing
      if (isRefreshing) {
        // Wait for ongoing refresh
        return new Promise((resolve, reject) => {
          subscribeToRefresh(async (newToken: string) => {
            try {
              // Retry request with new token
              requestHeaders['Authorization'] = `Bearer ${newToken}`;
              const retryResponse = await fetch(url, {
                ...requestOptions,
                headers: requestHeaders,
              });
              console.log(`[ApiClient] Retry Response (queued): ${retryResponse.status} ${url}`);

              if (!retryResponse.ok) {
                throw new ApiError(
                  retryResponse.status,
                  'Request failed after token refresh'
                );
              }

              const data = await retryResponse.json();
              resolve(data);
            } catch (error) {
              reject(error);
            }
          });
        });
      }

      // Start refresh process
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        isRefreshing = false;
        notifyRefreshSubscribers(newToken);

        // Retry original request with new token
        requestHeaders['Authorization'] = `Bearer ${newToken}`;
        const retryResponse = await fetch(url, {
          ...requestOptions,
          headers: requestHeaders,
        });
        console.log(`[ApiClient] Retry Response (first): ${retryResponse.status} ${url}`);

        if (!retryResponse.ok) {
          throw new ApiError(
            retryResponse.status,
            'Request failed after token refresh'
          );
        }

        return await retryResponse.json();
      } catch (refreshError) {
        isRefreshing = false;
        refreshSubscribers = [];

        // Refresh failed - user needs to login again
        await triggerUnauthorized();
        throw new ApiError(401, 'Session expired. Please login again.');
      }
    }

    // Handle other error responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`[ApiClient] API Error: ${response.status} ${url}`, errorData);
      throw new ApiError(
        response.status,
        errorData.message || `Request failed with status ${response.status}`,
        errorData
      );
    }

    // Parse and return response
    const data = await response.json();
    return data as T;
  } catch (error) {
    clearTimeout(timeoutId);

    // Handle timeout
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(408, 'Request timeout');
    }

    // Handle network errors
    if (error instanceof TypeError) {
      console.error(`[ApiClient] Network Error: ${url}`, error);
      throw new ApiError(0, 'Network error. Please check your connection.');
    }

    // Re-throw API errors
    if (error instanceof ApiError) {
      throw error;
    }

    // Unknown errors
    throw new ApiError(500, 'An unexpected error occurred');
  }
};

/**
 * Build URL with Query Parameters
 */
const buildUrlWithParams = (endpoint: string, params?: Record<string, any>): string => {
  if (!params || Object.keys(params).length === 0) {
    return endpoint;
  }

  const queryString = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');

  return queryString ? `${endpoint}?${queryString}` : endpoint;
};

/**
 * API Client Methods
 * Convenience methods for common HTTP verbs
 */
export const apiClient = {
  /**
   * GET request
   */
  get: <T = unknown>(endpoint: string, params?: Record<string, any>, requiresAuth = true): Promise<T> => {
    const url = buildUrlWithParams(endpoint, params);
    return apiRequest<T>(url, { method: 'GET', requiresAuth });
  },

  /**
   * POST request
   */
  post: <T = unknown>(
    endpoint: string,
    body?: unknown,
    requiresAuth = true
  ): Promise<T> => {
    return apiRequest<T>(endpoint, { method: 'POST', body, requiresAuth });
  },

  /**
   * PUT request
   */
  put: <T = unknown>(
    endpoint: string,
    body?: unknown,
    requiresAuth = true
  ): Promise<T> => {
    return apiRequest<T>(endpoint, { method: 'PUT', body, requiresAuth });
  },

  /**
   * PATCH request
   */
  patch: <T = unknown>(
    endpoint: string,
    body?: unknown,
    requiresAuth = true
  ): Promise<T> => {
    return apiRequest<T>(endpoint, { method: 'PATCH', body, requiresAuth });
  },

  /**
   * DELETE request
   */
  delete: <T = unknown>(
    endpoint: string,
    body?: unknown,
    requiresAuth = true
  ): Promise<T> => {
    return apiRequest<T>(endpoint, { method: 'DELETE', body, requiresAuth });
  },
};

export default apiClient;
