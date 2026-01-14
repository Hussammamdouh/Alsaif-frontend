/**
 * Loading Screen Component
 * Shown during app bootstrap and session verification
 */

import React, { useMemo } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

import { theme as staticTheme } from '../../core/theme';
import { useTheme } from '../../app/providers/ThemeProvider';
import { useLocalization } from '../../app/providers/LocalizationProvider';

interface LoadingScreenProps {
  message?: string;
}

/**
 * Loading Screen Component
 * Displays a centered loading indicator with optional message
 */
export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading...',
}) => {
  const { theme } = useTheme();
  const { t } = useLocalization();

  // Dynamic container style
  const containerStyle = useMemo(() => ({
    flex: 1,
    backgroundColor: theme.background.primary,
  }), [theme.background.primary]);

  return (
    <SafeAreaView style={containerStyle} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {/* Logo Icon */}
        <View style={[styles.logoIconContainer, { backgroundColor: theme.ui.card }]}>
          <Icon
            name="analytics-outline"
            size={48}
            color={theme.primary.main}
          />
        </View>

        {/* Loading Indicator */}
        <ActivityIndicator
          size="large"
          color={theme.primary.main}
          style={styles.loader}
        />

        {/* Loading Message */}
        {message && <Text style={[styles.message, { color: theme.text.secondary }]}>{message}</Text>}

        {/* App Name */}
        <Text style={[styles.appName, { color: theme.text.primary }]}>{t('common.appName')}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: staticTheme.spacing.lg,
  },
  logoIconContainer: {
    width: 96,
    height: 96,
    borderRadius: staticTheme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: staticTheme.spacing['3xl'],
  },
  loader: {
    marginBottom: staticTheme.spacing.lg,
  },
  message: {
    ...staticTheme.typography.body,
    textAlign: 'center',
    marginBottom: staticTheme.spacing.md,
  },
  appName: {
    ...staticTheme.typography.h3,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
