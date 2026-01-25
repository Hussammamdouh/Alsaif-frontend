/**
 * Login Screen Styles
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
        paddingBottom: theme.spacing.lg, // Reduced from 4xl for desktop readiness
    },
    desktopWrapper: {
        flex: 1,
        justifyContent: 'center',
        paddingVertical: theme.spacing.md, // Reduced from xl
    },
    loginCard: {
        borderRadius: theme.borderRadius['2xl'],
        padding: theme.spacing.xl, // Reduced from 2xl for ultra-compact
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
        marginBottom: theme.spacing.md, // Reduced from xl
        marginTop: 0, // Removed top margin on desktop
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    logoImageContainer: {
        width: 48, // Reduced from 60
        height: 48, // Reduced from 60
        borderRadius: theme.borderRadius.lg,
        backgroundColor: theme.colors.ui.card,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.sm,
        ...theme.shadows.md,
    },
    logoImage: {
        width: 32, // Reduced from 44
        height: 32, // Reduced from 44
    },
    logoText: {
        ...theme.typography.h3,
        fontSize: 24,
        color: theme.colors.text.primary,
        fontWeight: '700',
        letterSpacing: 0.5,
    },

    title: {
        ...theme.typography.h1,
        fontSize: 28,
        color: theme.colors.text.primary,
        fontWeight: '800',
        marginBottom: theme.spacing.xs,
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

    // Forgot Password Link
    forgotPasswordContainer: {
        alignItems: 'flex-end',
        marginTop: -theme.spacing.xs,
        marginBottom: theme.spacing.lg,
    },
    forgotPasswordText: {
        ...theme.typography.bodySmall,
        fontSize: 14,
        color: theme.colors.primary.main,
        fontWeight: '600',
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

    // Login Button
    loginButton: {
        marginTop: theme.spacing.md, // Reduced from lg
    },

    // Security Section
    securitySection: {
        marginTop: theme.spacing.xl, // Reduced from 4xl
        alignItems: 'center',
    },
    securityDivider: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: theme.spacing.lg, // Reduced from 2xl
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: theme.colors.ui.border,
        opacity: 0.5,
    },
    securityText: {
        ...theme.typography.caption,
        fontSize: 11,
        color: theme.colors.text.tertiary,
        fontWeight: '700',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        marginHorizontal: theme.spacing.md, // Reduced from lg
    },

    // Biometric Section
    biometricContainer: {
        alignItems: 'center',
        marginTop: theme.spacing.lg,
    },
    biometricIconContainer: {
        width: 70,
        height: 70,
        borderRadius: theme.borderRadius.full,
        backgroundColor: `${theme.colors.primary.main}15`,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.md,
        ...theme.shadows.sm,
    },
    biometricText: {
        ...theme.typography.bodySmall,
        fontSize: 14,
        color: theme.colors.primary.main,
        fontWeight: '600',
    },
    encryptionBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: `${theme.colors.accent.success}10`,
        borderRadius: theme.borderRadius.full,
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.lg,
        marginTop: theme.spacing.xl,
    },
    encryptionText: {
        ...theme.typography.caption,
        fontSize: 12,
        color: theme.colors.text.tertiary,
        marginLeft: theme.spacing.xs,
        fontWeight: '600',
    },

    // Footer - Sign Up Link
    footer: {
        alignItems: 'center',
        marginTop: theme.spacing.lg, // Reduced from 2xl
        paddingTop: 0,
    },
    footerText: {
        ...theme.typography.body,
        fontSize: 14,
        color: theme.colors.text.secondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    signUpLink: {
        color: theme.colors.primary.main,
        fontWeight: '700',
        textDecorationLine: 'underline',
    },

    // Icon Styles
    iconStyle: {
        marginRight: theme.spacing.xs,
    },
});
