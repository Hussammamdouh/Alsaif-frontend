import React from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    StyleSheet,
    ActivityIndicator,
    Image, // Added Image import
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../../app/navigation/types';
import { LinearGradient } from 'expo-linear-gradient'; // Added LinearGradient import
import { useNews } from '../news.hooks'; // Reordered
import { NewsArticle } from '../news.api'; // Reordered
import { useTheme } from '../../../app/providers/ThemeProvider';
import { useLocalization } from '../../../app/providers/LocalizationProvider';
import { spacing } from '../../../core/theme/spacing';

interface NewsListScreenProps {
    hideHeader?: boolean;
    ListHeaderComponent?: React.ReactElement;
}

export const NewsListScreen: React.FC<NewsListScreenProps> = ({ hideHeader, ListHeaderComponent }) => {
    const { theme, isDark } = useTheme();
    const { t } = useLocalization();
    const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
    const { news, loading, refreshing, error, refresh } = useNews();

    const renderItem = ({ item }: { item: NewsArticle }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('NewsDetail', { newsId: item._id, title: item.title })}
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
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{t('tabs.news').toUpperCase()}</Text>
                </View>
                <Text style={[styles.date, { color: theme.text.tertiary }]}>
                    {new Date(item.publishedAt).toLocaleDateString()}
                </Text>
            </View>

            <Text style={[styles.title, { color: theme.text.primary }]} numberOfLines={3}>
                {item.title}
            </Text>

            {item.imageUrl && (
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: item.imageUrl }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                </View>
            )}
        </TouchableOpacity>
    );

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

    return (
        <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
            <FlatList
                data={news}
                renderItem={renderItem}
                keyExtractor={(item) => item._id}
                ListHeaderComponent={ListHeaderComponent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={theme.primary.main} />
                }
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    !loading ? (
                        <View style={styles.emptyContainer}>
                            <Text style={{ color: theme.text.secondary }}>{t('common.noData')}</Text>
                        </View>
                    ) : null
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        padding: spacing.md,
        paddingBottom: 100,
    },
    card: {
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
    badge: {
        backgroundColor: '#438730', // Brand Green
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '900',
    },
    title: {
        fontSize: 18,
        fontWeight: '800',
        lineHeight: 24,
        marginBottom: spacing.sm,
    },
    date: {
        fontSize: 12,
        fontWeight: '500',
    },
    imageContainer: {
        height: 200,
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: spacing.xs,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    skeletonContainer: {
        padding: spacing.md,
    },
    skeletonRow: {
        height: 250,
        borderRadius: 16,
        marginBottom: spacing.md,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 60,
    },
});
