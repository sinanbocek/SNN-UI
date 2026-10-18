"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { Button } from "../button/button";
import { smoothLine } from "../lib/chart-format";
import { clamp, useElementWidth, useOnScreen, useReducedMotionSafe } from "../lib/viz-utils";
import SegmentedControl from "../segmented-control/segmented-control";
import { Skeleton } from "../skeleton/skeleton";
import { clockText, effectText, endAnnouncement, eventAnnouncement, niceTop, peakUntil, pointsUntil, ratioText, tickText, timeText, valueAtTime, valueText, type ReplayEvent, type ReplayKind, type ReplayPoint } from "./line-replay-format";
import styles from "./line-replay.module.css";

export type { ReplayEvent, ReplayKind, ReplayPoint };

/** Bir günün ya da olayın tek serisini oynat düğmesiyle soldan sağa çizerek ve kilit anları işaretleyerek anlatmak için kullanın; çok serili karşılaştırma için çizgi grafik, canlı akış için canlı akış grafiği daha doğrudur. */
export interface LineReplayProps {
  points: ReplayPoint[];
  /** Kıyas serisi (tamamen çizili, kesikli); aynı zaman aralığında. */
  comparison?: ReplayPoint[] | undefined;
  events?: ReplayEvent[] | undefined;
  title?: string | undefined;
  /** Alt satır: neyin ölçüldüğü ve ne zaman (hazır metin; gün adı ve tarih için ABACUS `date`). */
  subtitle?: string | undefined;
  /** Ana çizginin ve kıyasın adı (açıklama). */
  seriesLabel?: string | undefined;
  comparisonLabel?: string | undefined;
  kind?: ReplayKind | undefined;
  unit?: string | undefined;
  /** 1× hızda tüm tekrarın süresi (saniye). */
  replaySeconds?: number | undefined;
  /** Bileşen %40 görününce kendiliğinden oynar ("hareketi azalt" açıkken oynamaz). */
  autoPlay?: boolean | undefined;
  loading?: boolean | undefined;
  emptyText?: string | undefined;
}

const HEIGHT = 240, PAD_TOP = 36, PAD_BOTTOM = 26, PAD_LEFT = 8, PAD_RIGHT = 44;
const SPEEDS = [{ value: "0.5", label: "0,5×" }, { value: "1", label: "1×" }, { value: "2", label: "2×" }, { value: "4", label: "4×" }];

