/**
 * Theme Provider
 * Manages theme switching between light and dark modes
 */

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { darkColors, lightColors, ColorPalette } from '../../core/theme/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: any;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@elsaif_analysis_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('auto');

  // Load theme from storage on mount
  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'auto') {
        setThemeModeState(savedTheme as ThemeMode);
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  };

  const saveTheme = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const isActuallyDark = useMemo(() => {
    if (themeMode === 'auto') {
      return systemColorScheme === 'dark';
    }
    return themeMode === 'dark';
  }, [themeMode, systemColorScheme]);

  const theme = useMemo(() => {
    const selectedTheme = isActuallyDark ? darkColors : lightColors;
    return selectedTheme;
  }, [isActuallyDark]);

  const toggleTheme = useCallback(() => {
    const newMode = isActuallyDark ? 'light' : 'dark';
    setThemeModeState(newMode);
    saveTheme(newMode);
  }, [isActuallyDark]);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    saveTheme(mode);
  }, []);

  const value = useMemo(
    () => ({
      theme,
      themeMode,
      toggleTheme,
      setThemeMode,
      isDark: isActuallyDark,
    }),
    [theme, themeMode, toggleTheme, setThemeMode, isActuallyDark]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
