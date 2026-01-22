import React, { useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    StyleSheet,
    Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../../app/navigation/types';
import { LinearGradient } from 'expo-linear-gradient';
import { useDisclosures, ExchangeFilter } from '../disclosure.hooks';
import { Disclosure } from '../disclosure.api';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { useLocalization } from '../../../app/providers/LocalizationProvider';
import { spacing } from '../../../core/theme/spacing';
import { Ionicons } from '@expo/vector-icons';

interface DisclosureListScreenProps {
    hideHeader?: boolean;
    ListHeaderComponent?: React.ReactElement;
}

export const DisclosureListScreen: React.FC<DisclosureListScreenProps> = ({ hideHeader, ListHeaderComponent }) => {
    const { theme, isDark, toggleTheme } = useTheme();
    const { t, language, toggleLanguage } = useLocalization();
    const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
    const { disclosures, loading, refreshing, error, refresh, filter, setFilter } = useDisclosures();

    const FILTERS: { key: ExchangeFilter; label: string }[] = [
        { key: 'ALL', label: t('disclosures.filterAll') },
        { key: 'DFM', label: 'DFM' },
        { key: 'ADX', label: 'ADX' },
    ];

    // State for PDF selection modal
    const [selectedDisclosure, setSelectedDisclosure] = useState<Disclosure | null>(null);
    const [showPdfModal, setShowPdfModal] = useState(false);

    const handlePress = (item: Disclosure) => {
        console.log('[DisclosureList] Item pressed:', item.title);
        const pdfUrls = (item.pdfUrls && item.pdfUrls.length > 0)
            ? item.pdfUrls
            : (item.url ? [item.url] : []);

        if (pdfUrls.length === 0) {
            console.warn('[DisclosureList] No PDF URLs found for item');
            return;
        }

        const currentTitle = language === 'ar' ? (item.titleAr || item.title) : (item.titleEn || item.title);

        if (pdfUrls.length === 1) {
            // Single PDF - navigate directly
            console.log('[DisclosureList] Navigating to single PDF:', pdfUrls[0]);
            navigation.navigate('PdfViewer', { url: pdfUrls[0], title: currentTitle });
        } else {
            // Multiple PDFs - show selection modal
            console.log('[DisclosureList] Showing modal for multiple PDFs:', pdfUrls.length);
            setSelectedDisclosure(item);
            setShowPdfModal(true);
        }
    };

    const handlePdfSelect = (url: string, index: number) => {
        if (selectedDisclosure) {
            const currentTitle = language === 'ar' ? (selectedDisclosure.titleAr || selectedDisclosure.title) : (selectedDisclosure.titleEn || selectedDisclosure.title);
            const pdfCount = (selectedDisclosure.pdfUrls || []).length;
            const label = pdfCount > 1 ? ` (${index + 1}/${pdfCount})` : '';
            navigation.navigate('PdfViewer', {
                url,
                title: `${currentTitle}${label}`
            });
        }
        setShowPdfModal(false);
        setSelectedDisclosure(null);
    };

    const renderFilterTabs = () => (
        <View style={styles.filterContainer}>
            <View style={styles.filterInner}>
                {FILTERS.map((f) => (
                    <TouchableOpacity
                        key={f.key}
                        style={[
                            styles.filterTab,
                            filter === f.key && styles.filterTabActive,
                            filter === f.key && { backgroundColor: theme.primary.main },
                        ]}
                        onPress={() => setFilter(f.key)}
                    >
                        <Text
                            style={[
                                styles.filterText,
                                { color: filter === f.key ? '#fff' : theme.text.secondary },
                            ]}
                        >
                            {f.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const getBadgeColor = (exchange: 'DFM' | 'ADX') => {
        return exchange === 'DFM' ? '#2196F3' : '#FFC107';
    };

    const renderItem = ({ item }: { item: Disclosure }) => {
        const pdfCount = (item.pdfUrls || [item.url]).length;

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => handlePress(item)}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={isDark
                        ? ['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.02)']
                        : ['rgba(0, 0, 0, 0.03)', 'rgba(0, 0, 0, 0.01)']
                    }
                    style={StyleSheet.absoluteFill}
                />

                <View style={styles.cardHeader}>
                    <View style={styles.badgeRow}>
                        <View style={[styles.badge, { backgroundColor: getBadgeColor(item.exchange) }]}>
                            <Text style={styles.badgeText}>{item.exchange}</Text>
                        </View>
                        {/* Show PDF count badge if multiple PDFs */}
                        {pdfCount > 1 && (
                            <View style={[styles.pdfCountBadge, { backgroundColor: theme.primary.main }]}>
                                <Ionicons name="documents-outline" size={12} color="#fff" />
                                <Text style={styles.pdfCountText}>{pdfCount}</Text>
                            </View>
                        )}
                    </View>
                    <Text style={[styles.date, { color: theme.text.tertiary }]}>
                        {new Date(item.date).toLocaleDateString(language === 'ar' ? 'ar-AE' : 'en-US')}
                    </Text>
                </View>

                <Text style={[styles.title, { color: theme.text.primary, textAlign: language === 'ar' ? 'right' : 'left' }]} numberOfLines={3}>
                    {language === 'ar' ? (item.titleAr || item.title) : (item.titleEn || item.title)}
                </Text>

                <View style={[styles.footer, { flexDirection: language === 'ar' ? 'row-reverse' : 'row' }]}>
                    <View style={[styles.pdfIndicator, { flexDirection: language === 'ar' ? 'row-reverse' : 'row' }]}>
                        <Ionicons name="document-text-outline" size={16} color={theme.text.tertiary} />
                        <Text style={[styles.pdfText, { color: theme.text.tertiary }]}>
                            {pdfCount > 1 ? t('disclosures.pdfFiles', { count: pdfCount }) : 'PDF'}
                        </Text>
                    </View>
                    <Ionicons name={language === 'ar' ? "chevron-back" : "chevron-forward"} size={18} color={theme.text.tertiary} />
                </View>
            </TouchableOpacity>
        );
    };

    const renderPdfSelectionModal = () => {
        if (!selectedDisclosure) return null;
        const pdfUrls = selectedDisclosure.pdfUrls || [selectedDisclosure.url];

        return (
            <Modal
                visible={showPdfModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowPdfModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowPdfModal(false)}
                >
                    <View style={[styles.modalContainer, { backgroundColor: theme.background.primary }]}>
                        {/* Modal Header */}
                        <View style={styles.modalHeader}>
                            <View style={styles.modalHandle} />
                        </View>

                        <Text style={[styles.modalTitle, { color: theme.text.primary }]}>
                            اختر المستند
                        </Text>
                        <Text style={[styles.modalSubtitle, { color: theme.text.secondary }]} numberOfLines={2}>
                            {selectedDisclosure.title}
                        </Text>

                        {/* PDF List */}
                        <View style={styles.pdfList}>
                            {pdfUrls.map((url, index) => {
                                // Extract filename from URL
                                const filename = decodeURIComponent(url.split('/').pop() || `Document ${index + 1}`);
                                const displayName = filename.replace(/\.pdf$/i, '').replace(/%20/g, ' ');

                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={[styles.pdfOption, { backgroundColor: theme.background.secondary }]}
                                        onPress={() => handlePdfSelect(url, index)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[styles.pdfIconContainer, { backgroundColor: theme.primary.main + '20' }]}>
                                            <Ionicons name="document-text" size={24} color={theme.primary.main} />
                                        </View>
                                        <View style={styles.pdfOptionContent}>
                                            <Text style={[styles.pdfOptionTitle, { color: theme.text.primary }]} numberOfLines={2}>
                                                {displayName || `المستند ${index + 1}`}
                                            </Text>
                                            <Text style={[styles.pdfOptionSubtitle, { color: theme.text.tertiary }]}>
                                                PDF • {index + 1} من {pdfUrls.length}
                                            </Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={20} color={theme.text.tertiary} />
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Close button */}
                        <TouchableOpacity
                            style={[styles.closeButton, { borderColor: theme.border.main }]}
                            onPress={() => setShowPdfModal(false)}
                        >
                            <Text style={[styles.closeButtonText, { color: theme.text.secondary }]}>
                                إلغاء
                            </Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        );
    };

    const renderSkeleton = () => (
        <View style={styles.skeletonContainer}>
            {[1, 2, 3].map((i) => (
                <View key={i} style={[styles.skeletonRow, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]} />
            ))}
        </View>
    );

    if (loading && !refreshing) {
        return <View style={[styles.container, { backgroundColor: theme.background.primary }]}>{renderSkeleton()}</View>;
    }

    if (error && disclosures.length === 0) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background.primary, justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
                <Ionicons name="alert-circle-outline" size={48} color={theme.accent.error} />
                <Text style={{ color: theme.text.primary, fontSize: 18, fontWeight: 'bold', marginTop: 16 }}>عذراً، حدث خطأ</Text>
                <Text style={{ color: theme.text.secondary, textAlign: 'center', marginTop: 8, marginBottom: 20 }}>{error}</Text>
                <TouchableOpacity
                    style={{ backgroundColor: theme.primary.main, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 }}
                    onPress={refresh}
                >
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>إعادة المحاولة</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
            {/* Custom Interactive Header */}
            {!hideHeader && (
                <View style={[styles.fixedHeader, { backgroundColor: theme.background.primary, borderBottomColor: theme.border.main }]}>
                    <Text style={[styles.fixedHeaderTitle, { color: theme.text.primary }]}>
                        {t('disclosures.title')}
                    </Text>
                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.iconButton} onPress={toggleLanguage}>
                            <Text style={{ color: theme.primary.main, fontWeight: 'bold' }}>{language === 'ar' ? 'EN' : 'عربي'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton} onPress={toggleTheme}>
                            <Ionicons name={isDark ? "sunny" : "moon"} size={22} color={theme.text.primary} />
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            <FlatList
                data={disclosures}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
                ListHeaderComponent={
                    <>
                        {ListHeaderComponent}
                        {renderFilterTabs()}
                    </>
                }
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={theme.primary.main} />
                }
                contentContainerStyle={[styles.listContent, !hideHeader && { paddingTop: 70 }]}
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="document-text-outline" size={48} color={theme.text.tertiary} />
                            <Text style={{ color: theme.text.secondary, marginTop: spacing.md }}>
                                {t('common.noData')}
                            </Text>
                        </View>
                    ) : null
                }
            />
            {renderPdfSelectionModal()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    fixedHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.md,
        zIndex: 10,
        borderBottomWidth: 1,
    },
    fixedHeaderTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    listContent: {
        paddingBottom: 100,
    },
    filterContainer: {
        flexDirection: 'row',
        marginBottom: spacing.md,
        width: '100%',
    },
    filterInner: {
        flexDirection: 'row',
        gap: spacing.sm,
        paddingHorizontal: spacing.md,
    },
    filterTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    filterTabActive: {
        backgroundColor: '#438730',
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
    },
    card: {
        marginHorizontal: spacing.md,
        borderRadius: 16,
        marginBottom: spacing.md,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        padding: spacing.md,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 4,
    },
    badgeText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '900',
    },
    pdfCountBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    pdfCountText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '700',
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        lineHeight: 22,
        marginBottom: spacing.sm,
    },
    date: {
        fontSize: 12,
        fontWeight: '500',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    pdfIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    pdfText: {
        fontSize: 12,
        fontWeight: '500',
    },
    skeletonContainer: {
        padding: spacing.md,
    },
    skeletonRow: {
        height: 120,
        borderRadius: 16,
        marginBottom: spacing.md,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 60,
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xl,
        maxHeight: '70%',
    },
    modalHeader: {
        alignItems: 'center',
        paddingVertical: spacing.md,
    },
    modalHandle: {
        width: 40,
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 2,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: spacing.xs,
    },
    modalSubtitle: {
        fontSize: 14,
        marginBottom: spacing.lg,
    },
    pdfList: {
        gap: spacing.sm,
    },
    pdfOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: 12,
        gap: spacing.md,
    },
    pdfIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pdfOptionContent: {
        flex: 1,
    },
    pdfOptionTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    pdfOptionSubtitle: {
        fontSize: 12,
    },
    closeButton: {
        alignItems: 'center',
        paddingVertical: spacing.md,
        marginTop: spacing.md,
        borderTopWidth: 1,
    },
    closeButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

export default DisclosureListScreen;
