// hero-section örneği. Şirket ve kişi adları uydurmadır.
import { HeroContent, HeroLumen, HeroSectionBlock } from "../../../registry/components/hero-section/hero-section";

export function HeroSectionDemo() {
  return <div className="col">
    <span className="etiket">Üst kenardaki anahtarla üç tasarım arasında geçilir; her tasarım tam bir ekranı doldurur.</span>
    <HeroSectionBlock variant="split" />
    <span className="etiket">Kenar çubuğundaki kişinin fotoğrafı özelliktir; verilmezse baş harfler görünür.</span>
    <HeroLumen userName="Elif Yıldız" userRole="Veri analisti" userAvatarSrc="/ornek-foto/portre-4.jpg" animateIn={false} />
    <span className="etiket">Kendi içeriğiniz için HeroContent: duyuru, başlık, çağrılar ve kurulum satırı.</span>
    <HeroContent
      layout="minimal"
      announcement={{ label: "Yeni: toplu fatura gönderimi", href: "#" }}
      title="Faturalarınızı bir kez yazın, gerisini bize bırakın"
      description="Örnek Fatura müşterilerinize teklif, fatura ve hatırlatmayı kendiliğinden gönderir; ödemeleri sizin yerinize takip eder."
      primaryAction={{ label: "Ücretsiz başla", doneLabel: "Hesap hazırlanıyor" }}
      secondaryAction={{ label: "Fiyatları gör", href: "#" }}
      install={[{ label: "npm", command: "npm install ornek-fatura" }]}
      meta={["Sürüm 2.4", "MIT lisansı"]}
    />
  </div>;
}
