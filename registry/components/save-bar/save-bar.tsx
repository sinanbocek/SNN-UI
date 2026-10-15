"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { motionTokens } from "../lib/motion-tokens";
import styles from "./save-bar.module.css";

export type SaveBarStatus = "idle" | "saving" | "saved" | "error";

export interface SaveBarProps {
  /** Kaydedilmemiş değişiklik sayısı. Sıfırken (ve "Kaydedildi" gösterilmiyorsa) çubuk yoktur. */
  changeCount: number;
  /** Kaydetme durumu. Gerçek kaydetmeyi proje yapar; çubuk yalnız durumu gösterir. */
  status?: SaveBarStatus;
  onSave: () => void;
  onDiscard: () => void;
  /** Ctrl/Cmd+S kısayolu. Varsayılan açık. */
  shortcut?: boolean;
  /** "Kaydedildi" durumunun ekranda kalma süresi, ms. */
  savedDuration?: number;
  savedMessage?: string;
  discardedMessage?: string;
  errorMessage?: string;
  /** Sayı metni; varsayılan: "{n} kaydedilmemiş değişiklik". */
  formatCount?: (count: number) => string;
  className?: string;
}

const defaultFormatCount = (count: number) => `${count} kaydedilmemiş değişiklik`;

/** Formun altında yüzen kaydetme çubuğu. Değişiklik varken görünür; Kaydet, Vazgeç, kaydediliyor / kaydedildi / hata durumları.
 *  Sayı düz metin olarak değişir (yuvarlanma hareketi yoktur). "Hareketi azalt" açıkken çubuk yalnız solarak görünür. */
export function SaveBar({
  changeCount, status = "idle", onSave, onDiscard, shortcut = true, savedDuration = 2000,
  savedMessage = "Değişiklikler kaydedildi.", discardedMessage = "Değişiklikler geri alındı.",
  errorMessage = "Kaydedilemedi. Değişiklikleriniz duruyor.", formatCount = defaultFormatCount, className,
}: SaveBarProps) {
  const reduced = useReducedMotion();
  const [showSaved, setShowSaved] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  // "Kaydedildi" kısa süre görünüp kapanır.
  useEffect(() => {
    if (status !== "saved") { setShowSaved(false); return; }
    setShowSaved(true);
    const timer = setTimeout(() => setShowSaved(false), savedDuration);
    return () => clearTimeout(timer);
  }, [status, savedDuration]);

  // Yeni değişiklik gelince eski "geri alındı" duyurusu silinir.
  useEffect(() => { if (changeCount > 0) setNote(null); }, [changeCount]);

  const saving = status === "saving";
  const hasChanges = changeCount > 0;
  const visible = hasChanges || (status === "saved" && showSaved);
  const canSave = hasChanges && !saving;

  // Son render'ın değerlerini tutar; kısayol dinleyicisi her değişimde yeniden bağlanmaz.
  const latest = useRef({ canSave, onSave });
  latest.current = { canSave, onSave };
  useEffect(() => {
    if (!shortcut) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "KeyS" || !(event.ctrlKey || event.metaKey) || event.altKey || event.shiftKey) return;
      // Kaydedilecek bir şey yokken tarayıcının kendi davranışına dokunulmaz.
      if (!latest.current.canSave) return;
      event.preventDefault();
      latest.current.onSave();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [shortcut]);

  const discard = () => { setNote(discardedMessage); onDiscard(); };
  const save = () => { if (canSave) onSave(); };

  const announcement = note ?? (status === "saved" ? savedMessage : status === "error" ? errorMessage : hasChanges ? formatCount(changeCount) : "");
  const text = status === "saved" && !hasChanges ? savedMessage : status === "error" ? errorMessage : formatCount(changeCount);
  const showActions = hasChanges;

  const enter = reduced ? { opacity: 0 } : { opacity: 0, y: 16, scale: .96 };
  const rest = reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 };

  return (
    <div className={`${styles.region} ${className ?? ""}`}>
      {/* Ekran okuyucu bölgesi çubuktan bağımsız ve hep sayfadadır; çubuk kapanınca da son duyuru okunur. */}
      <div className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">{announcement}</div>
      <AnimatePresence>
        {visible && (
          <motion.div
            key="bar"
            className={styles.bar}
            data-status={status}
            role="group"
            aria-label="Kaydetme çubuğu"
            initial={enter}
            animate={rest}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 12, scale: .97 }}
            transition={reduced ? { duration: motionTokens.duration.fast } : motionTokens.spring.smooth}
          >
            <span className={styles.text} data-tone={status === "error" ? "error" : undefined} aria-hidden="true">{text}</span>
            {showActions && (
              <span className={styles.actions}>
                <button type="button" className={styles.discard} onClick={discard} disabled={saving}>Vazgeç</button>
                <button type="button" className={styles.save} onClick={save} aria-disabled={saving || undefined} aria-busy={saving || undefined}>
                  {saving ? <><span className={styles.spinner} aria-hidden="true" />Kaydediliyor</> : status === "error" ? "Yeniden dene" : "Kaydet"}
                </button>
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
