/**
 * useModeration Hook
 * Manages content moderation operations
 */

import { useState, useEffect, useCallback } from 'react';
import { moderationService } from '../../../core/services/api/adminEnhancements.service';

interface UseModerationOptions {
  autoFetch?: boolean;
  initialPage?: number;
  initialLimit?: number;
}

export const useModeration = (options: UseModerationOptions = {}) => {
  const { autoFetch = true, initialPage = 1, initialLimit = 20 } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Moderation queue
  const [moderationQueue, setModerationQueue] = useState<any[]>([]);
  const [queuePage, setQueuePage] = useState(initialPage);
  const [queueLimit, setQueueLimit] = useState(initialLimit);
  const [queueTotalPages, setQueueTotalPages] = useState(1);
  const [queueTotalItems, setQueueTotalItems] = useState(0);

  // Flagged content
  const [flaggedContent, setFlaggedContent] = useState<any[]>([]);
  const [flaggedPage, setFlaggedPage] = useState(initialPage);
  const [flaggedLimit, setFlaggedLimit] = useState(initialLimit);
  const [flaggedTotalPages, setFlaggedTotalPages] = useState(1);
  const [flaggedTotalItems, setFlaggedTotalItems] = useState(0);

  // Filters
  const [queueStatus, setQueueStatus] = useState<'pending' | 'approved' | 'rejected' | undefined>();
  const [flaggedStatus, setFlaggedStatus] = useState<'pending' | 'resolved' | undefined>();
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical' | undefined>();

  // Fetch moderation queue
  const fetchModerationQueue = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await moderationService.getModerationQueue({
        page: queuePage,
        limit: queueLimit,
        status: queueStatus,
      });
      setModerationQueue(data.queue || data);
      setQueueTotalPages(data.totalPages || 1);
      setQueueTotalItems(data.total || data.length);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch moderation queue');
    } finally {
      setLoading(false);
    }
  }, [queuePage, queueLimit, queueStatus]);

  // Fetch flagged content
  const fetchFlaggedContent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await moderationService.getFlaggedContent({
        page: flaggedPage,
        limit: flaggedLimit,
        status: flaggedStatus,
        severity,
      });
      setFlaggedContent(data.flagged || data);
      setFlaggedTotalPages(data.totalPages || 1);
      setFlaggedTotalItems(data.total || data.length);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch flagged content');
    } finally {
      setLoading(false);
    }
  }, [flaggedPage, flaggedLimit, flaggedStatus, severity]);

  // Approve content
  const approveContent = useCallback(
    async (queueId: string, notes?: string) => {
      setLoading(true);
      setError(null);
      try {
        const result = await moderationService.approveContent(queueId, notes);
        await fetchModerationQueue(); // Refresh queue
        return result;
      } catch (err: any) {
        setError(err.message || 'Failed to approve content');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchModerationQueue]
  );

  // Reject content
  const rejectContent = useCallback(
    async (queueId: string, reason: string) => {
      setLoading(true);
      setError(null);
      try {
        const result = await moderationService.rejectContent(queueId, reason);
        await fetchModerationQueue(); // Refresh queue
        return result;
      } catch (err: any) {
        setError(err.message || 'Failed to reject content');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchModerationQueue]
  );

  // Request changes
  const requestChanges = useCallback(
    async (queueId: string, feedback: string) => {
      setLoading(true);
      setError(null);
      try {
        const result = await moderationService.requestChanges(queueId, feedback);
        await fetchModerationQueue(); // Refresh queue
        return result;
      } catch (err: any) {
        setError(err.message || 'Failed to request changes');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchModerationQueue]
  );

  // Flag content
  const flagContent = useCallback(
    async (params: {
      contentType: string;
      contentId: string;
      reason: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description?: string;
    }) => {
      setLoading(true);
      setError(null);
      try {
        const result = await moderationService.flagContent(params);
        await fetchFlaggedContent(); // Refresh flagged list
        return result;
      } catch (err: any) {
        setError(err.message || 'Failed to flag content');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchFlaggedContent]
  );

  // Resolve flagged content
  const resolveFlaggedContent = useCallback(
    async (flagId: string, action: string, notes?: string) => {
      setLoading(true);
      setError(null);
      try {
        const result = await moderationService.resolveFlaggedContent(flagId, action, notes);
        await fetchFlaggedContent(); // Refresh flagged list
        return result;
      } catch (err: any) {
        setError(err.message || 'Failed to resolve flagged content');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchFlaggedContent]
  );

  // Get moderation stats
  const getModerationStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await moderationService.getModerationStats();
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch moderation stats');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get moderation history
  const getModerationHistory = useCallback(
    async (params: { contentType?: string; contentId?: string; page?: number; limit?: number }) => {
      setLoading(true);
      setError(null);
      try {
        const data = await moderationService.getModerationHistory(params);
        return data;
      } catch (err: any) {
        setError(err.message || 'Failed to fetch moderation history');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Queue pagination
  const goToQueuePage = useCallback((newPage: number) => {
    setQueuePage(newPage);
  }, []);

  // Flagged pagination
  const goToFlaggedPage = useCallback((newPage: number) => {
    setFlaggedPage(newPage);
  }, []);

  // Filter handlers
  const setQueueStatusFilter = useCallback((status: 'pending' | 'approved' | 'rejected' | undefined) => {
    setQueueStatus(status);
    setQueuePage(1);
  }, []);

  const setFlaggedStatusFilter = useCallback((status: 'pending' | 'resolved' | undefined) => {
    setFlaggedStatus(status);
    setFlaggedPage(1);
  }, []);

  const setSeverityFilter = useCallback((newSeverity: 'low' | 'medium' | 'high' | 'critical' | undefined) => {
    setSeverity(newSeverity);
    setFlaggedPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setQueueStatus(undefined);
    setFlaggedStatus(undefined);
    setSeverity(undefined);
    setQueuePage(1);
    setFlaggedPage(1);
  }, []);

  // Refresh
  const refresh = useCallback(async () => {
    await Promise.all([fetchModerationQueue(), fetchFlaggedContent()]);
  }, [fetchModerationQueue, fetchFlaggedContent]);

  // Auto-fetch on mount and when filters change
  useEffect(() => {
    if (autoFetch) {
      fetchModerationQueue();
    }
  }, [autoFetch, queuePage, queueLimit, queueStatus]);

  useEffect(() => {
    if (autoFetch) {
      fetchFlaggedContent();
    }
  }, [autoFetch, flaggedPage, flaggedLimit, flaggedStatus, severity]);

  return {
    // Data
    moderationQueue,
    flaggedContent,
    loading,
    error,

    // Queue pagination
    queuePage,
    queueLimit,
    queueTotalPages,
    queueTotalItems,
    goToQueuePage,

    // Flagged pagination
    flaggedPage,
    flaggedLimit,
    flaggedTotalPages,
    flaggedTotalItems,
    goToFlaggedPage,

    // Filters
    queueStatus,
    flaggedStatus,
    severity,
    setQueueStatusFilter,
    setFlaggedStatusFilter,
    setSeverityFilter,
    clearFilters,

    // Moderation actions
    approveContent,
    rejectContent,
    requestChanges,
    flagContent,
    resolveFlaggedContent,

    // Queries
    getModerationStats,
    getModerationHistory,

    // Utilities
    refresh,
    fetchModerationQueue,
    fetchFlaggedContent,
  };
};
