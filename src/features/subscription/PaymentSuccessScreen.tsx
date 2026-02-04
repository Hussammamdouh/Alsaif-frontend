/**
 * PaymentSuccessScreen
 * Display after successful payment redirect from web checkout
 */

import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../app/providers/ThemeProvider';
import { useLocalization } from '../../app/providers/LocalizationProvider';
import { useSubscription } from './subscription.hooks';

export const PaymentSuccessScreen: React.FC = () => {
    const navigation = useNavigation();
    const { theme, isDark } = useTheme();
    const { t } = useLocalization();
    const { refetch } = useSubscription();

    const scaleAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Refresh subscription status
        refetch();

        // Animate success icon
        Animated.sequence([
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 4,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();

        // Navigate to subscription screen after delay
        const timer = setTimeout(() => {
            navigation.reset({
                index: 0,
                routes: [
                    { name: 'Main' as never, params: { screen: 'MainTabs' } },
                ],
            });
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={['#0a1a0a', '#1a2e1a', '#0a1a0a']}
                style={StyleSheet.absoluteFill}
            />

            <Animated.View
                style={[
                    styles.iconContainer,
                    { transform: [{ scale: scaleAnim }] }
                ]}
            >
                <LinearGradient
                    colors={['#34c759', '#30a14e']}
                    style={styles.iconGradient}
                >
                    <Ionicons name="checkmark" size={64} color="#FFF" />
                </LinearGradient>
            </Animated.View>

            <Animated.View style={{ opacity: fadeAnim }}>
                <Text style={styles.title}>
                    {t('payment.successTitle') || 'Payment Successful!'}
                </Text>
                <Text style={styles.subtitle}>
                    {t('payment.successSubtitle') || 'Welcome to Premium! Your subscription is now active.'}
                </Text>

                <View style={styles.features}>
                    {[
                        t('payment.feature1') || 'Unlimited Premium Insights',
                        t('payment.feature2') || 'Advanced Market Analysis',
                        t('payment.feature3') || 'Ad-Free Experience',
                        t('payment.feature4') || 'Priority Support',
                    ].map((feature, index) => (
                        <View key={index} style={styles.featureItem}>
                            <Ionicons name="checkmark-circle" size={20} color="#34c759" />
                            <Text style={styles.featureText}>{feature}</Text>
                        </View>
                    ))}
                </View>

                <Text style={styles.redirectText}>
                    {t('payment.redirecting') || 'Redirecting to home...'}
                </Text>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    iconContainer: {
        marginBottom: 32,
    },
    iconGradient: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#34c759',
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.7)',
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 24,
    },
    features: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        marginBottom: 32,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 8,
    },
    featureText: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
    },
    redirectText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.5)',
        textAlign: 'center',
    },
});

export default PaymentSuccessScreen;
