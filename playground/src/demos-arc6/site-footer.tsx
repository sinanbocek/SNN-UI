// site-footer örneği. Şirket adı ve bağlantılar uydurmadır; bülten kaydı yalnız görünümdür, bir yere gönderilmez.
import { SiteFooter, SiteFooterBlock } from "../../../registry/components/site-footer/site-footer";

export function SiteFooterDemo() {
  return <div className="col">
    <span className="etiket">Anahtarla üç yerleşim arasında geçilir; basılan son bağlantı ekran okuyucuya duyurulur.</span>
    <SiteFooterBlock />
    <span className="etiket">Bültensiz, kendi marka adı ve yılla.</span>
    <SiteFooter variant="columns" brand={{ name: "Örnek A.Ş." }} tagline="Küçük işletmeler için sade muhasebe." newsletter={null} year={2026} />
  </div>;
}
