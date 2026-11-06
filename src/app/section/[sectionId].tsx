import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { AppText, Button, EmojiBubble, Screen, Surface } from '@/components/ui';
import { getLesson, getSection } from '@/data/sample';
import { Spacing, useAppTheme } from '@/theme';

function Counter({ value, label, color, bg }: { value: number; label: string; color: string; bg: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: bg, borderRadius: 16, paddingVertical: Spacing.md, alignItems: 'center' }}>
      <AppText variant="heading" color={color}>
        {value}
      </AppText>
      <AppText variant="caption" color={color}>
        {label}
      </AppText>
    </View>
  );
}

export default function SectionScreen() {
  const { sectionId } = useLocalSearchParams<{ sectionId: string }>();
  const section = getSection(sectionId);
  const { colors } = useAppTheme();

  if (!section) {
    return (
      <Screen withTopInset={false}>
        <AppText>Bölüm bulunamadı.</AppText>
      </Screen>
    );
  }
  const lesson = getLesson(section.lessonId);

  const start = () => router.push({ pathname: '/study/[sectionId]', params: { sectionId: section.id } });

  return (
    <Screen withTopInset={false}>
      <Stack.Screen options={{ title: `Bölüm ${section.order}` }} />

      <View style={{ alignItems: 'center', gap: Spacing.sm }}>
        <EmojiBubble emoji={section.emoji} bg={colors.primarySoft} size={80} />
        <AppText variant="label" muted>
          {lesson?.title} · Bölüm {section.order}
        </AppText>
        <AppText variant="heading" center>
          {section.title}
        </AppText>
      </View>

      <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
        <Counter value={section.cardCount} label="Yeni" color={colors.sky} bg={colors.skySoft} />
        <Counter value={0} label="Tekrar et" color={colors.review} bg={colors.reviewSoft} />
        <Counter value={0} label="Biliyorum" color={colors.known} bg={colors.knownSoft} />
      </View>

      <View style={{ gap: Spacing.md }}>
        <Button
          title={`Tümünü çalış (${section.cardCount})`}
          icon={<Ionicons name="play" size={18} color={colors.textOnPrimary} />}
          onPress={start}
        />
        <Button title="Tekrar edilecekler (0)" tone="review" disabled onPress={start} />
        <Button title="Sadece yeni kartlar" tone="neutral" onPress={start} />
      </View>

      <Surface style={{ gap: Spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
          <AppText variant="bodyBold" style={{ flex: 1 }}>
            ✅ Ezberlediklerim
          </AppText>
          <AppText variant="small" muted>
            0 kart
          </AppText>
        </View>
        <AppText variant="small" muted>
          Burada ezberlediğin kartlar listelenecek. Her kartın yanındaki 🔁 düğmesiyle kartı tekrar destesine
          geri gönderebileceksin.
        </AppText>
      </Surface>
    </Screen>
  );
}
