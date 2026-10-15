// Ses oynatıcının saf mantığı: süre yazımı, parça sırası ve ses düzeyi. Sayılar ABACUS'tandır.
import { math, money } from "@snn/abacus-core";
import { countText } from "../lib/shop-format";

export interface Track {
  id: string;
  title: string;
  /** İkinci satır (koleksiyon ya da tür). */
  subtitle?: string;
  /** Ses dosyasının adresi; uygulamadan gelir (bileşen içinde gerçek ses gömülmez). */
  src: string;
  /** Bilinen süre (saniye); dosya yüklenince gerçek süre kullanılır. */
  duration?: number;
  /** Kapak yer tutucusunun renk tonu (0–5). */
  tone?: number;
  cover?: string;
}

/** Süreyi "d:ss" yazar: 12 → "0:12", 74 → "1:14", 3725 → "62:05". Geçersiz süre "0:00". */
export function clock(seconds: number): string {
  const total = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
  const minutes = Math.floor(total / 60), rest = total % 60;
  return `${countText(minutes)}:${rest < 10 ? "0" : ""}${rest}`;
}

/** Aralık girdisinin değer metni: "0:12 / 0:24". */
export const clockPair = (position: number, duration: number): string => `${clock(position)} / ${clock(duration)}`;

/** Ses düzeyi (0–1) yüzde olarak: 0.7 → "%70". */
export const volumeText = (volume: number): string => money.percent(math.mul(Math.min(1, Math.max(0, volume)), 100), 0);

/** Önceki / sonraki parça sırası; uçlarda yerinde kalır. */
export function neighbour(index: number, way: "next" | "prev", count: number): number {
  return way === "next" ? Math.min(count - 1, index + 1) : Math.max(0, index - 1);
}

/** Parça bitince sıradaki parça: son parçada null (durur). */
export const afterEnd = (index: number, count: number): number | null => index + 1 < count ? index + 1 : null;

export const playLabel = (title: string): string => `${title} çal`;
export const muteLabel = (muted: boolean): string => muted ? "Sesi aç" : "Sessize al";
