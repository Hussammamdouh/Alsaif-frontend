import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Linking,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../../app/navigation/types';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '../../../core/theme/spacing';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type PdfViewerRouteProp = RouteProp<MainStackParamList, 'PdfViewer'>;

export const PdfViewerScreen: React.FC = () => {
    const { theme, isDark } = useTheme();
    const route = useRoute<PdfViewerRouteProp>();
    const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const { url, title } = route.params;

    // Use Google Docs viewer to proxy the PDF (bypasses X-Frame-Options)
    const googleDocsUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`;

    const handleShare = async () => {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            try {
                await navigator.clipboard.writeText(url);
                alert('تم نسخ الرابط');
            } catch (e) {
                console.error('Copy failed:', e);
            }
        }
    };

    const handleOpenExternal = () => {
        // Open the original PDF URL in a new tab
        window.open(url, '_blank');
    };

    const handleDownload = () => {
        // Trigger download
        const link = document.createElement('a');
        link.href = url;
        link.download = `${title}.pdf`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleIframeLoad = () => {
        setLoading(false);
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
            {/* Custom Header */}
            <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.text.primary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text.primary }]} numberOfLines={1}>
                    {title}
                </Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={handleDownload} style={styles.headerButton}>
                        <Ionicons name="download-outline" size={22} color={theme.text.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleOpenExternal} style={styles.headerButton}>
                        <Ionicons name="open-outline" size={22} color={theme.text.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
                        <Ionicons name="copy-outline" size={22} color={theme.text.primary} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* PDF Viewer using Google Docs as proxy */}
            <View style={styles.pdfContainer}>
                {loading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color={theme.primary.main} />
                        <Text style={[styles.loadingText, { color: theme.text.secondary }]}>
                            جاري تحميل المستند...
                        </Text>
                    </View>
                )}

                {error ? (
                    <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle-outline" size={48} color={theme.error?.main || '#f44336'} />
                        <Text style={[styles.errorText, { color: theme.text.secondary }]}>
                            تعذر تحميل المستند
                        </Text>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: theme.primary.main }]}
                            onPress={handleOpenExternal}
                        >
                            <Ionicons name="open-outline" size={20} color="#fff" />
                            <Text style={styles.actionButtonText}>فتح في نافذة جديدة</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        {/* Google Docs viewer iframe */}
                        <iframe
                            src={googleDocsUrl}
                            style={{
                                width: '100%',
                                height: '100%',
                                border: 'none',
                                backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
                            }}
                            onLoad={handleIframeLoad}
                            onError={() => setError(true)}
                            title={title}
                            allow="fullscreen"
                        />

                        {/* Quick action bar at bottom */}
                        <View style={[styles.bottomBar, { backgroundColor: theme.background.secondary }]}>
                            <TouchableOpacity
                                style={[styles.bottomButton, { backgroundColor: theme.primary.main }]}
                                onPress={handleOpenExternal}
                            >
                                <Ionicons name="open-outline" size={18} color="#fff" />
                                <Text style={styles.bottomButtonText}>فتح في نافذة جديدة</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.bottomButton, { backgroundColor: theme.background.tertiary }]}
                                onPress={handleDownload}
                            >
                                <Ionicons name="download-outline" size={18} color={theme.text.primary} />
                                <Text style={[styles.bottomButtonText, { color: theme.text.primary }]}>تحميل</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    headerButton: {
        padding: spacing.xs,
    },
    headerTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        marginHorizontal: spacing.sm,
    },
    headerActions: {
        flexDirection: 'row',
        gap: spacing.xs,
    },
    pdfContainer: {
        flex: 1,
        position: 'relative',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        zIndex: 10,
    },
    loadingText: {
        marginTop: spacing.md,
        fontSize: 14,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    errorText: {
        marginTop: spacing.md,
        fontSize: 16,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
    },
    actionButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    bottomBar: {
        flexDirection: 'row',
        padding: spacing.sm,
        gap: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    bottomButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 8,
        gap: 6,
    },
    bottomButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 13,
    },
});

export default PdfViewerScreen;
