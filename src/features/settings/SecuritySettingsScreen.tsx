/**
 * Security Settings Screen
 * Manage active sessions and account security
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
    Animated,
    useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useTheme, useLocalization } from '../../app/providers';
import { Button, ResponsiveContainer } from '../../shared/components';
import * as SettingsService from '../../core/services/settings/settingsService';
import { useAuth } from '../../app/auth';
import { ActiveSession } from '../settings/settings.types';
import { SettingsLayout, SettingsTab } from './SettingsLayout';

interface SecuritySettingsScreenProps {
    onNavigateBack: () => void;
    onNavigateToSettings: () => void;
    onNavigateToSubscription?: (isPremium: boolean) => void;
}

export const SecuritySettingsScreen: React.FC<SecuritySettingsScreenProps> = ({
    onNavigateBack,
    onNavigateToSettings,
    onNavigateToSubscription,
}) => {
    const { theme } = useTheme();
    const { t, isRTL } = useLocalization();
    const { logout: authLogout } = useAuth();
    const { width } = useWindowDimensions();
    const navigation = useNavigation<any>();
    const isDesktop = width >= 1024;

    const [sessions, setSessions] = useState<ActiveSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [revokingId, setRevokingId] = useState<string | null>(null);

    // Animation values
    const [headerOpacity] = useState(new Animated.Value(0));
    const [headerTranslateY] = useState(new Animated.Value(-20));

    useEffect(() => {
        Animated.parallel([
            Animated.timing(headerOpacity, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.timing(headerTranslateY, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const fetchSessions = useCallback(async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const sessions = await SettingsService.getActiveSessions();
            setSessions(sessions);
        } catch (error) {
            console.error('[SecuritySettings] Failed to fetch sessions:', error);
            Alert.alert('Error', 'Failed to load active sessions');
        } finally {
            if (showLoading) setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchSessions(false);
    }, [fetchSessions]);

    /**
     * Handle sidebar tab change for Desktop
     */
    const handleTabChange = useCallback((tab: SettingsTab) => {
        switch (tab) {
            case 'profile':
                navigation.navigate('Main', { screen: 'MainTabs', params: { screen: 'ProfileTab' } });
                break;
            case 'preferences':
                onNavigateToSettings();
                break;
            case 'security':
                // Already on security
                break;
            case 'subscription':
                // We don't have subscription info here, but we can try to navigate if we had it
                // For now, just navigate to settings where subscription management usually lives
                onNavigateToSettings();
                break;
            case 'terms':
                navigation.navigate('Main', { screen: 'Terms' });
                break;
            case 'about':
                navigation.navigate('Main', { screen: 'About' });
                break;
        }
    }, [onNavigateToSettings, navigation]);

    const handleRevokeSession = async (sessionId: string) => {
        Alert.alert(
            'Revoke Session',
            'Are you sure you want to log out of this device?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Log Out',
                    style: 'destructive',
                    onPress: async () => {
                        setRevokingId(sessionId);
                        try {
                            await SettingsService.revokeSession(sessionId);
                            setSessions(prev => prev.filter(s => s.id !== sessionId));
                        } catch (error) {
                            Alert.alert('Error', 'Failed to revoke session');
                        } finally {
                            setRevokingId(null);
                        }
                    },
                },
            ]
        );
    };

    const handleLogoutAll = () => {
        Alert.alert(
            'Logout from All Devices',
            'This will log you out of all current sessions except this one. Continue?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout All',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await SettingsService.logoutAllDevices();
                            onNavigateBack();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to logout from all devices');
                        }
                    },
                },
            ]
        );
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    const parseUserAgent = (ua: string) => {
        if (!ua) return 'Unknown Device';
        if (ua.includes('iPhone')) return 'iPhone';
        if (ua.includes('Android')) return 'Android Device';
        if (ua.includes('Windows')) return 'Windows PC';
        if (ua.includes('Macintosh')) return 'Mac';
        return ua.split('(')[0].trim() || 'Other Device';
    };

    const renderSessionItem = (session: ActiveSession) => (
        <View
            key={session.id}
            style={[styles.sessionCard, { backgroundColor: theme.ui.card, borderColor: theme.ui.border }, isDesktop && { padding: 12, borderRadius: 16 }]}
        >
            <View style={styles.sessionInfo}>
                <View style={[styles.iconContainer, { backgroundColor: `${theme.primary.main}15` }, isDesktop && { width: 40, height: 40 }]}>
                    <Icon
                        name={session.deviceInfo.userAgent.includes('Mobi') ? 'phone-portrait-outline' : 'desktop-outline'}
                        size={isDesktop ? 20 : 24}
                        color={theme.primary.main}
                    />
                </View>
                <View style={styles.textContainer}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={[styles.deviceText, { color: theme.text.primary }, isDesktop && { fontSize: 14 }]}>
                            {parseUserAgent(session.deviceInfo.userAgent)}
                        </Text>
                        {session.isCurrent && (
                            <View style={{ backgroundColor: theme.primary.main + '20', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 8 }}>
                                <Text style={{ fontSize: 10, color: theme.primary.main, fontWeight: 'bold' }}>CURRENT</Text>
                            </View>
                        )}
                    </View>
                    <Text style={[styles.ipText, { color: theme.text.secondary }, isDesktop && { fontSize: 11 }]}>
                        IP: {session.ip}
                    </Text>
                    <Text style={[styles.dateText, { color: theme.text.tertiary }, isDesktop && { fontSize: 10 }]}>
                        Last active: {formatDate(session.lastUsedAt)}
                    </Text>
                </View>
            </View>
            {!session.isCurrent && (
                <TouchableOpacity
                    onPress={() => handleRevokeSession(session.id)}
                    disabled={revokingId === session.id}
                    style={styles.revokeButton}
                >
                    {revokingId === session.id ? (
                        <ActivityIndicator size="small" color={theme.accent.error} />
                    ) : (
                        <Icon name="log-out-outline" size={20} color={theme.accent.error} />
                    )}
                </TouchableOpacity>
            )}
        </View>
    );

    const renderSecurityContent = () => (
        <View style={isDesktop ? { width: '100%' } : null}>
            <View style={isDesktop ? { padding: 40, alignItems: 'center' } : null}>
                <ResponsiveContainer maxWidth={isDesktop ? 800 : undefined}>
                    <View style={isDesktop ? {
                        backgroundColor: theme.ui.card,
                        borderRadius: 24,
                        padding: 32,
                        borderWidth: 1,
                        borderColor: theme.ui.border,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.1,
                        shadowRadius: 12,
                        elevation: 5,
                    } : null}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Active Sessions</Text>
                            <Text style={[styles.sectionSubtitle, { color: theme.text.secondary }]}>
                                These devices are currently logged into your account.
                            </Text>
                        </View>

                        {loading ? (
                            <ActivityIndicator style={{ marginTop: 40 }} color={theme.primary.main} />
                        ) : sessions.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Icon name="shield-outline" size={64} color={theme.ui.border} />
                                <Text style={[styles.emptyText, { color: theme.text.secondary }]}>No other active sessions found.</Text>
                            </View>
                        ) : (
                            <View style={styles.sessionsList}>
                                {sessions.map(renderSessionItem)}
                            </View>
                        )}

                        <View style={styles.dangerZone}>
                            <Text style={[styles.dangerTitle, { color: theme.accent.error }]}>Danger Zone</Text>
                            <TouchableOpacity
                                onPress={handleLogoutAll}
                                style={[styles.logoutAllButton, { borderColor: theme.accent.error }]}
                            >
                                <Icon name="power-outline" size={20} color={theme.accent.error} />
                                <Text style={[styles.logoutAllText, { color: theme.accent.error }]}>Logout All Other Devices</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.infoBox}>
                            <Icon name="information-circle-outline" size={20} color={theme.text.tertiary} />
                            <Text style={[styles.infoText, { color: theme.text.tertiary }]}>
                                If you see any suspicious activity, we recommend changing your password and logging out of all devices.
                            </Text>
                        </View>
                    </View>
                </ResponsiveContainer>
            </View>
        </View>
    );

    if (isDesktop) {
        return (
            <SettingsLayout
                activeTab="security"
                onTabChange={handleTabChange}
                onLogout={authLogout}
            >
                {renderSecurityContent()}
            </SettingsLayout>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <View style={[styles.header, { borderBottomColor: theme.ui.border }]}>
                    <TouchableOpacity onPress={onNavigateBack} style={styles.backButton}>
                        <Icon name={isRTL ? 'chevron-forward' : 'chevron-back'} size={24} color={theme.text.primary} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: theme.text.primary }]}>Security & Sessions</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView
                    style={styles.content}
                    contentContainerStyle={isDesktop && { flexGrow: 1, justifyContent: 'center' }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    {renderSecurityContent()}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    sectionHeader: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 14,
    },
    sessionsList: {
        gap: 12,
    },
    sessionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    sessionInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    textContainer: {
        flex: 1,
    },
    deviceText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    ipText: {
        fontSize: 12,
        marginTop: 2,
    },
    dateText: {
        fontSize: 11,
        marginTop: 2,
    },
    revokeButton: {
        padding: 8,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
    },
    dangerZone: {
        marginTop: 32,
        paddingTop: 24,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    dangerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    logoutAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        gap: 8,
    },
    logoutAllText: {
        fontWeight: 'bold',
    },
    infoBox: {
        flexDirection: 'row',
        padding: 16,
        marginTop: 24,
        marginBottom: 40,
        backgroundColor: '#f8f8f8',
        borderRadius: 12,
        gap: 12,
    },
    infoText: {
        flex: 1,
        fontSize: 12,
        lineHeight: 18,
    },
});
