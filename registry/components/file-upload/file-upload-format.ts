// Dosya yükleme bileşeninin saf yazım ve eşleştirme işleri ABACUS ile (giris-alanlari-standardi.md). Arc boyutu toFixed ile,
// uzantıyı toLowerCase ile karşılaştırıyordu ve yüzdeyi "45%" yazıyordu. Burada boyut ABACUS `unit.dataSize` ("1,5 MB"),
// küçük harf `text.lower` (İ/I doğru), yüzde `money.percent` ("%45"). Saf dosya: React yok, test edilir.
import { money, text, unit } from "@snn/abacus-core";

const KB = 1024;
const MB = KB * KB;

/** Boyutu yazar: B ve KB tam sayı, MB ve üstü 10'un altında bir ondalık ("512 B", "38 KB", "1,5 MB", "24 MB"). */
export function formatFileSize(bytes: number) {
  if (bytes < MB) return unit.dataSize(bytes, { digits: 0 });
  let scaled = bytes / MB;
  while (scaled >= KB) scaled /= KB;
  return unit.dataSize(bytes, { digits: scaled >= 10 ? 0 : 1 });
}

/** Yükleme yüzdesi Türkçe yazımla: 45 → "%45". */
export const formatPercent = (value: number) => money.percent(Math.round(Math.min(Math.max(value, 0), 100)), 0);

/**
 * `accept` kuralına uyuyor mu: ".pdf" uzantıyla, "image/*" tür önekiyle, "application/pdf" tam türle eşleşir.
 * Karşılaştırma ABACUS `text.lower` ile yapılır; "TEKLİF.PDF" ".pdf" kuralına uyar. Kural boşsa her dosya kabul edilir.
 */
export function matchesAccept(file: { name: string; type: string }, accept?: string) {
  const rules = accept?.split(",").map(value => text.lower(value.trim())).filter(Boolean) ?? [];
  if (!rules.length) return true;
  const name = text.lower(file.name), type = text.lower(file.type);
  return rules.some(rule => rule.startsWith(".") ? name.endsWith(rule) : rule.endsWith("/*") ? type.startsWith(rule.slice(0, -1)) : type === rule);
}

/** Boyut sınırı hatası: "Dosya 5 MB sınırını aşıyor." */
export const tooLargeText = (maxSize: number) => `Dosya ${formatFileSize(maxSize)} sınırını aşıyor.`;

/** Ekleme sonrası duyuru: "2 dosya eklendi.", "1 dosya eklendi. 1 dosyada sorun var." ya da yalnız sorun cümlesi. */
export function addedStatus(validCount: number, invalidCount: number) {
  const added = `${validCount} dosya eklendi.`;
  const attention = `${invalidCount} dosyada sorun var.`;
  return !invalidCount ? added : validCount ? `${added} ${attention}` : attention;
}
