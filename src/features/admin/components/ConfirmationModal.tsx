/**
 * ConfirmationModal Component
 * Alert-style modal for confirming destructive actions
 */

import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, useLocalization } from '../../../app/providers';

interface ConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  icon?: string;
  iconColor?: string;
  loading?: boolean;
  customContent?: React.ReactNode;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  destructive = false,
  icon,
  iconColor,
  loading = false,
  customContent,
}) => {
  const { theme, isDark } = useTheme();
  const { t } = useLocalization();
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error('Confirmation action failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const isLoading = loading || isProcessing;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.ui.card }]}>
          {icon && (
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: iconColor
                    ? `${iconColor}20`
                    : destructive
                      ? `${theme.error.main}20`
                      : `${theme.primary.main}20`,
                },
              ]}
            >
              <Ionicons
                name={icon as any}
                size={32}
                color={iconColor || (destructive ? theme.error.main : theme.primary.main)}
              />
            </View>
          )}

          <Text style={[styles.title, { color: theme.text.primary }]}>{title}</Text>
          <Text style={[styles.message, { color: theme.text.secondary }]}>{message}</Text>

          {customContent}

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.cancelButton,
                { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }
              ]}
              onPress={onClose}
              activeOpacity={0.7}
              disabled={isLoading}
            >
              <Text style={[styles.cancelButtonText, { color: theme.text.primary }]}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                { backgroundColor: theme.primary.main },
                destructive && { backgroundColor: theme.error.main },
                isLoading && styles.buttonDisabled,
              ]}
              onPress={handleConfirm}
              activeOpacity={0.7}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={theme.primary.contrast} size="small" />
              ) : (
                <Text
                  style={[
                    styles.confirmButtonText,
                    { color: theme.primary.contrast },
                    destructive && styles.destructiveButtonText,
                  ]}
                >
                  {confirmText}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  container: {
    borderRadius: 14,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelButton: {
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  destructiveButton: {
  },
  destructiveButtonText: {
    color: '#fff',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
