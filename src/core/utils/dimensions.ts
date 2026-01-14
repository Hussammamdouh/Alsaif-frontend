/**
 * Dimension Utilities
 * Responsive sizing helpers for cross-device compatibility
 */

import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Screen dimensions
 */
export const screen = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
} as const;

/**
 * Responsive width based on percentage
 */
export const wp = (percentage: number): number => {
  return (SCREEN_WIDTH * percentage) / 100;
};

/**
 * Responsive height based on percentage
 */
export const hp = (percentage: number): number => {
  return (SCREEN_HEIGHT * percentage) / 100;
};

/**
 * Check if device has a notch/dynamic island
 */
export const hasNotch = (): boolean => {
  return Platform.OS === 'ios' && SCREEN_HEIGHT >= 812;
};
