/**
 * AdminBannersScreen
 * Manage home page banners and partner ads
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    RefreshControl,
    TouchableOpacity,
    Modal,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Switch,
    ActivityIndicator,
    Image,
    useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme, useLocalization } from '../../../app/providers';
import { createAdminStyles } from '../admin.styles';
import { useBanners } from '../hooks';
import { Banner } from '../../../core/services/api/adminEnhancements.service';
import { ActionSheet, AdminSidebar, ConfirmationModal, EmptyState, FilterBar, LoadingState, SearchBar } from '../components';
import { ResponsiveContainer } from '../../../shared/components';

export const AdminBannersScreen: React.FC = () => {
    const navigation = useNavigation();
    const { theme, isDark } = useTheme();
    const { t, isRTL } = useLocalization();
    const [isAdminMode, setIsAdminMode] = useState(true);

    const styles = useMemo(() => createAdminStyles(theme, isRTL), [theme, isRTL]);
    const localStyles = useMemo(() => createLocalStyles(theme, isRTL), [theme, isRTL]);
    const { width } = useWindowDimensions();
    const isDesktop = width >= 1024;

    const [searchQuery, setSearchQuery] = useState('');
    const [showActionSheet, setShowActionSheet] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showFormModal, setShowFormModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [formTitle, setFormTitle] = useState('');
    const [formImageUrl, setFormImageUrl] = useState('');
    const [formLink, setFormLink] = useState('');
    const [formPartner, setFormPartner] = useState('');
    const [formType, setFormType] = useState<'free' | 'premium' | 'both'>('both');
    const [formOrder, setFormOrder] = useState('0');
    const [formIsActive, setFormIsActive] = useState(true);
    const [formDisplayDuration, setFormDisplayDuration] = useState('');
    const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);

    const {
        banners,
        loading,
        error,
        refresh,
        createBanner,
        updateBanner,
        deleteBanner,
    } = useBanners();

    const resetForm = useCallback(() => {
        setFormTitle('');
        setFormImageUrl('');
        setFormLink('');
        setFormPartner('');
        setFormType('both');
        setFormOrder('0');
        setFormIsActive(true);
        setFormDisplayDuration('');
        setSelectedBanner(null);
    }, []);

    const openCreateModal = useCallback(() => {
        resetForm();
        setShowFormModal(true);
    }, [resetForm]);

    const openEditModal = useCallback((banner: Banner) => {
        setSelectedBanner(banner);
        setFormTitle(banner.title || '');
        setFormImageUrl(banner.imageUrl || '');
        setFormLink(banner.link || '');
        setFormPartner(banner.partner || '');
        setFormType(banner.type || 'both');
        setFormOrder(String(banner.order || '0'));
        setFormIsActive(banner.isActive !== false);
        setFormDisplayDuration(banner.displayDurationDays ? String(banner.displayDurationDays) : '');
        setShowFormModal(true);
    }, []);

    const handleBannerPress = (banner: Banner) => {
        setSelectedBanner(banner);
        setShowActionSheet(true);
    };

    const handleToggleActive = async () => {
        if (selectedBanner) {
            try {
                await updateBanner(selectedBanner._id || selectedBanner.id!, {
                    isActive: !selectedBanner.isActive,
                });
                setSelectedBanner(null);
                setShowActionSheet(false);
            } catch (error) {
                console.error('Failed to toggle banner:', error);
            }
        }
    };

    const handleDelete = async () => {
        if (selectedBanner) {
            try {
                await deleteBanner(selectedBanner._id || selectedBanner.id!);
                setSelectedBanner(null);
                setShowDeleteModal(false);
            } catch (error) {
                console.error('Failed to delete banner:', error);
            }
        }
    };

    const handleSave = async () => {
        if (!formTitle || !formImageUrl) return;

        setIsSaving(true);
        try {
            const bannerData: Partial<Banner> = {
                title: formTitle,
                imageUrl: formImageUrl,
                link: formLink || undefined,
                partner: formPartner || undefined,
                type: formType,
                order: Number(formOrder),
                isActive: formIsActive,
                displayDurationDays: formDisplayDuration ? Number(formDisplayDuration) : undefined,
            };

            if (selectedBanner) {
                await updateBanner(selectedBanner._id || selectedBanner.id!, bannerData);
            } else {
                await createBanner(bannerData);
            }

            setShowFormModal(false);
            resetForm();
        } catch (error) {
            console.error('Failed to save banner:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const filteredBanners = useMemo(() => {
        if (!searchQuery) return banners;
        const query = searchQuery.toLowerCase();
        return banners.filter(
            (b) =>
                b.title.toLowerCase().includes(query) ||
                (b.partner && b.partner.toLowerCase().includes(query))
        );
    }, [banners, searchQuery]);

    const renderBannerItem = ({ item }: { item: Banner }) => (
        <TouchableOpacity
            style={localStyles.bannerItem}
            onPress={() => handleBannerPress(item)}
            activeOpacity={0.7}
        >
            <Image source={{ uri: item.imageUrl }} style={localStyles.bannerImage} resizeMode="cover" />
            <View style={localStyles.bannerInfo}>
                <View style={localStyles.bannerHeader}>
                    <Text style={localStyles.bannerTitle} numberOfLines={1}>{item.title}</Text>
                    <View
                        style={[
                            localStyles.statusIndicator,
                            { backgroundColor: item.isActive ? theme.success.main : theme.text.tertiary },
                        ]}
                    />
                </View>
                {item.partner && (
                    <View style={localStyles.partnerRow}>
                        <Ionicons name="business-outline" size={14} color={theme.text.secondary} />
                        <Text style={localStyles.partnerText}>{item.partner}</Text>
                    </View>
                )}
                <View style={localStyles.bannerMeta}>
                    <View style={[localStyles.typeBadge, { backgroundColor: theme.background.tertiary }]}>
                        <Text style={localStyles.typeBadgeText}>{item.type.toUpperCase()}</Text>
                    </View>
                    <Text style={localStyles.orderText}>Order: {item.order}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loading && banners.length === 0) {
        return <LoadingState type="list" count={5} />;
    }

    const renderHeader = () => (
        <View style={[styles.header, isDesktop && { backgroundColor: theme.background.secondary, borderBottomColor: theme.ui.border, height: 80, paddingTop: 0, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.headerLeft, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color={theme.text.primary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{isDesktop ? t('admin.bannersOverview') : t('admin.bannerManagement')}</Text>
            </View>
            <TouchableOpacity
                style={localStyles.addButtonHeader}
                onPress={openCreateModal}
                activeOpacity={0.7}
            >
                <Ionicons name="add" size={24} color={theme.primary.contrast} />
            </TouchableOpacity>
        </View>
    );

    const renderMainContent = () => (
        <>
            <SearchBar
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={t('admin.searchQueue')}
                loading={loading}
            />

            {error ? (
                <EmptyState
                    icon="alert-circle"
                    title={t('common.error')}
                    message={error}
                    actionLabel={t('common.retry')}
                    onActionPress={refresh}
                    iconColor={theme.error.main}
                />
            ) : filteredBanners.length === 0 ? (
                <EmptyState
                    icon="image-outline"
                    title={t('admin.noBannersFound')}
                    message={t('admin.noBannersMessage')}
                    actionLabel={t('admin.createBanner')}
                    onActionPress={openCreateModal}
                    iconColor={theme.primary.main}
                />
            ) : (
                <FlatList
                    data={filteredBanners}
                    renderItem={renderBannerItem}
                    keyExtractor={(item) => item._id || item.id!}
                    contentContainerStyle={localStyles.listContent}
                    refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
                />
            )}
        </>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {isDesktop ? (
                    <View style={styles.desktopContentWrapper}>
                        <AdminSidebar />
                        <View style={styles.desktopMainContent}>
                            {renderHeader()}
                            {renderMainContent()}
                        </View>
                    </View>
                ) : (
                    <ResponsiveContainer style={{ flex: 1 }}>
                        {renderHeader()}
                        {renderMainContent()}
                    </ResponsiveContainer>
                )}

                <ActionSheet
                    visible={showActionSheet}
                    onClose={() => {
                        setShowActionSheet(false);
                    }}
                    title={selectedBanner?.title || t('admin.selectAction')}
                    options={[
                        {
                            label: selectedBanner?.isActive ? t('admin.deactivate') : t('admin.activate'),
                            icon: selectedBanner?.isActive ? 'close-circle-outline' : 'checkmark-circle-outline',
                            onPress: handleToggleActive,
                        },
                        {
                            label: t('admin.editBanner'),
                            icon: 'create-outline',
                            onPress: () => {
                                setShowActionSheet(false);
                                if (selectedBanner) openEditModal(selectedBanner);
                            },
                        },
                        {
                            label: t('common.delete'),
                            icon: 'trash-outline',
                            onPress: () => {
                                setShowActionSheet(false);
                                setShowDeleteModal(true);
                            },
                            destructive: true,
                        },
                    ]}
                />

                <ConfirmationModal
                    visible={showDeleteModal}
                    onClose={() => {
                        setShowDeleteModal(false);
                        setSelectedBanner(null);
                    }}
                    onConfirm={handleDelete}
                    title={t('admin.deleteBanner')}
                    message={t('admin.deleteMessage')}
                    confirmText={t('common.delete')}
                    destructive
                    icon="trash"
                />

                {/* Create/Edit Modal */}
                <Modal
                    visible={showFormModal}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setShowFormModal(false)}
                >
                    <View style={localStyles.modalOverlay}>
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                            style={[localStyles.modalContent, isDesktop && localStyles.desktopModalContent]}
                        >
                            <View style={[localStyles.modalHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                <Text style={[localStyles.modalTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
                                    {selectedBanner ? t('admin.editBanner') : t('admin.createBanner')}
                                </Text>
                                <View style={[localStyles.modalHeaderActions, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                    <TouchableOpacity onPress={() => setShowFormModal(false)}>
                                        <Ionicons name="close" size={24} color={theme.text.primary} />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <ScrollView style={localStyles.formScroll} showsVerticalScrollIndicator={false}>
                                <View style={localStyles.formGroup}>
                                    <Text style={localStyles.label}>{t('admin.bannerTitle')} *</Text>
                                    <TextInput
                                        style={localStyles.input}
                                        value={formTitle}
                                        onChangeText={setFormTitle}
                                        placeholder="E.g., Special Premium Offer"
                                        placeholderTextColor={theme.text.tertiary}
                                    />
                                </View>

                                <View style={localStyles.formGroup}>
                                    <Text style={localStyles.label}>{t('admin.partnerName')}</Text>
                                    <TextInput
                                        style={localStyles.input}
                                        value={formPartner}
                                        onChangeText={setFormPartner}
                                        placeholder="E.g., Partner Co."
                                        placeholderTextColor={theme.text.tertiary}
                                    />
                                </View>

                                <View style={localStyles.formGroup}>
                                    <Text style={localStyles.label}>{t('admin.bannerImageUrl')} *</Text>
                                    <TextInput
                                        style={localStyles.input}
                                        value={formImageUrl}
                                        onChangeText={setFormImageUrl}
                                        placeholder="https://example.com/image.jpg"
                                        placeholderTextColor={theme.text.tertiary}
                                        autoCapitalize="none"
                                    />
                                </View>

                                <View style={localStyles.formGroup}>
                                    <Text style={localStyles.label}>{t('admin.bannerLinkUrl')}</Text>
                                    <TextInput
                                        style={localStyles.input}
                                        value={formLink}
                                        onChangeText={setFormLink}
                                        placeholder="https://example.com/link"
                                        placeholderTextColor={theme.text.tertiary}
                                        autoCapitalize="none"
                                    />
                                </View>

                                <View style={[localStyles.row, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                    <View style={[localStyles.formGroup, { flex: 1, [isRTL ? 'marginLeft' : 'marginRight']: 8 }]}>
                                        <Text style={[localStyles.label, { textAlign: isRTL ? 'right' : 'left' }]}>{t('admin.displayOrder')}</Text>
                                        <TextInput
                                            style={localStyles.input}
                                            value={formOrder}
                                            onChangeText={setFormOrder}
                                            placeholder="0"
                                            placeholderTextColor={theme.text.tertiary}
                                            keyboardType="numeric"
                                        />
                                    </View>
                                    <View style={[localStyles.formGroup, { flex: 1, [isRTL ? 'marginRight' : 'marginLeft']: 8 }]}>
                                        <Text style={[localStyles.label, { textAlign: isRTL ? 'right' : 'left' }]}>{t('admin.tabVisibility')}</Text>
                                        <View style={[localStyles.typeContainer, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                            {(['free', 'premium', 'both'] as const).map((tabType) => (
                                                <TouchableOpacity
                                                    key={tabType}
                                                    style={[
                                                        localStyles.typeChip,
                                                        formType === tabType && localStyles.typeChipActive,
                                                    ]}
                                                    onPress={() => setFormType(tabType)}
                                                >
                                                    <Text
                                                        style={[
                                                            localStyles.typeChipText,
                                                            formType === tabType && localStyles.typeChipTextActive,
                                                        ]}
                                                    >
                                                        {t(`type.${tabType}`)}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                </View>

                                <View style={localStyles.formGroup}>
                                    <Text style={localStyles.label}>{t('admin.displayDuration')} ({t('common.days')})</Text>
                                    <TextInput
                                        style={localStyles.input}
                                        value={formDisplayDuration}
                                        onChangeText={setFormDisplayDuration}
                                        placeholder="E.g., 30 (Leave empty for permanent)"
                                        placeholderTextColor={theme.text.tertiary}
                                        keyboardType="numeric"
                                    />
                                </View>

                                <View style={[localStyles.switchRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                                    <Text style={localStyles.label}>{t('admin.active')}</Text>
                                    <Switch
                                        value={formIsActive}
                                        onValueChange={setFormIsActive}
                                        trackColor={{ false: theme.border.main, true: theme.primary.main }}
                                        thumbColor={Platform.OS === 'ios' ? undefined : theme.background.primary}
                                    />
                                </View>
                            </ScrollView>

                            <TouchableOpacity
                                style={[
                                    localStyles.saveButton,
                                    (!formTitle || !formImageUrl) && localStyles.saveButtonDisabled,
                                ]}
                                onPress={handleSave}
                                disabled={isSaving || !formTitle || !formImageUrl}
                            >
                                {isSaving ? (
                                    <ActivityIndicator color={theme.primary.contrast} />
                                ) : (
                                    <Text style={localStyles.saveButtonText}>{t('common.save')}</Text>
                                )}
                            </TouchableOpacity>
                        </KeyboardAvoidingView>
                    </View>
                </Modal>
            </View >
        </SafeAreaView >
    );
};

const createLocalStyles = (theme: any, isRTL: boolean) => StyleSheet.create({
    addButtonHeader: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.primary.main,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: theme.primary.main,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    listContent: {
        padding: 16,
        paddingBottom: 100,
    },
    bannerItem: {
        backgroundColor: theme.background.secondary,
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.border.main,
        elevation: 3,
        shadowColor: theme.shadow.color,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    bannerImage: {
        width: '100%',
        height: 150,
        backgroundColor: theme.background.tertiary,
    },
    bannerInfo: {
        padding: 12,
    },
    bannerHeader: {
        flexDirection: isRTL ? 'row-reverse' : 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    bannerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.text.primary,
        flex: 1,
        [isRTL ? 'marginLeft' : 'marginRight']: 8,
        textAlign: isRTL ? 'right' : 'left',
    },
    statusIndicator: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    partnerRow: {
        flexDirection: isRTL ? 'row-reverse' : 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 8,
    },
    partnerText: {
        fontSize: 13,
        color: theme.text.secondary,
        fontWeight: '500',
        textAlign: isRTL ? 'right' : 'left',
    },
    bannerMeta: {
        flexDirection: isRTL ? 'row-reverse' : 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    typeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    typeBadgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: theme.text.tertiary,
    },
    orderText: {
        fontSize: 12,
        color: theme.text.tertiary,
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: theme.background.primary,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        minHeight: '80%',
        padding: 24,
    },
    modalHeader: {
        flexDirection: isRTL ? 'row-reverse' : 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: theme.text.primary,
        textAlign: isRTL ? 'right' : 'left',
    },
    modalHeaderActions: {
        flexDirection: isRTL ? 'row-reverse' : 'row',
        alignItems: 'center',
    },
    formScroll: {
        flex: 1,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.text.secondary,
        marginBottom: 8,
        textAlign: isRTL ? 'right' : 'left',
    },
    input: {
        backgroundColor: theme.background.tertiary,
        borderRadius: 12,
        padding: 14,
        fontSize: 16,
        color: theme.text.primary,
        borderWidth: 1,
        borderColor: theme.border.main,
        textAlign: isRTL ? 'right' : 'left',
    },
    row: {
        flexDirection: isRTL ? 'row-reverse' : 'row',
        marginBottom: 10,
    },
    typeContainer: {
        flexDirection: isRTL ? 'row-reverse' : 'row',
        gap: 8,
        flexWrap: 'wrap',
    },
    typeChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: theme.background.tertiary,
        borderWidth: 1,
        borderColor: theme.border.main,
    },
    typeChipActive: {
        backgroundColor: theme.primary.main,
        borderColor: theme.primary.main,
    },
    typeChipText: {
        fontSize: 12,
        fontWeight: '700',
        color: theme.text.secondary,
    },
    typeChipTextActive: {
        color: theme.primary.contrast,
    },
    switchRow: {
        flexDirection: isRTL ? 'row-reverse' : 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        marginBottom: 20,
    },
    saveButton: {
        backgroundColor: theme.primary.main,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: Platform.OS === 'ios' ? 20 : 0,
    },
    saveButtonDisabled: {
        opacity: 0.5,
    },
    saveButtonText: {
        color: theme.primary.contrast,
        fontSize: 16,
        fontWeight: '700',
    },
    desktopModalContent: {
        alignSelf: 'center',
        width: 600,
        minHeight: 'auto',
        maxHeight: '90%',
        borderRadius: 24,
        marginBottom: 0,
        bottom: 'auto',
    },
});
