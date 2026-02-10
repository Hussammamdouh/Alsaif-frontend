/**
 * AuthRequiredGate Component
 * Wraps protected content and shows a premium login/register prompt for guest users.
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    useWindowDimensions,
    Platform,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../app/auth';
import { useTheme, useLocalization } from '../../app/providers';
import { RootStackParamList } from '../../app/navigation/types';
import { Button } from './Button';
import { ResponsiveContainer } from './ResponsiveContainer';

interface AuthRequiredGateProps {
    children: React.ReactNode;
    title?: string;
    message?: string;
    icon?: string;
}

export const AuthRequiredGate: React.FC<AuthRequiredGateProps> = ({
    children,
    title,
    message,
    icon = 'lock-closed-outline',
}) => {
    const { state: authState } = useAuth();
    const { theme, isDark } = useTheme();
    const { t } = useLocalization();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const { width, height } = useWindowDimensions();
    const isDesktop = width >= 768;

    if (authState.isAuthenticated) {
        return <>{children}</>;
    }

    const handleLogin = () => {
        navigation.navigate('Auth', { screen: 'Login' });
    };

    const handleRegister = () => {
        navigation.navigate('Auth', { screen: 'Register' });
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
            {/* Ambient background decoration for web-feel */}
            {isDesktop && (
                <View style={StyleSheet.absoluteFill}>
                    <View style={[styles.glowCircle, {
                        top: -100,
                        right: -100,
                        backgroundColor: theme.primary.main + '15'
                    }]} />
                    <View style={[styles.glowCircle, {
                        bottom: -100,
                        left: -100,
                        backgroundColor: theme.primary.main + '10'
                    }]} />
                </View>
            )}

            <ResponsiveContainer maxWidth={isDesktop ? 1000 : width}>
                <View style={[
                    styles.contentWrapper,
                    isDesktop && styles.desktopContentWrapper
                ]}>
                    <View style={[
                        styles.card,
                        {
                            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.8)',
                            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                            shadowColor: '#000',
                            shadowOpacity: isDark ? 0.3 : 0.1,
                        },
                        isDesktop && styles.desktopCard
                    ]}>
                        <View style={[styles.iconWrapper, { backgroundColor: theme.primary.main + '15' }]}>
                            <Ionicons name={icon as any} size={isDesktop ? 56 : 40} color={theme.primary.main} />
                        </View>

                        <View style={styles.textWrapper}>
                            <Text style={[styles.title, { color: theme.text.primary }]}>
                                {title || t('auth.loginRequired') || 'Authentication Required'}
                            </Text>

                            <Text style={[styles.message, { color: theme.text.secondary }]}>
                                {message || t('auth.loginMessage') || 'Join our community to access exclusive analysis and features.'}
                            </Text>
                        </View>

                        <View style={[styles.buttonContainer, isDesktop && styles.desktopButtonContainer]}>
                            <Button
                                title={t('auth.login') || 'Log In'}
                                onPress={handleLogin}
                                variant="primary"
                                style={[styles.button, isDesktop ? styles.desktopButton : null]}
                            />
                            <Button
                                title={t('auth.register') || 'Create Account'}
                                onPress={handleRegister}
                                variant="secondary"
                                style={[styles.button, isDesktop ? styles.desktopButton : null]}
                            />
                        </View>
                    </View>
                </View>
            </ResponsiveContainer>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    glowCircle: {
        position: 'absolute',
        width: 400,
        height: 400,
        borderRadius: 200,
        opacity: 0.5,
    },
    contentWrapper: {
        padding: 24,
        alignItems: 'center',
        width: '100%',
    },
    desktopContentWrapper: {
        padding: 40,
    },
    card: {
        width: '100%',
        maxWidth: 500,
        padding: 32,
        borderRadius: 32,
        alignItems: 'center',
        borderWidth: 1,
        shadowOffset: { width: 0, height: 20 },
        shadowRadius: 40,
        elevation: 10,
    },
    desktopCard: {
        maxWidth: 800,
        padding: 64,
        flexDirection: 'column', // keeping vertical for now but could be horizontal
    },
    iconWrapper: {
        width: 80,
        height: 80,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    textWrapper: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        textAlign: 'center',
        marginBottom: 16,
        letterSpacing: -0.5,
    },
    message: {
        fontSize: 18,
        textAlign: 'center',
        lineHeight: 28,
        maxWidth: 500,
    },
    buttonContainer: {
        width: '100%',
        gap: 16,
    },
    desktopButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        maxWidth: 400,
    },
    button: {
        flex: Platform.OS === 'web' ? 0 : 1,
        minWidth: 160,
    },
    desktopButton: {
        minWidth: 180,
    },
});
