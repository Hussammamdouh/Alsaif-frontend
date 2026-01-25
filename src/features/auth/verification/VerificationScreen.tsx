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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { Button, ThemeLanguageToggle, ResponsiveContainer } from '../../../shared/components';
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

    const { width } = useWindowDimensions();
    const isDesktop = width > 768;

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
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
            Alert.alert('Error', 'Please enter a valid 6-digit code');
            return;
        }

        setIsLoading(true);
        try {
            await verifyAccount(userId, code);
            Alert.alert('Success', 'Account verified successfully!', [
                { text: 'OK', onPress: onVerificationSuccess },
            ]);
        } catch (error: any) {
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
                <View style={{
                    position: 'absolute',
                    top: 24,
                    right: 24,
                    zIndex: 10,
                }}>
                    <ThemeLanguageToggle />
                </View>
            )}
            <SafeAreaView style={styles.content} edges={['top', 'bottom']}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    {!isDesktop && (
                        <View style={styles.header}>
                            <TouchableOpacity onPress={onBackToLogin} style={styles.backButton}>
                                <Icon name="arrow-back" size={24} color={theme.text.primary} />
                            </TouchableOpacity>
                            <ThemeLanguageToggle />
                        </View>
                    )}

                    <View style={isDesktop ? [styles.desktopWrapper, { flex: 0, minHeight: '100%', paddingVertical: 20 }] : null}>
                        <ResponsiveContainer maxWidth={isDesktop ? 1200 : 480}>
                            <View style={isDesktop ? [styles.loginCard, { backgroundColor: theme.ui.card, borderColor: theme.ui.border, alignSelf: 'center' }] : null}>
                                <Animated.View style={[styles.main, { flex: 0, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                                    <View style={[styles.iconContainer, isDesktop && { marginBottom: 16 }]}>
                                        <Icon name="mail-open-outline" size={isDesktop ? 48 : 60} color={theme.primary.main} />
                                    </View>

                                    <Text style={[styles.title, { color: theme.text.primary }]}>Verify Your Email</Text>
                                    <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
                                        We've sent a 6-digit verification code to
                                        {"\n"}
                                        <Text style={{ fontWeight: 'bold', color: theme.text.primary }}>{email}</Text>
                                    </Text>

                                    <View style={styles.inputContainer}>
                                        <TextInput
                                            style={[styles.codeInput, {
                                                color: theme.text.primary,
                                                borderColor: theme.ui.border,
                                                backgroundColor: theme.ui.card,
                                                letterSpacing: 10
                                            }]}
                                            value={code}
                                            onChangeText={setCode}
                                            placeholder="000000"
                                            placeholderTextColor={theme.text.tertiary}
                                            keyboardType="number-pad"
                                            maxLength={6}
                                            autoFocus
                                            textAlign="center"
                                        />
                                    </View>

                                    <Button
                                        title="Verify Account"
                                        onPress={handleVerify}
                                        loading={isLoading}
                                        style={styles.verifyButton}
                                    />

                                    <View style={styles.resendContainer}>
                                        <Text style={[styles.resendText, { color: theme.text.secondary }]}>
                                            Didn't receive the code?
                                        </Text>
                                        <TouchableOpacity onPress={handleResend} disabled={!canResend}>
                                            <Text style={[
                                                styles.resendLink,
                                                { color: canResend ? theme.primary.main : theme.text.tertiary }
                                            ]}>
                                                {canResend ? 'Resend Code' : `Resend in ${resendTimer}s`}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </Animated.View>
                            </View>
                        </ResponsiveContainer>
                    </View>
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
    desktopWrapper: {
        flex: 1,
        justifyContent: 'center',
        paddingVertical: 40,
    },
    loginCard: {
        borderRadius: 24,
        padding: 32,
        width: '100%',
        maxWidth: 580,
        alignSelf: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
        borderWidth: 1,
        borderColor: '#333',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 10,
        alignItems: 'center'
    },
    backButton: {
        padding: 8,
    },
    main: {
        paddingHorizontal: 30,
        alignItems: 'center',
        paddingTop: 20, // Reduced from 40
    },
    iconContainer: {
        marginBottom: 20, // Reduced from 30
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
        marginBottom: 20, // Further reduced
    },
    inputContainer: {
        width: '100%',
        marginBottom: 16, // Further reduced
    },
    codeInput: {
        height: 60,
        borderRadius: 12,
        borderWidth: 1,
        fontSize: 32,
        fontWeight: 'bold',
    },
    verifyButton: {
        width: '100%',
        height: 56,
        borderRadius: 16,
    },
    resendContainer: {
        marginTop: 30,
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
});
