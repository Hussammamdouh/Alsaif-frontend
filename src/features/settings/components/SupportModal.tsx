import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  StyleSheet,
  Linking,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../../app/providers/ThemeProvider';
import { useLocalization } from '../../../app/providers/LocalizationProvider';
import { useProfile } from '../../profile/profile.hooks';
import { submitSupportTicket } from '../../../core/services/settings/settingsService';

interface SupportModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ visible, onClose }) => {
  const { theme, isDark } = useTheme();
  const { t, isRTL } = useLocalization();
  const { profile } = useProfile();

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [subjectError, setSubjectError] = useState<string | null>(null);
  const [messageError, setMessageError] = useState<string | null>(null);

  // Validate fields
  const validateForm = useCallback(() => {
    let isValid = true;

    if (!subject.trim()) {
      setSubjectError(t('support.subjectRequired'));
      isValid = false;
    } else if (subject.trim().length < 3) {
      setSubjectError(t('support.subject') + ' ' + (isRTL ? 'يجب أن يكون 3 أحرف على الأقل' : 'must be at least 3 characters'));
      isValid = false;
    } else {
      setSubjectError(null);
    }

    if (!message.trim()) {
      setMessageError(t('support.messageRequired'));
      isValid = false;
    } else if (message.trim().length < 10) {
      setMessageError(t('support.message') + ' ' + (isRTL ? 'يجب أن يكون 10 أحرف على الأقل' : 'must be at least 10 characters'));
      isValid = false;
    } else {
      setMessageError(null);
    }

    return isValid;
  }, [subject, message, t, isRTL]);

  // Handle submit
  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // 1. Submit ticket via backend API (sends support email to hussam.mamdouh@aiesec.net)
      await submitSupportTicket({
        subject: subject.trim(),
        message: message.trim()
      });

      // 2. Format prefilled message
      const appName = 'AlSaif Analysis';
      const userName = profile?.name || 'Guest';
      const userEmail = profile?.email || 'N/A';
      const formattedText = `*Support Request - ${appName}*
====================
*Subject:* ${subject.trim()}
*User:* ${userName} (${userEmail})
*Message:* ${message.trim()}`;

      // Close the modal and reset fields immediately
      onClose();
      setSubject('');
      setMessage('');

