"use client";

import { useEffect, useId, useMemo, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { clamp, seriesColor, useElementWidth, useOnScreen, useReducedMotionSafe } from "../lib/viz-utils";
import SegmentedControl from "../segmented-control/segmented-control";
import { countText, dropText, funnelBands, partKeys, ratioText, shortText, stepAnnouncement, stepRatios, type FunnelBand, type FunnelKind, type FunnelPart, type FunnelStep, type FunnelView } from "./funnel-chart-format";
import styles from "./funnel-chart.module.css";

export type { FunnelKind, FunnelPart, FunnelStep, FunnelView };

/** Adım adım daralan bir süreci (ziyaretçi → sipariş, teklif → sözleşme) göstermek için kullanın; dallanan akış için akış şeması daha doğrudur. */
export interface FunnelChartProps {
  steps: FunnelStep[];
  /** Neyin daraldığı, örneğin "Satış hunisi". */
  label: string;
  description?: string;
  /** "count": adet; "money": TRY tutar. */
  kind?: FunnelKind;
  /** Parçalı veride görünüm seçicisini gösterir (Toplam / Bölünmüş / her parça). */
  showViews?: boolean;
  /** Sağ üstte duran ek denetimler. */
  actions?: ReactNode;
  loading?: boolean;
  emptyText?: string;
}

const HEIGHT = 220, ROW = 76, NARROW = 420, PLATEAU = .14;

type Point = { along: number; across: number };
/** Noktalardan geçen yumuşak yol: her iki nokta arasında yatay teğetli bir eğri (düz parçalar doğru olur). */
function curveThrough(points: Point[], map: (along: number, across: number) => { x: number; y: number }) {
  const first = map(points[0]!.along, points[0]!.across);
  let d = `M${first.x} ${first.y}`;
  for (let at = 1; at < points.length; at++) {
    const p = points[at - 1]!, q = points[at]!, mid = (p.along + q.along) / 2;
    const c0 = map(mid, p.across), c1 = map(mid, q.across), end = map(q.along, q.across);
    d += `C${c0.x} ${c0.y} ${c1.x} ${c1.y} ${end.x} ${end.y}`;
  }
  return d;
}

export function FunnelChart({ steps, label, description, kind = "count", showViews = true, actions, loading = false, emptyText = "Veri yok." }: FunnelChartProps) {
  const reduced = useReducedMotionSafe();
  const titleId = useId();
  const [box, width] = useElementWidth<HTMLDivElement>();
  const [visibleRef, onScreen] = useOnScreen<HTMLElement>();
  const [view, setView] = useState<FunnelView>("total");
  const [active, setActive] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  useEffect(() => { const frame = requestAnimationFrame(() => setRevealed(true)); return () => cancelAnimationFrame(frame); }, []);

  const parts = useMemo(() => partKeys(steps), [steps]);
  const bands = useMemo(() => funnelBands(steps, view), [steps, view]);
  const vertical = width > 0 && width < NARROW;
  const count = steps.length;
  const length = vertical ? count * ROW : Math.max(width, 1);
  const breadth = vertical ? Math.max(width * .6, 120) : HEIGHT;
  const stepSize = length / Math.max(count, 1);
  const map = (along: number, across: number) => vertical ? { x: across * breadth, y: along } : { x: along, y: across * breadth };

  const bandPath = (band: FunnelBand) => {
    const forward = (values: number[]) => values.flatMap((value, at) => [{ along: at * stepSize + (at === 0 ? 0 : stepSize * PLATEAU), across: value }, { along: (at + 1) * stepSize - (at === count - 1 ? 0 : stepSize * PLATEAU), across: value }]);
    const top = forward(band.top), bottom = forward(band.bottom).reverse();
    const tail = curveThrough(bottom, map).replace(/^M[^C]*/, "");
    const join = map(bottom[0]!.along, bottom[0]!.across);
    return `${curveThrough(top, map)}L${join.x} ${join.y}${tail}Z`;
  };
  const centerPath = (band: FunnelBand) => curveThrough(band.top.flatMap((value, at) => {
    const across = (value + band.bottom[at]!) / 2;
    return [{ along: at * stepSize + (at === 0 ? 0 : stepSize * PLATEAU), across }, { along: (at + 1) * stepSize - (at === count - 1 ? 0 : stepSize * PLATEAU), across }];
  }), map);

  const pick = (at: number | null) => setActive(at === null ? null : clamp(at, 0, count - 1));
  const stepAt = (event: PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const along = vertical ? event.clientY - rect.top : event.clientX - rect.left;
    return clamp(Math.floor(along / stepSize), 0, count - 1);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys: Record<string, number | null> = { ArrowRight: (active ?? -1) + 1, ArrowDown: (active ?? -1) + 1, ArrowLeft: (active ?? count) - 1, ArrowUp: (active ?? count) - 1, Home: 0, End: count - 1, Escape: null };
    if (!(event.key in keys)) return;
    event.preventDefault();
    pick(keys[event.key]!);
  };

  const viewOptions = [{ value: "total", label: "Toplam" }, { value: "split", label: "Bölünmüş" }, ...parts.map(part => ({ value: part.key, label: part.label }))];
  const footprint = active === null ? null : steps[active];
  const ratios = active === null ? null : stepRatios(steps, active);
  const tipCenter = active === null ? 0 : vertical ? 0 : clamp((active + .5) * stepSize, 110, Math.max(110, length - 110));

  if (loading) return <figure className={styles.figure} aria-busy="true" aria-label={`${label} yükleniyor`}><div className={styles.skeleton} /></figure>;
  const empty = !steps.length || !(steps[0]?.value && steps[0].value > 0);

  const heads = steps.map((step, at) => {
    const { previous } = stepRatios(steps, at);
    return <div key={step.key} className={styles.stepHead} data-active={active === at || undefined}>
      <span className={styles.stepName}>{step.label}</span>
      <span className={styles.stepValue}>{shortText(kind, step.value)}</span>
      <span className={styles.stepRatio}>{previous === null ? "İlk adım" : ratioText(previous)}</span>
    </div>;
  });

  return <figure ref={visibleRef} className={styles.figure} data-reduced={reduced || undefined} aria-labelledby={titleId}>
    <div className={styles.head}>
      <div className={styles.titles}>
        <figcaption id={titleId} className={styles.title}>{label}</figcaption>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      <div className={styles.actions}>
        {showViews && parts.length > 0 && <SegmentedControl label="Görünüm" value={view} onValueChange={setView} options={viewOptions} />}
        {actions}
      </div>
    </div>
    {empty ? <p className={styles.empty}>{emptyText}</p> : <div ref={box} className={styles.body} data-vertical={vertical || undefined}>
      {!vertical && <div className={styles.heads} style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }} aria-hidden="true">{heads}</div>}
      <div className={styles.stage}>
        <div className={styles.focus} role="group" aria-roledescription="huni grafiği" aria-label={`${label}; ok tuşlarıyla adımlar arasında gezin`} tabIndex={0} onKeyDown={onKeyDown} onBlur={() => pick(null)}>
          <svg className={styles.svg} width={vertical ? breadth : length} height={vertical ? length : HEIGHT} aria-hidden="true" data-revealed={revealed || undefined}
            onPointerMove={event => { if (event.pointerType === "mouse" || event.buttons) pick(stepAt(event)); }} onPointerDown={event => pick(stepAt(event))} onPointerLeave={event => { if (event.pointerType === "mouse") pick(null); }}>
            {active !== null && <rect className={styles.column} x={vertical ? 0 : active * stepSize} y={vertical ? active * stepSize : 0} width={vertical ? breadth : stepSize} height={vertical ? stepSize : HEIGHT} />}
            <g className={styles.bands} data-vertical={vertical || undefined}>
              {bands.map(band => <path key={band.key} className={styles.band} d={bandPath(band)} style={{ fill: band.key === "total" ? seriesColor(0) : seriesColor(Math.max(0, parts.findIndex(part => part.key === band.key))) }} />)}
            </g>
            {!reduced && onScreen && revealed && bands.map(band => <g key={band.key} className={styles.dots}>{[0, 1, 2, 3].map(at => <circle key={at} r={2} className={styles.dot}>
              <animateMotion dur="7s" begin={`${-(at * 1.75)}s`} repeatCount="indefinite" path={centerPath(band)} />
            </circle>)}</g>)}
          </svg>
          {!vertical && <div className={styles.drops} aria-hidden="true">{steps.slice(1).map((step, at) => <span key={step.key} className={styles.drop} style={{ left: (at + 1) * stepSize }}>{dropText(kind, steps[at]!.value, step.value)}</span>)}</div>}
        </div>
        {vertical && <div className={styles.rows} style={{ height: length }} aria-hidden="true">{heads}</div>}
        {footprint && ratios && <div className={styles.tip} style={vertical ? { top: (active ?? 0) * stepSize, right: 0 } : { left: tipCenter }} role="presentation">
          <strong>{footprint.label}</strong>
          <span>{countText(kind, footprint.value)}</span>
          <span>İlk adıma göre {ratioText(ratios.first)}</span>
          {ratios.previous !== null && <span>Önceki adımdan {ratioText(ratios.previous)} kaldı</span>}
          {footprint.parts?.map(part => <span key={part.key} className={styles.tipPart}>{part.label}: {countText(kind, part.value)}</span>)}
        </div>}
      </div>
    </div>}
    <div className={styles.srOnly}><table>
      <caption>{label}</caption>
      <thead><tr><th scope="col">Adım</th><th scope="col">Değer</th><th scope="col">Önceki adımdan</th><th scope="col">İlk adıma göre</th></tr></thead>
      <tbody>{steps.map((step, at) => { const r = stepRatios(steps, at); return <tr key={step.key}><th scope="row">{step.label}</th><td>{countText(kind, step.value)}</td><td>{r.previous === null ? "—" : ratioText(r.previous)}</td><td>{ratioText(r.first)}</td></tr>; })}</tbody>
    </table></div>
    <p className={styles.srOnly} aria-live="polite" aria-atomic="true">{active === null ? "" : stepAnnouncement(kind, steps, active)}</p>
  </figure>;
}

export default FunnelChart;
