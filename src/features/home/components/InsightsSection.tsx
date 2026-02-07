import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../app/providers';
import { MarketTicker } from '../../../core/services/market/market.service';
import { spacing } from '../../../core/theme/spacing';
import { Ionicons } from '@expo/vector-icons';

interface InsightsSectionProps {
    marketData: MarketTicker[];
}

const DataRow = ({ label, value, change, isPositive, theme }: any) => (
    <View style={[styles.dataRow, { borderBottomColor: theme.border.main }]}>
        <View style={styles.dataLabelColumn}>
            <Text style={[styles.dataLabel, { color: theme.text.primary }]}>{label}</Text>
            <Text style={[styles.dataSubLabel, { color: theme.text.tertiary }]}>{label} Corp</Text>
        </View>
        <View style={styles.dataValueColumn}>
            <Text style={[styles.dataValue, { color: theme.text.primary }]}>{value}</Text>
            <View style={[styles.trendBadge, { backgroundColor: isPositive ? `${theme.semantic.positive}15` : `${theme.semantic.negative}15` }]}>
                <Ionicons
                    name={isPositive ? "caret-up" : "caret-down"}
                    size={12}
                    color={isPositive ? theme.semantic.positive : theme.semantic.negative}
                />
                <Text style={[styles.dataChange, { color: isPositive ? theme.semantic.positive : theme.semantic.negative }]}>
                    {change}%
                </Text>
            </View>
        </View>
    </View>
);

export const InsightsSection: React.FC<InsightsSectionProps> = ({ marketData }) => {
    const { theme } = useTheme();

    const topGainers = useMemo(() =>
        [...marketData].sort((a, b) => b.changePercent - a.changePercent).slice(0, 3)
        , [marketData]);

    const topLosers = useMemo(() =>
        [...marketData].sort((a, b) => a.changePercent - b.changePercent).slice(0, 3)
        , [marketData]);

    return (
        <View style={styles.container}>
            <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Market Data</Text>

            {/* Top Gainers */}
            <View style={[styles.widget, { backgroundColor: theme.background.secondary, borderColor: theme.border.main }]}>
                <View style={styles.widgetHeader}>
                    <Text style={[styles.widgetTitle, { color: theme.text.primary }]}>Top Gainers</Text>
                    <Ionicons name="trending-up" size={18} color={theme.semantic.positive} />
                </View>
                {topGainers.map((item) => (
                    <DataRow
                        key={item.symbol}
                        label={item.symbol}
                        value={item.price.toFixed(3)}
                        change={item.changePercent.toFixed(2)}
                        isPositive={true}
                        theme={theme}
                    />
                ))}
            </View>

            {/* Top Losers */}
            <View style={[styles.widget, { backgroundColor: theme.background.secondary, borderColor: theme.border.main }]}>
                <View style={styles.widgetHeader}>
                    <Text style={[styles.widgetTitle, { color: theme.text.primary }]}>Top Losers</Text>
                    <Ionicons name="trending-down" size={18} color={theme.semantic.negative} />
                </View>
                {topLosers.map((item) => (
                    <DataRow
                        key={item.symbol}
                        label={item.symbol}
                        value={item.price.toFixed(3)}
                        change={Math.abs(item.changePercent).toFixed(2)}
                        isPositive={false}
                        theme={theme}
                    />
                ))}
            </View>

            {/* Commodities */}
            <View style={[styles.widget, { backgroundColor: theme.background.secondary, borderColor: theme.border.main }]}>
                <View style={styles.widgetHeader}>
                    <Text style={[styles.widgetTitle, { color: theme.text.primary }]}>Commodities</Text>
                    <Ionicons name="leaf-outline" size={18} color={theme.primary.main} />
                </View>
                <DataRow label="Gold" value="2,024.50" change="0.45" isPositive={true} theme={theme} />
                <DataRow label="Silver" value="22.84" change="1.20" isPositive={false} theme={theme} />
                <DataRow label="Oil" value="78.12" change="0.85" isPositive={true} theme={theme} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 28,
        fontWeight: '900',
        marginBottom: spacing.xl,
    },
    widget: {
        borderRadius: 32,
        borderWidth: 1,
        padding: spacing.xl,
        marginBottom: spacing.xl,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 2,
    },
    widgetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    widgetTitle: {
        fontSize: 18,
        fontWeight: '900',
    },
    dataRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.lg,
        borderBottomWidth: 1,
    },
    dataLabelColumn: {
        flex: 1,
    },
    dataLabel: {
        fontSize: 15,
        fontWeight: '800',
    },
    dataSubLabel: {
        fontSize: 12,
        marginTop: 2,
    },
    dataValueColumn: {
        alignItems: 'flex-end',
    },
    dataValue: {
        fontSize: 16,
        fontWeight: '900',
    },
    trendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        marginTop: 6,
        gap: 4,
    },
    dataChange: {
        fontSize: 13,
        fontWeight: '900',
    },
});
