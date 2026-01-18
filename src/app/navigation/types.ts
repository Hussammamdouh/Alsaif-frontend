/**
 * Navigation Types
 * Type-safe navigation parameter definitions
 */

import { NavigatorScreenParams } from '@react-navigation/native';

/**
 * Root Stack Navigator Parameters
 * Main navigation flow for the app
 */
export type RootStackParamList = {
  Splash: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainStackParamList>;
};

/**
 * Auth Stack Navigator Parameters
 * Authentication flow screens
 */
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { email?: string };
};

/**
 * Bottom Tab Navigator Parameters
 * Main app tabs
 */
export type BottomTabParamList = {
  HomeTab: undefined;
  MarketTab: undefined;
  ChatTab: undefined;
  ProfileTab: undefined;
  AdminTab: undefined;
  NewsTab: undefined;
};

/**
 * Main Stack Navigator Parameters
 * Post-authentication navigation
 */
export type MainStackParamList = {
  MainTabs: NavigatorScreenParams<BottomTabParamList>;

  // Modal/Detail Screens (outside tabs)
  ChatRoom: { conversationId: string };
  InsightDetail: { insightId: string; title?: string };
  InsightRequests: undefined;
  Notifications: { category?: string };
  NewsDetail: { newsId: string; title: string };

  // User Subscription Screens
  Subscription: undefined;
  Paywall: undefined;
  SubscriptionPlans: undefined;

  // Settings
  Settings: undefined;
  Terms: undefined;

  // Admin Screens (protected by role-based guards)
  AdminDashboard: undefined;
  AdminUsers: undefined;
  AdminInsights: undefined;
  AdminSubscriptions: undefined;
  AdminBroadcast: undefined;
  AdminAuditLogs: undefined;

  // New Admin Enhancement Screens
  AdminAnalytics: undefined;
  AdminRevenue: undefined;
  AdminScheduler: undefined;
  AdminModeration: undefined;
  AdminSubscriptionPlans: undefined;
  AdminDiscountCodes: undefined;
  AdminNotificationTemplates: undefined;
  AdminBulkActions: undefined;
  AdminBanners: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList { }
  }
}
