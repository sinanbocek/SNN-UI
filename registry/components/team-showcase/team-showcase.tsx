"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import SegmentedControl from "../segmented-control/segmented-control";
import { motionTokens } from "../lib/motion-tokens";
import { Placeholder, useAnnouncer } from "../lib/shop-parts";
import { useReducedMotionSafe } from "../lib/viz-utils";
import { COPIED, COPY_FAILED, LAYOUTS, contactRows, copyText, counterLine, initials, placeText, profileLive, type ShowcaseLayout, type TeamMember } from "./team-showcase-format";
import styles from "./team-showcase.module.css";

export type { ShowcaseLayout, TeamMember };

/** Ekibi portre ağırlıklı tanıtan "hakkımızda" bölümü için kullanın: galeri, film şeridi, dizin ya da ön plan yerleşimiyle. Bir kişiye basınca profili yerinde açılır: unvan, şehir, kısa tanım ve kopyalanabilir iletişim bilgileri. İç aranabilir kişi listesi için `team-directory`, üye ve rol yönetimi için `team-members`, müşteri alıntıları için `testimonial-stage`. Gerçek sitede yalnız izin alınmış portre ve bilgi kullanılmalıdır (uygulamanın sorumluluğu). */
export interface TeamShowcaseProps {
  title: string;
  members: TeamMember[];
  /** Başlangıç yerleşimi (varsayılan galeri). Üretimde sabit bir yerleşim seçilir. */
  layout?: ShowcaseLayout;
  /** Yerleşim seçicisini gösterir; yalnız tanıtım ortamı içindir. */
  layoutSwitcher?: boolean;
  /** Telefonu ekranda maskeler (kopyalanan değer gerçektir). */
  maskPhone?: boolean;
  /** Kişi seçilince çağrılır (profil sayfasına gitmek ya da istatistik için). */
  onSelect?: (member: TeamMember, index: number) => void;
}

function Portrait({ member, className }: { member: TeamMember; className?: string }) {
  const label = `${member.name}, ${member.title}`;
  return member.portrait
    ? <img className={[styles.portrait, className].filter(Boolean).join(" ")} src={member.portrait} alt={label} loading="lazy" />
    : <Placeholder tone={member.tone ?? 0} label={label} ratio="4 / 5" className={[styles.portrait, className].filter(Boolean).join(" ")}><span className={styles.initials} aria-hidden="true">{initials(member.name)}</span></Placeholder>;
}

function CopyButton({ label, value, shown, announce }: { label: string; value: string; shown: string; announce: (message: string) => void }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<number>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  return <button type="button" className={styles.copy} aria-label={label} onClick={async () => {
    const ok = await copyText(value);
    setState(ok ? "copied" : "failed"); announce(ok ? COPIED : COPY_FAILED);
    window.clearTimeout(timer.current); timer.current = window.setTimeout(() => setState("idle"), 1800);
  }}><span>{shown}</span><i data-state={state} aria-hidden="true">{state === "copied" ? COPIED : state === "failed" ? COPY_FAILED : "Kopyala"}</i></button>;
}

function Profile({ member, maskPhone, announce, heading = true }: { member: TeamMember; maskPhone: boolean; announce: (message: string) => void; heading?: boolean }) {
  const rows = contactRows(member, maskPhone);
  const place = placeText(member);
  return <div className={styles.profile}>
    {heading ? <h3 className={styles.name}>{member.name}</h3> : <p className={styles.name}>{member.name}</p>}
    <p className={styles.role}>{member.title}{place && <> · {place}</>}</p>
    {member.bio && <p className={styles.bio}>{member.bio}</p>}
    {rows.length > 0 && <ul className={styles.contacts}>{rows.map(row => <li key={row.kind}><CopyButton label={row.label} value={row.value} shown={row.shown} announce={announce} /></li>)}</ul>}
  </div>;
}

