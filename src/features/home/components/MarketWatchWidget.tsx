import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useLocalization } from '../../../app/providers';
import { MarketTicker } from '../../../core/services/market/market.service';
import { spacing } from '../../../core/theme/spacing';

interface MarketWatchWidgetProps {
    data: MarketTicker[];
    exchange: 'ADX' | 'DFM';
}

export const MarketWatchWidget: React.FC<MarketWatchWidgetProps> = ({ data, exchange }) => {
    const { theme } = useTheme();
    const { t } = useLocalization();

    const filteredData = useMemo(() => {
        return data.filter(item => item.exchange === exchange).slice(0, 5);
    }, [data, exchange]);

    return (
        <View style={[styles.container, { backgroundColor: theme.background.secondary, borderColor: theme.border.main }]}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={[styles.exchangeTitle, { color: theme.primary.main }]}>
                        {exchange === 'ADX' ? t('market.adxTitle') : t('market.dfmTitle')}
                    </Text>
                    <View style={[styles.liveBadge, { backgroundColor: theme.semantic.positive + '15' }]}>
                        <View style={[styles.liveDot, { backgroundColor: theme.semantic.positive }]} />
                        <Text style={[styles.liveText, { color: theme.semantic.positive }]}>LIVE</Text>
                    </View>
                </View>
                <Ionicons name="stats-chart" size={18} color={theme.text.tertiary} />
            </View>

            {filteredData.map((item, index) => {
                const isPositive = (item.change ?? item.changePercent ?? 0) >= 0;
                const trendColor = isPositive ? theme.semantic.positive : theme.semantic.negative;

                return (
                    <View
                        key={item.symbol}
                        style={[
                            styles.itemRow,
                            { borderBottomColor: theme.border.main },
                            index === filteredData.length - 1 && { borderBottomWidth: 0 }
                        ]}
                    >
                        <View style={styles.symbolInfo}>
                            <Text style={[styles.symbolText, { color: theme.text.primary }]}>{item.symbol}</Text>
                            <Text style={[styles.nameText, { color: theme.text.tertiary }]}>{item.shortName}</Text>
                        </View>

                        <View style={styles.priceInfo}>
                            <Text style={[styles.priceText, { color: theme.text.primary }]}>
                                {item.price.toFixed(3)}
                            </Text>
                            <View style={styles.trendInfo}>
                                <Ionicons
                                    name={isPositive ? "triangle" : "triangle"}
                                    size={8}
                                    color={trendColor}
                                    style={{ transform: [{ rotate: isPositive ? '0deg' : '180deg' }] }}
                                />
                                <Text style={[styles.changeText, { color: trendColor }]}>
                                    {item.changePercent.toFixed(2)}%
                                </Text>
                            </View>
                        </View>
                    </View>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 24,
        borderWidth: 1,
        padding: spacing.xl,
        marginBottom: spacing.xl,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.03)',
        paddingBottom: spacing.sm,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    exchangeTitle: {
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 1,
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        gap: 4,
    },
    liveDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
    },
    liveText: {
        fontSize: 9,
        fontWeight: '900',
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.lg,
        borderBottomWidth: 1,
    },
    symbolInfo: {
        flex: 1,
    },
    symbolText: {
        fontSize: 16,
        fontWeight: '800',
    },
    nameText: {
        fontSize: 12,
        marginTop: 2,
    },
    priceInfo: {
        alignItems: 'flex-end',
    },
    priceText: {
        fontSize: 16,
        fontWeight: '900',
    },
    trendInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    changeText: {
        fontSize: 12,
        fontWeight: '800',
    },
});
