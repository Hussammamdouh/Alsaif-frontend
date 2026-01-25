import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../app/providers/ThemeProvider';

const { width } = Dimensions.get('window');

export const PlanSkeleton: React.FC = () => {
    const { theme, isDark } = useTheme();
    const translateX = useRef(new Animated.Value(-width)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(translateX, {
                toValue: width,
                duration: 1500,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    return (
        <View style={[styles.card, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F5' }]}>
            <View style={[styles.title, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E0E0E0' }]} />
            <View style={[styles.price, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E0E0E0' }]} />

            <View style={styles.features}>
                {[1, 2, 3, 4].map((i) => (
                    <View key={i} style={[styles.featureRow]}>
                        <View style={[styles.dot, { backgroundColor: theme.primary.main + '40' }]} />
                        <View style={[styles.featureLine, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E0E0E0' }]} />
                    </View>
                ))}
            </View>

            <View style={[styles.button, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#E0E0E0' }]} />

            <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateX }] }]}>
                <LinearGradient
                    colors={['transparent', isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.3)', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 24,
        padding: 24,
        overflow: 'hidden',
        marginBottom: 20,
        height: 380,
    },
    title: {
        width: '60%',
        height: 20,
        borderRadius: 10,
        marginBottom: 20,
    },
    price: {
        width: '80%',
        height: 50,
        borderRadius: 10,
        marginBottom: 32,
    },
    features: {
        gap: 16,
        marginBottom: 32,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    dot: {
        width: 18,
        height: 18,
        borderRadius: 9,
    },
    featureLine: {
        width: '70%',
        height: 14,
        borderRadius: 7,
    },
    button: {
        width: '100%',
        height: 56,
        borderRadius: 16,
        marginTop: 'auto',
    },
});
