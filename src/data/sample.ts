/**
 * GEÇİCİ örnek içerik (1. aşama).
 * 2. aşamada PDF'teki 346 kartın tamamı gerçek veri olarak eklenecek,
 * 7. aşamada içerik admin panelinden gelecek.
 */

export type Lesson = {
  id: string;
  code: string;
  title: string;
  emoji: string;
  /** Tema rengi anahtarı */
  color: 'primary' | 'lilac' | 'sky' | 'pink' | 'known' | 'review';
  comingSoon?: boolean;
};

export type Section = {
  id: string;
  lessonId: string;
  order: number;
  title: string;
  emoji: string;
  cardCount: number;
};

export const lessons: Lesson[] = [
  { id: 'ticaret-hukuku', code: '1010', title: 'Ticaret Hukuku', emoji: '⚖️', color: 'primary' },
  {
    id: 'sp-mevzuati',
    code: '1001',
    title: 'Sermaye Piyasası Mevzuatı',
    emoji: '📈',
    color: 'lilac',
    comingSoon: true,
  },
];

const th = (order: number, title: string, emoji: string, from: number, to: number): Section => ({
  id: `th-${order}`,
  lessonId: 'ticaret-hukuku',
  order,
  title,
  emoji,
  cardCount: to - from + 1,
});

export const sections: Section[] = [
  th(1, 'Şirket türleri ve sermaye', '🏢', 1, 25),
  th(2, 'Birleşme, bölünme ve tür değiştirme', '🔀', 26, 51),
  th(3, 'Şirketler topluluğu ve kuruluş', '🧩', 52, 75),
  th(4, 'Kurumlar, izinler ve TSRS', '🏛️', 76, 99),
  th(5, 'Yönetim kurulu: üyelik, görev ve karar', '👔', 100, 126),
  th(6, 'YK: yetki devri, bilgi ve yasaklar', '🚫', 127, 150),
  th(7, 'Karar sakatlığı, sorumluluk ve ibra', '🩹', 151, 175),
  th(8, 'Genel kurul: çağrı, gündem ve özel kurul', '📣', 176, 200),
  th(9, 'GK: katılım, oy, nisap ve dava', '🗳️', 201, 225),
  th(10, 'Denetim eşikleri ve denetçi', '🔍', 226, 250),
  th(11, 'Sermaye değişikliği ve borçlanma araçları', '💰', 251, 273),
  th(12, 'Payın bastırılması, devri ve geri alımı', '📜', 274, 296),
  th(13, 'Ortaklık hakları, kâr ve rüçhan', '🤝', 297, 320),
  th(14, 'Sona erme ve tasfiye', '🏁', 321, 346),
];

export function getLesson(id: string) {
  return lessons.find((l) => l.id === id);
}

export function getSection(id: string) {
  return sections.find((s) => s.id === id);
}

export function getSections(lessonId: string) {
  return sections.filter((s) => s.lessonId === lessonId).sort((a, b) => a.order - b.order);
}

export function lessonCardCount(lessonId: string) {
  return getSections(lessonId).reduce((sum, s) => sum + s.cardCount, 0);
}

/** Önizleme için 1. bölümden birkaç gerçek kart (2. aşamada tamamı eklenecek). */
export type Card = { id: string; sectionId: string; number: number; text: string };

export const previewCards: Card[] = [
  { id: 'th-005', sectionId: 'th-1', number: 5, text: 'TBK m.147’deki belirli ortaklık ilişkisi alacaklarında kural **5 yıl** zamanaşımıdır; TTK’nın özel süreleri saklıdır.' },
  { id: 'th-006', sectionId: 'th-1', number: 6, text: 'Limitedde asgari sermaye **50.000 TL**, esas sermayeli AŞ’de **250.000 TL**, kapalı kayıtlı AŞ’de **500.000 TL’dir**.' },
  { id: 'th-008', sectionId: 'th-1', number: 8, text: 'Asgari sermayeyi artırmaya **Cumhurbaşkanı** yetkilidir; limitedde **10 kat** sınırı vardır, AŞ’de bu üst sınır yoktur.' },
  { id: 'th-013', sectionId: 'th-1', number: 13, text: 'Sermaye konulan muaccel alacak **sözleşme tarihinden 1 ayda** tahsil edilmelidir; ortak tahsil edilmeden borcundan kurtulmaz.' },
  { id: 'th-014', sectionId: 'th-1', number: 14, text: 'AŞ’de nakit itibari bedelin **en az %25’i tescilden önce**, kalanı **tescili izleyen 24 ayda** ödenir; primin **tamamı tescilden önce** ödenir.' },
];
