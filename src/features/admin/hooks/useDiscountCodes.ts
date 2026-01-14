/**
 * useDiscountCodes Hook
 * Manages discount codes operations
 */

import { useState, useEffect, useCallback } from 'react';
import { discountCodesService, DiscountCodeData } from '../../../core/services/api/adminEnhancements.service';

interface UseDiscountCodesOptions {
  autoFetch?: boolean;
  initialPage?: number;
  initialLimit?: number;
}

export const useDiscountCodes = (options: UseDiscountCodesOptions = {}) => {
  const { autoFetch = true, initialPage = 1, initialLimit = 20 } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Codes list
  const [codes, setCodes] = useState<any[]>([]);
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Single code
  const [selectedCode, setSelectedCode] = useState<any | null>(null);

  // Filters
  const [isActive, setIsActive] = useState<boolean | undefined>();
  const [type, setType] = useState<'percentage' | 'fixed_amount' | 'free_trial' | undefined>();

  // Fetch all codes
  const fetchCodes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await discountCodesService.getAllCodes({
        page,
        limit,
        isActive,
        type,
      });
      setCodes(data.codes || data);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.total || data.length);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch discount codes');
    } finally {
      setLoading(false);
    }
  }, [page, limit, isActive, type]);

  // Fetch code by ID
  const fetchCodeById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await discountCodesService.getCodeById(id);
      setSelectedCode(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch discount code');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Validate code
  const validateCode = useCallback(async (code: string, userId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await discountCodesService.validateCode(code, userId);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to validate code');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create code
  const createCode = useCallback(
    async (data: DiscountCodeData) => {
      setLoading(true);
      setError(null);
      try {
        const result = await discountCodesService.createCode(data);
        await fetchCodes(); // Refresh list
        return result;
      } catch (err: any) {
        setError(err.message || 'Failed to create discount code');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchCodes]
  );

  // Update code
  const updateCode = useCallback(
    async (id: string, data: Partial<DiscountCodeData>) => {
      setLoading(true);
      setError(null);
      try {
        const result = await discountCodesService.updateCode(id, data);
        await fetchCodes(); // Refresh list
        if (selectedCode?._id === id) {
          setSelectedCode(result);
        }
        return result;
      } catch (err: any) {
        setError(err.message || 'Failed to update discount code');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchCodes, selectedCode]
  );

  // Delete code
  const deleteCode = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        await discountCodesService.deleteCode(id);
        await fetchCodes(); // Refresh list
        if (selectedCode?._id === id) {
          setSelectedCode(null);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to delete discount code');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchCodes, selectedCode]
  );

  // Activate code
  const activateCode = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        const result = await discountCodesService.activateCode(id);
        await fetchCodes(); // Refresh list
        if (selectedCode?._id === id) {
          setSelectedCode(result);
        }
        return result;
      } catch (err: any) {
        setError(err.message || 'Failed to activate code');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchCodes, selectedCode]
  );

  // Deactivate code
  const deactivateCode = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        const result = await discountCodesService.deactivateCode(id);
        await fetchCodes(); // Refresh list
        if (selectedCode?._id === id) {
          setSelectedCode(result);
        }
        return result;
      } catch (err: any) {
        setError(err.message || 'Failed to deactivate code');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchCodes, selectedCode]
  );

  // Get code usage
  const getCodeUsage = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await discountCodesService.getCodeUsage(id);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch code usage');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get code analytics
  const getCodeAnalytics = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await discountCodesService.getCodeAnalytics(id);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch code analytics');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

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
  const setActiveFilter = useCallback((active: boolean | undefined) => {
    setIsActive(active);
    setPage(1);
  }, []);

  const setTypeFilter = useCallback((newType: 'percentage' | 'fixed_amount' | 'free_trial' | undefined) => {
    setType(newType);
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setIsActive(undefined);
    setType(undefined);
    setPage(1);
  }, []);

  // Refresh
  const refresh = useCallback(async () => {
    await fetchCodes();
  }, [fetchCodes]);

  // Auto-fetch on mount and when filters change
  useEffect(() => {
    if (autoFetch) {
      fetchCodes();
    }
  }, [autoFetch, page, limit, isActive, type]);

  return {
    // Data
    codes,
    selectedCode,
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
    isActive,
    type,
    setActiveFilter,
    setTypeFilter,
    clearFilters,

    // CRUD operations
    createCode,
    updateCode,
    deleteCode,
    activateCode,
    deactivateCode,

    // Queries
    fetchCodes,
    fetchCodeById,
    validateCode,
    getCodeUsage,
    getCodeAnalytics,

    // Utilities
    refresh,
    setSelectedCode,
  };
};
