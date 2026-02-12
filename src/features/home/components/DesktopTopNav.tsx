import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    useWindowDimensions,
    Image,
    Animated,
    Pressable,
} from 'react-native';
import { useNavigation, useRoute, useNavigationState } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useLocalization } from '../../../app/providers';
import { useUser, useIsAdmin, useIsAuthenticated } from '../../../app/auth/auth.hooks';
import { spacing } from '../../../core/theme/spacing';

const NAV_ITEMS = [
    { key: 'HomeTab', label: 'tabs.home', icon: 'home-outline' },
    { key: 'MarketTab', label: 'tabs.market', icon: 'trending-up-outline' },
    { key: 'DisclosuresTab', label: 'tabs.disclosures', icon: 'document-text-outline' },
    { key: 'InsightsTab', label: 'tabs.insights', icon: 'analytics-outline' },
    { key: 'ChatTab', label: 'tabs.chat', icon: 'chatbubbles-outline' },
];

/**
 * Animated Nav Item Component with Lift and Highlight
 */
const NavItem: React.FC<{
    item: typeof NAV_ITEMS[0];
    isActive: boolean;
    onPress: () => void;
    theme: any;
    t: any;
}> = ({ item, isActive, onPress, theme, t }) => {
    const hoverAnim = React.useRef(new Animated.Value(0)).current;
    const activeAnim = React.useRef(new Animated.Value(isActive ? 1 : 0)).current;

    React.useEffect(() => {
        Animated.spring(activeAnim, {
            toValue: isActive ? 1 : 0,
            useNativeDriver: false,
            friction: 8,
            tension: 40,
        }).start();
    }, [isActive]);

    const onHoverIn = () => {
        Animated.spring(hoverAnim, {
            toValue: 1,
            useNativeDriver: true,
            friction: 4,
        }).start();
    };

    const onHoverOut = () => {
        Animated.spring(hoverAnim, {
            toValue: 0,
            useNativeDriver: true,
            friction: 4,
        }).start();
    };

    const translateY = hoverAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -4],
    });

    const scale = hoverAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.05],
    });

    return (
        <Pressable
            onPress={onPress}
            onPointerEnter={onHoverIn}
            onPointerLeave={onHoverOut}
            style={styles.navItemWrapper}
        >
            <Animated.View style={[
                styles.navItemPill,
                {
                    backgroundColor: activeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['transparent', `${theme.primary.main}15`],
                    }),
                    transform: [{ translateY }, { scale }]
                }
            ]}>
                <Text style={[
                    styles.navItemText,
                    {
                        color: isActive ? theme.primary.main : theme.text.secondary,
                        fontWeight: isActive ? '900' : '700',
                    }
                ]}>
                    {t(item.label)}
                </Text>
                <Animated.View
                    style={[
                        styles.activeIndicator,
                        {
                            backgroundColor: theme.primary.main,
                            width: activeAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: ['0%', '100%'],
                            }),
                            opacity: activeAnim,
                            height: 4,
                        }
                    ]}
                />
            </Animated.View>
        </Pressable>
    );
};

