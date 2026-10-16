"use client";

import { useMemo, useState } from "react";
import { ArrowRight, CircleHelp, Equal, Minus, PenLine, Plus } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { motionTokens } from "../lib/motion-tokens";
import { STATUS_ORDER, changedFields, countByStatus, rowTitle, sideFields, statusLabel, summaryText, unmatchedSide } from "./revision-diff-format";
import type { RevisionField, RevisionRow, RevisionStatus } from "./revision-diff-format";
import styles from "./revision-diff.module.css";

export type { RevisionField, RevisionRow, RevisionStatus };

export interface RevisionDiffProps {
  /** Proje tarafından eşlenmiş satırlar. Bileşen eşleştirme yapmaz, yalnız gösterir. */
  rows: RevisionRow[];
  /** Gösterilecek alanlar, sırasıyla. İlki (ya da `primaryKey`) satırın başlığıdır. */
  fields: RevisionField[];
  primaryKey?: string;
  title?: string;
  /** Değişen alanlarda eski ve yeni değerin ekran okuyucu adları. */
  beforeLabel?: string;
  afterLabel?: string;
  /** Aynı kalan satırlar varsayılan olarak gizlidir; süzgeçte "Aynı" seçilince ya da bu açıkken görünür. */
  showUnchanged?: boolean;
  emptyMessage?: string;
  className?: string;
}

type Filter = "all" | RevisionStatus;
const ICONS: Record<RevisionStatus, typeof Plus> = { added: Plus, removed: Minus, changed: PenLine, unmatched: CircleHelp, same: Equal };
const enter = { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] } as const;
const leave = { duration: motionTokens.duration.fast, ease: [...motionTokens.ease.standard] } as const;

/**
 * Revizyon karşılaştırması: iki sürüm arasındaki satır farkları. Üstte özet ve sayılı süzgeç düğmeleri (Tümü, Eklendi,
 * Silindi, Değişti, Eşlenmedi, Aynı); altta her satır durum rozeti, başlık ve alanlarıyla. Değişen satırda yalnız değişen
 * alanlar "eski → yeni" olarak yazılır, kalanların sayısı söylenir. Eklenen satır yeni, silinen satır üstü çizili eski
 * değerleri gösterir. Değerler ABACUS ile yazılır. Arc'ta karşılığı yok; SNN-UI için yazıldı.
 */
export function RevisionDiff({ rows, fields, primaryKey, title, beforeLabel = "Önceki", afterLabel = "Yeni", showUnchanged = false, emptyMessage = "Gösterilecek fark yok", className }: RevisionDiffProps) {
  const reduced = useReducedMotion() ?? false;
  const [filter, setFilter] = useState<Filter>("all");
  const counts = useMemo(() => countByStatus(rows), [rows]);
  const primary = fields.find(field => field.key === primaryKey) ?? fields[0];
  const others = fields.filter(field => field !== primary);
  const visible = rows.filter(row => (filter === "all" ? row.status !== "same" || showUnchanged : row.status === filter));
  const filters: Filter[] = ["all", ...STATUS_ORDER.filter(status => counts[status] > 0)];
  const visibleCount = (value: Filter) => (value === "all" ? rows.length - (showUnchanged ? 0 : counts.same) : counts[value]);

  return <section className={[styles.root, className].filter(Boolean).join(" ")} aria-label={title ?? "Revizyon karşılaştırması"}>
    <header className={styles.header}>
      {title ? <h3 className={styles.title}>{title}</h3> : null}
      <p className={styles.summary}>{summaryText(counts)}</p>
      <div className={styles.filters} role="group" aria-label="Duruma göre süz">
        {filters.map(value => <button key={value} type="button" className={styles.filter} data-status={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>
          <span>{value === "all" ? "Tümü" : statusLabel[value]}</span><span className={styles.count}>{visibleCount(value)}</span>
        </button>)}
      </div>
    </header>
    <ul className={styles.list}>
      <AnimatePresence initial={false} mode="popLayout">
        {visible.length ? visible.map(row => {
          const Icon = ICONS[row.status];
          const changes = row.status === "changed" ? changedFields(row, others) : [];
          const unchanged = others.length - changes.length;
          const side = row.status === "removed" || (row.status === "unmatched" && !row.after) ? row.before : row.after;
          return <motion.li key={row.key} className={styles.row} data-status={row.status} layout={reduced ? false : "position"}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0, transition: reduced ? { duration: 0 } : enter }} exit={{ opacity: 0, transition: reduced ? { duration: 0 } : leave }}
            transition={motionTokens.spring.smooth}>
            <span className={styles.badge}><Icon size={14} strokeWidth={2} aria-hidden="true" />{statusLabel[row.status]}</span>
            <div className={styles.body}>
              <div className={styles.rowTitle}>{primary ? rowTitle(row, primary) : row.key}</div>
              {row.status === "changed" ? <dl className={styles.fields}>
                {changes.map(change => <div key={change.field.key} className={styles.field}>
                  <dt>{change.field.label}</dt>
                  <dd className={styles.change}>
                    <del><span className={styles.srOnly}>{beforeLabel}: </span>{change.before}</del>
                    <ArrowRight className={styles.arrow} size={14} strokeWidth={1.75} aria-hidden="true" />
                    <ins><span className={styles.srOnly}>{afterLabel}: </span>{change.after}</ins>
                  </dd>
                </div>)}
                {unchanged > 0 && row.status === "changed" ? <div className={styles.rest}>{unchanged} alan aynı</div> : null}
              </dl> : <dl className={styles.fields}>
                {sideFields(side, others).map(item => <div key={item.field.key} className={styles.field}>
                  <dt>{item.field.label}</dt>
                  <dd>{row.status === "removed" ? <del>{item.value}</del> : item.value}</dd>
                </div>)}
              </dl>}
              {row.status === "unmatched" || row.note ? <p className={styles.note}>{[row.status === "unmatched" ? unmatchedSide(row) : "", row.note ?? ""].filter(Boolean).join(". ")}</p> : null}
            </div>
          </motion.li>;
        }) : <motion.li key="empty" className={styles.empty} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>{emptyMessage}</motion.li>}
      </AnimatePresence>
    </ul>
  </section>;
}

export default RevisionDiff;
