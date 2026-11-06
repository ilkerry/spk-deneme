import { useEffect, useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming, type SharedValue } from 'react-native-reanimated';

const COLORS = ['#FF9A2E', '#22C39A', '#F2546E', '#8C7BFF', '#3FAEF7', '#FFD04D', '#FF6FA5'];
const COUNT = 40;

type Piece = { x: number; drift: number; delay: number; spin: number; size: number; color: string; round: boolean };

function ConfettiPiece({ p, progress, height }: { p: Piece; progress: SharedValue<number>; height: number }) {
  const style = useAnimatedStyle(() => {
    const t = Math.max(0, Math.min(1, (progress.value - p.delay) / (1 - p.delay)));
    return {
      opacity: t <= 0 ? 0 : 1 - Math.max(0, t - 0.8) * 5,
      transform: [
        { translateX: p.x + p.drift * t + Math.sin(t * 10 + p.spin) * 12 },
        { translateY: -30 + t * (height + 60) },
        { rotate: `${p.spin * 360 * t}deg` },
      ],
    };
  });
  return (
    <Animated.View
      style={[
        styles.piece,
        { width: p.size, height: p.round ? p.size : p.size * 0.45, borderRadius: p.round ? p.size : 2, backgroundColor: p.color },
        style,
      ]}
    />
  );
}

/** Ekrana yağan konfeti. `burstKey` her değiştiğinde yeniden patlar. */
export function Confetti({ burstKey }: { burstKey: number }) {
  const { width, height } = useWindowDimensions();
  const progress = useSharedValue(0);

  const pieces = useMemo<Piece[]>(
    () =>
      Array.from({ length: COUNT }, (_, i) => ({
        x: Math.random() * width,
        drift: (Math.random() - 0.5) * 120,
        delay: Math.random() * 0.25,
        spin: 1 + Math.random() * 3,
        size: 8 + Math.random() * 6,
        color: COLORS[i % COLORS.length],
        round: Math.random() < 0.3,
      })),
    // Her patlamada yeni rastgele konumlar
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [burstKey, width],
  );

  useEffect(() => {
    if (!burstKey) return;
    progress.value = 0;
    progress.value = withTiming(1, { duration: 2200, easing: Easing.out(Easing.quad) });
  }, [burstKey, progress]);

  if (!burstKey) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((p, i) => (
        <ConfettiPiece key={`${burstKey}-${i}`} p={p} progress={progress} height={height} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  piece: { position: 'absolute', top: 0, left: 0 },
});