export function LineReplay({ points, comparison, events = [], title = "Gün tekrarı", subtitle, seriesLabel = "Bugün", comparisonLabel = "Kıyas", kind = "count", unit = "", replaySeconds = 12, autoPlay = false, loading = false, emptyText = "Gösterilecek veri yok." }: LineReplayProps) {
  const reduced = useReducedMotionSafe();
  const [box, width] = useElementWidth<HTMLDivElement>();
  const [visibleRef, onScreen] = useOnScreen<HTMLElement>();
  const first = points[0], last = points[points.length - 1];
  const start = first?.t ?? 0, end = last?.t ?? 1, span = Math.max(end - start, 1);
  const [cursor, setCursor] = useState(end);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState("1");
  const [announce, setAnnounce] = useState("");
  const [current, setCurrent] = useState<number | null>(null);
  const cursorRef = useRef(cursor);
  cursorRef.current = cursor;
  const passed = useRef(new Set<number>());
  const started = useRef(false);

  const sortedEvents = useMemo(() => [...events].sort((a, b) => a.t - b.t), [events]);
  const top = useMemo(() => niceTop(Math.max(...points.map(point => point.value), ...(comparison ?? []).map(point => point.value), 1)), [points, comparison]);

  // Oynatma döngüsü: tek zaman değeri ilerler; kilit an geçilince duyurulur ve satır yanar.
  useEffect(() => {
    if (!playing || !onScreen) return;
    let raf = 0, previous = performance.now();
    const step = (now: number) => {
      const dt = Math.min(64, now - previous);
      previous = now;
      const from = cursorRef.current;
      const next = Math.min(end, from + (dt / (replaySeconds * 1000)) * span * Number(speed));
      for (const event of sortedEvents) if (event.t > from && event.t <= next && !passed.current.has(event.t)) { passed.current.add(event.t); setCurrent(event.t); setAnnounce(eventAnnouncement(event)); }
      cursorRef.current = next;
      setCursor(next);
      if (next >= end) { setPlaying(false); setAnnounce(endAnnouncement(kind, peakUntil(points, end))); return; }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [end, kind, onScreen, playing, points, replaySeconds, sortedEvents, span, speed]);

  // Görününce bir kez kendiliğinden başlar.
  useEffect(() => {
    if (started.current || !autoPlay || reduced || !onScreen || points.length < 2) return;
    started.current = true;
    restart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, onScreen, points.length, reduced]);

  function restart() { passed.current = new Set(); setCurrent(null); cursorRef.current = start; setCursor(start); setPlaying(true); }
  const toggle = () => {
    if (playing) { setPlaying(false); setAnnounce(`Duraklatıldı. ${clockText(cursor)}`); return; }
    if (cursor >= end) { restart(); return; }
    setPlaying(true);
  };
  const jumpTo = (t: number, resume = playing) => {
    const next = clamp(t, start, end);
    cursorRef.current = next; setCursor(next);
    // Atlayınca geçilmiş anlar yeniden "geçildi" bildirimi yapmaz.
    passed.current = new Set(sortedEvents.filter(event => event.t <= next).map(event => event.t));
    setCurrent(sortedEvents.filter(event => event.t <= next).pop()?.t ?? null);
    setPlaying(resume && next < end);
    if (!resume) setAnnounce(`${clockText(next)}, ${valueText(kind, valueAtTime(points, next))}`);
  };

  const onGroupKey = (event: KeyboardEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest("button, input, [role=radio]")) { if (event.code === "KeyK" && !(target instanceof HTMLInputElement)) { event.preventDefault(); toggle(); } return; }
    if (event.key === " " || event.key === "Enter" || event.code === "KeyK") { event.preventDefault(); toggle(); }
  };
  const onSliderKey = (event: KeyboardEvent<HTMLInputElement>) => {
    const index = Math.max(points.map(point => point.t <= cursor).lastIndexOf(true), 0);
    const hour = 3600000;
    let next: number | null = null;
    if (event.key === "ArrowRight") next = event.shiftKey ? cursor + hour : points[Math.min(index + 1, points.length - 1)]!.t;
    else if (event.key === "ArrowLeft") next = event.shiftKey ? cursor - hour : points[Math.max(index - (points[index]!.t === cursor ? 1 : 0), 0)]!.t;
    else if (event.key === "PageUp") next = cursor + hour;
    else if (event.key === "PageDown") next = cursor - hour;
    else if (event.key === "Home") next = start;
    else if (event.key === "End") next = end;
    if (next === null) return;
    event.preventDefault();
    setPlaying(false);
    jumpTo(next, false);
  };

  if (loading) return <section className={styles.root} aria-busy="true"><Skeleton label="Tekrar yükleniyor" lines={6} /></section>;
  if (points.length < 2) return <section className={styles.root}><p className={styles.empty}>{emptyText}</p></section>;

  const plotWidth = Math.max(width - PAD_LEFT - PAD_RIGHT, 1), plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const xOf = (t: number) => PAD_LEFT + ((t - start) / span) * plotWidth;
  const yOf = (value: number) => PAD_TOP + (1 - value / top) * plotHeight;
  const drawn = pointsUntil(points, cursor).map(point => ({ x: xOf(point.t), y: yOf(point.value) }));
  const line = smoothLine(drawn);
  const area = drawn.length > 1 ? `${line}L${drawn[drawn.length - 1]!.x} ${yOf(0)}L${drawn[0]!.x} ${yOf(0)}Z` : "";
  const compareLine = comparison?.length ? smoothLine(comparison.map(point => ({ x: xOf(point.t), y: yOf(point.value) }))) : "";
  const nowValue = valueAtTime(points, cursor), baseValue = comparison?.length ? valueAtTime(comparison, cursor) : 0;
  const ratio = comparison?.length ? ratioText(nowValue, baseValue) : null;
  const peak = peakUntil(points, cursor);
  const tickEvery = width < 560 ? 6 : 3;
  const hours = Array.from({ length: Math.floor(span / 3600000) + 1 }, (_, at) => start + at * 3600000).filter((_, at) => at % tickEvery === 0);
  const passedEvents = sortedEvents.filter(event => event.t <= cursor);
  const latest = passedEvents[passedEvents.length - 1];
  const suffix = unit ? ` ${unit}` : "";

  return <section ref={visibleRef} className={styles.root} data-reduced={reduced || undefined} aria-label={title} onKeyDown={onGroupKey}>
    <header className={styles.header}>
      <div><h3 className={styles.title}>{title}</h3>{subtitle && <p className={styles.subtitle}>{subtitle}</p>}</div>
      <ul className={styles.legend} aria-hidden="true"><li><i className={styles.keyLine} />{seriesLabel}</li>{comparison?.length ? <li><i className={styles.keyCompare} />{comparisonLabel}</li> : null}</ul>
    </header>

    <dl className={styles.reading}>
      <div><dt>Saat</dt><dd>{timeText(cursor)}</dd></div>
      <div><dt>Değer</dt><dd>{valueText(kind, nowValue)}{suffix}</dd></div>
      {ratio && <div><dt>Kıyasa göre</dt><dd>{ratio}</dd></div>}
      <div><dt>Şu ana kadarki tepe</dt><dd>{peak ? `${valueText(kind, peak.value)}` : "—"}{peak && <small> {timeText(peak.t)}</small>}</dd></div>
    </dl>

    <div className={styles.layout}>
      <div className={styles.main}>
        <div ref={box} className={styles.chart}>
          <svg className={styles.svg} width={Math.max(width, 1)} height={HEIGHT} aria-hidden="true">
            {[0, .25, .5, .75, 1].map(share => <g key={share}><line className={styles.grid} x1={PAD_LEFT} x2={PAD_LEFT + plotWidth} y1={yOf(top * share)} y2={yOf(top * share)} /><text className={styles.axis} x={PAD_LEFT + plotWidth + 6} y={yOf(top * share) + 3}>{tickText(kind, top * share)}</text></g>)}
            {hours.map(t => <text key={t} className={styles.axis} x={xOf(t)} y={HEIGHT - 8} textAnchor="middle" data-hidden={Math.abs(xOf(t) - xOf(cursor)) < 28 || undefined}>{timeText(t)}</text>)}
            {compareLine && <path className={styles.compare} d={compareLine} />}
            {area && <path className={styles.area} d={area} />}
            {line && <path className={styles.line} d={line} />}
            {passedEvents.map(event => { const issue = event.kind === "issue"; return <g key={event.t} className={styles.marker} data-issue={issue || undefined} data-current={current === event.t || undefined}>
              <line x1={xOf(event.t)} x2={xOf(event.t)} y1={PAD_TOP - 10} y2={yOf(0)} />
              {issue ? <path d={`M${xOf(event.t)} ${yOf(valueAtTime(points, event.t)) - 7}l6 11h-12z`} /> : <circle cx={xOf(event.t)} cy={yOf(valueAtTime(points, event.t))} r={4.5} />}
            </g>; })}
            <line className={styles.cursor} x1={xOf(cursor)} x2={xOf(cursor)} y1={PAD_TOP - 10} y2={yOf(0)} />
            <circle className={styles.head} cx={xOf(cursor)} cy={yOf(nowValue)} r={4} />
            <text className={styles.headLabel} x={clamp(xOf(cursor), 30, PAD_LEFT + plotWidth)} y={yOf(nowValue) - 10} textAnchor="middle">{valueText(kind, nowValue)}</text>
          </svg>
          {latest && <div key={latest.t} className={styles.callout} data-issue={latest.kind === "issue" || undefined} style={{ left: clamp(xOf(latest.t), 90, Math.max(90, width - 90)) }} role="presentation"><b>{latest.kind === "issue" ? "⚠ " : ""}{latest.title}</b><span>{timeText(latest.t)}</span></div>}
        </div>

        <div className={styles.controls}>
          <Button size="sm" variant="secondary" onClick={toggle} aria-label={playing ? "Tekrarı duraklat" : cursor >= end ? "Baştan oynat" : "Tekrarı oynat"}>
            <span aria-hidden="true">{playing ? "❚❚" : cursor >= end ? "↺" : "▶"}</span> {playing ? "Duraklat" : cursor >= end ? "Baştan oynat" : "Oynat"}
          </Button>
          <div className={styles.sliderWrap}>
            <input className={styles.slider} type="range" min={start} max={end} step={60000} value={cursor} aria-label="Tekrar zamanı" aria-valuetext={`${timeText(cursor)}, ${valueText(kind, nowValue)}${suffix}`}
              onChange={(event: ChangeEvent<HTMLInputElement>) => { setPlaying(false); jumpTo(Number(event.target.value), false); }} onKeyDown={onSliderKey} />
            <span className={styles.ticks} aria-hidden="true">{sortedEvents.map(event => <i key={event.t} data-issue={event.kind === "issue" || undefined} style={{ left: `${((event.t - start) / span) * 100}%` }} />)}</span>
          </div>
          <SegmentedControl label="Hız" value={speed} onValueChange={setSpeed} options={SPEEDS} />
        </div>
      </div>

      {sortedEvents.length > 0 && <aside className={styles.moments} aria-label="Kilit anlar">
        <h4>Kilit anlar</h4>
        <ol>
          {sortedEvents.map(event => {
            const isPassed = event.t <= cursor;
            return <li key={event.t}><button type="button" className={styles.moment} data-lit={isPassed || undefined} data-issue={event.kind === "issue" || undefined} aria-current={current === event.t ? "true" : undefined} onClick={() => jumpTo(event.t)}>
              <span className={styles.momentIcon} aria-hidden="true">{event.kind === "issue" ? "⚠" : "●"}</span>
              <span className={styles.momentText}><b>{event.title}</b><small>{timeText(event.t)}{event.detail ? ` · ${event.detail}` : ""}</small>
                {isPassed && <em className={styles.effect}>{effectText(kind, event, points)}</em>}</span>
            </button></li>;
          })}
        </ol>
      </aside>}
    </div>
    <p className={styles.srOnly} aria-live="polite" aria-atomic="true">{announce}</p>
  </section>;
}

export default LineReplay;
