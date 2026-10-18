"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { money } from "@snn/abacus-core";
import { Check, CreditCard, Database, ListChecks, MessageSquare, Minus, Split, Users } from "lucide-react";
import { Button } from "../button/button";
import { motionTokens } from "../lib/motion-tokens";
import { ActionLink } from "./hero-content";
import type { HeroAction } from "./hero-content";
import { ease, heroGroup, heroRise, useHeroReducedMotion } from "./hero-motion";
import shell from "./hero-section.module.css";
import styles from "./hero-relay.module.css";

type NodeId = "trigger" | "lookup" | "branch" | "slack" | "linear" | "warehouse";
type Status = "idle" | "running" | "done" | "skipped";

/** Örnek olaylar. Her biri aynı iş akışını çalıştırır; dal, hangi eylemlere ulaşacağını belirler. */
const EVENTS = [
  { customer: "Kuzey Lojistik", amount: "₺48.000", plan: "Kurumsal, 212 koltuk", routed: true, issue: "KAR-482", total: 412, ms: { lookup: 118, branch: 2, slack: 164, linear: 231, warehouse: 58 } },
  { customer: "Ege Tekstil", amount: "₺2.400", plan: "Ekip, 9 koltuk", routed: false, issue: "", total: 171, ms: { lookup: 96, branch: 1, slack: 0, linear: 0, warehouse: 61 } },
  { customer: "Toros Enerji", amount: "₺126.000", plan: "Kurumsal, 540 koltuk", routed: true, issue: "KAR-483", total: 436, ms: { lookup: 131, branch: 2, slack: 149, linear: 244, warehouse: 66 } },
] as const;
type RelayEvent = (typeof EVENTS)[number];

/**
 * Bir çalıştırma, evreler halinde. Tek sayılı evreler bir adımı çalıştırır, çift sayılı evreler veriyi adımdan çıkan kenarlar boyunca taşır;
 * son evre, bitmiş çalıştırmayı sonraki olay gelmeden ekranda tutar. Süreler milisaniyedir.
 */
const PHASES = [900, 420, 380, 640, 380, 360, 440, 760, 2800];
const DONE = PHASES.length - 1;
const STEPS: Record<NodeId, [start: number, end: number]> = { trigger: [1, 2], lookup: [3, 4], branch: [5, 6], slack: [7, 8], linear: [7, 8], warehouse: [7, 8] };
const formatMoney = (value: number) => money.formatMajor(value, { currency: "TRY", digits: 0 });
const ACTIONS = ["slack", "linear", "warehouse"] as const;

function statusOf(id: NodeId, phase: number, event: RelayEvent): Status {
  const [start, end] = STEPS[id];
  if ((id === "slack" || id === "linear") && !event.routed && phase >= 6) return "skipped";
  return phase < start ? "idle" : phase < end ? "running" : "done";
}

/** Grafik sabit boyutta çizilir ve sütununa sığacak kadar ölçeklenir, ekran görüntüsü gibi; böylece çalıştırma sırasında yeniden akmaz. */
type Box = { x: number; y: number; w: number; h: number };
const LAYOUTS = {
  wide: {
    width: 640, height: 524, summary: 480,
    nodes: { trigger: { x: 170, y: 0, w: 300, h: 60 }, lookup: { x: 170, y: 112, w: 300, h: 60 }, branch: { x: 170, y: 224, w: 300, h: 60 }, slack: { x: 0, y: 356, w: 200, h: 84 }, linear: { x: 220, y: 356, w: 200, h: 84 }, warehouse: { x: 440, y: 356, w: 200, h: 84 } } as Record<NodeId, Box>,
  },
  narrow: {
    width: 344, height: 316, summary: 0,
    nodes: { trigger: { x: 0, y: 0, w: 344, h: 52 }, lookup: { x: 0, y: 78, w: 344, h: 52 }, branch: { x: 0, y: 156, w: 344, h: 52 }, slack: { x: 0, y: 244, w: 108, h: 72 }, linear: { x: 118, y: 244, w: 108, h: 72 }, warehouse: { x: 236, y: 244, w: 108, h: 72 } } as Record<NodeId, Box>,
  },
};
type Layout = (typeof LAYOUTS)[keyof typeof LAYOUTS];

