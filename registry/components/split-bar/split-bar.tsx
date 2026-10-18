"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { clamp, seriesColor, spreadLabels, textWidth, useElementWidth, useReducedMotionSafe } from "../lib/viz-utils";
import { barSummary, fitsInside, fullValueText, positiveSlices, shareText, sliceWeights, totalOf, visibleSlices, type SplitSlice } from "./split-bar-format";
import styles from "./split-bar.module.css";

export type { SplitSlice };

/** Bir bütünü tek yatay çubukta paylara bölmek için kullanın; toplam başlıksa halka grafik, çok kategori ve mutlak karşılaştırmaysa çubuk grafik daha doğrudur. */
export interface SplitBarProps {
  data: SplitSlice[];
  /** Neyin dağıldığı, örneğin "Gider dağılımı". Çubuğu yardımcı teknolojiye adlandırır. */
  label: string;
  description?: string | undefined;
  /** Sağ üstte duran denetimler (dönem seçici gibi). */
  actions?: ReactNode | undefined;
  /** Tam değer yazımı (okuma alanı, tablo). Varsayılan: ABACUS ile "₺1.250.000". */
  formatValue?: ((value: number) => string) | undefined;
  loading?: boolean | undefined;
  emptyText?: string | undefined;
}

const STRIP_LINK = 28;

