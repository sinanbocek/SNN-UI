"use client";

import { useEffect, useId, useMemo, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { seriesColor, useElementWidth, useOnScreen, useReducedMotionSafe } from "../lib/viz-utils";
import { Switch } from "../switch/switch";
import { flowShareText, flowShortText, flowValueText, layoutSankey, linkTip, nodeTip, pathThrough, type SankeyKind, type SankeyLinkInput, type SankeyNodeInput } from "./sankey-flow-format";
import styles from "./sankey-flow.module.css";

export type { SankeyKind, SankeyLinkInput, SankeyNodeInput };

/** Bir toplamın aşamalar boyunca nasıl bölündüğünü ve birleştiğini göstermek için kullanın; dallanmayan doğrusal yol için huni, katı ağaç için ağaç haritası daha doğrudur. */
export interface SankeyFlowProps {
  nodes: SankeyNodeInput[];
  links: SankeyLinkInput[];
  /** Neyin aktığı, örneğin "Nakit akışı". Grafiği yardımcı teknolojiye adlandırır. */
  label: string;
  description?: string | undefined;
  /** Sütun başlıkları, soldan sağa ("Kaynak", "Hesap", "Gider"). Sığmazsa gizlenir. */
  columnLabels?: string[] | undefined;
  /** "count": adet ("1.234"); "money": TRY tutar ("₺1.250.000"). */
  kind?: SankeyKind | undefined;
  /** Sağ üstte duran denetimler (dönem seçici gibi). */
  actions?: ReactNode | undefined;
  /** Sabitlenmiş (seçili) düğüm; denetimli kullanım için. Tıklama ve Enter seçer, Esc kaldırır. */
  selectedId?: string | null | undefined;
  onSelectedChange?: ((id: string | null) => void) | undefined;
  /** Başlık satırını gizler (üst blok kendi başlığını yazıyorsa); ad yine ekran okuyucuya söylenir. */
  bare?: boolean | undefined;
  loading?: boolean | undefined;
  emptyText?: string | undefined;
}

type Focus = { type: "node" | "link"; id: string } | null;
const NODE = 12, MARGIN = 112, HEIGHT = 340, NARROW = 420;

export function SankeyFlow({ nodes, links, label, description, columnLabels, kind = "count", actions, selectedId, onSelectedChange, bare = false, loading = false, emptyText = "Henüz akış yok." }: SankeyFlowProps) {
  const reduced = useReducedMotionSafe();
  const titleId = useId();
  const [box, width] = useElementWidth<HTMLDivElement>();
  const [visibleRef, onScreen] = useOnScreen<HTMLElement>();
  const [flow, setFlow] = useState(true);
  const [focus, setFocus] = useState<Focus>(null);
  const [tip, setTip] = useState<{ x: number; y: number; text: string } | null>(null);
  const [revealed, setRevealed] = useState(false);
  useEffect(() => { const frame = requestAnimationFrame(() => setRevealed(true)); return () => cancelAnimationFrame(frame); }, []);

  const vertical = width > 0 && width < NARROW;
  const probe = useMemo(() => layoutSankey(nodes, links, 100), [nodes, links]);
  const columns = probe.columns;
  const length = vertical ? Math.max(260, columns * 110) : width;
  const breadth = vertical ? Math.max(120, width - 16) : HEIGHT - 8;
  const layout = useMemo(() => layoutSankey(nodes, links, breadth), [nodes, links, breadth]);
  const nodeById = useMemo(() => new Map(layout.nodes.map(node => [node.id, node])), [layout]);

  // Sütun konumu (akış ekseni); ilk ve son sütunun etiketleri kenar boşluklarına yazılır.
  const margin = vertical ? 8 : MARGIN;
  const alongOf = (column: number) => layout.columns > 1 ? margin + (column * (length - 2 * margin - NODE)) / (layout.columns - 1) : (length - NODE) / 2;
  const point = (along: number, across: number) => vertical ? { x: across + 8, y: along } : { x: along, y: across + 4 };

  const through = useMemo(() => {
    const active: Focus = focus ?? (selectedId ? { type: "node", id: selectedId } : null);
    if (!active) return null;
    if (active.type === "node") return pathThrough(layout.links, active.id, active.id);
    const link = layout.links.find(item => item.id === active.id);
    return link ? pathThrough(layout.links, link.source, link.target) : null;
  }, [focus, layout, selectedId]);

  const colorOf = (id: string) => nodeById.get(id)?.muted ? "var(--neutral-6)" : seriesColor(nodeById.get(id)?.tone ?? 0);
  const linkColor = (link: { source: string; target: string }) => nodeById.get(link.target)?.muted ? "var(--neutral-6)" : colorOf(link.source);
  const total = layout.total;
  const sourceValue = (id: string) => nodeById.get(id)?.value ?? 0;

  const describeNode = (id: string) => {
    const node = nodeById.get(id);
    if (!node) return "";
    const out = layout.links.filter(link => link.source === id).map(link => `${nodeById.get(link.target)?.label ?? ""} ${flowValueText(kind, link.value)}`);
    return `${nodeTip(kind, node.label, node.value, total)}${out.length ? `, şuraya akıyor: ${out.join(", ")}` : ""}`;
  };

  const showNodeTip = (id: string, event?: PointerEvent) => {
    const node = nodeById.get(id);
    if (!node || !box.current) return;
    const rect = box.current.getBoundingClientRect();
    const spot = point(alongOf(node.column) + NODE, node.start + node.size / 2);
    setTip({ x: event ? event.clientX - rect.left : spot.x, y: event ? event.clientY - rect.top : spot.y, text: nodeTip(kind, node.label, node.value, total) });
  };
  const showLinkTip = (id: string, event: PointerEvent) => {
    const link = layout.links.find(item => item.id === id);
    if (!link || !box.current) return;
    const rect = box.current.getBoundingClientRect();
    setTip({ x: event.clientX - rect.left, y: event.clientY - rect.top, text: linkTip(kind, nodeById.get(link.source)?.label ?? "", nodeById.get(link.target)?.label ?? "", link.value, sourceValue(link.source)) });
  };
  const clear = () => { setFocus(null); setTip(null); };

  const byColumn = useMemo(() => Array.from({ length: layout.columns }, (_, at) => layout.nodes.filter(node => node.column === at).sort((a, b) => a.order - b.order)), [layout]);
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") { clear(); onSelectedChange?.(null); return; }
    if ((event.key === "Enter" || event.key === " ") && focus?.type === "node") { event.preventDefault(); onSelectedChange?.(focus.id === selectedId ? null : focus.id); return; }
    const current = focus?.type === "node" ? nodeById.get(focus.id) : undefined;
    let next = current;
    if (!current) next = byColumn[0]?.[0];
    else if (event.key === "ArrowDown") next = byColumn[current.column]?.[current.order + 1] ?? current;
    else if (event.key === "ArrowUp") next = byColumn[current.column]?.[current.order - 1] ?? current;
    else if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      const list = byColumn[current.column + (event.key === "ArrowRight" ? 1 : -1)];
      const here = current.start + current.size / 2;
      next = list?.reduce((best, node) => Math.abs(node.start + node.size / 2 - here) < Math.abs(best.start + best.size / 2 - here) ? node : best) ?? current;
    }
    else if (event.key === "Home") next = byColumn[0]?.[0];
    else if (event.key === "End") next = byColumn[layout.columns - 1]?.[0];
    else return;
    event.preventDefault();
    if (next) { setFocus({ type: "node", id: next.id }); showNodeTip(next.id); }
  };

  if (loading) return <figure className={styles.figure} aria-busy="true" aria-label={`${label} yükleniyor`}><div className={styles.skeleton} /></figure>;

  const curve = (link: (typeof layout.links)[number]) => {
    const from = nodeById.get(link.source)!, to = nodeById.get(link.target)!;
    const a0 = alongOf(from.column) + NODE, a1 = alongOf(to.column), mid = (a0 + a1) / 2;
    const p0 = point(a0, link.sourceAt), c0 = point(mid, link.sourceAt), c1 = point(mid, link.targetAt), p1 = point(a1, link.targetAt);
    return `M${p0.x} ${p0.y}C${c0.x} ${c0.y} ${c1.x} ${c1.y} ${p1.x} ${p1.y}`;
  };
  const showHeads = !vertical && columnLabels && columnLabels.length > 0 && width > 520;
  const svgHeight = vertical ? length : HEIGHT;
  const live = focus?.type === "node" ? describeNode(focus.id) : "";
  const motionOn = flow && !reduced && onScreen && revealed;

  return <figure ref={visibleRef} className={styles.figure} data-reduced={reduced || undefined} aria-labelledby={titleId}>
    {bare ? <h3 className={styles.srOnly} id={titleId}>{label}</h3> : <div className={styles.head}>
      <div className={styles.titles}>
        <figcaption id={titleId} className={styles.title}>{label}</figcaption>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>}
    {layout.nodes.length === 0 ? <p className={styles.empty}>{emptyText}</p> : <>
      {showHeads && <div className={styles.heads} aria-hidden="true">{byColumn.map((_, at) => <span key={at} className={styles.headLabel} style={{ left: alongOf(at) + NODE / 2 }}>{columnLabels![at] ?? ""}</span>)}</div>}
      <div ref={box} className={styles.stage} onPointerLeave={clear}>
        <div className={styles.focus} role="group" aria-roledescription="akış şeması" aria-label={`${label}; ok tuşlarıyla düğümler arasında gezin`} tabIndex={0} onKeyDown={onKeyDown} onBlur={clear}>
          <svg className={styles.svg} width={length} height={svgHeight} viewBox={`0 0 ${length} ${svgHeight}`} aria-hidden="true" data-revealed={revealed || undefined}>
            <g className={styles.ribbons}>
              {layout.links.map(link => {
                const lit = through ? through.links.has(link.id) : false;
                return <path key={link.id} className={styles.ribbon} d={curve(link)} style={{ stroke: linkColor(link), strokeWidth: Math.max(1, link.thickness) }}
                  data-lit={lit || undefined} data-dim={(through && !lit) || undefined}
                  onPointerEnter={event => { setFocus({ type: "link", id: link.id }); showLinkTip(link.id, event); }} onPointerMove={event => showLinkTip(link.id, event)} />;
              })}
            </g>
            {motionOn && <g className={styles.dots}>{layout.links.map(link => {
              const count = Math.min(3, Math.max(1, Math.round(link.thickness / 8)));
              return Array.from({ length: count }, (_, at) => <circle key={`${link.id}:${at}`} r={2} className={styles.dot}>
                <animateMotion dur={`${6 + (at % 3)}s`} begin={`${-(at * 2.3)}s`} repeatCount="indefinite" path={curve(link)} />
              </circle>);
            })}</g>}
            {layout.nodes.map(node => {
              const at = point(alongOf(node.column), node.start);
              const lit = through ? through.nodes.has(node.id) : false;
              const first = node.column === 0, last = node.column === layout.columns - 1;
              const textX = vertical ? at.x : first && !vertical ? at.x - 6 : at.x + NODE + 6;
              const anchor = !vertical && first ? "end" : "start";
              const textY = vertical ? at.y - 6 : at.y + node.size / 2;
              return <g key={node.id} className={styles.node} data-lit={lit || undefined} data-dim={(through && !lit) || undefined} data-selected={((focus?.type === "node" && focus.id === node.id) || selectedId === node.id) || undefined}
                onClick={() => onSelectedChange?.(node.id === selectedId ? null : node.id)} onPointerEnter={event => { setFocus({ type: "node", id: node.id }); showNodeTip(node.id, event); }} onPointerMove={event => showNodeTip(node.id, event)}>
                <rect className={styles.rect} x={at.x} y={at.y} width={vertical ? node.size : NODE} height={vertical ? NODE : node.size} rx={3} style={{ fill: colorOf(node.id) }} />
                {(node.size >= 14 || vertical) && <text className={styles.nodeText} x={textX} y={textY} textAnchor={last && !vertical ? "start" : anchor} dominantBaseline={vertical ? "auto" : "middle"}>
                  <tspan className={styles.nodeName}>{node.label}</tspan><tspan className={styles.nodeValue} dx={6}>{flowShortText(kind, node.value)}</tspan>
                </text>}
              </g>;
            })}
          </svg>
        </div>
        {tip && <div className={styles.tip} style={{ left: tip.x, top: tip.y }} role="presentation">{tip.text}</div>}
      </div>
      <Switch label="Akış" checked={flow} onCheckedChange={setFlow} />
    </>}
    <div className={styles.srOnly}><table>
      <caption>{label}</caption>
      <thead><tr><th scope="col">Kaynak</th><th scope="col">Hedef</th><th scope="col">Değer</th><th scope="col">Kaynağa göre pay</th></tr></thead>
      <tbody>{layout.links.map(link => <tr key={link.id}><th scope="row">{nodeById.get(link.source)?.label}</th><td>{nodeById.get(link.target)?.label}</td><td>{flowValueText(kind, link.value)}</td><td>{flowShareText(link.value, sourceValue(link.source))}</td></tr>)}</tbody>
    </table></div>
    <p className={styles.srOnly} aria-live="polite" aria-atomic="true">{live}</p>
  </figure>;
}

export default SankeyFlow;
