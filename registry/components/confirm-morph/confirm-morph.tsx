"use client";

import { useCallback, useEffect, useId, useImperativeHandle, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent, ReactNode, Ref } from "react";
import { AnimatePresence, animate, motion, useIsPresent, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform } from "motion/react";
import type { AnimationPlaybackControls, MotionValue, Transition, Variants } from "motion/react";
import { CircleAlert, LoaderCircle } from "lucide-react";
import { motionTokens } from "../lib/motion-tokens";
import styles from "./confirm-morph.module.css";

/** Denetimin yaşam evresi: dinlenme, soru, işlem, bitti ya da hata. */
export type ConfirmMorphState = "idle" | "confirming" | "pending" | "done" | "error";

/** Sorunun yanıtlanma biçimi: basma, dolum bitene dek basılı tutma ya da basmanın ardından kısa geri sayım. */
export type ConfirmMorphMode = "press" | "hold" | "countdown";

/**
 * Geri alınamaz ya da önemli işler için, sorusunu yerinde soran düğme. Basınca aynı hap şekli satır içi bir soruya
 * (Vazgeç ve Sil), sonra dönen göstergeye, sonra Geri al düğmeli bir sonuca dönüşür. Genişlik her yüze yaylanır, yüzler
 * kendi doğal genişliğinde çapraz geçer; yazı ezilmez, çevredeki hiçbir şey zıplamaz. Escape, dışarıya basma ya da
 * zaman aşımı denetimi dinlenmeye döndürür.
 * Modal pencerenin ağır kaçtığı yerde kullan: proje silmek, erişimi kaldırmak, taslağı atmak.
 */
export interface ConfirmMorphProps {
  /** Dinlenme durumundaki yazı, örneğin "Projeyi sil". */
  label: ReactNode;
  /** Dinlenme yazısının önündeki sade simge. */
  icon?: ReactNode;
  /** Onay sırasında gösterilen soru, örneğin "3 dosya silinsin mi?". Verilmezse yazının sonuna soru işareti eklenir. */
  prompt?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** `onConfirm` sonuçlanırken dönen göstergenin yanında görünür. */
  pendingLabel?: string;
  doneLabel?: string;
  errorLabel?: string;
  retryLabel?: string;
  undoLabel?: string;
  /** `onUndo` sonuçlanırken dönen göstergenin yanında görünür. */
  undoingLabel?: string;
  /**
   * `danger` (varsayılan) onay düğmesine tehlike rengini verir; bir şeyi yok eden işler içindir. `neutral` vurgu rengini verir;
   * geri alınabilen önemli işler içindir. Dinlenme düğmesi iki durumda da nötrdür.
   */
  tone?: "danger" | "neutral";
  /** `press` basınca onaylar. `hold` `holdDuration` kadar basılı tutmayı ister. `countdown` onaylar, sonra `countdown` saniye geri sayar; Vazgeç ya da Escape yine durdurabilir. */
  confirmMode?: ConfirmMorphMode;
  /** `hold` kipinde onay düğmesinin basılı tutulacağı milisaniye. */
  holdDuration?: number;
  /** `countdown` kipinde işlem çalışmadan önce geri sayılan saniye. */
  countdown?: number;
  /** `countdown` kipinde saniyenin önündeki yazı, örneğin "Siliniyor:". Verilmezse işlem yazısının sonuna iki nokta eklenir. */
  countdownLabel?: string;
  /** Onayda çalışır. Bekleme yüzünü göstermek için bir söz (promise) döndür; ret olursa Tekrar dene düğmeli hata yüzü görünür. */
  onConfirm?: () => void | Promise<unknown>;
  /** Verilirse sonuca Geri al eklenir. Çalışırken bekleme yüzü göstermek için bir söz (promise) döndür. */
  onUndo?: () => void | Promise<unknown>;
  onCancel?: () => void;
  /** Dışarıdan yönetilen durum. `onStateChange` ile birlikte ver. */
  state?: ConfirmMorphState;
  /** Dışarıdan yönetilmediğinde başlangıç durumu. */
  defaultState?: ConfirmMorphState;
  onStateChange?: (state: ConfirmMorphState) => void;
  /** Yanıtsız soru dinlenmeye dönmeden önceki milisaniye. İşaretçiyi denetimin üstünde tutmak süreyi durdurur. 0 kapatır. */
  confirmTimeout?: number;
  /** Sonucun dinlenmeye dönmeden önce kalma süresi (milisaniye). İşaretçiyi denetimin üstünde tutmak süreyi durdurur. 0 kapatır. */
  resultTimeout?: number;
  /** Denetimin dışına basmak açık soruyu iptal eder. Varsayılan true. */
  cancelOnOutsidePress?: boolean;
  disabled?: boolean;
  className?: string;
  /** Kök öğeyi alır; işlem beklerken odak da bu öğede durur. */
  ref?: Ref<HTMLDivElement>;
}

