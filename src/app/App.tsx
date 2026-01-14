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
const App: React.FC = () => {
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
};

export default App;
