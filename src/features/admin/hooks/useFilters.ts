/**
 * useFilters Hook
 * Manages advanced filtering and saved presets
 */

import { useState, useEffect, useCallback } from 'react';
import { filtersService } from '../../../core/services/api/adminEnhancements.service';

interface UseFiltersOptions {
  resourceType: 'users' | 'insights' | 'subscriptions';
  autoFetch?: boolean;
}

export const useFilters = (options: UseFiltersOptions) => {
  const { resourceType, autoFetch = true } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter results
  const [results, setResults] = useState<any[]>([]);
  const [totalResults, setTotalResults] = useState(0);

  // Saved presets
  const [presets, setPresets] = useState<any[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<any | null>(null);

  // Current filter parameters
  const [filters, setFilters] = useState<Record<string, any>>({});

  // Apply filters
  const applyFilters = useCallback(
    async (filterParams: Record<string, any>) => {
      setLoading(true);
      setError(null);
      try {
        const data = await filtersService.applyFilters(resourceType, filterParams);
        setResults(data.results || data);
        setTotalResults(data.total || data.length);
        setFilters(filterParams);
      } catch (err: any) {
        setError(err.message || 'Failed to apply filters');
      } finally {
        setLoading(false);
      }
    },
    [resourceType]
  );

  // Fetch saved presets
  const fetchPresets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await filtersService.getSavedPresets(resourceType);
      setPresets(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch presets');
    } finally {
      setLoading(false);
    }
  }, [resourceType]);

  // Create preset
  const createPreset = useCallback(
    async (name: string, description?: string, filterParams?: Record<string, any>) => {
      setLoading(true);
      setError(null);
      try {
        const result = await filtersService.createPreset({
          name,
          resourceType,
          filters: filterParams || filters,
          description,
        });
        await fetchPresets(); // Refresh presets
        return result;
      } catch (err: any) {
        setError(err.message || 'Failed to create preset');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [resourceType, filters, fetchPresets]
  );

  // Update preset
  const updatePreset = useCallback(
    async (id: string, data: { name?: string; description?: string; filters?: Record<string, any> }) => {
      setLoading(true);
      setError(null);
      try {
        const result = await filtersService.updatePreset(id, data);
        await fetchPresets(); // Refresh presets
        if (selectedPreset?._id === id) {
          setSelectedPreset(result);
        }
        return result;
      } catch (err: any) {
        setError(err.message || 'Failed to update preset');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchPresets, selectedPreset]
  );

  // Delete preset
  const deletePreset = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        await filtersService.deletePreset(id);
        await fetchPresets(); // Refresh presets
        if (selectedPreset?._id === id) {
          setSelectedPreset(null);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to delete preset');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchPresets, selectedPreset]
  );

  // Apply preset
  const applyPreset = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        const data = await filtersService.applyPreset(id);
        setResults(data.results || data);
        setTotalResults(data.total || data.length);

        // Find and set the selected preset
        const preset = presets.find((p) => p._id === id);
        if (preset) {
          setSelectedPreset(preset);
          setFilters(preset.filters);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to apply preset');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [presets]
  );

  // Get preset by ID
  const getPresetById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await filtersService.getPresetById(id);
      setSelectedPreset(data);
      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch preset');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Export filtered results
  const exportResults = useCallback(
    async (format: 'csv' | 'json' | 'xlsx' = 'csv') => {
      setLoading(true);
      setError(null);
      try {
        const data = await filtersService.exportFilteredData(resourceType, filters, format);
        return data;
      } catch (err: any) {
        setError(err.message || 'Failed to export results');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [resourceType, filters]
  );

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({});
    setResults([]);
    setTotalResults(0);
    setSelectedPreset(null);
  }, []);

  // Update single filter
  const updateFilter = useCallback((key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Remove single filter
  const removeFilter = useCallback((key: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  // Refresh
  const refresh = useCallback(async () => {
    if (Object.keys(filters).length > 0) {
      await applyFilters(filters);
    }
    await fetchPresets();
  }, [filters, applyFilters, fetchPresets]);

  // Auto-fetch presets on mount
  useEffect(() => {
    if (autoFetch) {
      fetchPresets();
    }
  }, [autoFetch, resourceType]);

  return {
    // Data
    results,
    totalResults,
    presets,
    selectedPreset,
    filters,
    loading,
    error,

    // Filter operations
    applyFilters,
    clearFilters,
    updateFilter,
    removeFilter,

    // Preset operations
    createPreset,
    updatePreset,
    deletePreset,
    applyPreset,
    getPresetById,
    fetchPresets,

    // Export
    exportResults,

    // Utilities
    refresh,
    setSelectedPreset,
  };
};
