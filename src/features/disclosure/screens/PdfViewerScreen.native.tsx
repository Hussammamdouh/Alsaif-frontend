import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Share,
    Linking,
    Dimensions,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../../app/navigation/types';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import { spacing } from '../../../core/theme/spacing';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Pdf from 'react-native-pdf';

type PdfViewerRouteProp = RouteProp<MainStackParamList, 'PdfViewer'>;

export const PdfViewerScreen: React.FC = () => {
    const { theme, isDark } = useTheme();
    const route = useRoute<PdfViewerRouteProp>();
    const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [pageCount, setPageCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);

    const { url, title } = route.params;

    const handleShare = async () => {
        try {
            await Share.share({
                message: `${title}\n${url}`,
                url: url,
            });
        } catch (e) {
            console.error('Share failed:', e);
        }
    };

    const handleOpenExternal = () => {
        Linking.openURL(url);
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
            {/* Custom Header */}
            <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.text.primary} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={[styles.headerTitle, { color: theme.text.primary }]} numberOfLines={1}>
                        {title}
                    </Text>
                    {pageCount > 0 && (
                        <Text style={[styles.pageIndicator, { color: theme.text.secondary }]}>
                            {currentPage} / {pageCount}
                        </Text>
                    )}
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={handleOpenExternal} style={styles.headerButton}>
                        <Ionicons name="open-outline" size={22} color={theme.text.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
                        <Ionicons name="share-outline" size={22} color={theme.text.primary} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* PDF Viewer - Native */}
            <View style={styles.pdfContainer}>
                {loading && !error && (
                    <View style={styles.loadingContainer}>
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
                            style={[styles.retryButton, { backgroundColor: theme.primary.main }]}
                            onPress={handleOpenExternal}
                        >
                            <Text style={styles.retryText}>فتح في المتصفح</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <Pdf
                        trustAllCerts={false}
                        source={{ uri: url, cache: true }}
                        style={[styles.pdf, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}
                        onLoadComplete={(numberOfPages) => {
                            setLoading(false);
                            setPageCount(numberOfPages);
                        }}
                        onPageChanged={(page) => {
                            setCurrentPage(page);
                        }}
                        onError={(err) => {
                            console.error('PDF Load Error:', err);
                            setLoading(false);
                            setError(true);
                        }}
                        enablePaging={true}
                        horizontal={false}
                        fitPolicy={0}
                        spacing={10}
                    />
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
    headerCenter: {
        flex: 1,
        marginHorizontal: spacing.sm,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    pageIndicator: {
        fontSize: 12,
        marginTop: 2,
    },
    headerActions: {
        flexDirection: 'row',
        gap: spacing.xs,
    },
    pdfContainer: {
        flex: 1,
    },
    pdf: {
        flex: 1,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
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
    },
    retryButton: {
        marginTop: spacing.lg,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryText: {
        color: '#fff',
        fontWeight: '600',
    },
});

export default PdfViewerScreen;
