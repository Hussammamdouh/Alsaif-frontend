import React, { useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    StyleSheet,
    Modal,
    TextInput,
    StatusBar,
    ScrollView,
    useWindowDimensions,
    Animated,
    Easing,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../../app/navigation/types';
import { useDisclosures, ExchangeFilter } from '../disclosure.hooks';
import { Disclosure } from '../disclosure.api';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { useLocalization } from '../../../app/providers/LocalizationProvider';
import { spacing } from '../../../core/theme/spacing';
import { Ionicons } from '@expo/vector-icons';
import { ResponsiveContainer, FilterChips } from '../../../shared/components';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsAdmin } from '../../../app/auth/auth.hooks';
import { Disclosure as DisclosureType } from '../disclosure.api';

interface DisclosureListScreenProps {
    hideHeader?: boolean;
    ListHeaderComponent?: React.ReactElement;
}

interface DisclosureCardProps {
    item: Disclosure;
    index: number;
    language: string;
    theme: any;
    isDesktop: boolean;
    t: any;
    onPress: (item: Disclosure) => void;
}

const DisclosureCard: React.FC<DisclosureCardProps> = ({ item, index, language, theme, isDesktop, t, onPress }) => {
    const pdfCount = (item.pdfUrls || [item.url]).length;
    const currentTitle = language === 'ar' ? (item.titleAr || item.title) : (item.titleEn || item.title);
    const isADX = item.exchange === 'ADX';

    // Animation logic
    const translateY = React.useRef(new Animated.Value(30)).current;
    const opacity = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: 0,
                duration: 400,
                delay: Math.min(index * 50, 600),
                useNativeDriver: true,
                easing: Easing.out(Easing.back(1)),
            }),
            Animated.timing(opacity, {
                toValue: 1,
                duration: 400,
                delay: Math.min(index * 50, 600),
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <Animated.View style={{ opacity, transform: [{ translateY }], flex: isDesktop ? 0.5 : 1 }}>
            <TouchableOpacity
                style={[styles.premiumCard, { backgroundColor: theme.background.secondary, borderColor: theme.ui.border }]}
                onPress={() => onPress(item)}
                activeOpacity={0.9}
            >
                <View style={[styles.cardAccent, { backgroundColor: isADX ? '#EAB308' : '#3B82F6' }]} />
                <View style={styles.cardMain}>
                    <View style={styles.cardTopRow}>
                        <View style={[styles.symbolBadge, { backgroundColor: isADX ? '#EAB30815' : '#3B82F615', borderLeftWidth: 3, borderLeftColor: isADX ? '#EAB308' : '#3B82F6' }]}>
                            <Text style={[styles.symbolText, { color: isADX ? '#EAB308' : '#3B82F6' }]} numberOfLines={1}>
                                {language === 'ar' ? (item.companyNameAr || item.companyName || 'ADX') : (item.companyNameEn || item.companyName || 'ADX')}
                            </Text>
                        </View>
                        <View style={styles.cardMeta}>
                            <Ionicons name="calendar-outline" size={14} color={theme.text.tertiary} />
                            <Text style={[styles.dateText, { color: theme.text.tertiary }]}>
                                {new Date(item.date).toLocaleDateString(language === 'ar' ? 'ar-AE' : 'en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}
                            </Text>
                        </View>
                    </View>

                    <Text
                        style={[styles.premiumTitle, { color: theme.text.primary, textAlign: language === 'ar' ? 'right' : 'left' }]}
                        numberOfLines={2}
                    >
                        {currentTitle}
                    </Text>

                    <View style={styles.cardFooter}>
                        <View style={[styles.exchangeIndicator, { backgroundColor: isADX ? '#EAB308' : '#3B82F6' }]}>
                            <Text style={styles.exchangeIndicatorText}>{item.exchange}</Text>
                        </View>
                        <View style={styles.docCount}>
                            <Ionicons name="document-text" size={16} color={theme.primary.main} />
                            <Text style={[styles.docCountText, { color: theme.text.secondary }]}>
                                {pdfCount > 1 ? t('disclosures.pdfFiles', { count: pdfCount }) : 'View PDF'}
                            </Text>
                        </View>
                        <Ionicons
                            name={language === 'ar' ? "chevron-back" : "chevron-forward"}
                            size={18}
                            color={theme.text.tertiary}
                        />
                    </View>
                </View>

                {pdfCount > 1 && (
                    <View style={[styles.multiBadge, { backgroundColor: theme.primary.main }]}>
                        <Ionicons name="copy" size={10} color="#fff" />
                    </View>
                )}
            </TouchableOpacity>
        </Animated.View>
    );
};

export const DisclosureListScreen: React.FC<DisclosureListScreenProps> = ({ hideHeader, ListHeaderComponent }) => {
    const { theme, isDark, toggleTheme } = useTheme();
    const { t, language, toggleLanguage } = useLocalization();
    const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
    const { disclosures, loading, refreshing, error, refresh, loadMore, hasMore, filter, setFilter } = useDisclosures();
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const isDesktop = width >= 1024;
    const isAdmin = useIsAdmin();

    const [selectedDisclosure, setSelectedDisclosure] = useState<Disclosure | null>(null);
    const [showPdfModal, setShowPdfModal] = useState(false);

    // Responsive column count
    const numColumns = width > 1600 ? 3 : (isDesktop ? 2 : 1);

    // Memoized filtered data
    const filteredDisclosures = React.useMemo(() => {
        return disclosures;
    }, [disclosures]);

    const FILTERS: { key: ExchangeFilter; label: string; icon: any }[] = [
        { key: 'ALL', label: t('filter.all'), icon: 'layers-outline' },
        { key: 'DFM', label: t('filter.dfm'), icon: 'business-outline' },
        { key: 'ADX', label: t('filter.adx'), icon: 'trending-up-outline' },
    ];

    const handlePress = (item: Disclosure) => {
        // Always navigate to disclosure details screen for all users
        navigation.navigate('DisclosureDetails', {
            disclosureId: item._id,
            disclosure: item
        });
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

    const renderHeader = () => {
        if (hideHeader) return null;

        return (
            <View style={[
                styles.headerWrapper,
                isDesktop && styles.desktopHeaderWrapper,
                { borderBottomWidth: 1, borderBottomColor: theme.ui.border, paddingBottom: 24 },
                !isDesktop && { paddingTop: Math.max(insets.top, 12), borderBottomWidth: 0 }
            ]}>
                {isDesktop ? (
                    <>
                        <View style={{ marginBottom: 24, alignItems: language === 'ar' ? 'flex-end' : 'flex-start' }}>
                            <Text style={[styles.headerTitle, { color: theme.text.primary, fontSize: 36, textAlign: language === 'ar' ? 'right' : 'left' }]}>
                                {t('disclosures.title')}
                            </Text>
                            <Text style={[styles.headerSubtitle, { color: theme.text.tertiary, fontSize: 16, textAlign: language === 'ar' ? 'right' : 'left' }]}>
                                {t('common.tagline')}
                            </Text>
                        </View>

                        <View style={[styles.desktopToolbar, { flexDirection: language === 'ar' ? 'row-reverse' : 'row' }]}>
                            <View style={{ flex: 1, alignItems: language === 'ar' ? 'flex-end' : 'flex-start' }}>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={[
                                        styles.filtersScroll,
                                        { flexDirection: language === 'ar' ? 'row-reverse' : 'row', justifyContent: language === 'ar' ? 'flex-end' : 'flex-start', flexGrow: 1 }
                                    ]}
                                >
                                    {FILTERS.map((f) => {
                                        const isActive = filter === f.key;
                                        return (
                                            <TouchableOpacity
                                                key={f.key}
                                                style={[
                                                    styles.filterChip,
                                                    { flexDirection: language === 'ar' ? 'row-reverse' : 'row' },
                                                    {
                                                        backgroundColor: isActive
                                                            ? '#3e7a33'
                                                            : (isDark ? 'rgba(62,122,51,0.1)' : 'rgba(62,122,51,0.06)')
                                                    },
                                                    !isActive && { borderColor: isDark ? 'rgba(62,122,51,0.2)' : 'rgba(62,122,51,0.1)', borderWidth: 1 }
                                                ]}
                                                onPress={() => setFilter(f.key)}
                                            >
                                                <Ionicons
                                                    name={f.icon}
                                                    size={18}
                                                    color={isActive ? '#fff' : '#3e7a33'}
                                                />
                                                <Text
                                                    style={[
                                                        styles.filterChipText,
                                                        { color: isActive ? '#fff' : '#3e7a33' },
                                                    ]}
                                                >
                                                    {f.label}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                            </View>

                        </View>
                    </>
                ) : (
                    <>
                        <View style={styles.headerTop}>
                            <View style={{ alignItems: language === 'ar' ? 'flex-end' : 'flex-start' }}>
                                <Text style={[styles.headerTitle, { color: theme.text.primary, textAlign: language === 'ar' ? 'right' : 'left' }]}>{t('disclosures.title')}</Text>
                                <Text style={[styles.headerSubtitle, { color: theme.text.tertiary, textAlign: language === 'ar' ? 'right' : 'left' }]}>{t('common.tagline')}</Text>
                            </View>
                            <View style={styles.headerActions}>
                                <TouchableOpacity
                                    style={[styles.actionButton, { backgroundColor: theme.background.tertiary }]}
                                    onPress={toggleLanguage}
                                >
                                    <Text style={[styles.actionButtonText, { color: theme.primary.main }]}>
                                        {language === 'ar' ? 'EN' : 'AR'}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.actionButton, { backgroundColor: theme.background.tertiary }]}
                                    onPress={toggleTheme}
                                >
                                    <Ionicons name={isDark ? "sunny" : "moon"} size={20} color={theme.text.primary} />
                                </TouchableOpacity>
                            </View>
                        </View>



                        <View style={{ marginTop: 12 }}>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={[
                                    styles.filtersScroll,
                                    { flexDirection: language === 'ar' ? 'row-reverse' : 'row' }
                                ]}
                            >
                                {FILTERS.map((f) => {
                                    const isActive = filter === f.key;
                                    return (
                                        <TouchableOpacity
                                            key={f.key}
                                            style={[
                                                styles.filterChip,
                                                {
                                                    backgroundColor: isActive
                                                        ? '#3e7a33'
                                                        : (isDark ? 'rgba(62,122,51,0.1)' : 'rgba(62,122,51,0.06)')
                                                },
                                                !isActive && { borderColor: isDark ? 'rgba(62,122,51,0.2)' : 'rgba(62,122,51,0.1)', borderWidth: 1 }
                                            ]}
                                            onPress={() => setFilter(f.key)}
                                        >
                                            <Ionicons
                                                name={f.icon}
                                                size={18}
                                                color={isActive ? '#fff' : '#3e7a33'}
                                            />
                                            <Text
                                                style={[
                                                    styles.filterChipText,
                                                    { color: isActive ? '#fff' : '#3e7a33' },
                                                ]}
                                            >
                                                {f.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View>
                    </>
                )}
            </View>
        );
    };

    const renderItem = ({ item, index }: { item: Disclosure, index: number }) => (
        <DisclosureCard
            item={item}
            index={index}
            language={language}
            theme={theme}
            isDesktop={isDesktop}
            t={t}
            onPress={handlePress}
        />
    );

    const renderPdfSelectionModal = () => {
        if (!selectedDisclosure) return null;
        const pdfUrls = selectedDisclosure.pdfUrls || [selectedDisclosure.url];

        return (
            <Modal
                visible={showPdfModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowPdfModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowPdfModal(false)}
                >
                    <View style={[styles.modalContainer, { backgroundColor: theme.background.primary }]}>
                        <View style={styles.modalHeader}>
                            <View style={[styles.modalHandle, { backgroundColor: theme.text.tertiary + '40' }]} />
                        </View>

                        <Text style={[styles.modalTitle, { color: theme.text.primary }]}>
                            {language === 'ar' ? 'اختر المستند' : 'Select Document'}
                        </Text>
                        <Text style={[styles.modalSubtitle, { color: theme.text.secondary }]} numberOfLines={2}>
                            {language === 'ar' ? (selectedDisclosure.titleAr || selectedDisclosure.title) : (selectedDisclosure.titleEn || selectedDisclosure.title)}
                        </Text>

                        <View style={styles.pdfList}>
                            {pdfUrls.map((url, index) => {
                                const filename = decodeURIComponent(url.split('/').pop() || `Document ${index + 1}`);
                                const displayName = filename.replace(/\.pdf$/i, '').replace(/%20/g, ' ');

                                return (
                                    <TouchableOpacity
                                        key={index}
                                        style={[styles.pdfOption, { backgroundColor: theme.background.secondary }]}
                                        onPress={() => handlePdfSelect(url, index)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={[styles.pdfIconContainer, { backgroundColor: theme.primary.main + '15' }]}>
                                            <Ionicons name="document-text" size={24} color={theme.primary.main} />
                                        </View>
                                        <View style={styles.pdfOptionContent}>
                                            <Text style={[styles.pdfOptionTitle, { color: theme.text.primary }]} numberOfLines={2}>
                                                {displayName || `${language === 'ar' ? 'المستند' : 'Document'} ${index + 1}`}
                                            </Text>
                                            <Text style={[styles.pdfOptionSubtitle, { color: theme.text.tertiary }]}>
                                                PDF • {index + 1} {language === 'ar' ? 'من' : 'of'} {pdfUrls.length}
                                            </Text>
                                        </View>
                                        <Ionicons name={language === 'ar' ? "chevron-back" : "chevron-forward"} size={20} color={theme.text.tertiary} />
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <TouchableOpacity
                            style={[styles.closeButton, { borderColor: theme.ui.border, backgroundColor: theme.background.tertiary }]}
                            onPress={() => setShowPdfModal(false)}
                        >
                            <Text style={[styles.closeButtonText, { color: theme.text.primary }]}>
                                {language === 'ar' ? 'إلغاء' : 'Cancel'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        );
    };

    if (loading && !refreshing) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
                <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
                {renderHeader()}
                <View style={styles.skeletonContainer}>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <View key={i} style={[styles.skeletonCard, { backgroundColor: theme.background.secondary }]} />
                    ))}
                </View>
            </View>
        );
    }

    if (error && filteredDisclosures.length === 0) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background.primary, justifyContent: 'center', alignItems: 'center', padding: 24 }]}>
                <View style={[styles.errorCircle, { backgroundColor: theme.accent.error + '10' }]}>
                    <Ionicons name="alert-circle" size={48} color={theme.accent.error} />
                </View>
                <Text style={[styles.errorTitle, { color: theme.text.primary }]}>Oops! Connection Error</Text>
                <Text style={[styles.errorSubtitle, { color: theme.text.secondary }]}>{error}</Text>
                <TouchableOpacity
                    style={[styles.retryButton, { backgroundColor: theme.primary.main }]}
                    onPress={refresh}
                >
                    <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            <ResponsiveContainer style={{ flex: 1 }}>
                {renderHeader()}

                <FlatList
                    key={`list-${numColumns}`}
                    data={filteredDisclosures}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    ListHeaderComponent={
                        <>
                            {ListHeaderComponent}
                            {!isDesktop && (
                                <FilterChips
                                    options={FILTERS.map(f => ({
                                        key: f.key,
                                        labelKey: `filter.${f.key.toLowerCase()}`,
                                        icon: f.icon
                                    }))}
                                    selected={filter}
                                    onSelect={(key: string) => setFilter(key as any)}
                                />
                            )}
                        </>
                    }
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={theme.primary.main} />
                    }
                    contentContainerStyle={[
                        styles.listContent,
                        isDesktop && styles.desktopList,
                        { paddingBottom: isDesktop ? 100 : 40 }
                    ]}
                    columnWrapperStyle={isDesktop && filteredDisclosures.length > 0 ? styles.columnWrapper : undefined}
                    numColumns={numColumns}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        !loading ? (
                            <View style={styles.emptyContainer}>
                                <View style={[styles.emptyIconCircle, { backgroundColor: theme.background.tertiary }]}>
                                    <Ionicons name="search-outline" size={40} color={theme.text.tertiary} />
                                </View>
                                <Text style={[styles.emptyTitle, { color: theme.text.primary }]}>
                                    No disclosures yet
                                </Text>
                                <Text style={[styles.emptySubtitle, { color: theme.text.tertiary }]}>
                                    Market announcements will appear here once they are published.
                                </Text>
                            </View>
                        ) : null
                    }
                    ListFooterComponent={
                        !loading && disclosures.length > 0 ? (
                            <View style={styles.footerContainer}>
                                <TouchableOpacity
                                    style={[styles.loadMoreButton, { backgroundColor: theme.primary.main }]}
                                    onPress={loadMore}
                                >
                                    <Text style={styles.loadMoreText}>Load More</Text>
                                </TouchableOpacity>
                            </View>
                        ) : null
                    }
                />
                {renderPdfSelectionModal()}
            </ResponsiveContainer>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerWrapper: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.sm,
    },
    desktopHeaderWrapper: {
        paddingHorizontal: spacing.xl,
        paddingTop: 32,
    },
    desktopHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    desktopHeaderActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    desktopToolbar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    headerSubtitle: {
        fontSize: 13,
        fontWeight: '500',
        marginTop: 2,
    },
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionButtonText: {
        fontSize: 12,
        fontWeight: '800',
    },
    filtersContainer: {
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
    },
    filtersScroll: {
        paddingBottom: 8,
        gap: 10,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 30,
        gap: 10,
        height: 44,
        justifyContent: 'center',
    },
    filterChipText: {
        fontSize: 15,
        fontWeight: '700',
    },
    listContent: {
        paddingHorizontal: spacing.md,
        paddingBottom: 40,
    },
    desktopList: {
        paddingHorizontal: spacing.xl,
    },
    columnWrapper: {
        gap: spacing.md,
    },
    premiumCard: {
        borderRadius: 24,
        marginBottom: 16,
        borderWidth: 1,
        overflow: 'hidden',
        padding: 16,
        flex: 1,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    cardAccent: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 4,
        height: '100%',
        backgroundColor: '#3B82F6',
        opacity: 0.5,
    },
    cardMain: {
        gap: 12,
    },
    cardTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    symbolBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    symbolText: {
        fontSize: 12,
        fontWeight: '800',
        maxWidth: 200,
    },
    cardMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dateText: {
        fontSize: 13,
        fontWeight: '600',
    },
    premiumTitle: {
        fontSize: 17,
        fontWeight: '700',
        lineHeight: 24,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 12,
    },
    exchangeIndicator: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    exchangeIndicatorText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '900',
    },
    docCount: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flex: 1,
    },
    docCountText: {
        fontSize: 13,
        fontWeight: '600',
    },
    multiBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        padding: 6,
        borderBottomLeftRadius: 12,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 24,
        paddingBottom: spacing.xl,
        maxHeight: '80%',
    },
    modalHeader: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    modalHandle: {
        width: 40,
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 2,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 24,
    },
    pdfList: {
        gap: 12,
    },
    pdfOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        gap: 16,
    },
    pdfIconContainer: {
        width: 52,
        height: 52,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pdfOptionContent: {
        flex: 1,
    },
    pdfOptionTitle: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 4,
    },
    pdfOptionSubtitle: {
        fontSize: 12,
        fontWeight: '500',
    },
    closeButton: {
        alignItems: 'center',
        paddingVertical: 18,
        marginTop: 16,
        borderRadius: 16,
        borderWidth: 1,
    },
    closeButtonText: {
        fontSize: 16,
        fontWeight: '700',
    },
    skeletonContainer: {
        paddingHorizontal: spacing.md,
        gap: 16,
        marginTop: 20,
    },
    skeletonCard: {
        height: 140,
        borderRadius: 24,
    },
    errorCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    errorTitle: {
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 8,
    },
    errorSubtitle: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
    },
    retryButton: {
        paddingHorizontal: 40,
        paddingVertical: 16,
        borderRadius: 16,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 80,
        paddingHorizontal: 40,
    },
    emptyIconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 22,
    },
    footerContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    loadMoreButton: {
        paddingHorizontal: 40,
        paddingVertical: 16,
        borderRadius: 16,
    },
    loadMoreText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});

export default DisclosureListScreen;
