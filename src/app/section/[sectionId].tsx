import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppText, Button, EmojiBubble, ProgressBar, Screen, Surface } from '@/components/ui';
import { getLesson, getSection } from '@/data/content';
import { haptic } from '@/lib/haptics';
import { isLearned, sectionStats, useProgress, type StudyFilter } from '@/store/progress';
import { Radius, Spacing, useAppTheme } from '@/theme';

function Counter({ value, label, color, bg }: { value: number; label: string; color: string; bg: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: bg, borderRadius: Radius.md, paddingVertical: Spacing.md, alignItems: 'center' }}>
      <AppText variant="heading" color={color}>
        {value}
      </AppText>
      <AppText variant="caption" color={color}>
        {label}
      </AppText>
    </View>
  );
}

const PREVIEW_COUNT = 5;

export default function SectionScreen() {
  const { sectionId } = useLocalSearchParams<{ sectionId: string }>();
  const section = getSection(sectionId);
  const { colors } = useAppTheme();
  const { cards, requeue } = useProgress();
  const [showAll, setShowAll] = useState(false);

  if (!section) {
    return (
      <Screen withTopInset={false}>
        <AppText>Bölüm bulunamadı.</AppText>
      </Screen>
    );
  }
  const lesson = getLesson(section.lessonId);
  const stats = sectionStats(section, cards);
  const learned = section.cards.filter((c) => isLearned(cards[c.id]));
  const visibleLearned = showAll ? learned : learned.slice(0, PREVIEW_COUNT);

  const start = (filter: StudyFilter) =>
    router.push({ pathname: '/study/[sectionId]', params: { sectionId: section.id, filter } });

  return (
    <Screen withTopInset={false}>
      <Stack.Screen options={{ title: `Bölüm ${section.order}` }} />

      <View style={{ alignItems: 'center', gap: Spacing.sm }}>
        <EmojiBubble emoji={section.emoji} bg={colors.primarySoft} size={80} />
        <AppText variant="label" muted>
          {lesson?.title} · Bölüm {section.order}
        </AppText>
        <AppText variant="heading" center>
          {section.title}
        </AppText>
      </View>

      <View style={{ gap: 6 }}>
        <ProgressBar value={stats.known / stats.total} color={colors.known} />
        <AppText variant="caption" muted center>
          {stats.known}/{stats.total} kart ezberlendi
          {stats.known === stats.total ? ' 🎉' : ''}
        </AppText>
      </View>

      <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
        <Counter value={stats.fresh} label="Yeni" color={colors.sky} bg={colors.skySoft} />
        <Counter value={stats.review} label="Tekrar et" color={colors.review} bg={colors.reviewSoft} />
        <Counter value={stats.known} label="Biliyorum" color={colors.known} bg={colors.knownSoft} />
      </View>

      <View style={{ gap: Spacing.md }}>
        <Button
          title={`Tümünü çalış (${stats.total})`}
          icon={<Ionicons name="play" size={18} color={colors.textOnPrimary} />}
          onPress={() => start('all')}
        />
        <Button
          title={`Tekrar edilecekler (${stats.review})`}
          tone="review"
          disabled={stats.review === 0}
          icon={<Ionicons name="refresh" size={18} color="#FFF" />}
          onPress={() => start('review')}
        />
        <Button
          title={`Sadece yeni kartlar (${stats.fresh})`}
          tone="neutral"
          disabled={stats.fresh === 0}
          onPress={() => start('new')}
        />
      </View>

      <Surface style={{ gap: Spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
          <AppText variant="bodyBold" style={{ flex: 1 }}>
            ✅ Ezberlediklerim
          </AppText>
          <AppText variant="small" muted>
            {learned.length} kart
          </AppText>
        </View>

        {learned.length === 0 ? (
          <AppText variant="small" muted>
            Henüz ezberlediğin kart yok. Kartları sağa kaydırdıkça burada listelenecek.
          </AppText>
        ) : (
          <>
            <AppText variant="caption" muted>
              Tekrar çalışmak istediğin kartı 🔁 ile tekrar destesine gönderebilirsin. ⭐ = kalıcı ezber
            </AppText>
            {visibleLearned.map((c) => {
              const p = cards[c.id];
              return (
                <View key={c.id} style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                  <AppText variant="caption" color={colors.known} style={{ width: 34 }}>
                    #{String(c.number).padStart(3, '0')}
                  </AppText>
                  <AppText variant="small" muted style={{ flex: 1 }} numberOfLines={2}>
                    {p?.status === 'mastered' ? '⭐ ' : ''}
                    {c.text.replace(/\*\*/g, '')}
                  </AppText>
                  <Pressable
                    hitSlop={8}
                    accessibilityLabel={`#${c.number} kartını tekrar destesine gönder`}
                    onPress={() => {
                      haptic.light();
                      requeue(c.id);
                    }}
                    style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, backgroundColor: colors.surfaceAlt }}>
                    <AppText variant="caption">🔁</AppText>
                  </Pressable>
                </View>
              );
            })}
            {learned.length > PREVIEW_COUNT && (
              <Pressable onPress={() => setShowAll((v) => !v)} hitSlop={8}>
                <AppText variant="small" color={colors.primaryDeep} center>
                  {showAll ? 'Daha az göster' : `Tümünü göster (${learned.length})`}
                </AppText>
              </Pressable>
            )}
          </>
        )}
      </Surface>
    </Screen>
  );
}
