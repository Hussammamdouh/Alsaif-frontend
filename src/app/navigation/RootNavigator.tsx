/**
 * Root Navigator
 * Main navigation structure with splash and authentication flow
 */

import React, { useState, useCallback, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

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
} from '../../features/admin';
import { TermsScreen } from '../../features/legal/TermsScreen';
import { AboutScreen } from '../../features/about';
import { NotificationsScreen } from '../../features/notifications';
import { RootStackParamList, AuthStackParamList, MainStackParamList } from './types';
import { useAuth } from '../auth';
import { AdminGuard, SuperadminGuard } from './AdminGuard';
import { BottomTabNavigator } from './BottomTabNavigator';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();

/**
 * Root Navigator Component
 * Manages app-wide navigation flow
 * Splash → Auth → Main
 */
export const RootNavigator: React.FC = () => {
  const { state: authState } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

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
   * Handle successful login
   * Called by LoginScreen after successful authentication
   */
  const handleLoginSuccess = useCallback(() => {
    // Auth state is already updated by login action
    // Navigation will update automatically based on authState.isAuthenticated
  }, []);

  /**
   * Handle successful registration
   * Called by RegisterScreen after successful registration
   */
  const handleRegisterSuccess = useCallback((userId: string, email: string, navigation: any) => {
    // Navigate to Verification screen
    navigation.navigate('Auth', {
      screen: 'Verification',
      params: { userId, email }
    });
  }, []);

  return (
    <NavigationContainer>
      {showSplash ? (
        // Show splash screen on initial load
        <SplashScreen onFinish={handleSplashFinish} />
      ) : (
        // Main app navigation
        <RootStack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'fade',
            animationDuration: 300,
          }}
        >
          {!authState.isAuthenticated ? (
            // Show auth flow if not authenticated
            <RootStack.Screen name="Auth">
              {({ navigation }) => (
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
                        onLoginSuccess={handleLoginSuccess}
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
                        onRegisterSuccess={(userId: string, email: string) => handleRegisterSuccess(userId, email, regNav)}
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
                        onResetEmailSent={(email) => navigation.navigate('Auth', {
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
              )}
            </RootStack.Screen>
          ) : (
            // Show main app if authenticated
            <RootStack.Screen name="Main">
              {({ navigation }) => (
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
                        onNavigateToTerms={() =>
                          navigation.navigate('Main', {
                            screen: 'Terms',
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
                    {({ route, navigation }) => (
                      <ConversationScreen
                        conversationId={route.params.conversationId}
                        onNavigateBack={() => navigation.goBack()}
                      />
                    )}
                  </MainStack.Screen>

                  <MainStack.Screen name="InsightDetail" component={InsightDetailsScreen} />
                  <MainStack.Screen name="PdfViewer" component={PdfViewerScreen} />
                  <MainStack.Screen name="DisclosureDetails" component={DisclosureDetailsScreen} />
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
                        onNavigateToTerms={() =>
                          navigation.navigate('Main', {
                            screen: 'Terms',
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
                      />
                    )}
                  </MainStack.Screen>

                  {/* User Subscription Screens */}
                  <MainStack.Screen name="Subscription" component={SubscriptionScreen} />
                  <MainStack.Screen name="Paywall" component={PaywallScreen} />
                  <MainStack.Screen name="SubscriptionPlans" component={SubscriptionPlansScreen} />
                  <MainStack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
                  <MainStack.Screen name="Terms">
                    {({ navigation: termsNav }) => (
                      <TermsScreen onNavigateBack={() => termsNav.goBack()} />
                    )}
                  </MainStack.Screen>

                  {/* About Screen */}
                  <MainStack.Screen name="About">
                    {({ navigation: aboutNav }) => (
                      <AboutScreen />
                    )}
                  </MainStack.Screen>

                  {/* Admin Screens - Protected by AdminGuard */}
                  <MainStack.Screen name="AdminDashboard">
                    {() => (
                      <AdminGuard>
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
                      <AdminGuard>
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
                      <AdminGuard>
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
                </MainStack.Navigator>
              )}
            </RootStack.Screen>
          )}
        </RootStack.Navigator>
      )}
    </NavigationContainer>
  );
};
