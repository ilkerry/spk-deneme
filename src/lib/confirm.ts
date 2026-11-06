import { Alert, Platform } from 'react-native';

/** Evet/Hayır onayı (web'de tarayıcı penceresi, telefonda yerel uyarı). */
export function confirm(title: string, message: string, confirmText = 'Evet'): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(typeof window !== 'undefined' && window.confirm(`${title}\n\n${message}`));
  }
  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: 'Vazgeç', style: 'cancel', onPress: () => resolve(false) },
      { text: confirmText, style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}
