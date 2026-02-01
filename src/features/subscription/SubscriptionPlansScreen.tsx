/**
 * SubscriptionPlansScreen
 * Premium redesigned plans screen matching Paywall aesthetics
 */

import React, { useState, useMemo, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, StatusBar, Dimensions, Alert, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { PlanSkeleton } from './components/PlanSkeleton';
import {
  useSubscriptionPlans,
  useCheckout,
  useSystemSettings,
} from './subscription.hooks';
import { BillingCycle } from './subscription.types';
import { formatCurrency } from './subscription.mapper';
import { useTheme } from '../../app/providers/ThemeProvider';
import { useLocalization } from '../../app/providers/LocalizationProvider';

const { width } = Dimensions.get('window');

export const SubscriptionPlansScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme, isDark } = useTheme();
  const shimmerValue = useRef(new Animated.Value(-width)).current;
  const { t } = useLocalization();
  const styles = useMemo(() => getStyles(theme), [theme]);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const { plans: allPlans, loading: plansLoading, refetch: refetchPlans } = useSubscriptionPlans();
  const { settings, loading: settingsLoading } = useSystemSettings();
  const { loading: checkoutLoading, initiateCheckout } = useCheckout();
  const loading = plansLoading || settingsLoading;

  // Filter plans based on selected billing cycle
  const plans = allPlans.filter(p => p.billingCycle === billingCycle);

  const handleClose = () => {
    navigation.goBack();
  };

  React.useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerValue, {
        toValue: width,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const handleSelectPlan = async (planId: string) => {
    const success = await initiateCheckout(planId, billingCycle);
    if (success) {
      // Handled by hook
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
        <LinearGradient colors={isDark ? [theme.background.primary, '#0a1a0a'] : ['#FFFFFF', '#FFFFFF']} style={StyleSheet.absoluteFill} />
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={28} color={isDark ? "#FFF" : "#000"} />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.plansList}>
            <PlanSkeleton />
            <PlanSkeleton />
          </View>
        </ScrollView>
      </View>
    );
  }

  // Separate plans
  const investorPlan = plans.find(p => p.tier === 'basic' || p.tier === 'starter');
  const professionalPlan = plans.find(p => p.tier === 'premium' || p.tier === 'pro');

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <LinearGradient colors={isDark ? [theme.background.primary, '#1a2e1a', '#0a1a0a'] : ['#FFFFFF', '#FFFFFF', '#FFFFFF']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Ionicons name="close" size={28} color={isDark ? "#FFF" : "#000"} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('plans.title')}</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerTextContainer}>
          <Text style={[styles.title, { color: isDark ? '#FFF' : '#000' }]}>{t('plans.heroTitle')}</Text>
          <Text style={[styles.subtitle, { color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)' }]}>
            {t('plans.heroSubtitle')}
          </Text>
        </View>

        {/* Billing Toggle */}
        <View style={styles.toggleContainer}>
          <View style={[styles.toggleBackground, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
            <TouchableOpacity
              style={[styles.toggleBtn, billingCycle === 'monthly' && styles.toggleBtnActive]}
              onPress={() => setBillingCycle('monthly')}
            >
              <Text style={[styles.toggleBtnText, billingCycle === 'monthly' && styles.toggleBtnTextActive]}>
                {t('plans.monthly')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, billingCycle === 'yearly' && styles.toggleBtnActive]}
              onPress={() => setBillingCycle('yearly')}
            >
              <Text style={[styles.toggleBtnText, billingCycle === 'yearly' && styles.toggleBtnTextActive]}>
                {t('plans.yearly')}
              </Text>
              {billingCycle === 'yearly' && (
                <View style={styles.saveBadge}>
                  <Text style={styles.saveBadgeText}>{t('plans.save')}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* System Status / Maintenance Message */}
        {settings && !settings.isNewSubscriptionsEnabled && (
          <View style={[styles.disabledMessageContainer, { backgroundColor: isDark ? 'rgba(196, 43, 28, 0.1)' : '#FFF1F0' }]}>
            <Ionicons name="information-circle-outline" size={24} color="#C42B1C" />
            <Text style={[styles.disabledText, { color: isDark ? '#FF8F85' : '#C42B1C' }]}>
              {settings.subscriptionDisabledMessage || t('plans.temporarilyDisabled')}
            </Text>
          </View>
        )}

        {/* Plans */}
        <View style={styles.plansList}>
          {investorPlan && (
            <View style={styles.planCard}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.02)']}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.planTierName}>{investorPlan.name}</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.priceSign}>{investorPlan.currency === 'USD' ? '$' : investorPlan.currency}</Text>
                <Text style={styles.priceValue}>{investorPlan.price}</Text>
                <Text style={styles.pricePeriod}>{t('plans.perMonth')}</Text>
              </View>

              <View style={styles.featuresList}>
                {investorPlan.features.slice(0, 4).map((f, i) => (
                  <View key={i} style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={18} color={theme.primary.main} />
                    <Text style={styles.featureText}>{f.name}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.planButton,
                  settings && !settings.isNewSubscriptionsEnabled && styles.planButtonDisabled
                ]}
                onPress={() => handleSelectPlan(investorPlan._id)}
                disabled={!!(settings && !settings.isNewSubscriptionsEnabled)}
              >
                <Text style={[
                  styles.planButtonText,
                  { color: settings && !settings.isNewSubscriptionsEnabled ? theme.text.tertiary : theme.primary.main }
                ]}>
                  {t('plans.selectPlan')}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {professionalPlan && (
            <View style={[styles.planCard, styles.premiumCard, { backgroundColor: isDark ? 'transparent' : '#F9FBF9' }]}>
              <LinearGradient
                colors={isDark
                  ? ['rgba(67, 135, 48, 0.2)', 'rgba(45, 90, 32, 0.1)']
                  : ['rgba(67, 135, 48, 0.05)', 'rgba(67, 135, 48, 0.02)']
                }
                style={StyleSheet.absoluteFill}
              />
              <Animated.View style={[styles.premiumGlow, { transform: [{ translateX: shimmerValue }] }]}>
                <LinearGradient
                  colors={['transparent', 'rgba(255,255,255,0.1)', 'transparent']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
              <View style={styles.recommendedTag}>
                <Text style={styles.recommendedText}>{t('plans.mostPopular')}</Text>
              </View>
              <Text style={[styles.planTierName, { color: theme.primary.main }]}>{professionalPlan.name}</Text>
              <View style={styles.priceContainer}>
                <Text style={[styles.priceSign, { color: isDark ? '#FFF' : '#000' }]}>{professionalPlan.currency === 'USD' ? '$' : professionalPlan.currency}</Text>
                <Text style={[styles.priceValue, { color: isDark ? '#FFF' : '#000' }]}>{professionalPlan.price}</Text>
                <Text style={[styles.pricePeriod, { color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)' }]}>{t('plans.perMonth')}</Text>
              </View>

              <View style={styles.featuresList}>
                {professionalPlan.features.slice(0, 6).map((f, i) => (
                  <View key={i} style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={18} color={theme.primary.main} />
                    <Text style={[styles.featureText, { color: isDark ? 'rgba(255,255,255,0.8)' : '#333' }]}>{f.name}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.planButton, styles.premiumButton]}
                onPress={() => handleSelectPlan(professionalPlan._id)}
                disabled={checkoutLoading}
              >
                <LinearGradient
                  colors={[theme.primary.main, theme.primary.dark]}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={[styles.planButtonText, { color: '#FFF' }]}>
                  {checkoutLoading ? t('plans.processing') : t('plans.goProfessional')}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Footer info */}
        <View style={styles.trustRow}>
          <View style={styles.trustItem}>
            <Ionicons name="shield-checkmark-outline" size={14} color={isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.3)"} />
            <Text style={[styles.trustText, { color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }]}>{t('plans.secureTransactions')}</Text>
          </View>
          <View style={styles.trustItem}>
            <Ionicons name="refresh-outline" size={14} color={isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.3)"} />
            <Text style={[styles.trustText, { color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }]}>{t('plans.autoRenews')}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text.primary,
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 60,
  },
  headerTextContainer: {
    paddingHorizontal: 24,
    marginTop: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: theme.text.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: theme.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  toggleContainer: {
    marginTop: 32,
    paddingHorizontal: 40,
  },
  toggleBackground: {
    flexDirection: 'row',
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    borderRadius: 14,
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  toggleBtnActive: {
    backgroundColor: theme.primary.main,
    shadowColor: theme.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  toggleBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.text.secondary,
  },
  toggleBtnTextActive: {
    color: '#FFF',
  },
  saveBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  saveBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFF',
  },
  plansList: {
    marginTop: 40,
    paddingHorizontal: 24,
    gap: 20,
  },
  planCard: {
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
  },
  premiumCard: {
    borderColor: theme.primary.main + '40',
    borderWidth: 2,
  },
  recommendedTag: {
    position: 'absolute',
    top: 0,
    right: 24,
    backgroundColor: theme.primary.main,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  recommendedText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  planTierName: {
    fontSize: 18,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 24,
  },
  priceSign: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.text.primary,
    marginRight: 2,
  },
  priceValue: {
    fontSize: 48,
    fontWeight: '900',
    color: theme.text.primary,
  },
  pricePeriod: {
    fontSize: 16,
    color: theme.text.secondary,
    marginLeft: 4,
  },
  featuresList: {
    marginBottom: 32,
    gap: 14,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 15,
    color: theme.text.primary,
    fontWeight: '500',
  },
  planButton: {
    paddingVertical: 18,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  planButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.primary.main,
  },
  premiumButton: {
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  trustRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
    gap: 24,
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
  disabledMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(196, 43, 28, 0.2)',
  },
  disabledText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  planButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  premiumGlow: {
    ...StyleSheet.absoluteFillObject,
    width: width,
    opacity: 0.5,
  },
});
