/**
 * Auth Provider
 * Global authentication context provider
 * Manages auth state and provides auth operations to entire app
 */

import React, {
  createContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { AppState, AppStateStatus, PanResponder } from 'react-native';
import { AuthContextValue, BootstrapState, User } from './auth.types';
import { authReducer, initialAuthState } from './auth.reducer';
import * as AuthActions from './auth.actions';
import { LoadingScreen } from '../../shared/components/LoadingScreen';
import { setOnUnauthorizedCallback } from '../../core/services/api/apiClient';

/**
 * Auth Context
 * React context for authentication state
 */
export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

/**
 * Auth Provider Props
 */
interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Auth Provider Component
 * Wraps app and provides authentication functionality
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  /**
   * Bootstrap app on mount
   */
  useEffect(() => {
    AuthActions.bootstrap(dispatch);

    // Register callback for automatic logout on unrecoverable token errors
    setOnUnauthorizedCallback(() => {
      console.log('[AuthProvider] Auto-logout triggered by ApiClient');
      AuthActions.logout(dispatch);
    });

    // Register callback for background token refresh synchronization
    const { setOnTokenRefreshedCallback } = require('../../core/services/api/apiClient');
    setOnTokenRefreshedCallback((tokens: any) => {
      console.log('[AuthProvider] Syncing state with background token refresh');
      dispatch({
        type: require('./auth.types').AuthActionType.UPDATE_SESSION,
        payload: { tokens },
      });
    });

    return () => {
      // Clear callbacks on unmount
      setOnUnauthorizedCallback(() => { });
      const { setOnTokenRefreshedCallback } = require('../../core/services/api/apiClient');
      setOnTokenRefreshedCallback(() => { });
    };
  }, []);

  /**
   * Initialize WebSocket connection when user is authenticated
   */
  useEffect(() => {
    if (state.isAuthenticated && state.session) {
      // Initialize WebSocket connection
      (async () => {
        const { socketService } = await import('../../core/services/websocket/socketService');
        console.log('[AuthProvider] User authenticated - initializing WebSocket connection');
        await socketService.connect();
      })();
    } else {
      // Disconnect WebSocket when user logs out
      (async () => {
        const { socketService } = await import('../../core/services/websocket/socketService');
        console.log('[AuthProvider] User logged out - disconnecting WebSocket');
        socketService.disconnect();
      })();
    }
  }, [state.isAuthenticated]);

  /**
   * Session Inactivity Timeout
   * Automatically log out user after 30 minutes of inactivity
   */
  const lastActivityRef = React.useRef(Date.now());
  const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  useEffect(() => {
    if (!state.isAuthenticated) return;

    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastActivityRef.current > INACTIVITY_TIMEOUT) {
        console.log('[AuthProvider] Inactivity timeout reached - logging out');
        logout();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [state.isAuthenticated]);

  // Update activity timestamp on AppState change (foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        lastActivityRef.current = Date.now();
      }
    });
    return () => subscription.remove();
  }, []);

  /**
   * Handle app state changes (background/foreground)
   * Validate session when app comes to foreground
   */
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && state.isAuthenticated) {
        // App came to foreground - validate session
        // If expired, try to refresh
        if (state.session && state.session.tokens.refreshToken) {
          const now = Date.now();
          const bufferTime = 5 * 60 * 1000; // 5 minutes

          if (state.session.expiresAt < now + bufferTime) {
            // Token is expired or will expire soon
            AuthActions.refreshTokens(
              dispatch,
              state.session.tokens.refreshToken
            ).catch(() => {
              // Refresh failed - logout
              AuthActions.logout(dispatch);
            });
          }
        }
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    );

    return () => {
      subscription.remove();
    };
  }, [state.isAuthenticated, state.session]);

  /*
   * Login
   */
  const login = useCallback(async (email: string, password: string) => {
    await AuthActions.login(dispatch, email, password);
    // User requested explicit refresh after login on web to ensure fresh state
    if (Platform.OS === 'web') {
      console.log('[AuthProvider] Web login success - reloading page to ensure clean state');
      window.location.reload();
    }
  }, []);

  const register = useCallback(
    async (fullName: string, email: string, password: string, nationality: string, phoneNumber?: string, country?: string): Promise<User> => {
      return await AuthActions.registerUser(dispatch, fullName, email, password, phoneNumber, country, nationality) as User;
    },
    []
  );

  /**
   * Logout
   */
  const logout = useCallback(async () => {
    await AuthActions.logout(dispatch);
  }, []);

  /**
   * Refresh Tokens
   */
  const refreshTokens = useCallback(async () => {
    if (!state.session?.tokens.refreshToken) {
      throw new Error('No refresh token available');
    }
    await AuthActions.refreshTokens(dispatch, state.session.tokens.refreshToken);
  }, [state.session]);

  /**
   * Enable Biometric
   */
  const enableBiometric = useCallback(async () => {
    await AuthActions.enableBiometric(dispatch);
  }, []);

  /**
   * Disable Biometric
   */
  const disableBiometric = useCallback(async () => {
    await AuthActions.disableBiometric(dispatch);
  }, []);

  /**
   * Login with Biometric
   */
  const loginWithBiometric = useCallback(async () => {
    await AuthActions.loginWithBiometric(dispatch);
  }, []);

  /**
   * Verify Account
   */
  const verifyAccount = useCallback(async (userId: string, code: string) => {
    await AuthActions.verifyAccount(dispatch, userId, code);
  }, []);

  /**
   * Resend Verification Code
   */
  const resendVerificationCode = useCallback(async (userId: string) => {
    await AuthActions.resendVerificationCode(dispatch, userId);
  }, []);

  /**
   * Clear Error
   */
  const clearError = useCallback(() => {
    AuthActions.clearError(dispatch);
  }, []);

  /**
   * Memoized context value
   * Prevents unnecessary re-renders
   */
  const contextValue = useMemo<AuthContextValue>(
    () => ({
      state,
      login,
      register,
      logout,
      refreshTokens,
      enableBiometric,
      disableBiometric,
      loginWithBiometric,
      verifyAccount,
      resendVerificationCode,
      clearError,
    }),
    [
      state,
      login,
      register,
      logout,
      refreshTokens,
      enableBiometric,
      disableBiometric,
      loginWithBiometric,
      verifyAccount,
      resendVerificationCode,
      clearError,
    ]
  );

  /**
   * Show loading screen during bootstrap
   */
  if (state.bootstrapState === BootstrapState.LOADING) {
    return <LoadingScreen message="Verifying session..." />;
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
