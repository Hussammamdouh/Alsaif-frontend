/**
 * App Component
 * Main application entry point
 */

import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import * as QuickActions from 'expo-quick-actions';
import { AppProviders } from './providers';
import { RootNavigator } from './navigation';
import { AppLockWrapper } from '../shared/components';

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
    if (Platform.OS !== 'web') {
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
      const sub = QuickActions.addListener((action) => {
        if (action?.params?.url) {
          Linking.openURL(action.params.url).catch((err) =>
            console.error('[QuickActions] Failed to open URL:', err)
          );
        }
      });

      // Handle initial action if the app was launched by tapping a shortcut
      QuickActions.initialAction()
        .then((action) => {
          if (action?.params?.url) {
            Linking.openURL(action.params.url).catch((err) =>
              console.error('[QuickActions] Failed to open initial URL:', err)
            );
          }
        })
        .catch((err) => console.error('[QuickActions] Initial action error:', err));

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
