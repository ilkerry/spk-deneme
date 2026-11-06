import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Pressable, View } from 'react-native';

import { AppText, EmojiBubble, ProgressBar, Screen, Surface } from '@/components/ui';
import { getLesson, getSections, lessonCardCount } from '@/data/sample';
import { Radius, Spacing, useAppTheme, useTint } from '@/theme';

export default function LessonScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const lesson = getLesson(lessonId);
  const { colors } = useAppTheme();
  const tint = useTint(lesson?.color ?? 'primary');

  if (!lesson) {
    return (
      <Screen withTopInset={false}>
        <AppText>Ders bulunamadı.</AppText>
      </Screen>
    );
  }

  const sections = getSections(lesson.id);
  const total = lessonCardCount(lesson.id);

  return (
    <Screen withTopInset={false}>
      <Stack.Screen options={{ title: lesson.title }} />

      {/* Ders başlığı */}
      <Surface tint={tint.soft} edge={tint.strong} style={{ alignItems: 'center', gap: Spacing.sm }}>
        <EmojiBubble emoji={lesson.emoji} bg={colors.surface} size={72} />
        <AppText variant="label" muted>
          Ders {lesson.code}
        </AppText>
        <AppText variant="heading" center>
          {lesson.title}
        </AppText>
        <AppText variant="small" muted>
          {sections.length} bölüm · {total} kart
        </AppText>
        <View style={{ alignSelf: 'stretch', marginTop: Spacing.sm }}>
          <ProgressBar value={0} color={tint.strong} track={colors.surface} />
        </View>
      </Surface>

      <AppText variant="title">Bölümler</AppText>

      {sections.map((s) => (
        <Pressable
          key={s.id}
          onPress={() => router.push({ pathname: '/section/[sectionId]', params: { sectionId: s.id } })}>
          {({ pressed }) => (
            <Surface style={{ gap: Spacing.md, transform: [{ scale: pressed ? 0.98 : 1 }] }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
                <View>
                  <EmojiBubble emoji={s.emoji} bg={tint.soft} size={46} />
                  <View
                    style={{
                      position: 'absolute',
                      right: -6,
                      bottom: -6,
                      backgroundColor: tint.strong,
                      borderRadius: Radius.pill,
                      minWidth: 22,
                      height: 22,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 2,
                      borderColor: colors.surface,
                    }}>
                    <AppText variant="caption" color="#FFF">
                      {s.order}
                    </AppText>
                  </View>
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <AppText variant="bodyBold">{s.title}</AppText>
                  <AppText variant="caption" muted>
                    0/{s.cardCount} ezberlendi
                  </AppText>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </View>
              <ProgressBar value={0} color={tint.strong} height={8} />
            </Surface>
          )}
        </Pressable>
      ))}
    </Screen>
  );
}
