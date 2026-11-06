import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Pressable, View } from 'react-native';

import { AppText, EmojiBubble, ProgressBar, Screen, Surface } from '@/components/ui';
import { getLesson, lessonCardCount } from '@/data/content';
import { useContent } from '@/store/content';
import { lessonKnown, sectionStats, useProgress } from '@/store/progress';
import { Radius, Spacing, useAppTheme, useTint } from '@/theme';

export default function LessonScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  useContent(); // içerik değişince yeniden çiz
  const lesson = getLesson(lessonId);
  const { colors } = useAppTheme();
  const tint = useTint(lesson?.color ?? 'primary');
  const { cards } = useProgress();

  if (!lesson) {
    return (
      <Screen withTopInset={false}>
        <AppText>Ders bulunamadı.</AppText>
      </Screen>
    );
  }

  const sections = lesson.sections;
  const total = lessonCardCount(lesson);
  const known = lessonKnown(lesson, cards);

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
          {sections.length} bölüm · {total} kart · {known} ezber
        </AppText>
        <View style={{ alignSelf: 'stretch', marginTop: Spacing.sm }}>
          <ProgressBar value={total ? known / total : 0} color={tint.strong} track={colors.surface} />
        </View>
      </Surface>

      <AppText variant="title">Bölümler</AppText>

      {sections.map((s) => {
        const st = sectionStats(s, cards);
        const done = st.total > 0 && st.known === st.total;
        return (
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
                    {st.known}/{st.total} ezberlendi
                    {st.review > 0 ? ` · ${st.review} tekrar` : ''}
                    {done ? ' · Tamam ✅' : ''}
                  </AppText>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </View>
              <ProgressBar value={st.total ? st.known / st.total : 0} color={done ? colors.known : tint.strong} height={8} />
            </Surface>
          )}
        </Pressable>
        );
      })}
    </Screen>
  );
}
