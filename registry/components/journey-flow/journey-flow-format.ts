// Yolculuk akışının saf mantığı: aşama toplamları, seçili adımın girenleri ve çıkanları, düşüşler ve yazımlar.
// Yerleşimi `sankey-flow` hesaplar; sayılar ABACUS'tandır (sankey-flow-format üzerinden).
import { flowShareText, flowValueText, layoutSankey, validLinks, type SankeyLinkInput, type SankeyNodeInput } from "../sankey-flow/sankey-flow-format";

export interface JourneyData {
  nodes: SankeyNodeInput[];
  links: SankeyLinkInput[];
  /** Aşama adları, soldan sağa ("Ziyaret", "Hesap", "Kurulum", "İlk hafta", "Plan"). */
  stages: string[];
}

export interface JourneyFacts {
  /** İlk aşamadaki toplam (başlıktaki büyük sayı). */
  total: number;
  /** Son aşamadaki (ücretli plan gibi) toplam. */
  finalTotal: number;
  nodes: Map<string, { id: string; label: string; column: number; value: number; muted: boolean }>;
  columns: number;
}

export function journeyFacts(data: JourneyData): JourneyFacts {
  const layout = layoutSankey(data.nodes, data.links, 100);
  const nodes = new Map(layout.nodes.map(node => [node.id, { id: node.id, label: node.label, column: node.column, value: node.value, muted: node.muted }]));
  const final = layout.nodes.filter(node => node.column === layout.columns - 1 && !node.muted).reduce((sum, node) => sum + node.value, 0);
  return { total: layout.total, finalTotal: final, nodes, columns: layout.columns };
}

export interface FlowRow { id: string; label: string; value: number; /** Düğümün toplamına göre pay metni. */ share: string; drop: boolean }
export interface NodeSummary { label: string; value: number; /** İlk aşamaya göre pay metni. */ shareOfTotal: string; incoming: FlowRow[]; outgoing: FlowRow[] }

/** Seçili adımın girenleri ve çıkanları; paylar adımın kendi toplamına göredir. */
export function nodeSummary(data: JourneyData, facts: JourneyFacts, id: string): NodeSummary | null {
  const node = facts.nodes.get(id);
  if (!node) return null;
  const links = validLinks(data.nodes, data.links);
  const row = (link: SankeyLinkInput, other: string): FlowRow => { const target = facts.nodes.get(other); return { id: other, label: target?.label ?? other, value: link.value, share: flowShareText(link.value, node.value), drop: !!target?.muted }; };
  return {
    label: node.label,
    value: node.value,
    shareOfTotal: flowShareText(node.value, facts.total),
    incoming: links.filter(link => link.target === id).sort((a, b) => b.value - a.value).map(link => row(link, link.source)),
    outgoing: links.filter(link => link.source === id).sort((a, b) => b.value - a.value).map(link => row(link, link.target)),
  };
}

export interface DropRow { from: string; value: number; /** Düşen kolun, çıktığı adımın toplamına payı. */ share: string }
/** En büyük düşüşler: düşen (muted) düğümlere giden şeritler, büyükten küçüğe. */
export function topDrops(data: JourneyData, facts: JourneyFacts, count = 3): DropRow[] {
  return validLinks(data.nodes, data.links)
    .filter(link => facts.nodes.get(link.target)?.muted)
    .map(link => ({ from: facts.nodes.get(link.source)?.label ?? link.source, value: link.value, share: flowShareText(link.value, facts.nodes.get(link.source)?.value ?? 0) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, count);
}

export const countText = (value: number) => flowValueText("count", value);
export const shareText = (value: number, base: number) => flowShareText(value, base);

/** Kanal değişince canlı bölge: "16.965 ziyaret, 1.018 ücretli plan". */
export const channelAnnouncement = (facts: JourneyFacts, firstLabel: string, finalLabel: string) => `${countText(facts.total)} ${firstLabel}, ${countText(facts.finalTotal)} ${finalLabel}`;