export function TeamShowcase({ title, members, layout: initial = "gallery", layoutSwitcher = false, maskPhone = false, onSelect }: TeamShowcaseProps) {
  const reduced = useReducedMotionSafe();
  const uid = useId();
  const [layout, setLayout] = useState<ShowcaseLayout>(initial);
  const [index, setIndex] = useState(0);
  const [live, announce] = useAnnouncer();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const member = members[Math.min(index, members.length - 1)];
  if (!member) return null;

  const pick = (at: number) => {
    setIndex(at); onSelect?.(members[at]!, at); announce(profileLive(members[at]!));
    if (!reduced) buttons.current[at]?.scrollIntoView?.({ behavior: "smooth", inline: "center", block: "nearest" });
  };
  const fade = reduced ? { duration: 0 } : { duration: motionTokens.duration.standard };
  const card = (item: TeamMember, at: number) => <button key={item.id} ref={node => { buttons.current[at] = node; }} type="button" className={styles.card} aria-pressed={at === index} onClick={() => pick(at)}>
    <Portrait member={item} /><b>{item.name}</b><span>{item.title}</span>
  </button>;
  const profile = <AnimatePresence mode="wait" initial={false}><motion.div key={member.id} initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={fade}><Profile member={member} maskPhone={maskPhone} announce={announce} /></motion.div></AnimatePresence>;

  return <section className={styles.root} aria-labelledby={`${uid}-title`} data-layout={layout} data-reduced={reduced || undefined}>
    <header className={styles.head}>
      <h2 id={`${uid}-title`} className={styles.title}>{title}</h2>
      <p className={styles.counter} aria-hidden="true">{counterLine(index, members.length, member.name)}</p>
      {layoutSwitcher && <SegmentedControl label="Yerleşim" options={LAYOUTS} value={layout} onValueChange={value => setLayout(value as ShowcaseLayout)} />}
    </header>
    {layout === "gallery" && <><div className={styles.gallery}>{members.map(card)}</div><div className={styles.detail}>{profile}</div></>}
    {layout === "filmstrip" && <><div className={styles.film}>{members.map(card)}</div><div className={styles.detail}>{profile}</div></>}
    {layout === "directory" && <ul className={styles.directory}>{members.map((item, at) => {
      const open = at === index;
      return <li key={item.id} className={styles.row} data-open={open || undefined}>
        <button ref={node => { buttons.current[at] = node; }} type="button" className={styles.rowButton} aria-expanded={open} aria-controls={`${uid}-row-${item.id}`} onClick={() => pick(at)}><b>{item.name}</b><span>{item.title}</span></button>
        <AnimatePresence initial={false}>{open && <motion.div key="panel" id={`${uid}-row-${item.id}`} role="region" aria-label={item.name} className={styles.rowPanel} initial={reduced ? false : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={reduced ? { duration: 0 } : motionTokens.spring.smooth}>
          <div className={styles.rowInner}><Portrait member={item} className={styles.smallPortrait} /><Profile member={item} maskPhone={maskPhone} announce={announce} heading={false} /></div>
        </motion.div>}</AnimatePresence>
      </li>;
    })}</ul>}
    {layout === "spotlight" && <div className={styles.spotlight}>
      <AnimatePresence mode="wait" initial={false}><motion.div key={member.id} className={styles.spotBody} initial={reduced ? false : { opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={fade}><Portrait member={member} className={styles.bigPortrait} /><Profile member={member} maskPhone={maskPhone} announce={announce} /></motion.div></AnimatePresence>
      <div className={styles.picker} role="group" aria-label="Kişiler">{members.map((item, at) => <button key={item.id} ref={node => { buttons.current[at] = node; }} type="button" className={styles.dot} aria-pressed={at === index} aria-label={`${item.name}, ${item.title}`} onClick={() => pick(at)}>{initials(item.name)}</button>)}</div>
    </div>}
    {live}
  </section>;
}

export default TeamShowcase;
