import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { SwipeCardHandle, SwipeDirection } from '@/components/study/SwipeCard';
import { StudySummary } from '@/components/study/StudySummary';
import { SwipeDeck } from '@/components/study/SwipeDeck';
import { AppText, Button, ProgressBar } from '@/components/ui';
import { getSection, type Card } from '@/data/content';
import { haptic } from '@/lib/haptics';
import { useSettings } from '@/store/settings';
import { Radius, Spacing, useAppTheme } from '@/theme';

type Result = { card: Card; dir: SwipeDirection };

/**
 * Kart çalışma ekranı.
 * Sağa kaydır = Biliyorum, sola kaydır = Tekrar et. Deste bitince özet gösterilir.
 * Not: Sonuçlar şimdilik yalnızca bu oturumda tutuluyor; 5. aşamada cihaza kaydedilecek.
 */
export default function StudyScreen() {
  const { sectionId } = useLocalSearchParams<{ sectionId: string }>();
  const section = getSection(sectionId);
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { studyMode, update } = useSettings();

  const [round, setRound] = useState<Card[]>(() => section?.cards ?? []);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<Result[]>([]);
  const [enterFrom, setEnterFrom] = useState<SwipeDirection | undefined>();
  const deckRef = useRef<SwipeCardHandle | null>(null);
  const busy = useRef(false);

  const cardWidth = Math.min(width - 40, 480);
  const isCloze = studyMode === 'cloze';
  const finished = index >= round.length;

  const known = useMemo(() => results.filter((r) => r.dir === 'right').map((r) => r.card), [results]);
  const review = useMemo(() => results.filter((r) => r.dir === 'left').map((r) => r.card), [results]);

  if (!section || round.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background, gap: Spacing.lg }}>
        <AppText variant="title">Bu bölümde kart yok</AppText>
        <Button title="Geri dön" onPress={() => router.back()} />
      </View>
    );
  }

  const handleSwiped = (card: Card, dir: SwipeDirection) => {
    busy.current = false;
    setEnterFrom(undefined);
    setResults((r) => [...r, { card, dir }]);
    setIndex((i) => i + 1);
  };

  const fling = (dir: SwipeDirection) => {
    if (busy.current || finished) return;
    busy.current = true;
    deckRef.current?.fling(dir);
  };

  const undo = () => {
    const last = results[results.length - 1];
    if (!last || busy.current) return;
    haptic.light();
    setResults((r) => r.slice(0, -1));
    setEnterFrom(last.dir);
    setIndex((i) => i - 1);
  };

  const startRound = (cards: Card[]) => {
    setRound(cards);
    setResults([]);
    setEnterFrom(undefined);
    setIndex(0);
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: insets.top + Spacing.sm,
        paddingBottom: insets.bottom + Spacing.lg,
        paddingHorizontal: Spacing.lg + 4,
        gap: Spacing.md,
      }}>
      {/* Üst çubuk: kapat · ilerleme · mod */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel="Kapat">
          <Ionicons name="close" size={28} color={colors.textMuted} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <ProgressBar value={index / round.length} />
        </View>
        <Pressable
          onPress={() => {
            haptic.tap();
            update({ studyMode: isCloze ? 'read' : 'cloze' });
          }}
          accessibilityLabel="Çalışma modunu değiştir"
          style={{
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

      {/* Bölüm adı ve anlık sayaçlar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <AppText variant="small" muted numberOfLines={1} style={{ flex: 1 }}>
          {section.title}
        </AppText>
        <View style={{ flexDirection: 'row', gap: Spacing.md }}>
          <AppText variant="small" color={colors.review}>
            ↺ {review.length}
          </AppText>
          <AppText variant="small" color={colors.known}>
            ✓ {known.length}
          </AppText>
        </View>
      </View>

      {finished ? (
        <StudySummary
          known={known}
          review={review}
          onStudyReview={() => startRound(review)}
          onRestart={() => startRound(section.cards)}
          onClose={() => router.back()}
        />
      ) : (
        <>
          <View style={{ flex: 1, width: cardWidth, alignSelf: 'center', marginTop: Spacing.sm, marginBottom: Spacing.xl }}>
            <SwipeDeck
              cards={round}
              index={index}
              mode={studyMode}
              width={cardWidth}
              enterFrom={enterFrom}
              deckRef={deckRef}
              onSwiped={handleSwiped}
            />
          </View>

          {/* Alt butonlar */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
            <Button
              title="Tekrar et"
              tone="review"
              compact
              style={{ flex: 1 }}
              icon={<Ionicons name="arrow-back" size={18} color="#FFF" />}
              onPress={() => fling('left')}
            />
            <Pressable
              onPress={undo}
              disabled={results.length === 0}
              accessibilityLabel="Geri al"
              hitSlop={8}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.surface,
                borderWidth: 2,
                borderColor: colors.border,
                opacity: results.length === 0 ? 0.4 : 1,
              }}>
              <Ionicons name="arrow-undo" size={20} color={colors.textMuted} />
            </Pressable>
            <Button
              title="Biliyorum"
              tone="known"
              compact
              style={{ flex: 1 }}
              icon={<Ionicons name="checkmark" size={20} color="#FFF" />}
              onPress={() => fling('right')}
            />
          </View>
        </>
      )}
    </View>
  );
}
