import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { SlideInUp, SlideOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, EmojiBubble } from '@/components/ui';
import { achievements } from '@/data/achievements';
import { haptic } from '@/lib/haptics';
import { useProgress } from '@/store/progress';
import { Radius, Spacing, useAppTheme, useTint } from '@/theme';

import { Confetti } from './Confetti';

const SHOW_MS = 3200;

/** Yeni rozet açılınca üstten kayan bildirim + konfeti. Kök düzende bir kez yer alır. */
export function AchievementToast() {
  const { unlockQueue, dismissUnlock } = useProgress();
  const [burst, setBurst] = useState(0);
  const current = achievements.find((a) => a.id === unlockQueue[0]);

  useEffect(() => {
    if (!current) return;
    haptic.success();
    setBurst((b) => b + 1);
    const t = setTimeout(dismissUnlock, SHOW_MS);
    return () => clearTimeout(t);
  }, [current, dismissUnlock]);

  return (
    <>
      <Confetti burstKey={burst} />
      {current && <ToastCard key={current.id} id={current.id} onPress={dismissUnlock} />}
    </>
  );
}

function ToastCard({ id, onPress }: { id: string; onPress: () => void }) {
  const a = achievements.find((x) => x.id === id)!;
  const { colors } = useAppTheme();
  const tint = useTint(a.color);
  const insets = useSafeAreaInsets();

  return (
    <Animated.View
      entering={SlideInUp.springify().damping(14)}
      exiting={SlideOutUp.duration(250)}
      style={{ position: 'absolute', top: insets.top + Spacing.sm, left: Spacing.lg, right: Spacing.lg, alignItems: 'center' }}>
      <Pressable
        onPress={() => {
          onPress();
          router.push('/achievements');
        }}
        accessibilityRole="alert"
        accessibilityLabel={`Yeni rozet: ${a.title}`}
        style={{ width: '100%', maxWidth: 480 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: Spacing.md,
            backgroundColor: colors.surface,
            borderRadius: Radius.lg,
            borderWidth: 2,
            borderBottomWidth: 5,
            borderColor: tint.strong,
            padding: Spacing.md,
            shadowColor: '#000',
            shadowOpacity: 0.18,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 6 },
            elevation: 10,
          }}>
          <EmojiBubble emoji={a.emoji} bg={tint.soft} size={52} />
          <View style={{ flex: 1, gap: 2 }}>
            <AppText variant="label" color={tint.strong}>
              Yeni rozet!
            </AppText>
            <AppText variant="bodyBold">{a.title}</AppText>
            <AppText variant="caption" muted>
              {a.description}
            </AppText>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}
