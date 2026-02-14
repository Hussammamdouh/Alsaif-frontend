import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useTheme, useLocalization } from '../../app/providers';
import { marketService, MarketTicker } from '../../core/services/market/market.service';
import { NewHeroCarousel } from './components/HeroLayout';
import { MarketWatchWidget } from './components/MarketWatchWidget';
import DisclosuresSection from './components/DisclosuresSection';
import { InsightsFeedSection } from './components/InsightsFeedSection';
import { spacing } from '../../core/theme/spacing';
import { LinearGradient } from 'expo-linear-gradient';
import { useUser } from '../../app/auth/auth.hooks';

export const NewHomeScreen: React.FC = () => {
    const { theme, isDark } = useTheme();
    const { t, isRTL } = useLocalization();
    const user = useUser();
    const isAuthenticated = !!user;
    const [marketData, setMarketData] = useState<MarketTicker[]>([]);
    const [marketLoading, setMarketLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await marketService.getAllMarketData();
                if (response.success) {
                    setMarketData(response.data);
                }
            } catch (error) {
                console.error('Failed to fetch market data for NewHomeScreen:', error);
            } finally {
                setMarketLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 60000); // 1 minute refresh
        return () => clearInterval(interval);
    }, []);

    if (marketLoading && marketData.length === 0) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.background.primary }]}>
                <ActivityIndicator size="large" color={theme.primary.main} />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: theme.background.primary }}>
            <LinearGradient
                colors={isDark ? ['#121212', '#1a1a1a'] : ['#FFFFFF', '#f8fafc']}
                style={StyleSheet.absoluteFill}
            />

            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <NewHeroCarousel />

                <View style={[styles.gridContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    {/* Column 1: Market Data */}
                    <View style={styles.leftColumn}>
                        <Text style={[styles.sectionTitle, { color: theme.text.primary, textAlign: isRTL ? 'right' : 'left' }]}>
                            {t('market.title')}
                        </Text>
                        <MarketWatchWidget data={marketData} exchange="ADX" />
                        <MarketWatchWidget data={marketData} exchange="DFM" />
                    </View>

                    {isAuthenticated ? (
                        <>
                            {/* Authenticated: Column 2 = All Disclosures, Column 3 = Insights */}
                            <View style={styles.middleColumn}>
                                <DisclosuresSection key="all-disclosures" />
                            </View>
                            <View style={styles.rightColumn}>
                                <InsightsFeedSection marketData={marketData} loading={marketLoading} />
                            </View>
                        </>
                    ) : (
                        <>
                            {/* Unauthenticated: Column 2 = ADX Disclosures, Column 3 = DFM Disclosures */}
                            <View style={styles.middleColumn}>
                                <DisclosuresSection key="adx-disclosures" exchange="ADX" />
                            </View>
                            <View style={styles.rightColumn}>
                                <DisclosuresSection key="dfm-disclosures" exchange="DFM" />
                            </View>
                        </>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gridContainer: {
        paddingHorizontal: spacing['2xl'],
        paddingBottom: spacing['5xl'],
        gap: spacing.xl,
    },
    leftColumn: {
        flex: 1,
    },
    middleColumn: {
        flex: 1,
    },
    rightColumn: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 28,
        fontWeight: '900',
        marginBottom: spacing.xl,
    },
});
