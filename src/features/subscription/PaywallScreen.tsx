/**
 * PaywallScreen
 * Premium redesigned paywall with "Website-feel" for desktop
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  useWindowDimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../app/providers/ThemeProvider';
import { useLocalization } from '../../app/providers/LocalizationProvider';
import { ResponsiveContainer } from '../../shared/components';
import { SUBSCRIPTION_THEME } from './SubscriptionDesignSystem';

export const PaywallScreen: React.FC = () => {
  const navigation = useNavigation();
  const { width, height } = useWindowDimensions();
  const isDesktop = width > 1024;
  const isTablet = width > 768 && width <= 1024;
  const { theme, isDark } = useTheme();
  const styles = useMemo(() => getStyles(theme, isDesktop, isTablet, height), [theme, isDesktop, isTablet, height]);
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
      color: theme.primary.main,
      glow: '#22C55E'
    },
    {
      icon: 'chatbubbles-outline',
      title: t('paywall.feature2Title'),
      desc: t('paywall.feature2Desc'),
      color: '#3B82F6',
      glow: '#3B82F6'
    },
    {
      icon: 'shield-checkmark-outline',
      title: t('paywall.feature4Title'),
      desc: t('paywall.feature4Desc'),
      color: '#8B5CF6',
      glow: '#8B5CF6'
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Decorative Background Elements */}
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={isDark ? ['#051505', '#0a0a0a'] : ['#F8FAF8', '#FFFFFF']}
          style={StyleSheet.absoluteFill}
        />
        {isDesktop && (
          <>
            <View style={[styles.ambientGlow, { top: -200, left: -200, backgroundColor: theme.primary.main + '20' }]} />
            <View style={[styles.ambientGlow, { bottom: -200, right: -100, backgroundColor: '#3B82F620' }]} />
          </>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ResponsiveContainer maxWidth={1400}>
          {isDesktop ? (
            /* Desktop Split Hero Layout */
            <View style={styles.desktopHero}>
              <TouchableOpacity style={isDesktop ? styles.desktopBack : styles.backButtonPosition} onPress={handleClose}>
                <View style={styles.backButtonInner}>
                  <Ionicons name="chevron-back" size={24} color={theme.text.primary} />
                </View>
              </TouchableOpacity>
              <View style={styles.heroLeft}>
                <View style={styles.badge}>
                  <Ionicons name="star" size={14} color="#FBBF24" />
                  <Text style={styles.badgeText}>{t('paywall.badge') || 'PREMIUM ACCESS'}</Text>
                </View>
                <Text style={styles.title}>{t('paywall.title')}</Text>
                <Text style={styles.subtitle}>{t('paywall.subtitle')}</Text>

                <TouchableOpacity
                  style={styles.heroCTA}
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
                    <Ionicons name="arrow-forward" size={20} color="#FFF" />
                  </LinearGradient>
                </TouchableOpacity>

                <View style={styles.trustMiniRow}>
                  <View style={styles.trustMiniItem}>
                    <Ionicons name="checkmark-circle" size={16} color={theme.primary.main} />
                    <Text style={styles.trustMiniText}>{t('paywall.cancelAnytime')}</Text>
                  </View>
                  <View style={styles.trustMiniItem}>
                    <Ionicons name="checkmark-circle" size={16} color={theme.primary.main} />
                    <Text style={styles.trustMiniText}>{t('paywall.secure')}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.heroRight}>
                <View style={styles.visualContainer}>
                  {/* Floating Glass Cards to represent "Premium Content" */}
                  <View style={[styles.visualCard, styles.visualCard1]}>
                    <LinearGradient
                      colors={isDark ? ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.02)'] : ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.4)']}
                      style={StyleSheet.absoluteFill}
                    />
                    <View style={styles.cardHeaderSmall}>
                      <View style={[styles.circleSmall, { backgroundColor: theme.primary.main }]} />
                      <View style={styles.lineSmall} />
                    </View>
                    <View style={styles.cardBodySmall}>
                      <View style={styles.barLong} />
                      <View style={styles.barShort} />
                    </View>
                  </View>
                  <View style={[styles.visualCard, styles.visualCard2]}>
                    <LinearGradient
                      colors={[theme.primary.main + '40', theme.primary.main + '10']}
                      style={StyleSheet.absoluteFill}
                    />
                    <Ionicons name="trending-up" size={48} color="#FFF" />
                  </View>
                </View>
              </View>
            </View>
          ) : (
            /* Mobile Hero Layout */
            <View style={styles.hero}>
              <View style={styles.mobileHeader}>
                <TouchableOpacity style={styles.backButtonPosition} onPress={handleClose}>
                  <View style={styles.backButtonInner}>
                    <Ionicons name="chevron-back" size={24} color={theme.text.primary} />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                  <View style={styles.closeButtonInner}>
                    <Ionicons name="close" size={24} color={isDark ? "#FFF" : "#000"} />
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.header}>
                <View style={styles.badge}>
                  <Ionicons name="star" size={14} color="#FBBF24" />
                  <Text style={styles.badgeText}>{t('paywall.badge')}</Text>
                </View>
                <Text style={styles.title}>{t('paywall.title')}</Text>
                <Text style={styles.subtitle}>{t('paywall.subtitle')}</Text>
              </View>
            </View>
          )}

          {/* Features Grid */}
          <View style={styles.featuresContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{isDesktop ? 'Why Choose Premium?' : 'Premium Features'}</Text>
            </View>
            <View style={styles.featuresGrid}>
              {features.map((feature, index) => (
                <View key={index} style={styles.featureCard}>
                  <View style={[styles.featureGlow, { backgroundColor: feature.glow + '10' }]} />
                  <View style={[styles.iconContainer, { backgroundColor: feature.color + '15' }]}>
                    <Ionicons name={feature.icon as any} size={isDesktop ? 32 : 24} color={feature.color} />
                  </View>
                  <View style={styles.featureTextContainer}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDesc}>{feature.desc}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Trust Section */}
          <View style={styles.trustSection}>
            <View style={styles.trustRow}>
              <View style={styles.trustItem}>
                <Ionicons name="lock-closed-outline" size={20} color={theme.text.hint} />
                <Text style={styles.trustText}>{t('paywall.secure')}</Text>
              </View>
              <View style={styles.trustItem}>
                <Ionicons name="calendar-outline" size={20} color={theme.text.hint} />
                <Text style={styles.trustText}>{t('paywall.cancelAnytime')}</Text>
              </View>
              <View style={styles.trustItem}>
                <Ionicons name="shield-outline" size={20} color={theme.text.hint} />
                <Text style={styles.trustText}>{t('paywall.verified')}</Text>
              </View>
            </View>
          </View>

          {!isDesktop && (
            <View style={styles.mobileCTAWrap}>
              <TouchableOpacity
                style={styles.ctaButton}
                activeOpacity={0.8}
                onPress={handleChoosePlan}
              >
                <LinearGradient
                  colors={[theme.primary.main, theme.primary.dark]}
                  style={styles.ctaGradient}
                >
                  <Text style={styles.ctaText}>{t('paywall.explorePlans')}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

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
        </ResponsiveContainer>
      </ScrollView>

      {isDesktop && (
        <TouchableOpacity style={styles.desktopClose} onPress={handleClose}>
          <Ionicons name="close-circle" size={40} color={theme.text.hint} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const getStyles = (theme: any, isDesktop: boolean, isTablet: boolean, height: number) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 80,
  },
  ambientGlow: {
    position: 'absolute',
    width: 600,
    height: 600,
    borderRadius: 300,
    opacity: 0.4,
    filter: Platform.OS === 'web' ? 'blur(100px)' : undefined,
  },
  desktopHero: {
    flexDirection: 'row',
    paddingHorizontal: 60,
    paddingVertical: 100,
    alignItems: 'center',
    gap: 40,
  },
  heroLeft: {
    flex: 1.2,
  },
  heroRight: {
    flex: 0.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: isDesktop ? 'flex-start' : 'center',
    marginBottom: 40,
  },
  closeButton: {
    marginBottom: 20,
  },
  closeButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border.main,
  },
  desktopClose: {
    position: 'absolute',
    top: 40,
    right: 40,
    zIndex: 1000,
  },
  desktopBack: {
    position: 'absolute',
    top: 40,
    left: 40,
    zIndex: 1000,
  },
  mobileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButtonPosition: {
    zIndex: 10,
  },
  backButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border.main,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 30,
    alignSelf: 'flex-start',
    marginBottom: 24,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FBBF24',
    letterSpacing: 1.5,
  },
  title: {
    fontSize: isDesktop ? 64 : 36,
    fontWeight: '900',
    color: theme.text.primary,
    lineHeight: isDesktop ? 72 : 44,
    marginBottom: 20,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: isDesktop ? 22 : 18,
    color: theme.text.secondary,
    lineHeight: isDesktop ? 32 : 26,
    marginBottom: 40,
    maxWidth: 600,
  },
  heroCTA: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: theme.primary.main,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    width: 280,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  ctaText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
  },
  trustMiniRow: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 24,
  },
  trustMiniItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trustMiniText: {
    fontSize: 14,
    color: theme.text.secondary,
    fontWeight: '600',
  },
  visualContainer: {
    width: 400,
    height: 400,
    position: 'relative',
  },
  visualCard: {
    position: 'absolute',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 30,
    padding: 24,
  },
  visualCard1: {
    width: 280,
    height: 200,
    top: 50,
    left: 20,
    zIndex: 1,
    transform: [{ rotate: '-5deg' }],
  },
  visualCard2: {
    width: 180,
    height: 180,
    bottom: 50,
    right: 20,
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '8deg' }],
  },
  cardHeaderSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  circleSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  lineSmall: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  cardBodySmall: {
    gap: 12,
  },
  barLong: {
    width: '100%',
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  barShort: {
    width: '60%',
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  featuresContainer: {
    paddingHorizontal: 24,
    marginTop: isDesktop ? 40 : 20,
  },
  sectionHeader: {
    marginBottom: 32,
    alignItems: isDesktop ? 'flex-start' : 'center',
  },
  sectionTitle: {
    fontSize: isDesktop ? 32 : 24,
    fontWeight: '800',
    color: theme.text.primary,
  },
  featuresGrid: {
    flexDirection: isDesktop ? 'row' : 'column',
    gap: 24,
  },
  featureCard: {
    flex: 1,
    backgroundColor: theme.background.secondary,
    padding: 32,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.border.main,
    position: 'relative',
    overflow: 'hidden',
  },
  featureGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.text.primary,
    marginBottom: 12,
  },
  featureDesc: {
    fontSize: 16,
    color: theme.text.secondary,
    lineHeight: 24,
  },
  trustSection: {
    marginTop: 80,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderTopColor: theme.border.main,
    paddingTop: 40,
  },
  trustRow: {
    flexDirection: isDesktop ? 'row' : 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: isDesktop ? 60 : 24,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  trustText: {
    fontSize: 15,
    color: theme.text.secondary,
    fontWeight: '600',
  },
  mobileCTAWrap: {
    padding: 24,
    marginTop: 40,
  },
  ctaButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
    gap: 12,
  },
  footerLink: {
    fontSize: 14,
    color: theme.text.hint,
    fontWeight: '500',
  },
  linkDot: {
    color: theme.text.hint,
    fontSize: 10,
  },
});
