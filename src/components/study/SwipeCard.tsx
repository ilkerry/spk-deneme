import { useEffect, useImperativeHandle, useState, type Ref } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureDetector, useExclusiveGestures, usePanGesture, useTapGesture } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { RichCardText } from '@/components/RichCardText';
import { AppText } from '@/components/ui';
import type { Card } from '@/data/content';
import { haptic } from '@/lib/haptics';
import type { StudyMode } from '@/store/settings';
import { Radius, Spacing, useAppTheme } from '@/theme';

export type SwipeDirection = 'left' | 'right';

export type SwipeCardHandle = {
  /** Butonla kaydırma: kartı verilen yöne fırlatır */
  fling: (dir: SwipeDirection) => void;
};

type SwipeCardProps = {
  ref?: Ref<SwipeCardHandle>;
  card: Card;
  /** 0 = en üstteki kart, 1-2 = arkadakiler */
  depth: number;
  position: number;
  total: number;
  mode: StudyMode;
  width: number;
  /** Üstteki kartın sürüklenme oranı (-1..1); arkadaki kartlar buna göre öne gelir */
  dragProgress: SharedValue<number>;
  onSwiped: (dir: SwipeDirection) => void;
  /** Geri alınan kart bu yönden desteye geri gelir */
  enterFrom?: SwipeDirection;
};

const SPRING = { damping: 18, stiffness: 180, mass: 0.8 };

