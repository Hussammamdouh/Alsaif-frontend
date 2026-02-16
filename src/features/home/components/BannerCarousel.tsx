import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    FlatList,
    Image,
    StyleSheet,
    TouchableOpacity,
    Linking,
    ActivityIndicator,
    Text,
    useWindowDimensions,
} from 'react-native';
import { bannerService, Banner } from '../../../core/services/api/adminEnhancements.service';
import { useTheme, useLocalization } from '../../../app/providers';

// REMOVED static constant


interface BannerCarouselProps {
    type: 'disclosures' | 'news' | 'free' | 'premium';
}

export const BannerCarousel: React.FC<BannerCarouselProps> = ({ type }) => {
    const { theme } = useTheme();
    const { t } = useLocalization();

    const { width } = useWindowDimensions();
    const isMobileOrTablet = width < 1024;
    const carouselHeight = isMobileOrTablet ? 120 : 60;

    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
        let isMounted = true;
        const fetchBanners = async () => {
            setLoading(true);
            try {
                // Only 'free' and 'premium' are valid banner types for the API
                const bannerType = (type === 'free' || type === 'premium') ? type : undefined;
                const data = await bannerService.getActive(bannerType);
                if (isMounted) {
                    setBanners(data);
                }
            } catch (error) {
                console.error('Failed to fetch banners:', error);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchBanners();
        return () => {
            isMounted = false;
        };
    }, [type]);

    const [isPaused, setIsPaused] = useState(false);

    // Auto-scroll logic with pause on interaction
    useEffect(() => {
        if (banners.length <= 1 || isPaused) return;

        const interval = setInterval(() => {
            const nextIndex = (activeIndex + 1) % banners.length;
            flatListRef.current?.scrollToIndex({
                index: nextIndex,
                animated: true,
            });
            setActiveIndex(nextIndex);
        }, 5000);

        return () => clearInterval(interval);
    }, [activeIndex, banners.length, isPaused]);

    const handleBannerPress = (banner: Banner) => {
        if (banner.link) {
            Linking.openURL(banner.link).catch((err) =>
                console.error('Failed to open banner link:', err)
            );
        }
    };

    const renderItem = ({ item }: { item: Banner }) => (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => handleBannerPress(item)}
            style={[styles.bannerContainer, { width, height: carouselHeight }]}
        >
            <Image source={{ uri: item.imageUrl }} style={[styles.bannerImage, { width, height: carouselHeight }]} resizeMode="cover" />
            {item.partner && (
                <View style={[styles.partnerBadge, { backgroundColor: 'rgba(0,0,0,0.6)' }]}>
                    <Text style={styles.partnerText}>{t('common.ad')}: {item.partner}</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    const onMomentumScrollEnd = (event: any) => {
        const contentOffset = event.nativeEvent.contentOffset.x;
        const index = Math.round(contentOffset / width);
        setActiveIndex(index);
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { width, height: carouselHeight }]}>
                <ActivityIndicator size="small" color={theme.primary.main} />
            </View>
        );
    }

    if (banners.length === 0) {
        return null;
    }

    return (
        <View style={[styles.container, { width, height: carouselHeight }]}>
            <FlatList
                ref={flatListRef}
                data={banners}
                renderItem={renderItem}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={onMomentumScrollEnd}
                onScrollBeginDrag={() => setIsPaused(true)}
                onScrollEndDrag={() => setIsPaused(false)}
                keyExtractor={(item) => item._id || item.id!}
                getItemLayout={(_, index) => ({
                    length: width,
                    offset: width * index,
                    index,
                })}
            />

            {/* Pagination Dots */}
            {banners.length > 1 && (
                <View style={styles.pagination}>
                    {banners.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                {
                                    backgroundColor:
                                        activeIndex === index ? theme.primary.main : theme.background.tertiary,
                                    width: activeIndex === index ? 20 : 8,
                                },
                            ]}
                        />
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {

    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    bannerContainer: {
        overflow: 'hidden',
    },
    bannerImage: {
    },
    partnerBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    partnerText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700',
    },
    pagination: {
        position: 'absolute',
        bottom: 10,
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 6,
    },
    dot: {
        height: 8,
        borderRadius: 4,
    },
});
