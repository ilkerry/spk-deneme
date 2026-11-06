import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { AppText, EmojiBubble, ProgressBar, Screen, Surface } from '@/components/ui';
import { lessonCardCount } from '@/data/content';
import { useContent } from '@/store/content';
import { addDays, dayKey, longestStreak } from '@/lib/dates';
import { sectionStats, useDerivedStats, useProgress, type DayLog } from '@/store/progress';
import { useSettings } from '@/store/settings';
import { Radius, Spacing, useAppTheme } from '@/theme';

const SHORT_DAYS = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

function parseDay(key: string) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function longDate(key: string) {
  return parseDay(key).toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' });
}

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

function dayDetail(key: string, log?: DayLog) {
  if (!log || log.swipes === 0) return `${longDate(key)}: çalışma yok`;
  return `${longDate(key)}: ${log.swipes} kart · ✓ ${log.known} biliyorum · ↺ ${log.review} tekrar`;
}

/** Son 7 gün, tek seri çubuk grafik + günlük hedef çizgisi. Çubuğa dokununca gün ayrıntısı. */
function WeekChart({ days, today, goal }: { days: Record<string, DayLog>; today: string; goal: number }) {
  const { colors } = useAppTheme();
  const keys = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));
  const values = keys.map((k) => days[k]?.swipes ?? 0);
  const max = Math.max(goal, ...values) * 1.15;
  const [selected, setSelected] = useState(today);
  const PLOT = 140;

  return (
    <Surface style={{ gap: Spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <AppText variant="bodyBold">Son 7 gün · kaydırılan kart</AppText>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 16, borderTopWidth: 1.5, borderStyle: 'dashed', borderColor: colors.textMuted }} />
          <AppText variant="caption" muted>
            günlük hedef ({goal})
          </AppText>
        </View>
      </View>

      <View style={{ height: PLOT + 20 }}>
        {/* Günlük hedef çizgisi */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 20 + PLOT - (goal / max) * PLOT,
            borderTopWidth: 1.5,
            borderStyle: 'dashed',
            borderColor: colors.textMuted,
            opacity: 0.6,
          }}
        />

        <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: PLOT + 20, gap: 6 }}>
          {keys.map((k, i) => {
            const v = values[i];
            const isSel = k === selected;
            return (
              <Pressable
                key={k}
                onPress={() => setSelected(k)}
                accessibilityLabel={dayDetail(k, days[k])}
                style={{ flex: 1, height: '100%', justifyContent: 'flex-end', alignItems: 'center' }}>
                {v > 0 && (
                  <AppText variant="caption" color={isSel ? colors.text : colors.textMuted}>
                    {v}
                  </AppText>
                )}
                <View
                  style={{
                    width: '72%',
                    height: v > 0 ? Math.max(4, (v / max) * PLOT) : 3,
                    borderTopLeftRadius: 4,
                    borderTopRightRadius: 4,
                    backgroundColor: v > 0 ? (isSel ? colors.primaryDeep : colors.primary) : colors.border,
                  }}
                />
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 6 }}>
        {keys.map((k) => (
          <AppText
            key={k}
            variant="caption"
            center
            color={k === selected ? colors.text : colors.textMuted}
            style={{ flex: 1 }}>
            {k === today ? 'Bugün' : SHORT_DAYS[parseDay(k).getDay()]}
          </AppText>
        ))}
      </View>

      <View style={{ backgroundColor: colors.surfaceAlt, borderRadius: Radius.sm, padding: Spacing.sm }}>
        <AppText variant="small" center>
          {dayDetail(selected, days[selected])}
        </AppText>
      </View>
    </Surface>
  );
}

