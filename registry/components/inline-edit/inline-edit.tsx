"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import type { ChangeEvent, FocusEvent as ReactFocusEvent, KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent, ReactNode } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import type { TargetAndTransition, Variants } from "motion/react";
import { Check, CircleAlert, Pencil, X } from "lucide-react";
import { motionTokens } from "../lib/motion-tokens";
import styles from "./inline-edit.module.css";

/**
 * Tıklayınca düzenlenen metin: proje adı ya da açıklaması gibi, değişmekten çok okunan ad ve kısa alanlar için.
 * Metin aynı ölçülerle yerinde alana dönüşür, çevresindeki hiçbir şey kaymaz; kutu yazdıkça büyür. Enter iyimser kaydeder,
 * kayıt bitince bir onay işareti çizilir; Escape metni geri alır. Kayıt başarısız olursa son kaydedilen değer döner ve nedeni söylenir.
 * Birkaç alan birlikte kaydedilecekse normal bir form kullanın.
 */
export interface InlineEditProps {
  /** Kayıtlı değer. Dışarıdan gelen yeni değer, düzenleme sürmüyorken metnin yerini alır. */
  value: string;
  /** Yeni değeri kaydeder. Kaydediliyor durumunu göstermek için promise döndürün, geri almak için reddedin. */
  onSave: (next: string) => void | Promise<unknown>;
  /** Erişilebilir ad, örneğin “Proje adı”. */
  label: string;
  /** Taslak kaydedilemiyorsa bir ileti döndürür. */
  validate?: (next: string) => string | null | undefined;
  /** Değer boşken gösterilir. */
  placeholder?: string;
  /** Birkaç satıra sarılır ve boyu uzar. Enter yine kaydeder; Shift+Enter satır sonu ekler. */
  multiline?: boolean;
  /** Ad ve başlıklar için `title`, açıklamalar için `body`. */
  variant?: "title" | "body";
  /** Metni taşıyan öğe; başlık başlık olarak kalabilsin diye. */
  as?: "span" | "p" | "h1" | "h2" | "h3";
  className?: string;
}

type Phase = "idle" | "saving" | "saved" | "failed";

const enter = [...motionTokens.ease.enter] as [number, number, number, number];
const standard = [...motionTokens.ease.standard] as [number, number, number, number];
const blur = (px: number) => `blur(${px}px)`;
const noop = () => () => {};

/** Her çizimde güncel kalan, ama kimliği değişmeyen bir geri çağrı. Etkilerin bağımlılık listesine girmeden son durumu okur (React'in `useEffectEvent`'i yerine; eski React türleriyle de derlenir). */
function useLatestCallback<Args extends unknown[]>(callback: (...args: Args) => void) {
  const latest = useRef(callback);
  useLayoutEffect(() => { latest.current = callback; });
  return useCallback((...args: Args) => latest.current(...args), []);
}
/** Yazarken hedef saniyede birçok kez değişir; çerçeve aşmayan daha hızlı bir yayla izler ve hızlı yazanı yakalar. */
const typingSpring = { ...motionTokens.spring.snappy, visualDuration: motionTokens.duration.fast, bounce: 0 };

/** Azaltılmış hareket yalnızca hidrasyondan sonra sayılır; sunucu ile ilk istemci çıktısı hep aynı kalır. */
function useReduced() {
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const reduced = useReducedMotion() ?? false;
  return hydrated && reduced;
}