      // 3. Prompt user to choose direct follow-up channel
      Alert.alert(
        isRTL ? 'تم تقديم الطلب' : 'Ticket Submitted',
        isRTL
          ? 'تم إرسال طلبك بنجاح. هل ترغب في المتابعة ومحادثة الدعم الفني مباشرة؟'
          : 'Your ticket has been emailed to support. Would you like to also open a live chat to follow up?',
        [
          {
            text: 'WhatsApp',
            onPress: async () => {
              const whatsappUrl = `https://wa.me/971501414516?text=${encodeURIComponent(formattedText)}`;
              try {
                await Linking.openURL(whatsappUrl);
              } catch (linkError) {
                console.error('Failed to open WhatsApp URL', linkError);
                try {
                  await Linking.openURL(`https://api.whatsapp.com/send?phone=971501414516&text=${encodeURIComponent(formattedText)}`);
                } catch (fallbackError) {
                  console.error('Failed to open fallback WhatsApp URL', fallbackError);
                }
              }
            }
          },
          {
            text: 'Telegram',
            onPress: async () => {
              const telegramUrl = `https://t.me/alsaif_analysis?text=${encodeURIComponent(formattedText)}`;
              try {
                await Linking.openURL(telegramUrl);
              } catch (linkError) {
                console.error('Failed to open Telegram URL', linkError);
              }
            }
          },
          {
            text: isRTL ? 'إغلاق' : 'Close',
            style: 'cancel'
          }
        ]
      );

    } catch (error) {
      console.error('Failed to submit support ticket', error);
      Alert.alert(
        isRTL ? 'خطأ في الإرسال' : 'Error',
        t('support.error')
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [subject, message, validateForm, profile, isRTL, t, onClose]);

  const handleCancel = useCallback(() => {
    setSubject('');
    setMessage('');
    setSubjectError(null);
    setMessageError(null);
    onClose();
  }, [onClose]);

  // Dynamic layout values
  const textDirection = isRTL ? 'right' : 'left';
  const flexDir = isRTL ? 'row-reverse' : 'row';

  return (
    <Modal
      transparent={true}
      visible={visible}
      onRequestClose={handleCancel}
      animationType="fade"
    >
      <Pressable style={styles.backdrop} onPress={handleCancel}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <Pressable
            style={[
              styles.modalContainer,
              {
                backgroundColor: theme.background.secondary,
                borderColor: theme.border.light,
              },
            ]}
            onPress={(e) => e.stopPropagation()} // Prevent closing when tapping modal content
          >
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.ui.divider, flexDirection: flexDir }]}>
              <Text style={[styles.title, { color: theme.text.primary }]}>
                {t('support.title')}
              </Text>
              <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
                <Icon name="close" size={24} color={theme.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
              {/* Subject Field */}
              <View style={styles.formField}>
                <Text style={[styles.label, { color: theme.text.secondary, textAlign: textDirection }]}>
                  {t('support.subject')} <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.background.primary,
                      color: theme.text.primary,
                      borderColor: subjectError ? theme.error.main : theme.border.main,
                      textAlign: textDirection,
                    },
                  ]}
                  placeholder={t('support.subjectPlaceholder')}
                  placeholderTextColor={theme.text.tertiary}
                  value={subject}
                  onChangeText={(val) => {
                    setSubject(val);
                    if (val.trim()) setSubjectError(null);
                  }}
                  maxLength={150}
                  editable={!isSubmitting}
                />
                {subjectError && (
                  <Text style={[styles.errorText, { color: theme.error.main, textAlign: textDirection }]}>
                    {subjectError}
                  </Text>
                )}
              </View>

              {/* Message Field */}
              <View style={styles.formField}>
                <Text style={[styles.label, { color: theme.text.secondary, textAlign: textDirection }]}>
                  {t('support.message')} <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    {
                      backgroundColor: theme.background.primary,
                      color: theme.text.primary,
                      borderColor: messageError ? theme.error.main : theme.border.main,
                      textAlign: textDirection,
                    },
                  ]}
                  placeholder={t('support.messagePlaceholder')}
                  placeholderTextColor={theme.text.tertiary}
                  value={message}
                  onChangeText={(val) => {
                    setMessage(val);
                    if (val.trim()) setMessageError(null);
                  }}
                  multiline={true}
                  numberOfLines={6}
                  maxLength={1000}
                  editable={!isSubmitting}
                />
                {messageError && (
                  <Text style={[styles.errorText, { color: theme.error.main, textAlign: textDirection }]}>
                    {messageError}
                  </Text>
                )}
              </View>

              {/* Notice */}
              <View style={[styles.noticeContainer, { backgroundColor: isDark ? 'rgba(0, 122, 255, 0.05)' : '#f4f9ff', borderColor: theme.primary.light }]}>
                <View style={{ flexDirection: 'row', gap: 6, [isRTL ? 'marginLeft' : 'marginRight']: 10, alignItems: 'center' }}>
                  <Icon name="logo-whatsapp" size={20} color="#25D366" />
                  <Icon name="paper-plane" size={18} color="#0088cc" />
                </View>
                <Text style={[styles.noticeText, { color: theme.text.secondary, textAlign: textDirection }]}>
                  {isRTL
                    ? 'سيتم إرسال طلبك عبر البريد الإلكتروني. بعد الإرسال، يمكنك اختيار المتابعة عبر واتساب أو تليجرام.'
                    : 'Your ticket will be emailed to support. After submitting, you can choose to follow up directly via WhatsApp or Telegram.'}
                </Text>
              </View>

              {/* Actions */}
              <View style={[styles.actionsContainer, { flexDirection: flexDir }]}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton, { borderColor: theme.border.main }]}
                  onPress={handleCancel}
                  disabled={isSubmitting}
                >
                  <Text style={[styles.buttonText, { color: theme.text.secondary }]}>
                    {isRTL ? 'إلغاء' : 'Cancel'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.submitButton, { backgroundColor: theme.primary.main }]}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color={theme.primary.contrast} />
                  ) : (
                    <Text style={[styles.buttonText, { color: theme.primary.contrast }]}>
                      {t('support.submit')}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  keyboardView: {
    width: '100%',
    maxWidth: 550,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    padding: 20,
  },
  formField: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  required: {
    color: '#EF4444',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 15,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  noticeContainer: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  noticeIcon: {
    marginRight: 10,
    marginLeft: 5,
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  actionsContainer: {
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
    marginHorizontal: 5,
  },
  cancelButton: {
    borderWidth: 1,
  },
  submitButton: {
    flex: 1,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
