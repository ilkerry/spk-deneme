import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { useSettings, type ThemePreference } from '@/store/settings';

import { darkColors, lightColors, type ColorTokens } from './colors';

export type { ThemePreference };

type ThemeContextValue = {
  colors: ColorTokens;
  isDark: boolean;
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Tema; tercih ayarlarda (cihazda) saklanır. SettingsProvider içinde kullanılmalı. */
export function AppThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const { theme: preference, update } = useSettings();

  const isDark = preference === 'system' ? system === 'dark' : preference === 'dark';

  const value = useMemo(
    () => ({
      colors: isDark ? darkColors : lightColors,
      isDark,
      preference,
      setPreference: (theme: ThemePreference) => update({ theme }),
    }),
    [isDark, preference, update],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAppTheme, AppThemeProvider içinde kullanılmalı');
  return ctx;
}
