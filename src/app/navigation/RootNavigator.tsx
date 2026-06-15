/**
 * Root Navigator
 * Main navigation structure with splash and authentication flow
 */

import React, { useState, useCallback, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Linking from 'expo-linking';

import { SplashScreen } from '../../features/splash/SplashScreen';
import { LoginScreen } from '../../features/auth/login';
import { RegisterScreen } from '../../features/auth/register';
import { VerificationScreen } from '../../features/auth/verification/VerificationScreen';
import { ForgotPasswordScreen, ResetPasswordScreen } from '../../features/auth/forgot-password';
import { ConversationScreen } from '../../features/chat/conversation-v2';
import { SettingsScreen } from '../../features/settings/SettingsScreen';
import { SecuritySettingsScreen } from '../../features/settings/SecuritySettingsScreen';
import {
  SubscriptionScreen,
  PaywallScreen,
  SubscriptionPlansScreen,
  PaymentSuccessScreen,
} from '../../features/subscription';
import {
  InsightDetailsScreen,
} from '../../features/insights';
import { PdfViewerScreen, DisclosureDetailsScreen } from '../../features/disclosure';
import { NewsDetailScreen } from '../../features/news/screens/NewsDetailScreen';
import { NewsListScreen } from '../../features/news/screens/NewsListScreen';
import { UserRequestHistoryScreen } from '../../features/insights/requests/UserRequestHistoryScreen';
import {
  AdminDashboardScreen,
  AdminUsersScreen,
  AdminInsightsScreen,
  AdminSubscriptionsScreen,
  AdminBroadcastScreen,
  AdminAuditLogsScreen,
  AdminAnalyticsScreen,
  AdminModerationScreen,
  AdminSubscriptionPlansScreen,
  AdminDiscountCodesScreen,
  AdminBannersScreen,
  AdminGroupChatScreen,
  AdminSystemControlScreen,
} from '../../features/admin';
import { TermsScreen } from '../../features/legal/TermsScreen';
import { AboutScreen } from '../../features/about';
import { NotificationsScreen } from '../../features/notifications';
import { RootStackParamList, AuthStackParamList, MainStackParamList } from './types';
import { useAuth, UserRole } from '../auth';
import { useLocalization } from '../providers/LocalizationProvider';
import { AdminGuard, SuperadminGuard } from './AdminGuard';
import { BottomTabNavigator } from './BottomTabNavigator';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();

const linking = {
  prefixes: [
    Linking.createURL('/'),
    'alsaif-analysis://',
    'https://alsaifanalysis.com',
    'https://*.alsaifanalysis.com',
  ],
  config: {
    screens: {
      Main: {
        path: '',
        screens: {
          MainTabs: {
            path: '',
            screens: {
              HomeTab: 'home',
              MarketTab: 'market',
              ChatTab: 'chat',
              ProfileTab: 'profile',
              AdminTab: 'admin',
              DisclosuresTab: 'disclosures',
              InsightsTab: 'insights',
            },
          },
          ChatRoom: 'chat/:conversationId',
          InsightDetail: 'insight/:insightId',
          PdfViewer: 'pdf-viewer',
          DisclosureDetails: 'disclosure/:disclosureId',
          NewsDetail: 'news/:newsId',
          NewsList: 'news',
          InsightRequests: 'requests',
          Notifications: 'notifications',
          Settings: 'settings',
          Security: 'settings/security',
          Subscription: 'subscription',
          Paywall: 'paywall',
          SubscriptionPlans: 'subscription-plans',
          PaymentSuccess: 'payment-success',
          Terms: 'privacy',
          About: 'about',
          AdminDashboard: 'admin/dashboard',
          AdminUsers: 'admin/users',
          AdminInsights: 'admin/insights',
          AdminSubscriptions: 'admin/subscriptions',
          AdminBroadcast: 'admin/broadcast',
          AdminAuditLogs: 'admin/audit-logs',
          AdminAnalytics: 'admin/analytics',
          AdminModeration: 'admin/moderation',
          AdminSubscriptionPlans: 'admin/subscription-plans',
          AdminDiscountCodes: 'admin/discount-codes',
          AdminBanners: 'admin/banners',
          AdminGroupChat: 'admin/group-chat',
          AdminSystemControl: 'admin/system-control',
        },
      },
      Auth: {
        path: 'auth',
        screens: {
          Login: 'login',
          Register: 'register',
          Verification: 'verify/:userId/:email',
          ForgotPassword: 'forgot-password',
          ResetPassword: 'reset-password/:email',
        },
      },
    },
  },
};

/**
 * Root Navigator Component
 * Manages app-wide navigation flow
 * Splash → Auth → Main
 */
/**
 * Root Navigator Component
 * Manages app-wide navigation flow
 * Splash → Auth → Main
 */
export const RootNavigator: React.FC = () => {
  const { state: authState } = useAuth();
  const { t } = useLocalization();
  const [showSplash, setShowSplash] = useState(true);

  // Helper to map route names to localized titles
  const getPageTitle = (routeName: string) => {
    switch (routeName) {
      case 'HomeTab':
        return t('tabs.home') || 'Home';
      case 'MarketTab':
        return t('tabs.market') || 'Market';
      case 'ChatTab':
        return t('tabs.chat') || 'Chat';
      case 'ProfileTab':
        return t('tabs.profile') || 'Profile';
      case 'AdminTab':
      case 'AdminDashboard':
        return t('tabs.admin') || 'Admin';
      case 'DisclosuresTab':
      case 'DisclosureDetails':
        return t('tabs.disclosures') || 'Disclosures';
      case 'InsightsTab':
      case 'InsightDetail':
        return t('tabs.insights') || 'Insights';
      case 'Settings':
        return t('profile.settings') || 'Settings';
      case 'Security':
        return t('profile.security') || 'Security';
      case 'Login':
        return t('login.title') || 'Login';
      case 'Register':
        return t('login.signUp') || 'Register';
      default:
        return routeName;
    }
  };

  // Log auth state changes
  useEffect(() => {
    console.log('[RootNavigator] Auth state changed:');
    console.log('  - isAuthenticated:', authState.isAuthenticated);
    console.log('  - bootstrapState:', authState.bootstrapState);
  }, [authState.isAuthenticated, authState.bootstrapState]);

  /**
   * Handle splash screen completion
   */
  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
  }, []);

  /**
   * Handle successful registration
   */
  const handleRegisterSuccess = useCallback((userId: string, email: string, navigation: any) => {
    navigation.navigate('Auth', {
      screen: 'Verification',
      params: { userId, email }
    });
  }, []);

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <NavigationContainer
      linking={linking}
      documentTitle={{
        enabled: true,
        formatter: (options, route) => {
          const appName = t('common.appName') || 'AlSaif Analysis';
          const pageTitle = getPageTitle(route?.name || '');
          return `${appName} | ${pageTitle}`;
        }
      }}
    >
      <RootStack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          animationDuration: 300,
        }}
        initialRouteName="Main"
      >
        <RootStack.Screen name="Main" component={MainStackScreens} />

        {!authState.isAuthenticated && (
          <RootStack.Screen name="Auth">
            {(props) => <AuthStackScreens {...props} onRegisterSuccess={handleRegisterSuccess} />}
          </RootStack.Screen>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

/**
 * Main Stack Screens
 * Extracted into a stable component to prevent unmounting on RootNavigator state changes
 */
const MainStackScreens: React.FC<any> = ({ navigation }) => {
  return (
    <MainStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
      initialRouteName="MainTabs"
    >
      {/* Bottom Tab Navigator */}
      <MainStack.Screen name="MainTabs">
        {() => (
          <BottomTabNavigator
            onNavigateToChat={(conversationId) =>
              navigation.navigate('Main', {
                screen: 'ChatRoom',
                params: { conversationId },
              })
            }
            onNavigateToInsightDetail={(insightId, title) =>
              navigation.navigate('Main', {
                screen: 'InsightDetail',
                params: { insightId, title },
              })
            }
            onNavigateToSettings={() =>
              navigation.navigate('Main', {
                screen: 'Settings',
              })
            }
            onNavigateToSubscription={(isSubscribed: boolean) =>
              navigation.navigate('Main', {
                screen: isSubscribed ? 'Subscription' : 'Paywall',
              })
            }
            onNavigateToTerms={(tab?: 'privacy' | 'terms') =>
              navigation.navigate('Main', {
                screen: 'Terms',
                params: { tab: tab || 'privacy' }
              })
            }
            onNavigateToAbout={() =>
              navigation.navigate('Main', {
                screen: 'About',
              })
            }
            onNavigateToInsightRequests={() =>
              navigation.navigate('Main', {
                screen: 'InsightRequests',
              })
            }
            onLogout={() => {
              // Logout is handled by ProfileScreen via authLogout()
            }}
          />
        )}
      </MainStack.Screen>

      {/* Modal/Detail Screens */}
      <MainStack.Screen name="ChatRoom">
        {({ route, navigation: chatNav }) => (
          <ConversationScreen
            conversationId={route.params.conversationId}
            onNavigateBack={() => chatNav.goBack()}
          />
        )}
      </MainStack.Screen>

      <MainStack.Screen name="InsightDetail" component={InsightDetailsScreen} />
      <MainStack.Screen name="PdfViewer" component={PdfViewerScreen} />
      <MainStack.Screen name="DisclosureDetails" component={DisclosureDetailsScreen} />
      <MainStack.Screen name="NewsDetail" component={NewsDetailScreen} />
      <MainStack.Screen name="NewsList" component={NewsListScreen} />
      <MainStack.Screen name="InsightRequests" component={UserRequestHistoryScreen} />
      <MainStack.Screen name="Notifications" component={NotificationsScreen} />

      {/* Settings Screen */}
      <MainStack.Screen name="Settings">
        {({ navigation: settingsNav }) => (
          <SettingsScreen
            onNavigateBack={() => settingsNav.goBack()}
            onNavigateToSecurity={() => settingsNav.navigate('Security')}
            onNavigateToSubscription={(isSubscribed: boolean) =>
              settingsNav.navigate(isSubscribed ? 'Subscription' : 'Paywall')
            }
            onNavigateToTerms={(tab?: 'privacy' | 'terms') =>
              navigation.navigate('Main', {
                screen: 'Terms',
                params: { tab: tab || 'privacy' }
              })
            }
            onNavigateToAbout={() =>
              settingsNav.navigate('About')
            }
            onLogout={() => {
              // Logout is handled by ProfileScreen via authLogout()
            }}
          />
        )}
      </MainStack.Screen>

      <MainStack.Screen name="Security">
        {({ navigation: securityNav }) => (
          <SecuritySettingsScreen
            onNavigateBack={() => securityNav.goBack()}
            onNavigateToSettings={() =>
              navigation.navigate('Main', {
                screen: 'Settings',
              })
            }
          />
        )}
      </MainStack.Screen>

      {/* User Subscription Screens */}
      <MainStack.Screen name="Subscription" component={SubscriptionScreen} />
      <MainStack.Screen name="Paywall" component={PaywallScreen} />
      <MainStack.Screen name="SubscriptionPlans" component={SubscriptionPlansScreen} />
      <MainStack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
      <MainStack.Screen name="Terms">
        {({ route, navigation: termsNav }) => (
          <TermsScreen route={route} onNavigateBack={() => termsNav.goBack()} />
        )}
      </MainStack.Screen>

      {/* About Screen */}
      <MainStack.Screen name="About" component={AboutScreen} />

      {/* Admin Screens - Protected by AdminGuard */}
      <MainStack.Screen name="AdminDashboard">
        {() => (
          <AdminGuard requiredRole={[UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.MODERATOR]}>
            <AdminDashboardScreen />
          </AdminGuard>
        )}
      </MainStack.Screen>
      <MainStack.Screen name="AdminUsers">
        {() => (
          <AdminGuard>
            <AdminUsersScreen />
          </AdminGuard>
        )}
      </MainStack.Screen>
      <MainStack.Screen name="AdminInsights">
        {() => (
          <AdminGuard>
            <AdminInsightsScreen />
          </AdminGuard>
        )}
      </MainStack.Screen>
      <MainStack.Screen name="AdminSubscriptions">
        {() => (
          <AdminGuard>
            <AdminSubscriptionsScreen />
          </AdminGuard>
        )}
      </MainStack.Screen>
      <MainStack.Screen name="AdminBroadcast">
        {() => (
          <AdminGuard>
            <AdminBroadcastScreen />
          </AdminGuard>
        )}
      </MainStack.Screen>
      <MainStack.Screen name="AdminAuditLogs">
        {() => (
          <SuperadminGuard>
            <AdminAuditLogsScreen />
          </SuperadminGuard>
        )}
      </MainStack.Screen>

      {/* New Admin Enhancement Screens */}
      <MainStack.Screen name="AdminAnalytics">
        {() => (
          <AdminGuard>
            <AdminAnalyticsScreen />
          </AdminGuard>
        )}
      </MainStack.Screen>
      <MainStack.Screen name="AdminModeration">
        {() => (
          <AdminGuard requiredRole={[UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.MODERATOR]}>
            <AdminModerationScreen />
          </AdminGuard>
        )}
      </MainStack.Screen>
      <MainStack.Screen name="AdminSubscriptionPlans">
        {() => (
          <AdminGuard>
            <AdminSubscriptionPlansScreen />
          </AdminGuard>
        )}
      </MainStack.Screen>
      <MainStack.Screen name="AdminDiscountCodes">
        {() => (
          <AdminGuard>
            <AdminDiscountCodesScreen />
          </AdminGuard>
        )}
      </MainStack.Screen>
      <MainStack.Screen name="AdminBanners">
        {() => (
          <AdminGuard requiredRole={[UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.MODERATOR]}>
            <AdminBannersScreen />
          </AdminGuard>
        )}
      </MainStack.Screen>
      <MainStack.Screen name="AdminGroupChat">
        {({ navigation: adminNav }) => (
          <AdminGuard>
            <AdminGroupChatScreen onNavigateBack={() => adminNav.goBack()} />
          </AdminGuard>
        )}
      </MainStack.Screen>
      <MainStack.Screen name="AdminSystemControl">
        {() => (
          <SuperadminGuard>
            <AdminSystemControlScreen />
          </SuperadminGuard>
        )}
      </MainStack.Screen>
    </MainStack.Navigator>
  );
};

/**
 * Auth Stack Screens
 */
const AuthStackScreens: React.FC<any> = ({ navigation, onRegisterSuccess }) => {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
      initialRouteName="Login"
    >
      <AuthStack.Screen name="Login">
        {() => (
          <LoginScreen
            onLoginSuccess={() => { }} // Navigator updates based on authState
            onNavigateToRegister={() => navigation.navigate('Auth', {
              screen: 'Register',
            })}
            onNavigateToForgotPassword={() => navigation.navigate('Auth', {
              screen: 'ForgotPassword',
            })}
          />
        )}
      </AuthStack.Screen>
      <AuthStack.Screen name="Register">
        {({ navigation: regNav }) => (
          <RegisterScreen
            onRegisterSuccess={(userId: string, email: string) => onRegisterSuccess(userId, email, regNav)}
            onNavigateToLogin={() => regNav.navigate('Login')}
          />
        )}
      </AuthStack.Screen>
      <AuthStack.Screen name="Verification">
        {({ route }) => (
          <VerificationScreen
            userId={route.params.userId}
            email={route.params.email}
            onVerificationSuccess={() => navigation.navigate('Auth', {
              screen: 'Login'
            })}
            onBackToLogin={() => navigation.navigate('Auth', {
              screen: 'Login'
            })}
          />
        )}
      </AuthStack.Screen>
      <AuthStack.Screen name="ForgotPassword">
        {() => (
          <ForgotPasswordScreen
            onBackToLogin={() => navigation.navigate('Auth', {
              screen: 'Login',
            })}
            onResetEmailSent={(email: string) => navigation.navigate('Auth', {
              screen: 'ResetPassword',
              params: { email },
            })}
          />
        )}
      </AuthStack.Screen>
      <AuthStack.Screen name="ResetPassword">
        {({ route }) => (
          <ResetPasswordScreen
            email={route.params?.email}
            onBackToLogin={() => navigation.navigate('Auth', {
              screen: 'Login',
            })}
            onResetSuccess={() => navigation.navigate('Auth', {
              screen: 'Login',
            })}
          />
        )}
      </AuthStack.Screen>
    </AuthStack.Navigator>
  );
};
