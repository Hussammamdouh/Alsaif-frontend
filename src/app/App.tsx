import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import { requireNativeModule } from 'expo';
import { AppProviders } from './providers';
import { RootNavigator } from './navigation';
import { AppLockWrapper } from '../shared/components';

// Dynamically resolve quick actions module on native platforms
const getQuickActionsModule = () => {
  if (Platform.OS !== 'web') {
    try {
      // Pre-flight check: see if the native module is compiled into the binary
      const nativeModule = requireNativeModule('ExpoQuickActions');
      if (nativeModule) {
        return require('expo-quick-actions');
      }
    } catch (e) {
      console.warn('[QuickActions] ExpoQuickActions native module is not compiled in this binary:', e);
    }
  }
  return null;
};

/**
 * Branded Scrollbar for Web
 */
const GlobalStyles = () => {
  if (Platform.OS !== 'web') return null;
  return (
    <style dangerouslySetInnerHTML={{
      __html: `
            ::-webkit-scrollbar {
                width: 8px;
                height: 8px;
            }
            ::-webkit-scrollbar-track {
                background: transparent;
            }
            ::-webkit-scrollbar-thumb {
                background: #22c55e;
                border-radius: 10px;
                border: 2px solid transparent;
                background-clip: content-box;
            }
            ::-webkit-scrollbar-thumb:hover {
                background: #16a34a;
                border: 2px solid transparent;
                background-clip: content-box;
            }
            * {
                scrollbar-width: thin;
                scrollbar-color: #22c55e transparent;
            }
        `}} />
  );
};

const App: React.FC = () => {
  useEffect(() => {
    const QuickActions = getQuickActionsModule();
    if (QuickActions) {
      // Set quick action items on device home screen
      QuickActions.setItems([
        {
          title: 'Search Disclosures',
          subtitle: 'View corporate disclosures',
          icon: 'search',
          id: 'disclosures',
          params: { url: 'alsaif-analysis://disclosures' },
        },
        {
          title: 'Market Watch',
          subtitle: 'Live DFM and ADX indices',
          icon: 'compose',
          id: 'market',
          params: { url: 'alsaif-analysis://market' },
        },
      ]);

      // Listen to quick action taps while app is running
      const sub = QuickActions.addListener((action: any) => {
        if (action?.params?.url) {
          Linking.openURL(action.params.url).catch((err) =>
            console.error('[QuickActions] Failed to open URL:', err)
          );
        }
      });

      // Handle initial action if the app was launched by tapping a shortcut
      const launchAction = QuickActions.initial;
      if (launchAction?.params?.url) {
        Linking.openURL(launchAction.params.url).catch((err) =>
          console.error('[QuickActions] Failed to open initial URL:', err)
        );
      }

      return () => {
        sub.remove();
      };
    }
  }, []);

  return (
    <AppProviders>
      <GlobalStyles />
      <AppLockWrapper>
        <RootNavigator />
      </AppLockWrapper>
    </AppProviders>
  );
};

export default App;
