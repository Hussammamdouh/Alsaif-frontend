import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Linking,
    useWindowDimensions,
    Platform,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../../app/navigation/types';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { useLocalization } from '../../../app/providers/LocalizationProvider';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '../../../core/theme/spacing';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ResponsiveContainer } from '../../../shared/components/ResponsiveContainer';

type PdfViewerRouteProp = RouteProp<MainStackParamList, 'PdfViewer'>;

export const PdfViewerScreen: React.FC = () => {
    const { theme, isDark } = useTheme();
    const { language } = useLocalization();
    const route = useRoute<PdfViewerRouteProp>();
    const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const isDesktop = width > 1024;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const { url, title } = route.params;

    // Detect if the URL is on the same origin as the app
    const isSameOrigin = typeof url === 'string' && (
        url.startsWith('/') ||
        url.includes(window.location.host)
    );

    // Detect if the URL is a local address (localhost, 127.0.0.1, or local network IPs)
    // Google Docs Viewer cannot fetch these, so we must use a direct iframe.
    const isLocalAddress = typeof url === 'string' && (
        url.includes('localhost') ||
        url.includes('127.0.0.1') ||
        url.includes('192.168.') ||
        url.includes('10.0.') ||
        url.includes('0.0.0.0')
    );

    // Initial viewer mode: 
    // - Use 'direct' for local addresses or same-origin (safe and bypasses Google issues)
    // - Use 'google' for truly remote URLs (helps bypass X-Frame-Options on other sites)
    const initialIsRemote = typeof url === 'string' &&
        url.startsWith('http') &&
        !isSameOrigin &&
        !isLocalAddress;

    const [viewerMode, setViewerMode] = useState<'google' | 'direct'>(initialIsRemote ? 'google' : 'direct');

    // Use Google Docs viewer to proxy the PDF (bypasses X-Frame-Options) for remote URLs
    const viewerUrl = viewerMode === 'google'
        ? `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`
        : url;

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
        window.open(url, '_blank');
    };

    const handleDownload = () => {
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

    const toggleViewerMode = () => {
        setLoading(true);
        setError(false);
        setViewerMode(prev => prev === 'google' ? 'direct' : 'google');
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
            {/* Ambient background decoration for web-feel */}
            {isDesktop && (
                <View style={StyleSheet.absoluteFill}>
                    <View style={[styles.glowCircle, {
                        top: -100,
                        right: -100,
                        backgroundColor: theme.primary.main + '10'
                    }]} />
                    <View style={[styles.glowCircle, {
                        bottom: -100,
                        left: -100,
                        backgroundColor: theme.primary.main + '05'
                    }]} />
                </View>
            )}

            {/* Custom Header */}
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 12), backgroundColor: theme.background.secondary }]}>
                <ResponsiveContainer maxWidth={1200}>
                    <View style={styles.headerInner}>
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
                        <div style={{ display: 'flex', flexDirection: 'row', gap: 8 }}>
                            {(initialIsRemote || isLocalAddress) && (
                                <TouchableOpacity
                                    onPress={toggleViewerMode}
                                    style={[styles.headerButton, { backgroundColor: theme.background.tertiary }]}
                                >
                                    <Ionicons
                                        name={viewerMode === 'google' ? "browsers-outline" : "shield-checkmark-outline"}
                                        size={22}
                                        color={theme.primary.main}
                                    />
                                </TouchableOpacity>
                            )}
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
                        </div>
                    </View>
                </ResponsiveContainer>
            </View>

            {/* PDF Viewer */}
            <View style={styles.pdfContainer}>
                <ResponsiveContainer maxWidth={1100} style={{ flex: 1 }}>
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
                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <TouchableOpacity
                                    style={[styles.actionButton, { backgroundColor: theme.primary.main }]}
                                    onPress={toggleViewerMode}
                                >
                                    <Ionicons name="refresh-outline" size={20} color="#fff" />
                                    <Text style={styles.actionButtonText}>
                                        {viewerMode === 'google'
                                            ? (language === 'ar' ? 'جرب العارض المباشر' : 'Try Direct Viewer')
                                            : (language === 'ar' ? 'جرب عارض جوجل' : 'Try Google Viewer')}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.actionButton, { backgroundColor: theme.background.tertiary }]}
                                    onPress={handleOpenExternal}
                                >
                                    <Ionicons name="open-outline" size={20} color={theme.text.primary} />
                                    <Text style={[styles.actionButtonText, { color: theme.text.primary }]}>
                                        {language === 'ar' ? 'فتح خارجي' : 'Open External'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.viewerWrapper}>
                            {/* Viewer iframe */}
                            <iframe
                                src={viewerUrl}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    border: 'none',
                                    borderRadius: isDesktop ? 16 : 0,
                                    backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
                                    boxShadow: isDesktop ? '0 10px 30px rgba(0,0,0,0.1)' : 'none',
                                }}
                                onLoad={handleIframeLoad}
                                onError={() => setError(true)}
                                title={title}
                                allow="fullscreen"
                            />

                            {/* Quick action bar at bottom */}
                            <View style={[styles.bottomBar, {
                                backgroundColor: theme.background.secondary,
                                borderBottomLeftRadius: isDesktop ? 16 : 0,
                                borderBottomRightRadius: isDesktop ? 16 : 0
                            }]}>
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
                        </View>
                    )}
                </ResponsiveContainer>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    headerInner: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingBottom: 16,
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
    glowCircle: {
        position: 'absolute',
        width: 600,
        height: 600,
        borderRadius: 300,
        filter: 'blur(100px)',
        opacity: 0.8,
    },
    viewerWrapper: {
        flex: 1,
        marginTop: 16,
        marginBottom: 20,
    },
});

export default PdfViewerScreen;
