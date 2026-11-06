import type { ReactNode } from 'react';
import { ScrollView, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Spacing, useAppTheme } from '@/theme';

type ScreenProps = {
  children: ReactNode;
  /** Sekme çubuğunun altında kalmaması için ekstra alt boşluk */
  withTabBar?: boolean;
  /** Üstte güvenli alan boşluğu (başlıksız ekranlar için) */
  withTopInset?: boolean;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
};

export const TAB_BAR_SPACE = 96;

export function Screen({ children, withTabBar, withTopInset = true, scroll = true, contentStyle }: ScreenProps) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  const padding: ViewStyle = {
    paddingTop: (withTopInset ? insets.top : 0) + Spacing.lg,
    paddingBottom: (withTabBar ? TAB_BAR_SPACE + insets.bottom : insets.bottom) + Spacing.xl,
    paddingHorizontal: Spacing.lg + 4,
    gap: Spacing.lg,
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
  };

  if (!scroll) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={[{ flex: 1 }, padding, contentStyle]}>{children}</View>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[padding, contentStyle]}
      showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  );
}
