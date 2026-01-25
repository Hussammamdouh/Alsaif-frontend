/**
 * Reset Password Screen Styles
 * Following the established design patterns from Login/Register screens
 */

import { StyleSheet } from 'react-native';
import { theme } from '../../../core/theme';

export const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing['3xl'],
    paddingBottom: theme.spacing['4xl'],
  },
  desktopWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
  },
  loginCard: {
    borderRadius: theme.borderRadius['2xl'],
    padding: theme.spacing.xl, // Reduced from 2xl
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
    fontSize: 28,
    color: theme.colors.text.primary,
    fontWeight: '800',
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: theme.spacing.md,
  },
  emailText: {
    fontSize: 15,
    color: theme.colors.text.primary,
    fontWeight: '600',
    marginTop: theme.spacing.xs,
  },

  // Form Section
  formContainer: {
    marginTop: theme.spacing.xl,
  },

  // Code Input Helper
  codeHelper: {
    fontSize: 14,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
    marginTop: -theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },

  // Password Requirements
  requirementsContainer: {
    marginTop: -theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  requirementText: {
    fontSize: 13,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.xs,
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
    flex: 1,
    fontSize: 14,
    color: theme.colors.accent.error,
    fontWeight: '600',
  },

  // Success Message
  successContainer: {
    backgroundColor: `${theme.colors.accent.success}15`,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.accent.success,
    borderRadius: theme.borderRadius.lg,
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
    ...theme.shadows.sm,
  },
  successTitle: {
    fontSize: 24,
    color: theme.colors.text.primary,
    fontWeight: '700',
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  successText: {
    fontSize: 15,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Submit Button
  submitButton: {
    marginTop: theme.spacing.md,
  },

  // Login Button (after success)
  loginButton: {
    marginTop: theme.spacing.xl,
  },

  // Back to Login Link
  footer: {
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  backToLoginText: {
    fontSize: 15,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  loginLink: {
    color: theme.colors.primary.main,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
