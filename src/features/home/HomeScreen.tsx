/**
 * Home Screen - Insights Feed
 * Displays insights with top tabs for Free and Premium content
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../app/navigation/types';
import { InsightsListScreen } from '../insights/InsightsListScreen';
import { PremiumInsightsListScreen } from '../insights/PremiumInsightsListScreen';
import { DisclosureListScreen } from '../disclosure';
import { InsightRequestModal } from '../insights/requests/InsightRequestModal';
import { useTheme } from '../../app/providers/ThemeProvider';
import { ResponsiveContainer } from '../../shared/components';
import { useLocalization } from '../../app/providers/LocalizationProvider';
import { useSubscriptionAccess } from '../subscription/useSubscriptionAccess';
import { useIsAdmin } from '../../app/auth/auth.hooks';
import { BannerCarousel } from './components/BannerCarousel';
import { useUnreadBadge } from '../notifications';

type TabType = 'disclosures' | 'free' | 'premium';

export const HomeScreen: React.FC = React.memo(() => {
  const { theme, isDark } = useTheme();
  const { t } = useLocalization();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { hasPremiumAccess } = useSubscriptionAccess();
  const isAdmin = useIsAdmin();
  const { count: unreadNotifications } = useUnreadBadge();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const styles = React.useMemo(() => getStyles(theme, isDesktop), [theme, isDesktop]);

  const [activeTab, setActiveTab] = useState<TabType>('disclosures');
  const [showRequestModal, setShowRequestModal] = useState(false);

  const handleTabChange = (tab: TabType) => {
    if (tab === 'premium' && !hasPremiumAccess) {
      // Redirect to Paywall if not subscribed
      navigation.navigate('Paywall');
      return;
    }
    setActiveTab(tab);
  };

  const handleAddRequest = () => {
    if (isAdmin) {
      // Admins go to Admin management screen with auto-open flag
      navigation.navigate('AdminInsights', { autoOpenCreate: true } as any);
    } else {
      // Regular premium users show the request modal
      setShowRequestModal(true);
    }
  };

  // Banner carousel as list header - scrolls with content
  const renderBannerHeader = () => (
    <BannerCarousel type={activeTab} />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>
        {t('insights.title')}
      </Text>
      <View style={styles.headerActions}>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: theme.background.tertiary, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }]}
          onPress={() => navigation.navigate('Notifications', {})}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={22} color={theme.text.primary} />
          {unreadNotifications > 0 ? (
            <View style={[styles.badge, { backgroundColor: theme.accent.error }]}>
              <Text style={styles.badgeText}>{unreadNotifications > 9 ? '9+' : unreadNotifications}</Text>
            </View>
          ) : null}
        </TouchableOpacity>
        {hasPremiumAccess && (
          <>
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: theme.background.tertiary, borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }]}
              onPress={() => navigation.navigate('InsightRequests')}
              activeOpacity={0.7}
            >
              <Ionicons name="list-outline" size={22} color={theme.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: theme.primary.main, borderColor: 'transparent' }]}
              onPress={handleAddRequest}
              activeOpacity={0.7}
            >
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  const renderTabs = () => (
    <View style={[styles.tabsContainer, { backgroundColor: theme.background.primary, borderBottomColor: theme.border.main }]}>
      <View style={styles.tabsInner}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'disclosures' && styles.tabActive,
          ]}
          onPress={() => handleTabChange('disclosures')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              { color: theme.text.secondary },
              activeTab === 'disclosures' && [styles.tabTextActive, { color: theme.primary.main }],
            ]}
          >
            {t('tabs.disclosures')}
          </Text>
          {activeTab === 'disclosures' && (
            <View style={[styles.tabIndicator, { backgroundColor: theme.primary.main }]} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'free' && styles.tabActive,
          ]}
          onPress={() => handleTabChange('free')}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.tabText,
              { color: theme.text.secondary },
              activeTab === 'free' && [styles.tabTextActive, { color: theme.primary.main }],
            ]}
          >
            {t('insights.freeInsights')}
          </Text>
          {activeTab === 'free' && (
            <View style={[styles.tabIndicator, { backgroundColor: theme.primary.main }]} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'premium' && styles.tabActive,
          ]}
          onPress={() => handleTabChange('premium')}
          activeOpacity={0.7}
        >
          <View style={styles.tabContent}>
            <Text
              style={[
                styles.tabText,
                { color: theme.text.secondary },
                activeTab === 'premium' && [styles.tabTextActive, { color: theme.primary.main }],
              ]}
            >
              {t('insights.premiumInsights')}
            </Text>
            <View style={[styles.premiumBadge, { backgroundColor: theme.primary.main }]}>
              <Text style={styles.premiumBadgeText}>PRO</Text>
            </View>
          </View>
          {activeTab === 'premium' && (
            <View style={[styles.tabIndicator, { backgroundColor: theme.primary.main }]} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderMainContent = () => (
    <View style={styles.content}>
      {activeTab === 'disclosures' ? (
        <DisclosureListScreen
          hideHeader
          ListHeaderComponent={renderBannerHeader()}
        />
      ) : activeTab === 'free' ? (
        <InsightsListScreen
          hideHeader
          ListHeaderComponent={renderBannerHeader()}
        />
      ) : (
        <PremiumInsightsListScreen
          hideHeader
          ListHeaderComponent={renderBannerHeader()}
        />
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      {isDesktop ? (
        <View style={styles.desktopContainer}>
          <View style={styles.desktopMainColumn}>
            {!isDesktop && renderHeader()}
            {renderTabs()}
            <View style={styles.desktopContent}>
              {renderMainContent()}
            </View>
          </View>
        </View>
      ) : (
        <SafeAreaView
          style={[styles.container, { backgroundColor: theme.background.primary }]}
          edges={['top']}
        >
          <ResponsiveContainer>
            {renderHeader()}
            {renderTabs()}
            {renderMainContent()}
          </ResponsiveContainer>
        </SafeAreaView>
      )}

      <InsightRequestModal
        isVisible={showRequestModal}
        onClose={() => setShowRequestModal(false)}
      />
    </View>
  );
});

HomeScreen.displayName = 'HomeScreen';

const getStyles = (theme: any, isDesktop: boolean) => StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: theme.text.primary,
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  tabsContainer: {
    borderBottomWidth: 1,
    backgroundColor: theme.background.primary,
  },
  tabsInner: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: isDesktop ? 'flex-start' : 'center',
    gap: isDesktop ? 32 : 0,
  },
  tab: {
    flex: isDesktop ? 0 : 1,
    paddingVertical: 16,
    paddingHorizontal: isDesktop ? 12 : 0,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minWidth: isDesktop ? 120 : 0,
  },
  tabActive: {
    borderBottomWidth: 3,
    borderBottomColor: theme.primary.main,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  tabTextActive: {
    fontWeight: '700',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  premiumBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  premiumBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
  },
  desktopContainer: {
    flex: 1,
    backgroundColor: theme.background.primary,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  desktopMainColumn: {
    flex: 1,
    backgroundColor: theme.background.secondary,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: theme.border.main,
  },
  desktopContent: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },
});