const EDGES: { from: NodeId; to: NodeId; phase: number }[] = [
  { from: "trigger", to: "lookup", phase: 2 },
  { from: "lookup", to: "branch", phase: 4 },
  { from: "branch", to: "slack", phase: 6 },
  { from: "branch", to: "linear", phase: 6 },
  { from: "branch", to: "warehouse", phase: 6 },
];

function edgePath(layout: Layout, from: NodeId, to: NodeId) {
  const a = layout.nodes[from], b = layout.nodes[to];
  const x1 = a.x + a.w / 2, y1 = a.y + a.h, x2 = b.x + b.w / 2, y2 = b.y;
  const mid = (y2 - y1) / 2;
  return `M ${x1} ${y1} C ${x1} ${y1 + mid} ${x2} ${y2 - mid} ${x2} ${y2}`;
}

const RESULTS: Record<(typeof ACTIONS)[number], (event: RelayEvent) => string> = {
  slack: event => `${event.ms.slack} ms içinde gönderildi`,
  linear: event => `${event.issue}, ${event.ms.linear} ms`,
  warehouse: event => `${event.ms.warehouse} ms içinde kaydedildi`,
};


export interface HeroRelayProps {
  primaryAction?: HeroAction | undefined;
  secondaryAction?: HeroAction | undefined;
  animateIn?: boolean | undefined;
  className?: string | undefined;
}

/**
 * Bölünmüş hero, tam ekran: yazının yanında noktalı bir tuval üzerinde canlı bir iş akışı grafiği. Örnek ödeme olayları kendiliğinden
 * gelir ve iş akışını düğüm düğüm çalıştırır; veri her kenar boyunca çizilir, dal hangi eylemlerin çalışacağına karar verir ve
 * her adım süresini bildirir. "Deneme olayı gönder" sıradaki örneği hemen çalıştırır. Çalıştırma ekran dışında durur; azaltılmış
 * harekette her olay, oynamadan bitmiş çalıştırmasını gösterir.
 */
