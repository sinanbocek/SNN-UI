"use client";

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "motion/react";
import { Button } from "../button/button";
import { useAnnouncer } from "../lib/shop-parts";
import { useReducedMotionSafe } from "../lib/viz-utils";
import { COPIED_TEXT, FAILED_TEXT, SENT_TEXT, activeStep, scrollTargetFor, stepLabel, stepPosition, tabFill } from "./scroll-story-format";
import styles from "./scroll-story.module.css";

export interface StoryStep {
  id: string;
  title: string;
  text: string;
  /** Adım etkinleşince kibar canlı bölgede duyurulan sahne durumu ("Gelen kutusunda yeni mesaj var"). */
  status?: string;
}

/** `renderStage`e verilen bağlam: `position` adım konumudur (0 ilk adım, 1 ikinci adım...; yayla yumuşar), `active` en yakın tam adımdır. */
export interface StageContext { position: MotionValue<number>; active: number; reduced: boolean }

/** Bir ürünü dört adım gibi kısa bir akışta anlatan tanıtım bölümü için kullanın: kendi içinde kayan metin alanı, ilerledikçe dolan adım sekmeleri ve metne göre değişen sabit sahne. Tek paragraflık kaydırma vurgusu ya da tek önce/sonra anahtarı için değil. Sahneyi `renderStage` ile siz çizersiniz; gerçek paylaşım ve kopyalamayı `actions` ile bağlarsınız. */
export interface ScrollStoryProps {
  label: string;
  steps: StoryStep[];
  renderStage: (context: StageContext) => ReactNode;
  /** Son adımın altında "Bağlantıyı kopyala" ve "Kanala gönder" düğmeleri çıkar; sonuç duyurulur. */
  actions?: { onCopyLink?: () => Promise<void>; onSend?: () => Promise<void> };
}

function Tab({ index, step, total, position, active, onSelect, onKeyDown, tabRef, controls }: { index: number; step: StoryStep; total: number; position: MotionValue<number>; active: boolean; onSelect: () => void; onKeyDown: (event: KeyboardEvent) => void; tabRef: (node: HTMLButtonElement | null) => void; controls: string }) {
  const scale = useTransform(position, value => tabFill(value, index));
  return <button ref={tabRef} type="button" role="tab" id={`${controls}-tab-${index}`} aria-selected={active} aria-controls={`${controls}-step-${index}`} tabIndex={active ? 0 : -1} className={styles.tab} onClick={onSelect} onKeyDown={onKeyDown}>
    <span className={styles.tabBar} aria-hidden="true"><motion.i style={{ scaleX: scale }} /></span>
    <span className={styles.tabLabel}>{stepLabel(index, total)} · {step.title}</span>
  </button>;
}

export function ScrollStory({ label, steps, renderStage, actions }: ScrollStoryProps) {
  const reduced = useReducedMotionSafe();
  const uid = useId();
  const area = useRef<HTMLDivElement>(null);
  const sections = useRef<(HTMLElement | null)[]>([]);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const raw = useMotionValue(0);
  const spring = useSpring(raw, { stiffness: 170, damping: 26, mass: .6 });
  const position = reduced ? raw : spring;
  const [active, setActive] = useState(0);
  const [live, announce] = useAnnouncer();
  const frame = useRef(0);
  const lastStatus = useRef(-1);

  const tops = useCallback(() => sections.current.map(node => node?.offsetTop ?? 0), []);
  const read = useCallback(() => {
    const node = area.current;
    if (!node) return;
    const next = stepPosition(tops(), node.scrollTop, node.clientHeight);
    raw.set(next);
    setActive(activeStep(next, steps.length));
  }, [raw, steps.length, tops]);

  useEffect(() => {
    const node = area.current;
    if (!node) return;
    const onScroll = () => { if (frame.current) return; frame.current = requestAnimationFrame(() => { frame.current = 0; read(); }); };
    node.addEventListener("scroll", onScroll, { passive: true });
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(read) : null;
    observer?.observe(node);
    read();
    return () => { node.removeEventListener("scroll", onScroll); observer?.disconnect(); cancelAnimationFrame(frame.current); frame.current = 0; };
  }, [read]);
  useEffect(() => {
    if (lastStatus.current === active) return;
    lastStatus.current = active;
    if (active > 0 || steps[0]?.status) { const status = steps[active]?.status; if (status) announce(status); }
  }, [active, steps, announce]);

  const go = (index: number) => {
    const node = area.current;
    if (!node) return;
    node.scrollTo({ top: scrollTargetFor(tops(), index) - node.clientHeight * .05, behavior: reduced ? "auto" : "smooth" });
  };
  const tabKey = (event: KeyboardEvent, index: number) => {
    const next = event.key === "ArrowRight" ? Math.min(steps.length - 1, index + 1) : event.key === "ArrowLeft" ? Math.max(0, index - 1) : event.key === "Home" ? 0 : event.key === "End" ? steps.length - 1 : -1;
    if (next < 0) return;
    event.preventDefault();
    tabs.current[next]?.focus();
    go(next);
  };
  const run = async (task: (() => Promise<void>) | undefined, done: string, what: string) => {
    if (!task) return;
    try { await task(); announce(done); } catch { announce(FAILED_TEXT(what)); }
  };

  const last = steps.length - 1;
  return <section className={styles.root} aria-label={label} data-reduced={reduced || undefined}>
    <div className={styles.tabs} role="tablist" aria-label={`${label}: adımlar`}>
      {steps.map((step, at) => <Tab key={step.id} index={at} step={step} total={steps.length} position={position} active={active === at} controls={uid} onSelect={() => go(at)} onKeyDown={event => tabKey(event, at)} tabRef={node => { tabs.current[at] = node; }} />)}
    </div>
    <div ref={area} className={styles.area} tabIndex={0} role="region" aria-label={`${label}: kaydırarak ilerleyin`}>
      <div className={styles.stageWrap}><div className={styles.stage} aria-hidden="true">{renderStage({ position, active, reduced })}</div></div>
      <ol className={styles.steps}>
        {steps.map((step, at) => <li key={step.id} id={`${uid}-step-${at}`} ref={node => { sections.current[at] = node; }} className={styles.step} role="tabpanel" aria-labelledby={`${uid}-tab-${at}`} data-active={active === at || undefined} aria-current={active === at ? "step" : undefined}>
          <p className={styles.kicker}>{stepLabel(at, steps.length)}</p>
          <h3 className={styles.title}>{step.title}</h3>
          <p className={styles.text}>{step.text}</p>
          {at === last && actions && <div className={styles.actions}>
            {actions.onCopyLink && <Button variant="secondary" size="sm" onClick={() => run(actions.onCopyLink, COPIED_TEXT, "Kopyalama")}>Bağlantıyı kopyala</Button>}
            {actions.onSend && <Button variant="secondary" size="sm" onClick={() => run(actions.onSend, SENT_TEXT, "Gönderme")}>Kanala gönder</Button>}
          </div>}
        </li>)}
      </ol>
    </div>
    {live}
  </section>;
}

export default ScrollStory;
