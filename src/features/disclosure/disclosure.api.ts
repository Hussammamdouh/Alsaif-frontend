import { apiClient } from '../../core/services/api/apiClient';

export interface Disclosure {
    _id: string;
    title: string;
    titleAr?: string;
    titleEn?: string;
    url: string;
    pdfUrls: string[]; // Array of PDF URLs (some disclosures have multiple PDFs)
    date: string;
    exchange: 'DFM' | 'ADX';
    symbol?: string;
    companyName?: string;
    companyNameAr?: string;
    companyNameEn?: string;
    createdAt: string;
    updatedAt: string;
}

interface DisclosuresResponse {
    success: boolean;
    count: number;
    data: Disclosure[];
}

export const fetchDisclosures = async (exchange?: 'DFM' | 'ADX'): Promise<Disclosure[]> => {
    const params: Record<string, string> = {};
    if (exchange) {
        params.exchange = exchange;
    }

    try {
        console.log('[DisclosuresApi] Fetching from /api/disclosures...', params);
        const response = await apiClient.get<DisclosuresResponse>('/api/disclosures', params, false);
        console.log('[DisclosuresApi] Received response:', !!response);

        // Handle different response structures
        // Case 1: response is the full API response { success, count, data }
        // Case 2: response is already the data array
        if (Array.isArray(response)) {
            console.log('[DisclosuresApi] Response is array, length:', response.length);
            return response;
        }

        if (response && response.data) {
            console.log('[DisclosuresApi] Found data array, length:', response.data.length);
            return response.data;
        }

        // If success is false or no data
        console.warn('[Disclosures] Unexpected response structure:', response);
        return [];
    } catch (error) {
        console.error('[Disclosures] Fetch error:', error);
        throw error;
    }
};
