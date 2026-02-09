import { useState, useEffect } from 'react';
import { marketService, MarketTicker } from '../services/market/market.service';

export const useMarketData = (refreshInterval = 60000) => {
    const [marketData, setMarketData] = useState<MarketTicker[]>([]);
    const [loading, setLoading] = useState(true);
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
        fetchData();
        if (refreshInterval > 0) {
            const interval = setInterval(fetchData, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [refreshInterval]);

    return { marketData, loading, error, refresh: fetchData };
};
