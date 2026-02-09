/**
 * FilterChips Component
 * Reusable horizontal filter chip bar with animated selection
 */

import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Animated,
    useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../app/providers/ThemeProvider';
import { useLocalization } from '../../app/providers/LocalizationProvider';

export interface FilterOption {
    key: string;
    labelKey: string; // Translation key
    icon?: any;
}

interface FilterChipsProps {
    options: FilterOption[];
    selected: string;
    onSelect: (key: string) => void;
    title?: string;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
    options,
    selected,
    onSelect,
    title,
}) => {
    const { theme, isDark } = useTheme();
    const { t, isRTL } = useLocalization();
    const { width } = useWindowDimensions();
    const isDesktop = width >= 768;

    // Animation for selected chip
    const scaleAnims = useRef(
        options.reduce((acc, opt) => {
            acc[opt.key] = new Animated.Value(opt.key === selected ? 1 : 0);
            return acc;
        }, {} as Record<string, Animated.Value>)
    ).current;

    useEffect(() => {
        options.forEach((opt) => {
            Animated.spring(scaleAnims[opt.key], {
                toValue: opt.key === selected ? 1 : 0,
                friction: 8,
                tension: 100,
                useNativeDriver: false,
            }).start();
        });
    }, [selected, options, scaleAnims]);

    const styles = getStyles(theme, isDark, isDesktop);

    return (
        <View style={styles.container}>
            {title && <Text style={styles.title}>{title}</Text>}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[
                    styles.scrollContent,
                    isRTL && { flexDirection: 'row-reverse' },
                ]}
            >
                {options.map((option) => {
                    const isSelected = option.key === selected;
                    const backgroundColor = scaleAnims[option.key].interpolate({
                        inputRange: [0, 1],
                        outputRange: [
                            isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                            theme.primary.main,
                        ],
                    });
                    const textColor = scaleAnims[option.key].interpolate({
                        inputRange: [0, 1],
                        outputRange: [theme.text.secondary, '#FFFFFF'],
                    });

                    return (
                        <TouchableOpacity
                            key={option.key}
                            onPress={() => onSelect(option.key)}
                            activeOpacity={0.7}
                        >
                            <Animated.View
                                style={[
                                    styles.chip,
                                    { backgroundColor },
                                    isSelected && styles.chipSelected,
                                ]}
                            >
                                {option.icon && (
                                    <Animated.View style={{ marginRight: 6 }}>
                                        <Ionicons
                                            name={option.icon}
                                            size={16}
                                            color={isSelected ? '#FFFFFF' : theme.text.secondary}
                                        />
                                    </Animated.View>
                                )}
                                <Animated.Text style={[styles.chipText, { color: textColor }]}>
                                    {t(option.labelKey)}
                                </Animated.Text>
                            </Animated.View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const getStyles = (theme: any, isDark: boolean, isDesktop: boolean) =>
    StyleSheet.create({
        container: {
            marginBottom: 16,
            width: '100%',
        },
        title: {
            fontSize: 12,
            fontWeight: '800',
            color: theme.text.tertiary,
            marginBottom: 10,
            marginLeft: 8,
            textTransform: 'uppercase',
            letterSpacing: 1.5,
        },
        scrollContent: {
            paddingHorizontal: 8,
            paddingVertical: 4,
            gap: 12,
        },
        chip: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: isDesktop ? 22 : 18,
            paddingVertical: isDesktop ? 12 : 10,
            borderRadius: 16,
            borderWidth: 1.5,
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
            backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
        },
        chipSelected: {
            borderColor: theme.primary.main,
            backgroundColor: theme.primary.main,
            shadowColor: theme.primary.main,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
        },
        chipText: {
            fontSize: isDesktop ? 15 : 14,
            fontWeight: '700',
            letterSpacing: 0.3,
        },
    });

export default FilterChips;
