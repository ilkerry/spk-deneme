import { useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { AppText, Button, EmojiBubble, Screen, Segmented, Surface } from '@/components/ui';
import { confirm } from '@/lib/confirm';
import { haptic } from '@/lib/haptics';
import { useContent } from '@/store/content';
import { useProgress } from '@/store/progress';
import { useSettings, type AutoReview, type StudyMode } from '@/store/settings';
import { Fonts, Radius, Spacing, useAppTheme, type ThemePreference } from '@/theme';

const AVATARS = ['🐝', '🦊', '🐼', '🦉', '🐯', '🐸', '🦄', '🐙'];

function SettingBlock({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: Spacing.sm }}>
      <View style={{ gap: 2 }}>
        <AppText variant="bodyBold">{title}</AppText>
        {hint ? (
          <AppText variant="caption" muted>
            {hint}
          </AppText>
        ) : null}
      </View>
      {children}
    </View>
  );
}

export default function ProfileScreen() {
  const { colors, preference, setPreference } = useAppTheme();
  const s = useSettings();
  const { reset } = useProgress();
  const content = useContent();
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  const onSync = async () => {
    setSyncMsg('Güncelleniyor…');
    const ok = await content.refresh();
    setSyncMsg(ok ? 'İçerik güncellendi ✓' : 'Sunucuya ulaşılamadı; mevcut içerikle devam ediliyor.');
  };

  const onReset = async () => {
    const ok = await confirm(
      'İlerlemeyi sıfırla',
      'Tüm kart durumların, serin ve günlük kayıtların silinecek. Bu işlem geri alınamaz.',
      'Sıfırla',
    );
    if (ok) {
      haptic.warning();
      reset();
    }
  };

  return (
    <Screen withTabBar>
      <AppText variant="heading">Profil</AppText>

      {/* Kimlik — giriş yok, sadece cihazda */}
      <Surface style={{ alignItems: 'center', gap: Spacing.md }}>
        <EmojiBubble emoji={s.avatar} bg={colors.primary} size={88} />
        <TextInput
          value={s.name}
          onChangeText={(name) => s.update({ name })}
          placeholder="Adın"
          placeholderTextColor={colors.textMuted}
          maxLength={20}
          style={{
            fontFamily: Fonts.black,
            fontSize: 22,
            color: colors.text,
            textAlign: 'center',
            minWidth: 160,
            paddingVertical: 4,
            borderBottomWidth: 2,
            borderColor: colors.border,
          }}
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: Spacing.sm }}>
          {AVATARS.map((a) => (
            <Pressable
              key={a}
              onPress={() => s.update({ avatar: a })}
              accessibilityLabel={`Avatar ${a}`}
              style={{
                width: 44,
                height: 44,
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
        <AppText variant="caption" muted center>
          🔒 Hesap yok. Tüm bilgilerin yalnızca bu cihazda saklanır.
        </AppText>
      </Surface>

      {/* Çalışma ayarları */}
      <Surface style={{ gap: Spacing.xl }}>
        <SettingBlock title="Çalışma modu" hint="Kart ekranında üstteki düğmeyle de değiştirebilirsin.">
          <Segmented<StudyMode>
            value={s.studyMode}
            onChange={(studyMode) => s.update({ studyMode })}
            options={[
              { value: 'cloze', label: '🧩 Boşluk doldurma' },
              { value: 'read', label: '📖 Düz okuma' },
            ]}
          />
        </SettingBlock>

        <SettingBlock
          title="Otomatik tekrar"
          hint="Açıksa, ‘Biliyorum’ dediğin kartlar seçtiğin süre sonra tekrar karşına çıkar.">
          <Segmented<AutoReview>
            value={s.autoReview}
            onChange={(autoReview) => s.update({ autoReview })}
            options={[
              { value: 'off', label: 'Kapalı' },
              { value: '1', label: '1 gün' },
              { value: '3', label: '3 gün' },
            ]}
          />
        </SettingBlock>

        <SettingBlock title="Günlük hedef" hint="Her gün kaç kart çalışmak istiyorsun?">
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
        </SettingBlock>

        <SettingBlock title="Tema">
          <Segmented<ThemePreference>
            value={preference}
            onChange={setPreference}
            options={[
              { value: 'system', label: '📱 Sistem' },
              { value: 'light', label: '☀️ Açık' },
              { value: 'dark', label: '🌙 Koyu' },
            ]}
          />
        </SettingBlock>
      </Surface>

      <Surface style={{ gap: Spacing.sm }}>
        <AppText variant="bodyBold">📚 İçerik</AppText>
        <AppText variant="caption" muted>
          {content.source === 'remote'
            ? `Sunucudan güncel · ${new Date(content.updatedAt!).toLocaleString('tr-TR')}`
            : content.source === 'cache'
              ? 'Cihazdaki son kopya kullanılıyor'
              : content.remoteConfigured
                ? 'Uygulamadaki içerik kullanılıyor (sunucuya henüz ulaşılamadı)'
                : 'Uygulamadaki içerik kullanılıyor'}
        </AppText>
        {content.remoteConfigured && <Button title="Şimdi güncelle" tone="neutral" onPress={onSync} />}
        {syncMsg && (
          <AppText variant="caption" muted center>
            {syncMsg}
          </AppText>
        )}
      </Surface>

      <Button title="İlerlemeyi sıfırla" tone="neutral" onPress={onReset} />
      <AppText variant="caption" muted center>
        Hapla · sürüm 0.7
      </AppText>
    </Screen>
  );
}
