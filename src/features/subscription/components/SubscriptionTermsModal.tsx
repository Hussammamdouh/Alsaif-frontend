/**
 * Subscription Terms Modal Component
 * Displays subscription terms that users must accept before checkout
 * Requires scrolling through all content before acceptance
 */

import React, { useState, useRef, useCallback } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Platform,
    useWindowDimensions,
    NativeSyntheticEvent,
    NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme, useLocalization } from '../../../app/providers';
import { Button, Checkbox, ResponsiveContainer } from '../../../shared/components';

interface SubscriptionTermsModalProps {
    visible: boolean;
    onClose: () => void;
    onAccept: () => void;
    loading?: boolean;
}

const DESKTOP_BREAKPOINT = 768;

export const SubscriptionTermsModal: React.FC<SubscriptionTermsModalProps> = ({
    visible,
    onClose,
    onAccept,
    loading = false,
}) => {
    const { theme, isDark } = useTheme();
    const { t, isRTL } = useLocalization();
    const [accepted, setAccepted] = useState(false);
    const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
    const { width } = useWindowDimensions();
    const isDesktop = width > DESKTOP_BREAKPOINT;

    // Reset state when modal opens
    React.useEffect(() => {
        if (visible) {
            setAccepted(false);
            setHasScrolledToBottom(false);
        }
    }, [visible]);

    const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
        const paddingToBottom = 50;
        if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
            setHasScrolledToBottom(true);
        }
    }, []);

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

    const renderSectionWithIntro = (titleKey: string, introKey: string, bulletKeys: string[]) => {
        return (
            <View style={styles.sectionContainer}>
                <Text style={[styles.sectionTitle, { color: theme.primary.main, textAlign: isRTL ? 'right' : 'left' }]}>
                    {t(titleKey)}
                </Text>
                <Text style={[styles.sectionContent, { color: theme.text.secondary, textAlign: isRTL ? 'right' : 'left', marginBottom: 8 }]}>
                    {t(introKey)}
                </Text>
                {bulletKeys.map((key, index) => (
                    <View key={index} style={[styles.listBullet, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                        <View style={[styles.bullet, { backgroundColor: theme.primary.main, marginRight: isRTL ? 0 : 12, marginLeft: isRTL ? 12 : 4 }]} />
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.sectionContent, { color: theme.text.secondary, textAlign: isRTL ? 'right' : 'left' }]}>
                                {t(key)}
                            </Text>
                        </View>
                    </View>
                ))}
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
                            {t('subscription.terms.title')}
                        </Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Icon name="close" size={24} color={theme.text.primary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={true}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                    >
                        <ResponsiveContainer>
                            <View style={styles.heroHeader}>
                                <Icon name="shield-checkmark-outline" size={48} color={theme.primary.main} />
                                <Text style={[styles.heroTitle, { color: theme.text.primary, textAlign: 'center' }]}>
                                    {t('subscription.terms.header')}
                                </Text>
                            </View>

                            <View style={styles.content}>
                                {/* Section 1: Nature of Recommendations */}
                                {renderSection('subscription.terms.sec1Title', [
                                    'subscription.terms.sec1Bullet1',
                                    'subscription.terms.sec1Bullet2',
                                    'subscription.terms.sec1Bullet3',
                                ])}

                                {/* Section 2: Responsibility for Decisions */}
                                {renderSectionWithIntro('subscription.terms.sec2Title', 'subscription.terms.sec2Content', [
                                    'subscription.terms.sec2Bullet1',
                                    'subscription.terms.sec2Bullet2',
                                    'subscription.terms.sec2Bullet3',
                                ])}

                                {/* Section 3: Enhanced Disclaimer */}
                                {renderSectionWithIntro('subscription.terms.sec3Title', 'subscription.terms.sec3Content', [
                                    'subscription.terms.sec3Bullet1',
                                    'subscription.terms.sec3Bullet2',
                                    'subscription.terms.sec3Bullet3',
                                ])}

                                {/* Section 4: Subscription and Payments */}
                                {renderSectionWithIntro('subscription.terms.sec4Title', 'subscription.terms.sec4Content', [
                                    'subscription.terms.sec4Bullet1',
                                    'subscription.terms.sec4Bullet2',
                                    'subscription.terms.sec4Bullet3',
                                ])}

                                {/* Section 5: Confidentiality */}
                                {renderSectionWithIntro('subscription.terms.sec5Title', 'subscription.terms.sec5Content', [
                                    'subscription.terms.sec5Bullet1',
                                    'subscription.terms.sec5Bullet2',
                                ])}
                                <Text style={[styles.violationText, { color: theme.accent.warning, textAlign: isRTL ? 'right' : 'left' }]}>
                                    {t('subscription.terms.sec5Violation')}
                                </Text>

                                {/* Section 6: Service Suspension */}
                                {renderSection('subscription.terms.sec6Title', [
                                    'subscription.terms.sec6Bullet1',
                                    'subscription.terms.sec6Bullet2',
                                ])}

                                <View style={[styles.divider, { backgroundColor: theme.ui.border }]} />

                                {/* Disclaimer */}
                                <View style={[styles.disclaimerBox, { backgroundColor: theme.background.secondary, borderColor: theme.ui.border }]}>
                                    <Icon name="warning-outline" size={24} color={theme.accent.warning} style={styles.disclaimerIcon} />
                                    <Text style={[styles.disclaimerText, { color: theme.text.primary, textAlign: isRTL ? 'right' : 'left' }]}>
                                        {t('subscription.terms.disclaimer')}
                                    </Text>
                                </View>
                            </View>
                        </ResponsiveContainer>
                    </ScrollView>

                    {!hasScrolledToBottom && (
                        <View style={[styles.scrollHint, { backgroundColor: theme.background.secondary }]}>
                            <Icon name="chevron-down" size={20} color={theme.text.tertiary} />
                            <Text style={[styles.scrollHintText, { color: theme.text.tertiary }]}>
                                {isRTL ? 'مرر لأسفل لقراءة كل الشروط' : 'Scroll down to read all terms'}
                            </Text>
                        </View>
                    )}

                    <View style={[styles.footer, { borderTopColor: theme.ui.border }]}>
                        <View style={[styles.acceptanceContainer, { flexDirection: isRTL ? 'row-reverse' : 'row', opacity: hasScrolledToBottom ? 1 : 0.5 }]}>
                            <Checkbox
                                checked={accepted}
                                onToggle={() => hasScrolledToBottom && setAccepted(!accepted)}
                            />
                            <Text style={[styles.acceptanceText, { color: theme.text.secondary, textAlign: isRTL ? 'right' : 'left', marginLeft: isRTL ? 0 : 12, marginRight: isRTL ? 12 : 0 }]}>
                                {t('subscription.terms.accept')}
                            </Text>
                        </View>
                        <Button
                            title={t('subscription.terms.continue')}
                            onPress={onAccept}
                            disabled={!accepted}
                            loading={loading}
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
    },
    violationText: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 8,
        paddingLeft: 22,
        lineHeight: 20,
    },
    divider: {
        height: 1,
        marginVertical: 24,
    },
    disclaimerBox: {
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    disclaimerIcon: {
        marginBottom: 8,
    },
    disclaimerText: {
        fontSize: 14,
        lineHeight: 22,
        fontWeight: '600',
    },
    scrollHint: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        gap: 4,
    },
    scrollHintText: {
        fontSize: 13,
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
        lineHeight: 20,
    },
    acceptButton: {
        height: 56,
    },
});
