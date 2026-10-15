"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Transition } from "motion/react";
import { Copy } from "lucide-react";
import { text } from "@snn/abacus-core";
import { motionTokens } from "../lib/motion-tokens";
import { Avatar } from "../avatar/avatar";
import { Button } from "../button/button";
import { EmptyState } from "../empty-state/empty-state";
import { SearchField } from "../search-field/search-field";
import { Skeleton } from "../skeleton/skeleton";
import { Tooltip } from "../tooltip/tooltip";
import styles from "./team-directory.module.css";

export type DirectoryStatus = "available" | "meeting" | "away";

export interface DirectoryPerson {
  id: string;
  name: string;
  /** Görev adı ("Maliyet uzmanı"). */
  title: string;
  /** Ekip adı; süzgeç düğmeleri bu değerlerden çıkar. */
  team: string;
  status: DirectoryStatus;
  email: string;
  /** Kısa tanıtım yazısı. */
  bio?: string;
  /** Şu an üzerinde çalıştığı iş. */
  working?: string;
  /** Yer ve yerel saat, hazır metin ("Ankara · 14.30"; proje ABACUS `date` ile üretir). */
  location?: string;
  src?: string;
}

export interface TeamDirectoryProps {
  people: DirectoryPerson[];
  /** Seçili kişi (denetimli kullanım). Verilmezse blok kendisi tutar; ilk açılışta ilk kişi seçilidir. */
  selectedId?: string;
  onSelect?: (person: DirectoryPerson) => void;
  /** Ekip sırası. Verilmezse kişilerde ilk görülme sırası kullanılır. */
  teams?: string[];
  loading?: boolean;
  /** Rehber yüklenemediyse true; "Yeniden dene" `onRetry` çağırır. */
  error?: boolean;
  onRetry?: () => void;
  title?: string;
  className?: string;
}

const statusLabel: Record<DirectoryStatus, string> = { available: "Müsait", meeting: "Toplantıda", away: "İzinde" };

type CopyState = "idle" | "ok" | "fail";

/** E-posta adresini panoya kopyalar; panoya yazılamazsa adres seçili gösterilir. */
function CopyButton({ email, target, onResult }: { email: string; target: React.RefObject<HTMLElement | null>; onResult: (message: string) => void }) {
  const [state, setState] = useState<CopyState>("idle");
  useEffect(() => { setState("idle"); }, [email]);
  useEffect(() => {
    if (state === "idle") return;
    const timer = setTimeout(() => setState("idle"), 2000);
    return () => clearTimeout(timer);
  }, [state]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setState("ok");
      onResult("E-posta kopyalandı.");
    } catch {
      setState("fail");
      onResult("E-posta kopyalanamadı.");
      const element = target.current;
      if (element) { const range = document.createRange(); range.selectNodeContents(element); const selection = window.getSelection(); selection?.removeAllRanges(); selection?.addRange(range); }
    }
  }

  return (
    <Button variant="secondary" size="sm" onClick={() => void copy()} aria-label={`${email} adresini kopyala`}>
      <Copy size={14} strokeWidth={1.75} aria-hidden="true" />
      <span className={styles.copyText}>{state === "ok" ? "Kopyalandı" : state === "fail" ? "Kopyalanamadı" : "Kopyala"}</span>
    </Button>
  );
}

