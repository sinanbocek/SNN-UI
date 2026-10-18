"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Transition } from "motion/react";
import { motionTokens } from "../lib/motion-tokens";
import { Avatar } from "../avatar/avatar";
import { Badge } from "../badge/badge";
import { Button } from "../button/button";
import { EmptyState } from "../empty-state/empty-state";
import { Pagination } from "../pagination/pagination";
import { Skeleton } from "../skeleton/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs/tabs";
import styles from "./inbox-triage.module.css";

export type InboxFolder = "inbox" | "snoozed" | "archive";

export interface InboxMessage {
  id: string;
  from: string;
  subject: string;
  /** Satırda gösterilen önizleme cümlesi. */
  preview: string;
  /** Açılınca gösterilen tam metin; her dizi öğesi bir paragraf. */
  body: string[];
  /** Zaman, hazır metin ("09.42", "Dün"; proje ABACUS `date` ile üretir). */
  time: string;
  unread: boolean;
  folder: InboxFolder;
  src?: string | undefined;
}

export interface InboxTriageProps {
  messages: InboxMessage[];
  /** Mesaj klasör değiştirdi (arşivle, ertele, geri al). Reddedilirse mesaj eski yerine döner ve durum satırı "Yeniden dene" gösterir. */
  onMove: (id: string, to: InboxFolder) => void | Promise<void>;
  /** Mesaj ilk kez açılıp okundu oldu. */
  onRead?: ((id: string) => void) | undefined;
  loading?: boolean | undefined;
  /** Sayfa başına mesaj. Klasördeki mesaj sayısı bunu aşarsa sayfalama çıkar. */
  pageSize?: number | undefined;
  title?: string | undefined;
  className?: string | undefined;
}

const folderLabel: Record<InboxFolder, string> = { inbox: "Gelen", snoozed: "Ertelenen", archive: "Arşiv" };
const folderOrder: InboxFolder[] = ["inbox", "snoozed", "archive"];
const emptyText: Record<InboxFolder, { title: string; description: string }> = {
  inbox: { title: "Gelen kutusu temiz.", description: "Karar bekleyen mesaj kalmadı." },
  snoozed: { title: "Ertelenen mesaj yok.", description: "Ertelediğiniz mesajlar burada görünür." },
  archive: { title: "Arşiv boş.", description: "Arşivlediğiniz mesajlar burada görünür." },
};
const doneText: Record<InboxFolder, string> = { archive: "Arşivlendi.", snoozed: "Ertelendi.", inbox: "Geri alındı." };

type Last = { id: string; from: InboxFolder; to: InboxFolder };
type Notice = { kind: "done"; last: Last } | { kind: "error"; last: Last };

