/**
 * Notification Provider
 * Initializes and manages push notification side-effects
 */

import React, { PropsWithChildren, useEffect } from 'react';
import { useNotificationSetup } from '../../features/notifications/useNotificationSetup';
import { useAuth } from '../auth/auth.hooks';

export const NotificationProvider: React.FC<PropsWithChildren> = ({ children }) => {
    const { state } = useAuth();
    const userId = state.session?.user?.id;
    const userEmail = state.session?.user?.email;

    // Setup notifications
    // The hook handles internal initialization and cleanup
    const { cleanupNotifications } = useNotificationSetup({
        userId,
        userEmail,
    });

    // Handle cleanup on logout
    useEffect(() => {
        if (!state.isAuthenticated) {
            cleanupNotifications();
        }
    }, [state.isAuthenticated, cleanupNotifications]);

    return <>{children}</>;
};
