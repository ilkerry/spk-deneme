import { View, type ViewProps } from 'react-native';

import { Radius, Spacing, useAppTheme } from '@/theme';

type SurfaceProps = ViewProps & {
  /** Arka plan rengi; verilmezse kart (surface) rengi */
  tint?: string;
  /** Alt kenar "kalın gölge" rengi — oyunsu, basılabilir görünüm */
  edge?: string;
  padded?: boolean;
};

/** Yuvarlak köşeli, altında kalın bir kenar olan kart kutusu. */
export function Surface({ tint, edge, padded = true, style, ...rest }: SurfaceProps) {
  const { colors } = useAppTheme();
  return (
    <View
      style={[
        {
          backgroundColor: tint ?? colors.surface,
          borderRadius: Radius.lg,
          borderWidth: 2,
          borderColor: edge ?? colors.border,
          borderBottomWidth: 5,
          padding: padded ? Spacing.lg : 0,
        },
        style,
      ]}
      {...rest}
    />
  );
}
