"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { motionTokens } from "../lib/motion-tokens";
import { Placeholder, useAnnouncer } from "../lib/shop-parts";
import { useElementWidth, useReducedMotionSafe } from "../lib/viz-utils";
import { directionOf, initials, liveText, portraitLabel, tabLabel, wrapIndex } from "./testimonial-stage-format";
import styles from "./testimonial-stage.module.css";

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  /** Verilirse gerçek portre; verilmezse baş harfli yer tutucu çizilir. */
  portrait?: string;
  /** Yer tutucunun renk tonu (0–5). */
  tone?: number;
}

/** Birkaç kişinin görüşünü, kişinin portresi öne çıkacak biçimde göstermek için kullanın: üstte kişi sekmeleri, altta seçili kişinin portresi ve alıntısı. Kendiliğinden dönmez, yalnız kullanıcı girdisiyle değişir. Yalnız logo yeterliyse logo şeridi, çok sayıda kısa yorum için döner şerit, kendi ekibi için `team-showcase`. Gerçek sitede yalnız izin alınmış portre ve doğrulanmış alıntı kullanılmalıdır (uygulamanın sorumluluğu). */
export interface TestimonialStageProps {
  title: string;
  people: Testimonial[];
  /** Seçim değişince çağrılır (istatistik için). */
  onSelect?: (person: Testimonial, index: number) => void;
  loading?: boolean;
}

function Portrait({ person }: { person: Testimonial }) {
  return person.portrait
    ? <img className={styles.portrait} src={person.portrait} alt={portraitLabel(person.name, person.role)} />
    : <Placeholder tone={person.tone ?? 0} label={portraitLabel(person.name, person.role)} ratio="4 / 5" className={styles.portrait}><span className={styles.initials} aria-hidden="true">{initials(person.name)}</span></Placeholder>;
}

export function TestimonialStage({ title, people, onSelect, loading = false }: TestimonialStageProps) {
  const reduced = useReducedMotionSafe();
  const uid = useId();
  const [box, width] = useElementWidth<HTMLElement>();
  const [index, setIndex] = useState(0);
  const direction = useRef(1);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const [live, announce] = useAnnouncer();
  const person = people[Math.min(index, people.length - 1)];

  const choose = (next: number, focus = false) => {
    if (next === index) return;
    direction.current = directionOf(index, next);
    setIndex(next);
    onSelect?.(people[next]!, next);
    announce(liveText(people[next]!.name));
    if (focus) tabs.current[next]?.focus();
  };
  const key = (event: KeyboardEvent, at: number) => {
    const next = event.key === "ArrowRight" ? wrapIndex(at, 1, people.length) : event.key === "ArrowLeft" ? wrapIndex(at, -1, people.length) : event.key === "Home" ? 0 : event.key === "End" ? people.length - 1 : -1;
    if (next < 0) return;
    event.preventDefault();
    choose(next, true);
  };

  if (loading || !person) return <section ref={box} className={styles.root} aria-busy="true" role="status" aria-label="Görüşler yükleniyor"><div className={styles.skeleton}><span /><span /><span /></div></section>;

  const slide = (sign: number) => reduced ? { opacity: 0 } : { opacity: 0, x: 24 * sign };
  return <section ref={box} className={styles.root} aria-labelledby={`${uid}-title`} data-narrow={width > 0 && width < 680 || undefined} data-compact={width > 0 && width < 350 || undefined} data-reduced={reduced || undefined}>
    <h2 id={`${uid}-title`} className={styles.title}>{title}</h2>
    {people.length > 1 && <div className={styles.tabs} role="tablist" aria-label="Kişiler">{people.map((item, at) => <button key={item.id} ref={node => { tabs.current[at] = node; }} type="button" role="tab" id={`${uid}-tab-${item.id}`} aria-selected={at === index} aria-controls={`${uid}-panel`} tabIndex={at === index ? 0 : -1} aria-label={tabLabel(item.name, item.role)} className={styles.tab} onClick={() => choose(at)} onKeyDown={event => key(event, at)}>
      <span className={styles.mini} aria-hidden="true">{initials(item.name)}</span><span className={styles.tabName}>{item.name}</span>
      {at === index && <motion.i layoutId={`${uid}-underline`} className={styles.underline} transition={reduced ? { duration: 0 } : motionTokens.spring.snappy} />}
    </button>)}</div>}
    <div id={`${uid}-panel`} role="tabpanel" aria-labelledby={`${uid}-tab-${person.id}`} className={styles.stage}>
      <AnimatePresence mode="wait" initial={false} custom={direction.current}>
        <motion.div key={person.id} className={styles.slide} initial={slide(direction.current)} animate={{ opacity: 1, x: 0 }} exit={slide(-direction.current)} transition={{ duration: reduced ? 0 : motionTokens.duration.standard, ease: [...motionTokens.ease.standard] }}>
          <Portrait person={person} />
          <figure className={styles.quote}>
            <blockquote>{person.quote}</blockquote>
            <figcaption><b>{person.name}</b><span>{person.role}, {person.company}</span></figcaption>
          </figure>
        </motion.div>
      </AnimatePresence>
    </div>
    {live}
  </section>;
}

export default TestimonialStage;