export const DesktopTopNav: React.FC = () => {
    const { theme, isDark, toggleTheme } = useTheme();
    const { t, language, toggleLanguage, isRTL } = useLocalization();
    const { width } = useWindowDimensions();
    const navigation = useNavigation<any>();
    const isAdmin = useIsAdmin();
    const user = useUser();
    const isAuthenticated = useIsAuthenticated();

    // Enhanced Active Route Detection
    const activeRouteName = useNavigationState(state => {
        if (!state || typeof state.index !== 'number') return null;
        let route = state.routes[state.index as number];
        while (route && route.state && typeof route.state.index === 'number') {
            route = (route.state as any).routes[route.state.index as number];
        }
        return route?.name;
    });

    // Animations
    const entryAnim = React.useRef(new Animated.Value(0)).current;
    const themeRotate = React.useRef(new Animated.Value(0)).current;
    const pulseAnim = React.useRef(new Animated.Value(1)).current;

    React.useEffect(() => {
        // Entrance
        Animated.spring(entryAnim, {
            toValue: 1,
            useNativeDriver: true,
            friction: 7,
            tension: 40,
        }).start();

        // Notification Pulse
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.2,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    // Rotate theme icon on change
    React.useEffect(() => {
        Animated.spring(themeRotate, {
            toValue: isDark ? 1 : 0,
            useNativeDriver: true,
            friction: 5,
        }).start();
    }, [isDark]);

    if (width < 1024) return null;

    const getInitials = () => {
        if (!user || !user.name) return 'U';
        const names = user.name.split(' ');
        if (names.length >= 2) {
            return (names[0][0] + names[1][0]).toUpperCase();
        }
        return names[0][0].toUpperCase();
    };

    const renderLogo = () => (
        <TouchableOpacity
            style={[styles.logoContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
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
    );

    const renderActions = () => (
        <View style={[styles.actions, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            {/* Language Toggle */}
            <TouchableOpacity
                style={[styles.langToggle, { borderColor: theme.text.primary + '30' }]}
                onPress={toggleLanguage}
            >
                <Text style={[styles.langToggleText, { color: theme.text.primary }]}>
                    {language === 'ar' ? 'EN' : 'AR'}
                </Text>
            </TouchableOpacity>

            {/* Theme Toggle */}
            <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: theme.background.secondary + '60' }]}
                onPress={toggleTheme}
            >
                <Animated.View style={{
                    transform: [{
                        rotate: themeRotate.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '180deg'],
                        })
                    }]
                }}>
                    <Ionicons
                        name={isDark ? "sunny-outline" : "moon-outline"}
                        size={20}
                        color={theme.text.primary}
                    />
                </Animated.View>
            </TouchableOpacity>

            {/* Notifications */}
            <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: theme.background.secondary + '60' }]}
                onPress={() => navigation.navigate('Notifications')}
            >
                <Ionicons name="notifications-outline" size={20} color={theme.text.primary} />
                <Animated.View style={[
                    styles.badge,
                    {
                        backgroundColor: theme.semantic.negative,
                        transform: [{ scale: pulseAnim }]
                    }
                ]} />
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
                {isAuthenticated ? (
                    <View style={[styles.avatarCircle, { backgroundColor: theme.primary.main }]}>
                        <Text style={styles.initialsText}>{getInitials()}</Text>
                    </View>
                ) : (
                    <View style={[styles.avatarCircle, { backgroundColor: theme.background.tertiary }]}>
                        <Ionicons name="person-circle-outline" size={24} color={theme.text.tertiary} />
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );

    return (
        <Animated.View style={[
            styles.container,
            {
                backgroundColor: theme.background.primary,
                borderBottomColor: theme.border.main,
                flexDirection: isRTL ? 'row-reverse' : 'row',
                transform: [{
                    translateY: entryAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-88, 0],
                    })
                }],
                opacity: entryAnim,
            }
        ]}>
            <View style={[styles.contentLayout, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                {renderLogo()}

                {/* Navigation Links */}
                <View style={[styles.navLinks, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    {NAV_ITEMS.map((item) => {
                        const isActive = activeRouteName?.includes(item.key.replace('Tab', ''));
                        return (
                            <NavItem
                                key={item.key}
                                item={item}
                                isActive={!!isActive}
                                onPress={() => navigation.navigate('MainTabs', { screen: item.key })}
                                theme={theme}
                                t={t}
                            />
                        );
                    })}
                </View>

                {renderActions()}
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 88,
        paddingHorizontal: spacing['3xl'],
        borderBottomWidth: 1,
        zIndex: 1000,
    },
    contentLayout: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    logo: {
        width: 34,
        height: 34,
    },
    logoText: {
        fontSize: 22,
        fontWeight: '900',
        letterSpacing: -0.5,
    },
    premiumBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        marginLeft: 4,
    },
    premiumBadgeText: {
        fontSize: 10,
        fontWeight: '900',
    },
    navLinks: {
        flexDirection: 'row',
        gap: spacing.md,
        position: 'absolute',
        left: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        pointerEvents: 'box-none',
    },
    navItemWrapper: {
        height: '100%',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    navItemPill: {
        paddingHorizontal: spacing.lg,
        paddingVertical: 10,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    navItemText: {
        fontSize: 15,
        fontWeight: '700',
    },
    activeIndicator: {
        position: 'absolute',
        bottom: -6,
        alignSelf: 'center',
        borderRadius: 2,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    actionBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    langToggle: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 56,
    },
    langToggleText: {
        fontSize: 13,
        fontWeight: '800',
    },
    badge: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 8,
        height: 8,
        borderRadius: 4,
        borderWidth: 1.5,
        borderColor: '#FFF',
    },
    adminBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: 10,
        borderRadius: 14,
        gap: spacing.xs,
    },
    adminBtnText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '800',
    },
    profileAvatar: {
        marginLeft: spacing.xs,
    },
    avatarCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    initialsText: {
        color: '#FFF',
        fontSize: 15,
        fontWeight: '800',
    },
});
