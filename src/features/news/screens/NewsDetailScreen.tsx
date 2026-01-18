import React from 'react';
import {
    View,
    Text,
    ScrollView,
    Image,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useWindowDimensions } from 'react-native';
import { MainStackParamList } from '../../../app/navigation/types';
import { useNews } from '../news.hooks';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { useLocalization } from '../../../app/providers/LocalizationProvider';
import { spacing } from '../../../core/theme/spacing';

type NewsDetailRouteProp = RouteProp<MainStackParamList, 'NewsDetail'>;

export const NewsDetailScreen: React.FC = () => {
    const route = useRoute<NewsDetailRouteProp>();
    const { newsId } = route.params;
    const { theme, isDark } = useTheme();
    const { t } = useLocalization();
    const { getNewsById, loading } = useNews();
    const { width } = useWindowDimensions();

    const article = getNewsById(newsId);

    if (loading || !article) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor: theme.background.primary }]}>
                <ActivityIndicator size="large" color={theme.primary.main} />
            </View>
        );
    }

    const paragraphs = article.content.split('\n\n').filter(p => p.trim().length > 0);

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.background.primary }]}
            showsVerticalScrollIndicator={false}
        >
            {article.imageUrl && (
                <View style={styles.imageWrapper}>
                    <Image
                        source={{ uri: article.imageUrl }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.6)']}
                        style={styles.imageOverlay}
                    />
                </View>
            )}

            <View style={styles.content}>
                <View style={styles.meta}>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{t('tabs.news').toUpperCase()}</Text>
                    </View>
                    <Text style={[styles.date, { color: theme.text.tertiary }]}>
                        {new Date(article.publishedAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </Text>
                </View>

                <Text style={[styles.title, { color: theme.text.primary }]}>
                    {article.title}
                </Text>

                <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]} />

                <View style={styles.paragraphsContainer}>
                    {paragraphs.map((p, index) => (
                        <Text key={index} style={[styles.paragraph, { color: theme.text.secondary }]}>
                            {p}
                        </Text>
                    ))}
                </View>

                <View style={styles.footerSpace} />
            </View>
        </ScrollView>
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
    imageWrapper: {
        width: '100%',
        height: 300,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imageOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 100,
    },
    content: {
        padding: spacing.md,
        marginTop: -30,
        backgroundColor: 'transparent',
    },
    meta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    badge: {
        backgroundColor: '#438730', // Brand Green
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 6,
        marginRight: spacing.sm,
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '900',
    },
    date: {
        fontSize: 13,
        fontWeight: '600',
    },
    title: {
        fontSize: 26,
        fontWeight: '900',
        lineHeight: 34,
        marginBottom: spacing.md,
    },
    divider: {
        height: 1,
        marginBottom: spacing.xl,
    },
    paragraphsContainer: {
        marginTop: spacing.sm,
    },
    paragraph: {
        fontSize: 18,
        lineHeight: 28,
        marginBottom: spacing.lg,
        textAlign: 'right', // Consistent with Arabic content
    },
    footerSpace: {
        height: 60,
    }
});
