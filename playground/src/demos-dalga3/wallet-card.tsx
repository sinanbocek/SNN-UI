// wallet-card örneği. Hesaplar, kişiler ve tutarlar uydurmadır; hiçbir gerçek para hareketi yoktur. Defter yerel durumdur.
import { useState } from "react";
import { WalletCard } from "../../../registry/components/wallet-card/wallet-card";
import type { BalancePoint, WalletAccount, WalletAction } from "../../../registry/components/wallet-card/wallet-card";

const PERIODS = [{ value: "week", label: "1 hafta" }, { value: "month", label: "1 ay" }, { value: "year", label: "1 yıl" }];

/** Bakiyeden geriye doğru, gün gün uydurma geçmiş üretir (yalnız örnek için). */
function history(balance: number, days: number, step: number, seed: number): BalancePoint[] {
  return Array.from({ length: days }, (_, at) => {
    const back = days - 1 - at;
    return { date: "", value: Math.max(0, balance - back * step + Math.sin((at + seed) * 1.7) * step * 2) };
  });
}

function withDates(points: BalancePoint[], today: string, stepDays: number): BalancePoint[] {
  return points.map((point, at) => ({ ...point, date: shift(today, -(points.length - 1 - at) * stepDays) }));
}
function shift(iso: string, days: number): string {
  const [year, month, day] = iso.split("-").map(Number) as [number, number, number];
  const moved = new Date(Date.UTC(year, month - 1, day + days));
  return `${moved.getUTCFullYear()}-${String(moved.getUTCMonth() + 1).padStart(2, "0")}-${String(moved.getUTCDate()).padStart(2, "0")}`;
}

const TODAY = "2026-10-15";
const build = (id: string, label: string, balance: number, change: number, seed: number): WalletAccount => ({
  id, label, balance, monthChange: change,
  history: { week: withDates(history(balance, 7, 420, seed), TODAY, 1), month: withDates(history(balance, 30, 380, seed), TODAY, 1), year: withDates(history(balance, 12, 4200, seed), TODAY, 30) },
  transactions: [
    { id: `${id}-1`, title: "Tedarikçi ödemesi", date: "2026-10-14", source: "Ahmet Kaya Ltd.", amount: -18450 },
    { id: `${id}-2`, title: "Müşteri tahsilatı", date: "2026-10-13", source: "Demo A.Ş.", amount: 42000 },
    { id: `${id}-3`, title: "Kira", date: "2026-10-10", source: "Ofis", amount: -9500 },
    { id: `${id}-4`, title: "Yatırım", date: "2026-10-05", source: "Kasa", amount: 15000 },
  ],
});

export function WalletCardDemo() {
  const [accounts, setAccounts] = useState<WalletAccount[]>([build("ana", "Ana hesap", 128450.5, 12300, 1), build("yedek", "Yedek hesap", 34200, -1800, 4)]);
  const [empty, setEmpty] = useState(false);
  const [loading, setLoading] = useState(false);
  const list = empty ? accounts.map(account => ({ ...account, transactions: [] })) : accounts;
  const submit = async (order: { account: string; action: WalletAction; amountMinor: number }) => {
    await new Promise(done => setTimeout(done, 600));
    const amount = order.amountMinor / 100;
    const signed = order.action === "deposit" ? amount : order.action === "receive" ? 0 : -amount;
    setAccounts(current => current.map(account => account.id !== order.account ? account : {
      ...account, balance: Math.round((account.balance + signed) * 100) / 100, monthChange: account.monthChange + signed,
      transactions: order.action === "receive" ? account.transactions : [{ id: `y${Date.now()}`, title: order.action === "send" ? "Gönderim" : order.action === "convert" ? "Çevirme" : "Yatırma", date: TODAY, source: "Bu cihaz", amount: signed }, ...account.transactions],
    }));
  };
  return (
    <div className="col">
      <span className="etiket">Hesabı değiştirin, grafikte fareyle gezin (odaktayken ok tuşları noktaları dolaşır), "Gönder"e basıp bakiyeden büyük bir tutar yazın (hata çıkar). Geçerli işlemde bakiye sayarak yeni değere gider ve yeni hareket yerinde açılır. Göz simgesi bakiyeyi gizler.</span>
      <div className="row">
        <label><input type="checkbox" checked={empty} onChange={event => setEmpty(event.target.checked)} /> Geçmiş boş</label>
        <label><input type="checkbox" checked={loading} onChange={event => setLoading(event.target.checked)} /> Yükleniyor</label>
      </div>
      <WalletCard accounts={list} periods={PERIODS} onSubmit={submit} loading={loading} />
    </div>
  );
}