/** Soru belirdikten hemen sonraki basış, soruyu açan basışın devamıdır; yanıt sayılmaz. */
const ARM_MS = 280;
const { blur } = motionTokens;
type Bezier = [number, number, number, number];
const enter = [...motionTokens.ease.enter] as Bezier;
const standard = [...motionTokens.ease.standard] as Bezier;
/** Süreli yayları sertlik ve sönümle yeniden ifade eder; uçuş ortasında hedef değişince hız korunur. */
const physical = ({ visualDuration, bounce }: { visualDuration: number; bounce: number }): Transition => {
  const root = 2 * Math.PI / (visualDuration * 1.2);
  return { type: "spring", stiffness: root * root, damping: 2 * (1 - bounce) * root, mass: 1 };
};
/** Büyürken yeni içeriği biraz canlılıkla izler; küçülürken taşmadan oturur. */
const GROW = physical(motionTokens.spring.morph), SHRINK = physical(motionTokens.spring.smooth);

const subscribe = () => () => {};
function useReducedFlag() {
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  return !!useReducedMotion() && hydrated;
}

/*
 * Yüzler asla kaymaz ve ölçeklenmez: her biri doğal genişliğinde, hapın ortasında durur; yazı tabanı sabit kalır, genişlik
 * yaylanırken hapın kırpması yüzü açığa çıkarır. Eski yüz hızla solar; yenisinin parçaları okuma sırasıyla, küçük bir
 * bulanıklıktan çıkarak gelir.
 */
const faceVariants: Variants = {
  hidden: { opacity: 1 },
  shown: { opacity: 1, transition: { staggerChildren: motionTokens.stagger.item, delayChildren: .05 } },
  gone: { opacity: 0, filter: `blur(${blur.subtle}px)`, transition: { duration: motionTokens.duration.instant, ease: standard } },
};
const partVariants: Variants = {
  hidden: { opacity: 0, filter: `blur(${blur.soft}px)` },
  shown: { opacity: 1, filter: "blur(0px)", transition: { duration: .26, ease: enter } },
};
const reducedFace: Variants = { hidden: { opacity: 0 }, shown: { opacity: 1, transition: { duration: .14 } }, gone: { opacity: 0, transition: { duration: .1 } } };
const reducedPart: Variants = { hidden: { opacity: 1 }, shown: { opacity: 1 } };

type FaceKey = ConfirmMorphState | "counting";

function Face({ id, reduced, onSize, children, labelledBy }: { id: FaceKey; reduced: boolean; onSize: (id: FaceKey, width: number) => void; children: ReactNode; labelledBy?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const present = useIsPresent();
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node || !present) return;
    // Kesirli genişlik: yay tam hapın doğal genişliğine oturur ve auto'ya geçiş dikişsiz olur.
    const report = () => onSize(id, node.getBoundingClientRect().width);
    report();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(report);
    observer.observe(node);
    return () => observer.disconnect();
  }, [id, onSize, present]);
  return <motion.div ref={ref} className={styles.face} data-face={id} role={labelledBy ? "group" : undefined} aria-labelledby={labelledBy}
    variants={reduced ? reducedFace : faceVariants} initial="hidden" animate="shown" exit="gone" inert={!present || undefined}>{children}</motion.div>;
}

function Part({ reduced, className, children }: { reduced: boolean; className?: string; children: ReactNode }) {
  return <motion.span className={[styles.part, className].filter(Boolean).join(" ")} variants={reduced ? reducedPart : partVariants}>{children}</motion.span>;
}

