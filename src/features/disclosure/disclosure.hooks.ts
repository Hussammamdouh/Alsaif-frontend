import { useState, useEffect, useCallback } from 'react';
import { fetchDisclosures, Disclosure } from './disclosure.api';

export type ExchangeFilter = 'ALL' | 'DFM' | 'ADX';

export const useDisclosures = () => {
    const [disclosures, setDisclosures] = useState<Disclosure[]>([]);
    const [filteredDisclosures, setFilteredDisclosures] = useState<Disclosure[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<ExchangeFilter>('ALL');

    const loadDisclosures = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);

            const data = await fetchDisclosures();
            setDisclosures(data);
            setError(null);
        } catch (e: any) {
            setError(e.message || 'Failed to fetch disclosures');
        } finally {
            console.log('[useDisclosures] Loading complete');
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadDisclosures();
    }, [loadDisclosures]);

    useEffect(() => {
        if (filter === 'ALL') {
            setFilteredDisclosures(disclosures);
        } else {
            setFilteredDisclosures(disclosures.filter(d => d.exchange === filter));
        }
    }, [filter, disclosures]);

    const refresh = useCallback(() => loadDisclosures(true), [loadDisclosures]);

    return {
        disclosures: filteredDisclosures,
        loading,
        refreshing,
        error,
        refresh,
        filter,
        setFilter,
    };
};
