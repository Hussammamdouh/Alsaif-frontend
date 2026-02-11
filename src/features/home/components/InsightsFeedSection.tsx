import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useInsights } from '../../insights/insights.hooks';
import { useMarketData } from '../../../core/hooks/useMarketData';
import { useTheme, useLocalization } from '../../../app/providers';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSubscriptionAccess } from '../../subscription';
import { spacing } from '../../../core/theme/spacing';


interface InsightsFeedSectionProps {
    marketData?: any[];
    loading?: boolean;
}

export const InsightsFeedSection: React.FC<InsightsFeedSectionProps> = ({
    marketData: propMarketData,
    loading: propLoading
}) => {
    const { theme } = useTheme();
    const { t } = useLocalization();

    // Stabilize initial params for useInsights to prevent redundant fetches
    const insightsParams = React.useMemo(() => ({ limit: 10 }), []);
    const { insights, loading: insightsLoading, hasMore, loadMore } = useInsights(insightsParams);

    // Use passed market data or fetch it if not provided
    const { marketData: fetchedMarketData, loading: marketLoading } = useMarketData(propMarketData ? 0 : 60000, !!propMarketData);

    const activeMarketData = propMarketData || fetchedMarketData;
    const activeMarketLoading = propMarketData ? !!propLoading : marketLoading;
    const loading = insightsLoading || activeMarketLoading;
    const navigation = useNavigation<any>();
    const { canAccessInsight } = useSubscriptionAccess();


    // Filter insights based on active market data
    const filteredInsights = React.useMemo(() => {
        if (activeMarketLoading || activeMarketData.length === 0) return insights.slice(0, 4);

        const activeSymbols = new Set(
            activeMarketData
                .filter(item => (item.price && item.price > 0) || (item.volume && item.volume > 0))
                .map(item => item.symbol.toUpperCase())
        );

        return insights
            .filter(insight => {
                // Always show free insights
                if (insight.type === 'free') return true;

                const symbol = insight.tags && insight.tags[0]?.toUpperCase();
                if (!symbol) return true;
                const isSymbolInMarket = activeMarketData.some(m => m.symbol.toUpperCase() === symbol);
                if (isSymbolInMarket && !activeSymbols.has(symbol)) return false;
                return true;
            })
            .slice(0, 4);
    }, [insights, activeMarketData, activeMarketLoading]);

    if (loading && filteredInsights.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.primary.main} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
                    {t('tabs.insights')}
                </Text>
            </View>

            {filteredInsights.map((item) => {
                const isPremium = item.type === 'premium';

                return (
                    <TouchableOpacity
                        key={item._id}
                        style={[styles.card, { backgroundColor: theme.background.secondary, borderColor: theme.border.main }]}
                        onPress={() => {
                            if (isPremium && !canAccessInsight('premium')) {
                                navigation.navigate('Paywall');
                            } else {
                                navigation.navigate('InsightDetail', { insightId: item._id, title: item.title });
                            }
                        }}
                    >


                        <View style={styles.cardHeader}>
                            <View style={[styles.tagBadge, { backgroundColor: isPremium ? `${theme.primary.main}15` : `${theme.text.tertiary}15` }]}>
                                <Text style={[styles.tagText, { color: isPremium ? theme.primary.main : theme.text.tertiary }]}>
                                    {isPremium ? t('common.premium') : t('common.free')}
                                </Text>
                            </View>
                            <Text style={[styles.dateText, { color: theme.text.tertiary }]}>
                                {new Date(item.createdAt).toLocaleDateString()}
                            </Text>
                        </View>

                        <View style={styles.content}>
                            <Text style={[styles.titleText, { color: theme.text.primary }]} numberOfLines={2}>
                                {item.title}
                            </Text>
                            <Text style={[styles.summaryText, { color: theme.text.secondary }]} numberOfLines={2}>
                                {item.excerpt}
                            </Text>
                        </View>

                        <View style={[styles.cardFooter, { borderTopColor: theme.border.main }]}>
                            <View style={styles.statsRow}>
                                <View style={styles.stat}>
                                    <Ionicons name="eye-outline" size={14} color={theme.text.tertiary} />
                                    <Text style={[styles.statText, { color: theme.text.tertiary }]}>{item.views || 0}</Text>
                                </View>
                                <View style={styles.stat}>
                                    <Ionicons name="chatbubble-outline" size={14} color={theme.text.tertiary} />
                                    <Text style={[styles.statText, { color: theme.text.tertiary }]}>{item.commentsCount || 0}</Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={18} color={theme.primary.main} />
                        </View>
                    </TouchableOpacity>
                );
            })}

            {hasMore && (
                <TouchableOpacity
                    style={[styles.loadMoreBtn, { borderColor: theme.primary.main }]}
                    onPress={loadMore}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color={theme.primary.main} />
                    ) : (
                        <Text style={[styles.loadMoreText, { color: theme.primary.main }]}>
                            {t('common.loadMore')}
                        </Text>
                    )}
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        paddingVertical: spacing['5xl'],
        alignItems: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: 28,
        fontWeight: '900',
    },
    viewAll: {
        fontSize: 16,
        fontWeight: '700',
    },
    card: {
        borderRadius: 24,
        borderWidth: 1,
        marginBottom: spacing.xl,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
    },
    tagBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    tagText: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
    },
    dateText: {
        fontSize: 12,
        fontWeight: '600',
    },
    content: {
        padding: spacing.lg,
    },
    titleText: {
        fontSize: 18,
        fontWeight: '800',
        lineHeight: 24,
        marginBottom: spacing.xs,
    },
    summaryText: {
        fontSize: 14,
        lineHeight: 20,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.md,
        borderTopWidth: 1,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    statText: {
        fontSize: 12,
        marginLeft: 4,
    },
    loadMoreBtn: {
        marginTop: spacing.md,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderWidth: 1,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        minWidth: 120,
    },
    loadMoreText: {
        fontSize: 14,
        fontWeight: '600',
    },
});
