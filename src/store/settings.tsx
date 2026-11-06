import { AppState } from 'react-native';
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { loadJSON, saveJSON, StorageKeys } from '@/lib/storage';

export type StudyMode = 'cloze' | 'read';
export type AutoReview = 'off' | '1' | '3';
export type ThemePreference = 'system' | 'light' | 'dark';

export type Settings = {
  name: string;
  avatar: string;
  studyMode: StudyMode;
  autoReview: AutoReview;
  dailyGoal: number;
  theme: ThemePreference;
};

const defaults: Settings = {
  name: 'Çalışkan',
  avatar: '🐝',
  studyMode: 'cloze',
  autoReview: 'off',
  dailyGoal: 30,
  theme: 'system',
};

type SettingsContextValue = Settings & {
  update: (patch: Partial<Settings>) => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

/** Kullanıcı ayarları — yalnızca cihazda saklanır. */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadJSON(StorageKeys.settings, defaults).then(setSettings);
  }, []);

  useEffect(() => {
    if (!settings) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveJSON(StorageKeys.settings, settings), 300);
  }, [settings]);

  // Uygulama arka plana geçerken bekleyen kaydı hemen yaz (kapanırsa kaybolmasın)
  const latest = useRef(settings);
  latest.current = settings;
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active' && latest.current) {
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveJSON(StorageKeys.settings, latest.current);
      }
    });
    return () => sub.remove();
  }, []);

  const value = useMemo(
    () =>
      settings
        ? { ...settings, update: (patch: Partial<Settings>) => setSettings((s) => ({ ...(s ?? defaults), ...patch })) }
        : null,
    [settings],
  );

  if (!value) return null;
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings, SettingsProvider içinde kullanılmalı');
  return ctx;
}
