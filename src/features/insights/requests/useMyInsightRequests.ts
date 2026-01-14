import { useState, useCallback, useEffect } from 'react';
import { insightRequestService, InsightRequest } from '../../../core/services/insights/insightRequest.service';

export const useMyInsightRequests = () => {
    const [requests, setRequests] = useState<InsightRequest[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchMyRequests = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Reusing getRequests but the backend service might need a filter for current user
            // Actually the current getRequests endpoint might be admin-only.
            // I should check if I need a user-specific endpoint.
            const data = await insightRequestService.getUserRequests();
            setRequests(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch your requests');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMyRequests();
    }, [fetchMyRequests]);

    return {
        requests,
        isLoading,
        error,
        refresh: fetchMyRequests,
    };
};
