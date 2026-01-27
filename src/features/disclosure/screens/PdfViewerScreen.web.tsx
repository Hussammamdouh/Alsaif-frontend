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
import { useLocalization } from '../../../app/providers/LocalizationProvider';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '../../../core/theme/spacing';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type PdfViewerRouteProp = RouteProp<MainStackParamList, 'PdfViewer'>;

export const PdfViewerScreen: React.FC = () => {
    const { theme, isDark } = useTheme();
    const { language } = useLocalization();
    const route = useRoute<PdfViewerRouteProp>();
    const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const { url, title } = route.params;

    // Check if the URL is on a different origin (needs proxy) or local/same-origin (direct)
    const isRemote = typeof url === 'string' && url.startsWith('http') && !url.includes(window.location.host);
    const isLocal = !isRemote;

    // Use Google Docs viewer to proxy the PDF (bypasses X-Frame-Options) for remote URLs
    // Local assets can be rendered directly by modern browsers in an iframe
    const viewerUrl = isLocal
        ? url
        : `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`;

    const handleShare = async () => {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            try {
                await navigator.clipboard.writeText(url);
                alert(language === 'ar' ? 'تم نسخ الرابط' : 'Link copied');
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
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 12), backgroundColor: theme.background.secondary }]}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={[styles.headerButton, { backgroundColor: theme.background.tertiary }]}
                >
                    <Ionicons name="chevron-back" size={24} color={theme.text.primary} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={[styles.headerTitle, { color: theme.text.primary }]} numberOfLines={1}>
                        {title}
                    </Text>
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity
                        onPress={handleDownload}
                        style={[styles.headerButton, { backgroundColor: theme.background.tertiary }]}
                    >
                        <Ionicons name="download-outline" size={22} color={theme.primary.main} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleShare}
                        style={[styles.headerButton, { backgroundColor: theme.background.tertiary }]}
                    >
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
                            {language === 'ar' ? 'جاري تحميل المستند...' : 'Loading document...'}
                        </Text>
                    </View>
                )}

                {error ? (
                    <View style={styles.errorContainer}>
                        <Ionicons name="alert-circle-outline" size={48} color={theme.error?.main || '#f44336'} />
                        <Text style={[styles.errorText, { color: theme.text.secondary }]}>
                            {language === 'ar' ? 'تعذر تحميل المستند' : 'Could not load document'}
                        </Text>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: theme.primary.main }]}
                            onPress={handleOpenExternal}
                        >
                            <Ionicons name="open-outline" size={20} color="#fff" />
                            <Text style={styles.actionButtonText}>
                                {language === 'ar' ? 'فتح في نافذة جديدة' : 'Open in new window'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        {/* Viewer iframe */}
                        <iframe
                            src={viewerUrl}
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
                                <Text style={styles.bottomButtonText}>
                                    {language === 'ar' ? 'فتح في نافذة جديدة' : 'Open in new window'}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.bottomButton, { backgroundColor: theme.background.tertiary }]}
                                onPress={handleDownload}
                            >
                                <Ionicons name="download-outline" size={18} color={theme.text.primary} />
                                <Text style={[styles.bottomButtonText, { color: theme.text.primary }]}>
                                    {language === 'ar' ? 'تحميل' : 'Download'}
                                </Text>
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
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    headerButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerCenter: {
        flex: 1,
        marginHorizontal: 16,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '700',
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
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
