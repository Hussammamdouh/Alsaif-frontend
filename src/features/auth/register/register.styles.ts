/**
 * Registration Screen Styles
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
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing['4xl'],
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
    marginTop: theme.spacing.sm,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  logoImageContainer: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.ui.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
    ...theme.shadows.md,
  },
  logoImage: {
    width: 40,
    height: 40,
  },
  logoText: {
    ...theme.typography.h4,
    fontSize: 22,
    color: theme.colors.text.primary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  title: {
    ...theme.typography.h2,
    fontSize: 26,
    color: theme.colors.text.primary,
    fontWeight: '800',
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  subtitle: {
    ...theme.typography.body,
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: theme.spacing.md,
  },

  // Form Section
  formContainer: {
    marginTop: theme.spacing.lg,
  },

  // Password Strength Indicator
  passwordStrengthContainer: {
    marginTop: -theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  strengthBarsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.ui.border,
    opacity: 0.3,
  },
  strengthBarActive: {
    backgroundColor: theme.colors.accent.success,
  },
  strengthBarWeak: {
    backgroundColor: '#EF4444',
    opacity: 1,
  },
  strengthBarMedium: {
    backgroundColor: '#F59E0B',
    opacity: 1,
  },
  strengthBarStrong: {
    backgroundColor: theme.colors.accent.success,
    opacity: 1,
  },
  strengthText: {
    ...theme.typography.caption,
    fontSize: 11,
    color: theme.colors.text.secondary,
    fontWeight: '600',
  },
  strengthTextWeak: {
    color: '#EF4444',
  },
  strengthTextMedium: {
    color: '#F59E0B',
  },
  strengthTextStrong: {
    color: theme.colors.accent.success,
  },

  // Terms & Conditions
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  termsText: {
    ...theme.typography.bodySmall,
    fontSize: 13,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.sm,
    flex: 1,
    lineHeight: 19,
  },
  termsLink: {
    color: theme.colors.primary.main,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  termsError: {
    ...theme.typography.caption,
    fontSize: 12,
    color: theme.colors.accent.error,
    marginTop: -theme.spacing.sm,
    marginLeft: theme.spacing['2xl'],
    marginBottom: theme.spacing.sm,
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

  // Sign Up Button
  signUpButton: {
    marginTop: theme.spacing.lg,
  },

  // Footer
  footer: {
    alignItems: 'center',
    marginTop: theme.spacing['2xl'],
    paddingTop: theme.spacing.md,
  },
  footerText: {
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
});
