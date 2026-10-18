"use client";

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { motionTokens } from "../lib/motion-tokens";
import styles from "./orbit-menu.module.css";

export interface OrbitAction {
  id: string;
  label: string;
  /** Eylem simgesi; çağıran verir. */
  icon: ReactNode;
  /** Eylem çalışınca etiket hapında kısa süre görünen onay ("Sabitlendi"). */
  confirmMessage?: string | undefined;
  /** Tehlikeli eylem: kırmızı tonda; adı da tehlikeyi söyler ("Sil"). */
  tone?: "default" | "danger" | undefined;
}

export interface OrbitMenuProps {
  /** Üç ile altı eylem; fazlası için bu bileşen değil (`dropdown-menu`). */
  actions: OrbitAction[];
  onAction: (id: string) => void;
  onOpenChange?: ((open: boolean) => void) | undefined;
  /** Yayın ortası, derece. 0 sağa, 90 aşağı, -90 yukarı bakar. Yay ekrana göre kısıtlanmaz; boş alana açılacak yönü çağıran seçer. */
  center?: number | undefined;
  /** Yayın açıklığı, derece. */
  spread?: number | undefined;
  /** Tetikleyiciden eylemlere uzaklık, piksel. */
  radius?: number | undefined;
  label?: string | undefined;
  cancelLabel?: string | undefined;
  disabled?: boolean | undefined;
  /** Onay metinleri ekran okuyucuya iletilir. */
  announce?: boolean | undefined;
  className?: string | undefined;
}

const TRIGGER = 48;
const ITEM = 44;
const DEAD_ZONE = 22;
const DRAG_START = 8;

type Target = { kind: "none" } | { kind: "action"; id: string } | { kind: "cancel" };

const degrees = (radians: number) => (radians * 180) / Math.PI;
const spreadDiff = (a: number, b: number) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };

