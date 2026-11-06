/** Başarım tanımları. Açılma koşulları: src/store/achievements.ts */
export type Achievement = {
  id: string;
  emoji: string;
  title: string;
  description: string;
  color: 'primary' | 'lilac' | 'sky' | 'pink' | 'known' | 'review';
};

export const achievements: Achievement[] = [
  { id: 'first-card', emoji: '🐣', title: 'İlk Adım', description: 'İlk kartını kaydır', color: 'primary' },
  { id: 'streak-3', emoji: '🔥', title: '3 Gün Seri', description: '3 gün üst üste çalış', color: 'review' },
  { id: 'streak-5', emoji: '⚡', title: '5 Gün Seri', description: '5 gün üst üste çalış', color: 'primary' },
  { id: 'streak-7', emoji: '🚀', title: 'Haftalık Seri', description: '7 gün üst üste çalış', color: 'lilac' },
  { id: 'streak-30', emoji: '👑', title: 'Ay Yıldızı', description: '30 gün üst üste çalış', color: 'pink' },
  { id: 'known-50', emoji: '🧠', title: 'Hafıza 50', description: '50 kartı ezberle', color: 'sky' },
  { id: 'known-100', emoji: '💯', title: 'Yüzlük', description: '100 kartı ezberle', color: 'known' },
  { id: 'known-250', emoji: '🏔️', title: 'Zirve', description: '250 kartı ezberle', color: 'lilac' },
  { id: 'daily-goal', emoji: '🎯', title: 'Hedef Tamam', description: 'Günlük hedefe ulaş', color: 'review' },
  { id: 'section-done', emoji: '✅', title: 'Bölüm Bitti', description: 'Bir bölümün tamamını ezberle', color: 'known' },
  { id: 'lesson-done', emoji: '🏆', title: 'Ders Ustası', description: 'Bir dersin tamamını ezberle', color: 'primary' },
  { id: 'night-owl', emoji: '🦉', title: 'Gece Kuşu', description: 'Gece 23:00–04:00 arası çalış', color: 'sky' },
  { id: 'early-bird', emoji: '🌅', title: 'Erkenci', description: 'Sabah 04:00–07:00 arası çalış', color: 'pink' },
  { id: 'review-master', emoji: '🔁', title: 'Tekrar Kralı', description: '50 tekrar kartını çalış', color: 'review' },
];
