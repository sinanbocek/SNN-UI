"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion, type Variants } from "motion/react";
import { motionTokens } from "../lib/motion-tokens";
import { MorphLoader } from "../morph-loader/morph-loader";
import styles from "./action-morph.module.css";

export interface ActionMorphOption { id: string; label: string }

export interface ActionMorphAction {
  id: string;
  label: string;
  description?: string;
  /** Eylem simgesi; çağıran verir. */
  icon?: ReactNode;
  /** Tek büyük Latin harf ("T"): menü açıkken o eylemi açar. Harf `event.code` ile okunur. */
  shortcut?: string;
  /** Yazma yüzünün başlığı ("Ne yapılacak?"). Yoksa eylemin adı. */
  title?: string;
  placeholder?: string;
  multiline?: boolean;
  submitLabel?: string;
  /** İsteğe bağlı seçenek grubu (örneğin "Ne zaman"). Etiketler uygulamadan gelir. */
  options?: ActionMorphOption[];
  optionsLabel?: string;
  /** Başarı iletisi ("Görev eklendi"). */
  successMessage?: string;
}

export interface ActionMorphSubmission { actionId: string; text: string; optionId?: string }

export interface ActionMorphProps {
  actions: ActionMorphAction[];
  /** Gönderimi proje yapar. Reddedilirse form açık kalır, yazılan silinmez. */
  onSubmit: (submission: ActionMorphSubmission) => void | Promise<void>;
  label?: string;
  menuTitle?: string;
  backLabel?: string;
  sendingLabel?: string;
  emptyMessage?: string;
  errorMessage?: string;
  /** Yüzeyin büyüyeceği köşe. Bileşen kendini konumlamaz; çağıran onu sabit bir kapsayıcıya koyar. */
  corner?: "bottom-right" | "bottom-left";
  /** Onayın ekranda kalma süresi, ms. */
  doneDuration?: number;
  className?: string;
}

type View = "closed" | "menu" | "compose" | "done";
interface Draft { text: string; option?: string }

const CLOSED = { width: 56, height: 56 };

