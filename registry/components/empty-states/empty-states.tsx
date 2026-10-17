"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import { motionTokens } from "../lib/motion-tokens";
import { Button } from "../button/button";
import { FRAMES, KINDS, VIEW, shapePath } from "./empty-states-art";
import type { Frame, Phase, SceneId } from "./empty-states-art";
import styles from "./empty-states.module.css";

/**
 * Dört boş durum için tek ürün çizimi. Sekmeler bir durum seçer; çizimdeki her şekil yeni konumuna, boyutuna, köşe yarıçapına,
 * dönüşüne ve rengine yayla gider, ana hatlar nokta nokta biçim değiştirir, çizgi vurguları biraz sonra çizilir.
 * Her ana eylem yerel ve görünür bir şey yapar: süzgeçler temizlenip sonuçlara döner, yeniden deneme kısa beklemeyle bağlanır,
 * posta denetimi onay işaretini yeniden çizer, kayıp sayfa arşivde bulunur. Hiçbir şey sunucuyla konuşmaz.
 */

type View = { scene: SceneId; phase: Phase; from: Phase };
type Copy = { title: string; line: string; action: string };

const SCENES: { id: SceneId; tab: string }[] = [
  { id: "search", tab: "Sonuç yok" },
  { id: "offline", tab: "Bağlantı yok" },
  { id: "inbox", tab: "Hepsi tamam" },
  { id: "map", tab: "Bulunamadı" },
];

const COPY: Record<SceneId, { idle: Copy; done: Copy; loading: string; wait: number }> = {
  search: {
    idle: { title: "“3. çeyrek yol haritası” için sonuç yok", line: "İki süzgeç açık: sahibi Elif Kaya, durumu arşivlenmiş.", action: "Süzgeçleri temizle" },
    done: { title: "“3. çeyrek yol haritası” için 12 sonuç", line: "Süzgeçler temizlendi. Her sahip ve durumdan eşleşmeler gösteriliyor.", action: "Süzgeçleri geri getir" },
    loading: "", wait: 0,
  },
  offline: {
    idle: { title: "Bağlantı kesildi", line: "Değişiklikler bu cihaza kaydedilir, bağlantı gelince eşitlenir.", action: "Yeniden dene" },
    done: { title: "Bağlantı yeniden kuruldu", line: "Üç değişiklik az önce Kuzeyrüzgârı çalışma alanına eşitlendi.", action: "Bağlantıyı kes" },
    loading: "sync.kuzeyruzgari.example adresine ulaşılıyor…", wait: 1400,
  },
  inbox: {
    idle: { title: "Hepsi tamam", line: "Gelen kutusundaki bütün iletileri okudunuz. Yeni postalar önce buraya düşer.", action: "Postayı denetle" },
    done: { title: "Hâlâ hepsi tamam", line: "Az önce denetlendi. Bu sabah 08.30'dan beri yeni bir şey yok.", action: "Yeniden denetle" },
    loading: "Yeni posta denetleniyor…", wait: 1100,
  },
  map: {
    idle: { title: "Sayfa bulunamadı", line: "/projeler/atlas-2023 bağlantısı bozuk ya da sayfa taşınmış.", action: "Sayfayı bul" },
    done: { title: "Arşivde bulundu", line: "Atlas 2023 yol haritası Mart ayında /arsiv/atlas-2023 adresine taşındı.", action: "Bozuk bağlantıyı göster" },
    loading: "Çalışma alanında Atlas aranıyor…", wait: 1200,
  },
};

/** Şekiller öne geçer, ayrıntılar arkadan gelir: arka karolar, gövde, ön karolar, sonra çizgiler ve işaret. Toplam 0,4 sn altında kalır. */
const DELAY = [.05, .03, 0, .04, .07, .1, .06, .09, .11, .14];
const NUDGE = [.03, .015, 0, .02, .035, .05, .02, .04, .05, .07];
const DRIFT = 2.5;

const first = FRAMES.search.idle;
const INITIAL = first.prims.map((p, i) => ({ ...shapePath(KINDS[i]!, p.geo, p.fx[1], 0, 0), o: String(p.fx[0]) }));

const enter = [...motionTokens.ease.enter] as [number, number, number, number];
const standard = [...motionTokens.ease.standard] as [number, number, number, number];

/** Motion'ın visualDuration ve bounce değerleri, aşağıdaki vektör yayları için sertlik ve sönümlemeye çevrilir. */
function springOf({ visualDuration, bounce }: { visualDuration: number; bounce: number }) {
  const root = (2 * Math.PI) / (visualDuration * 1.2);
  return { k: root * root, c: 2 * Math.min(1, Math.max(.05, 1 - bounce)) * root };
}
const MORPH = springOf(motionTokens.spring.morph), SMOOTH = springOf(motionTokens.spring.smooth), SWAY = { k: 90, c: 19 };

