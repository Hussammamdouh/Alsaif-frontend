/**
 * Splash Screen Styles
 * Modern animated splash screen with gradient background
 */

import { StyleSheet } from 'react-native';
import { theme } from '../../core/theme';
import { screen } from '../../core/utils';

export const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },

  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Logo Container - centered in the screen
  logoContainer: {
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing['3xl'],
  },

  logo: {
    width: '100%',
    height: '100%',
  },

  // Text Container - below logo
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing['4xl'],
  },

  title: {
    ...theme.typography.h1,
    fontSize: 32,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    letterSpacing: 0.5,
    textAlign: 'center',
  },

  tagline: {
    ...theme.typography.bodyLarge,
    fontSize: 16,
    color: theme.colors.text.secondary,
    letterSpacing: 0.3,
    textAlign: 'center',
  },

  // Loading Indicator - at the bottom
  progressContainer: {
    position: 'absolute',
    bottom: theme.spacing['5xl'],
    alignItems: 'center',
  },

  progressLabel: {
    ...theme.typography.label,
    fontSize: 12,
    color: theme.colors.primary.main,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.lg,
  },

  // Animated dots loader
  loaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
  },

  loaderDot: {
    width: 8,
    height: 8,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary.main,
  },

  // Legacy styles (kept for compatibility)
  progressBarBackground: {
    width: '100%',
    height: 4,
    backgroundColor: theme.colors.ui.border,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },

  progressBarFill: {
    height: '100%',
    borderRadius: theme.borderRadius.full,
  },

  progressPercentage: {
    ...theme.typography.caption,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
    fontWeight: '600',
  },
});