/** Metin yumuşak bir bulanıklıktan yükselerek gelir. Geri alma ters yönde işler: eski sözcükler aşağı düşer, kayıtlı olanlar yukarıdan girer. */
const textMotion: Variants = {
  enter: (direction: number) => ({ opacity: 0, y: `${direction * .3}em`, filter: blur(motionTokens.blur.soft) }),
  rest: { opacity: 1, y: "0em", filter: blur(0), transition: { duration: motionTokens.duration.standard, ease: enter } },
  exit: (direction: number) => ({ opacity: 0, y: `${direction * -.3}em`, filter: blur(motionTokens.blur.subtle), transition: { duration: motionTokens.duration.fast, ease: standard } }),
};
const textFade: Variants = { enter: { opacity: 0 }, rest: { opacity: 1, transition: { duration: motionTokens.duration.fast } }, exit: { opacity: 0, transition: { duration: motionTokens.duration.instant } } };
const rest: TargetAndTransition = { opacity: 1, scale: 1, filter: blur(0) };
const iconIn: TargetAndTransition = { opacity: 0, scale: .6, filter: blur(motionTokens.blur.subtle) };
const iconOut: TargetAndTransition = { ...iconIn, transition: { duration: motionTokens.duration.fast, ease: standard } };
const fadeIn: TargetAndTransition = { opacity: 0 };
const fadeOut: TargetAndTransition = { opacity: 0, transition: { duration: motionTokens.duration.instant } };
/** Ölçek yayla gider; saydamlık ve bulanıklık ara değerle gider, bulanıklık hiç sıfırın altına sarkmaz. */
const iconEnter = { ...motionTokens.spring.snappy, opacity: { duration: motionTokens.duration.fast, ease: enter }, filter: { duration: motionTokens.duration.fast, ease: enter } };

/** Onay işareti kısa çizgisinden başlayarak, elle yazılır gibi kendini çizer. */
function DrawnCheck({ reduced }: { reduced: boolean }) {
  return <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <motion.path d="M4 12.5l5 5L20 6.5" initial={reduced ? false : { pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ pathLength: { duration: .32, ease: enter, delay: .06 }, opacity: { duration: .05, delay: .06 } }} />
  </svg>;
}

/** Sözcükler yükselirken yüksekliği yayla açılıp kapanan ileti satırı; hata sayfayı tek karede itmez. */
function Reveal({ id, message, reduced }: { id: string; message: { key: string; tone: "error" | "failed"; node: ReactNode } | null; reduced: boolean }) {
  const inner = useRef<HTMLSpanElement>(null);
  const height = useMotionValue(0);
  useEffect(() => {
    const node = inner.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    let measured = false;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const next = entry.borderBoxSize?.[0]?.blockSize ?? node.offsetHeight;
      if (!measured || reduced) { measured = true; height.jump(next); return; }
      animate(height, next, motionTokens.spring.smooth);
    });
    observer.observe(node, { box: "border-box" });
    return () => { observer.disconnect(); height.stop(); };
  }, [height, reduced]);
  return <motion.span className={styles.reveal} style={{ height }}>
    <span ref={inner} id={id} className={styles.revealInner} aria-live="polite">
      <AnimatePresence mode="popLayout" initial={false} custom={1}>
        {message && <motion.span key={message.key} className={styles.message} data-tone={message.tone} custom={1} variants={reduced ? textFade : textMotion} initial="enter" animate="rest" exit="exit">{message.node}</motion.span>}
      </AnimatePresence>
    </span>
  </motion.span>;
}

type CaretDocument = Document & {
  caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null;
  caretRangeFromPoint?: (x: number, y: number) => Range | null;
};

