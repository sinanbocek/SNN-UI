"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { motionTokens } from "../lib/motion-tokens";
import { Avatar } from "../avatar/avatar";
import { Button } from "../button/button";
import { Checkbox } from "../checkbox/checkbox";
import { Progress } from "../progress/progress";
import { Skeleton } from "../skeleton/skeleton";
import { Switch } from "../switch/switch";
import { Tooltip } from "../tooltip/tooltip";
import styles from "./release-readiness.module.css";

export interface ReadinessCheck { id: string; title: string; description?: string }

export interface ReadinessOwner { name: string; src?: string }

export interface ReleaseReadinessProps {
  /** İşin adı ("Sürüm 2.4", "Teklifi gönder"). */
  title: string;
  /** Bağlam ve tarih satırı, hazır metin ("Üretim ortamı · 15 Ekim"; proje ABACUS `date.format` ile üretir). */
  context?: string;
  owners?: ReadinessOwner[];
  checks: ReadinessCheck[];
  /** Başta işaretli olan kontroller. */
  defaultChecked?: string[];
  onCheckedChange?: (ids: string[]) => void;
  /** Ana eylemin düğme yazısı ("Yayını başlat"). */
  actionLabel: string;
  /** Eylem çalışırken düğme yazısı. */
  busyLabel?: string;
  /** Eylem çalıştı. `notify`: "İlgilileri bilgilendir" anahtarının durumu. Reddedilirse satır içi uyarı çıkar ve yeniden denenebilir. */
  onAction: (notify: boolean) => void | Promise<void>;
  /** Bilgilendirme anahtarının kanal adı ("Slack"). Verilmezse anahtar çıkmaz. */
  channel?: string;
  /** Başarıdan sonra çıkan ikinci eylem ("Panoya git"). */
  successAction?: { label: string; onClick: () => void };
  successMessage?: string;
  loading?: boolean;
  className?: string;
}

type Phase = "idle" | "running" | "success" | "error";

/** Sayı değişirken kısa bir yükselişle yer değiştirir; "hareketi azalt" açıkken anında değişir. */
function Rolling({ value }: { value: string }) {
  const reduced = useReducedMotion();
  return (
    <span className={styles.rolling}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value} className={styles.rollingItem} aria-hidden="true"
          initial={reduced ? false : { opacity: 0, y: "0.5em" }} animate={{ opacity: 1, y: 0 }} exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: "-0.5em" }}
          transition={reduced ? { duration: 0 } : { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] }}
        >{value}</motion.span>
      </AnimatePresence>
      <span className={styles.srOnly}>{value}</span>
    </span>
  );
}

