"use client";

import { useId, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ChevronRight } from "lucide-react";
import { motionTokens } from "../lib/motion-tokens";
import { filterGroups, type TableGroup } from "./grouped-table-filter";
import styles from "./grouped-table.module.css";

export interface GroupedTableColumn<T> {
  key: string;
  header: string;
  /** Hücre içeriği. Verilmezse satırın `key` alanı düz metin yazılır. */
  render?: (row: T) => ReactNode;
  /** Sayı sütunu: sağa yaslı, eşit genişlikli rakam. */
  numeric?: boolean;
  /** Dar kapta (36rem altı) gizlenir; tablo yana kaymaz. */
  optional?: boolean;
  /** Sütun genişliği, örneğin "30%" ya da "8rem". */
  width?: string;
}

export interface GroupedTableGroup<T> extends TableGroup<T> {
  /** Grup başlığındaki durum rozeti, örneğin { tone: "danger", label: "2 hata" }. Uyarı tonu mavi-gridir. */
  status?: { tone: "success" | "warning" | "danger" | "neutral"; label: string };
}

export interface GroupedTableProps<T> {
  groups: GroupedTableGroup<T>[];
  columns: GroupedTableColumn<T>[];
  rowKey: (row: T) => string;
  /** Tabloyu yardımcı teknolojiye adlandırır. */
  caption: string;
  /** Arama metni. Doluyken eşleşen satırlar kalır ve gruplar zorla açılır. */
  query?: string;
  /** Aramada satırın hangi metne bakılacağı. Varsayılan: satırdaki bütün metin ve sayı alanları. */
  searchText?: (row: T) => string;
  /** Başta açık grupların anahtarları; "all" hepsini açar. Varsayılan: hepsi kapalı. */
  defaultExpanded?: string[] | "all";
  emptyMessage?: string;
  className?: string;
}

const allText = (row: unknown) => typeof row === "object" && row ? Object.values(row).filter(value => typeof value === "string" || typeof value === "number").join(" ") : String(row);

/** Satırları gruplara bölen tablo: her grup bir <tbody>, başlığı açılıp kapanan düğmedir. Arama varken gruplar açılır. */
export function GroupedTable<T>({ groups, columns, rowKey, caption, query = "", searchText = allText, defaultExpanded, emptyMessage = "Aramaya uyan satır yok.", className }: GroupedTableProps<T>) {
  const id = useId();
  const reduce = !!useReducedMotion();
  const [open, setOpen] = useState<Set<string>>(() => new Set(defaultExpanded === "all" ? groups.map(group => group.key) : defaultExpanded ?? []));
  const searching = query.trim().length > 0;
  const filtered = filterGroups(groups, query, searchText);
  const statusOf = new Map(groups.map(group => [group.key, group.status]));
  const toggle = (key: string) => setOpen(current => { const next = new Set(current); if (next.has(key)) next.delete(key); else next.add(key); return next; });
  return <div className={[styles.wrapper, className].filter(Boolean).join(" ")}>
    {searching && <p className={styles.summary} role="status">{filtered.matches} satır eşleşti</p>}
    <table className={styles.table}>
      <caption className={styles.srOnly}>{caption}</caption>
      <colgroup><col className={styles.chevronCol} />{columns.map(column => <col key={column.key} data-optional={column.optional || undefined} style={column.width ? { width: column.width } : undefined} />)}</colgroup>
      <thead><tr><th scope="col"><span className={styles.srOnly}>Aç ya da kapat</span></th>{columns.map(column => <th key={column.key} scope="col" data-numeric={column.numeric || undefined} data-optional={column.optional || undefined}>{column.header}</th>)}</tr></thead>
      {filtered.groups.map(group => {
        const expanded = searching || open.has(group.key);
        const status = statusOf.get(group.key);
        const rowsId = `${id}-${group.key}`;
        return <tbody key={group.key} data-expanded={expanded || undefined}>
          <tr className={styles.groupRow}>
            <th scope="rowgroup" colSpan={columns.length + 1}>
              <button type="button" className={styles.groupButton} aria-expanded={expanded} aria-controls={expanded ? rowsId : undefined} aria-disabled={searching || undefined} onClick={() => { if (!searching) toggle(group.key); }}>
                <motion.span className={styles.chevron} initial={false} animate={{ rotate: expanded ? 90 : 0 }} transition={reduce ? { duration: 0 } : motionTokens.spring.snappy} aria-hidden="true"><ChevronRight size={16} strokeWidth={1.75} /></motion.span>
                <span className={styles.groupTitle}>{group.title}</span>
                <span className={styles.count} aria-label={searching ? `${group.total} satırdan ${group.rows.length} eşleşme` : `${group.total} satır`}>{searching ? `${group.rows.length} / ${group.total}` : group.total}</span>
                {status && <span className={styles.status} data-tone={status.tone}>{status.label}</span>}
              </button>
            </th>
          </tr>
          {expanded && group.rows.map((row, index) => <tr key={rowKey(row)} id={index === 0 ? rowsId : undefined}>
            <td aria-hidden="true" />
            {columns.map(column => <td key={column.key} data-numeric={column.numeric || undefined} data-optional={column.optional || undefined}>{column.render ? column.render(row) : String((row as Record<string, unknown>)[column.key] ?? "")}</td>)}
          </tr>)}
        </tbody>;
      })}
    </table>
    {searching && filtered.groups.length === 0 && <p className={styles.empty}>{emptyMessage}</p>}
  </div>;
}

export default GroupedTable;
