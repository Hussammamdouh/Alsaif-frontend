/**
 * Market Data Service
 * Fetch real-time market data from DFM and ADX
 */

import { apiClient } from '../api/apiClient';
import { saveMarketDataToCache, getMarketDataFromCache } from '../../../shared/services/offlineCache';

// Types
export interface MarketTicker {
    symbol: string;
    exchange: 'DFM' | 'ADX';
    price: number;
    change: number;
    changePercent: number;
    high: number;
    low: number;
    open: number;
    prevClose: number;
    volume: number;
    currency: string;
    shortName: string;
    lastUpdated: string;
    isLive?: boolean;
    chartData?: {
        timestamp: string | Date;
        price: number;
    }[];
}

export interface MarketResponse {
    success: boolean;
    data: MarketTicker[];
    count: number;
    timestamp: string;
}

export const marketService = {
    /**
     * Get ALL Market Data (DFM + ADX)
     * Optimized for startup
     */
    getAllMarketData: async (): Promise<MarketResponse> => {
        try {
            const response = await apiClient.get<MarketResponse>('/api/market/all', undefined, false);
            if (response && response.success && response.data) {
                saveMarketDataToCache(response.data);
            }
            return response;
        } catch (error) {
            console.warn('[MarketService] Failed to fetch market data, loading from cache fallback:', error);
            const cached = await getMarketDataFromCache();
            if (cached.data && cached.data.length > 0) {
                return {
                    success: true,
                    data: cached.data,
                    count: cached.data.length,
                    timestamp: cached.timestamp ? new Date(cached.timestamp).toISOString() : new Date().toISOString(),
                };
            }
            throw error;
        }
    },

    /**
     * Get specific exchange data
     */
    getExchangeData: async (exchange: 'DFM' | 'ADX'): Promise<MarketResponse> => {
        return apiClient.get<MarketResponse>(`/api/market/${exchange.toLowerCase()}`, undefined, false);
    },

    /**
     * Get specific symbol details
     */
    getSymbolDetails: async (symbol: string, exchange: 'DFM' | 'ADX'): Promise<{ success: boolean; data: MarketTicker }> => {
        return apiClient.get<{ success: boolean; data: MarketTicker }>(`/api/market/${exchange}/${symbol}`, undefined, false);
    }
};
