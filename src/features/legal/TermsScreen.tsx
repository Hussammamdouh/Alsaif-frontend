/**
 * Terms and Conditions Screen
 * Premium design with localized legal content
 */

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
import { SettingsLayout, SettingsTab } from '../settings/SettingsLayout';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

interface TermsScreenProps {
    onNavigateBack: () => void;
}

export const TermsScreen: React.FC<TermsScreenProps> = ({ onNavigateBack }) => {
    const { t, isRTL } = useLocalization();
    const { theme, isDark } = useTheme();
    const navigation = useNavigation<any>();
    const { width } = Dimensions.get('window');
    const isDesktop = width >= 1024;

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
                navigation.navigate('Main', { screen: 'Subscription' });
                break;
            case 'terms':
                // Already here
                break;
            case 'about':
                navigation.navigate('Main', { screen: 'About' });
                break;
        }
    }, [navigation]);

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

    const content = (
        <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
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
                        {t('legal.terms.header')}
                    </Text>
                </View>
                <Text style={[styles.heroSubtitle, { color: theme.text.tertiary, textAlign: isRTL ? 'right' : 'left' }]}>
                    {t('settings.version')} 1.0.0 • {new Date().toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', { month: 'long', year: 'numeric' })}
                </Text>
            </View>

            {/* Content Sections */}
            <View style={styles.content}>
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
            </View>

            <View style={styles.footer}>
                <Text style={[styles.footerText, { color: theme.text.tertiary }]}>
                    © {new Date().getFullYear()} Elsaif Analysis. All rights reserved.
                </Text>
            </View>
        </ScrollView>
    );

    if (isDesktop) {
        return (
            <SettingsLayout
                activeTab="terms"
                onTabChange={handleTabChange}
                onLogout={() => { }}
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
                        {t('legal.terms.title')}
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
    content: {
        marginTop: 30,
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