type Channel = { pos: Float64Array; vel: Float64Array; target: Float64Array; queue: { at: number; values: number[] }[]; k: number; c: number; still: boolean };
const channel = (values: number[], spring: { k: number; c: number }): Channel =>
  ({ pos: Float64Array.from(values), vel: new Float64Array(values.length), target: Float64Array.from(values), queue: [], ...spring, still: true });

/** Tek bir yay vektörünü ilerletir. Yeni hedef mevcut hızı korur; şekiller yolda hedef değiştirirken takılmaz. */
function advance(ch: Channel, now: number, dt: number) {
  while (ch.queue.length && ch.queue[0]!.at <= now) {
    const next = ch.queue.shift();
    if (next) { ch.target.set(next.values); ch.still = false; }
  }
  if (!ch.still) {
    const steps = Math.max(1, Math.ceil(dt * 240)), h = dt / steps, { pos, vel, target, k, c } = ch;
    for (let s = 0; s < steps; s++) for (let i = 0; i < pos.length; i++) { vel[i]! += (-k * (pos[i]! - target[i]!) - c * vel[i]!) * h; pos[i]! += vel[i]! * h; }
    let settled = true;
    for (let i = 0; i < pos.length; i++) if (Math.abs(pos[i]! - target[i]!) > .004 || Math.abs(vel[i]!) > .02) { settled = false; break; }
    if (settled) { pos.set(target); vel.fill(0); ch.still = true; }
  }
  return !ch.still || ch.queue.length > 0;
}

type Nodes = { paths: SVGPathElement[]; ghosts: SVGPathElement[]; main: SVGGElement; ghost: SVGGElement };

/** Tek bir animasyon döngüsü her şekli ref'ler üzerinden sürer. Her şey oturunca uykuya geçer. */
function createEngine(nodes: Nodes, start: Frame) {
  const geo = start.prims.map(p => channel(p.geo, MORPH));
  const fx = start.prims.map(p => channel(p.fx, SMOOTH));
  const sway = channel([0, 0], SWAY);
  const written = INITIAL.map(item => ({ d: item.d, o: item.o, dash: item.dash }));
  let frame = start, raf = 0, last = 0, parallax = false;

  const paint = () => {
    const ox = sway.pos[0]! * DRIFT, oy = sway.pos[1]! * DRIFT;
    nodes.paths.forEach((node, i) => {
      const g = geo[i]!.pos, f = fx[i]!.pos, w = written[i]!;
      const { d, dash } = shapePath(KINDS[i]!, g, f[1]!, ox, oy);
      const o = String(Math.round(Math.min(1, Math.max(0, f[0]!)) * 1000) / 1000);
      if (d !== w.d) { node.setAttribute("d", d); w.d = d; }
      if (o !== w.o) { node.setAttribute("opacity", o); w.o = o; }
      if (dash !== w.dash) { node.setAttribute("stroke-dasharray", dash); w.dash = dash; }
    });
  };
  const tick = (time: number) => {
    raf = 0;
    const now = time / 1000, dt = last ? Math.min(.034, Math.max(0, now - last)) : 1 / 60;
    last = now;
    let busy = advance(sway, now, dt);
    for (let i = 0; i < geo.length; i++) busy = advance(geo[i]!, now, dt) || busy;
    for (let i = 0; i < fx.length; i++) busy = advance(fx[i]!, now, dt) || busy;
    paint();
    if (busy) raf = requestAnimationFrame(tick); else last = 0;
  };
  const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };

  const pointer = (x: number, y: number) => {
    sway.queue = [];
    sway.target.set(parallax ? [x, y] : [0, 0]);
    sway.still = false;
    kick();
  };

  return {
    pointer,
    go(next: Frame, sceneChanged: boolean, reduced: boolean) {
      if (reduced) {
        // Yolculuksuz çapraz geçiş: eski çizimi hayalet katmanda dondur, yenisine atla, ikisi arasında solarak geç.
        nodes.paths.forEach((node, i) => {
          const ghost = nodes.ghosts[i]!;
          ghost.setAttribute("d", node.getAttribute("d") ?? "");
          ghost.setAttribute("opacity", node.getAttribute("opacity") ?? "1");
          ghost.setAttribute("stroke-dasharray", node.getAttribute("stroke-dasharray") ?? "none");
          ghost.dataset.tone = frame.prims[i]!.tone;
        });
        next.prims.forEach((p, i) => {
          for (const [ch, values] of [[geo[i]!, p.geo], [fx[i]!, p.fx]] as const) { ch.queue = []; ch.target.set(values); ch.pos.set(values); ch.vel.fill(0); ch.still = true; }
        });
        frame = next;
        paint();
        animate(nodes.ghost, { opacity: [1, 0] }, { duration: motionTokens.duration.standard, ease: standard });
        animate(nodes.main, { opacity: [0, 1] }, { duration: motionTokens.duration.standard, ease: standard });
        return;
      }
      const now = performance.now() / 1000, delays = sceneChanged ? DELAY : NUDGE;
      next.prims.forEach((p, i) => {
        const delay = delays[i]!, f = fx[i]!;
        geo[i]!.queue = [{ at: now + delay, values: p.geo }];
        if (sceneChanged && p.redraw) f.queue = [{ at: now, values: [p.fx[0], 0] }, { at: now + delay + .18, values: p.fx }];
        else f.queue = [{ at: now + delay + (p.fx[1] > f.target[1]! + .01 ? .12 : 0), values: p.fx }];
      });
      frame = next;
      kick();
    },
    setParallax(on: boolean) { parallax = on; if (!on) pointer(0, 0); },
    destroy() { if (raf) cancelAnimationFrame(raf); raf = 0; },
  };
}

