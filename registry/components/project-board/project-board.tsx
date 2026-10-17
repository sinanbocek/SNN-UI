"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, MessageSquare, Plus } from "lucide-react";
import { text } from "@snn/abacus-core";
import { motionTokens } from "../lib/motion-tokens";
import { Avatar } from "../avatar/avatar";
import { Badge } from "../badge/badge";
import { Button } from "../button/button";
import { EmptyState } from "../empty-state/empty-state";
import { Input } from "../input/input";
import { Progress } from "../progress/progress";
import SegmentedControl from "../segmented-control/segmented-control";
import { Skeleton } from "../skeleton/skeleton";
import { Tooltip } from "../tooltip/tooltip";
import { StageIcon, stageKind, type StageKind } from "../lib/stage-icon";
import styles from "./project-board.module.css";

/** Aşama. `kind` başlık simgesini seçer (planlandı, sürüyor, kontrolde, bitti); verilmezse kimlik, ad ya da sıradan çıkarılır. */
export interface BoardStage { id: string; label: string; kind?: StageKind }
export interface BoardPerson { id: string; name: string; src?: string }

export interface BoardTask {
  id: string;
  title: string;
  /** `stages` içindeki bir aşama kimliği. */
  stage: string;
  /** İş grubu etiketi ("Teklif", "Saha"). */
  tag?: string;
  /** Bitiş günü, hazır metin ("Per", "24 Ekim"; proje ABACUS `date` ile üretir). */
  due?: string;
  /** Bitiş bugünse true: gün yazısının yanında "Bugün" rozeti de çıkar (renge ek olarak yazı). */
  dueToday?: boolean;
  assigneeId?: string;
  comments?: number;
}

export interface ProjectBoardProps {
  /** Pano adı. */
  name: string;
  tasks: BoardTask[];
  people?: BoardPerson[];
  /** "Benim işlerim" süzgeci ve yeni görevin atanacağı kişi. */
  currentUserId?: string;
  /** Aşamalar soldan sağa. Verilmezse Planlandı, Sürüyor, Kontrolde, Bitti. Son aşama "bitti" sayılır. */
  stages?: BoardStage[];
  /** Görev komşu aşamaya taşındı. Reddedilirse kart eski sütuna döner ve sütun altında "Taşınamadı." ile "Yeniden dene" çıkar. */
  onMove: (taskId: string, stageId: string) => void | Promise<void>;
  /** Yeni görev (ilk aşamanın başına eklenir). */
  onAdd: (title: string) => void | Promise<void>;
  loading?: boolean;
  className?: string;
}

export const defaultStages: BoardStage[] = [
  { id: "planned", label: "Planlandı" },
  { id: "active", label: "Sürüyor" },
  { id: "review", label: "Kontrolde" },
  { id: "done", label: "Bitti" },
];

type Direction = "prev" | "next";

