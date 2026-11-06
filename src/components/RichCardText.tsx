import { Text } from 'react-native';

import { Fonts, useAppTheme } from '@/theme';

type Segment = { text: string; key: boolean };

const MAX_UNBREAKABLE = 18;

/** `**kalın**` işaretli metni parçalara ayırır. Kalın kısımlar = ezberlenecek anahtar bilgi. */
export function parseCardText(raw: string): Segment[] {
  const parts = raw.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((p) => {
    if (!(p.startsWith('**') && p.endsWith('**'))) return { text: p, key: false };
    const text = p.slice(2, -2);
    // Kısa anahtar ifadeler ("5 yıl") satır sonunda bölünmesin diye bölünmez boşlukla birleştirilir.
    // Uzun ifadeler normal kelime aralarından alt satıra geçer (yoksa kelime ortasından bölünür).
    return { text: text.length <= MAX_UNBREAKABLE ? text.replace(/ /g, '\u00A0') : text, key: true };
  });
}

type RichCardTextProps = {
  text: string;
  /** true: kalın kısımlar boşluk olarak gizlenir (boşluk doldurma modu) */
  hideKeys?: boolean;
  fontSize?: number;
};

export function RichCardText({ text, hideKeys, fontSize = 21 }: RichCardTextProps) {
  const { colors } = useAppTheme();
  const segments = parseCardText(text);

  return (
    <Text style={{ fontFamily: Fonts.bold, fontSize, lineHeight: fontSize * 1.45, color: colors.text }}>
      {segments.map((s, i) => {
        if (!s.key) return <Text key={i}>{s.text}</Text>;
        if (hideKeys) {
          return (
            <Text
              key={i}
              style={{
                color: 'transparent',
                backgroundColor: colors.primarySoft,
                textDecorationLine: 'underline',
                textDecorationColor: colors.primaryDeep,
                textDecorationStyle: 'dashed',
              }}>
              {` ${s.text} `}
            </Text>
          );
        }
        return (
          <Text
            key={i}
            style={{ fontFamily: Fonts.black, color: colors.text, backgroundColor: colors.primarySoft }}>
            {s.text}
          </Text>
        );
      })}
    </Text>
  );
}
