import { useColorScheme } from 'react-native';

export const COLORS = {
  light: {
    bg: '#F7F9FC',
    card: '#FFFFFF',
    text: '#1A1A1A',
    primary: '#4F46E5',
    secondary: '#818CF8',
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    border: '#E5E7EB',
    muted: '#6B7280',
    accent: '#F3F4F6',
  },
  dark: {
    bg: '#0A0A0A',
    card: '#1C1C1E',
    text: '#F9FAFB',
    primary: '#6366F1',
    secondary: '#818CF8',
    success: '#34D399',
    error: '#F87171',
    warning: '#FBBF24',
    border: '#2D2D2D',
    muted: '#9CA3AF',
    accent: '#262626',
  },
};

export function useAppTheme() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark ? COLORS.dark : COLORS.light;

  return { isDark, colors };
}
