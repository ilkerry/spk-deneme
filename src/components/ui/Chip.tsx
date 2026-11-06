import { View } from 'react-native';

import { Radius, Spacing } from '@/theme';

import { AppText } from './AppText';

type ChipProps = {
  label: string;
  emoji?: string;
  bg: string;
  fg: string;
};

export function Chip({ label, emoji, bg, fg }: ChipProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: bg,
        borderRadius: Radius.pill,
        paddingHorizontal: Spacing.md,
        paddingVertical: 6,
        alignSelf: 'flex-start',
      }}>
      {emoji ? <AppText variant="small">{emoji}</AppText> : null}
      <AppText variant="small" color={fg}>
        {label}
      </AppText>
    </View>
  );
}
