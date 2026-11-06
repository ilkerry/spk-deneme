import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { View } from 'react-native';

import { LessonCard } from '@/components/LessonCard';
import { AppText, Button, Chip, EmojiBubble, ProgressBar, Screen, Surface } from '@/components/ui';
import { lessons } from '@/data/sample';
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

  // 5-6. aşamada cihazdaki gerçek veriden gelecek
  const todayCount = 0;
  const streak = 0;
  const knownTotal = 0;

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
        <Chip emoji="🏅" label="0 rozet" bg={colors.lilacSoft} fg={colors.lilac} />
      </View>

      {/* Günlük hedef */}
      <Surface tint={colors.primary} edge={colors.primaryDeep} style={{ gap: Spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
          <View style={{ flex: 1, gap: 2 }}>
            <AppText variant="label" color={colors.textOnPrimary} style={{ opacity: 0.7 }}>
              Günlük hedef
            </AppText>
            <AppText variant="title" color={colors.textOnPrimary}>
              {todayCount} / {dailyGoal} kart
            </AppText>
          </View>
          <AppText style={{ fontSize: 40, lineHeight: 48 }}>🎯</AppText>
        </View>
        <ProgressBar value={todayCount / dailyGoal} color={colors.textOnPrimary} track="rgba(43,35,80,0.15)" />
        <Button
          title="Çalışmaya başla"
          tone="neutral"
          icon={<Ionicons name="play" size={18} color={colors.text} />}
          onPress={() => router.push({ pathname: '/study/[sectionId]', params: { sectionId: 'th-1' } })}
        />
      </Surface>

      {/* Bugünün tekrarları */}
      <Surface edge={colors.lilac} style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
        <EmojiBubble emoji="🔁" bg={colors.lilacSoft} />
        <View style={{ flex: 1, gap: 2 }}>
          <AppText variant="bodyBold">Bugünün tekrarları</AppText>
          <AppText variant="small" muted>
            {autoReview === 'off'
              ? 'Otomatik tekrar kapalı. Profil’den açabilirsin.'
              : 'Bugün tekrar edilecek kart yok 🎉'}
          </AppText>
        </View>
      </Surface>

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