/** İşlem tamamlandığı anda beliren, üstüne tik çizilen başarı diski. */
function Check({ reduced }: { reduced: boolean }) {
  return <svg className={styles.check} viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <motion.circle className={styles.checkDisc} cx="9" cy="9" r="8" style={{ transformOrigin: "9px 9px" }}
      initial={reduced ? false : { scale: .5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ scale: physical(motionTokens.spring.snappy), opacity: { duration: .12 } }} />
    <motion.path className={styles.checkTick} d="M5.6 9.3 7.8 11.4 12.4 6.7" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"
      initial={reduced ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: .3, ease: enter, delay: .14 }} />
  </svg>;
}

/** Geri sayımla boşalan halka. */
function Ring({ progress }: { progress: MotionValue<number> }) {
  return <svg className={styles.ring} viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle className={styles.ringTrack} cx="8" cy="8" r="6.25" strokeWidth="1.75" />
    <motion.circle className={styles.ringFill} cx="8" cy="8" r="6.25" strokeWidth="1.75" strokeLinecap="round" style={{ pathLength: progress, rotate: -90, transformOrigin: "8px 8px" }} />
  </svg>;
}

/** Yerinde değişen saniye: eski rakam yukarı solar, yenisi aşağıdan yükselir; sabit genişlikli rakamlarla genişlik korunur. */
function Seconds({ value, reduced }: { value: number; reduced: boolean }) {
  return <span className={styles.seconds}>
    <AnimatePresence initial={false} mode="popLayout">
      <motion.span key={value} className={styles.digit}
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: 6, filter: `blur(${blur.subtle}px)` }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={reduced ? { opacity: 0 } : { opacity: 0, y: -6, filter: `blur(${blur.subtle}px)` }}
        transition={{ duration: .22, ease: enter }}>{value}</motion.span>
    </AnimatePresence>
  </span>;
}

