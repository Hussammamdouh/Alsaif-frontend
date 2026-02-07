/**
 * App Component
 * Main application entry point
 */

import React from 'react';
import { AppProviders } from './providers';
import { RootNavigator } from './navigation';

/**
 * App Component
 * Sets up providers and navigation
 */
import { Platform } from 'react-native';

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
  return (
    <AppProviders>
      <GlobalStyles />
      <RootNavigator />
    </AppProviders>
  );
};

export default App;
