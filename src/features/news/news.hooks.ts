import { useState, useCallback, useEffect } from 'react';
import { newsApi, NewsArticle } from './news.api';

export const useNews = () => {
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchNews = useCallback(async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);

            setError(null);
            const response = await newsApi.getLatestNews();

            if (response.success) {
                setNews(response.data);
            } else {
                throw new Error('Failed to fetch news');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred while fetching news');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchNews();
    }, [fetchNews]);

    const refresh = () => fetchNews(true);

    const getNewsById = useCallback((id: string) => {
        return news.find((item) => item._id === id);
    }, [news]);

    return {
        news,
        loading,
        refreshing,
        error,
        refresh,
        getNewsById,
    };
};