/** Her yüz boyutunu yalnız kendisi güncel iken bildirir. */
function Face({ active, onSize, className, width, children, custom, variants }: { active: boolean; onSize: (size: { width: number; height: number }) => void; className: string; width: number | string; children: ReactNode; custom: number; variants: Variants }) {
  const node = useRef<HTMLDivElement>(null);
  const report = useRef(onSize);
  report.current = onSize;
  useLayoutEffect(() => {
    const element = node.current;
    if (!active || !element) return;
    const measure = () => report.current({ width: element.offsetWidth, height: element.offsetHeight });
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [active]);
  return <motion.div ref={node} className={className} style={{ width }} custom={custom} variants={variants} initial="enter" animate="rest" exit="exit">{children}</motion.div>;
}

const plusPath = "M12 5v14M5 12h14";

/** Köşede duran yuvarlak "ekle" düğmesi: basınca aynı yüzey eylem menüsüne, eylem seçilince satır içi forma dönüşür; gönderilince düğmeye küçülüp onay gösterir. Çok alanlı uzun form için `dialog`/`drawer` kullanılır. */
export function ActionMorph({
  actions, onSubmit, label = "Ekle", menuTitle = "Hızlı ekle", backLabel = "Geri", sendingLabel = "Gönderiliyor",
  emptyMessage = "Önce bir şey yazın", errorMessage = "Eklenemedi, yeniden deneyin", corner = "bottom-right", doneDuration = 1600, className,
}: ActionMorphProps) {
  const reduced = useReducedMotion();
  const ids = useId();
  const [view, setView] = useState<View>("closed");
  const [actionId, setActionId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [sending, setSending] = useState(false);
  const [problem, setProblem] = useState<"empty" | "failed" | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [doneMessage, setDoneMessage] = useState("");
  const [size, setSize] = useState(CLOSED);
  const [direction, setDirection] = useState(1);
  const [hot, setHot] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const fab = useRef<HTMLButtonElement>(null);
  const field = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const opened = useRef(false);
  const doneTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const action = actions.find(item => item.id === actionId) ?? null;
  const draft: Draft = (actionId ? drafts[actionId] : undefined) ?? { text: "", option: action?.options?.[0]?.id };
  const open = view === "menu" || view === "compose";

  const go = useCallback((next: View, deeper: boolean) => { setDirection(deeper ? 1 : -1); setView(next); }, []);
  const close = useCallback(() => { setProblem(null); go("closed", false); }, [go]);

  // Odak: her yeni yüze taşınır; kapanınca düğmeye döner.
  useEffect(() => {
    if (view === "menu") { opened.current = true; (actionId && itemRefs.current[actionId] ? itemRefs.current[actionId] : itemRefs.current[actions[0]?.id ?? ""])?.focus(); }
    else if (view === "compose") field.current?.focus();
    else if (opened.current) fab.current?.focus();
  // Odak yalnız yüz değişince taşınır.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  // Dışarı basmak da kapatır (gönderilirken değil).
  useEffect(() => {
    if (!open || sending) return;
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) close(); };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open, sending, close]);

  useEffect(() => () => clearTimeout(doneTimer.current), []);

  const choose = (item: ActionMorphAction) => { setActionId(item.id); setProblem(null); go("compose", true); };

  const onMenuKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = actions.findIndex(item => item.id === (document.activeElement as HTMLElement | null)?.dataset.actionId);
    const focusAt = (at: number) => { event.preventDefault(); itemRefs.current[actions[(at + actions.length) % actions.length]!.id]?.focus(); };
    if (event.key === "ArrowDown") focusAt(index + 1);
    else if (event.key === "ArrowUp") focusAt(index - 1);
    else if (event.key === "Home") focusAt(0);
    else if (event.key === "End") focusAt(actions.length - 1);
    else if (!event.ctrlKey && !event.metaKey && !event.altKey) {
      const match = actions.find(item => item.shortcut && event.code === `Key${item.shortcut}`);
      if (match) { event.preventDefault(); choose(match); }
    }
  };

  const onRootKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Escape" || !open || sending) return;
    event.preventDefault();
    if (view === "compose") go("menu", false); else close();
  };

  const patch = (next: Partial<Draft>) => { if (actionId) { setDrafts(current => ({ ...current, [actionId]: { ...(current[actionId] ?? { text: "", option: action?.options?.[0]?.id }), ...next } })); if (problem === "empty") setProblem(null); } };

  const submit = async () => {
    if (sending || !action) return;
    const text = draft.text.trim();
    if (!text) { setProblem("empty"); field.current?.focus(); return; }
    setSending(true);
    setProblem(null);
    try {
      await onSubmit({ actionId: action.id, text, optionId: action.options?.length ? draft.option : undefined });
    } catch {
      setSending(false);
      setProblem("failed");
      setAnnouncement(errorMessage);
      return;
    }
    const message = action.successMessage ?? label;
    setSending(false);
    setDrafts(current => { const { [action.id]: _removed, ...rest } = current; return rest; });
    setDoneMessage(message);
    setAnnouncement(message);
    go("done", false);
    clearTimeout(doneTimer.current);
    doneTimer.current = setTimeout(() => setView(current => current === "done" ? "closed" : current), doneDuration);
  };

  const onFieldKey = (event: KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (action?.multiline && event.key === "Enter" && (event.ctrlKey || event.metaKey)) { event.preventDefault(); void submit(); }
  };

  const faces: Variants = {
    enter: (dir: number) => reduced ? { opacity: 0 } : { opacity: 0, x: dir * 16 },
    rest: { opacity: 1, x: 0, transition: reduced ? { duration: motionTokens.duration.fast } : { ...motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.fast } } },
    exit: (dir: number) => reduced ? { opacity: 0, transition: { duration: motionTokens.duration.instant } } : { opacity: 0, x: dir * -16, transition: { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.exit] } },
  };
  const surface = view === "closed" || view === "done" ? CLOSED : size;
  const faceKey = view === "menu" ? "menu" : view === "compose" ? `compose-${actionId}` : "fab";
  const side = corner === "bottom-left" ? { left: 0 } : { right: 0 };
  const errorId = `${ids}-problem`;

  const fabLabel = view === "done" && doneMessage ? `${label}. ${doneMessage}` : label;

  return (
    <div ref={root} className={`${styles.root} ${className ?? ""}`} data-view={view} onKeyDown={onRootKey}>
      {/* Başarı ve hata iletileri kibar canlı bölgede okunur. */}
      <div className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">{announcement}</div>
      <motion.div
        className={styles.surface}
        style={{ ...side }}
        initial={false}
        animate={{ width: surface.width, height: surface.height, borderRadius: view === "closed" || view === "done" ? 28 : 20 }}
        transition={reduced ? { duration: 0 } : motionTokens.spring.morph}
      >
        <AnimatePresence initial={false} custom={direction}>
          {view === "menu" ? (
            <Face key={faceKey} active custom={direction} variants={faces} onSize={setSize} className={styles.face} width={272}>
              <LayoutGroup id={`${ids}-menu`}>
                <div className={styles.menu} role="menu" aria-label={menuTitle} onKeyDown={onMenuKey} onMouseLeave={() => setHot(null)}>
                  <div className={styles.menuTitle} aria-hidden="true">{menuTitle}</div>
                  {actions.map((item, index) => (
                    <button
                      key={item.id}
                      ref={node => { itemRefs.current[item.id] = node; }}
                      type="button"
                      role="menuitem"
                      className={styles.item}
                      data-action-id={item.id}
                      tabIndex={index === 0 ? 0 : -1}
                      aria-keyshortcuts={item.shortcut}
                      onClick={() => choose(item)}
                      onFocus={() => setHot(item.id)}
                      onBlur={() => setHot(null)}
                      onMouseEnter={() => setHot(item.id)}
                    >
                      {hot === item.id && <motion.span className={styles.highlight} layoutId="highlight" transition={reduced ? { duration: 0 } : motionTokens.spring.snappy} aria-hidden="true" />}
                      {item.icon && <span className={styles.icon} aria-hidden="true">{item.icon}</span>}
                      <span className={styles.itemText}>
                        <span className={styles.itemLabel}>{item.label}</span>
                        {item.description && <span className={styles.itemHint}>{item.description}</span>}
                      </span>
                      {item.shortcut && <kbd className={styles.kbd} aria-hidden="true">{item.shortcut}</kbd>}
                    </button>
                  ))}
                </div>
              </LayoutGroup>
            </Face>
          ) : view === "compose" && action ? (
            <Face key={faceKey} active custom={direction} variants={faces} onSize={setSize} className={styles.face} width={304}>
              <form className={styles.form} aria-busy={sending || undefined} onSubmit={event => { event.preventDefault(); void submit(); }} noValidate>
                <div className={styles.formHead}>
                  <button type="button" className={styles.back} onClick={() => go("menu", false)} disabled={sending} aria-label={backLabel}>
                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6 9 12l6 6" /></svg>
                  </button>
                  <label className={styles.formTitle} htmlFor={`${ids}-field`}>{action.title ?? action.label}</label>
                </div>
                {action.multiline
                  ? <textarea ref={field} id={`${ids}-field`} className={styles.field} rows={3} placeholder={action.placeholder} value={draft.text} disabled={sending} aria-invalid={problem === "empty" || undefined} aria-describedby={problem ? errorId : undefined} onChange={event => patch({ text: event.target.value })} onKeyDown={onFieldKey} />
                  : <input ref={field} id={`${ids}-field`} className={styles.field} type="text" placeholder={action.placeholder} value={draft.text} disabled={sending} aria-invalid={problem === "empty" || undefined} aria-describedby={problem ? errorId : undefined} onChange={event => patch({ text: event.target.value })} onKeyDown={onFieldKey} />}
                {action.options && action.options.length > 0 && (
                  <div className={styles.options} role="radiogroup" aria-label={action.optionsLabel}>
                    {action.options.map(option => (
                      <button key={option.id} type="button" role="radio" aria-checked={draft.option === option.id} className={styles.option} disabled={sending} onClick={() => patch({ option: option.id })}>{option.label}</button>
                    ))}
                  </div>
                )}
                {problem && <p id={errorId} className={styles.problem} role="alert">{problem === "empty" ? emptyMessage : errorMessage}</p>}
                <div className={styles.formFoot}>
                  <button type="submit" className={styles.submit} aria-disabled={sending || undefined}>
                    {sending ? <><MorphLoader size={14} variant="ring" decorative />{sendingLabel}</> : action.submitLabel ?? label}
                  </button>
                </div>
              </form>
            </Face>
          ) : (
            <Face key="fab" active custom={direction} variants={faces} onSize={setSize} className={styles.face} width={56}>
              <button ref={fab} type="button" className={styles.fab} data-done={view === "done" || undefined} aria-haspopup="menu" aria-expanded={false} aria-label={fabLabel} onClick={() => go("menu", true)}>
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <motion.path key={view === "done" ? "check" : "plus"} d={view === "done" ? "M5.5 12.5 10 17l8.5-9.5" : plusPath} initial={reduced || view !== "done" ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] }} />
                </svg>
              </button>
            </Face>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default ActionMorph;
