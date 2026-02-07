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
    note?: string;
    noteAr?: string;
    noteEn?: string;
    createdAt: string;
    updatedAt: string;
}

interface DisclosuresResponse {
    success: boolean;
    count: number;
    data: Disclosure[];
}

export const fetchDisclosures = async (
    exchange?: 'DFM' | 'ADX',
    page?: number,
    limit?: number
): Promise<any> => {
    const params: Record<string, string | number> = {};
    if (exchange) params.exchange = exchange;
    if (page) params.page = page;
    if (limit) params.limit = limit;

    try {
        console.log('[DisclosuresApi] Fetching from /api/disclosures...', params);
        const response = await apiClient.get<any>('/api/disclosures', params, false);
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

export const updateDisclosureNote = async (
    id: string,
    notes: { note?: string; noteAr?: string; noteEn?: string }
): Promise<Disclosure> => {
    try {
        console.log(`[DisclosuresApi] Updating note for ${id}...`);
        const response = await apiClient.put<any>(`/api/disclosures/${id}`, notes);
        if (response && response.success && response.data) {
            return response.data;
        }
        throw new Error(response?.message || 'Failed to update disclosure note');
    } catch (error) {
        console.error('[Disclosures] Update note error:', error);
        throw error;
    }
};

// Disclosure Comment Types
export interface DisclosureComment {
    _id: string;
    disclosureId: string;
    content: string;
    author: {
        _id: string;
        name: string;
        avatar?: string;
    };
    createdAt: string;
    updatedAt: string;
}

interface CommentsResponse {
    success: boolean;
    data: {
        comments: DisclosureComment[];
        total: number;
        page: number;
        totalPages: number;
    };
}

// Fetch comments for a disclosure
export const fetchDisclosureComments = async (disclosureId: string): Promise<DisclosureComment[]> => {
    try {
        console.log(`[DisclosuresApi] Fetching comments for ${disclosureId}...`);
        const response = await apiClient.get<CommentsResponse>(`/api/disclosures/${disclosureId}/comments`, {}, false);

        // Handle direct array response (legacy/fallback)
        if (Array.isArray(response)) {
            return response;
        }

        // Handle standardized paginated response: { success: true, data: { comments: [...] } }
        if (response && response.data && Array.isArray(response.data.comments)) {
            return response.data.comments;
        }

        // Handle direct data array: { success: true, data: [...] }
        if (response && Array.isArray(response.data)) {
            return response.data;
        }

        return [];
    } catch (error) {
        console.error('[Disclosures] Fetch comments error:', error);
        return [];
    }
};

// Create a comment on a disclosure
export const createDisclosureComment = async (
    disclosureId: string,
    content: string
): Promise<DisclosureComment | null> => {
    try {
        console.log(`[DisclosuresApi] Creating comment for ${disclosureId}...`);
        const response = await apiClient.post<any>(`/api/disclosures/${disclosureId}/comments`, { content });

        if (response && response.success && response.data) {
            return response.data;
        }

        if (response && response._id) {
            return response;
        }

        throw new Error(response?.message || 'Failed to create comment');
    } catch (error) {
        console.error('[Disclosures] Create comment error:', error);
        throw error;
    }
};

// Delete a comment
export const deleteDisclosureComment = async (commentId: string): Promise<boolean> => {
    try {
        console.log(`[DisclosuresApi] Deleting comment ${commentId}...`);
        await apiClient.delete<any>(`/api/disclosure-comments/${commentId}`);
        return true;
    } catch (error) {
        console.error('[Disclosures] Delete comment error:', error);
        throw error;
    }
};
