/**
 * Verification Screen
 * Premium screen for entering the 6-digit verification code
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
    TextInput,
    Animated,
    Easing,
    useWindowDimensions,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { Button, ThemeLanguageToggle, ResponsiveContainer, CodeInput } from '../../../shared/components';
import { useTheme, useLocalization } from '../../../app/providers';
import { useAuth } from '../../../app/auth';

interface VerificationScreenProps {
    userId: string;
    email: string;
    onVerificationSuccess: () => void;
    onBackToLogin: () => void;
}

export const VerificationScreen: React.FC<VerificationScreenProps> = ({
    userId,
    email,
    onVerificationSuccess,
    onBackToLogin,
}) => {
    const { theme } = useTheme();
    const { t, isRTL } = useLocalization();
    const { verifyAccount, resendVerificationCode } = useAuth();

    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [hasError, setHasError] = useState(false);

    const { width } = useWindowDimensions();
    const isDesktop = width > 768;

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        } else {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    const handleVerify = async () => {
        if (code.length !== 6) {
            setHasError(true);
            setTimeout(() => setHasError(false), 500);
            return;
        }

        setIsLoading(true);
        try {
            await verifyAccount(userId, code);
            onVerificationSuccess();
        } catch (error: any) {
            setHasError(true);
            Alert.alert('Verification Failed', error.message || 'Invalid code');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (!canResend) return;

        try {
            await resendVerificationCode(userId);
            setResendTimer(60);
            setCanResend(false);
            Alert.alert('Code Sent', 'A new verification code has been sent to your email.');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to resend code');
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
            {isDesktop && (
                <View style={[styles.absoluteToggles, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <ThemeLanguageToggle />
                </View>
            )}
            <SafeAreaView style={styles.content} edges={['top', 'bottom']}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
                >
                    {!isDesktop && (
                        <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                            <TouchableOpacity onPress={onBackToLogin} style={styles.backButton}>
                                <Icon name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color={theme.text.primary} />
                            </TouchableOpacity>
                            <ThemeLanguageToggle />
                        </View>
                    )}

                    <ScrollView
                        contentContainerStyle={[
                            styles.scrollContent,
                            isDesktop && styles.desktopScrollContent
                        ]}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <ResponsiveContainer maxWidth={isDesktop ? 1200 : 480}>
                            <View style={isDesktop ? [styles.loginCard, { backgroundColor: theme.ui.card, borderColor: theme.ui.border }] : null}>
                                <Animated.View style={[
                                    styles.main,
                                    {
                                        opacity: fadeAnim,
                                        transform: [{ translateY: slideAnim }]
                                    }
                                ]}>
                                    <View style={[styles.iconContainer, { backgroundColor: `${theme.primary.main}15` }]}>
                                        <Icon name="mail-unread-outline" size={40} color={theme.primary.main} />
                                    </View>

                                    <Text style={[styles.title, { color: theme.text.primary }]}>
                                        {t('register.verifyTitle') || 'Verify Your Email'}
                                    </Text>
                                    <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
                                        {t('register.verifySubtitle') || "We've sent a 6-digit verification code to"}
                                        {"\n"}
                                        <Text style={{ fontWeight: 'bold', color: theme.primary.main }}>{email}</Text>
                                    </Text>

                                    <View style={styles.inputSection}>
                                        <CodeInput
                                            value={code}
                                            onChangeText={(text) => {
                                                setCode(text);
                                                if (hasError) setHasError(false);
                                            }}
                                            error={hasError}
                                        />
                                        <Text style={[styles.codeHelper, { color: theme.text.tertiary }]}>
                                            {t('register.enterCode') || 'Enter the 6-digit code to continue'}
                                        </Text>
                                    </View>

                                    <Button
                                        title={t('register.verifyButton') || "Verify Account"}
                                        onPress={handleVerify}
                                        loading={isLoading}
                                        disabled={code.length !== 6 || isLoading}
                                        style={styles.verifyButton}
                                    />

                                    <View style={styles.resendContainer}>
                                        <Text style={[styles.resendText, { color: theme.text.secondary }]}>
                                            {t('register.noCode') || "Didn't receive the code?"}
                                        </Text>
                                        <TouchableOpacity onPress={handleResend} disabled={!canResend}>
                                            <Text style={[
                                                styles.resendLink,
                                                { color: canResend ? theme.primary.main : theme.text.tertiary }
                                            ]}>
                                                {canResend
                                                    ? (t('register.resendLink') || 'Resend Code')
                                                    : `${t('register.resendIn') || 'Resend in'} ${resendTimer}s`}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>

                                    {isDesktop && (
                                        <TouchableOpacity
                                            onPress={onBackToLogin}
                                            style={styles.desktopBackButton}
                                        >
                                            <Text style={{ color: theme.text.secondary }}>
                                                {t('common.backToLogin') || 'Back to Login'}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </Animated.View>
                            </View>
                        </ResponsiveContainer>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
    absoluteToggles: {
        position: 'absolute',
        top: 24,
        right: 24,
        zIndex: 10,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 20,
    },
    desktopScrollContent: {
        justifyContent: 'center',
        paddingVertical: 40,
    },
    loginCard: {
        borderRadius: 24,
        padding: 40,
        width: '100%',
        maxWidth: 500,
        alignSelf: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 5,
        borderWidth: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 10,
        alignItems: 'center'
    },
    backButton: {
        padding: 8,
    },
    main: {
        alignItems: 'center',
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    inputSection: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 32,
    },
    codeHelper: {
        fontSize: 13,
        marginTop: 8,
    },
    verifyButton: {
        width: '100%',
        height: 56,
        borderRadius: 16,
    },
    resendContainer: {
        marginTop: 32,
        alignItems: 'center',
    },
    resendText: {
        fontSize: 14,
        marginBottom: 8,
    },
    resendLink: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    desktopBackButton: {
        marginTop: 24,
        padding: 8,
    }
});

