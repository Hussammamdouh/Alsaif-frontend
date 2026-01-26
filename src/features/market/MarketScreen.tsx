import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Image, useWindowDimensions, Platform, TextInput, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { useTheme } from '../../app/providers/ThemeProvider';
import { useLocalization } from '../../app/providers/LocalizationProvider';
import { marketService, MarketTicker } from '../../core/services/market/market.service';
import { favoritesService } from '../../core/services/market/favorites.service';
import { spacing } from '../../core/theme/spacing';
import Icon from 'react-native-vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { ResponsiveContainer } from '../../shared/components';

// Threshold for desktop view
const DESKTOP_THRESHOLD = 1024;

export const MarketScreen = () => {
    const { theme, toggleTheme, isDark } = useTheme();
    const { t } = useLocalization();
    const { width } = useWindowDimensions();
    const isDesktop = width >= DESKTOP_THRESHOLD;
    const styles = useMemo(() => getStyles(theme, isDesktop), [theme, isDesktop]);

    const [selectedExchange, setSelectedExchange] = useState<'DFM' | 'ADX' | 'FAVORITES' | null>(null);
    const [loading, setLoading] = useState(false);
    const [marketData, setMarketData] = useState<MarketTicker[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedSymbol, setSelectedSymbol] = useState<MarketTicker | null>(null);
    const [sharesCount, setSharesCount] = useState<string>('');
    const [favorites, setFavorites] = useState<string[]>([]);

    // Memoized chart configuration to prevent flickering/jumping on every re-render
    const curatedChartData = useMemo(() => {
        if (!selectedSymbol) return null;
        const hasData = selectedSymbol.chartData && selectedSymbol.chartData.length > 0;
        const isPositive = (selectedSymbol.change ?? selectedSymbol.changePercent ?? 0) >= 0;
        const color = isPositive ? '#22c55e' : '#ef4444';

        return {
            color,
            isPositive,
            data: {
                labels: hasData
                    ? getChartLabels(selectedSymbol.chartData!)
                    : getFallbackLabels(12),
                datasets: [{
                    data: hasData
                        ? selectedSymbol.chartData!.map(p => p.price)
                        : generateChartData(
                            selectedSymbol.price,
                            selectedSymbol.changePercent,
                            selectedSymbol.symbol,
                            selectedSymbol.open,
                            selectedSymbol.prevClose
                        ),
                    color: (opacity = 1) => color,
                    strokeWidth: 3
                }]
            }
        };
    }, [selectedSymbol?.symbol, selectedSymbol?.price, selectedSymbol?.chartData]);

    // Polling Interval
    useEffect(() => {
        // Load favorites on mount
        loadFavorites();

        fetchData(); // Initial Fetch

        const interval = setInterval(() => {
            console.log('Refreshing market data (1m interval)...');
            fetchData();
        }, 60000); // 1 minute

        return () => clearInterval(interval);
    }, []);

    const loadFavorites = async () => {
        const favs = await favoritesService.getFavorites();
        setFavorites(favs);
    };

    const toggleFavorite = async (symbol: string) => {
        if (favorites.includes(symbol)) {
            await favoritesService.removeFavorite(symbol);
        } else {
            await favoritesService.addFavorite(symbol);
        }
        await loadFavorites();
    };

    const fetchData = async () => {
        try {
            if (!refreshing && marketData.length === 0) setLoading(true);
            const response = await marketService.getAllMarketData();
            if (response.success && response.data) {
                console.log('[MarketScreen] Received data count:', response.data.length);
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
        if (selectedExchange === 'FAVORITES') {
            return marketData.filter(item => favorites.includes(item.symbol));
        }
        return marketData.filter(item => item.exchange === selectedExchange);
    }, [marketData, selectedExchange, favorites]);

    const renderExchangeSelector = () => (
        <View style={styles.selectorContainer}>
            <TouchableOpacity
                style={[styles.selectorButton, selectedExchange === 'DFM' && styles.selectorButtonActive]}
                onPress={() => { setSelectedExchange('DFM'); setSelectedSymbol(null); }}
            >
                <Text style={[styles.selectorText, selectedExchange === 'DFM' ? styles.selectorTextActive : styles.selectorTextInactive]}>
                    {t('market.dubai')}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.selectorButton, selectedExchange === 'ADX' && styles.selectorButtonActive]}
                onPress={() => { setSelectedExchange('ADX'); setSelectedSymbol(null); }}
            >
                <Text style={[styles.selectorText, selectedExchange === 'ADX' ? styles.selectorTextActive : styles.selectorTextInactive]}>
                    {t('market.abuDhabi')}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.selectorButton, selectedExchange === 'FAVORITES' && styles.selectorButtonActive]}
                onPress={() => { setSelectedExchange('FAVORITES'); setSelectedSymbol(null); }}
            >
                <Icon
                    name={selectedExchange === 'FAVORITES' ? 'star' : 'star-outline'}
                    size={16}
                    color={selectedExchange === 'FAVORITES' ? '#FFFFFF' : '#888888'}
                    style={{ marginRight: 4 }}
                />
                <Text style={[styles.selectorText, selectedExchange === 'FAVORITES' ? styles.selectorTextActive : styles.selectorTextInactive]}>
                    {t('market.favorites')}
                </Text>
            </TouchableOpacity>
        </View>
    );

    const renderTickerItem = ({ item }: { item: MarketTicker }) => {
        const isPositive = (item.change ?? item.changePercent ?? 0) >= 0;
        const color = isPositive ? '#22c55e' : '#ef4444';
        const initials = item.shortName ? item.shortName.substring(0, 2).toUpperCase() : item.symbol.substring(0, 2);
        const displayChange = item.change ?? (item.price * (item.changePercent / 100));

        return (
            <TouchableOpacity
                onPress={() => { setSelectedSymbol(item); setSharesCount(''); }}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={isDark ? ['#252525', '#1A1A1A'] : ['#FFFFFF', theme.background.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.tickerCard, { borderColor: isDark ? '#2A2A2A' : theme.ui.border }]}
                >
                    <View style={styles.tickerContent}>
                        <View style={[styles.avatar, { backgroundColor: '#2A2A2A' }]}>
                            <Text style={[styles.avatarText, { color: theme.text.primary }]}>{initials}</Text>
                        </View>
                        <View style={styles.tickerInfo}>
                            <Text style={[styles.tickerSymbol, { color: theme.text.primary, fontSize: isDesktop ? 18 : 16 }]}>{item.shortName}</Text>
                            <Text style={[styles.tickerName, { color: theme.text.tertiary }]}>{item.symbol}</Text>
                        </View>
                        <View style={[styles.tickerPriceContainer, isDesktop ? { flexDirection: 'row', alignItems: 'center', gap: 24 } : null]}>
                            <Text style={[styles.tickerPrice, { color: theme.text.primary, fontSize: isDesktop ? 22 : 18 }]}>{(item.price || 0).toFixed(2)}</Text>
                            <View style={[styles.changeBadge, { backgroundColor: isPositive ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)' }]}>
                                <Text style={[styles.tickerChange, { color, fontSize: isDesktop ? 15 : 12, fontWeight: '700' }]}>
                                    {isPositive ? '▲' : '▼'} {Math.abs(displayChange).toFixed(2)} ({Math.abs(item.changePercent || 0).toFixed(2)}%)
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={(e) => { e.stopPropagation(); toggleFavorite(item.symbol); }}
                            style={styles.favoriteButton}
                        >
                            <Icon
                                name={favorites.includes(item.symbol) ? 'star' : 'star-outline'}
                                size={isDesktop ? 26 : 22}
                                color={favorites.includes(item.symbol) ? '#FFD700' : 'rgba(255,255,255,0.2)'}
                            />
                        </TouchableOpacity>
                    </View>
                </LinearGradient>
            </TouchableOpacity>
        );
    };

    if (!selectedExchange) {
        const renderEmptyMarkets = () => (
            <View style={[styles.centered, { paddingHorizontal: spacing.xl, backgroundColor: theme.background.primary }]}>
                <Icon name="stats-chart" size={64} color={theme.primary.main} style={{ marginBottom: 24 }} />
                <Text style={[styles.promptTitle, { color: theme.text.primary }]}>{t('market.title')}</Text>
                <Text style={[styles.promptSubtitle, { color: theme.text.secondary }]}>{t('market.selectMarketPrompt')}</Text>
                <View style={[styles.marketPillContainer, isDesktop ? { flexDirection: 'row', gap: 24, justifyContent: 'center' } : null]}>
                    <TouchableOpacity
                        style={[styles.marketPill, { backgroundColor: theme.background.secondary, borderColor: theme.ui.border }]}
                        onPress={() => setSelectedExchange('DFM')}
                    >
                        <Icon name="business" size={24} color={theme.primary.main} />
                        <Text style={[styles.marketPillText, { color: theme.text.primary }]}>{t('market.dubai')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.marketPill, { backgroundColor: theme.background.secondary, borderColor: theme.ui.border }]}
                        onPress={() => setSelectedExchange('ADX')}
                    >
                        <Icon name="trending-up" size={24} color={theme.primary.main} />
                        <Text style={[styles.marketPillText, { color: theme.text.primary }]}>{t('market.abuDhabi')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );

        return (
            <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
                <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
                {isDesktop ? (
                    <View style={styles.desktopContainer}>
                        <View style={styles.desktopMainColumn}>
                            <View style={[styles.dashboardHeader, { height: 80, paddingTop: 0, justifyContent: 'center', backgroundColor: theme.background.secondary }]}>
                                <Text style={[styles.headerTitle, { color: theme.text.primary }]}>{t('market.title')}</Text>
                            </View>
                            {renderEmptyMarkets()}
                        </View>
                    </View>
                ) : (
                    <SafeAreaView style={{ flex: 1 }}>
                        <View style={[styles.dashboardHeader, { height: 110, justifyContent: 'flex-start', backgroundColor: theme.background.secondary }]}>
                            <Text style={[styles.headerTitle, { color: theme.text.primary }]}>{t('market.title')}</Text>
                        </View>
                        {renderEmptyMarkets()}
                    </SafeAreaView>
                )}
            </View>
        );
    }

    if (selectedSymbol) {
        const isPositive = (selectedSymbol.change ?? selectedSymbol.changePercent ?? 0) >= 0;
        const color = isPositive ? '#22c55e' : '#ef4444';

        const renderSymbolDetail = () => (
            <>
                <View style={[styles.dashboardHeader, { backgroundColor: theme.background.secondary, height: isDesktop ? 80 : 110, paddingTop: isDesktop ? 0 : 45 }]}>
                    <TouchableOpacity onPress={() => setSelectedSymbol(null)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <Icon name="chevron-back" size={24} color={theme.text.primary} />
                        <Text style={[styles.headerTitle, { color: theme.text.primary }]}>{selectedSymbol.shortName}</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView
                    style={styles.desktopContentWrapper}
                    contentContainerStyle={{ paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={[isDesktop ? styles.dashboardRow : { padding: spacing.lg }]}>
                        <View style={[styles.detailCard, isDesktop ? { flex: 1, margin: 0, marginRight: 24 } : null]}>
                            <Text style={[styles.bigPrice, { color: theme.text.primary }]}>
                                {(selectedSymbol.price || 0).toFixed(2)} <Text style={{ fontSize: 16 }}>AED</Text>
                            </Text>
                            <Text style={[styles.bigChange, { color }]}>
                                {isPositive ? '▲' : '▼'} {Math.abs(selectedSymbol.change ?? (selectedSymbol.price * (selectedSymbol.changePercent / 100))).toFixed(2)} ({(selectedSymbol.changePercent || 0).toFixed(2)}%)
                            </Text>
                            <View style={styles.divider} />
                            <View style={isDesktop ? { gap: 16 } : {}}>
                                <View style={styles.statRow}>
                                    <Stat label={t('market.open')} value={formatStatValue(selectedSymbol.open || selectedSymbol.price)} theme={theme} styles={styles} t={t} />
                                    <Stat label={t('market.high')} value={formatStatValue(selectedSymbol.high || selectedSymbol.price)} theme={theme} styles={styles} t={t} />
                                    <Stat label={t('market.low')} value={formatStatValue(selectedSymbol.low || selectedSymbol.price)} theme={theme} styles={styles} t={t} />
                                </View>
                                <View style={styles.statRow}>
                                    <Stat label={t('market.prevClose')} value={formatStatValue(selectedSymbol.prevClose || ((selectedSymbol.price || 0) - (selectedSymbol.change || 0)))} theme={theme} styles={styles} t={t} />
                                    <Stat label={t('market.volume')} value={formatStatValue(selectedSymbol.volume, true)} theme={theme} styles={styles} t={t} />
                                </View>
                            </View>

                            <View style={styles.calculatorSection}>
                                <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>{t('market.sharesCalculator')}</Text>
                                <View style={styles.inputRow}>
                                    <Text style={[styles.inputLabel, { color: theme.text.secondary }]}>{t('market.numberOfShares')}</Text>
                                    <TextInput
                                        style={[styles.sharesInput, { backgroundColor: theme.background.secondary, color: theme.text.primary, borderColor: theme.ui.border }]}
                                        value={sharesCount}
                                        onChangeText={setSharesCount}
                                        keyboardType="numeric"
                                        placeholder="0"
                                        placeholderTextColor={theme.text.tertiary}
                                    />
                                </View>
                                {sharesCount && parseFloat(sharesCount) > 0 && (
                                    <View style={styles.calculationResult}>
                                        <View style={styles.resultRow}>
                                            <Text style={[styles.resultLabel, { color: theme.text.secondary }]}>{t('market.totalValue')}</Text>
                                            <Text style={[styles.resultValue, { color: theme.text.primary }]}>{(parseFloat(sharesCount) * selectedSymbol.price).toFixed(2)} AED</Text>
                                        </View>
                                        {(() => {
                                            const v = parseFloat(sharesCount) * selectedSymbol.price;
                                            const commission = selectedSymbol.exchange === 'DFM' ? (v * 0.0028625) + 10.5 : v * 0.001575;
                                            return (
                                                <>
                                                    <View style={styles.resultRow}>
                                                        <Text style={[styles.resultLabel, { color: theme.text.secondary }]}>Commission ({selectedSymbol.exchange})</Text>
                                                        <Text style={[styles.resultValue, { color: theme.text.primary }]}>{commission.toFixed(2)} AED</Text>
                                                    </View>
                                                    <View style={[styles.resultRow, { borderTopWidth: 1, borderTopColor: theme.ui.border, marginTop: 4, paddingTop: 8 }]}>
                                                        <Text style={[styles.resultLabel, { color: theme.text.primary, fontWeight: '700' }]}>Total Cost</Text>
                                                        <Text style={[styles.resultValue, { color: theme.primary.main, fontSize: 18 }]}>{(v + commission).toFixed(2)} AED</Text>
                                                    </View>
                                                </>
                                            );
                                        })()}
                                        <View style={[styles.resultRow, { marginTop: 8 }]}>
                                            <Text style={[styles.resultLabel, { color: theme.text.secondary }]}>{t('market.todayChange')}</Text>
                                            <Text style={[styles.resultValue, { color: isPositive ? '#22c55e' : '#ef4444' }]}>
                                                {isPositive ? '+' : ''}{(parseFloat(sharesCount) * (selectedSymbol.change || 0)).toFixed(2)} AED
                                            </Text>
                                        </View>
                                    </View>
                                )}
                            </View>
                        </View>

                        <View style={[styles.detailCard, isDesktop ? { flex: 2, margin: 0 } : null]}>
                            <View style={[styles.chartContainer, { alignItems: 'center' }]}>
                                <Text style={[styles.chartTitle, { color: theme.text.secondary, alignSelf: 'flex-start', marginBottom: 24 }]}>
                                    {t('market.priceHistory')} (1 Day)
                                </Text>
                                {curatedChartData && (
                                    <LineChart
                                        data={curatedChartData.data}
                                        width={isDesktop ? (width >= 1200 ? 600 : 450) : width - 64}
                                        height={isDesktop ? 400 : 250}
                                        chartConfig={{
                                            backgroundColor: 'transparent',
                                            backgroundGradientFrom: theme.background.secondary,
                                            backgroundGradientTo: theme.background.secondary,
                                            fillShadowGradientFrom: curatedChartData.color,
                                            fillShadowGradientTo: theme.background.secondary,
                                            fillShadowGradientFromOpacity: 0.5,
                                            fillShadowGradientToOpacity: 0.05,
                                            decimalPlaces: 2,
                                            color: (opacity = 1) => curatedChartData.color,
                                            labelColor: (opacity = 1) => theme.text.secondary,
                                            style: { borderRadius: 16 },
                                            propsForDots: { r: "3", strokeWidth: "1", stroke: curatedChartData.color },
                                            propsForBackgroundLines: { strokeDasharray: "", strokeWidth: 0.5, stroke: isDark ? '#2A2A2A' : '#E5E7EB' },
                                            paddingRight: 16,
                                            propsForLabels: { fontSize: 10, fontWeight: '600' }
                                        }}
                                        bezier
                                        style={{ marginVertical: 8, borderRadius: 16 }}
                                    />
                                )}
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </>
        );

        return (
            <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
                <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
                {isDesktop ? (
                    <View style={styles.desktopContainer}>
                        <View style={[styles.desktopMainColumn, { maxWidth: 1200 }]}>
                            {renderSymbolDetail()}
                        </View>
                    </View>
                ) : (
                    <SafeAreaView style={{ flex: 1 }}>
                        {renderSymbolDetail()}
                    </SafeAreaView>
                )}
            </View>
        );
    }

    const renderMarketList = () => (
        <>
            {isDesktop ? null : (
                <View style={[styles.dashboardHeader, { backgroundColor: theme.background.secondary, height: isDesktop ? 80 : 110, paddingTop: isDesktop ? 0 : 45 }]}>
                    <Text style={[styles.headerTitle, { color: theme.text.primary }]}>{t('market.title')}</Text>
                </View>
            )}

            <View style={[styles.desktopContentWrapper, { flex: 1, backgroundColor: theme.background.primary }]}>
                {renderExchangeSelector()}
                {loading ? (
                    <ActivityIndicator size="large" color={theme.primary.main} style={{ marginTop: 20 }} />
                ) : (
                    <FlatList
                        data={filteredData}
                        renderItem={renderTickerItem}
                        keyExtractor={(item) => item.symbol}
                        contentContainerStyle={styles.listContent}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.primary.main} />}
                        ListEmptyComponent={<View style={styles.centered}><Text style={{ color: theme.text.secondary }}>{t('market.noData')}</Text></View>}
                    />
                )}
            </View>
        </>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
            <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
            {isDesktop ? (
                <View style={styles.desktopContainer}>
                    <View style={styles.desktopMainColumn}>
                        {renderMarketList()}
                    </View>
                </View>
            ) : (
                <SafeAreaView style={{ flex: 1 }}>
                    {renderMarketList()}
                </SafeAreaView>
            )}
        </View>
    );
};

const generateChartData = (currentPrice: number, changePercent: number, symbol: string, open?: number, prevClose?: number): number[] => {
    const points: number[] = [];
    const price = currentPrice || 0;

    let seed = 0;
    for (let i = 0; i < symbol.length; i++) seed += symbol.charCodeAt(i);
    const seededRandom = () => {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    };

    const p0 = prevClose || (price / (1 + (changePercent / 100)));
    const p1 = open || p0;
    const p2 = price;

    const segment1Size = 4;
    const segment2Size = 8;

    const addSegment = (start: number, end: number, count: number, isLast: boolean) => {
        for (let i = 0; i < count; i++) {
            const t = i / (count - (isLast ? 1 : 0));
            const base = start + (end - start) * t;
            const jitter = (seededRandom() - 0.5) * (price * 0.004);
            const factor = Math.sin(t * Math.PI);
            points.push(base + (jitter * factor));
        }
    };

    addSegment(p0, p1, segment1Size, false);
    addSegment(p1, p2, segment2Size, true);

    return points;
};

const getFallbackLabels = (count: number): string[] => {
    const labels = [];
    for (let i = 0; i < count; i++) {
        if (i === 0) labels.push('Open');
        else if (i === Math.floor(count / 2)) labels.push('Noon');
        else if (i === count - 1) labels.push('Now');
        else labels.push('');
    }
    return labels;
};

const getChartLabels = (data: { timestamp: any }[]): string[] => {
    if (!data || data.length === 0) return [];

    // For 1 day, show time every few points
    const step = Math.max(1, Math.floor(data.length / 5));
    return data.map((p, i) => {
        if (i % step === 0) {
            const date = new Date(p.timestamp);
            return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
        }
        return '';
    });
};

const formatStatValue = (value: number, isVolume: boolean = false): string => {
    if (value === undefined || value === null || value === 0) return '—';
    if (isVolume) return value.toLocaleString();
    return value.toFixed(2);
};

const Stat = ({ label, value, theme, styles, t }: any) => (
    <View style={[styles.statItem, { borderRightWidth: label === t('market.low') || label === t('market.volume') ? 0 : 1, borderRightColor: theme.ui.border }]}>
        <Text style={[styles.statLabel, { color: theme.text.secondary }]}>{label}</Text>
        <Text style={[styles.statValue, { color: theme.text.primary, fontSize: 18, fontWeight: '800' }]}>{value}</Text>
    </View>
);

const getStyles = (theme: any, isDesktop: boolean) => StyleSheet.create({
    container: { flex: 1 },
    dashboardHeader: {
        height: 110,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 45,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: theme.ui.border,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: theme.text.primary,
        letterSpacing: -0.5,
    },
    desktopContentWrapper: {
        flex: 1,
    },
    desktopContainer: {
        flex: 1,
        flexDirection: 'row',
    },
    desktopMainColumn: {
        flex: 1,
        backgroundColor: theme.background.secondary + '10',
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: theme.ui.border,
    },
    dashboardRow: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        paddingTop: 24,
    },
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
    },
    marketPillText: { fontSize: 18, fontWeight: '700', marginLeft: 20 },
    selectorContainer: {
        flexDirection: 'row',
        marginHorizontal: spacing.lg,
        padding: 4,
        borderRadius: 12,
        marginBottom: spacing.md,
        backgroundColor: theme.background.secondary,
        marginTop: 16,
    },
    selectorButton: {
        flex: 1,
        flexDirection: 'row',
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
    },
    selectorText: { fontWeight: '600' },
    selectorButtonActive: {
        backgroundColor: '#22c55e',
        shadowColor: '#22c55e',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
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
        borderRadius: 20,
        marginBottom: spacing.sm,
        borderWidth: 1,
        overflow: 'hidden',
    },
    tickerSymbol: { fontSize: 16, fontWeight: 'bold' },
    tickerName: { fontSize: 12 },
    tickerPrice: { fontSize: 16, fontWeight: 'bold' },
    tickerChange: { fontSize: 12, fontWeight: '600' },
    detailHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg },
    backButton: { padding: 4 },
    detailCard: {
        padding: spacing.xl,
        borderRadius: 24,
        backgroundColor: theme.background.secondary,
        borderWidth: 1,
        borderColor: theme.ui.border,
        shadowColor: 'rgba(0,0,0,1)',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
    },
    bigPrice: { fontSize: 32, fontWeight: 'bold', textAlign: 'center' },
    bigChange: { fontSize: 18, textAlign: 'center', marginBottom: 24, fontWeight: '500' },
    statRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    statItem: { alignItems: 'center', flex: 1 },
    statLabel: { fontSize: 12, marginBottom: 4 },
    statValue: { fontSize: 16, fontWeight: '600' },
    divider: { height: 1, backgroundColor: '#2A2A2A', marginVertical: 16 },
    chartContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%'
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: '700'
    },
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
    calculatorSection: {
        marginTop: 24,
        paddingTop: 24,
        borderTopWidth: 1,
        borderTopColor: theme.ui.border
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 16
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500'
    },
    sharesInput: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 16,
        fontWeight: '600',
        minWidth: 120,
        textAlign: 'right'
    },
    calculationResult: {
        marginTop: 8
    },
    resultRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8
    },
    resultLabel: {
        fontSize: 14
    },
    resultValue: {
        fontSize: 16,
        fontWeight: '700'
    },
    favoriteButton: {
        marginLeft: 8,
        padding: 4,
    },
});
