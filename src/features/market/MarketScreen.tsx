import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { useTheme } from '../../app/providers/ThemeProvider';
import { useLocalization } from '../../app/providers/LocalizationProvider';
import { marketService, MarketTicker } from '../../core/services/market/market.service';
import { spacing } from '../../core/theme/spacing';
import Icon from 'react-native-vector-icons/Ionicons';

export const MarketScreen = () => {
    const { theme, toggleTheme, isDark } = useTheme();
    const { t } = useLocalization();

    const [selectedExchange, setSelectedExchange] = useState<'DFM' | 'ADX' | null>(null);
    const [loading, setLoading] = useState(false);
    const [marketData, setMarketData] = useState<MarketTicker[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedSymbol, setSelectedSymbol] = useState<MarketTicker | null>(null);

    // Initial Fetch
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            if (!refreshing) setLoading(true);
            const response = await marketService.getAllMarketData();
            if (response.success && response.data) {
                setMarketData(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch market data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    // Filter Data
    const filteredData = useMemo(() => {
        if (!selectedExchange) return [];
        return marketData.filter(item => item.exchange === selectedExchange);
    }, [marketData, selectedExchange]);

    // Render Items
    const renderHeader = () => (
        <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text.primary }]}>
                {t('market.title')}
            </Text>
            <TouchableOpacity onPress={toggleTheme} style={styles.themeButton}>
                <Icon name={isDark ? "sunny-outline" : "moon-outline"} size={24} color={theme.text.primary} />
            </TouchableOpacity>
        </View>
    );

    const renderExchangeSelector = () => (
        <View style={styles.selectorContainer}>
            {/* DFM Button */}
            <TouchableOpacity
                style={[
                    styles.selectorButton,
                    selectedExchange === 'DFM' && styles.selectorButtonActive
                ]}
                onPress={() => {
                    setSelectedExchange('DFM');
                    setSelectedSymbol(null);
                }}
            >
                <Text style={[
                    styles.selectorText,
                    selectedExchange === 'DFM' ? styles.selectorTextActive : styles.selectorTextInactive
                ]}>
                    {t('market.dubai')}
                </Text>
            </TouchableOpacity>

            {/* ADX Button */}
            <TouchableOpacity
                style={[
                    styles.selectorButton,
                    selectedExchange === 'ADX' && styles.selectorButtonActive
                ]}
                onPress={() => {
                    setSelectedExchange('ADX');
                    setSelectedSymbol(null);
                }}
            >
                <Text style={[
                    styles.selectorText,
                    selectedExchange === 'ADX' ? styles.selectorTextActive : styles.selectorTextInactive
                ]}>
                    {t('market.abuDhabi')}
                </Text>
            </TouchableOpacity>
        </View>
    );

    const renderTickerItem = ({ item }: { item: MarketTicker }) => {
        const isPositive = item.change >= 0;
        const color = isPositive ? '#22c55e' : '#ef4444'; // Green or Red
        const initials = item.shortName ? item.shortName.substring(0, 2).toUpperCase() : item.symbol.substring(0, 2);

        return (
            <TouchableOpacity
                style={[styles.tickerCard, { backgroundColor: theme.background.secondary, borderColor: theme.border.main }]}
                onPress={() => setSelectedSymbol(item)}
            >
                <View style={styles.tickerContent}>
                    {/* Avatar */}
                    <View style={[styles.avatar, { backgroundColor: theme.background.primary }]}>
                        <Text style={[styles.avatarText, { color: theme.text.primary }]}>{initials}</Text>
                    </View>

                    {/* Info */}
                    <View style={styles.tickerInfo}>
                        <Text style={[styles.tickerSymbol, { color: theme.text.primary }]}>{item.shortName}</Text>
                        <Text style={[styles.tickerName, { color: theme.text.tertiary }]}>{item.symbol}</Text>
                    </View>

                    {/* Price */}
                    <View style={styles.tickerPriceContainer}>
                        <Text style={[styles.tickerPrice, { color: theme.text.primary }]}>{item.price.toFixed(2)}</Text>
                        <View style={[styles.changeBadge, { backgroundColor: isPositive ? '#22c55e20' : '#ef444420' }]}>
                            <Text style={[styles.tickerChange, { color }]}>
                                {isPositive ? '▲' : '▼'} {Math.abs(item.change).toFixed(2)} ({Math.abs(item.changePercent).toFixed(2)}%)
                            </Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    // If no exchange selected (Initial State)
    if (!selectedExchange) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
                {renderHeader()}
                <View style={[styles.centered, { paddingHorizontal: spacing.xl }]}>
                    <Icon name="stats-chart" size={64} color={theme.primary.main} style={{ marginBottom: 24 }} />
                    <Text style={[styles.promptTitle, { color: theme.text.primary }]}>
                        {t('market.title')}
                    </Text>
                    <Text style={[styles.promptSubtitle, { color: theme.text.secondary }]}>
                        {t('market.selectMarketPrompt')}
                    </Text>

                    <View style={styles.marketPillContainer}>
                        <TouchableOpacity
                            style={[styles.marketPill, { backgroundColor: theme.background.secondary }]}
                            onPress={() => setSelectedExchange('DFM')}
                        >
                            <Icon name="business" size={24} color={theme.primary.main} />
                            <Text style={[styles.marketPillText, { color: theme.text.primary }]}>{t('market.dubai')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.marketPill, { backgroundColor: theme.background.secondary }]}
                            onPress={() => setSelectedExchange('ADX')}
                        >
                            <Icon name="trending-up" size={24} color={theme.primary.main} />
                            <Text style={[styles.marketPillText, { color: theme.text.primary }]}>{t('market.abuDhabi')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    // Detail View
    if (selectedSymbol) {
        const isPositive = selectedSymbol.change >= 0;
        const color = isPositive ? '#22c55e' : '#ef4444';

        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
                <View style={styles.detailHeader}>
                    <TouchableOpacity onPress={() => setSelectedSymbol(null)} style={styles.backButton}>
                        <Icon name="arrow-back" size={24} color={theme.text.primary} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: theme.text.primary }]}>{selectedSymbol.shortName}</Text>
                    <View style={{ width: 24 }} />
                </View>

                <View style={[styles.detailCard, { backgroundColor: theme.background.secondary }]}>
                    <Text style={[styles.bigPrice, { color: theme.text.primary }]}>
                        {selectedSymbol.price.toFixed(2)} <Text style={{ fontSize: 16 }}>AED</Text>
                    </Text>
                    <Text style={[styles.bigChange, { color }]}>
                        {isPositive ? '▲' : '▼'} {selectedSymbol.change.toFixed(2)} ({selectedSymbol.changePercent.toFixed(2)}%)
                    </Text>

                    <View style={styles.divider} />

                    <View style={styles.statRow}>
                        <Stat label={t('market.open')} value={formatStatValue(selectedSymbol.open || selectedSymbol.price)} theme={theme} />
                        <Stat label={t('market.high')} value={formatStatValue(selectedSymbol.high || selectedSymbol.price)} theme={theme} />
                        <Stat label={t('market.low')} value={formatStatValue(selectedSymbol.low || selectedSymbol.price)} theme={theme} />
                    </View>
                    <View style={styles.statRow}>
                        <Stat label={t('market.prevClose')} value={formatStatValue(selectedSymbol.prevClose || (selectedSymbol.price - selectedSymbol.change))} theme={theme} />
                        <Stat label={t('market.volume')} value={formatStatValue(selectedSymbol.volume, true)} theme={theme} />
                    </View>

                    {/* Dynamic Chart */}
                    <View style={[styles.chartContainer, { alignItems: 'center', width: '100%' }]}>
                        <Text style={[styles.chartTitle, { color: theme.text.secondary, alignSelf: 'flex-start', marginLeft: 16 }]}>
                            {t('market.priceHistory')} (7 Days)
                        </Text>
                        <LineChart
                            data={{
                                labels: getLast7Days(),
                                datasets: [{
                                    data: generateChartData(selectedSymbol.price, selectedSymbol.changePercent)
                                }]
                            }}
                            width={Dimensions.get('window').width - (spacing.lg * 2 + spacing.xl * 2)}
                            height={250}
                            yAxisLabel=""
                            yAxisSuffix=""
                            yAxisInterval={1}
                            withInnerLines={false}
                            withOuterLines={false}
                            withVerticalLines={false}
                            withHorizontalLines={true}
                            withVerticalLabels={true}
                            withHorizontalLabels={true}
                            fromZero={false}
                            segments={4}
                            withDots={true}
                            chartConfig={{
                                backgroundColor: 'transparent',
                                backgroundGradientFrom: theme.background.secondary,
                                backgroundGradientTo: theme.background.secondary,
                                fillShadowGradientFrom: color,
                                fillShadowGradientTo: theme.background.secondary,
                                fillShadowGradientFromOpacity: 0.5,
                                fillShadowGradientToOpacity: 0.05,
                                decimalPlaces: 2,
                                color: (opacity = 1) => color,
                                labelColor: (opacity = 1) => theme.text.secondary,
                                style: { borderRadius: 16 },
                                propsForDots: { r: "3", strokeWidth: "1", stroke: color },
                                propsForBackgroundLines: {
                                    strokeDasharray: "", // solid lines
                                    strokeWidth: 0.5,
                                    stroke: theme.divider || '#33333330'
                                },
                                paddingRight: 0,
                            }}
                            bezier
                            style={{
                                marginVertical: 8,
                                borderRadius: 16,
                            }}
                        />
                    </View>
                </View>

            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
            {renderHeader()}
            {renderExchangeSelector()}

            {loading ? (
                <ActivityIndicator size="large" color={theme.primary.main} style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={filteredData}
                    renderItem={renderTickerItem}
                    keyExtractor={(item) => item.symbol}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.primary.main} />
                    }
                    ListEmptyComponent={
                        <View style={styles.centered}>
                            <Text style={{ color: theme.text.secondary }}>{t('market.noData')}</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

// Helper to simulate historical data trend
const generateChartData = (currentPrice: number, changePercent: number): number[] => {
    const points = [];
    let price = currentPrice;

    // Add current price as last point
    points.push(price);

    // Generate previous 6 points working backwards
    const volatility = Math.abs(changePercent) / 100; // e.g. 0.05
    const direction = changePercent >= 0 ? -1 : 1; // Reverse direction for history

    for (let i = 0; i < 6; i++) {
        // Random fluctuation between 0.5% and 1.5% of price
        const fluctuation = price * (Math.random() * 0.015 + 0.005);
        // Apply trend + noise
        price = price + (price * volatility * direction * 0.5) + (Math.random() < 0.5 ? -fluctuation : fluctuation);
        points.unshift(price);
    }

    return points;
};

const getLast7Days = (): string[] => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const labels = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        labels.push(days[d.getDay()]);
    }
    return labels;
};

