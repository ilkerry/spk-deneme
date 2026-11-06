import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type StudyMode = 'cloze' | 'read';
export type AutoReview = 'off' | '1' | '3';

export type Settings = {
  name: string;
  avatar: string;
  studyMode: StudyMode;
  autoReview: AutoReview;
  dailyGoal: number;
};

const defaults: Settings = {
  name: 'Çalışkan',
  avatar: '🐝',
  studyMode: 'cloze',
  autoReview: 'off',
  dailyGoal: 30,
};

type SettingsContextValue = Settings & {
  update: (patch: Partial<Settings>) => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

/**
 * Kullanıcı ayarları.
 * Not: 1. aşamada yalnızca bellekte tutuluyor; 5-6. aşamada cihaza (SQLite) kaydedilecek.
 */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaults);
  const value = useMemo(
    () => ({ ...settings, update: (patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch })) }),
    [settings],
  );
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings, SettingsProvider içinde kullanılmalı');
  return ctx;
}
