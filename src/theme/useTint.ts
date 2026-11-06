import { useAppTheme } from './ThemeProvider';

export type TintKey = 'primary' | 'lilac' | 'sky' | 'pink' | 'known' | 'review';

/** Bir renk anahtarından { güçlü, yumuşak } renk çifti döndürür. */
export function useTint(key: TintKey) {
  const { colors } = useAppTheme();
  const map: Record<TintKey, { strong: string; soft: string }> = {
    primary: { strong: colors.primaryDeep, soft: colors.primarySoft },
    lilac: { strong: colors.lilac, soft: colors.lilacSoft },
    sky: { strong: colors.sky, soft: colors.skySoft },
    pink: { strong: colors.pink, soft: colors.pinkSoft },
    known: { strong: colors.known, soft: colors.knownSoft },
    review: { strong: colors.review, soft: colors.reviewSoft },
  };
  return map[key];
}
