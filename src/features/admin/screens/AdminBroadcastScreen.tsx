/**
 * Admin Broadcast Notifications Screen
 * Send notifications to targeted user groups
 * Redesigned with modern UI and full translation support
 */

import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme, useLocalization } from '../../../app/providers';
import { createAdminStyles } from '../admin.styles';
import { useAdminBroadcast } from '../hooks';
import {
  BROADCAST_TARGETS,
  NOTIFICATION_PRIORITIES,
  PRIORITY_COLORS,
  VALIDATION_RULES,
} from '../admin.constants';
import type { BroadcastTarget, NotificationPriority } from '../admin.types';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { ConfirmationModal } from '../components/ConfirmationModal';
import { AdminSidebar } from '../components';
import { ResponsiveContainer } from '../../../shared/components';

export const AdminBroadcastScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { t, isRTL } = useLocalization();
  const styles = useMemo(() => createAdminStyles(theme, isRTL), [theme, isRTL]);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const { history, isLoading, isSending, error, broadcast, loadHistory } = useAdminBroadcast();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [target, setTarget] = useState<BroadcastTarget>('all');
  const [priority, setPriority] = useState<NotificationPriority>('medium');
  const [actionUrl, setActionUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const validateForm = (): string | null => {
    if (!title.trim()) {
      return t('admin.broadcastFormTitleRequired');
    }
    if (title.length > VALIDATION_RULES.BROADCAST_TITLE_MAX) {
      return t('admin.broadcastFormTitleMaxLength');
    }
    if (!body.trim()) {
      return t('admin.broadcastFormMessageRequired');
    }
    if (body.length > VALIDATION_RULES.BROADCAST_BODY_MAX) {
      return t('admin.broadcastFormMessageMaxLength');
    }
    return null;
  };

  const handleSendPress = () => {
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }
    setFormError('');
    setShowConfirmModal(true);
  };

  const handleConfirmSend = async () => {
    setShowConfirmModal(false);
    setFormError('');
    setSuccessMessage('');

    try {
      const result = await broadcast({
        title,
        body,
        target,
        priority,
        actionUrl: actionUrl || undefined,
        imageUrl: imageUrl || undefined,
        scheduledFor: scheduledFor || undefined,
      });

      setSuccessMessage(`${t('admin.notificationSent')} - ${result.recipientCount} ${t('admin.recipientsCount')}`);

      // Reset form
      setTitle('');
      setBody('');
      setActionUrl('');
      setImageUrl('');
      setScheduledFor('');
      setTarget('all');
      setPriority('medium');

      // Reload history
      setTimeout(() => {
        loadHistory();
        setSuccessMessage('');
      }, 3000);
    } catch (err: any) {
      setFormError(err.message || 'Failed to send broadcast');
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const renderTargetOption = (
    targetValue: BroadcastTarget,
    icon: string
  ) => {
    const isSelected = target === targetValue;

    return (
      <TouchableOpacity
        key={targetValue}
        style={[
          localStyles.targetChip,
          isSelected && localStyles.targetChipActive,
        ]}
        onPress={() => setTarget(targetValue)}
      >
        <Ionicons
          name={icon as any}
          size={16}
          color={isSelected ? theme.primary.contrast : theme.text.primary}
          style={{ [isRTL ? 'marginLeft' : 'marginRight']: 6 }}
        />
        <Text
          style={[
            localStyles.targetChipText,
            isSelected && localStyles.targetChipTextActive,
          ]}
        >
          {t(`target.${targetValue}`)}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderPriorityOption = (priorityValue: NotificationPriority) => {
    const color = PRIORITY_COLORS[priorityValue];
    const isSelected = priority === priorityValue;

    return (
      <TouchableOpacity
        key={priorityValue}
        style={[
          localStyles.priorityChip,
          isSelected && { backgroundColor: color },
        ]}
        onPress={() => setPriority(priorityValue)}
      >
        <Text
          style={[
            localStyles.priorityChipText,
            isSelected && { color: theme.primary.contrast },
          ]}
        >
          {t(`priority.${priorityValue}`).toUpperCase()}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderHistoryItem = ({ item }: { item: any }) => {
    const priorityColor = PRIORITY_COLORS[item.priority as NotificationPriority || 'medium'];

    return (
      <View style={localStyles.historyCard}>
        <View style={{ marginBottom: 12 }}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardSubtitle} numberOfLines={2}>
            {item.body}
          </Text>
        </View>

        <View style={localStyles.badgeRow}>
          <View style={[localStyles.badge, { backgroundColor: theme.primary.main + '20' }]}>
            <Text style={[localStyles.badgeText, { color: theme.primary.main }]}>
              {t(`target.${item.target as BroadcastTarget}`) || item.target}
            </Text>
          </View>
          <View style={[localStyles.badge, { backgroundColor: priorityColor + '20' }]}>
            <Text style={[localStyles.badgeText, { color: priorityColor }]}>
              {t(`priority.${item.priority || 'medium'}`).toUpperCase()}
            </Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: isRTL ? 'row-reverse' : 'row',
            justifyContent: 'space-between',
            marginTop: 12,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: theme.border.main,
          }}
        >
          <View style={{ alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
            <Text style={[styles.cardSubtitle, { textAlign: isRTL ? 'right' : 'left' }]}>
              {t('admin.sent')}: {formatDate(item.createdAt || item.sentAt)}
            </Text>
            {item.sender && (
              <Text style={[styles.cardSubtitle, { textAlign: isRTL ? 'right' : 'left' }]}>
                {t('admin.by')}: {item.sender.name}
              </Text>
            )}
            {item.scheduledFor && (
              <Text style={[styles.cardSubtitle, { textAlign: isRTL ? 'right' : 'left', color: theme.warning.main }]}>
                {t('admin.scheduledFor')}: {formatDate(item.scheduledFor)}
              </Text>
            )}
          </View>
          <View style={{ alignItems: isRTL ? 'flex-start' : 'flex-end' }}>
            <Text style={[styles.cardTitle, { fontSize: 20, textAlign: isRTL ? 'left' : 'right' }]}>
              {item.recipientCount || 0}
            </Text>
            <Text style={[styles.cardSubtitle, { textAlign: isRTL ? 'left' : 'right' }]}>{t('admin.recipients')}</Text>
          </View>
        </View>
      </View>
    );
  };

  const localStyles = useMemo(
    () =>
      StyleSheet.create({
        formCard: {
          backgroundColor: theme.background.secondary,
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        },
        targetChip: {
          flexDirection: isRTL ? 'row-reverse' : 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderRadius: 20,
          backgroundColor: theme.background.tertiary,
          marginBottom: 8,
          borderWidth: 2,
          borderColor: 'transparent',
        },
        targetChipActive: {
          backgroundColor: theme.primary.main,
          borderColor: theme.primary.main,
        },
        targetChipText: {
          fontSize: 14,
          fontWeight: '600',
          color: theme.text.primary,
        },
        targetChipTextActive: {
          color: theme.primary.contrast,
        },
        priorityChip: {
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderRadius: 20,
          backgroundColor: theme.background.tertiary,
          [isRTL ? 'marginLeft' : 'marginRight']: 8,
          marginBottom: 8,
        },
        priorityChipText: {
          fontSize: 12,
          fontWeight: '700',
          color: theme.text.primary,
        },
        errorBanner: {
          flexDirection: isRTL ? 'row-reverse' : 'row',
          alignItems: 'center',
          backgroundColor: theme.error.main + '15',
          padding: 12,
          borderRadius: 8,
          marginBottom: 16,
        },
        errorBannerText: {
          flex: 1,
          [isRTL ? 'marginRight' : 'marginLeft']: 8,
          fontSize: 14,
          color: theme.error.main,
          fontWeight: '500',
        },
        successBanner: {
          flexDirection: isRTL ? 'row-reverse' : 'row',
          alignItems: 'center',
          backgroundColor: theme.success.main + '15',
          padding: 12,
          borderRadius: 8,
          marginBottom: 16,
        },
        successBannerText: {
          flex: 1,
          [isRTL ? 'marginRight' : 'marginLeft']: 8,
          fontSize: 14,
          color: theme.success.main,
          fontWeight: '500',
        },
        historyCard: {
          backgroundColor: theme.background.secondary,
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        },
        sectionTitle: {
          fontSize: 18,
          fontWeight: '700',
          color: theme.text.primary,
          textAlign: isRTL ? 'right' : 'left',
          marginBottom: 12,
          marginTop: 8,
        },
        badge: {
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 12,
          marginLeft: isRTL ? 8 : 0,
          marginRight: isRTL ? 0 : 8,
          marginBottom: 4,
        },
        badgeText: {
          fontSize: 11,
          fontWeight: '700',
        },
        badgeRow: {
          flexDirection: isRTL ? 'row-reverse' : 'row',
          flexWrap: 'wrap',
          marginBottom: 12,
        },
      }),
    [theme, isRTL]
  );

  const renderHeader = () => (
    <View style={[styles.header, isDesktop && { backgroundColor: theme.background.secondary, borderBottomColor: theme.ui.border, height: 80, paddingTop: 0, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
      <View style={[styles.headerLeft, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        {!isDesktop && (
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color={theme.text.primary} />
          </TouchableOpacity>
        )}
        <Text style={[styles.headerTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{isDesktop ? t('admin.broadcastOverview') : t('admin.broadcast')}</Text>
      </View>
    </View>
  );

  const renderMainContent = () => (
    <FlatList
      data={history}
      renderItem={renderHistoryItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={theme.primary.main}
        />
      }
      ListHeaderComponent={
        <>
          {/* Broadcast Form */}
          <View style={localStyles.formCard}>
            <Text style={localStyles.sectionTitle}>
              {t('admin.sendNotification')}
            </Text>

            {/* Error Banner */}
            {formError ? (
              <View style={localStyles.errorBanner}>
                <Ionicons name="alert-circle" size={20} color={theme.error.main} />
                <Text style={localStyles.errorBannerText}>{formError}</Text>
              </View>
            ) : null}

            {/* Success Banner */}
            {successMessage ? (
              <View style={localStyles.successBanner}>
                <Ionicons name="checkmark-circle" size={20} color={theme.success.main} />
                <Text style={localStyles.successBannerText}>{successMessage}</Text>
              </View>
            ) : null}

            {/* Title Input */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>{t('admin.notificationTitle')} *</Text>
              <TextInput
                style={styles.formInput}
                placeholder={t('admin.notificationTitlePlaceholder')}
                placeholderTextColor={theme.text.tertiary}
                value={title}
                onChangeText={setTitle}
                maxLength={VALIDATION_RULES.BROADCAST_TITLE_MAX}
              />
              <Text
                style={[
                  styles.cardSubtitle,
                  { textAlign: 'right', marginTop: 4 },
                ]}
              >
                {title.length}/{VALIDATION_RULES.BROADCAST_TITLE_MAX}
              </Text>
            </View>

            {/* Message Input */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>{t('admin.notificationMessage')} *</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea]}
                placeholder={t('admin.notificationMessagePlaceholder')}
                placeholderTextColor={theme.text.tertiary}
                value={body}
                onChangeText={setBody}
                multiline
                numberOfLines={5}
                maxLength={VALIDATION_RULES.BROADCAST_BODY_MAX}
              />
              <Text
                style={[
                  styles.cardSubtitle,
                  { textAlign: 'right', marginTop: 4 },
                ]}
              >
                {body.length}/{VALIDATION_RULES.BROADCAST_BODY_MAX}
              </Text>
            </View>

            {/* Target Audience */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>{t('admin.targetAudience')} *</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {renderTargetOption('all', 'people')}
                {renderTargetOption('premium', 'star')}
                {renderTargetOption('basic', 'person')}
                {renderTargetOption('active', 'pulse')}
                {renderTargetOption('admins', 'shield')}
              </View>
            </View>

            {/* Priority */}
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { textAlign: isRTL ? 'right' : 'left' }]}>{t('admin.priority')} *</Text>
              <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', flexWrap: 'wrap' }}>
                {Object.values(NOTIFICATION_PRIORITIES).map((priorityValue) =>
                  renderPriorityOption(priorityValue as NotificationPriority)
                )}
              </View>
            </View>

            {/* Action URL */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>{t('admin.actionUrl')}</Text>
              <TextInput
                style={styles.formInput}
                placeholder={t('admin.actionUrlPlaceholder')}
                placeholderTextColor={theme.text.tertiary}
                value={actionUrl}
                onChangeText={setActionUrl}
                autoCapitalize="none"
              />
            </View>

            {/* Image URL */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>{t('admin.imageUrl')}</Text>
              <TextInput
                style={styles.formInput}
                placeholder={t('admin.imageUrlPlaceholder')}
                placeholderTextColor={theme.text.tertiary}
                value={imageUrl}
                onChangeText={setImageUrl}
                autoCapitalize="none"
              />
            </View>

            {/* Scheduled For */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>{t('admin.scheduledFor')}</Text>
              <TextInput
                style={styles.formInput}
                placeholder={t('admin.scheduleTime')}
                placeholderTextColor={theme.text.tertiary}
                value={scheduledFor}
                onChangeText={setScheduledFor}
                autoCapitalize="none"
              />
              <Text style={[styles.cardSubtitle, { marginTop: 4, fontSize: 11 }]}>
                {isRTL ? 'اتركه فارغاً للإرسال الفوري (صيغة: YYYY-MM-DD)' : 'Leave empty for immediate send (format: YYYY-MM-DD)'}
              </Text>
            </View>

            {/* Send Button */}
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary]}
              onPress={handleSendPress}
              disabled={isSending}
            >
              {isSending ? (
                <ActivityIndicator size="small" color={theme.primary.contrast} />
              ) : (
                <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center' }}>
                  <Ionicons name="send" size={20} color={theme.primary.contrast} style={{ [isRTL ? 'marginLeft' : 'marginRight']: 8, transform: [{ scaleX: isRTL ? -1 : 1 }] }} />
                  <Text style={[styles.buttonText, styles.buttonTextPrimary]}>
                    {t('admin.sendBroadcast')}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Section Header for History */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('admin.recentBroadcasts')}</Text>
          </View>
        </>
      }
      ListEmptyComponent={
        isLoading && history.length === 0 ? (
          <LoadingState type="list" count={5} />
        ) : error && history.length === 0 ? (
          <View style={[styles.errorContainer, { minHeight: 200 }]}>
            <Ionicons name="alert-circle" size={64} color={theme.error.main} />
            <Text style={styles.errorTitle}>{t('common.error')}</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary]}
              onPress={() => loadHistory()}
            >
              <Text style={[styles.buttonText, styles.buttonTextPrimary]}>
                {t('common.retry')}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <EmptyState
            icon="megaphone-outline"
            title={t('admin.noBroadcastHistory')}
            message={t('admin.noBroadcastMessage')}
          />
        )
      }
    />
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

        {/* Confirmation Modal */}
        <ConfirmationModal
          visible={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmSend}
          title={t('admin.confirmBroadcast')}
          message={`${t('admin.broadcastConfirmSendTo')} ${t(`target.${target}`)}?\n\n${t('admin.notificationTitle')}: ${title}\n\n${t('admin.confirmBroadcastMessage')}`}
          confirmText={t('admin.sendBroadcast')}
          cancelText={t('common.cancel')}
          destructive
          icon="send"
        />
      </View>
    </SafeAreaView>
  );
};
