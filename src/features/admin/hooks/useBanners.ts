import { useState, useCallback, useEffect } from 'react';
import { bannerService, Banner } from '../../../core/services/api/adminEnhancements.service';

export const useBanners = () => {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchBanners = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await bannerService.getAll();
            setBanners(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch banners');
            console.error('Fetch banners error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const createBanner = async (data: Partial<Banner>) => {
        setLoading(true);
        try {
            const newBanner = await bannerService.create(data);
            setBanners((prev) => [newBanner, ...prev]);
            return newBanner;
        } catch (err: any) {
            setError(err.message || 'Failed to create banner');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateBanner = async (id: string, data: Partial<Banner>) => {
        setLoading(true);
        try {
            const updatedBanner = await bannerService.update(id, data);
            setBanners((prev) =>
                prev.map((banner) => (banner._id === id ? updatedBanner : banner))
            );
            return updatedBanner;
        } catch (err: any) {
            setError(err.message || 'Failed to update banner');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteBanner = async (id: string) => {
        setLoading(true);
        try {
            await bannerService.delete(id);
            setBanners((prev) => prev.filter((banner) => banner._id !== id));
        } catch (err: any) {
            setError(err.message || 'Failed to delete banner');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, [fetchBanners]);

    return {
        banners,
        loading,
        error,
        refresh: fetchBanners,
        createBanner,
        updateBanner,
        deleteBanner,
    };
};
