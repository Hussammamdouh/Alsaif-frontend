import { useState, useEffect } from 'react';
import { marketService, MarketTicker } from '../services/market/market.service';

export const useMarketData = (refreshInterval = 60000, skipInitialFetch = false) => {
    const [marketData, setMarketData] = useState<MarketTicker[]>([]);
    const [loading, setLoading] = useState(!skipInitialFetch);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = async () => {
        try {
            const response = await marketService.getAllMarketData();
            if (response.success) {
                setMarketData(response.data);
            }
        } catch (err: any) {
            console.error('Failed to fetch market data:', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!skipInitialFetch) {
            fetchData();
        }

        if (refreshInterval > 0) {
            const interval = setInterval(fetchData, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [refreshInterval, skipInitialFetch]);

    return { marketData, loading, error, refresh: fetchData };
};