/** Kurum içi kişi rehberi: aranabilir, ekibe göre süzülen liste ve seçili kişinin profil paneli. */
export function TeamDirectory({ people, selectedId, onSelect, teams, loading = false, error = false, onRetry, title = "Kişiler", className }: TeamDirectoryProps) {
  const uid = useId();
  const reduced = useReducedMotion() ?? false;
  const emailRef = useRef<HTMLElement>(null);
  const [query, setQuery] = useState("");
  const [team, setTeam] = useState("");
  const [inner, setInner] = useState<string | undefined>(undefined);
  const [note, setNote] = useState("");

  const teamList = useMemo(() => teams ?? [...new Set(people.map(person => person.team))], [teams, people]);
  const counts = useMemo(() => new Map(teamList.map(name => [name, people.filter(person => person.team === name).length])), [teamList, people]);

  const visible = useMemo(() => {
    const key = text.searchKey(query.trim());
    return people.filter(person => (!team || person.team === team) && (!key || text.searchKey(`${person.name} ${person.title}`).includes(key)));
  }, [people, query, team]);

  const wantedId = selectedId ?? inner;
  const selected = visible.find(person => person.id === wantedId) ?? visible[0];

  const grow: Transition = { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] };
  const motionProps = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: motionTokens.duration.instant } }
    : { layout: "position" as const, initial: { opacity: 0, height: 0 }, animate: { opacity: 1, height: "auto" }, exit: { opacity: 0, height: 0 }, transition: grow };

  function choose(person: DirectoryPerson) {
    setInner(person.id);
    onSelect?.(person);
  }

  function onSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape" && query) { event.preventDefault(); setQuery(""); }
  }

  function clearFilters() { setQuery(""); setTeam(""); }

  const hasFilters = query !== "" || team !== "";

  return (
    <section className={[styles.root, className].filter(Boolean).join(" ")} data-reduced={reduced ? "true" : undefined} aria-labelledby={`${uid}-title`}>
      <div className={styles.srOnly} role="status" aria-live="polite">{note}</div>

      <header className={styles.header}>
        <h2 id={`${uid}-title`} className={styles.title}>{title} <span className={styles.total}>{String(people.length)}</span></h2>
        <div className={styles.search}>
          <SearchField label="Ad ya da göreve göre ara" placeholder="Ad ya da göreve göre ara" value={query} onValueChange={setQuery} onKeyDown={onSearchKeyDown} disabled={loading || error} />
        </div>
      </header>

      {error ? (
        <EmptyState title="Rehber yüklenemedi" description="Bağlantınızı kontrol edip yeniden deneyin." action={onRetry ? <Button variant="secondary" onClick={onRetry}>Yeniden dene</Button> : undefined} />
      ) : (
        <>
          <div className={styles.pills} role="group" aria-label="Ekip süzgeci">
            {[{ id: "", label: "Tümü", count: people.length }, ...teamList.map(name => ({ id: name, label: name, count: counts.get(name) ?? 0 }))].map(pill => (
              <button key={pill.id || "all"} type="button" className={styles.pill} aria-pressed={team === pill.id} disabled={loading} onClick={() => setTeam(pill.id)}>
                {team === pill.id && <motion.span layoutId={`${uid}-pill`} className={styles.pillMark} transition={reduced ? { duration: 0 } : motionTokens.spring.smooth} aria-hidden="true" />}
                <span className={styles.pillText}>{pill.label}<span className={styles.pillCount} aria-hidden="true">{String(pill.count)}</span></span>
                <span className={styles.srOnly}>{`, ${pill.count} kişi`}</span>
              </button>
            ))}
          </div>

          <div className={styles.body}>
            {loading ? (
              <>
                <div className={styles.skeletons}>{[0, 1, 2, 3].map(index => <Skeleton key={index} avatar lines={2} label="Kişiler yükleniyor" />)}</div>
                <div className={styles.panel}><Skeleton avatar lines={5} label="Profil yükleniyor" /></div>
              </>
            ) : (
              <>
                {visible.length === 0 ? (
                  <div className={styles.listEmpty}>
                    <EmptyState title="Eşleşen kişi yok" description="Aramayı ya da ekip süzgecini değiştirin." action={hasFilters ? <Button variant="secondary" onClick={clearFilters}>Süzgeçleri temizle</Button> : undefined} />
                  </div>
                ) : (
                  <ul className={styles.list} aria-label="Kişi listesi">
                    <AnimatePresence initial={false}>
                      {visible.map(person => {
                        const active = selected?.id === person.id;
                        return (
                          <motion.li key={person.id} className={styles.item} {...motionProps}>
                            <button type="button" className={styles.person} aria-pressed={active} onClick={() => choose(person)}>
                              {active && <motion.span layoutId={`${uid}-active`} className={styles.activeMark} transition={reduced ? { duration: 0 } : motionTokens.spring.smooth} aria-hidden="true" />}
                              <span className={styles.personContent}>
                                <span className={styles.avatarWrap}>
                                  <Avatar name={person.name} src={person.src} />
                                  <span className={styles.dot} data-status={person.status} aria-hidden="true" />
                                </span>
                                <span className={styles.who}>
                                  <Tooltip content={person.name}><span className={styles.name}>{person.name}</span></Tooltip>
                                  <Tooltip content={person.title}><span className={styles.sub}>{person.title}</span></Tooltip>
                                </span>
                                <span className={styles.srOnly}>{`, ${statusLabel[person.status]}`}</span>
                              </span>
                            </button>
                          </motion.li>
                        );
                      })}
                    </AnimatePresence>
                  </ul>
                )}

                <div className={styles.panel} role="region" aria-label="Profil" aria-live="polite">
                  <AnimatePresence mode="wait" initial={false}>
                    {selected ? (
                      <motion.div
                        key={selected.id} className={styles.profile}
                        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, transition: { duration: motionTokens.duration.instant } }}
                        transition={{ duration: reduced ? motionTokens.duration.instant : motionTokens.duration.standard, ease: [...motionTokens.ease.enter] }}
                      >
                        <div className={styles.profileHead}>
                          <span className={styles.avatarWrap}><Avatar name={selected.name} src={selected.src} size="xl" /><span className={styles.dot} data-status={selected.status} data-big="true" aria-hidden="true" /></span>
                          <div className={styles.who}>
                            <h3 className={styles.profileName}>{selected.name}</h3>
                            <span className={styles.sub}>{selected.title}</span>
                          </div>
                        </div>
                        {selected.bio && <p className={styles.bio}>{selected.bio}</p>}
                        <dl className={styles.facts}>
                          <div><dt>Durum</dt><dd><span className={styles.statusText}><span className={styles.dot} data-status={selected.status} data-inline="true" aria-hidden="true" />{statusLabel[selected.status]}</span></dd></div>
                          <div><dt>Ekip</dt><dd>{selected.team}</dd></div>
                          {selected.working && <div><dt>Şu an üzerinde</dt><dd>{selected.working}</dd></div>}
                          {selected.location && <div><dt>Konum</dt><dd>{selected.location}</dd></div>}
                          <div className={styles.mailRow}><dt>E-posta</dt><dd><span className={styles.mail} ref={emailRef}>{selected.email}</span><CopyButton email={selected.email} target={emailRef} onResult={setNote} /></dd></div>
                        </dl>
                      </motion.div>
                    ) : (
                      <motion.p key="none" className={styles.pick} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: motionTokens.duration.instant }}>Bir kişi seçin</motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </section>
  );
}

export default TeamDirectory;
