/**
 * SubscriptionPlansScreen
 * Premium redesigned plans screen with a professional "Website-feel"
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, StatusBar, useWindowDimensions, Alert, Animated, TextInput, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { PlanSkeleton } from './components/PlanSkeleton';
import {
  useSubscriptionPlans,
  useCheckout,
  useSystemSettings,
} from './subscription.hooks';
import { BillingCycle, PromoValidation } from './subscription.types';
import { formatCurrency } from './subscription.mapper';
import { useTheme } from '../../app/providers/ThemeProvider';
import { useLocalization } from '../../app/providers/LocalizationProvider';
import { SubscriptionTermsModal } from './components/SubscriptionTermsModal';
import { MESSAGES } from './subscription.constants';
import { AuthRequiredGate, ResponsiveContainer } from '../../shared/components';
import { SUBSCRIPTION_THEME } from './SubscriptionDesignSystem';

export const SubscriptionPlansScreen: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const isDesktop = width > 1024;
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();
  const { t } = useLocalization();

  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [pendingPlanId, setPendingPlanId] = useState<string | null>(null);

  const { plans: allPlans, loading: plansLoading } = useSubscriptionPlans();
  const { settings, loading: settingsLoading } = useSystemSettings();
  const { loading: checkoutLoading, initiateCheckout, validatePromoCode } = useCheckout();

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoValidation | null>(null);
  const [validatingPromo, setValidatingPromo] = useState(false);

  // Animation values
  const toggleAnim = useRef(new Animated.Value(billingCycle === 'monthly' ? 0 : 1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const loading = plansLoading || settingsLoading;
  const plans = allPlans.filter(p => p.billingCycle === billingCycle);

  const handleClose = () => {
    navigation.goBack();
  };

  useEffect(() => {
    Animated.timing(toggleAnim, {
      toValue: billingCycle === 'monthly' ? 0 : 1,
      duration: 300,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: false,
    }).start();

    // Fade effect for plans list
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0.8, duration: 100, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }, [billingCycle]);

  const handleSelectPlan = (planId: string) => {
    if (!planId) return;
    setPendingPlanId(planId);
    setShowTermsModal(true);
  };

  const handleTermsAccepted = async () => {
    if (pendingPlanId) {
      const success = await initiateCheckout(pendingPlanId, billingCycle, appliedPromo?.code);
      if (success) {
        setShowTermsModal(false);
        setPendingPlanId(null);
      }
    } else {
      setShowTermsModal(false);
    }
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setValidatingPromo(true);

    // Try to validate against the most likely targeted plan
    // If we have a featured plan, use its tier, otherwise use 'premium'
    const featuredPlan = plans.find(p => p.isFeatured || ['premium', 'pro', 'enterprise'].includes(p.tier));
    const targetTier = featuredPlan?.tier || 'premium';

    try {
      const result = await validatePromoCode(promoCode.trim(), targetTier, billingCycle);
      if (result) {
        setAppliedPromo(result);
        Alert.alert('Success', MESSAGES.PROMO_APPLIED);
      } else {
        setAppliedPromo(null);
        Alert.alert('Error', MESSAGES.PROMO_INVALID);
      }
    } catch (err) {
      setAppliedPromo(null);
      Alert.alert('Error', MESSAGES.PROMO_INVALID);
    } finally {
      setValidatingPromo(false);
    }
  };

  const getPriceData = (plan: any) => {
    const basePrice = Number(plan.price) || 0;
    let displayPrice = basePrice;
    let hasDiscount = false;

    if (appliedPromo) {
      if (appliedPromo.type === 'percentage') {
        displayPrice = basePrice * (1 - (Number(appliedPromo.value) || 0) / 100);
        hasDiscount = true;
      } else if (appliedPromo.type === 'fixed_amount') {
        displayPrice = Math.max(0, basePrice - (Number(appliedPromo.value) || 0));
        hasDiscount = true;
      }
    }

    const formattedPrice = isNaN(displayPrice) ? basePrice.toString() : (displayPrice % 1 === 0 ? displayPrice.toString() : displayPrice.toFixed(2));

    return {
      displayPrice: formattedPrice,
      originalPrice: basePrice.toString(),
      hasDiscount
    };
  };

  const styles = useMemo(() => getStyles(theme, isDesktop, width), [theme, isDesktop, width]);

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
        <LinearGradient colors={isDark ? ['#051505', '#0a0a0a'] : ['#F8FAF8', '#FFFFFF']} style={StyleSheet.absoluteFill} />
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={28} color={theme.text.primary} />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <ResponsiveContainer maxWidth={1000}>
            <View style={styles.plansList}>
              <PlanSkeleton />
              <PlanSkeleton />
            </View>
          </ResponsiveContainer>
        </ScrollView>
      </View>
    );
  }

  // Determine featured status dynamically
  const isFeaturedPlan = (plan: any) =>
    plan.isFeatured || ['premium', 'pro', 'enterprise'].includes(plan.tier);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <LinearGradient colors={isDark ? ['#051505', '#0a0a0a'] : ['#F8FAF8', '#FFFFFF']} style={StyleSheet.absoluteFill} />

      {/* Modern Desktop Header */}
      <View style={styles.header}>
        <ResponsiveContainer maxWidth={1200}>
          <View style={styles.headerInner}>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="arrow-back" size={24} color={theme.text.primary} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>{t('plans.title') || 'Choose Your Plan'}</Text>
            </View>
            <View style={{ width: 44 }} />
          </View>
        </ResponsiveContainer>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ResponsiveContainer maxWidth={1200}>
          <AuthRequiredGate
            title={t('plans.title') || 'Subscription Plans'}
            message={t('plans.loginMessage') || 'Join our elite community and unlock premium financial insights.'}
            icon="rocket-outline"
          >
            <View style={styles.introSection}>
              <Text style={styles.heroTitle}>{t('plans.heroTitle') || 'The Future of Financial Analysis'}</Text>
              <Text style={styles.heroSubtitle}>{t('plans.heroSubtitle') || 'Access professional-grade tools and insights starting from just pennies a day.'}</Text>
            </View>

            {/* Premium Billing Toggle */}
            <View style={styles.toggleOuter}>
              <View style={styles.toggleWrapper}>
                <Animated.View style={[
                  styles.toggleSlider,
                  {
                    left: toggleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [4, isDesktop ? 204 : (width - 64) / 2 + 4]
                    })
                  }
                ]} />
                <TouchableOpacity
                  style={styles.toggleOption}
                  onPress={() => setBillingCycle('monthly')}
                  activeOpacity={1}
                >
                  <Text style={[styles.toggleText, billingCycle === 'monthly' && styles.toggleTextActive]}>{t('plans.monthly')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.toggleOption}
                  onPress={() => setBillingCycle('yearly')}
                  activeOpacity={1}
                >
                  <Text style={[styles.toggleText, billingCycle === 'yearly' && styles.toggleTextActive]}>{t('plans.yearly')}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.saveBadgePill}>
                <Text style={styles.saveBadgeText}>{t('plans.save') || 'SAVE 20%'}</Text>
              </View>
            </View>

            {/* Maintenance Message */}
            {settings && !settings.isNewSubscriptionsEnabled && (
              <View style={styles.maintenanceBanner}>
                <Ionicons name="alert-circle" size={20} color="#EF4444" />
                <Text style={styles.maintenanceText}>
                  {settings.subscriptionDisabledMessage || t('plans.temporarilyDisabled')}
                </Text>
              </View>
            )}

            {/* Dynamic Plans Layout */}
            <Animated.View style={[styles.plansList, { opacity: fadeAnim }]}>
              {plans.map((plan) => {
                const featured = isFeaturedPlan(plan);
                const { displayPrice, originalPrice, hasDiscount } = getPriceData(plan);

                return (
                  <View key={plan._id} style={[styles.planCard, featured && styles.planCardFeatured]}>
                    <LinearGradient
                      colors={featured
                        ? [theme.primary.main + '20', 'transparent']
                        : isDark ? ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.01)'] : ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.4)']
                      }
                      style={StyleSheet.absoluteFill}
                    />
                    {featured && (
                      <View style={styles.recommendedBadge}>
                        <Text style={styles.recommendedText}>{t('plans.mostPopular') || 'MOST POPULAR'}</Text>
                      </View>
                    )}
                    <Text style={[styles.tierName, featured && { color: theme.primary.main }]}>{plan.name}</Text>
                    <View style={styles.priceWrap}>
                      <Text style={styles.currency}>{plan.currency === 'USD' ? '$' : plan.currency}</Text>
                      <Text style={styles.amount}>{displayPrice}</Text>
                      {hasDiscount && (
                        <Text style={styles.originalPriceStrikethrough}>{originalPrice}</Text>
                      )}
                      <Text style={styles.period}>/{billingCycle === 'monthly' ? 'mo' : 'yr'}</Text>
                    </View>

                    {plan.description ? (
                      <Text style={styles.tierDesc}>{plan.description}</Text>
                    ) : (
                      <Text style={styles.tierDesc}>{featured ? 'Professional tools for serious analysts and traders.' : 'Perfect for individual investors starting their journey.'}</Text>
                    )}

                    <View style={[styles.divider, featured && { backgroundColor: theme.primary.main + '20' }]} />

                    <View style={styles.featuresWrap}>
                      {plan.features.slice(0, 6).map((f, i) => (
                        <View key={i} style={styles.featureLine}>
                          <Ionicons name={featured ? "sparkles" : "checkmark"} size={featured ? 16 : 20} color={theme.primary.main} />
                          <Text style={styles.featureTxt}>{f.name}</Text>
                        </View>
                      ))}
                    </View>

                    {featured ? (
                      <TouchableOpacity
                        style={[
                          styles.actionBtnFeatured,
                          (checkoutLoading || settings?.isNewSubscriptionsEnabled === false) && styles.btnDisabled
                        ]}
                        onPress={() => handleSelectPlan(plan._id)}
                        disabled={checkoutLoading || settings?.isNewSubscriptionsEnabled === false}
                      >
                        <LinearGradient
                          colors={[theme.primary.main, theme.primary.dark]}
                          style={StyleSheet.absoluteFill}
                        />
                        {checkoutLoading && pendingPlanId === plan._id ? (
                          <ActivityIndicator color="#FFF" />
                        ) : (
                          <Text style={styles.actionBtnTextFeatured}>{t('plans.goProfessional') || 'Go Pro Now'}</Text>
                        )}
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={[
                          styles.actionBtn,
                          (settings?.isNewSubscriptionsEnabled === false || checkoutLoading) && styles.btnDisabled
                        ]}
                        onPress={() => handleSelectPlan(plan._id)}
                        disabled={checkoutLoading || settings?.isNewSubscriptionsEnabled === false}
                      >
                        {checkoutLoading && pendingPlanId === plan._id ? (
                          <ActivityIndicator color={theme.primary.main} />
                        ) : (
                          <Text style={[styles.actionBtnText, { color: theme.primary.main }]}>{t('plans.selectPlan')}</Text>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </Animated.View>

            {/* Promo Section */}
            <View style={styles.promoSection}>
              <ResponsiveContainer maxWidth={600}>
                <View style={styles.promoCard}>
                  <Text style={styles.promoTitle}>{t('plans.havePromoCode')}</Text>
                  <View style={styles.promoInputGroup}>
                    <TextInput
                      style={styles.promoInput}
                      placeholder={t('plans.promoPlaceholder')}
                      placeholderTextColor={theme.text.hint}
                      value={promoCode}
                      onChangeText={setPromoCode}
                      autoCapitalize="characters"
                      editable={!appliedPromo && !validatingPromo}
                    />
                    <TouchableOpacity
                      style={styles.promoApplyBtn}
                      onPress={handleApplyPromo}
                      disabled={!promoCode.trim() || validatingPromo || !!appliedPromo}
                    >
                      {validatingPromo ? <ActivityIndicator size="small" /> : <Text style={styles.promoApplyText}>{appliedPromo ? 'Applied' : t('plans.apply')}</Text>}
                    </TouchableOpacity>
                  </View>
                  {appliedPromo && (
                    <TouchableOpacity style={styles.removePromo} onPress={() => setAppliedPromo(null)}>
                      <Text style={styles.removePromoText}>Remove code</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </ResponsiveContainer>
            </View>

            <View style={styles.trustFooter}>
              <View style={styles.trustFooterItem}>
                <Ionicons name="lock-closed" size={16} color={theme.text.hint} />
                <Text style={styles.trustFooterText}>SSL Encrypted Payment</Text>
              </View>
              <View style={styles.trustFooterItem}>
                <Ionicons name="infinite" size={16} color={theme.text.hint} />
                <Text style={styles.trustFooterText}>Automatic Renewal</Text>
              </View>
            </View>

          </AuthRequiredGate>
        </ResponsiveContainer>
      </ScrollView>

      <SubscriptionTermsModal
        visible={showTermsModal}
        onClose={() => !checkoutLoading && setShowTermsModal(false)}
        onAccept={handleTermsAccepted}
        loading={checkoutLoading}
      />

    </View>
  );
};

const getStyles = (theme: any, isDesktop: boolean, width: number) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    borderBottomWidth: isDesktop ? 1 : 0,
    borderBottomColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border.main,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.text.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 60,
  },
  introSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: isDesktop ? 80 : 40,
  },
  heroTitle: {
    fontSize: isDesktop ? 56 : 32,
    fontWeight: '900',
    color: theme.text.primary,
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: -1,
  },
  heroSubtitle: {
    fontSize: 18,
    color: theme.text.secondary,
    textAlign: 'center',
    lineHeight: 28,
    maxWidth: 700,
  },
  toggleOuter: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  toggleWrapper: {
    flexDirection: 'row',
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    padding: 4,
    borderRadius: 16,
    width: isDesktop ? 408 : width - 56,
    height: 64,
    position: 'relative',
  },
  toggleSlider: {
    position: 'absolute',
    top: 4,
    width: isDesktop ? 200 : (width - 56 - 8) / 2,
    bottom: 4,
    backgroundColor: theme.background.secondary,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  toggleOption: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text.secondary,
  },
  toggleTextActive: {
    color: theme.text.primary,
  },
  saveBadgePill: {
    position: 'absolute',
    top: -12,
    right: isDesktop ? '35%' : 24,
    backgroundColor: theme.primary.main,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  saveBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFF',
  },
  maintenanceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 24,
    marginBottom: 32,
    gap: 12,
  },
  maintenanceText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
    flex: 1,
  },
  plansList: {
    flexDirection: isDesktop ? 'row' : 'column',
    gap: 32,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  planCard: {
    flex: 1,
    maxWidth: isDesktop ? 450 : '100%',
    borderRadius: 32,
    padding: 40,
    borderWidth: 1,
    borderColor: theme.border.main,
    backgroundColor: theme.background.secondary,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 30,
    elevation: 5,
  },
  planCardFeatured: {
    borderColor: theme.primary.main + '40',
    borderWidth: 2,
    transform: isDesktop ? [{ scale: 1.05 }] : [],
    zIndex: 10,
  },
  recommendedBadge: {
    backgroundColor: theme.primary.main,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  recommendedText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 1,
  },
  tierName: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 24,
  },
  priceWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  currency: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.text.primary,
    marginRight: 4,
  },
  amount: {
    fontSize: 56,
    fontWeight: '900',
    color: theme.text.primary,
  },
  period: {
    fontSize: 18,
    color: theme.text.hint,
    marginLeft: 4,
  },
  originalPriceStrikethrough: {
    fontSize: 20,
    color: theme.text.hint,
    textDecorationLine: 'line-through',
    marginLeft: 8,
    alignSelf: 'center',
  },

  tierDesc: {
    fontSize: 15,
    color: theme.text.secondary,
    lineHeight: 22,
    marginBottom: 32,
  },
  divider: {
    height: 1,
    backgroundColor: theme.border.main,
    marginBottom: 32,
  },
  featuresWrap: {
    gap: 16,
    marginBottom: 48,
  },
  featureLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureTxt: {
    fontSize: 16,
    color: theme.text.primary,
    fontWeight: '500',
  },
  actionBtn: {
    paddingVertical: 18,
    borderRadius: 16,
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border.main,
    marginTop: 'auto',
  },
  actionBtnFeatured: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    overflow: 'hidden',
    marginTop: 'auto',
  },
  actionBtnText: {
    fontSize: 16,
    fontWeight: '800',
  },
  actionBtnTextFeatured: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFF',
  },
  btnDisabled: {
    opacity: 0.5,
  },
  promoSection: {
    marginTop: 80,
    paddingHorizontal: 24,
  },
  promoCard: {
    backgroundColor: theme.background.secondary,
    padding: 32,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.border.main,
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text.primary,
    marginBottom: 16,
  },
  promoInputGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  promoInput: {
    flex: 1,
    height: 56,
    backgroundColor: theme.background.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    fontSize: 16,
    fontWeight: '600',
    color: theme.text.primary,
    borderWidth: 1,
    borderColor: theme.border.main,
  },
  promoApplyBtn: {
    paddingHorizontal: 24,
    height: 56,
    backgroundColor: theme.primary.main + '15',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoApplyText: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.primary.main,
  },
  removePromo: {
    marginTop: 12,
  },
  removePromoText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
  },
  trustFooter: {
    flexDirection: isDesktop ? 'row' : 'column',
    justifyContent: 'center',
    marginTop: 60,
    gap: isDesktop ? 40 : 16,
    alignItems: 'center',
  },
  trustFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  trustFooterText: {
    fontSize: 14,
    color: theme.text.hint,
    fontWeight: '500',
  },
});
