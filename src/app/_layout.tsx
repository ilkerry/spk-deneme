import { Nunito_600SemiBold } from '@expo-google-fonts/nunito/600SemiBold';
import { Nunito_700Bold } from '@expo-google-fonts/nunito/700Bold';
import { Nunito_800ExtraBold } from '@expo-google-fonts/nunito/800ExtraBold';
import { Nunito_900Black } from '@expo-google-fonts/nunito/900Black';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AchievementToast } from '@/components/celebrate/AchievementToast';
import { ContentProvider } from '@/store/content';
import { ProgressProvider } from '@/store/progress';
import { SettingsProvider } from '@/store/settings';
import { AppThemeProvider, Fonts, useAppTheme } from '@/theme';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { colors, isDark } = useAppTheme();
  const base = isDark ? DarkTheme : DefaultTheme;

  // Ayarlar ve ilerleme cihazdan yüklendikten sonra burası çizilir; açılış ekranını şimdi kapat
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <ThemeProvider
      value={{
        ...base,
        colors: {
          ...base.colors,
          background: colors.background,
          card: colors.background,
          text: colors.text,
          primary: colors.primaryDeep,
          border: colors.border,
        },
      }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerTitleStyle: { fontFamily: Fonts.extraBold },
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: { backgroundColor: colors.background },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="lesson/[lessonId]" options={{ title: '' }} />
        <Stack.Screen name="section/[sectionId]" options={{ title: '' }} />
        <Stack.Screen
          name="study/[sectionId]"
          options={{ presentation: 'fullScreenModal', headerShown: false, animation: 'slide_from_bottom' }}
        />
      </Stack>
      <AchievementToast />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
  });

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SettingsProvider>
        <AppThemeProvider>
          <ContentProvider>
            <ProgressProvider>
              <RootNavigator />
            </ProgressProvider>
          </ContentProvider>
        </AppThemeProvider>
      </SettingsProvider>
    </GestureHandlerRootView>
  );
}
