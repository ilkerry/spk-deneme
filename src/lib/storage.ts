import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Cihaz içi kalıcı depolama (JSON). Hesap/sunucu yok; veriler yalnızca bu cihazda.
 * Okuma/yazma hataları uygulamayı çökertmez, varsayılan değere düşülür.
 */
export async function loadJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

export async function saveJSON(key: string, value: unknown) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Depolama doluysa / erişilemiyorsa sessizce geç; bir sonraki değişiklikte tekrar denenir.
  }
}

export const StorageKeys = {
  settings: 'hapla.settings.v1',
  progress: 'hapla.progress.v1',
  content: 'hapla.content.v1',
} as const;
