import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, Platform } from 'react-native';
import { useDisclosures } from '../../disclosure/disclosure.hooks';
import { useTheme, useLocalization } from '../../../app/providers';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../../app/navigation/types';
import { spacing } from '../../../core/theme/spacing';

const DisclosuresSection: React.FC<{ exchange?: 'ADX' | 'DFM' }> = ({ exchange }) => {
    const { theme } = useTheme();
    const { t, language, isRTL } = useLocalization();
    const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
    const { disclosures, loading, hasMore, loadMore } = useDisclosures(4, exchange);

    if (loading && disclosures.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.primary.main} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={[styles.headerRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text style={[styles.sectionTitle, { color: theme.text.primary, textAlign: isRTL ? 'right' : 'left' }]}>
                    {exchange ? `${exchange === 'ADX' ? t('market.adxTitle') : t('market.dfmTitle')} ${t('tabs.disclosures')}` : t('tabs.disclosures')}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'DisclosuresTab' })}>
                    <Text style={[styles.viewAll, { color: theme.primary.main }]}>{t('common.viewAll')}</Text>
                </TouchableOpacity>
            </View>

            {disclosures.map((item) => {
                const isADX = item.exchange === 'ADX';
                const title = language === 'ar' ? (item.titleAr || item.title) : (item.titleEn || item.title);
                const companyName = language === 'ar' ? (item.companyNameAr || item.companyName) : (item.companyNameEn || item.companyName);

                return (
                    <TouchableOpacity
                        key={item._id}
                        style={[styles.card, { backgroundColor: theme.background.secondary, borderColor: theme.border.main }]}
                        onPress={() => navigation.navigate('DisclosureDetails', { disclosureId: item._id, disclosure: item })}
                    >
                        <View style={[styles.cardHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                            <View style={[styles.exchangeBadge, { backgroundColor: isADX ? '#EAB308' : '#3B82F6' }]}>
                                <Text style={styles.exchangeText}>{isADX ? t('market.adxTitle') : t('market.dfmTitle')}</Text>
                            </View>
                            <Text style={[styles.dateText, { color: theme.text.tertiary }]}>
                                {new Date(item.date).toLocaleDateString()}
                            </Text>
                        </View>

                        <Text style={[styles.symbolText, { color: isADX ? '#EAB308' : '#3B82F6', textAlign: isRTL ? 'right' : 'left' }]}>{item.symbol}</Text>
                        <Text style={[styles.companyText, { color: theme.text.secondary, textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={1}>{companyName}</Text>
                        <Text style={[styles.titleText, { color: theme.text.primary, textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={2}>{title}</Text>

                        <View style={[styles.cardFooter, { justifyContent: isRTL ? 'flex-start' : 'flex-end' }]}>
                            <View style={[styles.readMore, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                <Text style={[styles.readMoreText, { color: isADX ? '#EAB308' : '#3B82F6' }]}>{t('disclosures.readDisclosure')}</Text>
                                <Ionicons name={language === 'ar' ? "chevron-back" : "chevron-forward"} size={14} color={isADX ? '#EAB308' : '#3B82F6'} />
                            </View>
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
        paddingVertical: 80,
        alignItems: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    sectionTitle: {
        fontSize: 28,
        fontWeight: '900',
    },
    viewAll: {
        fontSize: 14,
        fontWeight: '600',
    },
    card: {
        borderRadius: 12,
        padding: spacing.md,
        marginBottom: spacing.md,
        borderWidth: 1,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 3,
            },
        }),
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    exchangeBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: 4,
    },
    exchangeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    dateText: {
        fontSize: 12,
    },
    symbolText: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 2,
    },
    companyText: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 4,
    },
    titleText: {
        fontSize: 14,
        fontWeight: '500',
        lineHeight: 20,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: spacing.sm,
    },
    readMore: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    readMoreText: {
        fontSize: 12,
        fontWeight: '600',
        marginRight: 4,
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

export default DisclosuresSection;
