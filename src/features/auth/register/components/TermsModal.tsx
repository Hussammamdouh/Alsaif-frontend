/**
 * Terms Modal Component
 * Displays localized terms and conditions with acceptance action
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Platform,
    useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme, useLocalization } from '../../../../app/providers';
import { Button, Checkbox, ResponsiveContainer } from '../../../../shared/components';

interface TermsModalProps {
    visible: boolean;
    onClose: () => void;
    onAccept: () => void;
}

const DESKTOP_BREAKPOINT = 768;

export const TermsModal: React.FC<TermsModalProps> = ({
    visible,
    onClose,
    onAccept,
}) => {
    const { theme, isDark } = useTheme();
    const { t, isRTL } = useLocalization();
    const [accepted, setAccepted] = useState(false);
    const { width } = useWindowDimensions();
    const isDesktop = width > DESKTOP_BREAKPOINT;

    const renderSection = (titleKey: string, contentKey: string | string[]) => {
        return (
            <View style={styles.sectionContainer}>
                <Text style={[styles.sectionTitle, { color: theme.primary.main, textAlign: isRTL ? 'right' : 'left' }]}>
                    {t(titleKey)}
                </Text>
                {Array.isArray(contentKey) ? (
                    contentKey.map((key, index) => (
                        <View key={index} style={[styles.listBullet, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                            <View style={[styles.bullet, { backgroundColor: theme.primary.main }]} />
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

    return (
        <Modal
            visible={visible}
            animationType={isDesktop ? "fade" : "slide"}
            transparent
            onRequestClose={onClose}
        >
            <View style={[
                styles.modalOverlay,
                isDesktop && styles.desktopOverlay
            ]}>
                <SafeAreaView
                    style={[
                        styles.modalContent,
                        { backgroundColor: theme.background.primary },
                        isDesktop && styles.desktopModalContent
                    ]}
                    edges={['top', 'bottom']}
                >
                    <View style={[styles.header, { borderBottomColor: theme.ui.border, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                        <Text style={[styles.headerTitle, { color: theme.text.primary }]}>
                            {t('legal.terms.title')}
                        </Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Icon name="close" size={24} color={theme.text.primary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <ResponsiveContainer>
                            <View style={styles.heroHeader}>
                                <Icon name="document-text-outline" size={48} color={theme.primary.main} />
                                <Text style={[styles.heroTitle, { color: theme.text.primary, textAlign: 'center' }]}>
                                    {t('legal.terms.header')}
                                </Text>
                            </View>

                            <View style={styles.content}>
                                <Text style={[styles.mainSectionHeader, { color: theme.text.primary, textAlign: isRTL ? 'right' : 'left' }]}>
                                    {t('legal.terms.title')}
                                </Text>
                                {renderSection('legal.terms.sec1Title', 'legal.terms.sec1Content')}
                                {renderSection('legal.terms.sec2Title', [
                                    'legal.terms.sec2Content1',
                                    'legal.terms.sec2Content2',
                                    'legal.terms.sec2Content3',
                                ])}
                                {renderSection('legal.terms.sec3Title', [
                                    'legal.terms.sec3Content1',
                                    'legal.terms.sec3Content2'
                                ])}
                                {renderSection('legal.terms.sec4Title', [
                                    'legal.terms.sec4Content1',
                                    'legal.terms.sec4Content2',
                                    'legal.terms.sec4Content3',
                                ])}
                                {renderSection('legal.terms.sec5Title', [
                                    'legal.terms.sec5Content1',
                                    'legal.terms.sec5Content2',
                                    'legal.terms.sec5Content3',
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

                                <View style={[styles.divider, { backgroundColor: theme.ui.border }]} />

                                <Text style={[styles.mainSectionHeader, { color: theme.text.primary, textAlign: isRTL ? 'right' : 'left' }]}>
                                    {t('legal.privacy.title')}
                                </Text>
                                <Text style={[styles.heroTitle, { color: theme.text.primary, textAlign: isRTL ? 'right' : 'left', fontSize: 18, marginBottom: 16 }]}>
                                    {t('legal.privacy.header')}
                                </Text>
                                {renderSection('legal.privacy.sec1Title', 'legal.privacy.sec1Content')}
                                {renderSection('legal.privacy.sec2Title', 'legal.privacy.sec2Content')}
                                {renderSection('legal.privacy.sec3Title', 'legal.privacy.sec3Content')}
                                {renderSection('legal.privacy.sec4Title', 'legal.privacy.sec4Content')}
                                {renderSection('legal.privacy.sec5Title', 'legal.privacy.sec5Content')}
                            </View>
                        </ResponsiveContainer>
                    </ScrollView>

                    <View style={[styles.footer, { borderTopColor: theme.ui.border }]}>
                        <View style={[styles.acceptanceContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                            <Checkbox
                                checked={accepted}
                                onToggle={() => setAccepted(!accepted)}
                            />
                            <Text style={[styles.acceptanceText, { color: theme.text.secondary, textAlign: isRTL ? 'right' : 'left' }]}>
                                {t('register.agreeToTerms')} {t('register.termsOfService')} {t('register.and')} {t('register.privacyPolicy')}
                            </Text>
                        </View>
                        <Button
                            title={t('register.acceptTermsButton')}
                            onPress={onAccept}
                            disabled={!accepted}
                            style={styles.acceptButton}
                        />
                    </View>
                </SafeAreaView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    desktopOverlay: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    modalContent: {
        flex: 1,
        marginTop: 60,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        overflow: 'hidden',
    },
    desktopModalContent: {
        flex: 0,
        width: '100%',
        maxWidth: 600,
        maxHeight: '90%',
        marginTop: 0,
        borderRadius: 24,
    },
    header: {
        padding: 20,
        borderBottomWidth: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    closeButton: {
        padding: 4,
    },
    scrollContent: {
        padding: 24,
    },
    heroHeader: {
        alignItems: 'center',
        marginBottom: 32,
    },
    heroTitle: {
        fontSize: 22,
        fontWeight: '800',
        marginTop: 16,
        lineHeight: 28,
    },
    content: {
        paddingBottom: 40,
    },
    mainSectionHeader: {
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 20,
        marginTop: 10,
    },
    divider: {
        height: 1,
        marginVertical: 32,
    },
    sectionContainer: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 12,
    },
    sectionContent: {
        fontSize: 15,
        lineHeight: 22,
    },
    listBullet: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginTop: 8,
        marginRight: 12,
        marginLeft: 4,
    },
    footer: {
        padding: 20,
        borderTopWidth: 1,
    },
    acceptanceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    acceptanceText: {
        flex: 1,
        fontSize: 14,
        marginLeft: 12,
        lineHeight: 20,
    },
    acceptButton: {
        height: 56,
    },
});
