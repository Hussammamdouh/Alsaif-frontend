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
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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

  // Animation for tab indicator
  const tabWidth = isDesktop ? 120 : (width - 40) / 3;
  const indicatorX = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const toValue = activeTab === 'disclosures' ? 0 : activeTab === 'free' ? tabWidth : tabWidth * 2;
    Animated.spring(indicatorX, {
      toValue,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  }, [activeTab, tabWidth]);

  const handleTabChange = (tab: TabType) => {
    if (tab === 'premium' && !hasPremiumAccess) {
      navigation.navigate('Paywall');
      return;
    }
    setActiveTab(tab);
  };

  const handleAddRequest = () => {
    if (isAdmin) {
      navigation.navigate('AdminInsights', { autoOpenCreate: true } as any);
    } else {
      setShowRequestModal(true);
    }
  };

  // Banner carousel as list header - scrolls with content
  // Use negative margin to offset FlatList's contentContainerStyle padding for full-bleed
  const renderBannerHeader = () => (
    <View style={{ marginHorizontal: -16, marginBottom: 12 }}>
      <BannerCarousel type={activeTab} />
    </View>
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
    <View style={[styles.tabsWrapper, { backgroundColor: theme.background.primary }]}>
      <View style={[styles.tabsContainer, { backgroundColor: theme.background.tertiary }]}>
        <Animated.View
          style={[
            styles.animatedIndicator,
            {
              width: tabWidth,
              transform: [{ translateX: indicatorX }],
              backgroundColor: theme.background.primary,
              shadowColor: '#000',
            }
          ]}
        />

        <TouchableOpacity
          style={styles.tab}
          onPress={() => handleTabChange('disclosures')}
          activeOpacity={0.9}
        >
          <Text style={[styles.tabText, { color: activeTab === 'disclosures' ? theme.primary.main : theme.text.tertiary }]}>
            {t('tabs.disclosures')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tab}
          onPress={() => handleTabChange('free')}
          activeOpacity={0.9}
        >
          <Text style={[styles.tabText, { color: activeTab === 'free' ? theme.primary.main : theme.text.tertiary }]}>
            {t('insights.freeInsights')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tab}
          onPress={() => handleTabChange('premium')}
          activeOpacity={0.9}
        >
          <View style={styles.tabContent}>
            <Text style={[styles.tabText, { color: activeTab === 'premium' ? theme.primary.main : theme.text.tertiary }]}>
              {t('insights.premiumInsights')}
            </Text>
            <LinearGradient
              colors={[theme.primary.main, theme.primary.dark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.premiumBadge}
            >
              <Text style={styles.premiumBadgeText}>PRO</Text>
            </LinearGradient>
          </View>
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
          hideAccessFilter
          ListHeaderComponent={renderBannerHeader()}
        />
      ) : (
        <PremiumInsightsListScreen
          hideHeader
          hideAccessFilter
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
          <ResponsiveContainer style={{ flex: 1 }}>
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
  tabsWrapper: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    height: 48,
    borderRadius: 24,
    padding: 4,
    position: 'relative',
    alignItems: 'center',
    overflow: 'hidden',
  },
  animatedIndicator: {
    position: 'absolute',
    height: 40,
    left: 4,
    borderRadius: 20,
    elevation: 3,
  },
  tab: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
  },
  premiumBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  premiumBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
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
