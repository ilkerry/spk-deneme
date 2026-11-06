import { Text, type TextProps, type TextStyle } from 'react-native';

import { Fonts, FontSize, useAppTheme } from '@/theme';

type Variant = 'display' | 'heading' | 'title' | 'body' | 'bodyBold' | 'small' | 'caption' | 'label';

const variants: Record<Variant, TextStyle> = {
  display: { fontFamily: Fonts.black, fontSize: FontSize.display, lineHeight: 40 },
  heading: { fontFamily: Fonts.black, fontSize: FontSize.heading, lineHeight: 32 },
  title: { fontFamily: Fonts.extraBold, fontSize: FontSize.title, lineHeight: 26 },
  body: { fontFamily: Fonts.regular, fontSize: FontSize.body, lineHeight: 23 },
  bodyBold: { fontFamily: Fonts.extraBold, fontSize: FontSize.body, lineHeight: 23 },
  small: { fontFamily: Fonts.bold, fontSize: FontSize.small, lineHeight: 19 },
  caption: { fontFamily: Fonts.bold, fontSize: FontSize.caption, lineHeight: 16 },
  label: {
    fontFamily: Fonts.extraBold,
    fontSize: FontSize.caption,
    lineHeight: 16,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
};

export type AppTextProps = TextProps & {
  variant?: Variant;
  color?: string;
  muted?: boolean;
  center?: boolean;
};

export function AppText({ variant = 'body', color, muted, center, style, ...rest }: AppTextProps) {
  const { colors } = useAppTheme();
  return (
    <Text
      style={[
        variants[variant],
        { color: color ?? (muted ? colors.textMuted : colors.text) },
        center && { textAlign: 'center' },
        style,
      ]}
      {...rest}
    />
  );
}
