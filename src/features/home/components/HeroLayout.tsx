import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useLocalization } from '../../../app/providers';
import { bannerService, Banner } from '../../../core/services/api/adminEnhancements.service';
import { LinearGradient } from 'expo-linear-gradient';
import { spacing } from '../../../core/theme/spacing';

export const NewHeroCarousel: React.FC = () => {
    const { theme, isDark } = useTheme();
    const { t, isRTL } = useLocalization();
    const [banners, setBanners] = useState<Banner[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const data = await bannerService.getActive();
                setBanners(data);
            } catch (error) {
                console.error('Failed to fetch banners:', error);
            }
        };
        fetchBanners();
    }, []);

    const handleNext = () => {
        if (banners.length === 0) return;
        setActiveIndex((prev) => (prev + 1) % banners.length);
    };

    const handlePrev = () => {
        if (banners.length === 0) return;
        setActiveIndex((prev) => (prev - 1 + banners.length) % banners.length);
    };

    if (banners.length === 0) return null;

    const currentBanner = banners[activeIndex];

    return (
        <View style={styles.container}>
            <View style={styles.carouselWrapper}>
                <Image
                    source={{ uri: currentBanner.imageUrl }}
                    style={styles.bannerImage}
                    resizeMode="cover"
                />

                <LinearGradient
                    colors={['rgba(0,0,0,0.85)', 'rgba(0,0,0,0.2)', 'transparent']}
                    start={{ x: isRTL ? 1 : 0, y: 0.5 }}
                    end={{ x: isRTL ? 0 : 1, y: 0.5 }}
                    style={[styles.overlay, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}
                >
                    <View style={[styles.textContent, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                        <Text style={[styles.heroSub, { textAlign: isRTL ? 'right' : 'left' }]}>
                            {t('home.marketSpotlight')}
                        </Text>
                        <Text style={[styles.heroTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
                            {currentBanner.partner || 'Premium Market Analysis'}
                        </Text>
                        <Text style={[styles.heroDesc, { textAlign: isRTL ? 'right' : 'left' }]}>
                            {t('home.heroDescription')}
                        </Text>
                        <TouchableOpacity style={[
                            styles.ctaBtn,
                            {
                                backgroundColor: theme.primary.main,
                                flexDirection: isRTL ? 'row-reverse' : 'row',
                                alignSelf: isRTL ? 'flex-end' : 'flex-start'
                            }
                        ]}>
                            <Text style={styles.ctaText}>{t('home.exploreNow')}</Text>
                            <Ionicons
                                name={isRTL ? "chevron-back" : "chevron-forward"}
                                size={20}
                                color="#FFF"
                            />
                        </TouchableOpacity>
                    </View>
                </LinearGradient>

                <TouchableOpacity
                    style={[styles.arrow, styles.leftArrow]}
                    onPress={isRTL ? handleNext : handlePrev}
                >
                    <Ionicons name="chevron-back" size={28} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.arrow, styles.rightArrow]}
                    onPress={isRTL ? handlePrev : handleNext}
                >
                    <Ionicons name="chevron-forward" size={28} color="#FFF" />
                </TouchableOpacity>

                <View style={[
                    styles.indicators,
                    isRTL ? { right: spacing['5xl'], left: undefined } : { left: spacing['5xl'], right: undefined }
                ]}>
                    {banners.map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.dot,
                                {
                                    backgroundColor: i === activeIndex ? '#FFF' : 'rgba(255,255,255,0.3)',
                                    width: i === activeIndex ? 32 : 8
                                }
                            ]}
                        />
                    ))}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingHorizontal: spacing.xl,
        marginVertical: spacing.xl,
    },
    carouselWrapper: {
        height: 520,
        width: '100%',
        borderRadius: 48,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#000',
    },
    bannerImage: {
        width: '100%',
        height: '100%',
        opacity: 0.8,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        paddingHorizontal: 140, // Increased to avoid arrow overlap
    },
    textContent: {
        maxWidth: 800,
    },
    heroSub: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '800',
        marginBottom: spacing.md,
        opacity: 0.8,
        textTransform: 'uppercase',
        letterSpacing: 4,
    },
    heroTitle: {
        color: '#FFF',
        fontSize: 64,
        fontWeight: '900',
        marginBottom: spacing.lg,
        lineHeight: 74,
    },
    heroDesc: {
        color: '#FFF',
        fontSize: 24,
        fontWeight: '500',
        marginBottom: spacing['3xl'],
        opacity: 0.9,
        lineHeight: 36,
    },
    ctaBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 48,
        borderRadius: 20,
        alignSelf: 'flex-start',
        gap: spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
    },
    ctaText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '800',
    },
    arrow: {
        position: 'absolute',
        top: '50%',
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -32,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    leftArrow: {
        left: spacing.md,
    },
    rightArrow: {
        right: spacing.md,
    },
    indicators: {
        position: 'absolute',
        bottom: spacing['3xl'],
        left: spacing['5xl'],
        flexDirection: 'row',
        gap: spacing.md,
    },
    dot: {
        height: 8,
        borderRadius: 4,
    },
});
