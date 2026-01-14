/**
 * Theme System
 * Central export for all design tokens
 */

import { colors } from './colors';
import { typography, fontSizes, fontWeights, lineHeights } from './typography';
import { spacing } from './spacing';

export const theme = {
  colors,
  typography,
  fontSizes,
  fontWeights,
  lineHeights,
  spacing,

  // Border Radius
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 24,
    full: 9999,
  },

  // Shadows (for iOS)
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.30,
      shadowRadius: 4.65,
      elevation: 8,
    },
  },
} as const;

export type Theme = typeof theme;
export { colors, typography, spacing };
