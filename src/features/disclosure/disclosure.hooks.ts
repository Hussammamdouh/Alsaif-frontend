import { useState, useEffect, useCallback } from 'react';
import { fetchDisclosures, Disclosure } from './disclosure.api';

export type ExchangeFilter = 'ALL' | 'DFM' | 'ADX';

export const useDisclosures = (limit: number = 5, initialExchange?: ExchangeFilter) => {
    const [disclosures, setDisclosures] = useState<Disclosure[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<ExchangeFilter>(initialExchange || 'ALL');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalItems, setTotalItems] = useState(0);

    const loadDisclosures = useCallback(async (isRefresh = false, pageNum = 1) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
                setPage(1);
            } else {
                setLoading(true);
            }

            const response = await fetchDisclosures(filter === 'ALL' ? undefined : filter, pageNum, limit);

            let fetchedData: Disclosure[] = [];
            if (Array.isArray(response)) {
                fetchedData = response;
                setHasMore(false); // No total info in array response
            } else if (response && response.data) {
                fetchedData = response.data;
                const total = response.total || response.count || 0;
                setTotalItems(total);
                setHasMore(fetchedData.length > 0 && (pageNum * limit) < total);
            }

            if (isRefresh || pageNum === 1) {
                setDisclosures(fetchedData);
            } else {
                setDisclosures(prev => [...prev, ...fetchedData]);
            }

            setPage(pageNum);
            setError(null);
        } catch (e: any) {
            setError(e.message || 'Failed to fetch disclosures');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [filter, limit]);

    useEffect(() => {
        loadDisclosures(true);
    }, [filter, loadDisclosures]);

    const refresh = useCallback(() => loadDisclosures(true), [loadDisclosures]);

    const loadMore = useCallback(() => {
        if (!loading && hasMore) {
            loadDisclosures(false, page + 1);
        }
    }, [loading, hasMore, page, loadDisclosures]);

    return {
        disclosures,
        loading,
        refreshing,
        error,
        refresh,
        loadMore,
        hasMore,
        filter,
        setFilter,
    };
};
