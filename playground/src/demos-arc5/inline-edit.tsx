// inline-edit örneği. Veriler uydurmadır.
import { useState } from "react";
import { InlineEdit } from "../../../registry/components/inline-edit/inline-edit";

/** Sunucu gecikmesini taklit eder; içinde "hata" geçen değerler reddedilir. */
const fakeSave = (next: string) => new Promise<void>((resolve, reject) => setTimeout(() => (next.includes("hata") ? reject(new Error("kayıt başarısız")) : resolve()), 900));

export function InlineEditDemo() {
  const [name, setName] = useState("Kadıköy Showroom Yenileme");
  const [note, setNote] = useState("Zemin kat vitrin düzeni ve aydınlatma işleri Kasım sonunda teslim edilecek.");
  const [email, setEmail] = useState("ayse.demir@ornek.com");
  return <div className="col">
    <span className="etiket">Başlık: tıkla, yaz, Enter ile kaydet, Escape ile vazgeç. Boş bırakılamaz.</span>
    <InlineEdit as="h3" label="Proje adı" value={name} onSave={async next => { await fakeSave(next); setName(next); }} validate={next => next ? null : "Proje adı boş olamaz."} placeholder="Proje adı yazın" />
    <span className="etiket">Çok satırlı açıklama: Shift+Enter satır sonu ekler.</span>
    <InlineEdit multiline variant="body" label="Açıklama" value={note} onSave={async next => { await fakeSave(next); setNote(next); }} placeholder="Açıklama ekleyin" />
    <span className="etiket">Kayıt hatası: içinde “hata” geçen bir değer reddedilir, son kayıtlı değer geri gelir.</span>
    <InlineEdit label="E-posta" value={email} onSave={async next => { await fakeSave(next); setEmail(next); }} validate={next => /^\S+@\S+\.\S+$/.test(next) ? null : "Geçerli bir e-posta yazın."} />
  </div>;
}
