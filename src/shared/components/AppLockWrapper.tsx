import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  AppState,
  AppStateStatus,
  Platform,
  ActivityIndicator,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons as Icon } from '@expo/vector-icons';
import { useTheme } from '../../app/providers/ThemeProvider';
import { triggerHaptic } from '../utils/haptics';

interface AppLockWrapperProps {
  children: React.ReactNode;
}

export const AppLockWrapper: React.FC<AppLockWrapperProps> = ({ children }) => {
  const { theme } = useTheme();
  const [isLocked, setIsLocked] = useState(false);
  const [authenticating, setAuthenticating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const appState = useRef(AppState.currentState);
  const isEnabledRef = useRef(false);

  // Check if App Lock is enabled in storage
  const checkAppLockStatus = async (): Promise<boolean> => {
    try {
      const val = await AsyncStorage.getItem('elsaif_app_lock_enabled');
      const enabled = val === 'true';
      isEnabledRef.current = enabled;
      return enabled;
    } catch (e) {
      console.warn('[AppLock] Failed to read app lock setting:', e);
      return false;
    }
  };

  // Perform Native Biometric Authentication
  const handleUnlock = useCallback(async () => {
    if (Platform.OS === 'web') {
      setIsLocked(false);
      return;
    }

    setAuthenticating(true);
    setErrorMsg(null);

    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        setIsLocked(false);
        setAuthenticating(false);
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock Elsaif Analysis',
        fallbackLabel: 'Use Device Passcode',
        disableDeviceFallback: false,
      });

      if (result.success) {
        setIsLocked(false);
        triggerHaptic('notificationSuccess');
      } else {
        setErrorMsg('Authentication failed. Please try again.');
        triggerHaptic('notificationError');
      }
    } catch (e) {
      console.error('[AppLock] Authentication error:', e);
      setErrorMsg('Failed to authenticate');
    } finally {
      setAuthenticating(false);
    }
  }, []);

  // Initialize and listen to app state changes
  useEffect(() => {
    const initAppLock = async () => {
      const enabled = await checkAppLockStatus();
      if (enabled) {
        setIsLocked(true);
        // Automatically prompt for authentication on startup
        setTimeout(handleUnlock, 200);
      }
    };
    initAppLock();

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      // Load latest configuration from storage
      const enabled = await checkAppLockStatus();

      if (enabled) {
        // App went to background
        if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
          setIsLocked(true);
        }
        // App returned to foreground
        if (nextAppState === 'active' && appState.current.match(/inactive|background/)) {
          handleUnlock();
        }
      } else {
        setIsLocked(false);
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [handleUnlock]);

  if (!isLocked) {
    return <>{children}</>;
  }

  // Locked Screen Overlay UI
  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: `${theme.primary.main}15` }]}>
          <Icon name="shield-lock" size={64} color={theme.primary.main} />
        </View>
        
        <Text style={[styles.title, { color: theme.text.primary }]}>Elsaif Analysis Locked</Text>
        <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
          Please authenticate using your device's biometrics to access your insights and reports.
        </Text>

        {errorMsg && (
          <Text style={[styles.errorText, { color: theme.accent.error }]}>{errorMsg}</Text>
        )}

        <TouchableOpacity
          onPress={handleUnlock}
          disabled={authenticating}
          style={[styles.button, { backgroundColor: theme.primary.main }]}
          activeOpacity={0.8}
        >
          {authenticating ? (
            <ActivityIndicator color={theme.text.inverse} />
          ) : (
            <>
              <Icon name="finger-print-outline" size={20} color={theme.text.inverse} style={styles.buttonIcon} />
              <Text style={[styles.buttonText, { color: theme.text.inverse }]}>Unlock App</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99999,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  content: {
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 28,
    minWidth: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
