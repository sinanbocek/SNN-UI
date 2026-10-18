"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Search } from "lucide-react";
import { text } from "@snn/abacus-core";
import { motionTokens } from "../lib/motion-tokens";
import { Dialog, DialogContent } from "../dialog/dialog";
import { EmptyState } from "../empty-state/empty-state";
import { Input } from "../input/input";
import SegmentedControl from "../segmented-control/segmented-control";
import { SaveBar } from "../save-bar/save-bar";
import type { SaveBarStatus } from "../save-bar/save-bar";
import { Select } from "../select/select";
import { Skeleton } from "../skeleton/skeleton";
import { Switch } from "../switch/switch";
import styles from "./settings-command.module.css";

export type SettingValue = string | boolean;

export type SettingControl =
  | { kind: "switch" }
  | { kind: "segment"; options: { value: string; label: string }[] }
  | { kind: "select"; options: { value: string; label: string }[] }
  | { kind: "text"; prefix?: string | undefined; placeholder?: string | undefined };

export interface SettingsCommandSection { id: string; label: string; description?: string | undefined; icon?: ReactNode | undefined }

export interface SettingsCommandItem {
  id: string;
  /** `sections` içindeki bir bölüm kimliği. */
  section: string;
  title: string;
  description?: string | undefined;
  /** İnsanların gerçekte yazdığı ek sözler ("2fa", "karanlık mod"); palet bunlarla da bulur. */
  keywords?: string[] | undefined;
  control: SettingControl;
  /** Hata metni döndürürse satırda gösterilir ve Kaydet engellenir. */
  validate?: ((value: SettingValue) => string | undefined) | undefined;
}

export interface SettingsCommandProps {
  sections: SettingsCommandSection[];
  items: SettingsCommandItem[];
  /** Kaydedilmiş değerler (kimlik → değer). */
  values: Record<string, SettingValue>;
  /** Yalnız değişenlerin kimlik ve değerleri gelir. Reddedilirse çubuk "Yeniden dene" gösterir ve değişiklikler korunur. */
  onSave: (changes: Record<string, SettingValue>) => void | Promise<void>;
  /** Yazmadan önce paletin önerdiği ayarlar. */
  suggestedIds?: string[] | undefined;
  loading?: boolean | undefined;
  title?: string | undefined;
  className?: string | undefined;
}

const spring = motionTokens.spring.smooth;

