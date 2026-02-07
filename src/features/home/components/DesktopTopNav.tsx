import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    useWindowDimensions,
    Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useLocalization } from '../../../app/providers';
import { useUser, useIsAdmin } from '../../../app/auth/auth.hooks';
import { spacing } from '../../../core/theme/spacing';

const NAV_ITEMS = [
    { key: 'HomeTab', label: 'tabs.home', icon: 'home-outline' },
    { key: 'MarketTab', label: 'tabs.market', icon: 'trending-up-outline' },
    { key: 'DisclosuresTab', label: 'tabs.disclosures', icon: 'document-text-outline' },
    { key: 'InsightsTab', label: 'tabs.insights', icon: 'analytics-outline' },
    { key: 'ChatTab', label: 'tabs.chat', icon: 'chatbubbles-outline' },
];

export const DesktopTopNav: React.FC = () => {
    const { theme, isDark, toggleTheme } = useTheme();
    const { t, language, toggleLanguage, isRTL } = useLocalization();
    const { width } = useWindowDimensions();
    const navigation = useNavigation<any>();
    const route = useRoute();
    const isAdmin = useIsAdmin();
    const user = useUser();

    if (width < 1024) return null;

    const getInitials = () => {
        if (!user || !user.name) return 'U';
        const names = user.name.split(' ');
        if (names.length >= 2) {
            return (names[0][0] + names[1][0]).toUpperCase();
        }
        return names[0][0].toUpperCase();
    };

    return (
        <View style={[styles.container, {
            backgroundColor: theme.background.primary,
            borderBottomColor: theme.border.main,
            flexDirection: isRTL ? 'row-reverse' : 'row'
        }]}>
            {/* Logo Section */}
            <TouchableOpacity
                style={styles.logoContainer}
                onPress={() => navigation.navigate('MainTabs', { screen: 'HomeTab' })}
            >
                <Image
                    source={require('../../../../assets/logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Text style={[styles.logoText, { color: theme.text.primary }]}>{t('common.appName')}</Text>
                <View style={[styles.premiumBadge, { backgroundColor: `${theme.primary.main}15` }]}>
                    <Text style={[styles.premiumBadgeText, { color: theme.primary.main }]}>PRO</Text>
                </View>
            </TouchableOpacity>

            {/* Navigation Links */}
            <View style={[styles.navLinks, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                {NAV_ITEMS.map((item) => {
                    const isActive = route.name.includes(item.key.replace('Tab', ''));
                    return (
                        <TouchableOpacity
                            key={item.key}
                            onPress={() => navigation.navigate('MainTabs', { screen: item.key })}
                        >
                            <Text style={[
                                styles.navItemText,
                                { color: isActive ? theme.primary.main : theme.text.secondary }
                            ]}>
                                {t(item.label)}
                            </Text>
                            {isActive && <View style={[styles.activeIndicator, { backgroundColor: theme.primary.main }]} />}
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Actions Section */}
            <View style={[styles.actions, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                {/* Language Toggle */}
                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: theme.background.secondary }]}
                    onPress={toggleLanguage}
                >
                    <Text style={[styles.actionBtnText, { color: theme.text.primary }]}>
                        {language === 'ar' ? 'EN' : 'AR'}
                    </Text>
                </TouchableOpacity>

                {/* Theme Toggle */}
                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: theme.background.secondary }]}
                    onPress={toggleTheme}
                >
                    <Ionicons
                        name={isDark ? "sunny-outline" : "moon-outline"}
                        size={20}
                        color={theme.text.primary}
                    />
                </TouchableOpacity>

                {/* Notifications */}
                <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: theme.background.secondary }]}
                    onPress={() => navigation.navigate('Notifications')}
                >
                    <Ionicons name="notifications-outline" size={20} color={theme.text.primary} />
                    <View style={[styles.badge, { backgroundColor: theme.semantic.negative }]} />
                </TouchableOpacity>

                {/* Admin */}
                {isAdmin && (
                    <TouchableOpacity
                        style={[styles.adminBtn, { backgroundColor: theme.primary.main }]}
                        onPress={() => navigation.navigate('MainTabs', { screen: 'AdminTab' })}
                    >
                        <Ionicons name="shield-checkmark" size={18} color="#FFF" />
                        <Text style={styles.adminBtnText}>Admin</Text>
                    </TouchableOpacity>
                )}

                {/* Profile */}
                <TouchableOpacity
                    style={styles.profileAvatar}
                    onPress={() => navigation.navigate('MainTabs', { screen: 'ProfileTab' })}
                >
                    <View style={[styles.avatarCircle, { backgroundColor: theme.primary.main }]}>
                        <Text style={styles.initialsText}>{getInitials()}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 88,
        paddingHorizontal: spacing['3xl'],
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        zIndex: 100,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 2,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    logo: {
        width: 44,
        height: 44,
    },
    logoText: {
        fontSize: 26,
        fontWeight: '900',
        letterSpacing: 2,
    },
    premiumBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: 8,
    },
    premiumBadgeText: {
        fontSize: 12,
        fontWeight: '900',
    },
    navLinks: {
        flexDirection: 'row',
        gap: spacing['3xl'],
        position: 'absolute',
        left: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        pointerEvents: 'box-none',
    },
    navItem: {
        height: '100%',
        justifyContent: 'center',
        position: 'relative',
    },
    navItemText: {
        fontSize: 16,
        fontWeight: '700',
    },
    activeIndicator: {
        position: 'absolute',
        bottom: 0,
        left: 10,
        right: 10,
        height: 4,
        borderTopLeftRadius: 4,
        borderTopRightRadius: 4,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    actionBtn: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.03)',
    },
    actionBtnText: {
        fontSize: 15,
        fontWeight: '800',
    },
    badge: {
        position: 'absolute',
        top: 14,
        right: 14,
        width: 10,
        height: 10,
        borderRadius: 5,
        borderWidth: 2,
        borderColor: '#FFF',
    },
    adminBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        paddingVertical: 14,
        borderRadius: 18,
        gap: spacing.sm,
        marginLeft: spacing.sm,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    adminBtnText: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '800',
    },
    profileAvatar: {
        marginLeft: spacing.sm,
    },
    avatarCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 4,
    },
    initialsText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
});
