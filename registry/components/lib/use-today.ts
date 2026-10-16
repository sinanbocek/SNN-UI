import { useMemo, useSyncExternalStore } from "react";

/** calendar ve date-picker paylaşır; tek kopya, ikisinin "bugün"ünü aynı tutar. */
const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const fromKey = (key: string) => {
  const [year = 1970, month = 1, day = 1] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
};

/** Bugün yerel gece yarısında değişir; sekmeye dönmek, pencereye odaklanmak ya da cihazı uyandırmak onu yeniden okur. */
const subscribeToday = (notify: () => void) => {
  let timer = 0;
  const schedule = () => {
    const now = new Date();
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    timer = window.setTimeout(() => { notify(); schedule(); }, nextMidnight.getTime() - now.getTime() + 1000);
  };
  const onVisible = () => { if (document.visibilityState === "visible") notify(); };
  schedule();
  document.addEventListener("visibilitychange", onVisible);
  window.addEventListener("focus", notify);
  return () => { window.clearTimeout(timer); document.removeEventListener("visibilitychange", onVisible); window.removeEventListener("focus", notify); };
};
const readToday = () => dateKey(new Date());
const serverToday = () => "";

/** Bakanın yerel tarihi. Sunucuda ve hidrasyon sırasında tanımsızdır; çıktı sunucunun saatine ya da saat dilimine bağlı kalmaz. Sonra gece yarısını geçerek gerçek tarihi izler. */
export function useToday() {
  const key = useSyncExternalStore(subscribeToday, readToday, serverToday);
  return useMemo(() => (key ? fromKey(key) : undefined), [key]);
}
