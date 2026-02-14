import * as XLSX from 'xlsx';
import { Platform } from 'react-native';

/**
 * Export data to Excel file
 * @param data Array of objects to export
 * @param fileName Name of the file (without extension)
 */
export const exportToExcel = (data: any[], fileName: string) => {
    if (!data || data.length === 0) {
        console.warn('No data to export');
        return;
    }

    try {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

        if (Platform.OS === 'web') {
            XLSX.writeFile(wb, `${fileName}.xlsx`);
        } else {
            // For mobile, this would require expo-file-system and expo-sharing
            // Since the request is for "desktop view polish", we focus on web
            console.warn('Excel export is primarily supported on Web version of the Admin Dashboard');

            // Attempting a basic write might work in some environments, but usually requires more setup on mobile
            try {
                XLSX.writeFile(wb, `${fileName}.xlsx`);
            } catch (err) {
                console.error('Mobile export failed:', err);
            }
        }
    } catch (error) {
        console.error('Export to Excel failed:', error);
    }
};
