import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  TextInput,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollViewInstance,
} from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { RichCardText } from '@/components/RichCardText';
import { AppText, Button, EmojiBubble, Segmented } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { useSettings } from '@/store/settings';
import { Fonts, Radius, Spacing, useAppTheme } from '@/theme';

const AVATARS = ['🐝', '🦊', '🐼', '🦉', '🐯', '🐸', '🦄', '🐙'];
const PAGES = 4;

/** Kendi kendine sağa-sola kayan örnek kart (2. sayfa) */
function SwipeDemo() {
  const { colors } = useAppTheme();
  const t = useSharedValue(0);
  useEffect(() => {
    const ease = Easing.inOut(Easing.cubic);
    t.value = withRepeat(
      withSequence(
        withDelay(500, withTiming(1, { duration: 700, easing: ease })),
        withTiming(0, { duration: 500, easing: ease }),
        withDelay(400, withTiming(-1, { duration: 700, easing: ease })),
        withTiming(0, { duration: 500, easing: ease }),
      ),
      -1,
    );
  }, [t]);
  const card = useAnimatedStyle(() => ({
    transform: [{ translateX: t.value * 70 }, { rotate: `${t.value * 12}deg` }],
  }));
  const known = useAnimatedStyle(() => ({ opacity: interpolate(t.value, [0.2, 0.8], [0, 1], 'clamp') }));
  const review = useAnimatedStyle(() => ({ opacity: interpolate(t.value, [-0.8, -0.2], [1, 0], 'clamp') }));

  return (
    <View style={{ height: 230, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={[
          {
            width: 190,
            height: 220,
            borderRadius: Radius.xl,
            backgroundColor: colors.surface,
            borderWidth: 2,
            borderBottomWidth: 6,
            borderColor: colors.border,
            padding: Spacing.lg,
            justifyContent: 'center',
          },
          card,
        ]}>
        <RichCardText text="Limitedde asgari sermaye **50.000 TL**’dir." fontSize={17} />
        <Animated.View style={[{ position: 'absolute', top: 14, left: 12, transform: [{ rotate: '-12deg' }] }, known]}>
          <AppText variant="small" color={colors.known} style={{ borderWidth: 2, borderColor: colors.known, borderRadius: 8, paddingHorizontal: 6 }}>
            BİLİYORUM ✓
          </AppText>
        </Animated.View>
        <Animated.View style={[{ position: 'absolute', top: 14, right: 12, transform: [{ rotate: '12deg' }] }, review]}>
          <AppText variant="small" color={colors.review} style={{ borderWidth: 2, borderColor: colors.review, borderRadius: 8, paddingHorizontal: 6 }}>
            TEKRAR ↺
          </AppText>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

/** Dokununca açılan boşluk doldurma örneği (3. sayfa) */
function ClozeDemo() {
  const { colors } = useAppTheme();
  const [open, setOpen] = useState(false);
  return (
    <Pressable
      onPress={() => {
        haptic.tap();
        setOpen((o) => !o);
      }}
      accessibilityHint="Cevabı göstermek için dokun"
      style={{
        width: 260,
        alignSelf: 'center',
        minHeight: 200,
        borderRadius: Radius.xl,
        backgroundColor: colors.surface,
        borderWidth: 2,
        borderBottomWidth: 6,
        borderColor: open ? colors.primary : colors.border,
        padding: Spacing.lg,
        justifyContent: 'space-between',
        gap: Spacing.md,
      }}>
      <RichCardText text="AŞ’de nakit itibari bedelin **en az %25’i** tescilden önce ödenir." hideKeys={!open} fontSize={17} />
      <AppText variant="caption" muted center>
        {open ? 'İşte cevap! Tekrar dokun, kapansın.' : '👆 Dene: karta dokun'}
      </AppText>
    </Pressable>
  );
}

export default function OnboardingScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const s = useSettings();
  const [page, setPage] = useState(0);
  const [name, setName] = useState(s.name === 'Çalışkan' ? '' : s.name);
  const scroll = useRef<ScrollViewInstance>(null);
  // Yatay kaydırmada sayfalar dikeyde esnemediği için yükseklik ölçülüp verilir (içerik ortalansın)
  const [pagerHeight, setPagerHeight] = useState(0);

  const go = (i: number) => {
    scroll.current?.scrollTo({ x: i * width, animated: true });
    setPage(i);
  };

  const finish = () => {
    haptic.success();
    s.update({ onboarded: true, name: name.trim() || s.name });
    router.replace('/');
  };

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== page) setPage(i);
  };

  const pageStyle = {
    width,
    height: pagerHeight || undefined,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center' as const,
    gap: Spacing.lg,
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top, paddingBottom: insets.bottom + Spacing.lg }}>
      {/* Geç */}
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: Spacing.xl, height: 44, alignItems: 'center' }}>
        {page < PAGES - 1 && (
          <Pressable onPress={() => go(PAGES - 1)} hitSlop={12} accessibilityRole="button">
            <AppText variant="bodyBold" muted>
              Geç
            </AppText>
          </Pressable>
        )}
      </View>

      <ScrollView
        ref={scroll}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        onScroll={onScroll}
        scrollEventThrottle={64}
        keyboardShouldPersistTaps="handled"
        onLayout={(e) => setPagerHeight(e.nativeEvent.layout.height)}
        style={{ flex: 1 }}>
        {/* 1 — Hoş geldin */}
        <View style={pageStyle}>
          <View style={{ alignItems: 'center' }}>
            <Image
              source={require('@/assets/images/icon.png')}
              style={{ width: 132, height: 132, borderRadius: 32 }}
              accessibilityLabel="LisansQuiz simgesi"
            />
          </View>
          <AppText variant="display" center>
            LisansQuiz’e hoş geldin!
          </AppText>
          <AppText center muted style={{ fontSize: 17, lineHeight: 25 }}>
            SPK lisans sınavlarının ezber gerektiren hap bilgilerini kartlarla, oyun gibi çalış.
          </AppText>
        </View>

        {/* 2 — Kaydır */}
        <View style={pageStyle}>
          <SwipeDemo />
          <AppText variant="heading" center>
            Kaydır, öğren
          </AppText>
          <View style={{ gap: Spacing.sm, alignSelf: 'center' }}>
            <AppText variant="bodyBold" color={colors.known}>
              → Sağa kaydır: Biliyorum
            </AppText>
            <AppText variant="bodyBold" color={colors.review}>
              ← Sola kaydır: Tekrar et
            </AppText>
          </View>
          <AppText center muted>
            Tekrar dediğin kartlar ayrı bir destede toplanır, istediğin zaman çalışırsın.
          </AppText>
        </View>

        {/* 3 — Dokun */}
        <View style={pageStyle}>
          <ClozeDemo />
          <AppText variant="heading" center>
            Önce tahmin et
          </AppText>
          <AppText center muted>
            Boşluk doldurma modunda anahtar bilgi gizlidir. Aklından söyle, sonra dokunup kontrol et. İstersen düz okuma
            moduna da geçebilirsin.
          </AppText>
        </View>

        {/* 4 — Seni tanıyalım */}
        <View style={pageStyle}>
          <View style={{ alignItems: 'center' }}>
            <EmojiBubble emoji={s.avatar} bg={colors.primary} size={96} />
          </View>
          <AppText variant="heading" center>
            Seni tanıyalım
          </AppText>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Adın (isteğe bağlı)"
            placeholderTextColor={colors.textMuted}
            maxLength={20}
            returnKeyType="done"
            style={{
              fontFamily: Fonts.extraBold,
              fontSize: 20,
              color: colors.text,
              textAlign: 'center',
              backgroundColor: colors.surface,
              borderWidth: 2,
              borderColor: colors.border,
              borderRadius: Radius.md,
              paddingVertical: 12,
            }}
          />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: Spacing.sm }}>
            {AVATARS.map((a) => (
              <Pressable
                key={a}
                onPress={() => {
                  haptic.tap();
                  s.update({ avatar: a });
                }}
                accessibilityLabel={`Avatar ${a}`}
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: Radius.md,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: a === s.avatar ? colors.primarySoft : 'transparent',
                  borderWidth: 2,
                  borderColor: a === s.avatar ? colors.primaryDeep : colors.border,
                }}>
                <AppText style={{ fontSize: 22, lineHeight: 28 }}>{a}</AppText>
              </Pressable>
            ))}
          </View>
          <View style={{ gap: Spacing.sm }}>
            <AppText variant="small" muted center>
              Günde kaç kart çalışmak istersin?
            </AppText>
            <Segmented<string>
              value={String(s.dailyGoal)}
              onChange={(v) => s.update({ dailyGoal: Number(v) })}
              options={[
                { value: '10', label: '10' },
                { value: '20', label: '20' },
                { value: '30', label: '30' },
                { value: '50', label: '50' },
              ]}
            />
          </View>
          <AppText variant="caption" muted center>
            🔒 Hesap gerekmez. Bilgilerin yalnızca bu cihazda kalır.
          </AppText>
        </View>
      </ScrollView>

      {/* Alt kısım: sayfa noktaları + düğme */}
      <View style={{ paddingHorizontal: Spacing.xl, gap: Spacing.lg }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
          {Array.from({ length: PAGES }, (_, i) => (
            <Pressable key={i} onPress={() => go(i)} hitSlop={6} accessibilityLabel={`${i + 1}. sayfa`}>
              <View
                style={{
                  width: i === page ? 26 : 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: i === page ? colors.primary : colors.border,
                }}
              />
            </Pressable>
          ))}
        </View>
        {page < PAGES - 1 ? (
          <Button title="İleri" onPress={() => go(page + 1)} />
        ) : (
          <Button title="Başlayalım! 🚀" onPress={finish} />
        )}
      </View>
    </View>
  );
}
