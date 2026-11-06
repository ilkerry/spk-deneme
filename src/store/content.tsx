import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AppState } from 'react-native';

import { bundledLessons, getLessons, setLessons, type Lesson } from '@/data/content';
import { fetchRemoteLessons, remoteConfigured } from '@/lib/remoteContent';
import { loadJSON, saveJSON, StorageKeys } from '@/lib/storage';

type ContentContextValue = {
  lessons: Lesson[];
  /** İçerik nereden geldi */
  source: 'bundled' | 'cache' | 'remote';
  /** Son başarılı güncelleme zamanı (ISO) */
  updatedAt?: string;
  refresh: () => Promise<boolean>;
  remoteConfigured: boolean;
};

const ContentContext = createContext<ContentContextValue | null>(null);

type Cache = { lessons: Lesson[] | null; updatedAt?: string };

/** Bir içeriğin kullanılabilir olup olmadığı (en az bir kartı olan ders) */
function usable(ls: Lesson[] | null | undefined): ls is Lesson[] {
  return !!ls && ls.some((l) => l.sections.some((s) => s.cards.length > 0));
}

/**
 * İçerik sağlayıcısı: önce cihazdaki önbelleği yükler, sonra (ayarlıysa) Supabase'den
 * güncel içeriği çekip önbelleğe yazar. Uygulama öne geldiğinde de tazeler.
 */
export function ContentProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ lessons: Lesson[]; source: ContentContextValue['source']; updatedAt?: string } | null>(
    null,
  );

  const apply = (lessons: Lesson[], source: ContentContextValue['source'], updatedAt?: string) => {
    setLessons(lessons);
    setState({ lessons: getLessons(), source, updatedAt });
  };

  const refresh = async () => {
    const remote = await fetchRemoteLessons();
    if (!usable(remote)) return false;
    const updatedAt = new Date().toISOString();
    apply(remote, 'remote', updatedAt);
    saveJSON(StorageKeys.content, { lessons: remote, updatedAt });
    return true;
  };

  useEffect(() => {
    (async () => {
      const cache = await loadJSON<Cache>(StorageKeys.content, { lessons: null });
      if (remoteConfigured && usable(cache.lessons)) apply(cache.lessons, 'cache', cache.updatedAt);
      else apply(bundledLessons, 'bundled');
      refresh();
    })();
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') refresh();
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(() => (state ? { ...state, refresh, remoteConfigured } : null), [state]);
  if (!value) return null;
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

/** Güncel içeriğe abone olur; içerik değişince bileşen yeniden çizilir. */
export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useContent, ContentProvider içinde kullanılmalı');
  return ctx;
}
