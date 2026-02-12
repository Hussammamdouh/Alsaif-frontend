/**
 * App Providers
 * Centralized provider setup for global state, theme, etc.
 */

import React, { PropsWithChildren } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../auth/AuthProvider';
import { OfflineBanner } from '../../shared/components/OfflineBanner';
import { ThemeProvider } from './ThemeProvider';
import { LocalizationProvider } from './LocalizationProvider';
import { NotificationProvider } from './NotificationProvider';

/**
 * App Providers Component
 * Wraps the app with necessary providers
 */
export const AppProviders: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <View style={styles.container}>
      <SafeAreaProvider>
        <ThemeProvider>
          <LocalizationProvider>
            <AuthProvider>
              <NotificationProvider>
                {children}
                <OfflineBanner />
              </NotificationProvider>
            </AuthProvider>
          </LocalizationProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
