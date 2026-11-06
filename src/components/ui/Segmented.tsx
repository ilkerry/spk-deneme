import * as Haptics from 'expo-haptics';
import { Platform, Pressable, View } from 'react-native';

import { Radius, useAppTheme } from '@/theme';

import { AppText } from './AppText';

type Option<T extends string> = { value: T; label: string };

type SegmentedProps<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
};

export function Segmented<T extends string>({ options, value, onChange }: SegmentedProps<T>) {
  const { colors } = useAppTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: colors.surfaceAlt,
        borderRadius: Radius.md,
        padding: 4,
        gap: 4,
      }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            style={{ flex: 1 }}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => {
              if (Platform.OS !== 'web') Haptics.selectionAsync();
              onChange(o.value);
            }}>
            <View
              style={{
                paddingVertical: 9,
                borderRadius: Radius.sm + 2,
                alignItems: 'center',
                backgroundColor: active ? colors.primary : 'transparent',
                borderBottomWidth: active ? 3 : 0,
                borderColor: colors.primaryDeep,
              }}>
              <AppText variant="small" color={active ? colors.textOnPrimary : colors.textMuted}>
                {o.label}
              </AppText>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