/** Basılı tutup eylemlerden birine doğru sürüklenerek seçilen yuvarlak eylem yayı. Tek dokunuş menüyü açık bırakır, ikinci dokunuş kapatır. Uzun yazılı listeler için `dropdown-menu`. */
export function OrbitMenu({ actions, onAction, onOpenChange, center = -90, spread = 120, radius = 84, label = "Eylemler", cancelLabel = "Bırakınca iptal", disabled = false, announce = true, className }: OrbitMenuProps) {
  const reduced = useReducedMotion();
  const list = actions.slice(0, 6);
  const count = list.length;
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<Target>({ kind: "none" });
  const [confirm, setConfirm] = useState<string | null>(null);
  const press = useRef<{ x: number; y: number; moved: boolean; wasOpen: boolean; pointerId: number } | null>(null);
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const menuId = useId();

  const angleOf = useCallback((index: number) => count === 1 ? center : center - spread / 2 + (index * spread) / (count - 1), [count, center, spread]);
  const change = useCallback((next: boolean) => { setOpen(next); if (!next) setTarget({ kind: "none" }); onOpenChange?.(next); }, [onOpenChange]);
  const close = useCallback((restore = false) => { change(false); if (restore) trigger.current?.focus(); }, [change]);

  useEffect(() => () => clearTimeout(confirmTimer.current), []);
  useEffect(() => { if (disabled && open) close(); }, [disabled, open, close]);
  // Dışarı basmak sabit açık menüyü kapatır.
  useEffect(() => {
    if (!open) return;
    const outside = (event: globalThis.PointerEvent) => { if (!root.current?.contains(event.target as Node)) close(); };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open, close]);

  const run = (id: string) => {
    const action = list.find(item => item.id === id);
    if (!action) return;
    change(false);
    onAction(id);
    if (action.confirmMessage) {
      setConfirm(action.confirmMessage);
      clearTimeout(confirmTimer.current);
      confirmTimer.current = setTimeout(() => setConfirm(null), 1500);
    }
    trigger.current?.focus();
  };

  // İmleç hangi eyleme doğru yöneliyorsa o hedeflenir (açıya göre); yayın dışı iptaldir, düğmeye yakın ölü bölge hiçbiri.
  const aim = (event: PointerEvent<HTMLButtonElement>): Target => {
    const box = trigger.current!.getBoundingClientRect();
    const dx = event.clientX - (box.left + box.width / 2);
    const dy = event.clientY - (box.top + box.height / 2);
    if (Math.hypot(dx, dy) < DEAD_ZONE) return { kind: "none" };
    const angle = degrees(Math.atan2(dy, dx));
    const half = count > 1 ? spread / (count - 1) / 2 : 30;
    let best = -1;
    let bestDiff = 360;
    list.forEach((_, index) => { const diff = spreadDiff(angle, angleOf(index)); if (diff < bestDiff) { best = index; bestDiff = diff; } });
    if (best < 0 || bestDiff > half * 1.25 || Math.hypot(dx, dy) > radius + ITEM * 1.4) return { kind: "cancel" };
    return { kind: "action", id: list[best]!.id };
  };

  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (disabled || (event.pointerType === "mouse" && event.button !== 0)) return;
    press.current = { x: event.clientX, y: event.clientY, moved: false, wasOpen: open, pointerId: event.pointerId };
    try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* işaretçi yakalanamazsa sürükleme yine çalışır */ }
    if (!open) change(true);
  };
  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const current = press.current;
    if (!current || event.pointerId !== current.pointerId) return;
    if (!current.moved && Math.hypot(event.clientX - current.x, event.clientY - current.y) > DRAG_START) current.moved = true;
    if (current.moved) setTarget(aim(event));
  };
  const onPointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    const current = press.current;
    press.current = null;
    if (!current) return;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (current.moved) {
      const final = aim(event);
      if (final.kind === "action") run(final.id); else change(false);
    } else if (current.wasOpen) change(false);
  };
  const onPointerCancel = () => { press.current = null; change(false); };

  // Klavye: tüm eylemlere klavyeyle ulaşılır.
  const openFocus = (first: boolean) => {
    change(true);
    requestAnimationFrame(() => itemRefs.current[list[first ? 0 : count - 1]?.id ?? ""]?.focus());
  };
  const onTriggerKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (["ArrowDown", "ArrowRight", "ArrowLeft"].includes(event.key)) { event.preventDefault(); openFocus(true); }
    else if (event.key === "ArrowUp") { event.preventDefault(); openFocus(false); }
  };
  // Fare ve dokunuş işaretçi olaylarıyla yönetilir; klavyeden gelen tıklama (detail 0) açar/kapatır.
  const onTriggerClick = (event: { detail: number }) => { if (event.detail !== 0 || disabled) return; if (open) close(); else openFocus(true); };

  const onMenuKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const ids = list.map(item => item.id);
    const at = ids.indexOf((document.activeElement as HTMLElement | null)?.dataset.actionId ?? "");
    const go = (to: number) => { event.preventDefault(); itemRefs.current[ids[(to + ids.length) % ids.length]!]?.focus(); };
    if (event.key === "ArrowDown" || event.key === "ArrowRight") go(at + 1);
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft") go(at - 1);
    else if (event.key === "Home") go(0);
    else if (event.key === "End") go(ids.length - 1);
    else if (event.key === "Escape") { event.preventDefault(); close(true); }
    else if (event.key === "Tab") close();
  };

  const targetAction = target.kind === "action" ? list.find(item => item.id === target.id) : undefined;
  const pill = confirm ?? (target.kind === "cancel" ? cancelLabel : targetAction?.label ?? null);
  const flip = Math.sin((center * Math.PI) / 180) > 0.2; // yay aşağı bakıyorsa etiket üstte durur.
  const fade = { duration: reduced ? motionTokens.duration.instant : motionTokens.duration.fast };

  return (
    <div ref={root} className={`${styles.root} ${className ?? ""}`} style={{ width: TRIGGER, height: TRIGGER }} data-open={open || undefined}>
      {announce && <div className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">{confirm ?? ""}</div>}
      <AnimatePresence>
        {open && (
          <div id={menuId} className={styles.items} role="menu" aria-label={label} onKeyDown={onMenuKey}>
            {list.map((action, index) => {
              const angle = (angleOf(index) * Math.PI) / 180;
              const px = Math.cos(angle) * radius;
              const py = Math.sin(angle) * radius;
              const hot = target.kind === "action" && target.id === action.id;
              return (
                <motion.button
                  key={action.id}
                  ref={node => { itemRefs.current[action.id] = node; }}
                  type="button"
                  role="menuitem"
                  className={styles.item}
                  data-action-id={action.id}
                  data-tone={action.tone === "danger" ? "danger" : undefined}
                  data-hot={hot || undefined}
                  aria-label={action.label}
                  tabIndex={-1}
                  style={{ width: ITEM, height: ITEM }}
                  initial={reduced ? { opacity: 0, x: px, y: py } : { opacity: 0, x: 0, y: 0, scale: .5 }}
                  animate={{ opacity: 1, x: px, y: py, scale: hot && !reduced ? 1.14 : 1, transition: reduced ? fade : { ...motionTokens.spring.snappy, delay: index * motionTokens.stagger.item } }}
                  exit={{ opacity: 0, ...(reduced ? {} : { x: 0, y: 0, scale: .5 }), transition: reduced ? fade : { duration: motionTokens.duration.fast, delay: (count - 1 - index) * motionTokens.stagger.item * .6 } }}
                  onClick={() => run(action.id)}
                  onFocus={() => setTarget({ kind: "action", id: action.id })}
                  onBlur={() => setTarget({ kind: "none" })}
                >
                  <span className={styles.itemIcon} aria-hidden="true">{action.icon}</span>
                </motion.button>
              );
            })}
          </div>
        )}
      </AnimatePresence>
      <button
        ref={trigger}
        type="button"
        className={styles.trigger}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        disabled={disabled}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onKeyDown={onTriggerKey}
        onClick={onTriggerClick}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.svg key={confirm ? "check" : open ? "close" : "more"} viewBox="0 0 24 24" aria-hidden="true" initial={{ opacity: 0, rotate: reduced ? 0 : -45 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0 }} transition={fade}>
            {confirm ? <path d="M5.5 12.5 10 17l8.5-9.5" /> : open ? <path d="M7 7l10 10M17 7 7 17" /> : <><circle cx="6" cy="12" r="1.4" /><circle cx="12" cy="12" r="1.4" /><circle cx="18" cy="12" r="1.4" /></>}
          </motion.svg>
        </AnimatePresence>
      </button>
      <AnimatePresence>
        {pill && (open || confirm) && (
          <motion.span key="pill" className={styles.pill} data-side={flip ? "top" : "bottom"} data-tone={target.kind === "cancel" ? "cancel" : targetAction?.tone === "danger" && !confirm ? "danger" : undefined} aria-hidden="true" initial={{ opacity: 0, y: reduced ? 0 : flip ? -4 : 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={fade}>{pill}</motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

export default OrbitMenu;
