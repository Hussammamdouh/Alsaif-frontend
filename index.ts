import { Platform } from 'react-native';

// Capture the token as early as possible on web before any routing changes the URL
if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location && window.sessionStorage) {
  try {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      window.sessionStorage.setItem('pending_magic_token', token);
      console.log('[Entry] Captured pending magic token in sessionStorage:', token);
    }
  } catch (e) {
    console.error('[Entry] Failed to capture magic token:', e);
  }
}

import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
