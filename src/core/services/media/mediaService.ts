/**
 * Media Service
 * handles image uploads and other media operations
 */

import { Platform } from 'react-native';
import { apiClient } from '../api/apiClient';

import { getApiBaseUrl } from '../../config/env';

interface UploadResponse {
    success: boolean;
    message: string;
    data: {
        url: string;
        filename: string;
        mimeType?: string;
        size: number;
    };
}

/**
 * Upload a single image
 * 
 * @param uri - Local image URI
 * @param name - Filename
 * @param type - Mime type
 */
export const uploadImage = async (
    uri: string,
    name: string = 'image.jpg',
    type: string = 'image/jpeg'
): Promise<string> => {
    const formData = new FormData();

    if (Platform.OS === 'web') {
        // Browser FormData requires a real File or Blob
        const response = await fetch(uri);
        const blob = await response.blob();
        formData.append('image', blob, name);
    } else {
        // React Native FormData expects a specific object for files
        const fileData = {
            uri,
            name,
            type,
        } as any;
        formData.append('image', fileData);
    }

    const response = await apiClient.post<UploadResponse>(
        '/api/media/upload',
        formData
    );

    if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to upload image');
    }

    const relativeUrl = response.data.url;
    const baseUrl = getApiBaseUrl();
    return relativeUrl.startsWith('http') ? relativeUrl : `${baseUrl}${relativeUrl}`;
};