/** Karar bekleyen mesaj kuyruğu: klasör sekmeleri, yerinde açılan satırlar, tek tuş kısayolları (E, S, U) ve geri alınabilir son hamle. */
export function InboxTriage({ messages, onMove, onRead, loading = false, pageSize = 8, title = "Mesajlar", className }: InboxTriageProps) {
  const uid = useId();
  const reduced = useReducedMotion() ?? false;
  const headingRef = useRef<HTMLHeadingElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const focusAfter = useRef<string | null>(null);
  const [items, setItems] = useState(messages);
  const [folder, setFolder] = useState<InboxFolder>("inbox");
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [tabStop, setTabStop] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => { setItems(messages); }, [messages]);

  const inFolder = useMemo(() => items.filter(message => message.folder === folder), [items, folder]);
  const visible = useMemo(() => (onlyUnread ? inFolder.filter(message => message.unread) : inFolder), [inFolder, onlyUnread]);
  const pageCount = Math.max(1, Math.ceil(visible.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const shown = visible.slice((safePage - 1) * pageSize, safePage * pageSize);
  const unreadTotal = items.filter(message => message.unread && message.folder === "inbox").length;
  const count = (key: InboxFolder) => items.filter(message => message.folder === key).length;
  const stopId = shown.some(message => message.id === tabStop) ? tabStop : shown[0]?.id ?? null;

  // Hamle sonrası odak: sonraki satıra (ya da geri alınan satıra) gider; satır yoksa başlığa.
  useEffect(() => {
    const id = focusAfter.current;
    if (id === null) return;
    focusAfter.current = null;
    if (id === "") { headingRef.current?.focus(); return; }
    listRef.current?.querySelector<HTMLElement>(`[data-row="${id}"]`)?.focus();
  }, [items, folder]);

  async function move(id: string, to: InboxFolder, undoing = false) {
    const message = items.find(item => item.id === id);
    if (!message || message.folder === to) return;
    const last: Last = { id, from: message.folder, to };
    if (!undoing) {
      const index = shown.findIndex(item => item.id === id);
      const next = shown[index + 1] ?? shown[index - 1];
      focusAfter.current = next ? next.id : "";
      if (openId === id) setOpenId(null);
    }
    setItems(current => current.map(item => (item.id === id ? { ...item, folder: to } : item)));
    setNotice({ kind: "done", last });
    setNote(`${message.subject}: ${doneText[to]}`);
    try {
      await onMove(id, to);
    } catch {
      setItems(current => current.map(item => (item.id === id ? { ...item, folder: last.from } : item)));
      setNotice({ kind: "error", last });
      setNote("Mesaj taşınamadı.");
    }
  }

  function undo(last: Last) {
    // Geri al: mesaj eski klasörüne döner; o klasör açılır ve odak satıra gelir.
    setFolder(last.from);
    setPage(1);
    focusAfter.current = last.id;
    void move(last.id, last.from, true).then(() => setNotice(current => (current?.kind === "error" ? current : null)));
    setNote("Geri alındı.");
  }

  function toggle(message: InboxMessage) {
    const opening = openId !== message.id;
    setOpenId(opening ? message.id : null);
    if (opening && message.unread) {
      setItems(current => current.map(item => (item.id === message.id ? { ...item, unread: false } : item)));
      onRead?.(message.id);
    }
  }

  function onRowKeyDown(event: KeyboardEvent<HTMLButtonElement>, message: InboxMessage) {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    const index = shown.findIndex(item => item.id === message.id);
    const go = (target?: InboxMessage) => { if (!target) return; event.preventDefault(); setTabStop(target.id); listRef.current?.querySelector<HTMLElement>(`[data-row="${target.id}"]`)?.focus(); };
    const key = event.key.length === 1 ? event.code : event.key;
    if (key === "ArrowDown") go(shown[index + 1]);
    else if (key === "ArrowUp") go(shown[index - 1]);
    else if (key === "Home") go(shown[0]);
    else if (key === "End") go(shown[shown.length - 1]);
    else if (key === "KeyE" && folder !== "archive") { event.preventDefault(); void move(message.id, "archive"); }
    else if (key === "KeyS" && folder === "inbox") { event.preventDefault(); void move(message.id, "snoozed"); }
    else if (key === "KeyU" && folder !== "inbox") { event.preventDefault(); void move(message.id, "inbox"); }
  }

  const grow: Transition = { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] };
  const still: Transition = { duration: motionTokens.duration.instant };
  const rowMotion = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: still }
    : { layout: "position" as const, initial: { opacity: 0, height: 0 }, animate: { opacity: 1, height: "auto" }, exit: { opacity: 0, height: 0 }, transition: grow };

  const shortcuts: { key: string; label: string }[] = folder === "inbox"
    ? [{ key: "S", label: "ertele" }, { key: "E", label: "arşivle" }]
    : folder === "snoozed" ? [{ key: "E", label: "arşivle" }, { key: "U", label: "geri al" }] : [{ key: "U", label: "geri al" }];

  const list = (
    <>
      {loading ? (
        <div className={styles.skeletons}>{[0, 1, 2, 3].map(index => <Skeleton key={index} avatar lines={2} label="Mesajlar yükleniyor" />)}</div>
      ) : visible.length === 0 ? (
        onlyUnread && inFolder.length > 0
          ? <EmptyState title="Okunmamış mesaj yok." description="Bu klasördeki tüm mesajlar okundu." action={<Button variant="secondary" onClick={() => setOnlyUnread(false)}>Süzgeci kapat</Button>} />
          : <EmptyState title={emptyText[folder].title} description={emptyText[folder].description} />
      ) : (
        <ul ref={listRef} className={styles.list} aria-label={`${folderLabel[folder]} mesajları`}>
          <AnimatePresence initial={false}>
            {shown.map(message => {
              const open = openId === message.id;
              return (
                <motion.li key={message.id} className={styles.item} {...rowMotion}>
                  <button
                    type="button" className={styles.row} data-row={message.id} data-unread={message.unread ? "true" : undefined}
                    tabIndex={stopId === message.id ? 0 : -1} aria-expanded={open} aria-controls={`${uid}-${message.id}`}
                    aria-keyshortcuts={folder === "inbox" ? "E S" : folder === "snoozed" ? "E U" : "U"}
                    onFocus={() => setTabStop(message.id)} onClick={() => toggle(message)} onKeyDown={event => onRowKeyDown(event, message)}
                  >
                    <span className={styles.mark} aria-hidden="true">{message.unread && <span className={styles.unreadDot} />}</span>
                    <Avatar name={message.from} src={message.src} size="sm" />
                    <span className={styles.from}>{message.from}</span>
                    <span className={styles.text}>
                      <span className={styles.subject}>{message.subject}</span>
                      <span className={styles.preview}>{message.preview}</span>
                    </span>
                    <span className={styles.time}>{message.time}</span>
                    {message.unread && <span className={styles.srOnly}>okunmamış</span>}
                  </button>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        id={`${uid}-${message.id}`} role="region" aria-label={message.subject} className={styles.detail}
                        initial={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }} transition={grow}
                      >
                        <div className={styles.detailBody}>
                          {message.body.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
                          <div className={styles.actions}>
                            {folder !== "archive" && <Button size="sm" variant="secondary" onClick={() => void move(message.id, "archive")}>Arşivle</Button>}
                            {folder === "inbox" && <Button size="sm" variant="ghost" onClick={() => void move(message.id, "snoozed")}>Ertele</Button>}
                            {folder !== "inbox" && <Button size="sm" variant="ghost" onClick={() => void move(message.id, "inbox")}>Gelene geri al</Button>}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
      {!loading && visible.length > pageSize && <div className={styles.pager}><Pagination page={safePage} pageCount={pageCount} onPageChange={setPage} /></div>}
    </>
  );

  return (
    <section className={[styles.root, className].filter(Boolean).join(" ")} data-reduced={reduced ? "true" : undefined} aria-labelledby={`${uid}-title`}>
      <div className={styles.srOnly} role="status" aria-live="polite">{note}</div>

      <header className={styles.header}>
        <h2 id={`${uid}-title`} ref={headingRef} tabIndex={-1} className={styles.title}>
          {title}
          <span className={styles.unreadCount}>{`${unreadTotal} okunmamış`}</span>
        </h2>
        <Button variant={onlyUnread ? "secondary" : "ghost"} size="sm" aria-pressed={onlyUnread} onClick={() => { setOnlyUnread(value => !value); setPage(1); }}>Yalnız okunmamışlar</Button>
      </header>

      <Tabs value={folder} onValueChange={value => { setFolder(value as InboxFolder); setPage(1); setNotice(null); setOpenId(null); }}>
        <TabsList aria-label="Klasörler">
          {folderOrder.map(key => (
            <TabsTrigger key={key} value={key}>{folderLabel[key]} <Badge size="sm">{String(count(key))}</Badge></TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={folder}>{list}</TabsContent>
      </Tabs>

      <div className={styles.footer}>
        <div className={styles.status} aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            {notice && (
              <motion.div key={notice.kind + notice.last.id + notice.last.to} className={styles.notice} data-kind={notice.kind}
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={reduced ? still : grow}>
                <span>{notice.kind === "error" ? "Mesaj taşınamadı." : doneText[notice.last.to]}</span>
                {notice.kind === "error"
                  ? <Button size="sm" variant="ghost" onClick={() => void move(notice.last.id, notice.last.to)}>Yeniden dene</Button>
                  : <Button size="sm" variant="ghost" onClick={() => undo(notice.last)}>Geri al</Button>}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <p className={styles.shortcuts}>
          {shortcuts.map(shortcut => <span key={shortcut.key}><kbd className={styles.kbd}>{shortcut.key}</kbd> {shortcut.label}</span>)}
        </p>
      </div>
    </section>
  );
}

export default InboxTriage;
