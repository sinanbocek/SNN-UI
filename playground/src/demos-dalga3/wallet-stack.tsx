// wallet-stack örneği. Kurumlar, ağlar, kart sahipleri, son dört haneler ve hareketler uydurmadır; gerçek kart numarası yok, gerçek marka işareti yok, hiçbir ödeme yapılmaz.
import { useState } from "react";
import { WalletStack } from "../../../registry/components/wallet-stack/wallet-stack";
import type { WalletCard } from "../../../registry/components/wallet-stack/wallet-stack";

const CARDS: WalletCard[] = [
  { id: "k1", issuer: "Örnek Banka", product: "Metal Kart", last4: "0417", holder: "ELİF AKSOY", expiry: "08/29", network: "Kuzey Ağı", material: "metal", balance: 48250.75,
    transactions: [{ id: "a", merchant: "Çarşı Market", detail: "Alışveriş · 14 Ekim", amount: -1240.5 }, { id: "b", merchant: "Mavi Kahve", detail: "Yeme içme", amount: -185 }, { id: "c", merchant: "Hesaptan yükleme", detail: "Havale", amount: 5000 }] },
  { id: "k2", issuer: "Demo Bankası", product: "Siyah Kart", last4: "8830", holder: "ELİF AKSOY", expiry: "03/28", network: "Orta Ağ", material: "black", balance: 12900,
    transactions: [{ id: "d", merchant: "Seyahat Bileti", detail: "Ulaşım", amount: -2300 }, { id: "e", merchant: "Kitap Evi", amount: -420 }] },
  { id: "k3", issuer: "Ornek Finans", product: "Cam Kart", last4: "2951", holder: "ELİF AKSOY", expiry: "11/27", network: "Doğu Ağı", material: "glass", balance: 2310.2, transactions: [] },
  { id: "k4", issuer: "Deneme Üyelik", product: "Üyelik Kartı", last4: "7764", holder: "ELİF AKSOY", expiry: "12/30", network: "Üyelik", material: "flat", balance: 640,
    transactions: [{ id: "f", merchant: "Spor salonu", detail: "Aylık", amount: -640 }, { id: "g", merchant: "İade", amount: 120 }] },
];

export function WalletStackDemo() {
  const [front, setFront] = useState("");
  return (
    <div className="col">
      <span className="etiket">Fareyi destenin üstüne getirin: kartlar yukarı doğru açılır ve öndeki kart imleci hafifçe izler. Aşağı/yukarı sürükleyin ya da oklara basın (Home/End ilk-son). Enter ya da basış kartı açar: bakiye sayarak gelir, üç hareket sırayla belirir; açıkken oklar kartı değiştirir. Aşağı çekin, Esc'ye ya da "Tüm kartlar"a basın. Yalnızca bir görünümdür: tam kart numarası hiçbir yerde yok, yalnız son dört hane. Öne gelen: <b>{front || "—"}</b></span>
      <WalletStack cards={CARDS} onFrontChange={card => setFront(`${card.issuer} ${card.product}`)} />
    </div>
  );
}
