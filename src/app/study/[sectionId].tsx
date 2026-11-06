import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RichCardText } from '@/components/RichCardText';
import { AppText, Button, ProgressBar } from '@/components/ui';
import { getSection, previewCards } from '@/data/sample';
import { useSettings } from '@/store/settings';
import { Radius, Spacing, useAppTheme } from '@/theme';

/**
 * Kart çalışma ekranı — 1. aşama ÖNİZLEMESİ.
 * Sürükleyip fırlatma animasyonları 4. aşamada eklenecek; şimdilik butonlarla ilerleniyor.
 */
export default function StudyScreen() {
  const { sectionId } = useLocalSearchParams<{ sectionId: string }>();
  const section = getSection(sectionId);
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { studyMode, update } = useSettings();

  const cards = previewCards;
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const card = cards[index % cards.length];
  const isCloze = studyMode === 'cloze';

  const next = () => {
    setRevealed(false);
    setIndex((i) => i + 1);
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: insets.top + Spacing.sm,
        paddingBottom: insets.bottom + Spacing.lg,
        paddingHorizontal: Spacing.lg + 4,
        gap: Spacing.lg,
      }}>
      {/* Üst çubuk: kapat · ilerleme · mod */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel="Kapat">
          <Ionicons name="close" size={28} color={colors.textMuted} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <ProgressBar value={((index % cards.length) + 1) / cards.length} />
        </View>
        <Pressable
          onPress={() => {
            setRevealed(false);
            update({ studyMode: isCloze ? 'read' : 'cloze' });
          }}
          accessibilityLabel="Çalışma modunu değiştir"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            backgroundColor: colors.surface,
            borderRadius: Radius.pill,
            borderWidth: 2,
            borderColor: colors.border,
            paddingHorizontal: 10,
            paddingVertical: 5,
          }}>
          <AppText variant="caption">{isCloze ? '🧩 Boşluk' : '📖 Okuma'}</AppText>
        </Pressable>
      </View>

      <AppText variant="small" muted center>
        {section?.title}
      </AppText>

      {/* Kart destesi */}
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <View style={{ maxWidth: 480, width: '100%', alignSelf: 'center', flex: 1, maxHeight: 520 }}>
          {/* Arkadaki kartlar (deste görünümü) */}
          <View
            style={{
              position: 'absolute',
              top: 22,
              left: 22,
              right: 22,
              bottom: -22,
              backgroundColor: colors.lilacSoft,
              borderRadius: Radius.xl,
              borderWidth: 2,
              borderColor: colors.border,
            }}
          />
          <View
            style={{
              position: 'absolute',
              top: 11,
              left: 11,
              right: 11,
              bottom: -11,
              backgroundColor: colors.skySoft,
              borderRadius: Radius.xl,
              borderWidth: 2,
              borderColor: colors.border,
            }}
          />

          {/* Ön kart */}
          <Pressable
            style={{ flex: 1 }}
            onPress={() => isCloze && setRevealed((r) => !r)}
            accessibilityHint={isCloze ? 'Cevabı göstermek için dokun' : undefined}>
            <View
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                borderRadius: Radius.xl,
                borderWidth: 2,
                borderBottomWidth: 6,
                borderColor: colors.border,
                padding: Spacing.xl,
                justifyContent: 'space-between',
              }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View
                  style={{
                    backgroundColor: colors.primary,
                    borderRadius: Radius.pill,
                    paddingHorizontal: 12,
                    paddingVertical: 4,
                  }}>
                  <AppText variant="caption" color={colors.textOnPrimary}>
                    #{String(card.number).padStart(3, '0')}
                  </AppText>
                </View>
                <AppText variant="caption" muted>
                  {(index % cards.length) + 1} / {cards.length}
                </AppText>
              </View>

              <RichCardText text={card.text} hideKeys={isCloze && !revealed} />

              <AppText variant="small" muted center>
                {isCloze
                  ? revealed
                    ? 'Şimdi sağa ya da sola kaydır'
                    : '👆 Cevabı görmek için dokun'
                  : 'Okuduysan sağa ya da sola kaydır'}
              </AppText>
            </View>
          </Pressable>
        </View>
      </View>

      {/* Butonlar (4. aşamada kaydırma hareketiyle birlikte çalışacak) */}
      <View style={{ flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.lg }}>
        <Button
          title="Tekrar et"
          tone="review"
          style={{ flex: 1 }}
          icon={<Ionicons name="arrow-back" size={18} color="#FFF" />}
          onPress={next}
        />
        <Button
          title="Biliyorum"
          tone="known"
          style={{ flex: 1 }}
          icon={<Ionicons name="checkmark" size={20} color="#FFF" />}
          onPress={next}
        />
      </View>
    </View>
  );
}
