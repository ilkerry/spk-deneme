import { Text } from 'react-native';

import { Fonts, useAppTheme } from '@/theme';

type Segment = { text: string; key: boolean };

/** `**kalın**` işaretli metni parçalara ayırır. Kalın kısımlar = ezberlenecek anahtar bilgi. */
export function parseCardText(raw: string): Segment[] {
  const parts = raw.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((p) =>
    p.startsWith('**') && p.endsWith('**')
      ? // Anahtar ifade satır sonunda bölünmesin diye boşluklar bölünmez boşluğa çevrilir
        { text: p.slice(2, -2).replace(/ /g, ' '), key: true }
      : { text: p, key: false },
  );
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
