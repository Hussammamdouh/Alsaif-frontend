/**
 * Input Component
 * Reusable text input with icon support and error handling
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { theme as staticTheme } from '../../core/theme';
import { useTheme } from '../../app/providers/ThemeProvider';

interface InputProps extends TextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const Input: React.FC<InputProps> = React.memo(
  ({
    label,
    value,
    onChangeText,
    error,
    leftIcon,
    rightIcon,
    containerStyle,
    accessibilityLabel,
    accessibilityHint,
    ...textInputProps
  }) => {
    const { theme } = useTheme();

    const handleFocus = useCallback(() => {
      // Focus handling if needed
    }, []);

    const handleBlur = useCallback(() => {
      // Blur handling if needed
    }, []);

    return (
      <View style={[styles.container, containerStyle]}>
        {/* Label */}
        <Text style={[styles.label, { color: theme.text.secondary }]}>{label}</Text>

        {/* Input Container */}
        <View
          style={[
            styles.inputContainer,
            {
              borderColor: error ? theme.accent.error : theme.ui.border,
              backgroundColor: theme.ui.card,
            },
          ]}
        >
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

          <TextInput
            style={[styles.input, leftIcon && styles.inputWithLeftIcon, { color: theme.text.primary }]}
            value={value}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholderTextColor={theme.text.tertiary}
            accessibilityLabel={accessibilityLabel || label}
            accessibilityHint={accessibilityHint}
            {...textInputProps}
          />

          {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        </View>

        {/* Error Message */}
        {error && (
          <Text style={[styles.errorText, { color: theme.accent.error }]}>
            {error}
          </Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    marginBottom: staticTheme.spacing.md,
  },
  label: {
    ...staticTheme.typography.label,
    marginBottom: staticTheme.spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderWidth: 1,
    borderRadius: staticTheme.borderRadius.md,
    paddingHorizontal: staticTheme.spacing.md,
  },
  input: {
    flex: 1,
    ...staticTheme.typography.body,
    padding: 0,
  },
  inputWithLeftIcon: {
    marginLeft: staticTheme.spacing.sm,
  },
  leftIcon: {
    marginRight: staticTheme.spacing.sm,
  },
  rightIcon: {
    marginLeft: staticTheme.spacing.sm,
  },
  errorText: {
    ...staticTheme.typography.caption,
    marginTop: staticTheme.spacing.xs,
  },
});
