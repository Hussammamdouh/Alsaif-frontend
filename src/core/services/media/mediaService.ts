/**
 * Media Service
 * handles image uploads and other media operations
 */

import { apiClient } from '../api/apiClient';

interface UploadResponse {
    success: boolean;
    message: string;
    data: {
        imageUrl: string;
        filename: string;
        mimetype: string;
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

    // React Native FormData expects a specific object for files
    const fileData = {
        uri,
        name,
        type,
    } as any;

    formData.append('image', fileData);

    const response = await apiClient.post<UploadResponse>(
        '/api/media/upload',
        formData
    );

    if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to upload image');
    }

    return response.data.imageUrl;
};
