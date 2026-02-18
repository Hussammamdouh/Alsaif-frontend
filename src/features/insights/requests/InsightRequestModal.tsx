import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { useLocalization } from '../../../app/providers/LocalizationProvider';
import { ResponsiveContainer } from '../../../shared/components';
import { useInsightRequest } from './useInsightRequest';

interface InsightRequestModalProps {
    isVisible: boolean;
    onClose: () => void;
}

export const InsightRequestModal: React.FC<InsightRequestModalProps> = ({ isVisible, onClose }) => {
    const { theme } = useTheme();
    const { t, isRTL } = useLocalization();
    const [title, setTitle] = useState('');
    const [details, setDetails] = useState('');
    const { submitRequest, isLoading } = useInsightRequest(() => {
        setTitle('');
        setDetails('');
        onClose();
    });

    const handleSubmit = () => {
        if (!title.trim() || !details.trim()) return;
        submitRequest({ title: title.trim(), details: details.trim() });
    };

    const isSubmitDisabled = !title.trim() || !details.trim();

    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalOverlay}
            >
                <View style={[styles.modalContent, { backgroundColor: theme.background.primary }]}>
                    <ResponsiveContainer>
                        {/* Header */}
                        <View style={[styles.header, { borderBottomColor: theme.border.main }]}>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Ionicons name="close" size={24} color={theme.text.primary} />
                            </TouchableOpacity>
                            <Text style={[styles.title, { color: theme.text.primary }]}>
                                {t('insights.requestTitle')}
                            </Text>
                            <View style={{ width: 40 }} />
                        </View>

                        <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
                            {/* Title Input */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.text.secondary, textAlign: isRTL ? 'right' : 'left' }]}>
                                    {t('insights.requestDetails')}
                                </Text>
                                <TextInput
                                    style={[
                                        styles.input,
                                        {
                                            backgroundColor: theme.background.secondary,
                                            color: theme.text.primary,
                                            borderColor: theme.border.main,
                                            textAlign: isRTL ? 'right' : 'left'
                                        }
                                    ]}
                                    placeholder={t('insights.requestPlaceholder')}
                                    placeholderTextColor={theme.text.hint}
                                    value={title}
                                    onChangeText={setTitle}
                                    maxLength={200}
                                />
                                <Text style={[styles.hint, { color: theme.text.hint, textAlign: isRTL ? 'right' : 'left' }]}>
                                    {title.length}/200
                                </Text>
                            </View>

                            {/* Details Input */}
                            <View style={styles.inputGroup}>
                                <Text style={[styles.label, { color: theme.text.secondary, textAlign: isRTL ? 'right' : 'left' }]}>
                                    {t('insights.requestDetails')}
                                </Text>
                                <TextInput
                                    style={[
                                        styles.textArea,
                                        {
                                            backgroundColor: theme.background.secondary,
                                            color: theme.text.primary,
                                            borderColor: theme.border.main,
                                            textAlign: isRTL ? 'right' : 'left'
                                        }
                                    ]}
                                    placeholder={t('insights.detailsPlaceholder')}
                                    placeholderTextColor={theme.text.hint}
                                    value={details}
                                    onChangeText={setDetails}
                                    multiline
                                    numberOfLines={6}
                                    textAlignVertical="top"
                                    maxLength={2000}
                                />
                                <Text style={[styles.hint, { color: theme.text.hint, textAlign: isRTL ? 'right' : 'left' }]}>
                                    {details.length}/2000
                                </Text>
                            </View>

                            <View style={styles.footer}>
                                <TouchableOpacity
                                    style={[
                                        styles.submitButton,
                                        { backgroundColor: theme.primary.main },
                                        (isSubmitDisabled || isLoading) && styles.disabledButton
                                    ]}
                                    onPress={handleSubmit}
                                    disabled={isSubmitDisabled || isLoading}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color="#FFFFFF" />
                                    ) : (
                                        <Text style={styles.submitButtonText}>{t('insights.submitRequest')}</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </ResponsiveContainer>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '80%',
        paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
    },
    closeButton: {
        padding: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
    },
    form: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 16,
        fontSize: 16,
    },
    textArea: {
        borderRadius: 12,
        borderWidth: 1,
        padding: 16,
        fontSize: 16,
        height: 150,
    },
    hint: {
        fontSize: 12,
        marginTop: 4,
    },
    footer: {
        marginTop: 10,
        marginBottom: 40,
    },
    submitButton: {
        borderRadius: 14,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    disabledButton: {
        opacity: 0.6,
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '700',
    },
});
