"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AnimatedCounter } from "../animated-counter/animated-counter";
import { Button } from "../button/button";
import { useReducedMotionSafe } from "../lib/viz-utils";
import { computeTotals, fieldText, groupedInput, majorOf, minorText, parseField, validateItems, vatLabel, type InvoiceItem } from "./invoice-studio-format";
import styles from "./invoice-studio.module.css";

export type { InvoiceItem };
export interface InvoiceParty { name: string; lines?: string[] | undefined }
export interface InvoiceDraft { kind: "invoice" | "quote"; items: InvoiceItem[]; vatRate: number; note: string }

/** Kalemli bir fatura ya da teklif taslağını ekranda düzenletmek için kullanın (kalem ekle ve sil, adet ve birim fiyat değiştikçe ara toplam, KDV ve genel toplam anında hesaplanır). Yalnız taslağı düzenler; resmî e-fatura ya da e-arşiv üretimi ve gönderimi kapsam dışıdır, toplam gerçek belgede sunucuda yeniden hesaplanmalıdır. */
export interface InvoiceStudioProps {
  kind?: "invoice" | "quote" | undefined;
  sender: InvoiceParty;
  recipient: InvoiceParty;
  /** Başlangıç kalemleri; sonra bileşen tutar. */
  defaultItems?: InvoiceItem[] | undefined;
  /** KDV oranı (yüzde); proje ayarından gelir. */
  vatRate?: number | undefined;
  defaultNote?: string | undefined;
  /** Taslağı kaydeder; reddederse (Promise) "Kaydedilemedi" yazılır ve yeniden denenebilir. */
  onSave: (draft: InvoiceDraft) => Promise<void>;
  /** Her değişiklikte çağrılır (taslağı dışarıda izlemek için). */
  onChange?: ((draft: InvoiceDraft) => void) | undefined;
}

interface Row { id: string; description: string; quantityText: string; priceText: string }
const toRow = (item: InvoiceItem): Row => ({ id: item.id, description: item.description, quantityText: fieldText(item.quantity, 3), priceText: fieldText(item.unitPrice, 2) });

