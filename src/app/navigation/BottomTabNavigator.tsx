/**
 * Bottom Tab Navigator
 * Main navigation tabs for the app
 */

import React from 'react';
import { Platform, View, StyleSheet, Animated } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

import { BottomTabParamList } from './types';
import { useAuth } from '../auth';
import { useLocalization } from '../providers/LocalizationProvider';
import { useTheme } from '../providers/ThemeProvider';
import { spacing } from '../../core/theme/spacing';

// Import Tab Screens
import { HomeScreen } from '../../features/home/HomeScreen';
import { MarketScreen } from '../../features/market/MarketScreen';
import { ChatListScreen } from '../../features/chat/list';
import { ProfileScreen } from '../../features/profile/ProfileScreen';
import { AdminDashboardScreen } from '../../features/admin';
import { DesktopTopNav } from '../../features/home/components/DesktopTopNav';
import { useWindowDimensions } from 'react-native';

const Tab = createBottomTabNavigator<BottomTabParamList>();

interface BottomTabNavigatorProps {
  onNavigateToChat: (conversationId: string) => void;
  onNavigateToInsightDetail: (insightId: string, title?: string) => void;
  onNavigateToSettings: () => void;
  onNavigateToSubscription: (isSubscribed: boolean) => void;
  onNavigateToTerms: () => void;
  onNavigateToAbout: () => void;
  onNavigateToInsightRequests: () => void;
  onLogout: () => void;
}

export const BottomTabNavigator: React.FC<BottomTabNavigatorProps> = ({
  onNavigateToChat,
  onNavigateToInsightDetail,
  onNavigateToSettings,
  onNavigateToSubscription,
  onNavigateToTerms,
  onNavigateToAbout,
  onNavigateToInsightRequests,
  onLogout,
}) => {
  const { state: authState } = useAuth();
  const { t } = useLocalization();
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;

  // Get user from session
  const user = authState.session?.user;

  // Debug: Log user data
  console.log('[BottomTabNavigator] Session User:', user);
  console.log('[BottomTabNavigator] User Role:', user?.role);

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  console.log('[BottomTabNavigator] isAdmin:', isAdmin);

  // Custom tab bar icon wrapper with animation
  const TabIcon = ({ name, color, focused }: { name: string; color: string; focused: boolean }) => {
    const scaleAnim = React.useRef(new Animated.Value(focused ? 1 : 0.9)).current;
    const opacityAnim = React.useRef(new Animated.Value(focused ? 1 : 0.6)).current;

    React.useEffect(() => {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: focused ? 1 : 0.9,
          useNativeDriver: true,
          friction: 6,
          tension: 40,
        }),
        Animated.timing(opacityAnim, {
          toValue: focused ? 1 : 0.6,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }, [focused]);

    return (
      <Animated.View
        style={[
          styles.iconContainer,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
          focused && {
            backgroundColor: theme.primary.main + '20',
            borderWidth: 2,
            borderColor: theme.primary.main + '40',
          },
        ]}
      >
        <Icon
          name={focused ? name.replace('-outline', '') : name}
          size={26}
          color={color}
        />
        {focused && (
          <View style={[styles.activeIndicator, { backgroundColor: theme.primary.main }]} />
        )}
      </Animated.View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {isDesktop && <DesktopTopNav />}
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: theme.primary.main,
          tabBarInactiveTintColor: theme.text.tertiary,
          tabBarShowLabel: !isDesktop,
          tabBarStyle: [
            {
              backgroundColor: theme.background.primary,
              borderTopWidth: 0,
              height: Platform.OS === 'ios' ? 88 : 72,
              paddingBottom: Platform.OS === 'ios' ? 28 : 12,
              paddingTop: 12,
              paddingHorizontal: 8,
              position: 'absolute',
              bottom: spacing.md,
              left: spacing.md,
              right: spacing.md,
              borderRadius: 36,
              elevation: 10,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              borderWidth: 1,
              borderColor: theme.border.main + '20',
            },
            isDesktop && { display: 'none' }
          ],
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '700',
            marginTop: 6,
            letterSpacing: 0.3,
          },
          tabBarItemStyle: {
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 4,
          },
          tabBarHideOnKeyboard: true,
        }}
        initialRouteName="HomeTab"
      >
        {/* Home Tab - Insights */}
        <Tab.Screen
          name="HomeTab"
          options={{
            tabBarLabel: t('tabs.home'),
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name="home-outline" color={color} focused={focused} />
            ),
          }}
          component={HomeScreen}
        />

        {/* Market Tab */}
        <Tab.Screen
          name="MarketTab"
          options={{
            tabBarLabel: t('tabs.market'),
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name="bar-chart-outline" color={color} focused={focused} />
            ),
          }}
          component={MarketScreen}
        />

        {/* Chat Tab */}
        <Tab.Screen
          name="ChatTab"
          options={{
            tabBarLabel: t('tabs.chat'),
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name="chatbubbles-outline" color={color} focused={focused} />
            ),
          }}
        >
          {() => (
            <ChatListScreen
              onNavigateToChat={onNavigateToChat}
              onNavigateToNewChat={() => {
                // TODO: Implement new chat creation
                console.log('Navigate to new chat');
              }}
            />
          )}
        </Tab.Screen>

        {/* Profile Tab */}
        <Tab.Screen
          name="ProfileTab"
          options={{
            tabBarLabel: t('tabs.profile'),
            tabBarIcon: ({ color, focused }) => (
              <TabIcon name="person-outline" color={color} focused={focused} />
            ),
          }}
        >
          {() => (
            <ProfileScreen
              onNavigateBack={() => {
                // No back action needed in tab context
              }}
              onNavigateToSettings={onNavigateToSettings}
              onNavigateToSubscription={onNavigateToSubscription}
              onNavigateToTerms={onNavigateToTerms}
              onNavigateToAbout={onNavigateToAbout}
              onNavigateToInsightRequests={onNavigateToInsightRequests}
              onLogout={onLogout}
            />
          )}
        </Tab.Screen>

        {/* Admin Tab - Conditional */}
        {isAdmin && (
          <Tab.Screen
            name="AdminTab"
            options={{
              tabBarLabel: t('tabs.admin'),
              tabBarIcon: ({ color, focused }) => (
                <TabIcon name="shield-outline" color={color} focused={focused} />
              ),
            }}
            component={AdminDashboardScreen}
          />
        )}
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
