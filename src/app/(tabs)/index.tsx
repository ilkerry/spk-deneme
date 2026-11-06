import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { LessonCard } from '@/components/LessonCard';
import { AppText, Button, Chip, EmojiBubble, ProgressBar, Screen, Surface } from '@/components/ui';
import { useContent } from '@/store/content';
import { isDue, isLearned, useDerivedStats, useProgress } from '@/store/progress';
import { useSettings } from '@/store/settings';
import { Spacing, useAppTheme } from '@/theme';

function greeting() {
  const h = new Date().getHours();
  if (h < 6) return 'İyi geceler';
  if (h < 12) return 'Günaydın';
  if (h < 18) return 'İyi günler';
  return 'İyi akşamlar';
}

export default function HomeScreen() {
  const { colors } = useAppTheme();
  const { name, avatar, dailyGoal, autoReview } = useSettings();

  const { lessons } = useContent();
  const { cards, achievements: unlocked } = useProgress();
  const { todayCount, streak, knownTotal, today } = useDerivedStats();

  // Kaldığın yer: ezberlenmemiş kartı olan ilk bölüm
  const nextSection = lessons
    .flatMap((l) => l.sections)
    .find((s) => s.cards.some((c) => !isLearned(cards[c.id])));

  const dueCount =
    autoReview === 'off'
      ? 0
      : lessons.flatMap((l) => l.sections.flatMap((s) => s.cards)).filter((c) => isDue(cards[c.id], today)).length;
  const goalDone = todayCount >= dailyGoal;

  return (
    <Screen withTabBar>
      {/* Üst kısım: selamlama */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
        <View style={{ flex: 1 }}>
          <AppText variant="small" muted>
            {greeting()},
          </AppText>
          <AppText variant="heading">{name} 👋</AppText>
        </View>
        <EmojiBubble emoji={avatar} bg={colors.primary} size={52} />
      </View>

      <View style={{ flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' }}>
        <Chip emoji="🔥" label={`${streak} gün seri`} bg={colors.reviewSoft} fg={colors.review} />
        <Chip emoji="⭐" label={`${knownTotal} ezber`} bg={colors.primarySoft} fg={colors.primaryDeep} />
        <Chip emoji="🏅" label={`${Object.keys(unlocked).length} rozet`} bg={colors.lilacSoft} fg={colors.lilac} />
      </View>

      {/* Günlük hedef */}
      <Surface tint={colors.primary} edge={colors.primaryDeep} style={{ gap: Spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
          <View style={{ flex: 1, gap: 2 }}>
            <AppText variant="label" color={colors.textOnPrimary} style={{ opacity: 0.7 }}>
              Günlük hedef
            </AppText>
            <AppText variant="title" color={colors.textOnPrimary}>
              {todayCount} / {dailyGoal} kart{goalDone ? ' · Tamam!' : ''}
            </AppText>
          </View>
          <AppText style={{ fontSize: 40, lineHeight: 48 }}>{goalDone ? '🏆' : '🎯'}</AppText>
        </View>
        <ProgressBar value={todayCount / dailyGoal} color={colors.textOnPrimary} track="rgba(43,35,80,0.15)" />
        {nextSection ? (
          <View style={{ gap: 6 }}>
            <Button
              title={todayCount > 0 ? 'Kaldığın yerden devam et' : 'Çalışmaya başla'}
              tone="neutral"
              icon={<Ionicons name="play" size={18} color={colors.text} />}
              onPress={() =>
                router.push({ pathname: '/study/[sectionId]', params: { sectionId: nextSection.id, filter: 'unlearned' } })
              }
            />
            <AppText variant="caption" color={colors.textOnPrimary} center style={{ opacity: 0.75 }} numberOfLines={1}>
              Sıradaki: Bölüm {nextSection.order} · {nextSection.title}
            </AppText>
          </View>
        ) : (
          <AppText variant="bodyBold" color={colors.textOnPrimary} center>
            Tüm kartları ezberledin! 🎉
          </AppText>
        )}
      </Surface>

      {/* Bugünün tekrarları */}
      <Pressable
        disabled={dueCount === 0}
        onPress={() => router.push({ pathname: '/study/[sectionId]', params: { sectionId: 'due', filter: 'due' } })}>
        {({ pressed }) => (
          <Surface
            edge={colors.lilac}
            tint={dueCount > 0 ? colors.lilacSoft : undefined}
            style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md, transform: [{ scale: pressed ? 0.98 : 1 }] }}>
            <EmojiBubble emoji="🔁" bg={dueCount > 0 ? colors.surface : colors.lilacSoft} />
            <View style={{ flex: 1, gap: 2 }}>
              <AppText variant="bodyBold">Bugünün tekrarları</AppText>
              <AppText variant="small" muted>
                {autoReview === 'off'
                  ? 'Otomatik tekrar kapalı. Profil’den açabilirsin.'
                  : dueCount > 0
                    ? `${dueCount} kart seni bekliyor`
                    : `Bugün tekrar yok 🎉 (${autoReview} gün sonra tekrar)`}
              </AppText>
            </View>
            {dueCount > 0 && <Ionicons name="chevron-forward" size={22} color={colors.lilac} />}
          </Surface>
        )}
      </Pressable>

      {/* Dersler */}
      <View style={{ gap: Spacing.md }}>
        <AppText variant="title">Dersler</AppText>
        {lessons.map((l) => (
          <LessonCard key={l.id} lesson={l} />
        ))}
      </View>
    </Screen>
  );
}