/** Son 5 hafta aktivite takvimi — tek renk (turuncu) açıktan koyuya. */
function ActivityCalendar({ days, today, goal }: { days: Record<string, DayLog>; today: string; goal: number }) {
  const { colors, isDark } = useAppTheme();
  const empty = isDark ? '#2D2652' : '#F1EBE4';
  // Tek tonlu (turuncu) sıralı ölçek — renk körlüğü / kontrast doğrulamasından geçti
  const ramp = isDark ? ['#8A4A1C', '#B8621E', '#E07B22', '#FFA552'] : ['#F7A04F', '#E7801E', '#BF5F0A', '#863F03'];
  const level = (n: number) => (n <= 0 ? -1 : n < goal * 0.25 ? 0 : n < goal * 0.5 ? 1 : n < goal ? 2 : 3);

  // Pazartesi başlayan 5 haftalık ızgara, son sütun bu hafta
  const mondayOffset = (parseDay(today).getDay() + 6) % 7;
  const start = addDays(today, -mondayOffset - 28);
  const weeks = Array.from({ length: 5 }, (_, w) => Array.from({ length: 7 }, (_, d) => addDays(start, w * 7 + d)));
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <Surface style={{ gap: Spacing.md }}>
      <AppText variant="bodyBold">Son 5 hafta</AppText>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        <View style={{ gap: 6, justifyContent: 'space-around' }}>
          {['Pzt', '', 'Çar', '', 'Cum', '', 'Paz'].map((l, i) => (
            <AppText key={i} variant="caption" muted style={{ height: 22, lineHeight: 22, width: 28 }}>
              {l}
            </AppText>
          ))}
        </View>
        {weeks.map((week, w) => (
          <View key={w} style={{ flex: 1, gap: 6 }}>
            {week.map((k) => {
              const future = k > today;
              const n = days[k]?.swipes ?? 0;
              const lv = level(n);
              return (
                <Pressable
                  key={k}
                  disabled={future}
                  onPress={() => setSelected(k)}
                  accessibilityLabel={dayDetail(k, days[k])}
                  style={{
                    height: 22,
                    borderRadius: 5,
                    backgroundColor: future ? 'transparent' : lv < 0 ? empty : ramp[lv],
                    borderWidth: k === selected || k === today ? 2 : 0,
                    borderColor: colors.text,
                  }}
                />
              );
            })}
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
        <AppText variant="caption" muted>
          Az
        </AppText>
        {[empty, ...ramp].map((c) => (
          <View key={c} style={{ width: 14, height: 14, borderRadius: 3, backgroundColor: c }} />
        ))}
        <AppText variant="caption" muted>
          Hedef+
        </AppText>
      </View>
      {selected && (
        <AppText variant="small" center>
          {dayDetail(selected, days[selected])}
        </AppText>
      )}
    </Surface>
  );
}

export default function StatsScreen() {
  const { colors } = useAppTheme();
  const { lessons } = useContent();
  const { cards, days } = useProgress();
  const { dailyGoal } = useSettings();
  const { streak, knownTotal, masteredTotal } = useDerivedStats();
  const today = dayKey();

  const { totalSwipes, accuracy, best } = useMemo(() => {
    const logs = Object.values(days);
    const total = logs.reduce((s, d) => s + d.swipes, 0);
    const known = logs.reduce((s, d) => s + d.known, 0);
    const active = new Set(Object.keys(days).filter((k) => days[k].swipes > 0));
    return { totalSwipes: total, accuracy: total ? Math.round((known / total) * 100) : 0, best: longestStreak(active) };
  }, [days]);

  return (
    <Screen withTabBar>
      <AppText variant="heading">İstatistik 📊</AppText>

      <View style={{ flexDirection: 'row', gap: Spacing.md }}>
        <StatTile emoji="🔥" value={String(streak)} label="Günlük seri" bg={colors.reviewSoft} />
        <StatTile emoji="🏔️" value={String(best)} label="En uzun seri" bg={colors.lilacSoft} />
      </View>
      <View style={{ flexDirection: 'row', gap: Spacing.md }}>
        <StatTile emoji="⭐" value={String(knownTotal)} label="Ezberlenen kart" bg={colors.primarySoft} />
        <StatTile emoji="💎" value={String(masteredTotal)} label="Kalıcı ezber" bg={colors.skySoft} />
      </View>
      <View style={{ flexDirection: 'row', gap: Spacing.md }}>
        <StatTile emoji="🃏" value={String(totalSwipes)} label="Toplam kaydırma" bg={colors.pinkSoft} />
        <StatTile emoji="🎯" value={`%${accuracy}`} label="“Biliyorum” oranı" bg={colors.knownSoft} />
      </View>

      <WeekChart days={days} today={today} goal={dailyGoal} />
      <ActivityCalendar days={days} today={today} goal={dailyGoal} />

      <Surface style={{ gap: Spacing.lg }}>
        <AppText variant="bodyBold">Derslere göre</AppText>
        {lessons
          .filter((l) => !l.comingSoon && lessonCardCount(l) > 0)
          .map((l) => {
            const total = lessonCardCount(l);
            const agg = l.sections.reduce(
              (a, s) => {
                const st = sectionStats(s, cards);
                return { known: a.known + st.known, review: a.review + st.review, fresh: a.fresh + st.fresh };
              },
              { known: 0, review: 0, fresh: 0 },
            );
            return (
              <View key={l.id} style={{ gap: 6 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <AppText variant="small">
                    {l.emoji} {l.title}
                  </AppText>
                  <AppText variant="small">%{Math.round((agg.known / total) * 100)}</AppText>
                </View>
                <ProgressBar value={agg.known / total} color={colors.known} height={10} />
                <AppText variant="caption" muted>
                  ✓ {agg.known} biliyorum · ↺ {agg.review} tekrar · {agg.fresh} yeni
                </AppText>
              </View>
            );
          })}
      </Surface>
    </Screen>
  );
}
