import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useLocalization } from '../../app/providers/LocalizationProvider';
import { useTheme } from '../../app/providers/ThemeProvider';
import { formatDateSafe } from '../../shared/utils/dateUtils';
import { SettingsLayout, SettingsTab } from '../settings/SettingsLayout';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../app/auth';
import { useProfile } from '../profile/profile.hooks';

const { width } = Dimensions.get('window');

interface TermsScreenProps {
    route?: any;
    onNavigateBack: () => void;
}

export const TermsScreen: React.FC<TermsScreenProps> = ({ route, onNavigateBack }) => {
    const { t, isRTL } = useLocalization();
    const { theme, isDark } = useTheme();
    const navigation = useNavigation<any>();
    const { width } = Dimensions.get('window');
    const isDesktop = width >= 768;
    const { state: authState } = useAuth();
    const { subscription } = useProfile();
    const isAdmin = authState.session?.user?.role === 'admin' || authState.session?.user?.role === 'superadmin';

    const initialTab = route?.params?.tab || 'privacy';
    const [activePolicyTab, setActivePolicyTab] = React.useState<'privacy' | 'terms'>(initialTab);

    React.useEffect(() => {
        if (route?.params?.tab) {
            setActivePolicyTab(route.params.tab);
        }
    }, [route?.params?.tab]);

    const handleTabChange = React.useCallback((tab: SettingsTab) => {
        switch (tab) {
            case 'profile':
                navigation.navigate('Main', { screen: 'MainTabs', params: { screen: 'ProfileTab' } });
                break;
            case 'preferences':
                navigation.navigate('Main', { screen: 'Settings' });
                break;
            case 'security':
                navigation.navigate('Main', { screen: 'Security' });
                break;
            case 'subscription':
                if (isAdmin) return;
                const isSubscribed = subscription?.tier === 'premium' && subscription?.status === 'active';
                navigation.navigate('Main', { screen: isSubscribed ? 'Subscription' : 'Paywall' });
                break;
            case 'terms':
                // Already here
                break;
            case 'about':
                navigation.navigate('Main', { screen: 'About' });
                break;
        }
    }, [navigation, isAdmin, subscription]);

    const renderSection = (titleKey: string, contentKey: string | string[]) => {
        return (
            <View style={styles.sectionContainer}>
                <Text style={[styles.sectionTitle, { color: theme.primary.main, textAlign: isRTL ? 'right' : 'left' }]}>
                    {t(titleKey)}
                </Text>
                {Array.isArray(contentKey) ? (
                    contentKey.map((key, index) => (
                        <View key={index} style={[styles.listBullet, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                            <View style={[styles.bullet, { backgroundColor: theme.primary.main, marginRight: isRTL ? 0 : 12, marginLeft: isRTL ? 12 : 4 }]} />
                            <View style={{ flex: 1 }}>
                                <Text style={[styles.sectionContent, { color: theme.text.secondary, textAlign: isRTL ? 'right' : 'left' }]}>
                                    {t(key)}
                                </Text>
                            </View>
                        </View>
                    ))
                ) : (
                    <Text style={[styles.sectionContent, { color: theme.text.secondary, textAlign: isRTL ? 'right' : 'left' }]}>
                        {t(contentKey)}
                    </Text>
                )}
            </View>
        );
    };

    const ContentWrapper = isDesktop ? View : ScrollView;
    const wrapperProps = isDesktop ? { style: styles.content } : { style: styles.content, contentContainerStyle: styles.scrollContent, showsVerticalScrollIndicator: false };

    const content = (
        <ContentWrapper {...wrapperProps}>
            {/* Hero Card */}
            <View
                style={[
                    styles.heroCard,
                    {
                        borderColor: theme.border.main,
                        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'
                    }
                ]}
            >
                <LinearGradient
                    colors={[theme.primary.main + '20', theme.primary.main + '05']}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
                <View style={styles.heroHeader}>
                    <View style={[styles.iconContainer, { backgroundColor: theme.primary.main + '20' }]}>
                        <Ionicons name="document-text-outline" size={32} color={theme.primary.main} />
                    </View>
                    <Text style={[styles.heroTitle, { color: theme.text.primary, textAlign: isRTL ? 'right' : 'left' }]}>
                        {activePolicyTab === 'privacy' ? t('legal.privacy.header') : t('legal.terms.header')}
                    </Text>
                </View>
                <Text style={[styles.heroSubtitle, { color: theme.text.tertiary, textAlign: isRTL ? 'right' : 'left' }]}>
                    {t('settings.version')} 1.0.0 • {formatDateSafe(new Date(), isRTL ? 'ar' : 'en', { month: 'long', year: 'numeric' })}
                </Text>
            </View>

            {/* Tab Selector */}
            <View style={[styles.tabContainer, { backgroundColor: theme.background.secondary, borderColor: theme.border.main }]}>
                <TouchableOpacity
                    style={[
                        styles.tabButton,
                        activePolicyTab === 'privacy' && { backgroundColor: theme.primary.main }
                    ]}
                    onPress={() => setActivePolicyTab('privacy')}
                >
                    <Text style={[
                        styles.tabButtonText,
                        { color: activePolicyTab === 'privacy' ? '#FFFFFF' : theme.text.secondary }
                    ]}>
                        {t('legal.privacy.title')}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.tabButton,
                        activePolicyTab === 'terms' && { backgroundColor: theme.primary.main }
                    ]}
                    onPress={() => setActivePolicyTab('terms')}
                >
                    <Text style={[
                        styles.tabButtonText,
                        { color: activePolicyTab === 'terms' ? '#FFFFFF' : theme.text.secondary }
                    ]}>
                        {t('legal.terms.title')}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Content Sections */}
            <View style={styles.content}>
                {activePolicyTab === 'privacy' ? (
                    <>
                        {renderSection('legal.privacy.sec1Title', 'legal.privacy.sec1Content')}
                        {renderSection('legal.privacy.sec2Title', 'legal.privacy.sec2Content')}
                        {renderSection('legal.privacy.sec3Title', 'legal.privacy.sec3Content')}
                        {renderSection('legal.privacy.sec4Title', 'legal.privacy.sec4Content')}
                        {renderSection('legal.privacy.sec5Title', 'legal.privacy.sec5Content')}
                        {renderSection('legal.privacy.sec6Title', 'legal.privacy.sec6Content')}
                    </>
                ) : (
                    <>
                        {renderSection('legal.terms.sec1Title', 'legal.terms.sec1Content')}

                        {renderSection('legal.terms.sec2Title', [
                            'legal.terms.sec2Content1',
                            'legal.terms.sec2Content2',
                            'legal.terms.sec2Content3'
                        ])}

                        {renderSection('legal.terms.sec3Title', [
                            'legal.terms.sec3Content1',
                            'legal.terms.sec3Content2'
                        ])}

                        {renderSection('legal.terms.sec4Title', [
                            'legal.terms.sec4Content1',
                            'legal.terms.sec4Content2',
                            'legal.terms.sec4Content3'
                        ])}

                        {renderSection('legal.terms.sec5Title', [
                            'legal.terms.sec5Content1',
                            'legal.terms.sec5Content2',
                            'legal.terms.sec5Content3'
                        ])}

                        {renderSection('legal.terms.sec6Title', 'legal.terms.sec6Content')}

                        {renderSection('legal.terms.sec7Title', 'legal.terms.sec7Content')}

                        {renderSection('legal.terms.sec8Title', 'legal.terms.sec8Content')}

                        {renderSection('legal.terms.sec9Title', 'legal.terms.sec9Content')}

                        {renderSection('legal.terms.sec10Title', [
                            'legal.terms.sec10Content1',
                            'legal.terms.sec10Content2',
                            'legal.terms.sec10Bullet1',
                            'legal.terms.sec10Bullet2',
                            'legal.terms.sec10Bullet3',
                            'legal.terms.sec10Bullet4'
                        ])}

                        {renderSection('legal.terms.sec11Title', 'legal.terms.sec11Content')}
                    </>
                )}
            </View>

            <View style={styles.footer}>
                <Text style={[styles.footerText, { color: theme.text.tertiary }]}>
                    © {new Date().getFullYear()} Alsaif Analysis. All rights reserved.
                </Text>
            </View>
        </ContentWrapper>
    );

    if (isDesktop) {
        return (
            <SettingsLayout
                activeTab="terms"
                onTabChange={handleTabChange}
                onLogout={() => { }}
                showSubscription={!isAdmin}
            >
                {content}
            </SettingsLayout>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
            {/* Background Gradients */}
            <View style={StyleSheet.absoluteFill}>
                <LinearGradient
                    colors={[theme.primary.main + '15', 'transparent']}
                    style={styles.topGradient}
                />
                <LinearGradient
                    colors={['transparent', theme.primary.main + '10']}
                    style={styles.bottomGradient}
                />
            </View>

            <SafeAreaView style={styles.safeArea} edges={['top']}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={onNavigateBack}
                        style={[styles.backButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}
                    >
                        <Ionicons
                            name={isRTL ? 'chevron-forward' : 'chevron-back'}
                            size={24}
                            color={theme.text.primary}
                        />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: theme.text.primary }]}>
                        {activePolicyTab === 'privacy' ? t('legal.privacy.title') : t('legal.terms.title')}
                    </Text>
                    <View style={{ width: 40 }} />
                </View>

                {content}
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
    topGradient: {
        height: 300,
        width: '100%',
    },
    bottomGradient: {
        position: 'absolute',
        bottom: 0,
        height: 300,
        width: '100%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    heroCard: {
        padding: 24,
        borderRadius: 24,
        marginTop: 10,
        borderWidth: 1,
        overflow: 'hidden',
    },
    heroHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    heroTitle: {
        flex: 1,
        fontSize: 22,
        fontWeight: '800',
        lineHeight: 28,
    },
    heroSubtitle: {
        fontSize: 14,
        fontWeight: '500',
    },
    tabContainer: {
        flexDirection: 'row',
        borderRadius: 12,
        padding: 4,
        marginVertical: 20,
        borderWidth: 1,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    content: {
        marginTop: 10,
    },
    sectionContainer: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
    },
    sectionContent: {
        fontSize: 15,
        lineHeight: 24,
        fontWeight: '400',
    },
    listBullet: {
        flexDirection: 'row',
        marginBottom: 12,
        paddingHorizontal: 8,
    },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginTop: 9,
    },
    footer: {
        marginTop: 40,
        alignItems: 'center',
        paddingBottom: 20,
    },
    footerText: {
        fontSize: 12,
        fontWeight: '500',
    },
});