export function EmptyStates() {
  const uid = useId();
  const reduced = useReducedMotion() ?? false;
  const [view, setView] = useState<View>({ scene: "search", phase: "idle", from: "idle" });
  const [announcement, setAnnouncement] = useState("");
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const paths = useRef<(SVGPathElement | null)[]>([]);
  const ghosts = useRef<(SVGPathElement | null)[]>([]);
  const mainLayer = useRef<SVGGElement>(null);
  const ghostLayer = useRef<SVGGElement>(null);
  const engine = useRef<ReturnType<typeof createEngine> | null>(null);
  const shown = useRef({ scene: view.scene, phase: view.phase });
  const pending = useRef({ timer: 0 });
  const copyInner = useRef<HTMLDivElement>(null);
  const copyHeight = useMotionValue<number | "auto">("auto");
  const armedUntil = useRef(0);

  const frame = FRAMES[view.scene][view.phase];
  const text = COPY[view.scene];
  const copy: Copy = view.phase === "loading" ? { ...text[view.from === "done" ? "done" : "idle"], line: text.loading } : text[view.phase === "done" ? "done" : "idle"];
  const copyKey = `${copy.title}|${copy.line}`;

  useEffect(() => {
    const main = mainLayer.current, ghost = ghostLayer.current;
    const nodes = paths.current.filter(Boolean) as SVGPathElement[], ghostNodes = ghosts.current.filter(Boolean) as SVGPathElement[];
    if (!main || !ghost || nodes.length !== KINDS.length || ghostNodes.length !== KINDS.length) return;
    const instance = createEngine({ paths: nodes, ghosts: ghostNodes, main, ghost }, first);
    engine.current = instance;
    const bag = pending.current;
    return () => { instance.destroy(); engine.current = null; window.clearTimeout(bag.timer); };
  }, []);

  useEffect(() => {
    const fine = typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    engine.current?.setParallax(fine && !reduced);
  }, [reduced]);

  useEffect(() => {
    const prev = shown.current;
    if (prev.scene === view.scene && prev.phase === view.phase) return;
    shown.current = { scene: view.scene, phase: view.phase };
    engine.current?.go(FRAMES[view.scene][view.phase], prev.scene !== view.scene, reduced);
  }, [view.scene, view.phase, reduced]);

  // Metin bloğu gelen metnin yüksekliğine yaylanır; eylem düğmesi sıçramaz.
  useLayoutEffect(() => { armedUntil.current = performance.now() + 700; }, [copyKey]);
  useEffect(() => {
    const node = copyInner.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    let measured = false;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const next = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
      if (!measured || reduced || performance.now() > armedUntil.current) { measured = true; copyHeight.jump(next); return; }
      animate(copyHeight, next, motionTokens.spring.smooth);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [reduced, copyHeight]);

  function choose(scene: SceneId) {
    if (scene === view.scene) return;
    window.clearTimeout(pending.current.timer);
    setView({ scene, phase: "idle", from: "idle" });
    setAnnouncement("");
  }

  function act() {
    const { scene, phase } = view;
    if (phase === "loading") return;
    const entry = COPY[scene];
    if (scene === "search" || (phase === "done" && scene !== "inbox")) {
      const next: Phase = phase === "idle" ? "done" : "idle";
      setView({ scene, phase: next, from: phase });
      setAnnouncement(`${entry[next === "done" ? "done" : "idle"].title}. ${entry[next === "done" ? "done" : "idle"].line}`);
      return;
    }
    setView({ scene, phase: "loading", from: phase });
    setAnnouncement(entry.loading);
    window.clearTimeout(pending.current.timer);
    pending.current.timer = window.setTimeout(() => {
      setView(current => (current.scene === scene && current.phase === "loading" ? { scene, phase: "done", from: "loading" } : current));
      setAnnouncement(`${entry.done.title}. ${entry.done.line}`);
    }, entry.wait);
  }

  function onTabKey(event: KeyboardEvent<HTMLDivElement>) {
    const index = SCENES.findIndex(item => item.id === view.scene);
    const next = event.key === "ArrowRight" ? (index + 1) % SCENES.length : event.key === "ArrowLeft" ? (index + SCENES.length - 1) % SCENES.length : event.key === "Home" ? 0 : event.key === "End" ? SCENES.length - 1 : -1;
    if (next < 0) return;
    event.preventDefault();
    choose(SCENES[next]!.id);
    tabs.current[next]?.focus();
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    engine.current?.pointer(((event.clientX - rect.left) / rect.width - .5) * 2, ((event.clientY - rect.top) / rect.height - .5) * 2);
  }

  const rise = reduced
    ? { initial: { opacity: 0 }, exit: { opacity: 0, transition: { duration: motionTokens.duration.exit } } }
    : { initial: { opacity: 0, y: 8, filter: `blur(${motionTokens.blur.soft}px)` }, exit: { opacity: 0, y: -6, filter: `blur(${motionTokens.blur.soft}px)`, transition: { duration: motionTokens.duration.exit, ease: standard } } };
  const shownText = { opacity: 1, y: 0, filter: "blur(0px)" };
  const textIn = (delay: number) => ({ duration: reduced ? motionTokens.duration.standard : motionTokens.duration.considered, ease: enter, delay: reduced ? 0 : delay });

  return (
    <section className={styles.root} aria-label="Boş durumlar">
      <div className={styles.card}>
        <div className={styles.tabs} role="tablist" aria-label="Boş durum" onKeyDown={onTabKey}>
          {SCENES.map((item, index) => {
            const selected = item.id === view.scene;
            return (
              <button key={item.id} ref={node => { tabs.current[index] = node; }} id={`${uid}-tab-${item.id}`} type="button" role="tab" aria-selected={selected} aria-controls={`${uid}-panel`} tabIndex={selected ? 0 : -1} className={styles.tab} onClick={() => choose(item.id)}>
                {selected ? <motion.span layoutId={`${uid}-highlight`} className={styles.highlight} transition={reduced ? { duration: 0 } : motionTokens.spring.morph} /> : null}
                <span className={styles.tabLabel}>{item.tab}</span>
              </button>
            );
          })}
        </div>

        <div className={styles.panel} role="tabpanel" id={`${uid}-panel`} aria-labelledby={`${uid}-tab-${view.scene}`}>
          <div className={styles.stage} onPointerMove={onPointerMove} onPointerLeave={() => engine.current?.pointer(0, 0)}>
            <svg className={styles.art} viewBox={`0 0 ${VIEW.width} ${VIEW.height}`} role="img" aria-label={frame.label}>
              <g ref={ghostLayer} opacity={0} aria-hidden="true">
                {KINDS.map((kind, i) => <path key={i} ref={node => { ghosts.current[i] = node; }} className={styles.shape} data-kind={kind} d="" />)}
              </g>
              <g ref={mainLayer}>
                {INITIAL.map((item, i) => (
                  <path key={i} ref={node => { paths.current[i] = node; }} className={styles.shape} data-kind={KINDS[i]} data-tone={frame.prims[i]!.tone} d={item.d} opacity={item.o} strokeDasharray={item.dash} style={{ transitionDelay: `${DELAY[i]}s` }} />
                ))}
              </g>
            </svg>
          </div>

          <div className={styles.copy}>
            <motion.div className={styles.copyFrame} style={{ height: copyHeight }}>
              <div ref={copyInner} className={styles.copyInner}>
                <h2 className={styles.title}>
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span key={copy.title} className={styles.swap} initial={rise.initial} animate={shownText} exit={rise.exit} transition={textIn(.06)}>{copy.title}</motion.span>
                  </AnimatePresence>
                </h2>
                <p className={styles.line}>
                  <AnimatePresence mode="popLayout" initial={false}>
                    <motion.span key={copy.line} className={styles.swap} initial={rise.initial} animate={shownText} exit={rise.exit} transition={textIn(.06 + motionTokens.stagger.word)}>{copy.line}</motion.span>
                  </AnimatePresence>
                </p>
              </div>
            </motion.div>
            <Button size="sm" onClick={act} loading={view.phase === "loading"}>{copy.action}</Button>
          </div>
          <p className={styles.srOnly} aria-live="polite">{announcement}</p>
        </div>
      </div>
    </section>
  );
}

export default EmptyStates;
