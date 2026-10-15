"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AnimatedCounter } from "../animated-counter/animated-counter";
import { Button } from "../button/button";
import { DropdownMenu } from "../dropdown-menu/dropdown-menu";
import { EmptyState } from "../empty-state/empty-state";
import { SearchField } from "../search-field/search-field";
import SegmentedControl from "../segmented-control/segmented-control";
import { motionTokens } from "../lib/motion-tokens";
import { srOnly, useAnnouncer } from "../lib/shop-parts";
import { toMinor } from "../lib/shop-format";
import { money } from "@snn/abacus-core";
import { useReducedMotionSafe } from "../lib/viz-utils";
import { ACTIONS, balanceText, changeText, chartGeometry, checkAmount, filterTransactions, pointText, spends, submitLabel, transactionAmountText, transactionMeta, type BalancePoint, type WalletAccount, type WalletAction, type WalletTransaction } from "./wallet-card-format";
import styles from "./wallet-card.module.css";

export type { BalancePoint, WalletAccount, WalletAction, WalletTransaction };

/** Küçük bir hesap görünümü için kullanın: bakiye, bakiye geçmişi grafiği, son hareketler ve odaklı para işlemleri (gönder, yatır, çevir, al). Gerçek para hareketi yapmaz: işlemi `onSubmit` ile uygulamanın defterine bağlayın; istemcideki tutar doğrulaması kolaylıktır, asıl denetim sunucudadır. Fatura ve abonelik için değil. */
export interface WalletCardProps {
  accounts: WalletAccount[];
  /** Dönem düğmeleri; `value` her hesabın `history` anahtarıdır. */
  periods: { value: string; label: string }[];
  defaultAccount?: string;
  /** İşlemi defterde yapar; reddederse hata iletisi yazılır. Hesapları güncelleyip yeni `accounts` verin: bakiye yeni değere sayar, yeni hareket yerinde açılır. */
  onSubmit: (order: { account: string; action: WalletAction; amountMinor: number }) => Promise<void>;
  onViewAll?: () => void;
  loading?: boolean;
}

function BalanceChart({ points, label }: { points: BalancePoint[]; label: string }) {
  const [active, setActive] = useState<number | null>(null);
  const shape = useMemo(() => chartGeometry(points), [points]);
  const shown = points[active ?? points.length - 1];
  const dot = shape.dots[active ?? shape.dots.length - 1];
  if (!points.length || !shown || !dot) return <p className={styles.muted}>Bu dönemde veri yok.</p>;
  return <div className={styles.chart}>
    <p className={styles.readout} aria-hidden="true">{pointText(shown)}</p>
    <div className={styles.plot} data-focus={active !== null || undefined}>
      <svg viewBox="0 0 300 84" preserveAspectRatio="none" aria-hidden="true"><path className={styles.area} d={shape.area} /><motion.path className={styles.line} d={shape.line} initial={false} animate={{ d: shape.line }} transition={{ duration: motionTokens.duration.standard }} /></svg>
      <span className={styles.marker} style={{ left: `${(dot.x / 300) * 100}%`, top: `${(dot.y / 84) * 100}%` }} aria-hidden="true" />
      <input type="range" className={styles.scrub} min={0} max={points.length - 1} step={1} value={active ?? points.length - 1} aria-label={label} aria-valuetext={pointText(shown)}
        onChange={event => setActive(Number(event.target.value))} onPointerLeave={() => setActive(null)} onBlur={() => setActive(null)} />
    </div>
  </div>;
}

