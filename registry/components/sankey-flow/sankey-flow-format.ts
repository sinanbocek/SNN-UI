// Akış şemasının saf mantığı: sütun, sıra, boyut yerleşimi ve yazımlar. DOM'a dokunmaz, test edilebilir.
// Sayılar ABACUS'tandır (chart-format): adet "1.234", tutar "₺1.250.000", kısa tutar "₺1,25Mn", pay "%41,6".
import { formatMoney, formatMoneyCompact, formatNumber, formatRatio } from "../lib/chart-format";

/** `muted`: düşen kol gibi ikincil düğüm; nötr gri çizilir ve ona giren şeritler de gri olur. */
export interface SankeyNodeInput { id: string; label: string; muted?: boolean }
export interface SankeyLinkInput { source: string; target: string; value: number }
export type SankeyKind = "count" | "money";

export interface LaidNode {
  id: string; label: string; column: number; order: number;
  /** Gelenle gidenin büyüğü. */
  value: number;
  /** Düğümün genişlik ekseni üzerindeki başlangıcı ve boyu (piksel). */
  start: number; size: number;
  /** Renk sırası: ilk sütunda kendi sırası, sonrakilerde en büyük gelen akışın kaynağınınki. */
  tone: number;
  muted: boolean;
}
export interface LaidLink {
  id: string; source: string; target: string; value: number;
  /** Şeridin orta çizgisinin iki uçtaki konumu ve kalınlığı (piksel). */
  sourceAt: number; targetAt: number; thickness: number;
}
export interface SankeyLayout { nodes: LaidNode[]; links: LaidLink[]; columns: number; total: number }

/** Akışlar yalnız pozitif değerli, düğümleri bilinen ve kendine dönmeyen bağlantılardır. */
export function validLinks(nodes: SankeyNodeInput[], links: SankeyLinkInput[]): SankeyLinkInput[] {
  const known = new Set(nodes.map(node => node.id));
  return links.filter(link => link.value > 0 && known.has(link.source) && known.has(link.target) && link.source !== link.target);
}

/** Her düğümün sütunu: kaynaktan en uzun yolun uzunluğu. Döngü varsa düğüm sayısı kadar turdan sonra durur. */
export function columnsOf(nodes: SankeyNodeInput[], links: SankeyLinkInput[]): Map<string, number> {
  const column = new Map(nodes.map(node => [node.id, 0]));
  for (let pass = 0; pass < nodes.length; pass++) {
    let changed = false;
    for (const link of links) {
      const next = (column.get(link.source) ?? 0) + 1;
      if (next > (column.get(link.target) ?? 0) && next < nodes.length) { column.set(link.target, next); changed = true; }
    }
    if (!changed) break;
  }
  return column;
}

