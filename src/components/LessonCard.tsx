import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { AppText, EmojiBubble, ProgressBar, Surface } from '@/components/ui';
import { lessonCardCount, type Lesson } from '@/data/content';
import { lessonKnown, useProgress } from '@/store/progress';
import { Spacing, useAppTheme, useTint } from '@/theme';

export function LessonCard({ lesson }: { lesson: Lesson }) {
  const { colors } = useAppTheme();
  const tint = useTint(lesson.color);
  const sectionCount = lesson.sections.length;
  const cardCount = lessonCardCount(lesson);
  const { cards } = useProgress();
  const known = lessonKnown(lesson, cards);

  return (
    <Pressable
      disabled={lesson.comingSoon}
      onPress={() => router.push({ pathname: '/lesson/[lessonId]', params: { lessonId: lesson.id } })}>
      {({ pressed }) => (
        <Surface
          edge={lesson.comingSoon ? colors.border : tint.strong}
          style={{
            gap: Spacing.md,
            opacity: lesson.comingSoon ? 0.6 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
            <EmojiBubble emoji={lesson.emoji} bg={tint.soft} size={54} />
            <View style={{ flex: 1, gap: 2 }}>
              <AppText variant="label" muted>
                Ders {lesson.code}
              </AppText>
              <AppText variant="title">{lesson.title}</AppText>
              <AppText variant="small" muted>
                {lesson.comingSoon ? 'Yakında 🔒' : `${sectionCount} bölüm · ${cardCount} kart`}
              </AppText>
            </View>
            {!lesson.comingSoon && <Ionicons name="chevron-forward" size={22} color={colors.textMuted} />}
          </View>
          {!lesson.comingSoon && (
            <View style={{ gap: 6 }}>
              <ProgressBar value={cardCount ? known / cardCount : 0} color={tint.strong} />
              <AppText variant="caption" muted>
                {known}/{cardCount} kart ezberlendi
              </AppText>
            </View>
          )}
        </Surface>
      )}
    </Pressable>
  );
}
