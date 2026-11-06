/** Yerel saate göre gün anahtarı: "2026-11-06" */
export function dayKey(date: Date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(key: string, days: number) {
  const [y, m, d] = key.split('-').map(Number);
  return dayKey(new Date(y, m - 1, d + days));
}

/**
 * Bugünden geriye doğru kesintisiz çalışılan gün sayısı.
 * Bugün henüz çalışılmadıysa seri dünden itibaren sayılır (gün bitmeden seri bozulmaz).
 */
export function currentStreak(activeDays: Set<string>, today = dayKey()) {
  let day = activeDays.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (activeDays.has(day)) {
    streak++;
    day = addDays(day, -1);
  }
  return streak;
}

/** Kayıtlardaki en uzun kesintisiz çalışma serisi */
export function longestStreak(activeDays: Set<string>) {
  let best = 0;
  for (const day of activeDays) {
    // Yalnızca serinin ilk gününden saymaya başla
    if (activeDays.has(addDays(day, -1))) continue;
    let len = 0;
    let d = day;
    while (activeDays.has(d)) {
      len++;
      d = addDays(d, 1);
    }
    best = Math.max(best, len);
  }
  return best;
}
