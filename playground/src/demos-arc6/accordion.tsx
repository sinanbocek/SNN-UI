// accordion örnekleri: tek açık panel, yay hareketiyle yükseklik. Veriler uydurmadır.
import { Accordion } from "../../../registry/components/accordion/accordion";

const faq = [
  { title: "Faturayı nasıl indirebilirim?", content: "Ayarlar sayfasındaki Faturalar bölümünden ilgili ayı seç ve PDF olarak indir." },
  { title: "Planımı ay ortasında değiştirsem ne olur?", content: "Fark, kalan günlerle orantılı hesaplanır ve bir sonraki faturana yansır." },
  { title: "Ekibime kaç kişi ekleyebilirim?", content: "Takım planında 25 kişiye kadar ekleyebilirsin. Daha fazlası için bizimle iletişime geç." },
];

export function AccordionDemo() {
  return <div className="col">
    <span className="etiket">Varsayılan: ilk panel açık</span>
    <Accordion items={faq} />
    <span className="etiket">Büyük boyut: sayfa düzeyinde sık sorulan sorular</span>
    <Accordion items={faq} size="lg" defaultOpen={-1} />
  </div>;
}