export function InlineEdit({ value, onSave, label, validate, placeholder = "", multiline = false, variant = "title", as: Tag = "span", className }: InlineEditProps) {
  const reduced = useReduced();
  const ids = useId();
  const displayHintId = `${ids}-display`, editHintId = `${ids}-edit`, messageId = `${ids}-message`;
  const [committed, setCommitted] = useState(value);
  const [shown, setShown] = useState(value);
  const [seen, setSeen] = useState(value);
  const [layer, setLayer] = useState({ key: 0, direction: 1 });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const [flash, setFlash] = useState<"on" | "off" | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const display = useRef<HTMLButtonElement>(null);
  const control = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const selection = useRef<number | "all" | null>(null);
  const focusDisplay = useRef(false);
  const saveRun = useRef(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const frame = useRef<HTMLSpanElement>(null);
  const box = useRef<HTMLSpanElement>(null);
  // Tek satır: yerleşim kutusu ve girdi yeni genişliği hemen alır, girdi hiç kaymaz; görünen çerçeve arkasından yayla gelir.
  // Çok satır: kutunun yüksekliği yayla değişir, alttaki içerik süzülür; metin alanı ihtiyacı olan yeri zaten bulur.
  // İkisi de doğal boyutla ("100%", "auto") başlar; sunucu çıktısı hiçbir betik çalışmadan doğrudur.
  const frameWidth = useMotionValue<number | string>("100%");
  const boxHeight = useMotionValue<number | string>("auto");
  const size = useRef(0);
  const wasEditing = useRef(false);

  // Dışarıdan gelen yeni değer metnin yerini alır; kişi yazıyorsa ya da kayıt sürüyorsa almaz.
  if (value !== seen) {
    setSeen(value);
    if (value !== committed) {
      setCommitted(value);
      if (!editing && phase !== "saving" && value !== shown) { setShown(value); setLayer(current => ({ key: current.key + 1, direction: 1 })); }
    }
  }

  const layerText = editing ? draft : shown;
  const saving = phase === "saving";
  const later = (fn: () => void, ms: number) => { timers.current.push(setTimeout(fn, ms)); };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const naturalSize = () => { const node = display.current; return node ? parseFloat(getComputedStyle(node)[multiline ? "height" : "width"]) : 0; };
  /** Boyamadan önce doğrudan DOM'a yazılır; çünkü hareket değeri stile ancak sonraki karede ulaşır ve yanlış boyutta tek kare bile görünür. */
  const snap = (next: number) => {
    const field = control.current;
    if (multiline && field) { field.style.height = `${next}px`; field.scrollTop = 0; }
    const surface = multiline ? box.current : frame.current;
    if (surface) surface.style[multiline ? "height" : "width"] = `${next}px`;
    (multiline ? boxHeight : frameWidth).jump(next);
  };

  // Kişinin yol açtığı değişiklikler (yazma, mod değiştirme, geri alma) ekrandaki boyuttan yayla başlar. Yerleşim etkisinde ölçülür; yeni boyut hiçbir karede erken görünmez.
  const onContentChange = useLatestCallback(() => {
    const next = naturalSize();
    const previous = size.current;
    const typing = editing && wasEditing.current;
    size.current = next;
    wasEditing.current = editing;
    if (!next) return;
    const field = control.current;
    if (multiline && field) { field.style.height = `${next}px`; field.scrollTop = 0; }
    const target = multiline ? boxHeight : frameWidth;
    if (!previous || reduced || typeof target.get() !== "number") { snap(next); return; }
    if (Math.abs(next - previous) < .1) return;
    animate(target, next, multiline ? motionTokens.spring.smooth : typing ? typingSpring : motionTokens.spring.morph);
  });
  useLayoutEffect(() => { onContentChange(); }, [layerText, editing, multiline, reduced]);

  // Geç yüklenen bir yazı tipi ya da yeniden boyutlanan kap, animasyonsuz hemen izlenir.
  const onResize = useLatestCallback(() => {
    const next = naturalSize();
    if (!next || Math.abs(next - size.current) < .1) return;
    size.current = next;
    snap(next);
  });
  useEffect(() => {
    const node = display.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    // Kenarlık kutusu; düzenlerken eklenen boşluk (içerik değil, dolgu) da fark edilsin.
    const observer = new ResizeObserver(() => onResize());
    observer.observe(node, { box: "border-box" });
    return () => observer.disconnect();
  }, []);

  // Odak moda uyar: alana, imleç metne tıklanan yerde olacak biçimde girer; Enter ya da Escape sonrası metne döner.
  useLayoutEffect(() => {
    const field = control.current;
    if (editing && field && selection.current !== null) {
      const at = selection.current;
      selection.current = null;
      field.focus({ preventScroll: true });
      if (at === "all") field.select(); else field.setSelectionRange(at, at);
    }
    if (!editing && focusDisplay.current) { focusDisplay.current = false; display.current?.focus({ preventScroll: true }); }
  });

  function startEdit(at: number | "all", text = shown) {
    if (editing || saving) return;
    setDraft(text);
    setEditing(true);
    setError(null);
    setFailed(null);
    setFlash(null);
    if (phase !== "idle") setPhase("idle");
    selection.current = at;
  }

  /** İmleç, bir metin alanındaki gibi tıklanan karaktere iner. */
  function caretAt(x: number, y: number) {
    const node = display.current?.querySelector(`[data-layer="${layer.key}"]`)?.firstChild;
    if (!node || !shown) return shown.length;
    const doc = document as CaretDocument;
    const position = doc.caretPositionFromPoint?.(x, y);
    if (position) return position.offsetNode === node ? Math.min(position.offset, shown.length) : shown.length;
    const range = doc.caretRangeFromPoint?.(x, y);
    return range && range.startContainer === node ? Math.min(range.startOffset, shown.length) : shown.length;
  }

  function onDisplayClick(event: ReactMouseEvent<HTMLButtonElement>) {
    if (saving) return;
    // Klavyeyle etkinleştirme her şeyi seçer, yeniden yazmaya hazırdır; tıklama imleci tıklanan yere koyar.
    startEdit(event.detail === 0 ? "all" : caretAt(event.clientX, event.clientY));
  }

  const clean = (text: string) => multiline ? text.trim() : text.replace(/\s+/g, " ").trim();

  function submit(source: "key" | "button" | "blur") {
    const next = clean(draft);
    const problem = validate?.(next) || null;
    if (problem) { setError(problem); if (source !== "blur") control.current?.focus(); return; }
    setEditing(false);
    setError(null);
    if (source !== "blur") focusDisplay.current = true;
    // Kırpılan boşluklar metni tek karede kaydırırdı; temizlenen değer metin hareketiyle gelir.
    if (next !== draft) setLayer(current => ({ key: current.key + 1, direction: 1 }));
    if (next === shown) return;
    const previous = committed;
    const run = ++saveRun.current;
    setShown(next);
    setPhase("saving");
    setAnnouncement(`${label} kaydediliyor`);
    Promise.resolve().then(() => onSave(next)).then(() => {
      if (run !== saveRun.current) return;
      setCommitted(next);
      setPhase("saved");
      setAnnouncement(`${label} kaydedildi`);
      later(() => setPhase(current => current === "saved" ? "idle" : current), 1800);
    }, () => {
      if (run !== saveRun.current) return;
      setShown(previous);
      setLayer(current => ({ key: current.key + 1, direction: -1 }));
      setPhase("failed");
      setFailed(next);
      setFlash("on");
      setAnnouncement("");
      later(() => setFlash(current => current === "on" ? "off" : current), 1400);
      later(() => setFlash(current => current === "off" ? null : current), 2000);
    });
  }

  function cancel() {
    setEditing(false);
    setError(null);
    focusDisplay.current = true;
    if (draft !== shown) setLayer(current => ({ key: current.key + 1, direction: -1 }));
  }

  function retry() {
    if (!failed) return;
    startEdit(failed.length, failed);
  }

  function onChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const next = event.target.value;
    setDraft(next);
    if (error) setError(validate?.(clean(next)) || null);
  }

  function onKeyDown(event: ReactKeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
    if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); cancel(); return; }
    if (event.key === "Enter" && !event.nativeEvent.isComposing && !(multiline && event.shiftKey)) { event.preventDefault(); submit("key"); }
  }

  // Bileşenden çıkmak, yeniden adlandırmadaki gibi kaydeder; pencere değiştirmek kaydetmez.
  function onBlur(event: ReactFocusEvent<HTMLDivElement>) {
    if (!editing) return;
    const next = event.relatedTarget as Node | null;
    if (next && root.current?.contains(next)) return;
    if (!next && !document.hasFocus()) return;
    submit("blur");
  }

  const message = error
    ? { key: `error:${error}`, tone: "error" as const, node: <><CircleAlert className={styles.messageIcon} size={14} strokeWidth={2} aria-hidden="true" /><span>{error}</span></> }
    : failed && !editing
      ? { key: `failed:${failed}`, tone: "failed" as const, node: <><CircleAlert className={styles.messageIcon} size={14} strokeWidth={2} aria-hidden="true" /><span>{`“${failed}” kaydedilemedi, son kaydedilen değer geri geldi.`} <button type="button" className={styles.retry} onClick={retry}>Yeniden dene</button></span></> }
      : null;
  const slot = editing ? "edit" : phase;
  const describedBy = (hint: string) => [hint, message ? messageId : null].filter(Boolean).join(" ");
  const fieldProps = {
    className: styles.control, value: draft, onChange, onKeyDown, placeholder, "aria-label": label, "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy(editHintId), autoComplete: "off", spellCheck: variant === "body",
  };

  return <div ref={root} className={[styles.root, className].filter(Boolean).join(" ")} data-variant={variant} data-multiline={multiline || undefined} data-editing={editing || undefined}
    data-phase={phase} data-invalid={error ? "" : undefined} data-flash={flash ?? undefined} onBlur={onBlur}>
    <Tag className={styles.line}>
      <motion.span ref={box} className={styles.box} style={multiline ? { height: boxHeight } : undefined}>
        {/* Düzenlerken metin akışta kalır; gizlidir ve taslağı yansıtır. Böylece kutuyu boyutlandırır ve Escape'te hareketle geri dönebilir. */}
        <button ref={display} type="button" className={styles.display} onClick={onDisplayClick} tabIndex={editing ? -1 : undefined}
          aria-label={`${label}: ${shown || placeholder}`} aria-describedby={describedBy(displayHintId)} aria-disabled={saving || undefined}>
          <span className={styles.layer} data-empty={layerText ? undefined : ""}>
            <AnimatePresence mode="popLayout" initial={false} custom={layer.direction}>
              <motion.span key={layer.key} data-layer={layer.key} className={styles.text} custom={layer.direction} variants={reduced ? textFade : textMotion} initial="enter" animate="rest" exit="exit">
                {/* Sıfır genişlikli boşluk satır kutusunu korur; boş alan hiç çökmez. */}
                {(layerText || placeholder || "\u200b") + (multiline && editing ? "\u200b" : "")}
              </motion.span>
            </AnimatePresence>
          </span>
        </button>
        {editing && (multiline
          ? <textarea ref={node => { control.current = node; }} {...fieldProps} rows={1} enterKeyHint="done" />
          : <input ref={node => { control.current = node; }} {...fieldProps} type="text" enterKeyHint="done" />)}
        <motion.span ref={frame} className={styles.frame} style={multiline ? undefined : { width: frameWidth }}>
          <span className={styles.slot}>
            <AnimatePresence initial={false}>
              <motion.span key={slot} className={styles.slotItem} initial={reduced ? fadeIn : iconIn} animate={rest} exit={reduced ? fadeOut : iconOut} transition={reduced ? { duration: motionTokens.duration.fast } : iconEnter}>
                {slot === "edit" ? <span className={styles.actions}>
                  <button type="button" className={styles.save} aria-label={`${label} kaydet`} onPointerDown={event => event.preventDefault()} onClick={() => submit("button")}><Check size={15} strokeWidth={2} aria-hidden="true" /></button>
                  <button type="button" className={styles.cancel} aria-label="Düzenlemeyi iptal et" onPointerDown={event => event.preventDefault()} onClick={cancel}><X size={15} strokeWidth={2} aria-hidden="true" /></button>
                </span>
                  : slot === "saving" ? <span className={styles.spinner} aria-hidden="true" />
                  : slot === "saved" ? <span className={styles.saved} aria-hidden="true"><DrawnCheck reduced={reduced} /></span>
                  : slot === "failed" ? <CircleAlert className={styles.failedIcon} size={16} strokeWidth={1.75} aria-hidden="true" />
                  : <Pencil className={styles.pencil} size={14} strokeWidth={1.75} aria-hidden="true" onClick={() => startEdit(shown.length)} />}
              </motion.span>
            </AnimatePresence>
          </span>
        </motion.span>
      </motion.span>
    </Tag>
    <Reveal id={messageId} message={message} reduced={reduced} />
    <span id={displayHintId} className={styles.srOnly}>Düzenlemek için etkinleştirin.</span>
    <span id={editHintId} className={styles.srOnly}>{multiline ? "Enter kaydeder, Shift+Enter satır sonu ekler, Escape iptal eder." : "Enter kaydeder, Escape iptal eder."}</span>
    <span className={styles.srOnly} role="status">{announcement}</span>
  </div>;
}

export default InlineEdit;