export function ConfirmMorph({
  label, icon, prompt, confirmLabel = "Sil", cancelLabel = "Vazgeç", pendingLabel = "Siliniyor", doneLabel = "Silindi", errorLabel = "İşlem tamamlanamadı",
  retryLabel = "Tekrar dene", undoLabel = "Geri al", undoingLabel = "Geri yükleniyor", tone = "danger", confirmMode = "press", holdDuration = 1000, countdown = 3, countdownLabel,
  onConfirm, onUndo, onCancel, state: stateProp, defaultState = "idle", onStateChange, confirmTimeout = 6000, resultTimeout = 5000, cancelOnOutsidePress = true,
  disabled = false, className, ref,
}: ConfirmMorphProps) {
  const reduced = useReducedFlag();
  const uid = useId();
  const promptId = `${uid}-prompt`;
  const holdHintId = `${uid}-hold`;
  const rootRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => rootRef.current as HTMLDivElement, []);

  const [inner, setInner] = useState<ConfirmMorphState>(defaultState);
  const state = stateProp ?? inner;
  const [working, setWorking] = useState<"confirm" | "undo">("confirm");
  const [counting, setCounting] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const faceKey: FaceKey = state === "confirming" && counting ? "counting" : state;

  const live = useRef({ state, onStateChange, controlled: stateProp !== undefined });
  useLayoutEffect(() => { live.current = { state, onStateChange, controlled: stateProp !== undefined }; });
  const pendingFocus = useRef(false);
  const run = useRef(0);
  const askedAt = useRef(0);

  const keepFocus = useCallback(() => {
    const root = rootRef.current;
    // Odak yüzler arasında denetimi izler, ama yalnız zaten içindeyse; zaman aşımı odağı başka yerden çalmaz.
    pendingFocus.current = !!root && (root.contains(document.activeElement) || document.activeElement === document.body);
  }, []);

  const go = useCallback((next: ConfirmMorphState) => {
    if (next !== "confirming") setCounting(false);
    if (next === live.current.state) return;
    keepFocus();
    if (next === "confirming") askedAt.current = performance.now();
    if (!live.current.controlled) setInner(next);
    live.current.state = next;
    live.current.onStateChange?.(next);
  }, [keepFocus]);

  // Yöneten üst bileşen durumu kendisi değiştirebilir; geri sayım buna dayanmaz.
  const [seenState, setSeenState] = useState(state);
  if (seenState !== state) {
    setSeenState(state);
    if (state !== "confirming") setCounting(false);
  }

  const toIdle = useCallback(() => { run.current++; go("idle"); }, [go]);

  const perform = useCallback(async (kind: "confirm" | "undo") => {
    const handler = kind === "confirm" ? onConfirm : onUndo;
    const token = ++run.current;
    setWorking(kind);
    setCounting(false);
    let result: void | Promise<unknown> | undefined;
    try { result = handler?.(); }
    catch { go("error"); setAnnouncement(errorLabel); return; }
    if (result && typeof (result as Promise<unknown>).then === "function") {
      go("pending");
      setAnnouncement(kind === "confirm" ? pendingLabel : undoingLabel);
      try { await result; }
      catch {
        if (token !== run.current) return;
        go("error");
        setAnnouncement(errorLabel);
        return;
      }
      if (token !== run.current) return;
    }
    if (kind === "undo") { go("idle"); setAnnouncement("İşlem geri alındı"); return; }
    go("done");
    setAnnouncement(onUndo ? `${doneLabel}. ${undoLabel} düğmesi kullanılabilir.` : doneLabel);
  }, [doneLabel, errorLabel, go, onConfirm, onUndo, pendingLabel, undoLabel, undoingLabel]);

  const cancel = useCallback(() => { onCancel?.(); toIdle(); setAnnouncement("İptal edildi"); }, [onCancel, toIdle]);
  const expire = useRef(() => {});
  useLayoutEffect(() => { expire.current = () => { if (live.current.state === "confirming") cancel(); else toIdle(); }; });

  /* Biçim: genişliği o anki yüze yaylanan tek bir hap. Dinlenirken auto'dur; böylece hidrasyondan önce de doğru çizilir. */
  const width = useMotionValue<number | "auto">("auto");
  const target = useRef(0);
  const flight = useRef(0);
  // Yalnız mevcut yüz bildirir (ayrılan yüz gözlemeyi bırakır); bu yüzden her bildirim o anki yüzün genişliğidir.
  const onFaceSize = useCallback((_id: FaceKey, w: number) => {
    if (Math.abs(w - target.current) < .25) return;
    const from = target.current;
    target.current = w;
    if (!from || reduced) { flight.current++; width.jump("auto"); return; }
    const now = width.get();
    if (now === "auto") width.jump(from);
    const token = ++flight.current;
    animate(width, w, w > (typeof now === "number" ? now : from) ? GROW : SHRINK).then(() => { if (token === flight.current) width.jump("auto"); });
  }, [reduced, width]);

  /* Zaman aşımı görünmez bir saat olarak işler. Denetimin üstündeki işaretçi ve gizli sekme saati durdurur. */
  const drain = useMotionValue(1);
  const clock = useRef<AnimationPlaybackControls | null>(null);
  const holds = useRef({ hover: false, hidden: false });
  const timeout = state === "confirming" && !counting ? confirmTimeout : state === "done" || state === "error" ? resultTimeout : 0;
  const sync = useCallback(() => {
    const control = clock.current;
    if (!control) return;
    const held = holds.current.hover || holds.current.hidden;
    if (held) control.pause(); else control.play();
  }, []);
  useEffect(() => {
    if (!timeout) return;
    drain.jump(1);
    const control = animate(drain, 0, { duration: timeout / 1000, ease: "linear" });
    clock.current = control;
    control.then(() => { if (clock.current === control) { clock.current = null; expire.current(); } });
    sync();
    return () => { if (clock.current === control) clock.current = null; control.stop(); };
  }, [drain, state, sync, timeout]);
  useEffect(() => {
    const onVisibility = () => { holds.current.hidden = document.hidden; sync(); };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [sync]);

  /* Geri sayım: yanıttan sonra kısa bir süre; boşalan halka ve akan saniyelerle çizilir. */
  const remaining = useMotionValue(1);
  const [seconds, setSeconds] = useState(countdown);
  const performRef = useRef(perform);
  useLayoutEffect(() => { performRef.current = perform; });
  useMotionValueEvent(remaining, "change", value => setSeconds(Math.max(1, Math.ceil(value * countdown))));
  useEffect(() => {
    if (!counting) return;
    remaining.jump(1);
    const control = animate(remaining, 0, { duration: countdown, ease: "linear" });
    control.then(() => { void performRef.current("confirm"); });
    return () => control.stop();
  }, [counting, countdown, remaining]);

  /* Basılı tutma: basılıyken onay düğmesi soldan tehlike rengiyle dolar; erken bırakılırsa geri boşalır. */
  const hold = useMotionValue(0);
  const holding = useRef<AnimationPlaybackControls | null>(null);
  const fillClip = useTransform(hold, value => `inset(0 ${(1 - value) * 100}% 0 0 round 999px)`);
  const startHold = () => {
    if (holding.current) return;
    const control = animate(hold, 1, { duration: holdDuration / 1000 * (1 - hold.get()), ease: "linear" });
    holding.current = control;
    control.then(() => {
      if (holding.current !== control) return;
      holding.current = null;
      void perform("confirm");
    });
  };
  const releaseHold = () => {
    const control = holding.current;
    if (!control) return;
    holding.current = null;
    control.stop();
    if (hold.get() < 1) {
      animate(hold, 0, reduced ? { duration: 0 } : { type: "spring", visualDuration: .3, bounce: 0 });
      setAnnouncement("İşlem için düğmeyi bırakmadan basılı tutmaya devam et");
    }
  };
  useEffect(() => { if (state !== "confirming") { holding.current?.stop(); holding.current = null; hold.jump(0); } }, [hold, state]);

  const shownCountdown = countdownLabel ?? `${pendingLabel}:`;
  const answer = () => {
    if (performance.now() - askedAt.current < ARM_MS) return;
    if (confirmMode === "countdown") {
      keepFocus();
      setCounting(true);
      setAnnouncement(`${shownCountdown} ${countdown} saniye`);
      return;
    }
    void perform("confirm");
  };

  // Dışarıya basmak soruyu "hayır" diye yanıtlar.
  useEffect(() => {
    if (state !== "confirming" || !cancelOnOutsidePress) return;
    const down = (event: PointerEvent) => { if (!rootRef.current?.contains(event.target as Node)) cancel(); };
    document.addEventListener("pointerdown", down);
    return () => document.removeEventListener("pointerdown", down);
  }, [cancel, cancelOnOutsidePress, state]);

  // Odak dönüşümle birlikte taşınır: soru sırasında Onay, geri sayım ve işlem sırasında kök, sonuçta Geri al ya da Tekrar dene, dinlenirken tetikleyici.
  useLayoutEffect(() => {
    if (!pendingFocus.current) return;
    pendingFocus.current = false;
    const root = rootRef.current;
    if (!root) return;
    const face = root.querySelector<HTMLElement>(`[data-face="${faceKey}"]`);
    const autofocus = face?.querySelector<HTMLElement>("[data-autofocus]:not(:disabled)");
    (autofocus ?? root).focus({ preventScroll: true });
  }, [faceKey]);

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      if (state === "confirming") { event.preventDefault(); event.stopPropagation(); cancel(); }
      else if (state === "done" || state === "error") { event.preventDefault(); event.stopPropagation(); toIdle(); }
      return;
    }
    // Enter, kendi düğmesi dışında sorunun her yerinden "evet" der (Vazgeç düğmesi hep Vazgeç demektir).
    if (event.key === "Enter" && state === "confirming" && !event.repeat && !(event.target instanceof HTMLButtonElement)) {
      event.preventDefault();
      if (counting) void perform("confirm");
      else if (confirmMode !== "hold") answer();
    }
  };

  const holdKeys = (event: ReactKeyboardEvent<HTMLButtonElement>, down: boolean) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    if (down) { if (!event.repeat) startHold(); }
    else releaseHold();
  };
  const holdPointer = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    startHold();
  };

  const shownPrompt = prompt ?? <>{label}?</>;
  const confirmButton = confirmMode === "hold"
    ? <button type="button" className={styles.confirm} data-autofocus aria-describedby={holdHintId}
      onPointerDown={holdPointer} onPointerUp={releaseHold} onPointerCancel={releaseHold} onLostPointerCapture={releaseHold}
      onKeyDown={event => holdKeys(event, true)} onKeyUp={event => holdKeys(event, false)} onBlur={releaseHold} onContextMenu={event => event.preventDefault()}>
      <span>{confirmLabel}</span>
      <motion.span className={styles.fill} style={{ clipPath: fillClip }} aria-hidden="true"><span>{confirmLabel}</span></motion.span>
    </button>
    : <button type="button" className={styles.confirm} data-autofocus onClick={answer} onKeyDown={event => { if (event.repeat) event.preventDefault(); }}>{confirmLabel}</button>;

  const face = (() => {
    switch (faceKey) {
      case "confirming": return <>
        <Part reduced={reduced} className={styles.prompt}><span id={promptId}>{shownPrompt}</span></Part>
        <Part reduced={reduced}><button type="button" className={styles.secondary} onClick={cancel}>{cancelLabel}</button></Part>
        <Part reduced={reduced}>{confirmButton}</Part>
        {confirmMode === "hold" && <span id={holdHintId} className={styles.srOnly}>Basılı tut</span>}
      </>;
      case "counting": return <>
        <Part reduced={reduced} className={styles.status}>
          <Ring progress={remaining} />
          <span className={styles.statusText}>{shownCountdown} <Seconds value={seconds} reduced={reduced} /></span>
        </Part>
        <Part reduced={reduced}><button type="button" className={styles.secondary} onClick={cancel}>{cancelLabel}</button></Part>
      </>;
      case "pending": return <Part reduced={reduced} className={styles.status}>
        <LoaderCircle className={styles.spinner} size={16} strokeWidth={1.75} aria-hidden="true" />
        <span className={styles.statusText}>{working === "undo" ? undoingLabel : pendingLabel}</span>
      </Part>;
      case "done": return <>
        <Part reduced={reduced} className={styles.status}><Check reduced={reduced} /><span className={styles.statusText}>{doneLabel}</span></Part>
        {onUndo && <Part reduced={reduced}><button type="button" className={styles.secondary} data-autofocus onClick={() => void perform("undo")}>{undoLabel}</button></Part>}
      </>;
      case "error": return <>
        <Part reduced={reduced} className={styles.status}><CircleAlert className={styles.alert} size={16} strokeWidth={1.75} aria-hidden="true" /><span className={styles.statusText}>{errorLabel}</span></Part>
        <Part reduced={reduced}><button type="button" className={styles.secondary} data-autofocus onClick={() => void perform(working)}>{retryLabel}</button></Part>
      </>;
      default: return <Part reduced={reduced}><button type="button" className={styles.trigger} data-autofocus disabled={disabled}
        onClick={() => { setAnnouncement(typeof shownPrompt === "string" ? shownPrompt : ""); go("confirming"); }}>
        {icon && <span className={styles.icon} aria-hidden="true">{icon}</span>}
        <span>{label}</span>
      </button></Part>;
    }
  })();

  return <div ref={rootRef} className={[styles.root, className].filter(Boolean).join(" ")} data-state={state} data-face={faceKey} data-tone={tone} data-mode={confirmMode}
    data-disabled={disabled || undefined} tabIndex={-1} onKeyDown={onKeyDown} aria-busy={state === "pending" || undefined}
    onPointerEnter={() => { holds.current.hover = true; sync(); }} onPointerLeave={() => { holds.current.hover = false; sync(); }}
    onPointerCancel={() => { holds.current.hover = false; sync(); }}>
    <motion.div className={styles.surface} style={{ width }}>
      <AnimatePresence initial={false}>
        <Face key={faceKey} id={faceKey} reduced={reduced} onSize={onFaceSize} labelledBy={faceKey === "confirming" ? promptId : undefined}>{face}</Face>
      </AnimatePresence>
    </motion.div>
    <span className={styles.srOnly} role="status" aria-live="polite">{announcement}</span>
  </div>;
}

export default ConfirmMorph;
