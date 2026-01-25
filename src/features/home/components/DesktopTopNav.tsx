import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme, useLocalization } from '../../../app/providers';
import { useAuth } from '../../../app/auth';

export const DesktopTopNav: React.FC = () => {
    const { width } = useWindowDimensions();
    const navigation = useNavigation();
    const route = useRoute();
    const { theme, isDark } = useTheme();
    const { t, isRTL } = useLocalization();
    const { state: authState } = useAuth();
    const user = authState.session?.user;
    const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

    const NAV_ITEMS = [
        { id: 'home', labelKey: 'tabs.home', icon: 'home-outline', route: 'HomeTab' },
        { id: 'market', labelKey: 'tabs.market', icon: 'bar-chart-outline', route: 'MarketTab' },
        { id: 'chat', labelKey: 'tabs.chat', icon: 'chatbubbles-outline', route: 'ChatTab' },
        { id: 'profile', labelKey: 'tabs.profile', icon: 'person-outline', route: 'ProfileTab' },
    ];

    if (width < 1024) return null;

    return (
        <View style={[styles.container, {
            backgroundColor: theme.background.primary,
            borderBottomColor: theme.border.main,
            flexDirection: isRTL ? 'row-reverse' : 'row'
        }]}>
            {/* Logo/Brand */}
            <TouchableOpacity
                style={styles.logoContainer}
                onPress={() => navigation.navigate('Main', { screen: 'MainTabs', params: { screen: 'HomeTab' } } as any)}
            >
                <Text style={[styles.logoText, { color: theme.primary.main }]}>ELSAIF</Text>
                <View style={[styles.logoDot, { backgroundColor: theme.primary.main }]} />
            </TouchableOpacity>

            {/* Nav Links */}
            <View style={[styles.navLinks, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                {NAV_ITEMS.map((item) => {
                    // Check if active based on route name OR nested screen name
                    const isActive = route.name === item.route;

                    return (
                        <TouchableOpacity
                            key={item.id}
                            style={[
                                styles.navItem,
                                isActive && { backgroundColor: theme.primary.main + '15' }
                            ]}
                            onPress={() => navigation.navigate('Main', { screen: 'MainTabs', params: { screen: item.route } } as any)}
                        >
                            <Ionicons
                                name={(isActive ? item.icon.replace('-outline', '') : item.icon) as any}
                                size={20}
                                color={isActive ? theme.primary.main : theme.text.tertiary}
                            />
                            <Text style={[
                                styles.navLabel,
                                { color: isActive ? theme.primary.main : theme.text.secondary },
                                isActive && styles.navLabelActive
                            ]}>
                                {t(item.labelKey)}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Right Actions */}
            <View style={[styles.actions, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                {isAdmin && (
                    <TouchableOpacity
                        style={[styles.adminButton, { backgroundColor: theme.background.tertiary }]}
                        onPress={() => navigation.navigate('Main', { screen: 'MainTabs', params: { screen: 'AdminTab' } } as any)}
                    >
                        <Ionicons name="shield-checkmark" size={18} color={theme.primary.main} />
                        <Text style={[styles.adminButtonText, { color: theme.text.primary }]}>
                            {t('tabs.admin')}
                        </Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    style={[styles.iconButton, { backgroundColor: theme.background.tertiary }]}
                    onPress={() => navigation.navigate('Notifications' as any)}
                >
                    <Ionicons name="notifications-outline" size={20} color={theme.text.primary} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.profileButton, { borderColor: theme.border.main }]}
                    onPress={() => navigation.navigate('Main', { screen: 'MainTabs', params: { screen: 'ProfileTab' } } as any)}
                >
                    <View style={[styles.avatarPlaceholder, { backgroundColor: theme.primary.main + '30' }]}>
                        <Text style={[styles.avatarInitial, { color: theme.primary.main }]}>
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 80,
        paddingHorizontal: 32,
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        zIndex: 1000,
        // Glassmorphism effect
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 5,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    logoText: {
        fontSize: 24,
        fontWeight: '900',
        letterSpacing: 2,
    },
    logoDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginTop: 8,
    },
    navLinks: {
        gap: 8,
        height: '100%',
        alignItems: 'center',
    },
    navItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
    },
    navLabel: {
        fontSize: 15,
        fontWeight: '600',
    },
    navLabelActive: {
        fontWeight: '700',
    },
    actions: {
        gap: 16,
        alignItems: 'center',
    },
    adminButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    adminButtonText: {
        fontSize: 14,
        fontWeight: '700',
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileButton: {
        padding: 4,
        borderRadius: 14,
        borderWidth: 1,
    },
    avatarPlaceholder: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitial: {
        fontSize: 16,
        fontWeight: '700',
    },
});
