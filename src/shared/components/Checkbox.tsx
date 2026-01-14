/**
 * Checkbox Component
 * Reusable checkbox with custom styling
 */

import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../../core/theme';

interface CheckboxProps {
  checked: boolean;
  onToggle: () => void;
  size?: number;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const Checkbox: React.FC<CheckboxProps> = React.memo(
  ({ checked, onToggle, size = 24, accessibilityLabel, accessibilityHint }) => {
    return (
      <TouchableOpacity
        onPress={onToggle}
        activeOpacity={0.7}
        accessibilityLabel={accessibilityLabel || 'Checkbox'}
        accessibilityHint={accessibilityHint}
        accessibilityRole="checkbox"
        accessibilityState={{ checked }}
        style={[
          styles.container,
          {
            width: size,
            height: size,
            borderRadius: size / 4,
          },
          checked && styles.checked,
        ]}
      >
        {checked && (
          <Icon
            name="checkmark"
            size={size * 0.7}
            color={theme.colors.text.primary}
          />
        )}
      </TouchableOpacity>
    );
  }
);

Checkbox.displayName = 'Checkbox';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.ui.border,
    backgroundColor: 'transparent',
  },
  checked: {
    backgroundColor: theme.colors.primary.main,
    borderColor: theme.colors.primary.main,
  },
});
