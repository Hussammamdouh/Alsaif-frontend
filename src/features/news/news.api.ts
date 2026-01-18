import apiClient from '../../core/services/api/apiClient';

export interface NewsArticle {
    _id: string;
    title: string;
    content: string;
    imageUrl?: string;
    sourceUrl: string;
    publishedAt: string;
    createdAt: string;
    updatedAt: string;
}

export interface NewsResponse {
    success: boolean;
    count: number;
    data: NewsArticle[];
}

export const newsApi = {
    /**
     * Fetch latest news from Argaam
     */
    getLatestNews: async (): Promise<NewsResponse> => {
        return await apiClient.get<NewsResponse>('/api/news');
    },
};
