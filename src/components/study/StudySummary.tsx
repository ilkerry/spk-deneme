import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

import { AppText, Button, ProgressBar, Surface } from '@/components/ui';
import type { Card } from '@/data/content';
import { haptic } from '@/lib/haptics';
import { useProgress } from '@/store/progress';
import { Spacing, useAppTheme } from '@/theme';

type StudySummaryProps = {
  known: Card[];
  review: Card[];
  onStudyReview: () => void;
  onRestart: () => void;
  onClose: () => void;
};

function plain(text: string) {
  return text.replace(/\*\*/g, '');
}

function verdict(ratio: number) {
  if (ratio === 1) return { emoji: '🏆', title: 'Kusursuz!', sub: 'Bu destedeki her kartı biliyorsun.' };
  if (ratio >= 0.8) return { emoji: '🎉', title: 'Harika gidiyorsun!', sub: 'Az kaldı, tekrarları da hallet.' };
  if (ratio >= 0.5) return { emoji: '💪', title: 'Güzel ilerleme!', sub: 'Tekrar destesiyle pekiştirelim.' };
  return { emoji: '🌱', title: 'İyi bir başlangıç!', sub: 'Tekrar ettikçe kalıcı olacak.' };
}

export function StudySummary({ known, review, onStudyReview, onRestart, onClose }: StudySummaryProps) {
  const { colors } = useAppTheme();
  const { requeue } = useProgress();
  const [requeued, setRequeued] = useState<Set<string>>(new Set());
  const total = known.length + review.length;
  const ratio = total ? known.length / total : 0;
  const v = verdict(ratio);

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.lg, paddingBottom: Spacing.xl }} showsVerticalScrollIndicator={false}>
      <Animated.View entering={ZoomIn.springify().damping(12)} style={{ alignItems: 'center', gap: Spacing.sm }}>
        <AppText style={{ fontSize: 72, lineHeight: 86 }}>{v.emoji}</AppText>
        <AppText variant="heading" center>
          {v.title}
        </AppText>
        <AppText muted center>
          {v.sub}
        </AppText>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(150)} style={{ flexDirection: 'row', gap: Spacing.md }}>
        <Surface tint={colors.knownSoft} edge={colors.known} style={{ flex: 1, alignItems: 'center', gap: 2 }}>
          <AppText variant="display" color={colors.known}>
            {known.length}
          </AppText>
          <AppText variant="small" color={colors.known}>
            ✓ Biliyorum
          </AppText>
        </Surface>
        <Surface tint={colors.reviewSoft} edge={colors.review} style={{ flex: 1, alignItems: 'center', gap: 2 }}>
          <AppText variant="display" color={colors.review}>
            {review.length}
          </AppText>
          <AppText variant="small" color={colors.review}>
            ↺ Tekrar et
          </AppText>
        </Surface>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(250)} style={{ gap: 6 }}>
        <ProgressBar value={ratio} color={colors.known} track={colors.reviewSoft} />
        <AppText variant="caption" muted center>
          %{Math.round(ratio * 100)} başarı
        </AppText>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(350)} style={{ gap: Spacing.md }}>
        {review.length > 0 && (
          <Button
            title={`Tekrarları çalış (${review.length})`}
            tone="review"
            icon={<Ionicons name="refresh" size={18} color="#FFF" />}
            onPress={onStudyReview}
          />
        )}
        <Button title="Desteyi baştan çalış" tone="neutral" onPress={onRestart} />
        <Button title="Bitir" onPress={onClose} />
      </Animated.View>

      {review.length > 0 && (
        <Animated.View entering={FadeInDown.delay(450)}>
          <Surface style={{ gap: Spacing.md }}>
            <AppText variant="bodyBold">↺ Tekrar edeceğin kartlar</AppText>
            {review.map((c) => (
              <View key={c.id} style={{ flexDirection: 'row', gap: Spacing.sm }}>
                <AppText variant="caption" color={colors.review} style={{ width: 34 }}>
                  #{String(c.number).padStart(3, '0')}
                </AppText>
                <AppText variant="small" muted style={{ flex: 1 }} numberOfLines={2}>
                  {plain(c.text)}
                </AppText>
              </View>
            ))}
          </Surface>
        </Animated.View>
      )}

      {known.length > 0 && (
        <Animated.View entering={FadeInDown.delay(550)}>
          <Surface style={{ gap: Spacing.md }}>
            <View style={{ gap: 2 }}>
              <AppText variant="bodyBold">✓ Bildiğin kartlar</AppText>
              <AppText variant="caption" muted>
                Tekrar çalışmak istediğin kartı 🔁 ile tekrar destesine ekleyebilirsin.
              </AppText>
            </View>
            {known.map((c) => {
              const added = requeued.has(c.id);
              return (
                <View key={c.id} style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                  <AppText variant="caption" color={colors.known} style={{ width: 34 }}>
                    #{String(c.number).padStart(3, '0')}
                  </AppText>
                  <AppText variant="small" muted style={{ flex: 1 }} numberOfLines={2}>
                    {plain(c.text)}
                  </AppText>
                  <Pressable
                    disabled={added}
                    hitSlop={8}
                    accessibilityLabel="Tekrar destesine ekle"
                    onPress={() => {
                      haptic.light();
                      requeue(c.id);
                      setRequeued((r) => new Set(r).add(c.id));
                    }}
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 12,
                      backgroundColor: added ? colors.reviewSoft : colors.surfaceAlt,
                    }}>
                    <AppText variant="caption" color={added ? colors.review : colors.text}>
                      {added ? 'Eklendi' : '🔁'}
                    </AppText>
                  </Pressable>
                </View>
              );
            })}
          </Surface>
        </Animated.View>
      )}
    </ScrollView>
  );
}
