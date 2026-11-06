import { View } from 'react-native';

import { AppText, ProgressBar, Screen, Surface } from '@/components/ui';
import { achievements, type Achievement } from '@/data/achievements';
import { Spacing, useAppTheme, useTint } from '@/theme';

function Badge({ a, unlocked }: { a: Achievement; unlocked: boolean }) {
  const { colors } = useAppTheme();
  const tint = useTint(a.color);
  return (
    <Surface
      edge={unlocked ? tint.strong : colors.border}
      style={{ width: '47.5%', alignItems: 'center', gap: 6, paddingVertical: Spacing.lg }}>
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: unlocked ? tint.soft : colors.surfaceAlt,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <AppText style={{ fontSize: 32, lineHeight: 40, opacity: unlocked ? 1 : 0.35 }}>{a.emoji}</AppText>
        {!unlocked && (
          <View style={{ position: 'absolute', right: -2, bottom: -2 }}>
            <AppText style={{ fontSize: 18, lineHeight: 22 }}>🔒</AppText>
          </View>
        )}
      </View>
      <AppText variant="bodyBold" center>
        {a.title}
      </AppText>
      <AppText variant="caption" muted center>
        {a.description}
      </AppText>
    </Surface>
  );
}

export default function AchievementsScreen() {
  const { colors } = useAppTheme();
  const unlockedIds = new Set<string>(); // 6. aşamada cihazdan
  const unlocked = unlockedIds.size;

  return (
    <Screen withTabBar>
      <AppText variant="heading">Başarımlar 🏆</AppText>

      <Surface tint={colors.primary} edge={colors.primaryDeep} style={{ gap: Spacing.sm }}>
        <AppText variant="title" color={colors.textOnPrimary}>
          {unlocked} / {achievements.length} rozet
        </AppText>
        <ProgressBar
          value={unlocked / achievements.length}
          color={colors.textOnPrimary}
          track="rgba(43,35,80,0.15)"
        />
        <AppText variant="small" color={colors.textOnPrimary} style={{ opacity: 0.75 }}>
          Seri yap, kart ezberle, rozetleri topla!
        </AppText>
      </Surface>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: Spacing.md }}>
        {achievements.map((a) => (
          <Badge key={a.id} a={a} unlocked={unlockedIds.has(a.id)} />
        ))}
      </View>
    </Screen>
  );
}