export function HeroRelay({ primaryAction = { label: "Kurmaya başla", doneLabel: "Çalışma alanı oluşturuldu" }, secondaryAction = { label: "Belgeleri oku", doneLabel: "Belgeler açılıyor" }, animateIn = true, className }: HeroRelayProps) {
  const item = heroRise;
  const reduced = useHeroReducedMotion();
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<keyof typeof LAYOUTS>("wide");
  const [scale, setScale] = useState(1);
  const [run, setRun] = useState({ index: 0, count: 2418, phase: 0 });
  const [visible, setVisible] = useState(false);

  useLayoutEffect(() => {
    const node = stage.current;
    if (!node) return;
    const measure = () => {
      const width = node.clientWidth;
      const next = width < 520 ? "narrow" : "wide";
      setMode(next);
      setScale(Math.min(1, width / LAYOUTS[next].width));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Çalıştırma yalnız hero ekrandayken ve sekme görünürken oynar.
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    let onScreen = false;
    const sync = () => setVisible(onScreen && document.visibilityState === "visible");
    const io = new IntersectionObserver(([entry]) => { if (!entry) return; onScreen = entry.isIntersecting; sync(); });
    io.observe(node);
    document.addEventListener("visibilitychange", sync);
    return () => { io.disconnect(); document.removeEventListener("visibilitychange", sync); };
  }, []);

  useEffect(() => {
    if (reduced || !visible) return;
    const timer = window.setTimeout(() => setRun(current => current.phase < DONE
      ? { ...current, phase: current.phase + 1 }
      : { index: (current.index + 1) % EVENTS.length, count: current.count + 1, phase: 0 }), PHASES[run.phase]);
    return () => window.clearTimeout(timer);
  }, [run.phase, run.index, reduced, visible]);

  const sendTest = () => setRun(current => ({ index: (current.index + 1) % EVENTS.length, count: current.count + 1, phase: 1 }));

  const layout = LAYOUTS[mode];
  const event = EVENTS[run.index]!;
  // Azaltılmış hareket: her olay bitmiş çalıştırmasıyla gösterilir; düğme sıradakine hemen geçer.
  const phase = reduced ? DONE : run.phase;
  const status = (id: NodeId) => statusOf(id, phase, event);
  const narrow = mode === "narrow";

  // Azaltılmış hareket: Motion her dönüşümü atlar (yükselme, eğim girişi); opaklık yine kısaca solar.
  return <MotionConfig reducedMotion="user"><section ref={root} className={[shell.hero, shell.screen, styles.hero, className].filter(Boolean).join(" ")}>
    <div className={styles.inner}>
      <motion.div className={styles.copy} variants={heroGroup} initial={animateIn ? "hidden" : false} animate="shown">
        <motion.h1 variants={item} className={[shell.title, styles.title].join(" ")}>Her olay, milisaniyeler içinde işlenir</motion.h1>
        <motion.p variants={item} className={[shell.description, styles.description].join(" ")}>Akış; ödeme sistemi, kod deposu ve veritabanından gelen web kancalarını yeniden denemeli, dallı ve her çalıştırmanın izini tutan tipli iş akışlarına çevirir. Adımları TypeScript ile yazın ya da tuval üzerinde bağlayın.</motion.p>
        <motion.div variants={item} className={styles.actions}>
          <ActionLink action={primaryAction} kind="primary" />
          <ActionLink action={secondaryAction} kind="secondary" />
        </motion.div>
        <motion.p variants={item} className={styles.fine}>Ayda 10.000 çalıştırmaya kadar ücretsiz. Kart gerekmez.</motion.p>
      </motion.div>

      <motion.div
        className={styles.canvas}
        initial={animateIn ? { opacity: 0, y: 24 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: ease.enter, delay: .28 }}
      >
        <div className={styles.toolbar}>
          <span className={styles.file}><i className={styles.live} data-on={visible || reduced || undefined} aria-hidden="true" />fatura-odendi.ts</span>
          <Button variant="secondary" size="sm" onClick={sendTest}>Deneme olayı gönder</Button>
        </div>
        <div ref={stage} className={styles.stage} style={{ height: layout.height * scale }}>
          <div className={styles.graph} role="group" aria-label={`Akış iş akışı, ${event.customer} için örnek çalıştırma`} style={{ width: layout.width, height: layout.height, transform: `scale(${scale})` }}>
            <svg className={styles.edges} width={layout.width} height={layout.height} viewBox={`0 0 ${layout.width} ${layout.height}`} aria-hidden="true">
              {EDGES.map(edge => {
                const d = edgePath(layout, edge.from, edge.to);
                const skipped = status(edge.to) === "skipped";
                const lit = phase >= edge.phase && !skipped;
                return <g key={`${edge.from}-${edge.to}`}>
                  <path d={d} className={styles.wire} data-skipped={skipped || undefined} />
                  <motion.path
                    d={d}
                    className={styles.flow}
                    initial={false}
                    animate={{ pathLength: lit ? 1 : 0, opacity: lit ? 1 : 0 }}
                    transition={lit && !reduced ? { pathLength: { duration: PHASES[edge.phase]! / 1000, ease: ease.inOut }, opacity: { duration: .08 } } : { duration: 0 }}
                  />
                </g>;
              })}
            </svg>

            <RelayNode box={layout.nodes.trigger} status={status("trigger")} icon={<CreditCard size={16} strokeWidth={1.75} className={styles.glyph} aria-hidden="true" />} title="Fatura ödendi" sub={`${event.customer}, ${event.amount}`} />
            <RelayNode box={layout.nodes.lookup} status={status("lookup")} icon={<Users size={16} strokeWidth={1.75} className={styles.glyph} aria-hidden="true" />} title="CRM'de hesabı bul" sub={status("lookup") === "done" ? event.plan : "Plan, koltuk ve sahip"} meta={`${event.ms.lookup} ms`} />
            <RelayNode box={layout.nodes.branch} status={status("branch")} icon={<Split size={17} strokeWidth={1.75} className={styles.glyph} aria-hidden="true" />} title={`Tutar ${formatMoney(10_000)} üstünde`} sub={status("branch") === "done" ? event.routed ? "Evet, ekibi uyar" : "Hayır, yalnız kaydet" : "Koşul"} meta={`${event.ms.branch} ms`} />
            {ACTIONS.map(id => {
              const s = status(id);
              const copy = {
                slack: { icon: <MessageSquare size={16} strokeWidth={1.75} className={styles.glyph} aria-hidden="true" />, title: narrow ? "Sohbet" : "#gelir kanalına yaz", waiting: "Sohbet" },
                linear: { icon: <ListChecks size={16} strokeWidth={1.75} className={styles.glyph} aria-hidden="true" />, title: narrow ? "Görev" : "Karşılama görevi oluştur", waiting: "Karşılama ekibi" },
                warehouse: { icon: <Database size={16} strokeWidth={1.75} className={styles.glyph} aria-hidden="true" />, title: narrow ? "Ambar" : "Veri ambarına kaydet", waiting: "Veritabanı" },
              }[id];
              const sub = s === "skipped" ? "Atlandı" : s === "done" ? narrow ? `${event.ms[id]} ms` : RESULTS[id](event) : s === "running" ? "Çalışıyor" : narrow ? "Bekliyor" : copy.waiting;
              return <RelayNode key={id} box={layout.nodes[id]} compact status={s} icon={copy.icon} title={copy.title} sub={sub} />;
            })}

            {!narrow && <div className={styles.summary} style={{ top: layout.summary, width: layout.width }}>
              <span className={styles.event}><code>invoice.paid</code><span>Çalıştırma <span className={styles.num}>{money.fmtDecimalGrouped(run.count, 0)}</span></span></span>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={phase === DONE ? `done-${run.count}` : phase === 0 ? "waiting" : "running"}
                  className={styles.result}
                  data-done={phase === DONE || undefined}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: motionTokens.duration.fast, ease: ease.standard }}
                >
                  {phase === DONE ? <><Check size={14} strokeWidth={2} aria-hidden="true" /><span><span className={styles.num}>{event.total} ms</span> içinde tamamlandı</span></> : phase === 0 ? "Sonraki olay bekleniyor" : <><i className={styles.spinner} aria-hidden="true" />Çalışıyor</>}
                </motion.span>
              </AnimatePresence>
            </div>}
          </div>
        </div>
      </motion.div>
    </div>
  </section></MotionConfig>;
}

