"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatedCounter } from "../animated-counter/animated-counter";
import { Button } from "../button/button";
import { useReducedMotionSafe } from "../lib/viz-utils";
import { SankeyFlow } from "../sankey-flow/sankey-flow";
import SegmentedControl from "../segmented-control/segmented-control";
import { Skeleton } from "../skeleton/skeleton";
import { Switch } from "../switch/switch";
import { channelAnnouncement, countText, journeyFacts, nodeSummary, shareText, topDrops, type JourneyData } from "./journey-flow-format";
import styles from "./journey-flow.module.css";

export type { JourneyData };
export interface JourneyChannel { value: string; label: string }

/** Kullanıcıların bir sürecin aşamaları boyunca nereye gittiğini (devam edenler ve düşenler ayrı kollar), kanala göre ve hazır yan panelle görmek için kullanın; doğrusal ve dallanmayan süreç için huni grafiği, elde tutma için kohort tablosu daha doğrudur. */
export interface JourneyFlowProps {
  /** Seçili kanalın akışı. Düşen kolları `muted` düğümle verin; yoksa null (\"Bu kanal için veri yok\"). */
  data: JourneyData | null;
  channels: JourneyChannel[];
  channel: string;
  onChannelChange: (value: string) => void;
  title?: string | undefined;
  /** Alt cümle: örneğin "Ağustos ayında ziyaret, ilk oturumdan plana kadar izlendi" (ABACUS `date.monthName`). */
  subtitle?: string | undefined;
  /** Başlıktaki büyük toplamın, canlı bölgedeki ve sayfadaki adı: "ziyaret". */
  totalLabel?: string | undefined;
  /** Son aşamanın adı (canlı bölge için): "ücretli plan". */
  finalLabel?: string | undefined;
  status?: "ready" | "loading" | "error" | undefined;
  onRetry?: (() => void) | undefined;
}

export function JourneyFlow({ data, channels, channel, onChannelChange, title = "Kullanıcı yolculuğu", subtitle, totalLabel = "ziyaret", finalLabel = "ücretli plan", status = "ready", onRetry }: JourneyFlowProps) {
  const reduced = useReducedMotionSafe();
  const panelId = useId();
  const [selected, setSelected] = useState<string | null>(null);
  const [table, setTable] = useState(false);
  const [announce, setAnnounce] = useState("");
  const facts = useMemo(() => data ? journeyFacts(data) : null, [data]);
  const summary = data && facts && selected ? nodeSummary(data, facts, selected) : null;
  const drops = useMemo(() => data && facts ? topDrops(data, facts) : [], [data, facts]);

  // Kanal değişince "{n} ziyaret, {n} ücretli plan" duyurulur; seçili adım yeni kanalda yoksa kalkar.
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (facts) setAnnounce(channelAnnouncement(facts, totalLabel, finalLabel));
    setSelected(current => current && facts?.nodes.has(current) ? current : null);
  }, [channel]); // eslint-disable-line react-hooks/exhaustive-deps

  const labelOf = (id: string) => facts?.nodes.get(id)?.label ?? id;

  return <section className={styles.root} data-reduced={reduced || undefined} aria-label={title}>
    <header className={styles.header}>
      <div className={styles.titles}>
        <h3 className={styles.title}>{title}</h3>
        {facts && <p className={styles.total} aria-label={`${countText(facts.total)} ${totalLabel}`}><AnimatedCounter value={facts.total} /></p>}
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      <SegmentedControl label="Kanal" value={channel} onValueChange={onChannelChange} options={channels} />
    </header>

    {status === "loading" && <Skeleton label="Yolculuk yükleniyor" lines={6} />}
    {status === "error" && <div className={styles.error} role="alert"><span>Yüklenemedi.</span>{onRetry && <Button size="sm" variant="secondary" onClick={onRetry}>Yeniden dene</Button>}</div>}
    {status === "ready" && !data && <p className={styles.empty}>Bu kanal için veri yok.</p>}

    {status === "ready" && data && facts && <>
      <div className={styles.body}>
        <div className={styles.diagram}>
          <SankeyFlow bare label={title} nodes={data.nodes} links={data.links} columnLabels={data.stages} selectedId={selected} onSelectedChange={setSelected} />
        </div>
        <aside className={styles.panel} id={panelId} aria-label="Seçili adım">
          {!summary ? <p className={styles.hint}>Nereden geldiğini ve nereye gittiğini görmek için bir adım seçin.</p> : <>
            <h4 className={styles.panelTitle}>{summary.label}</h4>
            <p className={styles.panelValue}><AnimatedCounter value={summary.value} /></p>
            <p className={styles.panelNote}>İlk aşamanın payı {summary.shareOfTotal}</p>
            {summary.incoming.length > 0 && <><h5>Nereden geldi</h5><ul>{summary.incoming.map(row => <li key={row.id}><span>{row.label}</span><b>{countText(row.value)}</b><small>{row.share}</small></li>)}</ul></>}
            {summary.outgoing.length > 0 && <><h5>Nereye gitti</h5><ul>{summary.outgoing.map(row => <li key={row.id} data-drop={row.drop || undefined}><span>{row.drop ? `↓ ${row.label}` : row.label}</span><b>{countText(row.value)}</b><small>{row.share}</small></li>)}</ul></>}
          </>}
          {drops.length > 0 && <><h5 className={styles.dropsTitle}>En büyük düşüşler</h5><ul className={styles.drops}>{drops.map((row, at) => <li key={at}><span>↓ {row.from}</span><b>{countText(row.value)}</b><small>{row.share}</small></li>)}</ul></>}
        </aside>
      </div>

      <div className={styles.tableToggle}>
        <Switch label="Akış tablosu" checked={table} onCheckedChange={setTable} aria-expanded={table} aria-controls={`${panelId}-table`} />
      </div>
      {table && <table id={`${panelId}-table`} className={styles.table}>
        <caption className={styles.srOnly}>{title}, akış tablosu</caption>
        <thead><tr><th scope="col">Kaynak</th><th scope="col">Hedef</th><th scope="col">Kullanıcı</th><th scope="col">Kaynağın payı</th></tr></thead>
        <tbody>{data.links.filter(link => link.value > 0).map(link => <tr key={`${link.source}>${link.target}`}><th scope="row">{labelOf(link.source)}</th><td>{labelOf(link.target)}</td><td>{countText(link.value)}</td><td>{shareText(link.value, facts.nodes.get(link.source)?.value ?? 0)}</td></tr>)}</tbody>
      </table>}
    </>}
    <p className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">{announce}</p>
  </section>;
}

export default JourneyFlow;
