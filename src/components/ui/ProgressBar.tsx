import { View } from 'react-native';

import { Radius, useAppTheme } from '@/theme';

type ProgressBarProps = {
  /** 0 ile 1 arası */
  value: number;
  color?: string;
  track?: string;
  height?: number;
};

export function ProgressBar({ value, color, track, height = 12 }: ProgressBarProps) {
  const { colors } = useAppTheme();
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View
      style={{
        height,
        borderRadius: Radius.pill,
        backgroundColor: track ?? colors.surfaceAlt,
        overflow: 'hidden',
      }}>
      <View
        style={{
          width: `${pct * 100}%`,
          height: '100%',
          borderRadius: Radius.pill,
          backgroundColor: color ?? colors.primary,
        }}>
        {/* Parlama şeridi */}
        <View
          style={{
            position: 'absolute',
            top: height * 0.2,
            left: 6,
            right: 6,
            height: Math.max(2, height * 0.22),
            borderRadius: Radius.pill,
            backgroundColor: 'rgba(255,255,255,0.35)',
          }}
        />
      </View>
    </View>
  );
}