/** Çok ayarlı sayfa: aranabilir komut paleti, bölüm gezgini, satır başı denetimler ve toplu kaydetme çubuğu. */
export function SettingsCommand({ sections, items, values, onSave, suggestedIds = [], loading = false, title = "Ayarlar", className }: SettingsCommandProps) {
  const uid = useId();
  const reduced = useReducedMotion() ?? false;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [saved, setSaved] = useState(values);
  const [draft, setDraft] = useState(values);
  const [status, setStatus] = useState<SaveBarStatus>("idle");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [currentSection, setCurrentSection] = useState(sections[0]?.id ?? "");
  const [flashId, setFlashId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const pendingJump = useRef<string | null>(null);
  const paletteInput = useRef<HTMLInputElement>(null);

  // Dışarıdan gelen kaydedilmiş değerler değişirse, kullanıcının dokunmadığı alanlar yeni değere uyar.
  useEffect(() => {
    setDraft(current => Object.fromEntries(Object.entries(values).map(([id, value]) => [id, current[id] !== saved[id] ? current[id] ?? value : value])));
    setSaved(values);
  }, [values]); // eslint-disable-line react-hooks/exhaustive-deps

  const changedIds = useMemo(() => items.filter(item => draft[item.id] !== saved[item.id]).map(item => item.id), [items, draft, saved]);
  const errors = useMemo(() => {
    const result: Record<string, string> = {};
    for (const item of items) {
      const value = draft[item.id];
      if (!item.validate || value === undefined || value === saved[item.id]) continue;
      const message = item.validate(value);
      if (message) result[item.id] = message;
    }
    return result;
  }, [items, draft, saved]);
  const sectionEdited = (id: string) => items.some(item => item.section === id && changedIds.includes(item.id));
  const suggested = useMemo(() => suggestedIds.map(id => items.find(item => item.id === id)).filter((item): item is SettingsCommandItem => Boolean(item)), [suggestedIds, items]);

  const results = useMemo(() => {
    const key = text.searchKey(query.trim());
    if (!key) return suggested;
    const words = key.split(" ").filter(Boolean);
    return items.filter(item => {
      const haystack = text.searchKey(`${item.title} ${item.description ?? ""} ${(item.keywords ?? []).join(" ")}`);
      return words.every(word => haystack.includes(word));
    });
  }, [query, items, suggested]);
  const sectionLabel = (id: string) => sections.find(section => section.id === id)?.label ?? "";

  // Bölüm gezgini: görünen bölüm kaydırdıkça vurgulanır.
  useEffect(() => {
    const root = scrollRef.current;
    if (!root || loading || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(records => {
      const visible = records.filter(record => record.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (visible) setCurrentSection((visible.target as HTMLElement).dataset.section ?? "");
    }, { root, rootMargin: "0px 0px -70% 0px" });
    root.querySelectorAll("[data-section]").forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, [loading, sections]);

  function scrollTo(element: HTMLElement | null) {
    const root = scrollRef.current;
    if (!root || !element) return;
    const top = element.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop - 16;
    root.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
  }

  function jumpTo(id: string, announce = true) {
    const row = scrollRef.current?.querySelector<HTMLElement>(`[data-item="${id}"]`);
    if (!row) return;
    scrollTo(row);
    row.querySelector<HTMLElement>("input, button, [role='switch'], [role='radio'], [role='combobox']")?.focus({ preventScroll: true });
    setFlashId(null);
    requestAnimationFrame(() => setFlashId(id));
    const item = items.find(entry => entry.id === id);
    if (item) { setCurrentSection(item.section); if (announce) setNote(`${item.title} ayarına gidildi`); }
  }

  function choose(id: string) {
    pendingJump.current = id;
    setOpen(false);
  }

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (next) { setQuery(""); setActive(0); }
  }

  // Palet kapandıktan sonra satıra atlanır.
  useEffect(() => {
    if (open || !pendingJump.current) return;
    const id = pendingJump.current;
    pendingJump.current = null;
    const timer = setTimeout(() => jumpTo(id), 30);
    return () => clearTimeout(timer);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!flashId) return;
    const timer = setTimeout(() => setFlashId(null), 1600);
    return () => clearTimeout(timer);
  }, [flashId]);

  function onRootKeyDown(event: KeyboardEvent<HTMLElement>) {
    const target = event.target as HTMLElement;
    const typing = target.matches("input, textarea, [contenteditable='true']");
    if ((event.code === "KeyK" && (event.ctrlKey || event.metaKey)) || (event.key === "/" && !typing && !event.ctrlKey && !event.metaKey)) {
      event.preventDefault();
      onOpenChange(true);
    }
  }

  function onPaletteKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") { event.preventDefault(); setActive(current => Math.min(current + 1, Math.max(results.length - 1, 0))); }
    else if (event.key === "ArrowUp") { event.preventDefault(); setActive(current => Math.max(current - 1, 0)); }
    else if (event.key === "Enter") { event.preventDefault(); const picked = results[active]; if (picked) choose(picked.id); }
  }

  async function save() {
    const firstInvalid = items.find(item => errors[item.id]);
    if (firstInvalid) { setStatus("error"); jumpTo(firstInvalid.id, false); setNote(`${firstInvalid.title}: ${errors[firstInvalid.id]}`); return; }
    setStatus("saving");
    const changes = Object.fromEntries(changedIds.flatMap(id => { const value = draft[id]; return value === undefined ? [] : [[id, value] as const]; }));
    try {
      await onSave(changes);
      setSaved(current => ({ ...current, ...changes }));
      setStatus("saved");
      setNote("Ayarlar kaydedildi.");
    } catch {
      setStatus("error");
      setNote("Kaydedilemedi");
    }
  }

  function discard() { setDraft(saved); setStatus("idle"); setNote("Değişiklikler geri alındı."); }

  function setValue(id: string, value: SettingValue) {
    setDraft(current => ({ ...current, [id]: value }));
    if (status !== "idle") setStatus("idle");
  }

  function renderControl(item: SettingsCommandItem) {
    const value = draft[item.id];
    switch (item.control.kind) {
      case "switch":
        return <Switch aria-label={item.title} aria-describedby={item.description ? `${uid}-${item.id}-d` : undefined} checked={value === true} onCheckedChange={next => setValue(item.id, next)} />;
      case "segment":
        return <SegmentedControl label={item.title} value={String(value ?? "")} options={item.control.options} onValueChange={next => setValue(item.id, next)} />;
      case "select":
        return <Select label={item.title} value={String(value ?? "")} options={item.control.options} onValueChange={next => setValue(item.id, next)} />;
      case "text":
        return (
          <div className={styles.textControl}>
            {item.control.prefix && <span className={styles.prefix} aria-hidden="true">{item.control.prefix}</span>}
            <Input label={item.title} value={String(value ?? "")} placeholder={item.control.placeholder} error={errors[item.id]} aria-describedby={item.description ? `${uid}-${item.id}-d` : undefined} onChange={event => setValue(item.id, event.target.value)} />
          </div>
        );
    }
  }

  const activeId = results[active] ? `${uid}-opt-${results[active].id}` : undefined;
  const noMatch = query.trim() !== "" && results.length === 0;

  return (
    <section className={[styles.root, className].filter(Boolean).join(" ")} data-reduced={reduced ? "true" : undefined} aria-labelledby={`${uid}-title`} onKeyDown={onRootKeyDown}>
      <div className={styles.status} role="status" aria-live="polite">{note}</div>

      <header className={styles.header}>
        <h2 id={`${uid}-title`} className={styles.title}>{title}</h2>
        <button type="button" className={styles.trigger} disabled={loading} aria-haspopup="dialog" aria-keyshortcuts="Control+K /" onClick={() => onOpenChange(true)}>
          <Search size={16} strokeWidth={1.75} aria-hidden="true" />
          <span className={styles.triggerText}>Ayarlarda ara</span>
          <kbd className={styles.kbd} aria-hidden="true">Ctrl K</kbd>
        </button>
      </header>

      <div className={styles.body}>
        <nav className={styles.nav} aria-label="Ayar bölümleri">
          {sections.map(section => {
            const current = currentSection === section.id;
            return (
              <button key={section.id} type="button" className={styles.navItem} aria-current={current ? "true" : undefined} disabled={loading}
                onClick={() => { setCurrentSection(section.id); scrollTo(scrollRef.current?.querySelector<HTMLElement>(`[data-section="${section.id}"]`) ?? null); setNote(`${section.label} bölümüne gidildi`); }}>
                {current && <motion.span layoutId={`${uid}-nav`} className={styles.navMark} transition={reduced ? { duration: 0 } : spring} aria-hidden="true" />}
                <span className={styles.navContent}>
                  {section.icon && <span className={styles.navIcon} aria-hidden="true">{section.icon}</span>}
                  <span>{section.label}</span>
                  {sectionEdited(section.id) && <><span className={styles.dot} aria-hidden="true" /><span className={styles.srOnly}>Düzenlendi</span></>}
                </span>
              </button>
            );
          })}
        </nav>

        <div className={styles.scroll} ref={scrollRef}>
          {loading ? (
            <div className={styles.skeletons}>{[0, 1, 2, 3].map(index => <Skeleton key={index} lines={2} label="Ayarlar yükleniyor" />)}</div>
          ) : sections.map(section => (
            <section key={section.id} className={styles.section} data-section={section.id} aria-labelledby={`${uid}-s-${section.id}`}>
              <h3 id={`${uid}-s-${section.id}`} className={styles.sectionTitle}>{section.label}</h3>
              {section.description && <p className={styles.sectionLead}>{section.description}</p>}
              <div className={styles.rows}>
                {items.filter(item => item.section === section.id).map(item => (
                  <div key={item.id} className={styles.row} data-item={item.id} data-flash={flashId === item.id ? "true" : undefined} data-kind={item.control.kind}>
                    <div className={styles.copy}>
                      <span className={styles.rowTitle}>{item.title}{changedIds.includes(item.id) && <><span className={styles.dot} aria-hidden="true" /><span className={styles.srOnly}>Düzenlendi</span></>}</span>
                      {item.description && <span id={`${uid}-${item.id}-d`} className={styles.rowDescription}>{item.description}</span>}
                      {errors[item.id] && item.control.kind !== "text" && <span className={styles.rowError} role="alert">{errors[item.id]}</span>}
                    </div>
                    <div className={styles.control}>{renderControl(item)}</div>
                  </div>
                ))}
              </div>
            </section>
          ))}
          {!loading && sections.length === 0 && <EmptyState title="Ayar yok" description="Bu ekranda gösterilecek ayar tanımlanmamış." />}
        </div>
      </div>

      <SaveBar changeCount={loading ? 0 : changedIds.length} status={status} onSave={() => void save()} onDiscard={discard} formatCount={count => `${count} değişiklik`} savedMessage="Ayarlar kaydedildi." errorMessage={Object.keys(errors).length ? "Geçersiz ayar var." : "Kaydedilemedi"} />

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent title="Ayarlarda ara" className={styles.palette} onOpenAutoFocus={event => { event.preventDefault(); paletteInput.current?.focus(); }} onCloseAutoFocus={event => { if (pendingJump.current) event.preventDefault(); }}>
          <div className={styles.paletteBody}>
            <input ref={paletteInput}
              className={styles.paletteInput} role="combobox" aria-expanded="true" aria-controls={`${uid}-list`} aria-activedescendant={activeId} aria-label="Ayar ara"
              placeholder="Ayar ara…" autoComplete="off" value={query}
              onChange={event => { setQuery(event.target.value); setActive(0); }} onKeyDown={onPaletteKeyDown}
            />
            {noMatch && <p className={styles.paletteEmpty} role="status">Eşleşen ayar yok</p>}
            <PaletteList
              uid={uid} listId={`${uid}-list`} heading={noMatch || !query.trim() ? "Önerilen ayarlar" : `${results.length} ayar`}
              list={noMatch ? suggested : results} active={noMatch ? -1 : active} onPick={choose} onHover={setActive} sectionLabel={sectionLabel}
            />
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function PaletteList({ uid, listId, heading, list, active, onPick, onHover, sectionLabel }: {
  uid: string; listId: string; heading: string; list: SettingsCommandItem[]; active: number; onPick: (id: string) => void; onHover: (index: number) => void; sectionLabel: (id: string) => string;
}) {
  return (
    <div className={styles.paletteGroup}>
      <span className={styles.paletteHeading}>{heading}</span>
      <ul className={styles.paletteList} role="listbox" id={listId} aria-label={heading}>
        {list.map((item, index) => (
          <li key={item.id} id={`${uid}-opt-${item.id}`} role="option" aria-selected={index === active} data-active={index === active ? "true" : undefined} className={styles.option} onMouseEnter={() => onHover(index)} onClick={() => onPick(item.id)}>
            <span className={styles.optionTitle}>{item.title}</span>
            <span className={styles.optionMeta}>{sectionLabel(item.section)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SettingsCommand;