/** `breadth`: şemanın genişlik ekseni uzunluğu (yatay şemada yükseklik). `gap`: aynı sütundaki düğümler arası boşluk. */
export function layoutSankey(nodes: SankeyNodeInput[], rawLinks: SankeyLinkInput[], breadth: number, gap = 10): SankeyLayout {
  const links = validLinks(nodes, rawLinks);
  const used = new Set(links.flatMap(link => [link.source, link.target]));
  const active = nodes.filter(node => used.has(node.id));
  if (!active.length) return { nodes: [], links: [], columns: 0, total: 0 };
  const column = columnsOf(active, links);
  const columns = Math.max(...column.values()) + 1;
  const inSum = new Map<string, number>(), outSum = new Map<string, number>();
  for (const link of links) {
    outSum.set(link.source, (outSum.get(link.source) ?? 0) + link.value);
    inSum.set(link.target, (inSum.get(link.target) ?? 0) + link.value);
  }
  const valueOf = (id: string) => Math.max(inSum.get(id) ?? 0, outSum.get(id) ?? 0);

  // Sütun içi sıra: girdi sırasından başlar, komşuların ortalama sırasına göre birkaç tur düzeltilir (kesişimi azaltır).
  const byColumn: SankeyNodeInput[][] = Array.from({ length: columns }, () => []);
  for (const node of active) byColumn[column.get(node.id)!]!.push(node);
  const position = new Map<string, number>();
  const refresh = () => byColumn.forEach(list => list.forEach((node, at) => position.set(node.id, list.length > 1 ? at / (list.length - 1) : .5)));
  refresh();
  for (let sweep = 0; sweep < 4; sweep++) {
    const order = sweep % 2 === 0 ? byColumn.map((_, at) => at) : byColumn.map((_, at) => columns - 1 - at);
    for (const at of order) {
      const forward = sweep % 2 === 0;
      const barycenter = new Map<string, number>();
      for (const node of byColumn[at]!) {
        const near = links.filter(link => forward ? link.target === node.id : link.source === node.id);
        const weight = near.reduce((sum, link) => sum + link.value, 0);
        barycenter.set(node.id, weight ? near.reduce((sum, link) => sum + link.value * (position.get(forward ? link.source : link.target) ?? .5), 0) / weight : position.get(node.id) ?? .5);
      }
      byColumn[at]!.sort((a, b) => barycenter.get(a.id)! - barycenter.get(b.id)!);
      refresh();
    }
  }

  const scale = Math.min(...byColumn.map(list => {
    const sum = list.reduce((acc, node) => acc + valueOf(node.id), 0);
    return Math.max(0, breadth - gap * (list.length - 1)) / sum;
  }));
  const laid = new Map<string, LaidNode>();
  byColumn.forEach((list, at) => {
    const sizes = list.map(node => valueOf(node.id) * scale);
    const used2 = sizes.reduce((sum, size) => sum + size, 0) + gap * (list.length - 1);
    let cursor = Math.max(0, (breadth - used2) / 2);
    list.forEach((node, order) => {
      laid.set(node.id, { id: node.id, label: node.label, column: at, order, value: valueOf(node.id), start: cursor, size: sizes[order]!, tone: 0, muted: !!node.muted });
      cursor += sizes[order]! + gap;
    });
  });

  // Renk sırası.
  let nextTone = 0;
  for (const node of byColumn[0]!) laid.get(node.id)!.tone = nextTone++;
  for (let at = 1; at < columns; at++) {
    for (const node of byColumn[at]!) {
      const biggest = links.filter(link => link.target === node.id).sort((a, b) => b.value - a.value)[0];
      laid.get(node.id)!.tone = biggest ? laid.get(biggest.source)!.tone : nextTone++;
    }
  }

  // Şerit uçları: her düğümde giden akışlar hedeflerin konumuna, gelenler kaynakların konumuna göre dizilir.
  const outCursor = new Map<string, number>(), inCursor = new Map<string, number>();
  laid.forEach(node => { outCursor.set(node.id, node.start); inCursor.set(node.id, node.start); });
  const result: LaidLink[] = [];
  const sortedOut = [...links].sort((a, b) => laid.get(a.target)!.start - laid.get(b.target)!.start);
  const sourceAt = new Map<LaidLink["id"], number>();
  const idOf = (link: SankeyLinkInput) => `${link.source}>${link.target}`;
  for (const link of sortedOut) {
    const thickness = link.value * scale, from = outCursor.get(link.source)!;
    sourceAt.set(idOf(link), from + thickness / 2);
    outCursor.set(link.source, from + thickness);
  }
  const sortedIn = [...links].sort((a, b) => laid.get(a.source)!.start - laid.get(b.source)!.start);
  for (const link of sortedIn) {
    const thickness = link.value * scale, to = inCursor.get(link.target)!;
    result.push({ id: idOf(link), source: link.source, target: link.target, value: link.value, sourceAt: sourceAt.get(idOf(link))!, targetAt: to + thickness / 2, thickness });
    inCursor.set(link.target, to + thickness);
  }
  const total = byColumn[0]!.reduce((sum, node) => sum + valueOf(node.id), 0);
  return { nodes: [...laid.values()], links: result, columns, total };
}

/** Vurgulanacak yol: verilen uçtan geriye (kaynaklara) ve ileriye (hedeflere) tüm bağlantılar. */
export function pathThrough(links: Pick<LaidLink, "id" | "source" | "target">[], upstreamFrom: string | null, downstreamFrom: string | null): { links: Set<string>; nodes: Set<string> } {
  const linkIds = new Set<string>(), nodeIds = new Set<string>();
  const walk = (start: string | null, direction: "up" | "down") => {
    if (!start) return;
    nodeIds.add(start);
    const queue = [start], seen = new Set([start]);
    while (queue.length) {
      const id = queue.shift()!;
      for (const link of links) {
        const matches = direction === "up" ? link.target === id : link.source === id;
        if (!matches) continue;
        linkIds.add(link.id);
        const next = direction === "up" ? link.source : link.target;
        nodeIds.add(next);
        if (!seen.has(next)) { seen.add(next); queue.push(next); }
      }
    }
  };
  walk(upstreamFrom, "up");
  walk(downstreamFrom, "down");
  return { links: linkIds, nodes: nodeIds };
}

/** Değer yazımı: adet "1.234" ya da TRY "₺1.250.000". */
export const flowValueText = (kind: SankeyKind, value: number) => kind === "money" ? formatMoney(value, 0) : formatNumber(value, 0);
/** Düğüm yanındaki kısa yazım: adet "12,5B" değil tam sayı, tutar "₺1,25Mn". */
export const flowShortText = (kind: SankeyKind, value: number) => kind === "money" ? formatMoneyCompact(value) : formatNumber(value, 0);
/** Pay: 0,416 → "%41,6". Oran hesabı düz bölmedir. */
export const flowShareText = (value: number, base: number) => formatRatio(base > 0 ? value / base : 0, 1);

/** Akış ipucu: "Reklam → Site: 1.200 (kaynağın payı %40)". */
export function linkTip(kind: SankeyKind, sourceLabel: string, targetLabel: string, value: number, sourceValue: number): string {
  return `${sourceLabel} → ${targetLabel}: ${flowValueText(kind, value)} (kaynağın payı ${flowShareText(value, sourceValue)})`;
}
export function nodeTip(kind: SankeyKind, label: string, value: number, total: number): string {
  return `${label}: ${flowValueText(kind, value)} (toplamın payı ${flowShareText(value, total)})`;
}
