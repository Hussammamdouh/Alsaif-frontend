import { Linking } from 'react-native';

/**
 * Navigation Utils
 * Handles complex URL/path based navigation across the app
 */

/**
 * Navigate to a specific screen based on an internal path or external URL
 */
export const navigateByUrl = (navigation: any, url: string) => {
    if (!url) {
        console.warn('[NavigationUtils] navigateByUrl called with empty URL');
        return;
    }

    const trimmedUrl = url.trim();

    // 1. Handle External URLs
    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
        Linking.openURL(trimmedUrl).catch(err =>
            console.error('[NavigationUtils] Failed to open external URL:', err)
        );
        return;
    }

    // 2. Handle Custom Scheme (if present)
    // e.g., alsaif-analysis://insights/123 -> /insights/123
    const normalizedUrl = trimmedUrl.replace('alsaif-analysis://', '/');

    // 3. Normalize path (remove leading slash for parsing)
    const path = normalizedUrl.startsWith('/') ? normalizedUrl.substring(1) : normalizedUrl;

    console.log(`[NavigationUtils] Parsing path: "${path}" (original: "${trimmedUrl}")`);

    // 4. Root / Home Cases
    if (path === '' || path === 'home' || path === 'MainTabs') {
        navigation.navigate('MainTabs');
        return;
    }

    // 5. Split segments for dynamic routing
    const segments = path.split('/');

    // - Insights: /insights/:id
    if (segments[0] === 'insights' && segments[1]) {
        navigation.navigate('InsightDetail', { insightId: segments[1] });
        return;
    }

    // - Chat: /chat/:id or /chatroom/:id
    if ((segments[0] === 'chat' || segments[0] === 'chatroom') && segments[1]) {
        navigation.navigate('ChatRoom', { conversationId: segments[1] });
        return;
    }

    // 6. Tab Navigation (Nested in MainTabs)
    if (path === 'market' || path === 'MarketTab') {
        navigation.navigate('MainTabs', { screen: 'MarketTab' });
        return;
    }
    if (path === 'profile' || path === 'ProfileTab') {
        navigation.navigate('MainTabs', { screen: 'ProfileTab' });
        return;
    }
    if (path === 'chats' || path === 'ChatTab') {
        navigation.navigate('MainTabs', { screen: 'ChatTab' });
        return;
    }

    // 7. Direct Stack Screen Navigation
    const screenMap: Record<string, string> = {
        'notifications': 'Notifications',
        'settings': 'Settings',
        'security': 'Security',
        'paywall': 'Paywall',
        'subscription': 'Subscription',
        'plans': 'SubscriptionPlans',
        'terms': 'Terms',
        'about': 'About',
        'requests': 'InsightRequests',
    };

    const targetScreen = screenMap[path.toLowerCase()];
    if (targetScreen) {
        navigation.navigate(targetScreen);
        return;
    }

    // 8. Admin Screens
    if (path.startsWith('admin')) {
        const adminPath = path.replace('admin/', '');
        const adminScreenMap: Record<string, string> = {
            'dashboard': 'AdminDashboard',
            'users': 'AdminUsers',
            'insights': 'AdminInsights',
            'subscriptions': 'AdminSubscriptions',
            'broadcast': 'AdminBroadcast',
            'analytics': 'AdminAnalytics',
        };

        const targetAdminScreen = adminScreenMap[adminPath.toLowerCase()];
        if (targetAdminScreen) {
            navigation.navigate(targetAdminScreen);
            return;
        }
    }

    // 9. Final Fallback: Try exact match if no rules applied
    try {
        console.log(`[NavigationUtils] Attempting fallback navigation for: ${path}`);
        navigation.navigate(path as any);
    } catch (err) {
        console.error(`[NavigationUtils] All navigation attempts failed for: ${path}`, err);
    }
};
