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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../app/navigation/types';
import { InsightsListScreen } from '../insights/InsightsListScreen';
import { PremiumInsightsListScreen } from '../insights/PremiumInsightsListScreen';
import { InsightRequestModal } from '../insights/requests/InsightRequestModal';
import { useTheme } from '../../app/providers/ThemeProvider';
import { useLocalization } from '../../app/providers/LocalizationProvider';
import { useSubscriptionAccess } from '../subscription/useSubscriptionAccess';
import { useIsAdmin } from '../../app/auth/auth.hooks';
import { BannerCarousel } from './components/BannerCarousel';
import { useUnreadBadge } from '../notifications';

type TabType = 'free' | 'premium';

export const HomeScreen: React.FC = React.memo(() => {
  const { theme } = useTheme();
  const { t } = useLocalization();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const { hasPremiumAccess } = useSubscriptionAccess();
  const isAdmin = useIsAdmin();
  const { count: unreadNotifications } = useUnreadBadge();
  const [activeTab, setActiveTab] = useState<TabType>('free');
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

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
      edges={['top']}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.background.primary, borderBottomColor: theme.border.main }]}>
        <Text style={[styles.headerTitle, { color: theme.text.primary }]}>
          {t('insights.title')}
        </Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity
            style={[styles.addRequestButton, { backgroundColor: theme.background.tertiary }]}
            onPress={() => navigation.navigate('Notifications')}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={20} color={theme.text.primary} />
            {unreadNotifications > 0 ? (
              <View style={[styles.badge, { backgroundColor: theme.accent.error }]}>
                <Text style={styles.badgeText}>{unreadNotifications > 9 ? '9+' : unreadNotifications}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
          {hasPremiumAccess && (
            <>
              <TouchableOpacity
                style={[styles.addRequestButton, { backgroundColor: theme.background.tertiary }]}
                onPress={() => navigation.navigate('InsightRequests')}
                activeOpacity={0.7}
              >
                <Ionicons name="list" size={20} color={theme.text.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.addRequestButton, { backgroundColor: theme.primary.main }]}
                onPress={handleAddRequest}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {/* Top Tabs - Sticky */}
      <View style={[styles.tabsContainer, { backgroundColor: theme.background.primary, borderBottomColor: theme.border.main }]}>
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

      {/* Content - Banners scroll with insights */}
      <View style={styles.content}>
        {activeTab === 'free' ? (
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

      <InsightRequestModal
        isVisible={showRequestModal}
        onClose={() => setShowRequestModal(false)}
      />
    </SafeAreaView>
  );
});

HomeScreen.displayName = 'HomeScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addRequestButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabActive: {
    // Active styles handled by indicator
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
});
