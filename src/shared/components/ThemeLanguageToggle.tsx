/**
 * Theme and Language Toggle Component
 * Provides UI controls for switching theme and language
 */

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../app/providers/ThemeProvider';
import { useLocalization } from '../../app/providers/LocalizationProvider';

export const ThemeLanguageToggle: React.FC = () => {
  const { theme, themeMode, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLocalization();

  return (
    <View style={styles.container}>
      {/* Theme Toggle */}
      <TouchableOpacity
        style={[
          styles.toggleButton,
          {
            backgroundColor: theme.ui.card,
            borderWidth: 2,
            borderColor: theme.ui.border,
          },
        ]}
        onPress={toggleTheme}
        activeOpacity={0.7}
        accessibilityLabel={`Switch to ${themeMode === 'dark' ? 'light' : 'dark'} mode`}
        accessibilityRole="button"
      >
        <Icon
          name={themeMode === 'dark' ? 'sunny-outline' : 'moon-outline'}
          size={24}
          color={theme.primary.main}
        />
      </TouchableOpacity>

      {/* Language Toggle */}
      <TouchableOpacity
        style={[
          styles.toggleButton,
          {
            backgroundColor: theme.ui.card,
            borderWidth: 2,
            borderColor: theme.ui.border,
          },
        ]}
        onPress={toggleLanguage}
        activeOpacity={0.7}
        accessibilityLabel={`Switch to ${language === 'en' ? 'Arabic' : 'English'}`}
        accessibilityRole="button"
      >
        <Text style={[styles.languageText, { color: theme.primary.main }]}>
          {language === 'en' ? 'ع' : 'EN'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
  },
  toggleButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageText: {
    fontSize: 18,
    fontWeight: '700',
  },
});