export function InvoiceStudio({ kind = "invoice", sender, recipient, defaultItems = [], vatRate = 20, defaultNote = "", onSave, onChange }: InvoiceStudioProps) {
  const reduced = useReducedMotionSafe();
  const baseId = useId();
  const [rows, setRows] = useState<Row[]>(() => defaultItems.map(toRow));
  const [note, setNote] = useState(defaultNote);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [flagged, setFlagged] = useState<string[]>([]);
  const nextId = useRef(defaultItems.length + 1);
  const focusId = useRef<string | null>(null);

  const items: InvoiceItem[] = useMemo(() => rows.map(row => ({ id: row.id, description: row.description, quantity: Math.max(parseField(row.quantityText) ?? 0, 0), unitPrice: Math.max(parseField(row.priceText) ?? 0, 0) })), [rows]);
  const totals = useMemo(() => computeTotals(items, vatRate), [items, vatRate]);
  const title = kind === "invoice" ? "Fatura" : "Teklif";

  useEffect(() => { onChange?.({ kind, items, vatRate, note }); }, [items, note, kind, vatRate]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!focusId.current) return;
    const node = document.getElementById(`${baseId}-${focusId.current}-description`);
    focusId.current = null;
    node?.focus();
  }, [rows, baseId]);

  const update = (id: string, patch: Partial<Row>) => { setRows(current => current.map(row => row.id === id ? { ...row, ...patch } : row)); setFlagged(current => current.filter(item => item !== id)); setMessage(null); };
  const add = () => { const id = `kalem-${nextId.current++}`; focusId.current = id; setRows(current => [...current, { id, description: "", quantityText: "1", priceText: "" }]); setMessage(null); };
  const remove = (id: string) => { setRows(current => current.filter(row => row.id !== id)); setFlagged(current => current.filter(item => item !== id)); };

  const save = async () => {
    const problems = validateItems(items);
    if (problems.length) { setFlagged(problems.map(problem => problem.id)); setMessage({ tone: "error", text: problems[0]!.message }); return; }
    setSaving(true); setMessage(null);
    try { await onSave({ kind, items, vatRate, note }); setMessage({ tone: "ok", text: "Taslak kaydedildi" }); }
    catch { setMessage({ tone: "error", text: "Kaydedilemedi" }); }
    finally { setSaving(false); }
  };

  const spring = reduced ? { duration: 0 } : { duration: .24, ease: [.22, 1, .36, 1] as [number, number, number, number] };

  return <section className={styles.root} data-reduced={reduced || undefined} aria-label={`${title} taslağı`}>
    <header className={styles.top}>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.parties}>
        <div><span className={styles.partyLabel}>Gönderen</span><b>{sender.name}</b>{sender.lines?.map(line => <span key={line}>{line}</span>)}</div>
        <div><span className={styles.partyLabel}>Alıcı</span><b>{recipient.name}</b>{recipient.lines?.map(line => <span key={line}>{line}</span>)}</div>
      </div>
    </header>

    <div className={styles.table} role="table" aria-label="Kalemler">
      <div className={styles.head} role="row"><span role="columnheader">İş / hizmet</span><span role="columnheader">Adet</span><span role="columnheader">Birim fiyat</span><span role="columnheader">Tutar</span><span role="columnheader" className={styles.srOnly}>Sil</span></div>
      {rows.length === 0 && <p className={styles.empty}>Henüz kalem yok.</p>}
      <AnimatePresence initial={false}>
        {rows.map((row, at) => {
          const flag = flagged.includes(row.id);
          return <motion.div key={row.id} role="row" className={styles.row} data-flag={flag || undefined} initial={reduced ? false : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={spring} style={{ overflow: "hidden" }}>
            <div className={styles.rowInner}>
              <label className={styles.cell} data-cell="description"><span className={styles.cellLabel}>İş / hizmet</span>
                <input id={`${baseId}-${row.id}-description`} value={row.description} onChange={event => update(row.id, { description: event.target.value })} aria-label={`${at + 1}. kalem açıklama`} aria-invalid={flag || undefined} aria-describedby={flag ? `${baseId}-${row.id}-error` : undefined} /></label>
              <label className={styles.cell} data-cell="quantity"><span className={styles.cellLabel}>Adet</span>
                <input inputMode="decimal" autoComplete="off" value={row.quantityText} onChange={event => update(row.id, { quantityText: groupedInput(event.target.value, 3) })} onBlur={() => update(row.id, { quantityText: fieldText(Math.max(parseField(row.quantityText) ?? 0, 0), 3) })} aria-label={`${at + 1}. kalem adet`} /></label>
              <label className={styles.cell} data-cell="price"><span className={styles.cellLabel}>Birim fiyat</span>
                <span className={styles.money}><i aria-hidden="true">₺</i><input inputMode="decimal" autoComplete="off" value={row.priceText} onChange={event => update(row.id, { priceText: groupedInput(event.target.value, 2) })} aria-label={`${at + 1}. kalem birim fiyat`} /></span></label>
              <span className={styles.amount}><span className={styles.cellLabel}>Tutar</span><span className={styles.srOnly}>{`${at + 1}. kalem tutar `}</span>{minorText(totals.lines[at] ?? 0)}</span>
              <button type="button" className={styles.remove} onClick={() => remove(row.id)} aria-label={`${at + 1}. kalemi sil`}>✕</button>
            </div>
            {flag && <p id={`${baseId}-${row.id}-error`} className={styles.rowError}>Her kalem için açıklama girin</p>}
          </motion.div>;
        })}
      </AnimatePresence>
    </div>
    <div><Button size="sm" variant="secondary" onClick={add}>+ Kalem ekle</Button></div>

    <div className={styles.lower}>
      <label className={styles.note}><span>Not</span><textarea rows={3} value={note} onChange={event => setNote(event.target.value)} placeholder="Ödeme koşulu gibi kısa bir not" /></label>
      <output className={styles.totals} aria-live="polite" aria-atomic="true">
        <span className={styles.srOnly}>{`Ara toplam ${minorText(totals.subtotalMinor)}, ${vatLabel(vatRate)} ${minorText(totals.vatMinor)}, ödenecek toplam ${minorText(totals.totalMinor)}`}</span>
        <span className={styles.totalRow} aria-hidden="true"><span>Ara toplam</span><b><AnimatedCounter value={majorOf(totals.subtotalMinor)} decimals={2} prefix="₺" /></b></span>
        <span className={styles.totalRow} aria-hidden="true"><span>{vatLabel(vatRate)}</span><b><AnimatedCounter value={majorOf(totals.vatMinor)} decimals={2} prefix="₺" /></b></span>
        <span className={styles.grand} aria-hidden="true"><span>Ödenecek toplam</span><b><AnimatedCounter value={majorOf(totals.totalMinor)} decimals={2} prefix="₺" /></b></span>
      </output>
    </div>

    <footer className={styles.footer}>
      <p className={styles.status} role="status" aria-live="polite" data-tone={message?.tone}>{saving ? "Kaydediliyor…" : message?.text ?? ""}</p>
      <Button variant="primary" onClick={save} disabled={saving} loading={saving}>Taslağı kaydet</Button>
    </footer>
  </section>;
}

export default InvoiceStudio;
