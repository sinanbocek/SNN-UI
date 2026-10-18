"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ChevronRight } from "lucide-react";
import { motionTokens } from "../lib/motion-tokens";
import { SearchField } from "../search-field/search-field";
import { ancestorsOf, matchRange, searchTree, type TreeNode, type TreeSearch } from "./tree-view-search";
import styles from "./tree-view.module.css";

export type { TreeNode } from "./tree-view-search";

export interface TreeViewProps {
  nodes: TreeNode[];
  /** Ağacı yardımcı teknolojiye adlandırır, örneğin "TÜFE sınıflaması". */
  label: string;
  /** Denetimli seçili düğüm. */
  selected?: string | null | undefined;
  defaultSelected?: string | null | undefined;
  onSelect?: ((node: TreeNode) => void) | undefined;
  /** Üstte arama kutusu. Varsayılan açık. */
  searchable?: boolean | undefined;
  searchLabel?: string | undefined;
  searchPlaceholder?: string | undefined;
  /** Başta açık düğümler; "all" hepsini açar. Seçili düğümün üstleri her zaman açık başlar. */
  defaultExpanded?: string[] | "all" | undefined;
  className?: string | undefined;
}

const collectIds = (nodes: TreeNode[]): string[] => nodes.flatMap(node => node.children?.length ? [node.id, ...collectIds(node.children)] : []);

function Label({ text: label, query, matched }: { text: string; query: string; matched: boolean }) {
  const range = matched ? matchRange(label, query) : null;
  if (!range) return <>{label}</>;
  return <>{label.slice(0, range[0])}<mark className={styles.mark}>{label.slice(range[0], range[1])}</mark>{label.slice(range[1])}</>;
}

/** İç içe liste: açma düğmesi ile seçim düğmesi ayrıdır. Arama eşleşen düğümün bütün üstlerini açar ve eşleşme sayısını yazar. */
export function TreeView({ nodes, label, selected: selectedProp, defaultSelected = null, onSelect, searchable = true, searchLabel = "Ara", searchPlaceholder = "Kalem ara", defaultExpanded, className }: TreeViewProps) {
  const reduce = !!useReducedMotion();
  const [ownSelected, setOwnSelected] = useState(defaultSelected);
  const selected = selectedProp !== undefined ? selectedProp : ownSelected;
  const [open, setOpen] = useState<Set<string>>(() => new Set([...(defaultExpanded === "all" ? collectIds(nodes) : defaultExpanded ?? []), ...(selected ? ancestorsOf(nodes, selected) : [])]));
  const [query, setQuery] = useState("");
  const search = searchTree(nodes, query);
  const toggle = (id: string) => setOpen(current => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  const choose = (node: TreeNode) => { if (selectedProp === undefined) setOwnSelected(node.id); onSelect?.(node); };

  const renderList = (list: TreeNode[], depth: number, search: TreeSearch | null) => <ul className={styles.list} role={depth === 0 ? "list" : undefined}>
    {list.filter(node => !search || search.visible.has(node.id)).map(node => {
      const parent = !!node.children?.length;
      const expanded = parent && (search ? search.expand.has(node.id) : open.has(node.id));
      const matched = !!search?.matches.has(node.id);
      return <li key={node.id}>
        <div className={styles.row} style={{ "--depth": depth } as React.CSSProperties} data-selected={selected === node.id || undefined}>
          {parent
            ? <button type="button" className={styles.toggle} aria-expanded={expanded} aria-label={`${node.label}: alt kalemleri ${expanded ? "kapat" : "aç"}`} aria-disabled={search ? true : undefined} onClick={() => { if (!search) toggle(node.id); }}>
                <motion.span className={styles.chevron} initial={false} animate={{ rotate: expanded ? 90 : 0 }} transition={reduce ? { duration: 0 } : motionTokens.spring.snappy}><ChevronRight size={16} strokeWidth={1.75} aria-hidden="true" /></motion.span>
              </button>
            : <span className={styles.spacer} aria-hidden="true" />}
          <button type="button" className={styles.select} aria-pressed={selected === node.id} onClick={() => choose(node)}>
            <span className={styles.name} data-matched={matched || undefined}><Label text={node.label} query={query} matched={matched} /></span>
            {node.meta && <span className={styles.meta}>{node.meta}</span>}
          </button>
        </div>
        {expanded && renderList(node.children!, depth + 1, search)}
      </li>;
    })}
  </ul>;

  return <div className={[styles.tree, className].filter(Boolean).join(" ")} role="group" aria-label={label}>
    {searchable && <div className={styles.search}>
      <SearchField label={searchLabel} placeholder={searchPlaceholder} value={query} onValueChange={setQuery} />
      {search && <p className={styles.count} role="status">{search.matches.size ? `${search.matches.size} eşleşme` : "Eşleşme yok"}</p>}
    </div>}
    {renderList(nodes, 0, search)}
  </div>;
}

export default TreeView;
