// Sol alttaki "Yenilikler" listesi: son 24 saatte main'e giren bileşenler. Saf mantık; tarih kaynağı virtual:added-dates.

export const NEWS_WINDOW_HOURS = 24;

/** `dates` içinden şimdiye göre son `hours` saatte eklenen ve katalogda bulunan adlar, en yeni önce. Gelecekteki tarih de sayılır (saat farkı). */
export function recentNames(dates: Record<string, string>, known: ReadonlySet<string>, now: number, hours = NEWS_WINDOW_HOURS): string[] {
  const since = now - hours * 3_600_000;
  return Object.entries(dates)
    .map(([name, iso]) => ({ name, at: Date.parse(iso) }))
    .filter(item => known.has(item.name) && Number.isFinite(item.at) && item.at >= since)
    .sort((a, b) => b.at - a.at || a.name.localeCompare(b.name))
    .map(item => item.name);
}
