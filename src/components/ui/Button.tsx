import * as Haptics from 'expo-haptics';
import { Platform, Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import { Radius, Spacing, useAppTheme } from '@/theme';

import { AppText } from './AppText';

type Tone = 'primary' | 'known' | 'review' | 'neutral';

type ButtonProps = {
  title: string;
  onPress?: () => void;
  tone?: Tone;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
};

/** Basınca aşağı çöken, kalın kenarlı oyunsu buton. */
export function Button({ title, onPress, tone = 'primary', icon, style, disabled }: ButtonProps) {
  const { colors } = useAppTheme();

  const tones: Record<Tone, { bg: string; edge: string; fg: string }> = {
    primary: { bg: colors.primary, edge: colors.primaryDeep, fg: colors.textOnPrimary },
    known: { bg: colors.known, edge: '#159A78', fg: '#FFFFFF' },
    review: { bg: colors.review, edge: '#C93A55', fg: '#FFFFFF' },
    neutral: { bg: colors.surface, edge: colors.border, fg: colors.text },
  };
  const t = tones[tone];

  return (
    <Pressable
      disabled={disabled}
      onPress={() => {
        if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.();
      }}
      style={style}>
      {({ pressed }) => (
        <View
          style={{
            backgroundColor: t.bg,
            borderRadius: Radius.md,
            borderBottomWidth: pressed ? 1 : 5,
            borderColor: t.edge,
            marginTop: pressed ? 4 : 0,
            paddingVertical: Spacing.md + 2,
            paddingHorizontal: Spacing.xl,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: Spacing.sm,
            opacity: disabled ? 0.5 : 1,
          }}>
          {icon}
          <AppText variant="bodyBold" color={t.fg}>
            {title}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}
