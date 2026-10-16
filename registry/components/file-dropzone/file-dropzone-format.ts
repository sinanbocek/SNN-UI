// Dosya bırakma alanının yazım ve karşılaştırma işleri ABACUS ile (giris-alanlari-standardi.md). Arc boyutu toFixed ile,
// uzantıyı toLowerCase ile karşılaştırıyordu ve yüzdeyi "45%" yazıyordu. Burada boyut ABACUS `unit.dataSize` ("1,5 MB"),
// küçük harf `text.lower` (İ/I doğru), yüzde `money.percent` ("%45"). Saf dosya: React yok, test edilir.
import { money, text, unit } from "@snn/abacus-core";

const KB = 1024;
const MB = KB * KB;

/** Boyutu yazar: B ve KB tam sayı, MB ve üstü 10'un altında bir ondalık ("512 B", "38 KB", "1,5 MB", "24 MB", "1,2 GB"). */
export function formatFileSize(bytes: number) {
  if (bytes < MB) return unit.dataSize(bytes, { digits: 0 });
  let scaled = bytes / MB;
  while (scaled >= KB) scaled /= KB;
  return unit.dataSize(bytes, { digits: scaled >= 10 ? 0 : 1 });
}

/** Yükleme yüzdesi Türkçe yazımla: 45 → "%45". */
export const formatPercent = (value: number) => money.percent(Math.round(Math.min(Math.max(value, 0), 100)), 0);

/** Dosya adının küçük harfli uzantısı: "RAPOR.PDF" → "pdf"; uzantı yoksa boş. */
export function extensionOf(name: string) {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? text.lower(name.slice(dot + 1)) : "";
}

/** Simge türü: görsel, video, arşiv, belge ya da diğer. */
export function fileKind(name: string): "image" | "video" | "archive" | "document" | "other" {
  const extension = extensionOf(name);
  if (["png", "jpg", "jpeg", "gif", "webp", "svg", "avif", "heic"].includes(extension)) return "image";
  if (["mov", "mp4", "webm", "m4v", "avi"].includes(extension)) return "video";
  if (["zip", "gz", "tar", "rar", "7z"].includes(extension)) return "archive";
  if (["pdf", "md", "txt", "doc", "docx", "rtf", "xls", "xlsx", "csv", "odt", "ods"].includes(extension)) return "document";
  return "other";
}

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

/** Sınır notu: "Kabul edilen: .pdf, .xlsx" ya da "En çok 5 dosya". */
export const noteText = (maxFiles: number, accept?: string) => (accept ? `Kabul edilen: ${accept.split(",").map(value => value.trim()).filter(Boolean).join(", ")}` : `En çok ${maxFiles} dosya`);

/** Ekleme hatası: tür reddi ya da sayı sınırı. Boşsa hata yok. */
export function addError(total: number, matching: number, overflow: boolean, maxFiles: number, firstName?: string) {
  if (matching !== total) return total === 1 && firstName ? `${firstName} kabul edilen bir dosya türü değil.` : "Bazı dosyalar kabul edilen türde olmadığı için eklenmedi.";
  if (overflow) return `En çok ${maxFiles} dosya ekleyebilirsiniz.`;
  return "";
}

/** Boyut sınırı iletisi: "Dosya 10 MB sınırını aşıyor". Cümle, birim kısaltmasına ek gelmeyecek biçimde kuruldu ("MB'tan" mı "MB'den" mi sorusu doğmaz). */
export const tooLargeText = (maxSize: number) => `Dosya ${formatFileSize(maxSize)} sınırını aşıyor`;
