"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { ListChecks, Plus } from "lucide-react";
import { date, text } from "@snn/abacus-core";
import { motionTokens } from "../lib/motion-tokens";
import { findDropTarget, usePointerDrag } from "../lib/pointer-drag";
import type { PointerDragState } from "../lib/pointer-drag";
import { Avatar } from "../avatar/avatar";
import { Button } from "../button/button";
import { Checkbox } from "../checkbox/checkbox";
import { Drawer, DrawerContent } from "../drawer/drawer";
import { EmptyState } from "../empty-state/empty-state";
import { Input } from "../input/input";
import SegmentedControl from "../segmented-control/segmented-control";
import { Select } from "../select/select";
import { Skeleton } from "../skeleton/skeleton";
import { cellCards, placeCard, positionOf } from "./kanban-logic";
import styles from "./kanban-board.module.css";

export type KanbanTone = "accent" | "success" | "info" | "muted";

export interface KanbanColumn {
  id: string;
  label: string;
  /** Eşzamanlı iş sınırı. Dolunca sayaç ("3/3") vurgulanır; aşılınca "İş sınırı aşıldı." yazılır. Taşıma engellenmez. */
  limit?: number;
}

export interface KanbanPerson { id: string; name: string; src?: string }
export interface KanbanTag { id: string; label: string; tone: KanbanTone }
export interface KanbanChecklistItem { id: string; text: string; done: boolean }

export interface KanbanCard {
  id: string;
  /** Kimlik kodu ("TKL-12"). */
  code?: string;
  title: string;
  /** `columns` içindeki bir sütun kimliği. */
  column: string;
  assigneeId?: string;
  tagId?: string;
  /** Bitiş günü, "2026-10-24". */
  due?: string;
  points?: number;
  checklist?: KanbanChecklistItem[];
}

export interface KanbanBoardProps {
  name: string;
  /** Sıralı kartlar: sütun içi sıra, dizideki sıradır. */
  cards: KanbanCard[];
  columns: KanbanColumn[];
  people?: KanbanPerson[];
  tags?: KanbanTag[];
  /** Yeni kartın atanacağı kişi. */
  currentUserId?: string;
  /** Taşıma, sıralama ya da ayrıntı değişti: kartların tümü yeni sırayla gelir. Reddedilirse kartlar eski hâline döner ve "Yeniden dene" çıkar. */
  onChange: (cards: KanbanCard[]) => void | Promise<void>;
  /** Sütun sonuna yeni kart. Kimliği proje verir; yeni liste `cards` ile geri gelir. */
  onAdd: (columnId: string, title: string) => void | Promise<void>;
  loading?: boolean;
  className?: string;
}

type Placeholder = { column: string; lane: string | null | undefined; index: number };
type DragItem = { id: string };

const toneVar: Record<KanbanTone, string> = { accent: "var(--accent)", success: "var(--success)", info: "var(--warning)", muted: "var(--text-muted)" };
const clampNumber = (value: number, low: number, high: number) => Math.min(Math.max(value, low), high);

/** Kartın görünümü. Listede de, sürüklenirken imleci izleyen kopyada da aynıdır. */
function CardFace({ card, tag, person }: { card: KanbanCard; tag?: KanbanTag; person?: KanbanPerson }) {
  const done = card.checklist?.filter(item => item.done).length ?? 0;
  const total = card.checklist?.length ?? 0;
  return (
    <>
      <span className={styles.cardTop}>
        {card.code && <span className={styles.code}>{card.code}</span>}
        {tag && <span className={styles.tag}><span className={styles.tagDot} style={{ background: toneVar[tag.tone] }} aria-hidden="true" />{tag.label}</span>}
      </span>
      <span className={styles.cardTitle}>{card.title}</span>
      <span className={styles.cardMeta}>
        {card.due && <span className={styles.metaItem}>{date.format(card.due, "dayMonth")}</span>}
        {total > 0 && <span className={styles.metaItem}><ListChecks size={14} strokeWidth={1.75} aria-hidden="true" />{`${done}/${total}`}<span className={styles.srOnly}> kontrol maddesi</span></span>}
        {card.points !== undefined && <span className={styles.metaItem}>{`${card.points} puan`}</span>}
        <span className={styles.spacer} />
        {person && <Avatar name={person.name} src={person.src} size="sm" />}
      </span>
    </>
  );
}

