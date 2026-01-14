/**
 * Button Component
 * Reusable button with loading state
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { theme as staticTheme } from '../../core/theme';
import { useTheme } from '../../app/providers/ThemeProvider';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: 'button' | 'link' | 'none';
}

export const Button: React.FC<ButtonProps> = React.memo(
  ({
    title,
    onPress,
    loading = false,
    disabled = false,
    variant = 'primary',
    style,
    textStyle,
    accessibilityLabel,
    accessibilityHint,
    accessibilityRole = 'button',
  }) => {
    const { theme } = useTheme();
    const isDisabled = disabled || loading;

    const getButtonStyle = () => {
      if (variant === 'primary') {
        return [
          styles.button,
          { backgroundColor: theme.primary.main },
          isDisabled && styles.disabledButton,
        ];
      }
      if (variant === 'secondary') {
        return [
          styles.button,
          { backgroundColor: 'transparent', borderWidth: 2, borderColor: theme.primary.main },
          isDisabled && styles.disabledButton,
        ];
      }
      return [styles.button, { backgroundColor: 'transparent' }];
    };

    const getTextStyle = () => {
      if (variant === 'primary') {
        return [styles.buttonText, { color: theme.text.inverse }];
      }
      if (variant === 'secondary') {
        return [styles.buttonText, { color: theme.primary.main }];
      }
      return [styles.buttonText, { color: theme.text.secondary }];
    };

    return (
      <TouchableOpacity
        style={[getButtonStyle(), style]}
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        accessibilityLabel={accessibilityLabel || title}
        accessibilityHint={accessibilityHint}
        accessibilityRole={accessibilityRole}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
      >
        {loading ? (
          <ActivityIndicator color={theme.text.inverse} />
        ) : (
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        )}
      </TouchableOpacity>
    );
  }
);

Button.displayName = 'Button';

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: staticTheme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: staticTheme.spacing.lg,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    ...staticTheme.typography.button,
    fontWeight: '700',
  },
});