const formatStatValue = (value: number, isVolume: boolean = false): string => {
    if (value === undefined || value === null || value === 0) return '—';
    if (isVolume) return value.toLocaleString();
    return value.toFixed(2);
};

const Stat = ({ label, value, theme }: any) => (
    <View style={styles.statItem}>
        <Text style={[styles.statLabel, { color: theme.text.secondary }]}>{label}</Text>
        <Text style={[styles.statValue, { color: theme.text.primary }]}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    title: { fontSize: 24, fontWeight: 'bold' },
    themeButton: { padding: 8 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    promptTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
    promptSubtitle: { fontSize: 16, textAlign: 'center', marginBottom: 32 },
    marketPillContainer: { width: '100%', marginTop: spacing.md },
    marketPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.xl,
        borderRadius: 20,
        marginBottom: spacing.md,
        width: '100%',
        borderWidth: 1,
        borderColor: '#33333320',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    marketPillText: { fontSize: 18, fontWeight: '700', marginLeft: 20 },
    selectorContainer: {
        flexDirection: 'row',
        marginHorizontal: spacing.lg,
        padding: 4,
        borderRadius: 12,
        marginBottom: spacing.md,
    },
    selectorButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 8,
    },
    selectorText: { fontWeight: '600' },
    selectorButtonActive: {
        backgroundColor: '#22c55e', // Green Active
    },
    selectorTextActive: {
        color: '#FFFFFF'
    },
    selectorTextInactive: {
        color: '#888888'
    },
    listContent: { paddingHorizontal: spacing.lg, paddingBottom: 100 },
    tickerCard: {
        padding: spacing.md,
        borderRadius: 12,
        marginBottom: spacing.sm,
        borderWidth: 1,
    },
    tickerHeader: { flexDirection: 'row', justifyContent: 'space-between' },
    tickerSymbol: { fontSize: 16, fontWeight: 'bold' },
    tickerName: { fontSize: 12 },
    tickerPrice: { fontSize: 16, fontWeight: 'bold' },
    tickerChange: { fontSize: 12, fontWeight: '600' },
    detailHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg },
    backButton: { padding: 4 },
    detailCard: { margin: spacing.lg, padding: spacing.xl, borderRadius: 16 },
    bigPrice: { fontSize: 32, fontWeight: 'bold', textAlign: 'center' },
    bigChange: { fontSize: 18, textAlign: 'center', marginBottom: 24, fontWeight: '500' },
    statRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    statItem: { alignItems: 'center', flex: 1 },
    statLabel: { fontSize: 12, marginBottom: 4 },
    statValue: { fontSize: 16, fontWeight: '600' },
    divider: { height: 1, backgroundColor: '#33333330', marginVertical: 16 },
    chartPlaceholder: {
        height: 200,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24
    },
    chartContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
        width: '100%'
    },
    chartTitle: {
        fontSize: 14,
        marginBottom: 12,
        fontWeight: '600'
    },
    // New List Styles
    tickerContent: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12
    },
    avatarText: {
        fontSize: 18,
        fontWeight: 'bold'
    },
    tickerInfo: {
        flex: 1
    },
    tickerPriceContainer: {
        alignItems: 'flex-end'
    },
    changeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginTop: 4
    },
    timeRangeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 16,
        paddingHorizontal: 8,
    },
    timeRangeButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
    },
    timeRangeText: {
        fontSize: 12,
        fontWeight: '600'
    }
});
