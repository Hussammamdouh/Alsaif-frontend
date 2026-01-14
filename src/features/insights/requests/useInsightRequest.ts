import { useState } from 'react';
import { insightRequestService, InsightRequestData } from '../../../core/services/insights/insightRequest.service';
import { useLocalization } from '../../../app/providers/LocalizationProvider';
import { Alert } from 'react-native';

export const useInsightRequest = (onSuccess?: () => void) => {
    const { t } = useLocalization();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submitRequest = async (data: InsightRequestData) => {
        setIsLoading(true);
        setError(null);
        try {
            await insightRequestService.submitRequest(data);
            Alert.alert(
                t('insights.requestSuccessTitle'),
                t('insights.requestSuccessMessage')
            );
            if (onSuccess) onSuccess();
        } catch (err: any) {
            const message = err.response?.data?.message || t('insights.requestFailed');
            setError(message);
            Alert.alert(t('common.error'), message);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        submitRequest,
        isLoading,
        error,
    };
};
