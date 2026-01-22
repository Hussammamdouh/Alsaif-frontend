/**
 * About Screen
 * Displays app information and financial recommendation document
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../app/providers/ThemeProvider';
import { useLocalization } from '../../app/providers/LocalizationProvider';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

export const AboutScreen = () => {
    const { theme } = useTheme();
    const { t, language } = useLocalization();
    const navigation = useNavigation();

    const openPDF = async () => {
        // For PDF viewing, we'll need to implement a proper PDF viewer
        // For now, we'll show a message
        alert(t('about.pdfViewerComingSoon'));
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.border.main }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color={theme.text.primary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text.primary }]}>{t('about.title')}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {/* App Logo/Name */}
                <View style={styles.logoSection}>
                    <Text style={[styles.appName, { color: theme.primary.main }]}>Alsaif Analysis</Text>
                    <Text style={[styles.tagline, { color: theme.text.secondary }]}>{t('about.tagline')}</Text>
                </View>

                {/* Description */}
                <View style={[styles.section, { backgroundColor: theme.background.secondary, borderColor: theme.border.main }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>{t('about.whatIsIt')}</Text>
                    <Text style={[styles.descriptionText, { color: theme.text.secondary }]}>
                        {t('about.description')}
                    </Text>
                </View>

                {/* Features */}
                <View style={[styles.section, { backgroundColor: theme.background.secondary, borderColor: theme.border.main }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>{t('about.keyFeatures')}</Text>

                    <View style={styles.featureItem}>
                        <Icon name="trending-up" size={20} color={theme.primary.main} style={styles.featureIcon} />
                        <Text style={[styles.featureText, { color: theme.text.secondary }]}>{t('about.feature1')}</Text>
                    </View>

                    <View style={styles.featureItem}>
                        <Icon name="bulb" size={20} color={theme.primary.main} style={styles.featureIcon} />
                        <Text style={[styles.featureText, { color: theme.text.secondary }]}>{t('about.feature2')}</Text>
                    </View>

                    <View style={styles.featureItem}>
                        <Icon name="chatbubbles" size={20} color={theme.primary.main} style={styles.featureIcon} />
                        <Text style={[styles.featureText, { color: theme.text.secondary }]}>{t('about.feature3')}</Text>
                    </View>

                    <View style={styles.featureItem}>
                        <Icon name="newspaper" size={20} color={theme.primary.main} style={styles.featureIcon} />
                        <Text style={[styles.featureText, { color: theme.text.secondary }]}>{t('about.feature4')}</Text>
                    </View>

                    <View style={styles.featureItem}>
                        <Icon name="document-text" size={20} color={theme.primary.main} style={styles.featureIcon} />
                        <Text style={[styles.featureText, { color: theme.text.secondary }]}>{t('about.feature5')}</Text>
                    </View>
                </View>

                {/* Financial Recommendation Document */}
                <View style={[styles.section, { backgroundColor: theme.background.secondary, borderColor: theme.border.main }]}>
                    <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>{t('about.license')}</Text>
                    <Text style={[styles.descriptionText, { color: theme.text.secondary }]}>
                        {t('about.licenseDescription')}
                    </Text>

                    <TouchableOpacity
                        style={[styles.pdfButton, { backgroundColor: theme.primary.main }]}
                        onPress={openPDF}
                    >
                        <Icon name="document" size={20} color="#FFFFFF" />
                        <Text style={styles.pdfButtonText}>{t('about.viewDocument')}</Text>
                    </TouchableOpacity>
                </View>

                {/* Version Info */}
                <View style={styles.versionInfo}>
                    <Text style={[styles.versionText, { color: theme.text.tertiary }]}>
                        {t('about.version')} 1.0.0
                    </Text>
                    <Text style={[styles.versionText, { color: theme.text.tertiary }]}>
                        © 2024 Alsaif Analysis
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: 32,
        paddingVertical: 20,
    },
    appName: {
        fontSize: 32,
        fontWeight: '900',
        marginBottom: 8,
    },
    tagline: {
        fontSize: 16,
        fontWeight: '500',
    },
    section: {
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
    },
    descriptionText: {
        fontSize: 15,
        lineHeight: 24,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    featureIcon: {
        marginRight: 12,
        marginTop: 2,
    },
    featureText: {
        flex: 1,
        fontSize: 15,
        lineHeight: 22,
    },
    pdfButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginTop: 16,
    },
    pdfButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    versionInfo: {
        alignItems: 'center',
        marginTop: 20,
    },
    versionText: {
        fontSize: 13,
        marginBottom: 4,
    },
});
