/**
 * Theme Styling Layer - Placeholder Style Tokens
 * Focuses entirely on structure, spacing, and interaction states.
 * Colors are defined here strictly as tokens (with highly visible, high-quality
 * default fallbacks) so that an external theme engine can easily swap them out.
 */
export const colors = {
  // Brand colors
  primary: '#3E6AE1',          // placeholder: colors.primary
  primaryLight: '#EEF4FF',     // placeholder: colors.primaryLight
  primaryDark: '#2C52B8',      // placeholder: colors.primaryDark

  // Background and canvas
  background: '#F6F7FB',       // placeholder: colors.background
  surface: '#FFFFFF',          // placeholder: colors.surface
  surfaceSecondary: '#EEF1F7', // placeholder: colors.surfaceSecondary
  surfaceTertiary: '#E2E8F0',  // placeholder: colors.surfaceTertiary

  // Typography (hierarchy-based tokens)
  textPrimary: '#171A20',      // placeholder: colors.textPrimary
  textSubdued: '#5C5E62',      // placeholder: colors.textSubdued
  textLight: '#8E8E8E',        // placeholder: colors.textLight
  textOnPrimary: '#FFFFFF',    // placeholder: colors.textOnPrimary

  // Interactive border & lines
  border: '#D8DDE8',           // placeholder: colors.border
  borderFocus: '#3E6AE1',      // placeholder: colors.borderFocus
  
  // Feedback states
  success: '#2FA26B',          // placeholder: colors.success
  successLight: '#E8F5EE',     // placeholder: colors.successLight
  warning: '#E6972F',          // placeholder: colors.warning
  warningLight: '#FDF4E9',     // placeholder: colors.warningLight
  danger: '#EA4335',           // placeholder: colors.danger
  dangerLight: '#FCEBEA',      // placeholder: colors.dangerLight

  // General presets
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  overlay: 'rgba(0,0,0,0.4)',
  shadow: 'rgba(15,23,42,0.06)'
};

export type ThemeColors = typeof colors;
