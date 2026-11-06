/**
 * LisansQuiz renk paleti.
 * Ana renk sıcak turuncu; yazı ve kontrast için derin mor-lacivert.
 * "Biliyorum" = nane yeşili, "Tekrar et" = gül kırmızısı.
 */

const palette = {
  sun: '#FF9A2E',
  sunDeep: '#E0700B',
  sunSoft: '#FFE6CC',
  ink: '#2B2350',
  inkSoft: '#6E6890',
  cream: '#FFF4EA',
  white: '#FFFFFF',
  mint: '#22C39A',
  mintSoft: '#D5F5EB',
  coral: '#F2546E',
  coralSoft: '#FFDDE3',
  lilac: '#8C7BFF',
  lilacSoft: '#E9E5FF',
  sky: '#3FAEF7',
  skySoft: '#DDF1FF',
  pink: '#FF6FA5',
  pinkSoft: '#FFE1EC',
  night: '#17132B',
  nightSurface: '#221C3D',
  nightSurfaceAlt: '#2D2652',
  nightBorder: '#3A3262',
} as const;

export type ColorTokens = {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  textOnPrimary: string;
  primary: string;
  primaryDeep: string;
  primarySoft: string;
  known: string;
  knownSoft: string;
  review: string;
  reviewSoft: string;
  lilac: string;
  lilacSoft: string;
  sky: string;
  skySoft: string;
  pink: string;
  pinkSoft: string;
  shadow: string;
  tabBar: string;
};

export const lightColors: ColorTokens = {
  background: palette.cream,
  surface: palette.white,
  surfaceAlt: palette.sunSoft,
  border: '#F6DCC4',
  text: palette.ink,
  textMuted: palette.inkSoft,
  textOnPrimary: palette.ink,
  primary: palette.sun,
  primaryDeep: palette.sunDeep,
  primarySoft: palette.sunSoft,
  known: palette.mint,
  knownSoft: palette.mintSoft,
  review: palette.coral,
  reviewSoft: palette.coralSoft,
  lilac: palette.lilac,
  lilacSoft: palette.lilacSoft,
  sky: palette.sky,
  skySoft: palette.skySoft,
  pink: palette.pink,
  pinkSoft: palette.pinkSoft,
  shadow: '#D98A45',
  tabBar: palette.white,
};

export const darkColors: ColorTokens = {
  background: palette.night,
  surface: palette.nightSurface,
  surfaceAlt: palette.nightSurfaceAlt,
  border: palette.nightBorder,
  text: palette.cream,
  textMuted: '#B3ABD6',
  textOnPrimary: palette.ink,
  primary: '#FFA23F',
  primaryDeep: palette.sunDeep,
  primarySoft: '#3E2F4C',
  known: '#35D6AC',
  knownSoft: '#1F3F44',
  review: '#FF6F86',
  reviewSoft: '#45293A',
  lilac: '#A396FF',
  lilacSoft: '#2F2A5C',
  sky: '#5BBCFA',
  skySoft: '#1E3352',
  pink: '#FF85B3',
  pinkSoft: '#46263F',
  shadow: '#000000',
  tabBar: palette.nightSurface,
};
