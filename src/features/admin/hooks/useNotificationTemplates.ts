/**
 * useNotificationTemplates Hook
 * Manages notification templates operations
 */

import { useState, useEffect, useCallback } from 'react';
import { notificationTemplatesService, NotificationTemplateData } from '../../../core/services/api/adminEnhancements.service';

interface UseNotificationTemplatesOptions {
  autoFetch?: boolean;
  initialPage?: number;
  initialLimit?: number;
}

export const useNotificationTemplates = (options: UseNotificationTemplatesOptions = {}) => {
  const { autoFetch = true, initialPage = 1, initialLimit = 20 } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Templates list
  const [templates, setTemplates] = useState<any[]>([]);
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Single template
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);

  // Filters
  const [channel, setChannel] = useState<'email' | 'push' | 'sms' | 'in_app' | undefined>();
  const [category, setCategory] = useState<string | undefined>();
  const [isActive, setIsActive] = useState<boolean | undefined>();

  // Fetch all templates
  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await notificationTemplatesService.getAllTemplates({
        page,
        limit,
        channel,
        category,
        isActive,
      });
      setTemplates(data.templates || data);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.total || data.length);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  }, [page, limit, channel, category, isActive]);

  // Fetch template by ID
  const fetchTemplateById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await notificationTemplatesService.getTemplateById(id);
      setSelectedTemplate(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch template');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create template
  const createTemplate = useCallback(
    async (data: NotificationTemplateData) => {
      setLoading(true);
      setError(null);
      try {
        const result = await notificationTemplatesService.createTemplate(data);
        await fetchTemplates(); // Refresh list
        return result;
      } catch (err: any) {
        setError(err.message || 'Failed to create template');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchTemplates]
  );

  // Update template
  const updateTemplate = useCallback(
    async (id: string, data: Partial<NotificationTemplateData>) => {
      setLoading(true);
      setError(null);
      try {
        const result = await notificationTemplatesService.updateTemplate(id, data);
        await fetchTemplates(); // Refresh list
        if (selectedTemplate?._id === id) {
          setSelectedTemplate(result);
        }
        return result;
      } catch (err: any) {
        setError(err.message || 'Failed to update template');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchTemplates, selectedTemplate]
  );

  // Delete template
  const deleteTemplate = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        await notificationTemplatesService.deleteTemplate(id);
        await fetchTemplates(); // Refresh list
        if (selectedTemplate?._id === id) {
          setSelectedTemplate(null);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to delete template');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchTemplates, selectedTemplate]
  );

  // Activate template
  const activateTemplate = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        const result = await notificationTemplatesService.activateTemplate(id);
        await fetchTemplates(); // Refresh list
        if (selectedTemplate?._id === id) {
          setSelectedTemplate(result);
        }
        return result;
      } catch (err: any) {
        setError(err.message || 'Failed to activate template');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchTemplates, selectedTemplate]
  );

  // Deactivate template
  const deactivateTemplate = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        const result = await notificationTemplatesService.deactivateTemplate(id);
        await fetchTemplates(); // Refresh list
        if (selectedTemplate?._id === id) {
          setSelectedTemplate(result);
        }
        return result;
      } catch (err: any) {
        setError(err.message || 'Failed to deactivate template');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchTemplates, selectedTemplate]
  );

  // Preview template
  const previewTemplate = useCallback(async (id: string, variables: Record<string, any>) => {
    setLoading(true);
    setError(null);
    try {
      const data = await notificationTemplatesService.previewTemplate(id, variables);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to preview template');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Send test notification
  const sendTestNotification = useCallback(
    async (id: string, recipient: string, variables?: Record<string, any>) => {
      setLoading(true);
      setError(null);
      try {
        const result = await notificationTemplatesService.sendTestNotification(id, recipient, variables);
        return result;
      } catch (err: any) {
        setError(err.message || 'Failed to send test notification');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Get template analytics
  const getTemplateAnalytics = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await notificationTemplatesService.getTemplateAnalytics(id);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch template analytics');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Duplicate template
  const duplicateTemplate = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        const result = await notificationTemplatesService.duplicateTemplate(id);
        await fetchTemplates(); // Refresh list
        return result;
      } catch (err: any) {
        setError(err.message || 'Failed to duplicate template');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchTemplates]
  );

  // Pagination handlers
  const goToPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const nextPage = useCallback(() => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  }, [page, totalPages]);

  const previousPage = useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  // Filter handlers
  const setChannelFilter = useCallback((newChannel: 'email' | 'push' | 'sms' | 'in_app' | undefined) => {
    setChannel(newChannel);
    setPage(1);
  }, []);

  const setCategoryFilter = useCallback((newCategory: string | undefined) => {
    setCategory(newCategory);
    setPage(1);
  }, []);

  const setActiveFilter = useCallback((active: boolean | undefined) => {
    setIsActive(active);
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setChannel(undefined);
    setCategory(undefined);
    setIsActive(undefined);
    setPage(1);
  }, []);

  // Refresh
  const refresh = useCallback(async () => {
    await fetchTemplates();
  }, [fetchTemplates]);

  // Auto-fetch on mount and when filters change
  useEffect(() => {
    if (autoFetch) {
      fetchTemplates();
    }
  }, [autoFetch, page, limit, channel, category, isActive]);

  return {
    // Data
    templates,
    selectedTemplate,
    loading,
    error,

    // Pagination
    page,
    limit,
    totalPages,
    totalItems,
    goToPage,
    nextPage,
    previousPage,

    // Filters
    channel,
    category,
    isActive,
    setChannelFilter,
    setCategoryFilter,
    setActiveFilter,
    clearFilters,

    // CRUD operations
    createTemplate,
    updateTemplate,
    deleteTemplate,
    activateTemplate,
    deactivateTemplate,
    duplicateTemplate,

    // Queries
    fetchTemplates,
    fetchTemplateById,
    previewTemplate,
    sendTestNotification,
    getTemplateAnalytics,

    // Utilities
    refresh,
    setSelectedTemplate,
  };
};