export function SwipeCard({
  ref,
  card,
  depth,
  position,
  total,
  mode,
  width,
  dragProgress,
  onSwiped,
  enterFrom,
}: SwipeCardProps) {
  const { colors } = useAppTheme();
  const isTop = depth === 0;
  const isCloze = mode === 'cloze';
  const threshold = width * 0.28;

  const tx = useSharedValue(enterFrom ? (enterFrom === 'right' ? 1 : -1) * width * 1.3 : 0);
  const ty = useSharedValue(0);
  const armed = useSharedValue(0);
  const flip = useSharedValue(0);
  const depthSV = useSharedValue(depth);
  const [revealed, setRevealed] = useState(false);

  // Destedeki yeri değişince (öne gelince) yumuşakça yerine otursun
  useEffect(() => {
    depthSV.value = withSpring(depth, SPRING);
  }, [depth, depthSV]);

  // Geri alınan kart yandan süzülerek gelsin
  useEffect(() => {
    if (enterFrom) tx.value = withSpring(0, SPRING);
  }, [enterFrom, tx]);

  // Mod değişince kartı ön yüzüne çevir
  useEffect(() => {
    setRevealed(false);
  }, [mode]);

  // Karta dokununca 3B dönme animasyonu
  useEffect(() => {
    flip.value = withTiming(revealed ? 1 : 0, { duration: 380 });
  }, [revealed, flip]);

  const toggleReveal = () => {
    haptic.tap();
    setRevealed((r) => !r);
  };

  const flyOut = (dir: SwipeDirection, velocityY = 0) => {
    'worklet';
    const sign = dir === 'right' ? 1 : -1;
    dragProgress.value = withTiming(sign, { duration: 220 });
    ty.value = withTiming(ty.value + velocityY * 0.12, { duration: 260 });
    tx.value = withTiming(sign * width * 1.4, { duration: 260 }, (finished) => {
      if (finished) {
        dragProgress.value = 0;
        scheduleOnRN(onSwiped, dir);
      }
    });
    scheduleOnRN(dir === 'right' ? haptic.success : haptic.warning);
  };

  useImperativeHandle(ref, () => ({ fling: (dir) => flyOut(dir) }));

  const pan = usePanGesture({
    enabled: isTop,
    activeOffsetX: [-8, 8],
    onUpdate: (e) => {
      'worklet';
      tx.value = e.translationX;
      ty.value = e.translationY * 0.35;
      dragProgress.value = Math.max(-1, Math.min(1, e.translationX / threshold));
      const past = Math.abs(e.translationX) > threshold ? 1 : 0;
      if (past !== armed.value) {
        armed.value = past;
        if (past) scheduleOnRN(haptic.light);
      }
    },
    onDeactivate: (e) => {
      'worklet';
      const fast = Math.abs(e.velocityX) > 900;
      if (Math.abs(e.translationX) > threshold || (fast && Math.abs(e.translationX) > 30)) {
        flyOut(e.translationX > 0 ? 'right' : 'left', e.velocityY);
      } else {
        tx.value = withSpring(0, SPRING);
        ty.value = withSpring(0, SPRING);
        dragProgress.value = withSpring(0, SPRING);
      }
      armed.value = 0;
    },
  });

  const tap = useTapGesture({
    enabled: isTop && isCloze,
    onActivate: () => {
      'worklet';
      scheduleOnRN(toggleReveal);
    },
  });

  const gesture = useExclusiveGestures(pan, tap);

  // Kartın konumu: üstteki kart parmağı izler, arkadakiler sürüklendikçe öne yaklaşır
  const containerStyle = useAnimatedStyle(() => {
    const pull = isTop ? 0 : Math.abs(dragProgress.value);
    const d = Math.max(0, depthSV.value - pull);
    return {
      zIndex: 10 - depth,
      transform: [
        { translateX: tx.value },
        { translateY: ty.value + d * 14 },
        { rotate: `${interpolate(tx.value, [-width, 0, width], [-14, 0, 14])}deg` },
        { scale: 1 - d * 0.055 },
      ],
    };
  });

  const knownStamp = useAnimatedStyle(() => ({
    opacity: interpolate(tx.value, [20, threshold], [0, 1], Extrapolation.CLAMP),
  }));
  const reviewStamp = useAnimatedStyle(() => ({
    opacity: interpolate(tx.value, [-threshold, -20], [1, 0], Extrapolation.CLAMP),
  }));

  const frontFace = useAnimatedStyle(() => ({
    transform: [{ perspective: 1200 }, { rotateY: `${flip.value * 180}deg` }],
  }));
  const backFace = useAnimatedStyle(() => ({
    transform: [{ perspective: 1200 }, { rotateY: `${flip.value * 180 - 180}deg` }],
  }));

  const face = (hidden: boolean, back: boolean) => (
    <View style={[styles.face, { backgroundColor: colors.surface, borderColor: back ? colors.primary : colors.border }]}>
      <View style={styles.faceHeader}>
        <View style={[styles.numberPill, { backgroundColor: colors.primary }]}>
          <AppText variant="caption" color={colors.textOnPrimary}>
            #{String(card.number).padStart(3, '0')}
          </AppText>
        </View>
        <AppText variant="caption" muted>
          {position} / {total}
        </AppText>
      </View>

      <RichCardText text={card.text} hideKeys={hidden} />

      <AppText variant="small" muted center>
        {isCloze ? (back ? '← Tekrar et   ·   Biliyorum →' : '👆 Cevabı görmek için dokun') : '← Tekrar et   ·   Biliyorum →'}
      </AppText>
    </View>
  );

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[StyleSheet.absoluteFill, containerStyle]}>
        {isCloze ? (
          <>
            <Animated.View style={[StyleSheet.absoluteFill, styles.backfaceHidden, frontFace]}>
              {face(true, false)}
            </Animated.View>
            <Animated.View
              style={[StyleSheet.absoluteFill, styles.backfaceHidden, backFace]}
              pointerEvents={revealed ? 'auto' : 'none'}>
              {face(false, true)}
            </Animated.View>
          </>
        ) : (
          face(false, false)
        )}

        {/* Kaydırırken beliren damgalar */}
        <Animated.View style={[styles.stamp, styles.stampLeft, { borderColor: colors.known }, knownStamp]}>
          <AppText variant="title" color={colors.known}>
            BİLİYORUM ✓
          </AppText>
        </Animated.View>
        <Animated.View style={[styles.stamp, styles.stampRight, { borderColor: colors.review }, reviewStamp]}>
          <AppText variant="title" color={colors.review}>
            TEKRAR ↺
          </AppText>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  backfaceHidden: { backfaceVisibility: 'hidden' },
  face: {
    flex: 1,
    borderRadius: Radius.xl,
    borderWidth: 2,
    borderBottomWidth: 6,
    padding: Spacing.xl,
    justifyContent: 'space-between',
  },
  faceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  numberPill: { borderRadius: Radius.pill, paddingHorizontal: 12, paddingVertical: 4 },
  stamp: {
    position: 'absolute',
    top: 64,
    borderWidth: 3,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  stampLeft: { left: 20, transform: [{ rotate: '-12deg' }] },
  stampRight: { right: 20, transform: [{ rotate: '12deg' }] },
});
