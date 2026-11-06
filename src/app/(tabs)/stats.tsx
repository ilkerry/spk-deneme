import { View } from 'react-native';

import { AppText, EmojiBubble, Screen, Surface } from '@/components/ui';
import { Radius, Spacing, useAppTheme } from '@/theme';

const DAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

function StatTile({ emoji, value, label, bg }: { emoji: string; value: string; label: string; bg: string }) {
  return (
    <Surface style={{ flex: 1, gap: Spacing.sm }}>
      <EmojiBubble emoji={emoji} bg={bg} size={40} />
      <AppText variant="heading">{value}</AppText>
      <AppText variant="caption" muted>
        {label}
      </AppText>
    </Surface>
  );
}

export default function StatsScreen() {
  const { colors } = useAppTheme();
  // 6. aşamada cihazdaki günlük kayıtlardan hesaplanacak
  const week = [0, 0, 0, 0, 0, 0, 0];
  const max = Math.max(10, ...week);
  const todayIdx = (new Date().getDay() + 6) % 7;

  return (
    <Screen withTabBar>
      <AppText variant="heading">İstatistik 📊</AppText>

      <View style={{ flexDirection: 'row', gap: Spacing.md }}>
        <StatTile emoji="🔥" value="0" label="Günlük seri" bg={colors.reviewSoft} />
        <StatTile emoji="⭐" value="0" label="Ezberlenen" bg={colors.primarySoft} />
      </View>
      <View style={{ flexDirection: 'row', gap: Spacing.md }}>
        <StatTile emoji="🃏" value="0" label="Toplam kaydırma" bg={colors.skySoft} />
        <StatTile emoji="🏔️" value="0" label="En uzun seri" bg={colors.lilacSoft} />
      </View>

      <Surface style={{ gap: Spacing.lg }}>
        <AppText variant="bodyBold">Bu hafta</AppText>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 140, gap: Spacing.sm }}>
          {week.map((v, i) => (
            <View key={i} style={{ flex: 1, alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
              <AppText variant="caption" muted>
                {v}
              </AppText>
              <View
                style={{
                  width: '100%',
                  height: `${Math.max(4, (v / max) * 100)}%`,
                  maxHeight: 100,
                  borderRadius: Radius.sm,
                  backgroundColor: i === todayIdx ? colors.primary : colors.surfaceAlt,
                }}
              />
              <AppText variant="caption" color={i === todayIdx ? colors.text : colors.textMuted}>
                {DAYS[i]}
              </AppText>
            </View>
          ))}
        </View>
      </Surface>

      <Surface style={{ gap: Spacing.sm, alignItems: 'center' }}>
        <AppText style={{ fontSize: 40, lineHeight: 50 }}>🌱</AppText>
        <AppText variant="bodyBold" center>
          Henüz veri yok
        </AppText>
        <AppText variant="small" muted center>
          İlk kartlarını kaydırdığında ilerlemen burada görünecek.
        </AppText>
      </Surface>
    </Screen>
  );
}