/** Yayına hazırlık listesi: hepsi işaretlenmeden son eylem düğmesi açılmaz; ilerleme çubuğu kaç kontrol kaldığını söyler. */
export function ReleaseReadiness({
  title, context, owners = [], checks, defaultChecked = [], onCheckedChange, actionLabel, busyLabel = "Başlatılıyor…", onAction, channel, successAction,
  successMessage = "İşlem başlatıldı.", loading = false, className,
}: ReleaseReadinessProps) {
  const uid = useId();
  const reduced = useReducedMotion() ?? false;
  const [done, setDone] = useState<string[]>(defaultChecked);
  const [notify, setNotify] = useState(true);
  const [phase, setPhase] = useState<Phase>("idle");
  const [flash, setFlash] = useState(false);
  const [note, setNote] = useState("");
  const wasReady = useRef(false);

  const total = checks.length;
  const completed = checks.filter(check => done.includes(check.id)).length;
  const remaining = total - completed;
  const ready = total > 0 && remaining === 0;
  const locked = phase === "running" || phase === "success";
  const canAct = ready && !loading && phase !== "running" && phase !== "success";

  // Düğme aktif olunca kısa bir vurgu.
  useEffect(() => {
    if (ready && !wasReady.current && !reduced) { setFlash(true); const timer = setTimeout(() => setFlash(false), 900); wasReady.current = true; return () => clearTimeout(timer); }
    wasReady.current = ready;
  }, [ready, reduced]);

  function toggle(id: string, next: boolean) {
    if (locked) return;
    const ids = next ? [...done, id] : done.filter(item => item !== id);
    setDone(ids);
    onCheckedChange?.(ids);
    if (phase === "error") setPhase("idle");
    setNote(`${checks.filter(check => ids.includes(check.id)).length} / ${total} kontrol tamamlandı`);
  }

  async function act() {
    if (!canAct) return;
    setPhase("running");
    try {
      await onAction(notify);
      setPhase("success");
      setNote(successMessage);
    } catch {
      setPhase("error");
      setNote("İşlem başlatılamadı.");
    }
  }

  const counter = ready ? "Hazır" : `${remaining} kontrol kaldı`;

  return (
    <section className={[styles.root, className].filter(Boolean).join(" ")} data-reduced={reduced ? "true" : undefined} aria-labelledby={`${uid}-title`}>
      <div className={styles.srOnly} role="status" aria-live="polite">{note}</div>

      <header className={styles.header}>
        <div className={styles.headText}>
          <h2 id={`${uid}-title`} className={styles.title}>{title}</h2>
          {context && <p className={styles.context}>{context}</p>}
        </div>
        {owners.length > 0 && (
          <div className={styles.owners} role="group" aria-label="Sorumlular">
            {owners.slice(0, 4).map(owner => <span key={owner.name} className={styles.ownerItem}><Avatar name={owner.name} src={owner.src} size="sm" /></span>)}
          </div>
        )}
      </header>

      <div className={styles.summary}>
        <div className={styles.counts}>
          <span className={styles.counter}><Rolling value={counter} /></span>
          <span className={styles.fraction} aria-hidden="true">{`${completed} / ${total}`}</span>
        </div>
        <Progress value={completed} max={Math.max(total, 1)} label="Hazırlık ilerlemesi" />
      </div>

      {loading ? (
        <div className={styles.skeletons}>{[0, 1, 2, 3].map(index => <Skeleton key={index} lines={2} label="Kontroller yükleniyor" />)}</div>
      ) : (
        <ul className={styles.checks} aria-label="Kontroller">
          {checks.map(check => (
            <li key={check.id} className={styles.check} data-done={done.includes(check.id) ? "true" : undefined}>
              <Checkbox label={check.title} description={check.description} checked={done.includes(check.id)} disabled={locked} onCheckedChange={next => toggle(check.id, next === true)} />
            </li>
          ))}
        </ul>
      )}

      <footer className={styles.footer}>
        {channel && (
          <div className={styles.notify}>
            <Switch label={`${channel} kanalını bilgilendir`} checked={notify} onCheckedChange={setNotify} disabled={locked || loading} />
          </div>
        )}
        <div className={styles.actionCell}>
          <Tooltip content="Önce tüm kontrolleri tamamlayın.">
            <span className={styles.actionWrap} data-flash={flash ? "true" : undefined}>
              <Button onClick={() => void act()} loading={phase === "running"} disabled={!canAct && phase !== "running"} aria-describedby={canAct ? undefined : `${uid}-why`}>
                {phase === "running" ? busyLabel : phase === "error" ? "Yeniden dene" : actionLabel}
              </Button>
            </span>
          </Tooltip>
        </div>
      </footer>

      {!canAct && phase === "idle" && !loading && <p id={`${uid}-why`} className={styles.hint}>Önce tüm kontrolleri tamamlayın.</p>}
      {phase === "success" && (
        <div className={styles.result} role="status" data-kind="success">
          <span>{successMessage}</span>
          {successAction && <Button size="sm" variant="ghost" onClick={successAction.onClick}>{successAction.label}</Button>}
        </div>
      )}
      {phase === "error" && <div className={styles.result} role="alert" data-kind="error"><span>İşlem başlatılamadı.</span></div>}
    </section>
  );
}

export default ReleaseReadiness;
