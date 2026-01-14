/**
 * PaywallScreen
 * Premium redesigned paywall with glassmorphism and indigo gradients
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ImageBackground,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../app/providers/ThemeProvider';
import { useLocalization } from '../../app/providers/LocalizationProvider';

const { width, height } = Dimensions.get('window');

export const PaywallScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const { t } = useLocalization();

  const handleChoosePlan = () => {
    navigation.navigate('SubscriptionPlans' as never);
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const features = [
    {
      icon: 'sparkles-outline',
      title: t('paywall.feature1Title'),
      desc: t('paywall.feature1Desc'),
      color: theme.primary.main
    },
    {
      icon: 'chatbubbles-outline',
      title: t('paywall.feature2Title'),
      desc: t('paywall.feature2Desc'),
      color: theme.primary.light
    },
    {
      icon: 'shield-checkmark-outline',
      title: t('paywall.feature4Title'),
      desc: t('paywall.feature4Desc'),
      color: theme.primary.light
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Background Gradient */}
      <LinearGradient
        colors={isDark ? [theme.background.primary, '#1a2e1a', '#0a1a0a'] : ['#FFFFFF', '#FFFFFF', '#FFFFFF']}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.hero}>
          <LinearGradient
            colors={isDark ? [theme.primary.main + '30', 'transparent'] : ['rgba(0,0,0,0.03)', 'transparent']}
            style={styles.heroGradient}
          />

          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <View style={[styles.closeButtonInner, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
              <Ionicons name="close" size={24} color={isDark ? "#FFF" : "#000"} />
            </View>
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.badge}>
              <Ionicons name="star" size={14} color="#FBBF24" />
              <Text style={styles.badgeText}>{t('paywall.badge')}</Text>
            </View>
            <Text style={styles.title}>{t('paywall.title')}</Text>
            <Text style={styles.subtitle}>
              {t('paywall.subtitle')}
            </Text>
          </View>
        </View>

        {/* Features List */}
        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.02)']}
                style={styles.cardGradient}
              />
              <View style={[styles.iconContainer, { backgroundColor: feature.color + '20' }]}>
                <Ionicons name={feature.icon as any} size={24} color={feature.color} />
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDesc}>{feature.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Trust Section */}
        <View style={styles.trustSection}>
          <View style={styles.divider} />
          <View style={styles.trustRow}>
            <View style={styles.trustItem}>
              <Ionicons name="lock-closed-outline" size={16} color="rgba(255,255,255,0.6)" />
              <Text style={styles.trustText}>{t('paywall.secure')}</Text>
            </View>
            <View style={styles.trustItem}>
              <Ionicons name="calendar-outline" size={16} color="rgba(255,255,255,0.6)" />
              <Text style={styles.trustText}>{t('paywall.cancelAnytime')}</Text>
            </View>
            <View style={styles.trustItem}>
              <Ionicons name="shield-outline" size={16} color="rgba(255,255,255,0.6)" />
              <Text style={styles.trustText}>{t('paywall.verified')}</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Floating CTA Area */}
      <View style={styles.ctaContainer}>
        <LinearGradient
          colors={theme.isDark
            ? ['transparent', 'rgba(18, 18, 18, 0.9)', '#121212']
            : ['transparent', 'rgba(255, 255, 255, 0.9)', '#FFFFFF']
          }
          style={styles.ctaBlur}
        />
        <TouchableOpacity
          style={styles.ctaButton}
          activeOpacity={0.8}
          onPress={handleChoosePlan}
        >
          <LinearGradient
            colors={[theme.primary.main, theme.primary.dark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaText}>{t('paywall.explorePlans')}</Text>
            <Ionicons name="chevron-forward" size={20} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.footerLinks}>
          <TouchableOpacity onPress={() => {/* Restore */ }}>
            <Text style={styles.footerLink}>{t('paywall.restore')}</Text>
          </TouchableOpacity>
          <Text style={styles.linkDot}>•</Text>
          <TouchableOpacity onPress={() => {/* Terms */ }}>
            <Text style={styles.footerLink}>{t('paywall.terms')}</Text>
          </TouchableOpacity>
          <Text style={styles.linkDot}>•</Text>
          <TouchableOpacity onPress={() => {/* Privacy */ }}>
            <Text style={styles.footerLink}>{t('paywall.privacy')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 160,
  },
  hero: {
    height: height * 0.45,
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 24,
    position: 'relative',
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    zIndex: 10,
  },
  closeButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
  },
  header: {
    zIndex: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FBBF24',
    letterSpacing: 1,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: theme.text.primary,
    lineHeight: 42,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: theme.text.secondary,
    lineHeight: 24,
  },
  featuresContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
  },
  cardGradient: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.text.primary,
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 13,
    color: theme.text.secondary,
    lineHeight: 18,
  },
  trustSection: {
    marginTop: 40,
    paddingHorizontal: 24,
  },
  divider: {
    height: 1,
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    marginBottom: 20,
  },
  trustRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trustText: {
    fontSize: 12,
    color: theme.text.secondary,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 40,
  },
  ctaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  ctaBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  ctaButton: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: theme.primary.main,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  ctaText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  footerLink: {
    fontSize: 12,
    color: theme.text.secondary,
    fontWeight: '500',
  },
  linkDot: {
    color: theme.text.hint,
  },
});