/** Sürükle-bırak iş panosu: kartlar fare ve dokunmayla sürüklenir, klavyeyle de taşınır; sütun iş sınırı, durum / şerit görünümü, kart ayrıntı çekmecesi. */
export function KanbanBoard({ name, cards, columns, people = [], tags = [], currentUserId, onChange, onAdd, loading = false, className }: KanbanBoardProps) {
  const uid = useId();
  const reduced = useReducedMotion() ?? false;
  const boardRef = useRef<HTMLDivElement>(null);
  const focusAfter = useRef<string | null>(null);
  const placeholderRef = useRef<Placeholder | null>(null);
  const [items, setItems] = useState(cards);
  const [view, setView] = useState<"status" | "lane">("status");
  const [placeholder, setPlaceholder] = useState<Placeholder | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [grab, setGrab] = useState<{ id: string; snapshot: KanbanCard[] } | null>(null);
  const [dropped, setDropped] = useState<string | null>(null);
  const [adding, setAdding] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [dueText, setDueText] = useState("");
  const [dueError, setDueError] = useState("");
  const [alert, setAlert] = useState("");
  const [failure, setFailure] = useState<{ retry: () => void } | null>(null);

  useEffect(() => { setItems(cards); }, [cards]);
  placeholderRef.current = placeholder;

  const personOf = (id?: string) => people.find(person => person.id === id);
  const tagOf = (id?: string) => tags.find(tag => tag.id === id);
  const columnLabel = (id: string) => columns.find(column => column.id === id)?.label ?? id;
  const lanes: (string | null)[] = useMemo(() => [...people.map(person => person.id), ...(items.some(card => !card.assigneeId) ? [null] : [])], [people, items]);
  const laneKeys: (string | null | undefined)[] = view === "status" ? [undefined] : lanes;

  // Hamle sonrası klavye odağı karta geri verilir.
  useEffect(() => {
    const id = focusAfter.current;
    if (!id) return;
    const target = boardRef.current?.querySelector<HTMLElement>(`[data-card="${id}"]`);
    if (target) { focusAfter.current = null; target.focus({ preventScroll: false }); }
  });

  async function commit(next: KanbanCard[], previous: KanbanCard[]) {
    setItems(next);
    setFailure(null);
    try { await onChange(next); }
    catch {
      setItems(previous);
      setFailure({ retry: () => void commit(next, previous) });
      setAlert("Kaydedilemedi.");
    }
  }

  function announceDrop(next: KanbanCard[], id: string, column: string) {
    const card = next.find(item => item.id === id);
    if (!card) return;
    const count = cellCards(next, column).length;
    const limit = columns.find(entry => entry.id === column)?.limit;
    setAlert(`${card.title} ${columnLabel(column)} sütununda ${positionOf(next, id)}. sıraya bırakıldı${limit !== undefined && count > limit ? ". İş sınırı aşıldı." : ""}`);
  }

  // ---- Fare ve dokunma ----

  function locate(state: PointerDragState<DragItem>) {
    const cell = findDropTarget(state.x, state.y, "[data-drop]");
    if (!cell) return placeholderRef.current;
    const column = cell.dataset.column ?? "";
    const laneRaw = cell.dataset.lane;
    const lane = laneRaw === undefined ? undefined : laneRaw === "" ? null : laneRaw;
    const others = [...cell.querySelectorAll<HTMLElement>("[data-card-item]")].filter(node => node.dataset.cardItem !== state.item.id);
    const index = others.filter(node => { const box = node.getBoundingClientRect(); return box.top + box.height / 2 < state.y; }).length;
    return { column, lane, index };
  }

  const { drag, bind } = usePointerDrag<DragItem>({
    scrollContainers: () => [boardRef.current, ...(boardRef.current?.querySelectorAll<HTMLElement>("[data-scroll]") ?? [])],
    onStart: state => { setDragId(state.item.id); const card = items.find(item => item.id === state.item.id); setAlert(`${card?.title ?? "Kart"} kaldırıldı`); setPlaceholder(locate(state)); },
    onMove: state => setPlaceholder(locate(state)),
    onEnd: (state, cancelled) => {
      const target = placeholderRef.current;
      setDragId(null);
      setPlaceholder(null);
      if (cancelled || !target) { setAlert("Taşıma iptal edildi"); return; }
      const others = cellCards(items, target.column, target.lane).filter(card => card.id !== state.item.id);
      const before = others[target.index]?.id ?? null;
      const next = placeCard(items, state.item.id, target.column, target.lane === undefined ? "keep" : target.lane, before);
      announceDrop(next, state.item.id, target.column);
      setDropped(state.item.id);
      void commit(next, items);
    },
  });

  // ---- Klavye ----

  function onCardKeyDown(event: KeyboardEvent<HTMLButtonElement>, card: KanbanCard) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (grab?.id === card.id) {
      const lane = view === "lane" ? card.assigneeId ?? null : undefined;
      const sameCell = cellCards(items, card.column, lane);
      const index = sameCell.findIndex(item => item.id === card.id);
      const columnIndex = columns.findIndex(column => column.id === card.column);
      const place = (column: string, laneKey: string | null | undefined, atIndex: number) => {
        const others = cellCards(items, column, laneKey).filter(item => item.id !== card.id);
        const at = clampNumber(atIndex, 0, others.length);
        const next = placeCard(items, card.id, column, laneKey === undefined ? "keep" : laneKey, others[at]?.id ?? null);
        focusAfter.current = card.id;
        setItems(next);
        const count = cellCards(next, column).length;
        const limit = columns.find(entry => entry.id === column)?.limit;
        setAlert(`${card.title} ${columnLabel(column)}, ${positionOf(next, card.id)}. sırada${limit !== undefined && count > limit ? ". İş sınırı aşıldı." : ""}`);
      };
      if (event.key === "ArrowUp" && !event.shiftKey) { event.preventDefault(); if (index > 0) place(card.column, lane, index - 1); }
      else if (event.key === "ArrowDown" && !event.shiftKey) { event.preventDefault(); if (index < sameCell.length - 1) place(card.column, lane, index + 1); }
      else if (event.key === "ArrowLeft") { event.preventDefault(); const target = columns[columnIndex - 1]; if (target) place(target.id, lane, index); }
      else if (event.key === "ArrowRight") { event.preventDefault(); const target = columns[columnIndex + 1]; if (target) place(target.id, lane, index); }
      else if (view === "lane" && event.shiftKey && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
        event.preventDefault();
        const laneIndex = lanes.indexOf(card.assigneeId ?? null);
        const nextLane = lanes[laneIndex + (event.key === "ArrowDown" ? 1 : -1)];
        if (nextLane !== undefined) place(card.column, nextLane, index);
      } else if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        const snapshot = grab.snapshot;
        setGrab(null);
        announceDrop(items, card.id, card.column);
        setDropped(card.id);
        void commit(items, snapshot);
      } else if (event.key === "Escape") {
        event.preventDefault();
        focusAfter.current = card.id;
        setItems(grab.snapshot);
        setGrab(null);
        setAlert("Taşıma iptal edildi");
      }
      return;
    }
    if (event.key === " ") {
      event.preventDefault();
      setGrab({ id: card.id, snapshot: items });
      setAlert(`${card.title} kaldırıldı. Ok tuşlarıyla taşıyın, Boşluk ile bırakın, Esc ile vazgeçin.`);
    }
  }

  // ---- Kart ekleme ve ayrıntı ----

  async function add(event: FormEvent) {
    event.preventDefault();
    const title = draft.trim();
    const column = adding;
    if (!title || !column) return;
    setDraft("");
    setAdding(null);
    setAlert(`${title} kartı ${columnLabel(column)} sütununa eklendi`);
    try { await onAdd(column, title); } catch { setAlert("Kart eklenemedi."); }
  }

  const open = items.find(card => card.id === openId);

  function patchOpen(patch: Partial<KanbanCard>) {
    if (!open) return;
    void commit(items.map(card => (card.id === open.id ? { ...card, ...patch } : card)), items);
  }

  useEffect(() => { setDueText(open?.due ? date.format(open.due, "short") : ""); setDueError(""); }, [openId]); // eslint-disable-line react-hooks/exhaustive-deps

  function commitDue() {
    if (dueText.trim() === "") { setDueError(""); patchOpen({ due: undefined }); return; }
    const iso = date.parse(dueText);
    if (!iso) { setDueError("Geçerli bir tarih yazın (24.10.2026)."); return; }
    setDueError("");
    patchOpen({ due: iso });
  }

  const dragCard = dragId ? items.find(card => card.id === dragId) : undefined;
  const tilt = reduced || !drag ? 0 : clampNumber(drag.velocityX / 80, -8, 8);
  const flight = reduced ? { duration: 0 } : motionTokens.spring.smooth;
  const total = items.length;

  const renderCell = (column: KanbanColumn, lane: string | null | undefined) => {
    const list = cellCards(items, column.id, lane);
    const visibleList = list.filter(card => card.id !== dragId);
    const gap = placeholder && placeholder.column === column.id && placeholder.lane === lane ? placeholder.index : -1;
    const addingHere = adding === column.id && lane === undefined || (adding === column.id && view === "lane" && lane === (currentUserId ?? null));
    const rows: React.ReactNode[] = [];
    visibleList.forEach((card, index) => {
      if (gap === index) rows.push(<li key="gap" className={styles.gap} style={{ height: drag?.height }} aria-hidden="true" />);
      rows.push(renderCard(card));
    });
    if (gap >= visibleList.length && gap >= 0) rows.push(<li key="gap" className={styles.gap} style={{ height: drag?.height }} aria-hidden="true" />);
    return (
      <div key={`${column.id}-${String(lane)}`} className={styles.cell} data-drop data-column={column.id} data-lane={lane === undefined ? undefined : lane ?? ""} data-over={gap >= 0 ? "true" : undefined}>
        <ul className={styles.list} data-scroll aria-label={`${column.label}${lane ? `, ${personOf(lane)?.name ?? ""}` : ""}, ${list.length} kart`}>
          {rows}
          {list.length === 0 && gap < 0 && !addingHere && <li className={styles.empty}>Bu sütunda kart yok.</li>}
        </ul>
        {addingHere && (
          <form className={styles.addForm} onSubmit={event => void add(event)}>
            <Input label="Kart başlığı" value={draft} autoFocus onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === "Escape") { event.preventDefault(); setAdding(null); setDraft(""); } }} />
            <div className={styles.addActions}>
              <Button type="button" size="sm" variant="ghost" onClick={() => { setAdding(null); setDraft(""); }}>Vazgeç</Button>
              <Button type="submit" size="sm" disabled={draft.trim() === ""}>Ekle</Button>
            </div>
          </form>
        )}
      </div>
    );
  };

  const renderCard = (card: KanbanCard) => {
    const person = personOf(card.assigneeId);
    const grabbed = grab?.id === card.id;
    return (
      <motion.li
        key={card.id} layoutId={reduced ? undefined : `${uid}-${card.id}`} layout={reduced ? false : "position"} transition={{ layout: flight }}
        className={styles.cardItem} data-card-item={card.id} data-grabbed={grabbed ? "true" : undefined}
        animate={dropped === card.id && !reduced ? { scale: [1.04, 1] } : { scale: 1 }} onAnimationComplete={() => { if (dropped === card.id) setDropped(null); }}
        {...bind({ id: card.id })}
      >
        <button
          type="button" className={styles.card} data-card={card.id} aria-roledescription="sürüklenebilir kart" aria-describedby={`${uid}-help`}
          aria-label={`${card.code ? `${card.code}, ` : ""}${card.title}${person ? `, ${person.name}` : ""}, ${columnLabel(card.column)}`}
          onClick={() => setOpenId(card.id)} onKeyDown={event => onCardKeyDown(event, card)} onBlur={() => { if (grabbed) { setGrab(null); setAlert("Taşıma bırakıldı"); } }}
        >
          <CardFace card={card} tag={tagOf(card.tagId)} person={person} />
        </button>
      </motion.li>
    );
  };

  return (
    <section className={[styles.root, className].filter(Boolean).join(" ")} data-reduced={reduced ? "true" : undefined} aria-labelledby={`${uid}-title`}>
      <div className={styles.srOnly} aria-live="assertive" role="status">{alert}</div>
      <p id={`${uid}-help`} className={styles.srOnly}>Boşluk ile kartı kaldırın, ok tuşlarıyla taşıyın, Boşluk ile bırakın, Esc ile vazgeçin. Şerit görünümünde Shift ile yukarı ya da aşağı ok komşu şeride geçirir. Enter ayrıntıyı açar.</p>

      <header className={styles.header}>
        <div className={styles.headText}>
          <h2 id={`${uid}-title`} className={styles.title}>{name}</h2>
          <p className={styles.lead}>{`${total} kart`}</p>
        </div>
        <SegmentedControl label="Görünüm" value={view} onValueChange={value => setView(value as "status" | "lane")} options={[{ value: "status", label: "Durum" }, { value: "lane", label: "Şerit" }]} />
      </header>

      {!loading && total === 0 && adding === null ? (
        <EmptyState title="Henüz kart yok." description="İlk kartı ekleyerek panoyu başlatın." action={<Button variant="secondary" onClick={() => setAdding(columns[0]?.id ?? null)}>Kart ekle</Button>} />
      ) : (
        <LayoutGroup id={uid}>
          <div className={styles.board} ref={boardRef} data-view={view} style={{ ["--columns" as string]: columns.length }}>
            <div className={styles.headRow}>
              {columns.map(column => {
                const count = cellCards(items, column.id).length;
                const over = column.limit !== undefined && count > column.limit;
                const full = column.limit !== undefined && count >= column.limit;
                return (
                  <div key={column.id} className={styles.columnHead}>
                    <h3 className={styles.columnTitle}>{column.label}</h3>
                    <span className={styles.count} data-full={full ? "true" : undefined} data-over={over ? "true" : undefined}>
                      {column.limit !== undefined ? `${count}/${column.limit}` : String(count)}
                      {over && <span className={styles.over}> İş sınırı aşıldı.</span>}
                    </span>
                    <Button variant="ghost" size="sm" aria-label={`${column.label} sütununa kart ekle`} disabled={loading} onClick={() => { setAdding(column.id); setDraft(""); }}><Plus size={14} strokeWidth={1.75} aria-hidden="true" /></Button>
                  </div>
                );
              })}
            </div>
            {loading ? (
              <div className={styles.skeletonRow}>{columns.map(column => <div key={column.id} className={styles.cell}><Skeleton lines={2} label="Kartlar yükleniyor" /><Skeleton lines={2} label="Kartlar yükleniyor" /></div>)}</div>
            ) : laneKeys.map(lane => (
              <div key={String(lane)} className={styles.lane}>
                {lane !== undefined && (
                  <div className={styles.laneHead}>
                    {lane ? <Avatar name={personOf(lane)?.name ?? ""} src={personOf(lane)?.src} size="sm" /> : null}
                    <span>{lane ? personOf(lane)?.name : "Atanmamış"}</span>
                  </div>
                )}
                <div className={styles.laneCells}>{columns.map(column => renderCell(column, lane))}</div>
              </div>
            ))}
          </div>
        </LayoutGroup>
      )}

      {failure && (
        <div className={styles.failure} role="alert">
          <span>Kaydedilemedi.</span>
          <Button size="sm" variant="ghost" onClick={() => { failure.retry(); }}>Yeniden dene</Button>
        </div>
      )}

      {drag && dragCard && typeof document !== "undefined" && createPortal(
        <motion.div
          className={styles.floating} aria-hidden="true"
          style={{ left: drag.x - drag.grabX, top: drag.y - drag.grabY, width: drag.width }}
          initial={reduced ? false : { scale: 1, rotate: 0 }} animate={{ scale: reduced ? 1 : 1.03, rotate: tilt }} transition={reduced ? { duration: 0 } : motionTokens.spring.responsive}
        >
          <span className={styles.card}><CardFace card={dragCard} tag={tagOf(dragCard.tagId)} person={personOf(dragCard.assigneeId)} /></span>
        </motion.div>,
        document.body,
      )}

      <Drawer open={open !== undefined} onOpenChange={next => { if (!next) setOpenId(null); }}>
        <DrawerContent title={open?.code ? `${open.code} · Kart ayrıntısı` : "Kart ayrıntısı"} side="right">
          {open && (
            <div className={styles.detail}>
              <Input label="Başlık" value={open.title} onChange={event => setItems(current => current.map(card => (card.id === open.id ? { ...card, title: event.target.value } : card)))} onBlur={() => void commit(items, cards)} />
              <Select label="Atanan" value={open.assigneeId ?? "none"} onValueChange={value => patchOpen({ assigneeId: value === "none" ? undefined : value })} options={[{ value: "none", label: "Atanmamış" }, ...people.map(person => ({ value: person.id, label: person.name }))]} />
              <Input label="Bitiş" description="24.10.2026 biçiminde yazın." value={dueText} error={dueError || undefined} onChange={event => setDueText(event.target.value)} onBlur={commitDue} />
              <Select label="Etiket" value={open.tagId ?? "none"} onValueChange={value => patchOpen({ tagId: value === "none" ? undefined : value })} options={[{ value: "none", label: "Etiketsiz" }, ...tags.map(tag => ({ value: tag.id, label: tag.label }))]} />
              <Input label="Puan" inputMode="numeric" value={open.points === undefined ? "" : String(open.points)} onChange={event => { const digits = text.digits(event.target.value, 3); setItems(current => current.map(card => (card.id === open.id ? { ...card, points: digits === "" ? undefined : Number(digits) } : card))); }} onBlur={() => void commit(items, cards)} />
              {open.checklist && open.checklist.length > 0 && (
                <fieldset className={styles.checklist}>
                  <legend>Kontrol listesi</legend>
                  {open.checklist.map(item => (
                    <Checkbox key={item.id} label={item.text} checked={item.done} onCheckedChange={checked => patchOpen({ checklist: open.checklist?.map(entry => (entry.id === item.id ? { ...entry, done: checked === true } : entry)) })} />
                  ))}
                </fieldset>
              )}
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </section>
  );
}

export default KanbanBoard;
