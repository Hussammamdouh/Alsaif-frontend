import apiClient from '../api/apiClient';

export interface InsightRequestData {
    title: string;
    details: string;
}

export interface InsightRequest {
    id: string;
    title: string;
    details: string;
    status: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
    createdAt: string;
}

const INSIGHT_REQUESTS_URL = '/api/insight-requests';
const ADMIN_INSIGHT_REQUESTS_URL = '/api/admin/insight-requests';

/**
 * Insight Request Service
 */
export const insightRequestService = {
    /**
     * Submit a new insight request
     */
    submitRequest: async (data: InsightRequestData): Promise<InsightRequest> => {
        const response = await apiClient.post<any>(INSIGHT_REQUESTS_URL, data);
        return response.data.request;
    },

    /**
     * Get all requests (Admin)
     */
    getRequests: async (params: { page?: number; limit?: number; status?: string } = {}) => {
        const response = await apiClient.get<any>(ADMIN_INSIGHT_REQUESTS_URL, { params });
        return response.data;
    },

    /**
     * Moderate a request (Admin)
     */
    moderateRequest: async (requestId: string, moderationData: {
        status: 'approved' | 'rejected';
        rejectionReason?: string;
        targetType?: 'free_insight' | 'premium_insight' | 'free_chat' | 'premium_chat';
    }) => {
        const response = await apiClient.post<any>(`${ADMIN_INSIGHT_REQUESTS_URL}/${requestId}/moderate`, moderationData);
        return response.data;
    },

    /**
     * Get user's own requests
     */
    getUserRequests: async (): Promise<InsightRequest[]> => {
        const response = await apiClient.get<any>(`${INSIGHT_REQUESTS_URL}/my`);
        return response.data.requests;
    },

    /**
     * Ban/Unban user (Admin)
     */
    toggleInsightBan: async (userId: string) => {
        const response = await apiClient.post<any>(`${ADMIN_INSIGHT_REQUESTS_URL}/ban/${userId}`);
        return response.data;
    }
};
