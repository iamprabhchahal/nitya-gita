import { useColorScheme } from 'react-native';

export interface AppTheme {
  mode: 'light' | 'dark';
  gradient: [string, string, string];
  orbPrimary: string;
  orbSecondary: string;
  orbTertiary: string;
  ink: string;
  inkSecondary: string;
  inkMuted: string;
  accent: string;
  accentSoft: string;
  accentText: string;
  glassTint: string;
  glassTintSubtle: string;
  fallbackSurface: string;
  fallbackSurfaceElevated: string;
  border: string;
  borderStrong: string;
  success: string;
  tabBackground: string;
  tabIndicator: string;
  widgetGradient: [string, string];
}

const DAWN_THEME: AppTheme = {
  mode: 'light',
  gradient: ['#FFF9F0', '#FDE9CE', '#F5D4A8'],
  orbPrimary: 'rgba(245, 166, 72, 0.30)',
  orbSecondary: 'rgba(230, 118, 60, 0.18)',
  orbTertiary: 'rgba(255, 224, 166, 0.48)',
  ink: '#1E160F',
  inkSecondary: '#4B3A2C',
  inkMuted: '#78624F',
  accent: '#C65D14',
  accentSoft: 'rgba(198, 93, 20, 0.14)',
  accentText: '#FFFFFF',
  glassTint: 'rgba(255, 248, 238, 0.28)',
  glassTintSubtle: 'rgba(255, 250, 242, 0.18)',
  fallbackSurface: 'rgba(255, 251, 245, 0.78)',
  fallbackSurfaceElevated: 'rgba(255, 252, 248, 0.90)',
  border: 'rgba(198, 93, 20, 0.16)',
  borderStrong: 'rgba(198, 93, 20, 0.34)',
  success: '#2A7B4C',
  tabBackground: '#FFF6EA',
  tabIndicator: 'rgba(198, 93, 20, 0.14)',
  widgetGradient: ['#FFF6E8', '#F6D7AC'],
};

const DUSK_THEME: AppTheme = {
  mode: 'dark',
  gradient: ['#060916', '#0E1530', '#181A38'],
  orbPrimary: 'rgba(242, 180, 90, 0.20)',
  orbSecondary: 'rgba(84, 104, 214, 0.24)',
  orbTertiary: 'rgba(198, 108, 48, 0.14)',
  ink: '#F8F4EC',
  inkSecondary: '#DCD5CA',
  inkMuted: '#9E98AD',
  accent: '#F2B45A',
  accentSoft: 'rgba(242, 180, 90, 0.18)',
  accentText: '#140E07',
  glassTint: 'rgba(24, 30, 58, 0.38)',
  glassTintSubtle: 'rgba(20, 26, 52, 0.24)',
  fallbackSurface: 'rgba(20, 26, 52, 0.76)',
  fallbackSurfaceElevated: 'rgba(28, 36, 68, 0.88)',
  border: 'rgba(242, 180, 90, 0.20)',
  borderStrong: 'rgba(242, 180, 90, 0.42)',
  success: '#62C98E',
  tabBackground: '#0C1226',
  tabIndicator: 'rgba(242, 180, 90, 0.18)',
  widgetGradient: ['#101836', '#1E1D3B'],
};

export function useAppTheme(): AppTheme {
  const scheme = useColorScheme();
  return scheme === 'dark' ? DUSK_THEME : DAWN_THEME;
}

export function getThemeForScheme(scheme: 'light' | 'dark' | null | undefined): AppTheme {
  return scheme === 'dark' ? DUSK_THEME : DAWN_THEME;
}
