/**
 * Settings Styles
 * Styles for Settings Screen
 */

import { StyleSheet } from 'react-native';
import { theme } from '../../core/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  headerTitle: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
  },
  headerSpacer: {
    width: 40,
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },

  // Section
  section: {
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.label,
    color: theme.colors.text.secondary,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
  },

  // Setting Row
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.background.secondary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xs,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: theme.spacing.sm,
  },
  settingLabel: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
  },
  settingValue: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    marginRight: theme.spacing.xs,
  },

  // Danger Text
  dangerText: {
    color: '#ff3b30',
  },

  // Bottom Spacer
  bottomSpacer: {
    height: theme.spacing.xl,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    width: '90%',
    maxWidth: 400,
    ...theme.shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  modalTitle: {
    ...theme.typography.h3,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  modalDescription: {
    ...theme.typography.body,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },

  // Input
  input: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.typography.body,
    color: theme.colors.text.primary,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },

  // Modal Buttons
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
  },
  modalButton: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: theme.spacing.xs,
  },
  modalButtonCancel: {
    backgroundColor: theme.colors.background.secondary,
  },
  modalButtonConfirm: {
    backgroundColor: theme.colors.primary.main,
  },
  modalButtonDanger: {
    backgroundColor: '#ff3b30',
  },
  modalButtonText: {
    ...theme.typography.button,
    color: theme.colors.text.inverse,
  },
  modalButtonTextCancel: {
    ...theme.typography.button,
    color: theme.colors.text.primary,
  },

  // Device Management
  deviceModalContent: {
    maxHeight: '80%',
  },
  deviceList: {
    maxHeight: 400,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.background.secondary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  deviceIcon: {
    marginRight: theme.spacing.sm,
    marginTop: 2,
  },
  deviceDetails: {
    flex: 1,
  },
  deviceName: {
    ...theme.typography.bodyBold,
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  deviceMeta: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: 2,
  },
  currentDeviceLabel: {
    ...theme.typography.caption,
    color: theme.colors.primary.main,
    marginTop: 4,
    fontWeight: '600',
  },
  revokeButton: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
  },
  revokeButtonText: {
    ...theme.typography.button,
    color: theme.colors.text.inverse,
    fontSize: 14,
  },

  // Picker Options
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xs,
    backgroundColor: theme.colors.background.secondary,
  },
  pickerOptionSelected: {
    backgroundColor: '#007AFF15',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  pickerOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerIcon: {
    marginRight: theme.spacing.sm,
  },
  pickerOptionText: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
  },
  pickerOptionTextSelected: {
    ...theme.typography.bodyBold,
    color: '#007AFF',
  },

  // Notification Preferences Modal
  notificationModalContent: {
    maxHeight: '80%',
    width: '95%',
  },
  notificationScrollView: {
    maxHeight: 500,
  },
  notificationCategoryTitle: {
    ...theme.typography.h4,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    paddingBottom: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  notificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
  },
  notificationLabel: {
    ...theme.typography.body,
    color: theme.colors.text.primary,
  },

  // Deletion Banner
  deletionBanner: {
    backgroundColor: '#fff3cd',
    borderBottomWidth: 2,
    borderBottomColor: '#ff3b30',
    padding: theme.spacing.md,
  },
  deletionBannerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  deletionIcon: {
    marginRight: theme.spacing.sm,
    marginTop: 2,
  },
  deletionText: {
    flex: 1,
  },
  deletionTitle: {
    ...theme.typography.bodyBold,
    color: '#856404',
    marginBottom: 4,
  },
  deletionDescription: {
    ...theme.typography.body,
    color: '#856404',
    fontSize: 13,
  },
  cancelDeletionButton: {
    backgroundColor: '#ff3b30',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  cancelDeletionText: {
    ...theme.typography.button,
    color: '#fff',
  },

  // Password Strength Meter
  passwordStrengthContainer: {
    marginBottom: theme.spacing.sm,
  },
  passwordStrengthBar: {
    height: 4,
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: theme.spacing.xs,
  },
  passwordStrengthFill: {
    height: '100%',
    borderRadius: 2,
    transition: 'width 0.3s ease',
  },
  passwordStrengthLabel: {
    ...theme.typography.caption,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  passwordFeedback: {
    marginTop: theme.spacing.xs,
  },
  passwordFeedbackText: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginBottom: 2,
  },
});
