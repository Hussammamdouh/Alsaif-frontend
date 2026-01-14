/**
 * Color Tokens
 * Centralized color palette for the entire application
 * Extracted from brand guidelines and design system
 */

// Dark Theme Colors
export const darkColors = {
  // Primary Brand Colors
  primary: {
    main: '#438730', // Dark green
    dark: '#2d5a20',
    light: '#5fa948',
    contrast: '#FFFFFF', // Text color on primary background
    gradient: ['#438730', '#5fa948'], // Dark green to light green gradient
  },

  // Background Colors
  background: {
    primary: '#121212', // Clean dark background
    secondary: '#1e1e1e',
    tertiary: '#2a2a2a',
  },

  // Text Colors
  text: {
    primary: '#FFFFFF',
    secondary: '#B3B3B3',
    tertiary: '#808080',
    inverse: '#121212',
  },

  // Accent Colors
  accent: {
    success: '#5fa948',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#6ba854',
  },

  // UI Colors
  ui: {
    border: '#333333',
    divider: '#2a2a2a',
    overlay: 'rgba(0, 0, 0, 0.7)',
    card: '#1e1e1e',
  },

  // Semantic Colors
  semantic: {
    positive: '#5fa948', // Green for gains
    negative: '#EF4444', // Red for losses
  },

  // Extended semantic colors
  success: {
    main: '#5fa948',
    light: '#c3e0bc',
    dark: '#2d5a20',
    contrast: '#FFFFFF',
  },

  error: {
    main: '#EF4444',
    light: '#FEE2E2',
    dark: '#B91C1C',
    contrast: '#FFFFFF',
  },

  warning: {
    main: '#F59E0B',
    light: '#FEF3C7',
    dark: '#92400E',
    contrast: '#000000',
  },

  // Border colors
  border: {
    light: '#404040',
    main: '#333333',
    dark: '#262626',
  },

  // Shadow
  shadow: {
    color: '#000000',
  },

  // Transparent
  transparent: 'transparent',
} as const;

// Light Theme Colors
export const lightColors = {
  // Primary Brand Colors
  primary: {
    main: '#438730', // Dark green
    dark: '#2d5a20',
    light: '#c3e0bc',
    contrast: '#FFFFFF', // Text color on primary background
    gradient: ['#438730', '#5fa948'], // Dark green to light green gradient
  },

  // Background Colors
  background: {
    primary: '#FFFFFF', // Pure white background for light mode
    secondary: '#f5f9f3',
    tertiary: '#e8f3e5',
  },

  // Text Colors
  text: {
    primary: '#1a2e1a',
    secondary: '#4a6a4a',
    tertiary: '#6a8a6a',
    inverse: '#FFFFFF',
  },

  // Accent Colors
  accent: {
    success: '#5fa948',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#6ba854',
  },

  // UI Colors
  ui: {
    border: '#d4e8cf',
    divider: '#e8f3e5',
    overlay: 'rgba(0, 0, 0, 0.5)',
    card: '#f5f9f3',
  },

  // Semantic Colors
  semantic: {
    positive: '#5fa948', // Green for gains
    negative: '#EF4444', // Red for losses
  },

  // Extended semantic colors
  success: {
    main: '#5fa948',
    light: '#c3e0bc',
    dark: '#2d5a20',
    contrast: '#FFFFFF',
  },

  error: {
    main: '#EF4444',
    light: '#FEE2E2',
    dark: '#B91C1C',
    contrast: '#FFFFFF',
  },

  warning: {
    main: '#F59E0B',
    light: '#FEF3C7',
    dark: '#92400E',
    contrast: '#000000',
  },

  // Border colors
  border: {
    light: '#d4e8cf',
    main: '#b8d4a8',
    dark: '#8fb880',
  },

  // Shadow
  shadow: {
    color: '#000000',
  },

  // Transparent
  transparent: 'transparent',
} as const;

export const colors = darkColors;

export type ColorPalette = typeof darkColors;
