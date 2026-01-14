import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../app/providers';

interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  iconColor?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'file-tray-outline',
  title,
  message,
  actionLabel,
  onActionPress,
  iconColor,
}) => {
  const { theme } = useTheme();
  const effectiveIconColor = iconColor || theme.text.tertiary;

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: `${effectiveIconColor}15` }]}>
        <Ionicons name={icon as any} size={64} color={effectiveIconColor} />
      </View>

      <Text style={[styles.title, { color: theme.text.primary }]}>{title}</Text>

      {message && (
        <Text style={[styles.message, { color: theme.text.secondary }]}>
          {message}
        </Text>
      )}

      {actionLabel && onActionPress && (
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.primary.main }]}
          onPress={onActionPress}
          activeOpacity={0.7}
        >
          <Text style={[styles.actionButtonText, { color: theme.primary.contrast }]}>
            {actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  actionButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonText: {
    fontSize: 17,
    fontWeight: '700',
  },
});