function RelayNode({ box, status, icon, title, sub, meta, compact = false }: { box: Box; status: Status; icon: ReactNode; title: string; sub: string; meta?: string | undefined; compact?: boolean | undefined }) {
  return <div className={styles.node} data-status={status} data-compact={compact || undefined} style={{ left: box.x, top: box.y, width: box.w, height: box.h }}>
    <span className={styles.icon}>{icon}</span>
    <span className={styles.text}>
      <strong>{title}</strong>
      <small>{sub}</small>
    </span>
    <span className={styles.state}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={status}
          className={styles.stateInner}
          initial={{ opacity: 0, scale: .6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: .6 }}
          transition={motionTokens.spring.snappy}
        >
          {status === "running" ? <i className={styles.spinner} role="img" aria-label="Çalışıyor" />
            : status === "done" ? <>{meta && <span className={styles.meta}>{meta}</span>}<Check size={14} strokeWidth={2} className={styles.check} role="img" aria-label="Bitti" /></>
            : status === "skipped" ? <Minus size={14} strokeWidth={2} className={styles.skip} role="img" aria-label="Atlandı" />
            : <i className={styles.pending} role="img" aria-label="Bekliyor" />}
        </motion.span>
      </AnimatePresence>
    </span>
  </div>;
}

export default HeroRelay;
