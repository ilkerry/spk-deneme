import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Platform, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui';
import { Radius, Spacing, useAppTheme } from '@/theme';

type IconName = keyof typeof Ionicons.glyphMap;

const ICONS: Record<string, { on: IconName; off: IconName; label: string }> = {
  index: { on: 'home', off: 'home-outline', label: 'Ana Sayfa' },
  stats: { on: 'bar-chart', off: 'bar-chart-outline', label: 'İstatistik' },
  achievements: { on: 'trophy', off: 'trophy-outline', label: 'Başarımlar' },
  profile: { on: 'person-circle', off: 'person-circle-outline', label: 'Profil' },
};

/** Ekranın altında yüzen, sarı vurgulu özel sekme çubuğu. */
export function TabBar({ state, navigateToTab }: BottomTabBarProps) {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        paddingBottom: Math.max(insets.bottom, Spacing.md),
        paddingHorizontal: Spacing.lg,
        alignItems: 'center',
      }}>
      <View
        style={{
          flexDirection: 'row',
          width: '100%',
          maxWidth: 520,
          backgroundColor: colors.tabBar,
          borderRadius: Radius.xl,
          borderWidth: 2,
          borderBottomWidth: 5,
          borderColor: colors.border,
          padding: 6,
          shadowColor: isDark ? '#000' : colors.shadow,
          shadowOpacity: isDark ? 0.4 : 0.18,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 6 },
          elevation: 8,
        }}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const meta = ICONS[route.name];
          if (!meta) return null;

          const onPress = () => {
            if (focused) return;
            if (Platform.OS !== 'web') Haptics.selectionAsync();
            navigateToTab(route.key);
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={meta.label}
              style={{ flex: 1 }}>
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 8,
                  borderRadius: Radius.lg,
                  backgroundColor: focused ? colors.primary : 'transparent',
                  gap: 2,
                }}>
                <Ionicons
                  name={focused ? meta.on : meta.off}
                  size={22}
                  color={focused ? colors.textOnPrimary : colors.textMuted}
                />
                <AppText variant="caption" color={focused ? colors.textOnPrimary : colors.textMuted}>
                  {meta.label}
                </AppText>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