/** Az sayıda işin sabit aşamalar arasında ilerlediği küçük pano: sürükleme yok, her kartta önceki ve sonraki aşama okları. */
export function ProjectBoard({ name, tasks, people = [], currentUserId, stages = defaultStages, onMove, onAdd, loading = false, className }: ProjectBoardProps) {
  const uid = useId();
  const reduced = useReducedMotion() ?? false;
  const boardRef = useRef<HTMLDivElement>(null);
  const addRef = useRef<HTMLInputElement>(null);
  const focusAfter = useRef<{ id: string; direction: Direction; stage: string } | null>(null);
  const tempId = useRef(0);
  const [items, setItems] = useState(tasks);
  const [filter, setFilter] = useState<"all" | "mine">("all");
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [errors, setErrors] = useState<Record<string, { taskId: string; to: string }>>({});
  const [note, setNote] = useState("");

  useEffect(() => { setItems(tasks); }, [tasks]);

  const lastStage = stages[stages.length - 1]?.id;
  const total = items.length;
  const done = items.filter(task => task.stage === lastStage).length;
  const personOf = (id?: string) => people.find(person => person.id === id);
  const visible = useMemo(() => (filter === "mine" ? items.filter(task => task.assigneeId === currentUserId) : items), [items, filter, currentUserId]);
  const stageLabel = (id: string) => stages.find(stage => stage.id === id)?.label ?? id;

  // Taşımadan sonra odak, taşınan kartın yeni konumundaki aynı yönlü düğmeye (yoksa karşıt düğmeye ya da karta) gider.
  useEffect(() => {
    const target = focusAfter.current;
    if (!target) return;
    const card = boardRef.current?.querySelector<HTMLElement>(`[data-task="${target.id}"][data-stage="${target.stage}"]`);
    if (!card) return;
    focusAfter.current = null;
    const first = card.querySelector<HTMLButtonElement>(`[data-dir="${target.direction}"]:not(:disabled)`) ?? card.querySelector<HTMLButtonElement>("[data-dir]:not(:disabled)");
    (first ?? card).focus();
  }, [items]);

  async function move(task: BoardTask, direction: Direction) {
    const index = stages.findIndex(stage => stage.id === task.stage);
    const target = stages[index + (direction === "next" ? 1 : -1)];
    if (!target) return;
    const from = task.stage;
    focusAfter.current = { id: task.id, direction, stage: target.id };
    setItems(current => current.map(item => (item.id === task.id ? { ...item, stage: target.id } : item)));
    setErrors(current => { const { [from]: _gone, ...rest } = current; return rest; });
    setNote(`${task.title}, ${target.label} aşamasına taşındı`);
    try { await onMove(task.id, target.id); }
    catch {
      setItems(current => current.map(item => (item.id === task.id ? { ...item, stage: from } : item)));
      setErrors(current => ({ ...current, [from]: { taskId: task.id, to: target.id } }));
      setNote("Taşınamadı.");
    }
  }

  async function add(event: FormEvent) {
    event.preventDefault();
    const title = draft.trim();
    if (!title || !stages[0]) return;
    const id = `tmp-${(tempId.current += 1)}`;
    setItems(current => [{ id, title, stage: stages[0].id, assigneeId: currentUserId }, ...current]);
    setDraft("");
    setAdding(false);
    setNote(`${title} görevi eklendi`);
    try { await onAdd(title); }
    catch { setItems(current => current.filter(item => item.id !== id)); setNote("Görev eklenemedi."); }
  }

  function onAddKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") { event.preventDefault(); setAdding(false); setDraft(""); }
  }

  useEffect(() => { if (adding) addRef.current?.focus(); }, [adding]);

  const cardMotion = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: motionTokens.duration.instant } }
    : { layout: true as const, initial: { opacity: 0, scale: 0.92 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.96, transition: { duration: motionTokens.duration.fast } }, transition: { layout: motionTokens.spring.smooth, opacity: { duration: motionTokens.duration.fast }, scale: motionTokens.spring.snappy } };

  const mineEmpty = filter === "mine" && visible.length === 0 && items.length > 0;

  return (
    <section className={[styles.root, className].filter(Boolean).join(" ")} data-reduced={reduced ? "true" : undefined} aria-labelledby={`${uid}-title`}>
      <div className={styles.srOnly} role="status" aria-live="polite">{note}</div>

      <header className={styles.header}>
        <div className={styles.headText}>
          <h2 id={`${uid}-title`} className={styles.title}>{name}</h2>
          <p className={styles.lead}>{total === 0 ? "Henüz iş yok" : `Bu dönem ${total} işten ${text.suffix(done, "number", "acc")} bitti`}</p>
        </div>
        <div className={styles.tools}>
          {people.length > 0 && <span className={styles.people} role="group" aria-label="Katılımcılar">{people.slice(0, 4).map(person => <span key={person.id} className={styles.personItem}><Avatar name={person.name} src={person.src} size="sm" /></span>)}</span>}
          {currentUserId && <SegmentedControl label="Süzgeç" value={filter} onValueChange={value => setFilter(value as "all" | "mine")} options={[{ value: "all", label: "Tümü" }, { value: "mine", label: "Benim işlerim" }]} />}
          <Button size="sm" onClick={() => setAdding(true)} disabled={loading || adding}><Plus size={16} strokeWidth={1.75} aria-hidden="true" /><span className={styles.addText}>Görev ekle</span></Button>
        </div>
      </header>

      <Progress value={done} max={Math.max(total, 1)} label="Dönem ilerlemesi" />

      {!loading && total === 0 && !adding ? (
        <EmptyState title="Henüz iş eklenmedi." description="İlk görevi ekleyerek panoyu başlatın." action={<Button variant="secondary" onClick={() => setAdding(true)}>Görev ekle</Button>} />
      ) : (
        <LayoutGroup id={uid}>
          <div className={styles.board} ref={boardRef}>
            {stages.map((stage, stageIndex) => {
              const column = visible.filter(task => task.stage === stage.id);
              const error = errors[stage.id];
              return (
                <section key={stage.id} className={styles.column} aria-label={`${stage.label}, ${column.length} görev`}>
                  <header className={styles.columnHead}>
                    <h3 className={styles.columnTitle}><StageIcon kind={stage.kind ?? stageKind(stage.id, stage.label, stages.indexOf(stage), stages.length)} />{stage.label}</h3>
                    <span className={styles.count} aria-hidden="true">{String(column.length)}</span>
                  </header>

                  {loading ? (
                    <div className={styles.skeletons}>{[0, 1].map(index => <Skeleton key={index} lines={2} label="Görevler yükleniyor" />)}</div>
                  ) : (
                    <ul className={styles.list}>
                      {stageIndex === 0 && adding && (
                        <li className={styles.card}>
                          <form onSubmit={event => void add(event)} className={styles.addForm}>
                            <Input ref={addRef} label="Görev başlığı" value={draft} onChange={event => setDraft(event.target.value)} onKeyDown={onAddKeyDown} />
                            <div className={styles.addActions}>
                              <Button type="button" size="sm" variant="ghost" onClick={() => { setAdding(false); setDraft(""); }}>Vazgeç</Button>
                              <Button type="submit" size="sm" disabled={draft.trim() === ""}>Ekle</Button>
                            </div>
                          </form>
                        </li>
                      )}
                      <AnimatePresence initial={false}>
                        {column.map(task => {
                          const person = personOf(task.assigneeId);
                          return (
                            <motion.li key={task.id} layoutId={reduced ? undefined : `${uid}-${task.id}`} className={styles.card} data-task={task.id} data-stage={task.stage} tabIndex={-1} {...cardMotion}>
                              <div className={styles.cardTop}>
                                {task.tag ? <Badge size="sm">{task.tag}</Badge> : <span />}
                                {task.due && <span className={styles.due}>{task.dueToday && <Badge size="sm" tone="info">Bugün</Badge>}<span>{task.due}</span></span>}
                              </div>
                              <Tooltip content={task.title}><p className={styles.taskTitle}>{task.title}</p></Tooltip>
                              <div className={styles.cardBottom}>
                                <span className={styles.meta}>
                                  {person && <Avatar name={person.name} src={person.src} size="sm" />}
                                  {task.comments ? <span className={styles.comments}><MessageSquare size={14} strokeWidth={1.75} aria-hidden="true" />{String(task.comments)}<span className={styles.srOnly}> yorum</span></span> : null}
                                </span>
                                <span className={styles.moves}>
                                  <Button variant="ghost" size="sm" data-dir="prev" disabled={stageIndex === 0} aria-label={`${task.title} görevini ${stages[stageIndex - 1] ? stageLabel(stages[stageIndex - 1].id) : ""} aşamasına taşı`} onClick={() => void move(task, "prev")}><ChevronLeft size={16} strokeWidth={1.75} aria-hidden="true" /></Button>
                                  <Button variant="ghost" size="sm" data-dir="next" disabled={stageIndex === stages.length - 1} aria-label={`${task.title} görevini ${stages[stageIndex + 1] ? stageLabel(stages[stageIndex + 1].id) : ""} aşamasına taşı`} onClick={() => void move(task, "next")}><ChevronRight size={16} strokeWidth={1.75} aria-hidden="true" /></Button>
                                </span>
                              </div>
                            </motion.li>
                          );
                        })}
                      </AnimatePresence>
                      {column.length === 0 && !(stageIndex === 0 && adding) && <li className={styles.empty}>{mineEmpty && stageIndex === 0 ? "Size atanmış iş yok." : "Bu aşamada iş yok."}</li>}
                    </ul>
                  )}

                  {error && (
                    <div className={styles.error} role="alert">
                      <span>Taşınamadı.</span>
                      <Button size="sm" variant="ghost" onClick={() => { const task = items.find(item => item.id === error.taskId); if (task) void move(task, stages.findIndex(entry => entry.id === error.to) > stageIndex ? "next" : "prev"); }}>Yeniden dene</Button>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </LayoutGroup>
      )}
    </section>
  );
}

export default ProjectBoard;
