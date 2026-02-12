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
import { useAuth } from '../../app/auth/auth.hooks';
import { useTheme } from '../../app/providers/ThemeProvider';
import { useLocalization } from '../../app/providers/LocalizationProvider';
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
    const { t, isRTL } = useLocalization();
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

    const handleBack = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            navigation.navigate('Home' as any);
        }
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
                {isDesktop ? (
                    // Desktop: Centered layout
                    <View style={styles.desktopContentWrapper}>
                        <View style={[
                            styles.card,
                            {
                                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.8)',
                                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                                shadowColor: '#000',
                                shadowOpacity: isDark ? 0.3 : 0.1,
                            },
                            styles.desktopCard
                        ]}>
                            <TouchableOpacity
                                onPress={handleBack}
                                style={[styles.backButton, { left: isRTL ? undefined : 16, right: isRTL ? 16 : undefined }]}
                            >
                                <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color={theme.text.primary} />
                            </TouchableOpacity>

                            <View style={[styles.iconWrapper, { backgroundColor: theme.primary.main + '15' }]}>
                                <Ionicons name={icon as any} size={56} color={theme.primary.main} />
                            </View>

                            <View style={styles.textWrapper}>
                                <Text style={[styles.title, { color: theme.text.primary }]}>
                                    {title || t('auth.loginRequired') || 'Authentication Required'}
                                </Text>

                                <Text style={[styles.message, { color: theme.text.secondary }]}>
                                    {message || t('auth.loginMessage') || 'Join our community to access exclusive analysis and features.'}
                                </Text>
                            </View>

                            <View style={[styles.buttonContainer, styles.desktopButtonContainer]}>
                                <Button
                                    title={t('auth.login') || 'Log In'}
                                    onPress={handleLogin}
                                    variant="primary"
                                    style={styles.desktopButton}
                                />
                                <Button
                                    title={t('auth.register') || 'Create Account'}
                                    onPress={handleRegister}
                                    variant="secondary"
                                    style={styles.desktopButton}
                                />
                            </View>
                        </View>
                    </View>
                ) : (
                    // Mobile: Compact scrollable layout
                    <View style={styles.mobileContainer}>
                        <View style={[
                            styles.mobileCard,
                            {
                                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.8)',
                                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                            }
                        ]}>
                            <TouchableOpacity
                                onPress={handleBack}
                                style={[styles.backButton, { left: isRTL ? undefined : 16, right: isRTL ? 16 : undefined }]}
                            >
                                <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color={theme.text.primary} />
                            </TouchableOpacity>

                            <View style={[styles.mobileIconWrapper, { backgroundColor: theme.primary.main + '15' }]}>
                                <Ionicons name={icon as any} size={32} color={theme.primary.main} />
                            </View>

                            <Text style={[styles.mobileTitle, { color: theme.text.primary }]}>
                                {title || t('auth.loginRequired') || 'Authentication Required'}
                            </Text>

                            <Text style={[styles.mobileMessage, { color: theme.text.secondary }]}>
                                {message || t('auth.loginMessage') || 'Join our community to access exclusive analysis and features.'}
                            </Text>

                            <View style={styles.mobileButtonContainer}>
                                <Button
                                    title={t('auth.login') || 'Log In'}
                                    onPress={handleLogin}
                                    variant="primary"
                                    style={styles.mobileButton}
                                />
                                <Button
                                    title={t('auth.register') || 'Create Account'}
                                    onPress={handleRegister}
                                    variant="secondary"
                                    style={styles.mobileButton}
                                />
                            </View>
                        </View>
                    </View>
                )}
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
        padding: 16,
        alignItems: 'center',
        width: '100%',
    },
    desktopContentWrapper: {
        padding: 40,
    },
    card: {
        width: '100%',
        maxWidth: 500,
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
        borderWidth: 1,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 16,
        elevation: 4,
    },
    desktopCard: {
        maxWidth: 800,
        padding: 64,
        borderRadius: 32,
        shadowOffset: { width: 0, height: 20 },
        shadowRadius: 40,
        elevation: 10,
    },
    iconWrapper: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    textWrapper: {
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: '900',
        textAlign: 'center',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    message: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        maxWidth: 350,
    },
    buttonContainer: {
        width: '100%',
        gap: 10,
    },
    desktopButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        maxWidth: 400,
        gap: 16,
    },
    button: {
        flex: 0,
        width: '100%',
        minWidth: 120,
        height: 48,
    },
    desktopButton: {
        width: 'auto',
        minWidth: 180,
        height: 56,
    },

    // Mobile-specific styles
    mobileContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 20,
    },
    mobileCard: {
        width: '100%',
        maxWidth: 400,
        padding: 24,
        borderRadius: 24,
        alignItems: 'center',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        shadowOpacity: 0.1,
        elevation: 3,
    },
    mobileIconWrapper: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    mobileTitle: {
        fontSize: 20,
        fontWeight: '800',
        textAlign: 'center',
        marginBottom: 8,
        letterSpacing: -0.3,
    },
    mobileMessage: {
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 18,
        marginBottom: 24,
        opacity: 0.8,
    },
    mobileButtonContainer: {
        width: '100%',
        gap: 10,
    },
    mobileButton: {
        width: '100%',
        height: 48,
    },
    backButton: {
        position: 'absolute',
        top: 16,
        // left: 16, // Removed fixed left
        zIndex: 10,
        padding: 8,
        borderRadius: 8,
    },
});
