import { View } from 'react-native';

import { AppText } from './AppText';

type EmojiBubbleProps = {
  emoji: string;
  bg: string;
  size?: number;
};

export function EmojiBubble({ emoji, bg, size = 48 }: EmojiBubbleProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2.6,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <AppText style={{ fontSize: size * 0.5, lineHeight: size * 0.62 }}>{emoji}</AppText>
    </View>
  );
}