export function WalletCard({ accounts, periods, defaultAccount, onSubmit, onViewAll, loading = false }: WalletCardProps) {
  const reduced = useReducedMotionSafe();
  const uid = useId();
  const [accountId, setAccountId] = useState(defaultAccount ?? accounts[0]?.id ?? "");
  const [period, setPeriod] = useState(periods[1]?.value ?? periods[0]?.value ?? "");
  const [hidden, setHidden] = useState(false);
  const [action, setAction] = useState<WalletAction | null>(null);
  const [raw, setRaw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [all, setAll] = useState(false);
  const [live, announce] = useAnnouncer();
  const actionButtons = useRef<Record<string, HTMLButtonElement | null>>({});
  const account = accounts.find(item => item.id === accountId) ?? accounts[0];
  const balanceMinor = account ? toMinor(account.balance) : 0;
  const found = useMemo(() => filterTransactions(account?.transactions ?? [], query), [account, query]);
  const rows = all ? found : found.slice(0, 3);
  const step = reduced ? { duration: 0 } : motionTokens.spring.smooth;
  const check = action ? checkAmount(raw, action, balanceMinor) : null;

  useEffect(() => { setError(null); }, [raw, action]);

  if (loading || !account) return <div className={styles.root} aria-busy="true" role="status" aria-label="Hesap yükleniyor"><div className={styles.skeleton}><span /><span /><span /></div></div>;

  const submit = async () => {
    if (!action || busy) return;
    const result = checkAmount(raw, action, balanceMinor);
    if (result.error || result.minor === null) { setError(result.error); return; }
    setBusy(true);
    try {
      await onSubmit({ account: account.id, action, amountMinor: result.minor });
      announce(`${ACTIONS.find(item => item.value === action)!.label} işlemi tamamlandı.`);
      const finished = action;
      setAction(null); setRaw("");
      requestAnimationFrame(() => actionButtons.current[finished]?.focus());
    } catch { setError("İşlem tamamlanamadı. Tekrar deneyin."); }
    finally { setBusy(false); }
  };

  return <motion.section layout={!reduced} transition={step} className={styles.root} aria-label="Hesap özeti" data-reduced={reduced || undefined}>
    <header className={styles.top}>
      <DropdownMenu label={account.label} items={accounts.map(item => ({ label: item.label, onSelect: () => { setAccountId(item.id); setAll(false); setQuery(""); } }))} />
      <button type="button" className={styles.eye} aria-pressed={hidden} aria-label={hidden ? "Bakiyeyi göster" : "Bakiyeyi gizle"} onClick={() => setHidden(!hidden)}>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12z" /><circle cx="12" cy="12" r="3" />{hidden && <path d="M4 4l16 16" />}</svg>
      </button>
    </header>

    <div className={styles.balance} role="status" aria-live="polite" aria-atomic="true">
      <p className={styles.label}>Kullanılabilir bakiye</p>
      <span className={srOnly}>{hidden ? "Bakiye gizli" : balanceText(account.balance)}</span>
      <p className={styles.amount} aria-hidden="true">{hidden ? <span className={styles.mask}>₺ ••••••</span> : <AnimatedCounter value={account.balance} decimals={2} prefix="₺" />}</p>
      <p className={styles.change} aria-hidden={hidden || undefined}>{hidden ? "" : changeText(account.monthChange)}</p>
    </div>

    <div className={styles.periodRow}><SegmentedControl label="Dönem" options={periods} value={period} onValueChange={setPeriod} /></div>
    <BalanceChart points={account.history[period] ?? []} label="Bakiye geçmişi: noktaları gezmek için ok tuşları" />

    <div className={styles.actions} role="group" aria-label="İşlemler">
      {ACTIONS.map(item => <button key={item.value} ref={node => { actionButtons.current[item.value] = node; }} type="button" className={styles.action} aria-pressed={action === item.value} aria-controls={`${uid}-panel`} onClick={() => { setAction(action === item.value ? null : item.value); setRaw(""); }}>{item.label}</button>)}
    </div>
    <AnimatePresence initial={false} mode="wait">
      {action && <motion.form key={action} id={`${uid}-panel`} className={styles.panel} noValidate
        initial={reduced ? false : { opacity: 0, y: 8, filter: "blur(3px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0 }} transition={reduced ? { duration: 0 } : { duration: motionTokens.duration.fast }}
        onSubmit={event => { event.preventDefault(); void submit(); }}>
        <label htmlFor={`${uid}-amount`} className={styles.fieldLabel}>Tutar</label>
        <div className={styles.money}><i aria-hidden="true">₺</i>
          <input id={`${uid}-amount`} inputMode="decimal" autoComplete="off" autoFocus value={raw} placeholder="0,00" aria-invalid={!!error || undefined} aria-describedby={error ? `${uid}-error` : undefined}
            onChange={event => setRaw(money.formatGroupedInput(event.target.value, { maxDigits: 2 }))} /></div>
        {error && <p id={`${uid}-error`} className={styles.error} role="alert">{error}</p>}
        {spends(action) && <p className={styles.hint}>Kullanılabilir: {balanceText(account.balance)}</p>}
        <Button type="submit" variant="primary" loading={busy} aria-busy={busy}>{submitLabel(action, check?.minor ?? null)}</Button>
      </motion.form>}
    </AnimatePresence>

    <section className={styles.history} aria-label="Son hareketler">
      <div className={styles.historyHead}><h3>Son hareketler</h3>{found.length > 3 && <Button size="sm" variant="ghost" onClick={() => { setAll(!all); onViewAll?.(); }}>{all ? "Daha az" : "Tümünü gör"}</Button>}</div>
      {account.transactions.length > 0 && <SearchField label="Hareketlerde ara" value={query} onValueChange={setQuery} placeholder="Hareketlerde ara" />}
      {account.transactions.length === 0 ? <p className={styles.muted}>Henüz hareket yok</p>
        : found.length === 0 ? <EmptyState title="Sonuç yok" description="Bu aramaya uyan hareket bulunamadı." />
        : <ul className={styles.list}><AnimatePresence initial={false}>{rows.map(item => <motion.li key={item.id} layout={!reduced} className={styles.tx} initial={reduced ? false : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={step}>
          <span className={styles.txIcon} aria-hidden="true">{item.amount < 0 ? "↗" : "↙"}</span>
          <span className={styles.txText}><b>{item.title}</b><span>{transactionMeta(item)}</span></span>
          <span className={styles.txAmount} data-out={item.amount < 0 || undefined}>{hidden ? "••••" : transactionAmountText(item.amount)}</span>
        </motion.li>)}</AnimatePresence></ul>}
    </section>
    {live}
  </motion.section>;
}

export default WalletCard;
