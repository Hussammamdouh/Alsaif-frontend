/**
 * AdminAnalyticsScreen
 * Comprehensive analytics dashboard with user growth, engagement, and performance metrics
 * Now with theme and language support
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme, useLocalization } from '../../../app/providers';
import { createAdminStyles } from '../admin.styles';
import { useAnalytics } from '../hooks';
import { exportToExcel } from '../../../shared/utils/exportUtils';
import {
  StatCard,
  DateRangePicker,
  Chart,
  FilterBar,
  LoadingState,
  EmptyState,
  formatChartData,
  formatPieChartData,
  generateChartColors,
  AdminSidebar,
} from '../components';
import { CHART_COLORS } from '../admin.constants';
import { LinearGradient } from 'expo-linear-gradient';
import { ResponsiveContainer } from '../../../shared/components';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const AdminAnalyticsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { t, isRTL } = useLocalization();
  const styles = useMemo(() => createAdminStyles(theme, isRTL), [theme, isRTL]);
  const localStyles = useMemo(() => createLocalStyles(theme, isRTL), [theme, isRTL]);
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  );
  const [endDate, setEndDate] = useState(new Date());
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');
  const [activeTab, setActiveTab] = useState<'overview' | 'audience' | 'engagement' | 'revenue' | 'plans'>('overview');

  const {
    userGrowth,
    engagementMetrics,
    contentPerformance,
    subscriptionAnalytics,
    conversionFunnel,
    featureUsage,
    deviceAnalytics,
    retentionCohorts,
    geoDistribution,
    revenueOverview,
    revenueTrends,
    paymentMethods,
    revenueByCycle,
    failedPayments,
    revenueForecast,
    churnRate: hooksChurn,
    arpu,
    ltv,
    comparison,
    planStats,
    planLoading,
    loading,
    error,
    refresh,
    exportFullReport,
  } = useAnalytics({
    startDate,
    endDate,
    period,
  });

  const handleDateRangeChange = (newStartDate: Date, newEndDate: Date) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
  };

  const changeTab = (tab: any) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setActiveTab(tab);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num?.toString() || '0';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const handleExport = async () => {
    try {
      const csvData = await exportFullReport();

      if (typeof csvData === 'string' && Platform.OS === 'web') {
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Full_Analytics_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        return;
      }

      throw new Error('Full export not supported on this platform or invalid data');
    } catch (err) {
      console.error('Full export failed:', err);
      // Fallback to basic export if full fails
      const exportData = [
        { Metric: 'Total Users', Value: engagementMetrics?.totalUsers || 0 },
        { Metric: 'Active Users', Value: engagementMetrics?.activeUsers || 0 },
        { Metric: 'New Users', Value: engagementMetrics?.newUsers || 0 },
        { Metric: 'MRR', Value: formatCurrency(revenueOverview?.mrr) },
        { Metric: 'ARPU', Value: formatCurrency(revenueOverview?.arpu) },
      ];

      if (revenueOverview?.revenueByTier) {
        Object.entries(revenueOverview.revenueByTier).forEach(([tier, value]) => {
          exportData.push({ Metric: `Revenue (${tier})`, Value: formatCurrency(value as number) });
        });
      }

      exportToExcel(exportData, `Analytics_Summary_${new Date().toISOString().split('T')[0]}`);
    }
  };

  const calculateDelta = (current: number, previous: number) => {
    if (!previous || previous === 0) return undefined;
    const delta = ((current - previous) / previous) * 100;
    return `${delta > 0 ? '+' : ''}${delta.toFixed(1)}%`;
  };

  if (loading && !userGrowth.length) {
    return <LoadingState type="stats" count={6} />;
  }

  const renderHeader = () => (
    <View style={[styles.header, isDesktop && { backgroundColor: theme.background.secondary, borderBottomColor: theme.ui.border, height: 80, paddingTop: 0, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
      <View style={[styles.headerLeft, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name={isRTL ? "arrow-forward" : "arrow-back"} size={24} color={theme.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{isDesktop ? t('admin.analyticsOverview') : t('admin.analytics')}</Text>
      </View>
      <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 12 }}>
        <TouchableOpacity onPress={handleExport} style={localStyles.iconBtn}>
          <Ionicons name="download-outline" size={22} color={theme.primary.main} />
        </TouchableOpacity>
        <TouchableOpacity onPress={refresh} style={localStyles.iconBtn}>
          <Ionicons name="refresh" size={22} color={theme.primary.main} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderMainContent = () => (
    <>
      <View style={localStyles.topControls}>
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onRangeChange={handleDateRangeChange}
          label={t('admin.dateRange')}
        />

        <View style={localStyles.tabStrip}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[localStyles.tabButton, activeTab === tab.id && localStyles.tabButtonActive]}
              onPress={() => changeTab(tab.id as any)}
            >
              <Ionicons
                name={(activeTab === tab.id ? tab.icon : tab.icon + '-outline') as any}
                size={18}
                color={activeTab === tab.id ? theme.primary.main : theme.text.tertiary}
              />
              {activeTab === tab.id && <Text style={localStyles.tabTextActive}>{tab.label}</Text>}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scrollContent, { paddingTop: 20 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={theme.primary.main} />
        }
      >
        {error ? (
          <EmptyState icon="alert-circle" title={t('common.error')} message={error} actionLabel={t('common.retry')} onActionPress={refresh} iconColor={theme.error.main} />
        ) : (
          <>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'audience' && renderAudience()}
            {activeTab === 'engagement' && renderEngagement()}
            {activeTab === 'revenue' && renderRevenue()}
            {activeTab === 'plans' && renderPlans()}
            <View style={{ height: 60 }} />
          </>
        )}
      </ScrollView>
    </>
  );

  const renderHeroStat = () => (
    <LinearGradient
      colors={[theme.primary.main, theme.primary.dark || '#1a73e8']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={localStyles.heroCard}
    >
      <View style={[localStyles.heroContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <View style={{ alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
          <Text style={[localStyles.heroLabel, { textAlign: isRTL ? 'right' : 'left' }]}>{t('admin.mrr')}</Text>
          <Text style={[localStyles.heroValue, { textAlign: isRTL ? 'right' : 'left' }]}>{formatCurrency(revenueOverview?.mrr)}</Text>
        </View>
        <View style={[localStyles.heroTrendBadge, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Ionicons name="trending-up" size={16} color="#fff" />
          <Text style={localStyles.heroTrendText}>
            {calculateDelta(revenueOverview?.mrr, comparison?.metrics?.mrr) || '+0%'}
          </Text>
        </View>
      </View>
      <View style={[localStyles.heroFooter, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <View style={[localStyles.heroStatMini, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
          <Text style={[localStyles.heroStatMiniLabel, { textAlign: isRTL ? 'right' : 'left' }]}>{t('admin.totalUsers')}</Text>
          <Text style={[localStyles.heroStatMiniValue, { textAlign: isRTL ? 'right' : 'left' }]}>{formatNumber(engagementMetrics?.totalUsers)}</Text>
        </View>
        <View style={localStyles.heroDivider} />
        <View style={[localStyles.heroStatMini, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
          <Text style={[localStyles.heroStatMiniLabel, { textAlign: isRTL ? 'right' : 'left' }]}>{t('admin.activeUsers')}</Text>
          <Text style={[localStyles.heroStatMiniValue, { textAlign: isRTL ? 'right' : 'left' }]}>{formatNumber(engagementMetrics?.activeUsers)}</Text>
        </View>
      </View>
    </LinearGradient>
  );

  const renderOverview = () => (
    <View style={{ gap: 20 }}>
      {renderHeroStat()}

      <View style={styles.dashboardGrid}>
        <StatCard
          title={t('admin.arpu')}
          value={formatCurrency(revenueOverview?.arpu)}
          icon="trending-up"
          color={CHART_COLORS.WARNING}
        />
        <StatCard
          title={t('admin.newUsers')}
          value={formatNumber(engagementMetrics?.newUsers)}
          icon="person-add"
          color={CHART_COLORS.INFO}
          trend={calculateDelta(engagementMetrics?.newUsers, comparison?.metrics?.newUsers)}
          trendUp={engagementMetrics?.newUsers > comparison?.metrics?.newUsers}
        />
      </View>

      {userGrowth.length > 0 && (
        <View style={localStyles.cardWrapper}>
          <Chart
            type="line"
            title={t('admin.userGrowth')}
            data={formatChartData(
              userGrowth.map((d) => d._id),
              [
                { data: userGrowth.map((d) => d.newUsers), color: theme.primary.main, label: t('admin.newUsers') },
              ]
            )}
            height={220}
            bezier
          />
        </View>
      )}

      <View style={localStyles.twoColumnGrid}>
        {deviceAnalytics && (
          <View style={[localStyles.cardWrapper, { flex: 1 }]}>
            <Chart
              type="pie"
              title={t('admin.deviceDistribution')}
              data={formatPieChartData([
                { name: 'iOS', value: deviceAnalytics.ios || 0 },
                { name: 'Android', value: deviceAnalytics.android || 0 },
              ])}
              height={180}
            />
          </View>
        )}
      </View>
    </View>
  );

  const renderAudience = () => (
    <View style={{ gap: 20 }}>
      <View style={styles.dashboardGrid}>
        <StatCard
          title={t('admin.retention')}
          value={`${((engagementMetrics?.activeUsers / engagementMetrics?.totalUsers) * 100 || 0).toFixed(1)}%`}
          icon="infinite"
          color={CHART_COLORS.PRIMARY}
        />
        <StatCard
          title={t('admin.newUsers')}
          value={formatNumber(engagementMetrics?.newUsers)}
          icon="person-add"
          color={CHART_COLORS.SUCCESS}
        />
      </View>

      {retentionCohorts.length > 0 && (
        <View style={localStyles.cardWrapper}>
          <Chart
            type="line"
            title={t('admin.retentionCohorts')}
            data={formatChartData(
              retentionCohorts.map((r) => r.cohort),
              [{ data: retentionCohorts.map((r) => r.retentionRate * 100), color: CHART_COLORS.INFO, label: '%' }]
            )}
            height={220}
          />
        </View>
      )}

      {geoDistribution.length > 0 && (
        <View style={localStyles.cardWrapper}>
          <View style={localStyles.cardHeader}>
            <Text style={localStyles.cardTitle}>{t('admin.geoDistribution')}</Text>
          </View>
          <View style={localStyles.geoList}>
            {geoDistribution.slice(0, 5).map((item, index) => {
              const totalUsers = geoDistribution.reduce((acc, curr) => acc + (curr.users || curr.value || curr.count || 0), 0);
              const percentage = ((item.users || item.value || item.count || 0) / (totalUsers || 1) * 100);
              return (
                <View key={index} style={localStyles.geoListItem}>
                  <View style={[localStyles.geoInfoRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <Text style={[localStyles.geoName, { textAlign: isRTL ? 'right' : 'left' }]}>{item.country || item.name}</Text>
                    <Text style={[localStyles.geoValue, { textAlign: isRTL ? 'left' : 'right' }]}>{formatNumber(item.users || item.value || item.count)}</Text>
                  </View>
                  <View style={localStyles.progressBg}>
                    <View style={[localStyles.progressFill, { width: `${percentage}%`, backgroundColor: generateChartColors(10)[index] }]} />
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );

  const renderEngagement = () => (
    <View style={{ gap: 20 }}>
      <View style={styles.dashboardGrid}>
        <StatCard
          title={t('admin.avgSession')}
          value={`${Math.round(engagementMetrics?.avgSessionDuration || 0)}m`}
          icon="time"
          color={CHART_COLORS.WARNING}
        />
        <StatCard
          title={t('admin.conversion')}
          value={`${(conversionFunnel[conversionFunnel.length - 1]?.count / conversionFunnel[0]?.count * 100 || 0).toFixed(1)}%`}
          icon="funnel"
          color={CHART_COLORS.SUCCESS}
        />
      </View>

      {conversionFunnel.length > 0 && (
        <View style={localStyles.cardWrapper}>
          <Chart
            type="bar"
            title={t('admin.conversionFunnel')}
            data={formatChartData(
              conversionFunnel.map((d) => d.stage),
              [{ data: conversionFunnel.map((d) => d.count), color: theme.primary.main }]
            )}
            height={220}
          />
        </View>
      )}

      {geoDistribution.length > 0 && (
        <View style={localStyles.cardWrapper}>
          <View style={localStyles.cardHeader}>
            <Text style={localStyles.cardTitle}>{t('admin.geoDistribution')}</Text>
          </View>
          <View style={localStyles.geoList}>
            {geoDistribution.slice(0, 5).map((item, index) => {
              const totalUsers = geoDistribution.reduce((acc, curr) => acc + (curr.users || curr.value || curr.count || 0), 0);
              const percentage = ((item.users || item.value || item.count || 0) / (totalUsers || 1) * 100);
              return (
                <View key={index} style={localStyles.geoListItem}>
                  <View style={[localStyles.geoInfoRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <Text style={[localStyles.geoName, { textAlign: isRTL ? 'right' : 'left' }]}>{item.country || item.name}</Text>
                    <Text style={[localStyles.geoValue, { textAlign: isRTL ? 'left' : 'right' }]}>{formatNumber(item.users || item.value || item.count)}</Text>
                  </View>
                  <View style={localStyles.progressBg}>
                    <View style={[localStyles.progressFill, { width: `${percentage}%`, backgroundColor: generateChartColors(10)[index] }]} />
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {contentPerformance.length > 0 && (
        <View style={localStyles.cardWrapper}>
          <View style={localStyles.cardHeader}>
            <Text style={localStyles.cardTitle}>{t('admin.topContentFull')}</Text>
          </View>
          {contentPerformance.slice(0, 5).map((content, index) => (
            <TouchableOpacity key={index} style={localStyles.contentItem} activeOpacity={0.7}>
              <View style={[localStyles.rankBadge, index === 0 && localStyles.rankGold]}>
                <Text style={[localStyles.rankText, index === 0 && { color: '#fff' }]}>{index + 1}</Text>
              </View>
              <View style={[localStyles.contentInfo, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                <Text style={[localStyles.contentTitle, { textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={1}>{content.title}</Text>
                <Text style={[localStyles.contentMeta, { textAlign: isRTL ? 'right' : 'left' }]}>{formatNumber(content.views)} {t('admin.views')} • {formatNumber(content.likes)} {t('admin.likes')}</Text>
              </View>
              <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={14} color={theme.text.tertiary} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const renderRevenue = () => (
    <View style={{ gap: 20 }}>
      {renderHeroStat()}

      <View style={styles.dashboardGrid}>
        <StatCard
          title={t('admin.arr')}
          value={formatCurrency(revenueOverview?.arr || 0)}
          icon="stats-chart"
          color={CHART_COLORS.PRIMARY}
        />
        <StatCard
          title={t('admin.churnRate')}
          value={`${(hooksChurn || revenueOverview?.churnRate || 0).toFixed(1)}%`}
          icon="trending-down"
          color={CHART_COLORS.DANGER}
        />
        <StatCard
          title={t('admin.arpu')}
          value={formatCurrency(arpu || revenueOverview?.arpu || 0)}
          icon="people"
          color={CHART_COLORS.INFO}
        />
        <StatCard
          title={t('admin.ltvCac')}
          value={arpu && ltv ? (ltv / (arpu * 3)).toFixed(1) : '0.0'}
          icon="analytics"
          color={CHART_COLORS.SECONDARY}
        />
      </View>

      {revenueTrends.length > 0 && (
        <View style={localStyles.cardWrapper}>
          <Chart
            type="line"
            title={t('admin.revenueGrowth')}
            data={formatChartData(
              revenueTrends.map((d: any) => d._id),
              [{ data: revenueTrends.map((d: any) => d.revenue), color: CHART_COLORS.SUCCESS }]
            )}
            height={220}
            bezier
          />
        </View>
      )}

      {revenueForecast.length > 0 && (
        <View style={localStyles.cardWrapper}>
          <Chart
            type="line"
            title={t('admin.revenueForecast')}
            data={formatChartData(
              revenueForecast.map((f: any) => f.month),
              [{ data: revenueForecast.map((f: any) => f.projectedMRR), color: CHART_COLORS.INFO }]
            )}
            height={220}
            bezier
          />
        </View>
      )}

      <View style={localStyles.row}>
        {paymentMethods.length > 0 && (
          <View style={[localStyles.cardWrapper, { flex: 1 }]}>
            <Chart
              type="bar"
              title={t('admin.paymentMethods')}
              data={formatChartData(
                paymentMethods.map((m: any) => m._id || 'Other'),
                [{ data: paymentMethods.map((m: any) => m.count) }]
              )}
              height={200}
            />
          </View>
        )}

        {revenueByCycle.length > 0 && (
          <View style={[localStyles.cardWrapper, { flex: 1 }]}>
            <Chart
              type="pie"
              title={t('admin.revenueByCycle')}
              data={formatPieChartData(
                revenueByCycle.map((c: any) => ({
                  name: c._id?.charAt(0).toUpperCase() + c._id?.slice(1) || 'Unknown',
                  value: c.revenue || 0,
                }))
              )}
              height={200}
            />
          </View>
        )}
      </View>

      {failedPayments.length > 0 && (
        <View style={localStyles.cardWrapper}>
          <View style={localStyles.cardHeader}>
            <Text style={localStyles.cardTitle}>{t('admin.failedPayments')}</Text>
            <View style={[localStyles.badge, { backgroundColor: theme.error.main }]}>
              <Text style={localStyles.badgeText}>{failedPayments.length}</Text>
            </View>
          </View>
          {failedPayments.map((payment: any, index: number) => (
            <View key={index} style={[localStyles.failedPaymentItem, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <View style={[localStyles.failedPaymentInfo, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                <Text style={[localStyles.paymentUser, { textAlign: isRTL ? 'right' : 'left' }]}>{payment.user?.name || 'Unknown User'}</Text>
                <Text style={[localStyles.paymentDetails, { textAlign: isRTL ? 'right' : 'left' }]}>
                  {formatCurrency(payment.amount)} • {payment.paymentMethod}
                </Text>
              </View>
              <Text style={[localStyles.paymentDate, { textAlign: isRTL ? 'left' : 'right' }]}>
                {new Date(payment.createdAt).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderPlans = () => (
    <View style={{ gap: 20 }}>
      <View style={styles.dashboardGrid}>
        <StatCard
          title={t('admin.totalPlans')}
          value={formatNumber(planStats?.totalPlans || 0)}
          icon="list"
          color={CHART_COLORS.PRIMARY}
        />
        <StatCard
          title={t('admin.activeSubscribers')}
          value={formatNumber(planStats?.plans?.reduce((acc: number, p: any) => acc + (p.activeSubscriberCount || 0), 0) || 0)}
          icon="people"
          color={CHART_COLORS.SUCCESS}
        />
      </View>

      {planStats?.plans && (
        <View style={localStyles.cardWrapper}>
          <View style={localStyles.cardHeader}>
            <Text style={localStyles.cardTitle}>{t('admin.planBreakdown')}</Text>
          </View>
          <View style={localStyles.geoList}>
            {planStats.plans.map((plan: any, index: number) => {
              const totalSubs = planStats.plans.reduce((acc: number, p: any) => acc + (p.activeSubscriberCount || 0), 0);
              const percentage = ((plan.activeSubscriberCount || 0) / (totalSubs || 1) * 100);
              return (
                <View key={index} style={localStyles.geoListItem}>
                  <View style={[localStyles.geoInfoRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center' }}>
                      <Text style={[localStyles.geoName, { textAlign: isRTL ? 'right' : 'left' }]}>{plan.name}</Text>
                      <View style={{ backgroundColor: theme.primary.main + '20', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, [isRTL ? 'marginRight' : 'marginLeft']: 8 }}>
                        <Text style={{ fontSize: 10, color: theme.primary.main, fontWeight: '700' }}>{plan.tier.toUpperCase()}</Text>
                      </View>
                    </View>
                    <Text style={[localStyles.geoValue, { textAlign: isRTL ? 'left' : 'right' }]}>
                      {formatNumber(plan.activeSubscriberCount)} {t('admin.active')}
                    </Text>
                  </View>
                  <View style={localStyles.progressBg}>
                    <View style={[localStyles.progressFill, { width: `${percentage}%`, backgroundColor: generateChartColors(10)[index % 10] }]} />
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {planStats?.plans && (
        <View style={localStyles.cardWrapper}>
          <Chart
            type="bar"
            title={t('admin.revenueByPlan')}
            data={formatChartData(
              planStats.plans.map((p: any) => p.name),
              [{ data: planStats.plans.map((p: any) => p.totalRevenue), color: CHART_COLORS.INFO }]
            )}
            height={240}
          />
        </View>
      )}
    </View>
  );

  const tabs = [
    { id: 'overview', label: t('admin.tabOverview'), icon: 'grid' },
    { id: 'audience', label: t('admin.tabAudience'), icon: 'people' },
    { id: 'engagement', label: t('admin.tabEngagement'), icon: 'pulse' },
    { id: 'revenue', label: t('admin.tabRevenue'), icon: 'cash' },
    { id: 'plans', label: t('admin.plans'), icon: 'list' },
  ];


  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {isDesktop ? (
          <View style={styles.desktopContentWrapper}>
            <AdminSidebar />
            <View style={styles.desktopMainContent}>
              {renderHeader()}
              {renderMainContent()}
            </View>
          </View>
        ) : (
          <ResponsiveContainer style={{ flex: 1 }}>
            {renderHeader()}
            {renderMainContent()}
          </ResponsiveContainer>
        )}
      </View>
    </SafeAreaView>
  );
};

const createLocalStyles = (theme: any, isRTL: boolean) => StyleSheet.create({
  iconBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: theme.primary.main + '10',
  },
  topControls: {
    backgroundColor: theme.background.secondary,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.main,
  },
  tabStrip: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  tabButton: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: theme.background.tertiary,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabButtonActive: {
    backgroundColor: theme.primary.main + '15',
    borderColor: theme.primary.main + '30',
  },
  tabTextActive: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.primary.main,
    marginLeft: isRTL ? 0 : 8,
    marginRight: isRTL ? 8 : 0,
  },
  heroCard: {
    padding: 24,
    borderRadius: 28,
    shadowColor: theme.primary.main,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  heroContent: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  heroLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  heroValue: {
    fontSize: 34,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -1,
  },
  heroTrendBadge: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  heroTrendText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    [isRTL ? 'marginRight' : 'marginLeft']: 4,
  },
  heroFooter: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  heroStatMini: {
    flex: 1,
  },
  heroStatMiniLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 2,
  },
  heroStatMiniValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  heroDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: 20,
  },
  cardWrapper: {
    backgroundColor: theme.background.secondary,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.border.main,
    overflow: 'hidden',
    padding: 2,
  },
  cardHeader: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: theme.text.primary,
    letterSpacing: -0.5,
  },
  twoColumnGrid: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    gap: 16,
  },
  geoList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  geoListItem: {
    marginBottom: 16,
  },
  geoInfoRow: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  geoName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text.primary,
  },
  geoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.text.secondary,
  },
  progressBg: {
    height: 6,
    backgroundColor: theme.background.tertiary,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  contentItem: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.main,
  },
  rankBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: theme.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    [isRTL ? 'marginLeft' : 'marginRight']: 16,
  },
  rankGold: {
    backgroundColor: theme.primary.main,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '900',
    color: theme.text.tertiary,
  },
  contentInfo: {
    flex: 1,
    [isRTL ? 'marginLeft' : 'marginRight']: 12,
  },
  contentTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.text.primary,
    marginBottom: 4,
  },
  contentMeta: {
    fontSize: 12,
    color: theme.text.tertiary,
    marginTop: 2,
  },
  row: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    gap: 12,
  },
  badge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    [isRTL ? 'marginRight' : 'marginLeft']: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  failedPaymentItem: {
    flexDirection: isRTL ? 'row-reverse' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.main,
  },
  failedPaymentInfo: {
    flex: 1,
  },
  paymentUser: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text.primary,
    marginBottom: 4,
  },
  paymentDetails: {
    fontSize: 13,
    color: theme.text.tertiary,
  },
  paymentDate: {
    fontSize: 12,
    color: theme.text.tertiary,
  },
});
