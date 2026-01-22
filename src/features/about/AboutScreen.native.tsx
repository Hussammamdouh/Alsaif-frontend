/**
 * About Screen - Native Version (iOS/Android)
 * Uses react-native-pdf for PDF display
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../app/providers/ThemeProvider';
import { useLocalization } from '../../app/providers/LocalizationProvider';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Pdf from 'react-native-pdf';
import { Asset } from 'expo-asset';

export const AboutScreen = () => {
    const { theme, isDark } = useTheme();
    const { t, language } = useLocalization();
    const navigation = useNavigation();
    const [showPdf, setShowPdf] = useState(false);
    const [pdfLoading, setPdfLoading] = useState(true);

    // PDF path - using require for local asset
    const pdfSource = require('../../../assets/FinancialRecommendation Approval -  سيف علي محمد الجابري.pdf');

    const openPDF = () => {
        setShowPdf(true);
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

            {/* PDF Modal */}
            <Modal
                visible={showPdf}
                animationType="slide"
                onRequestClose={() => setShowPdf(false)}
            >
                <SafeAreaView style={[styles.pdfContainer, { backgroundColor: theme.background.primary }]}>
                    {/* PDF Header */}
                    <View style={[styles.pdfHeader, { borderBottomColor: theme.border.main }]}>
                        <TouchableOpacity onPress={() => setShowPdf(false)} style={styles.closeButton}>
                            <Icon name="close" size={28} color={theme.text.primary} />
                        </TouchableOpacity>
                        <Text style={[styles.pdfTitle, { color: theme.text.primary }]}>
                            {t('about.license')}
                        </Text>
                        <View style={{ width: 28 }} />
                    </View>

                    {/* PDF Viewer */}
                    <View style={styles.pdfWrapper}>
                        {pdfLoading && (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={theme.primary.main} />
                                <Text style={[styles.loadingText, { color: theme.text.secondary }]}>
                                    {language === 'ar' ? 'جاري تحميل المستند...' : 'Loading document...'}
                                </Text>
                            </View>
                        )}
                        <Pdf
                            trustAllCerts={false}
                            source={pdfSource}
                            style={[styles.pdf, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }]}
                            onLoadComplete={() => setPdfLoading(false)}
                            onError={(error) => {
                                console.error('PDF Error:', error);
                                setPdfLoading(false);
                            }}
                            enablePaging={true}
                            horizontal={false}
                            fitPolicy={0}
                            spacing={10}
                        />
                    </View>
                </SafeAreaView>
            </Modal>
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
    pdfContainer: {
        flex: 1,
    },
    pdfHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    closeButton: {
        padding: 4,
    },
    pdfTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    pdfWrapper: {
        flex: 1,
    },
    pdf: {
        flex: 1,
        width: Dimensions.get('window').width,
    },
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 10,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 14,
    },
});
