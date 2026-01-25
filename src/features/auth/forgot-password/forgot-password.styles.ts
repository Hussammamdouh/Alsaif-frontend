/**
 * Forgot Password Screen Styles
 * Modern animated design with premium feel
 */

import { StyleSheet } from 'react-native';
import { theme } from '../../../core/theme';

export const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing['4xl'],
    paddingBottom: theme.spacing.lg,
  },
  desktopWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
  },
  loginCard: {
    borderRadius: theme.borderRadius['2xl'],
    padding: theme.spacing.xl,
    width: '100%',
    maxWidth: 580,
    alignSelf: 'center',
    ...theme.shadows.lg,
    borderWidth: 1,
  },
  absoluteToggles: {
    position: 'absolute',
    top: theme.spacing.xl,
    right: theme.spacing.xl,
    zIndex: 10,
  },

  // Theme and Language Toggles
  togglesContainer: {
    alignSelf: 'flex-end',
    marginBottom: theme.spacing.md,
  },

  // Header Section
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  iconContainer: {
    width: 64, // Reduced from 90
    height: 64, // Reduced from 90
    borderRadius: theme.borderRadius.full,
    backgroundColor: `${theme.colors.primary.main}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },

  title: {
    ...theme.typography.h1,
    fontSize: 28,
    color: theme.colors.text.primary,
    fontWeight: '800',
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  subtitle: {
    ...theme.typography.body,
    fontSize: 15,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: theme.spacing.md,
  },

  // Form Section
  formContainer: {
    marginTop: theme.spacing.xl,
  },

  // Error Message
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.accent.error}15`,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.accent.error,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  errorIcon: {
    marginRight: theme.spacing.sm,
  },
  errorText: {
    ...theme.typography.bodySmall,
    flex: 1,
    fontSize: 13,
    color: theme.colors.accent.error,
    fontWeight: '600',
    lineHeight: 18,
  },

  // Success Message
  successContainer: {
    backgroundColor: `${theme.colors.accent.success}15`,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.accent.success,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    marginTop: theme.spacing.xl,
    alignItems: 'center',
  },
  successIconContainer: {
    width: 70,
    height: 70,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.accent.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  successTitle: {
    ...theme.typography.h3,
    fontSize: 24,
    color: theme.colors.text.primary,
    fontWeight: '700',
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  successText: {
    ...theme.typography.body,
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Submit Button
  submitButton: {
    marginTop: theme.spacing.lg,
  },

  // Back to Login Link
  footer: {
    alignItems: 'center',
    marginTop: theme.spacing.lg, // Reduced from xl
  },
  backToLoginText: {
    ...theme.typography.body,
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  loginLink: {
    color: theme.colors.primary.main,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },

  // Resend Button (for success state)
  resendButton: {
    marginTop: theme.spacing.xl,
    paddingVertical: theme.spacing.sm,
  },
  resendButtonText: {
    ...theme.typography.body,
    fontSize: 14,
    color: theme.colors.primary.main,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
