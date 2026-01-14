/**
 * Network Utility
 * Handles offline/online detection
 */

import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

/**
 * Hook to check if device is online
 */
export const useIsOnline = (): boolean => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsOnline(state.isConnected === true && state.isInternetReachable !== false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return isOnline;
};

/**
 * Check current network status
 */
export const checkNetworkStatus = async (): Promise<boolean> => {
  const state = await NetInfo.fetch();
  return state.isConnected === true && state.isInternetReachable !== false;
};

/**
 * Get network type
 */
export const getNetworkType = async (): Promise<string | null> => {
  const state = await NetInfo.fetch();
  return state.type;
};
