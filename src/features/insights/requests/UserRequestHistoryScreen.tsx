import React from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { useLocalization } from '../../../app/providers/LocalizationProvider';
import { useMyInsightRequests } from './useMyInsightRequests';
import { EmptyState } from '../../admin/components/EmptyState';
import { STATUS_COLORS } from '../../admin/admin.constants';

export const UserRequestHistoryScreen: React.FC = () => {
    const navigation = useNavigation();
    const { theme } = useTheme();
    const { t } = useLocalization();
    const { requests, isLoading, error, refresh } = useMyInsightRequests();

    const renderRequestItem = ({ item }: { item: any }) => {
        const statusColor = (STATUS_COLORS as any)[item.status] || theme.text.tertiary;

        return (
            <View style={[styles.card, { backgroundColor: theme.background.secondary, borderColor: theme.border.main }]}>
                <View style={styles.cardHeader}>
                    <Text style={[styles.cardTitle, { color: theme.text.primary }]} numberOfLines={1}>
                        {item.title}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                        <Text style={[styles.statusText, { color: statusColor }]}>
                            {t(`status.${item.status}`).toUpperCase()}
                        </Text>
                    </View>
                </View>

                <Text style={[styles.cardDetails, { color: theme.text.secondary }]} numberOfLines={3}>
                    {item.details}
                </Text>

                {item.status === 'rejected' && item.rejectionReason && (
                    <View style={[styles.rejectionBox, { backgroundColor: theme.error.main + '10' }]}>
                        <Text style={[styles.rejectionLabel, { color: theme.error.main }]}>
                            {t('admin.reason')}:
                        </Text>
                        <Text style={[styles.rejectionText, { color: theme.text.primary }]}>
                            {item.rejectionReason}
                        </Text>
                    </View>
                )}

                <View style={styles.cardFooter}>
                    <Text style={[styles.dateText, { color: theme.text.tertiary }]}>
                        {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.border.main }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={theme.text.primary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text.primary }]}>
                    {t('admin.insightRequests')}
                </Text>
                <View style={{ width: 40 }} />
            </View>

            {error ? (
                <EmptyState
                    icon="alert-circle"
                    title={t('common.error')}
                    message={error}
                    actionLabel={t('common.retry')}
                    onActionPress={refresh}
                    iconColor={theme.error.main}
                />
            ) : requests.length === 0 && !isLoading ? (
                <EmptyState
                    icon="document-text-outline"
                    title={t('admin.noInsightsFound')}
                    message={t('admin.noInsightsMessage')}
                    actionLabel=""
                    onActionPress={() => { }}
                    iconColor={theme.text.tertiary}
                />
            ) : (
                <FlatList
                    data={requests}
                    renderItem={renderRequestItem}
                    keyExtractor={(item: any) => item.id || item._id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={isLoading}
                            onRefresh={refresh}
                            colors={[theme.primary.main]}
                            tintColor={theme.primary.main}
                        />
                    }
                    ListEmptyComponent={
                        isLoading ? (
                            <ActivityIndicator style={{ marginTop: 40 }} size="large" color={theme.primary.main} />
                        ) : null
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    listContent: {
        padding: 16,
        gap: 16,
    },
    card: {
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        flex: 1,
        marginRight: 8,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
    },
    cardDetails: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12,
    },
    rejectionBox: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    rejectionLabel: {
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 4,
    },
    rejectionText: {
        fontSize: 13,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    dateText: {
        fontSize: 12,
    },
});
