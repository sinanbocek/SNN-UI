// Hesap kartının saf mantığı: tutar doğrulama, hareket süzme, grafik noktaları ve yazımlar. Para TRY'dir; hesap kuruş tamsayısıyla yapılır.
// Bileşen gerçek para hareketi yapmaz: ekrandaki doğrulama kolaylıktır, asıl denetim uygulamanın defterindedir.
import { date, math, money, text } from "@snn/abacus-core";
import { smoothLine, roundTo } from "../lib/chart-format";
import { exactText, signedMinorText, toMinor } from "../lib/shop-format";

export type WalletAction = "send" | "deposit" | "convert" | "receive";
export const ACTIONS: { value: WalletAction; label: string; verb: string }[] = [
  { value: "send", label: "Gönder", verb: "gönder" },
  { value: "deposit", label: "Yatır", verb: "yatır" },
  { value: "convert", label: "Çevir", verb: "çevir" },
  { value: "receive", label: "Al", verb: "iste" },
];
/** Bakiyeden düşen işlemler: tutar bakiyeyi aşamaz. */
export const spends = (action: WalletAction): boolean => action === "send" || action === "convert";

export interface WalletTransaction {
  id: string;
  title: string;
  /** İşlem günü, ISO tarih ("2026-10-14"). */
  date: string;
  /** Kaynak ya da kişi ("Kasa", "Barış Yıldız"). */
  source?: string;
  /** Ana birimde TRY; çıkan eksi. */
  amount: number;
}
export interface BalancePoint { /** ISO tarih. */ date: string; /** Ana birimde TRY. */ value: number }
export interface WalletAccount {
  id: string;
  label: string;
  balance: number;
  /** Bu ay değişim (ana birimde TRY, işaretli). */
  monthChange: number;
  /** Dönem anahtarı → bakiye noktaları (eskiden yeniye). */
  history: Record<string, BalancePoint[]>;
  transactions: WalletTransaction[];
}

export interface AmountResult { minor: number | null; error: string | null }

/** Yazılan tutarı doğrular: boş, sıfır ya da negatif, en çok iki ondalık, harcamada bakiyeyi aşma. */
export function checkAmount(raw: string, action: WalletAction, balanceMinor: number): AmountResult {
  if (!raw.trim()) return { minor: null, error: "Tutarı girin." };
  const value = money.parseNumber(raw.trim());
  if (value === null || !Number.isFinite(value)) return { minor: null, error: "Geçerli bir tutar girin." };
  if (value <= 0) return { minor: null, error: "Tutar sıfırdan büyük olmalı." };
  const minor = toMinor(value);
  if (math.abs(math.sub(value, math.div(minor, 100) ?? 0)) > 1e-9) return { minor: null, error: "En çok iki ondalık yazılabilir." };
  if (spends(action) && minor > balanceMinor) return { minor: null, error: "Tutar bakiyenizi aşıyor." };
  return { minor, error: null };
}

/** Hareketleri başlık, kaynak ve tarih metninde arar (Türkçe büyük/küçük harf duyarsız). */
export function filterTransactions(list: WalletTransaction[], query: string): WalletTransaction[] {
  const needle = text.lower(query.trim());
  if (!needle) return list;
  return list.filter(item => text.lower(`${item.title} ${item.source ?? ""} ${date.format(item.date, "short")}`).includes(needle));
}

/** Grafik noktalarını `width` × `height` kutusuna yerleştirir; yol yumuşak çizgidir. Tek nokta düz çizgi olur. */
export function chartGeometry(points: BalancePoint[], width = 300, height = 84, pad = 6) {
  if (!points.length) return { line: "", area: "", dots: [] as { x: number; y: number }[] };
  const values = points.map(point => point.value);
  const low = Math.min(...values), high = Math.max(...values), span = high - low || 1;
  const dots = points.map((point, at) => ({ x: roundTo(points.length === 1 ? width / 2 : (at / (points.length - 1)) * width, 2), y: roundTo(pad + (1 - (point.value - low) / span) * (height - 2 * pad), 2) }));
  const line = smoothLine(dots);
  const last = dots[dots.length - 1]!, first = dots[0]!;
  return { line, area: `${line}L${last.x} ${height}L${first.x} ${height}Z`, dots };
}

export const balanceText = (balance: number): string => exactText(toMinor(balance));
export const changeText = (monthChange: number): string => `${signedMinorText(toMinor(monthChange))} bu ay`;
export const pointText = (point: BalancePoint): string => `${date.format(point.date, "long")}: ${balanceText(point.value)}`;
export const transactionAmountText = (amount: number): string => signedMinorText(toMinor(amount));
export const transactionMeta = (item: WalletTransaction): string => item.source ? `${date.format(item.date, "short")} · ${item.source}` : date.format(item.date, "short");
export const submitLabel = (action: WalletAction, minor: number | null): string => {
  const found = ACTIONS.find(item => item.value === action)!;
  return minor === null ? found.label : action === "deposit" ? `${exactText(minor)} ekle` : action === "receive" ? `${exactText(minor)} iste` : `${exactText(minor)} ${found.verb}`;
};
