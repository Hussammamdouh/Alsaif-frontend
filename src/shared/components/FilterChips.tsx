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
            marginBottom: 12,
        },
        title: {
            fontSize: 13,
            fontWeight: '600',
            color: theme.text.secondary,
            marginBottom: 8,
            marginLeft: 4,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
        },
        scrollContent: {
            paddingHorizontal: 4,
            gap: 8,
        },
        chip: {
            paddingHorizontal: isDesktop ? 18 : 14,
            paddingVertical: isDesktop ? 10 : 8,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
        },
        chipSelected: {
            borderColor: 'transparent',
            shadowColor: theme.primary.main,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 3,
        },
        chipText: {
            fontSize: isDesktop ? 14 : 13,
            fontWeight: '600',
        },
    });

export default FilterChips;
