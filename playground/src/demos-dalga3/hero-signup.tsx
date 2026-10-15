// hero-signup örneği. Adlar ve sayılar uydurmadır; portreler playground/public/ornek-foto içindeki Unsplash fotoğraflarıdır (KAYNAK.md); hiçbir adres kaydedilmez.
import { useState } from "react";
import { HeroSignup } from "../../../registry/components/hero-signup/hero-signup";

const PEOPLE = ["Elif Aksoy", "Barış Yıldız", "Deniz Korkmaz", "Cem Arslan", "Seda Polat"];
const FACES = ["portre-4", "portre-3", "portre-5", "portre-1", "portre-2"].map(name => `/ornek-foto/${name}.jpg`);

export function HeroSignupDemo() {
  const [fail, setFail] = useState(false);
  const [status, setStatus] = useState("idle");
  return (
    <div className="col">
      <span className="etiket">Önce hiçbir şey yazmadan alandan çıkın ya da gönderin: belirli iletiler çıkar ("@ eksik", "alan adı tamamlanmamış"). "ad@gmial.com" yazın: düzeltme önerilir. Geçerli bir adreste düğme dönen halkaya geçer; başarıda sıra rakam rakam döner, odak onaya taşınır, "E-postayı değiştir" forma döner. Kutuyu işaretlerseniz kayıt başarısız olur ("Tekrar dene"). Durum: <b>{status}</b></span>
      <div className="row"><label><input type="checkbox" checked={fail} onChange={event => setFail(event.target.checked)} /> Kayıt başarısız olsun</label></div>
      <HeroSignup headline="Erken erişim listesine katılın" subline="Yeni sürüm hazır olduğunda ilk haberi siz alın." count={1284} people={PEOPLE} peopleImages={FACES} minHeight="32rem" onStatusChange={setStatus}
        onSubmit={async () => { await new Promise(done => setTimeout(done, 900)); if (fail) throw new Error("hata"); return { position: 1285 }; }} />
    </div>
  );
}
