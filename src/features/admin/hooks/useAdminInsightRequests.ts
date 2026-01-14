import { useState, useCallback, useEffect } from 'react';
import { insightRequestService, InsightRequest } from '../../../core/services/insights/insightRequest.service';

export const useAdminInsightRequests = () => {
    const [requests, setRequests] = useState<InsightRequest[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
    });
    const [filters, setFilters] = useState({
        status: '',
        page: 1,
        limit: 10,
    });

    const fetchRequests = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await insightRequestService.getRequests(filters);
            setRequests(data.requests);
            setPagination({
                currentPage: data.pagination.currentPage,
                totalPages: data.pagination.totalPages,
                totalCount: data.pagination.totalCount,
            });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch requests');
        } finally {
            setIsLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const moderateRequest = async (requestId: string, moderationData: any) => {
        setIsLoading(true);
        try {
            await insightRequestService.moderateRequest(requestId, moderationData);
            await fetchRequests();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to moderate request');
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const loadMore = () => {
        if (pagination.currentPage < pagination.totalPages) {
            setFilters(prev => ({ ...prev, page: prev.page + 1 }));
        }
    };

    const refresh = () => {
        setFilters(prev => ({ ...prev, page: 1 }));
    };

    return {
        requests,
        isLoading,
        error,
        pagination,
        filters,
        setFilters,
        moderateRequest,
        loadMore,
        refresh,
    };
};
