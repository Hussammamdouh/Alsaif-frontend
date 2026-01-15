/**
 * Offline Banner Component
 * Shows a banner at the top when network connection is lost
 */

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { theme as staticTheme } from '../../core/theme';
import { useIsOnline } from '../../core/utils/network';
import { useTheme } from '../../app/providers/ThemeProvider';

/**
 * Offline Banner Component
 * Displays a red banner at the top of the screen when offline
 */
export const OfflineBanner: React.FC = () => {
  const isOnline = useIsOnline();
  const { theme } = useTheme();

  // Don't render anything if online
  if (isOnline) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.accent.error }]}>
      <View style={styles.content}>
        <Icon
          name="cloud-offline-outline"
          size={20}
          color={theme.text.inverse}
          style={styles.icon}
        />
        <Text style={[styles.text, { color: theme.text.inverse }]}>No internet connection</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: staticTheme.spacing.sm,
    paddingHorizontal: staticTheme.spacing.lg,
    zIndex: 9999,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    // @ts-ignore - boxShadow is supported on web but not in RN StyleSheet types
    boxShadow: Platform.OS === 'web' ? '0px 2px 3.84px rgba(0,0,0,0.25)' : undefined,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: staticTheme.spacing.sm,
  },
  text: {
    ...staticTheme.typography.bodySmall,
    fontWeight: '600',
  },
});