export function SplitBar({ data, label, description, actions, formatValue = fullValueText, loading = false, emptyText = "Gösterilecek veri yok." }: SplitBarProps) {
  const reduced = useReducedMotionSafe();
  const titleId = useId();
  const [barRef, barWidth] = useElementWidth<HTMLDivElement>();
  const all = useMemo(() => positiveSlices(data), [data]);
  const [hidden, setHidden] = useState<ReadonlySet<string>>(new Set());
  const [active, setActive] = useState<string | null>(null);
  const [shake, setShake] = useState<string | null>(null);
  const [announce, setAnnounce] = useState("");
  const shakeTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(shakeTimer.current), []);

  const shown = visibleSlices(all, hidden);
  const total = totalOf(shown);
  const colorOf = (key: string) => seriesColor(all.findIndex(slice => slice.key === key));
  const activeKey = active && shown.some(slice => slice.key === active) ? active : null;
  const weights = sliceWeights(shown, activeKey);
  const weightSum = weights.reduce((sum, weight) => sum + weight, 0);

  // Dilim içi etiket sığıyor mu; sığmayanlar çubuğun altındaki şeride taşar.
  const layout = shown.map((slice, at) => {
    const widthPx = (weights[at]! / weightSum) * barWidth;
    const text = `${slice.label} ${shareText(slice.value, total)}`;
    const left = weights.slice(0, at).reduce((sum, weight) => sum + weight, 0);
    return { slice, inside: barWidth > 0 && fitsInside(widthPx, textWidth(text)), center: ((left + weights[at]! / 2) / weightSum) * barWidth, text };
  });
  const outside = layout.filter(item => !item.inside);
  const outsideX = spreadLabels(outside.map(item => item.center), outside.map(item => textWidth(item.text, 6.5)), barWidth);

  const toggle = (key: string) => {
    const slice = all.find(item => item.key === key);
    if (!slice) return;
    if (!hidden.has(key) && shown.length <= 1) {
      setShake(key);
      window.clearTimeout(shakeTimer.current);
      shakeTimer.current = window.setTimeout(() => setShake(null), 400);
      setAnnounce("En az bir dilim açık kalmalı.");
      return;
    }
    const next = new Set(hidden);
    if (next.has(key)) next.delete(key); else next.add(key);
    setHidden(next);
    setAnnounce(`${slice.label} ${next.has(key) ? "kapatıldı" : "açıldı"}.`);
  };

  const keys = shown.map(slice => slice.key);
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const at = activeKey ? keys.indexOf(activeKey) : -1;
    const pick = (index: number) => {
      const key = keys[clamp(index, 0, keys.length - 1)];
      if (!key) return;
      setActive(key);
      const slice = shown.find(item => item.key === key)!;
      setAnnounce(`${slice.label}: ${shareText(slice.value, total)}, ${formatValue(slice.value)}`);
    };
    if (event.key === "ArrowRight" || event.key === "ArrowDown") { event.preventDefault(); pick(at + 1); }
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") { event.preventDefault(); pick(at < 0 ? keys.length - 1 : at - 1); }
    else if (event.key === "Home") { event.preventDefault(); pick(0); }
    else if (event.key === "End") { event.preventDefault(); pick(keys.length - 1); }
    else if ((event.key === "Enter" || event.key === " ") && activeKey) { event.preventDefault(); toggle(activeKey); }
    else if (event.key === "Escape") { setActive(null); setAnnounce(""); }
  };

  const reading = activeKey ? shown.find(slice => slice.key === activeKey) : null;
  const readingText = reading ? `${reading.label}: ${shareText(reading.value, total)} · ${formatValue(reading.value)}` : `Toplam · ${formatValue(total)}`;

  if (loading) return <figure className={styles.figure} aria-busy="true" aria-label={`${label} yükleniyor`}><div className={styles.skeleton} /></figure>;

  return <figure className={styles.figure} data-reduced={reduced || undefined} aria-labelledby={titleId}>
    <div className={styles.head}>
      <div className={styles.titles}>
        <figcaption id={titleId} className={styles.title}>{label}</figcaption>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
    {all.length === 0 ? <p className={styles.empty}>{emptyText}</p> : <>
      <p className={styles.reading} aria-hidden="true"><span key={readingText} className={styles.readingText}>{readingText}</span></p>
      <div ref={barRef} className={styles.bar} role="group" aria-roledescription="bölünmüş çubuk" aria-label={barSummary(shown)} tabIndex={0} onKeyDown={onKeyDown}
        onBlur={() => setActive(null)} onPointerLeave={event => { if (event.pointerType === "mouse") setActive(null); }}>
        {layout.map(({ slice, inside, text }, at) => <div key={slice.key} className={styles.slice} style={{ flexGrow: weights[at], background: colorOf(slice.key) }}
          data-active={activeKey === slice.key || undefined} data-dim={(activeKey && activeKey !== slice.key) || undefined}
          onPointerEnter={event => { if (event.pointerType === "mouse") setActive(slice.key); }}
          onPointerDown={event => { if (event.pointerType !== "mouse") setActive(current => current === slice.key ? null : slice.key); }}>
          {inside && <span className={styles.inside} aria-hidden="true">{text}</span>}
        </div>)}
      </div>
      {outside.length > 0 && <div className={styles.strip} style={{ height: STRIP_LINK + 24 }} aria-hidden="true">
        <svg className={styles.links} width="100%" height={STRIP_LINK} viewBox={`0 0 ${Math.max(barWidth, 1)} ${STRIP_LINK}`} preserveAspectRatio="none">
          {outside.map((item, at) => <path key={item.slice.key} className={styles.link} style={{ stroke: colorOf(item.slice.key) }} d={`M${item.center} 0C${item.center} ${STRIP_LINK / 2} ${outsideX[at]} ${STRIP_LINK / 2} ${outsideX[at]} ${STRIP_LINK}`} />)}
        </svg>
        {outside.map((item, at) => <span key={item.slice.key} className={styles.outside} style={{ left: outsideX[at] }}>{item.text}</span>)}
      </div>}
      <ul className={styles.legend}>
        {all.map(slice => {
          const closed = hidden.has(slice.key);
          return <li key={slice.key}><button type="button" className={styles.legendItem} aria-pressed={!closed} data-closed={closed || undefined} data-shake={shake === slice.key || undefined}
            aria-label={closed ? `${slice.label} (kapalı)` : `${slice.label} ${shareText(slice.value, total)}`} onClick={() => toggle(slice.key)}>
            <span className={styles.swatch} style={{ background: closed ? "transparent" : colorOf(slice.key) }} aria-hidden="true" />
            <span className={styles.legendName}>{slice.label}</span>
            <span className={styles.legendShare}>{closed ? "Kapalı" : shareText(slice.value, total)}</span>
          </button></li>;
        })}
      </ul>
    </>}
    <div className={styles.srOnly}><table>
      <caption>{label}</caption>
      <thead><tr><th scope="col">Dilim</th><th scope="col">Değer</th><th scope="col">Pay</th></tr></thead>
      <tbody>{all.map(slice => <tr key={slice.key}><th scope="row">{slice.label}</th><td>{formatValue(slice.value)}</td><td>{hidden.has(slice.key) ? "kapalı" : shareText(slice.value, total)}</td></tr>)}</tbody>
    </table></div>
    <p className={styles.srOnly} aria-live="polite" aria-atomic="true">{announce}</p>
  </figure>;
}

export default SplitBar;
