import { ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

// Common color palette for consistent theming
export const colors = {
  light: {
    // Backgrounds
    background: '#f8fafc',
    backgroundSecondary: '#ffffff',
    backgroundTertiary: '#f1f5f9',

    // Text colors
    textPrimary: '#1e293b',
    textSecondary: '#64748b',
    textMuted: '#9ca3af',

    // UI colors
    border: '#e2e8f0',
    borderLight: '#f1f5f9',

    // Accent colors
    primary: '#667eea',
    primaryDark: '#4f46e5',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',

    // Card colors
    cardBackground: '#ffffff',
    cardBorder: '#e2e8f0',

    // Shadow
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
  dark: {
    // Backgrounds
    background: '#0f172a',
    backgroundSecondary: '#1e293b',
    backgroundTertiary: '#334155',

    // Text colors
    textPrimary: '#f1f5f9',
    textSecondary: '#cbd5e1',
    textMuted: '#94a3b8',

    // UI colors
    border: '#475569',
    borderLight: '#64748b',

    // Accent colors
    primary: '#6366f1',
    primaryDark: '#4f46e5',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',

    // Card colors
    cardBackground: '#1e293b',
    cardBorder: '#334155',

    // Shadow
    shadow: 'rgba(0, 0, 0, 0.3)',
  },
};

// Hook to get current theme colors
export function useThemeColors() {
  const { isDark } = useTheme();
  return isDark ? colors.dark : colors.light;
}

// Common styles that work well with both themes
export const commonStyles = {
  shadow: {
    light: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    dark: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },
  },
  card: {
    light: {
      borderRadius: 16,
      backgroundColor: colors.light.cardBackground,
      ...{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      },
    },
    dark: {
      borderRadius: 16,
      backgroundColor: colors.dark.cardBackground,
      borderWidth: 1,
      borderColor: colors.dark.cardBorder,
      ...{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
      },
    },
  },
} as const;

// Helper function to create theme-aware styles
export function createThemedStyles<
  T extends Record<string, ViewStyle | TextStyle | ImageStyle>,
>(lightStyles: T, darkStyles: T) {
  return { light: lightStyles, dark: darkStyles };
}

// Typography scale that works well with both themes
export const typography = {
  h1: { fontSize: 32, fontWeight: 'bold' as const },
  h2: { fontSize: 28, fontWeight: 'bold' as const },
  h3: { fontSize: 24, fontWeight: '600' as const },
  h4: { fontSize: 20, fontWeight: '600' as const },
  h5: { fontSize: 18, fontWeight: '600' as const },
  h6: { fontSize: 16, fontWeight: '600' as const },
  body1: { fontSize: 16, fontWeight: 'normal' as const },
  body2: { fontSize: 14, fontWeight: 'normal' as const },
  caption: { fontSize: 12, fontWeight: 'normal' as const },
  button: { fontSize: 16, fontWeight: '600' as const },
} as const;

// Spacing scale
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;
