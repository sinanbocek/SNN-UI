// Adım göstergesinin durum kararı (SNN ekledi: "geri dönüldü"). Saf dosya: React yok, test edilir.

export type StepperStatus = "complete" | "current" | "returned" | "upcoming" | "error";
export type StepperGlyph = "number" | "check" | "return" | "error";

/**
 * Bir adımın durumu. Hata her şeyin önündedir. Geçerli adımdan önceki adımlar tamamlanmıştır. Geçerli adımdan sonra gelip
 * `returned` işaretli adım "geri dönüldü"dür: daha önce yapılmıştı, akış geri döndüğü için yeniden ele alınacak.
 */
export function stepStatus(step: { error?: string | undefined; returned?: boolean | undefined }, index: number, active: number): StepperStatus {
  if (step.error) return "error";
  if (index < active) return "complete";
  if (index === active) return "current";
  return step.returned ? "returned" : "upcoming";
}

/** Durumun işaret simgesi: tamamlanan tik, geri dönülen geri ok, hatalı uyarı, diğerleri sıra numarası. */
export const glyphOf = (status: StepperStatus): StepperGlyph => (status === "error" ? "error" : status === "complete" ? "check" : status === "returned" ? "return" : "number");

/** Ekran okuyucunun adım adından sonra okuduğu durum. Geçerli adım `aria-current` ile söylenir. */
export const statusText: Record<StepperStatus, string> = { complete: "tamamlandı", current: "", returned: "geri dönüldü", upcoming: "başlanmadı", error: "hata" };

/** Canlı bölge duyurusu: "Adım 3 / 10: Keşif". Bütün adımlar bitince `completeLabel`. */
export const progressText = (active: number, count: number, label: string | undefined, completeLabel: string) => (label === undefined ? completeLabel : `Adım ${active + 1} / ${count}: ${label}`);
