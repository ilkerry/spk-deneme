import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/** Titreşim yardımcıları — web'de sessizce hiçbir şey yapmaz. */
const enabled = Platform.OS !== 'web';

export const haptic = {
  tap: () => enabled && Haptics.selectionAsync(),
  light: () => enabled && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  medium: () => enabled && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  success: () => enabled && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  warning: () => enabled && Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
};
