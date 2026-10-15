// scroll-story örneği. Sahne (sahte gelen kutusu), adlar ve sayılar uydurmadır; avatarlar playground/public/ornek-foto içindeki Unsplash portreleridir (KAYNAK.md).
import { motion, useTransform, type MotionValue } from "motion/react";
import { money } from "@snn/abacus-core";
import { Avatar } from "../../../registry/components/avatar/avatar";
import { ScrollStory } from "../../../registry/components/scroll-story/scroll-story";
import type { StageContext } from "../../../registry/components/scroll-story/scroll-story";

const MESSAGES: { who: string; line: string; group: number; face?: string }[] = [
  { who: "Elif Aksoy", face: "/ornek-foto/portre-4.jpg", line: "Fatura tarihi yanlış", group: 0 }, { who: "Barış Yıldız", face: "/ornek-foto/portre-3.jpg", line: "Ödeme sayfası yavaş", group: 1 },
  { who: "Deniz Korkmaz", face: "/ornek-foto/portre-5.jpg", line: "Fatura kopyası lazım", group: 0 }, { who: "Cem Arslan", face: "/ornek-foto/portre-1.jpg", line: "Sayfa açılmıyor", group: 1 },
  { who: "Seda Polat", face: "/ornek-foto/portre-2.jpg", line: "KDV oranı hatalı", group: 0 },
];
const ROW = 36;

function Message({ index, position }: { index: number; position: MotionValue<number> }) {
  const message = MESSAGES[index]!;
  const slot = MESSAGES.filter((item, at) => at < index && item.group === message.group).length;
  const grouped = message.group * 3 * ROW + slot * ROW + message.group * 16;
  const y = useTransform(position, [0, 1], [index * ROW, grouped]);
  const x = useTransform(position, [0, 1], [0, message.group ? 18 : 0]);
  const opacity = useTransform(position, [0, 1.6, 2.1], [1, 1, 0]);
  return (
    <motion.div style={{ y, x, opacity }} className="hikaye-mesaj">
      <Avatar name={message.who} src={message.face} size="sm" /><span><b>{message.who}</b> {message.line}</span>
    </motion.div>
  );
}

function Stage({ position }: StageContext) {
  const draw = useTransform(position, [1.6, 2.4], [0, 1]);
  const lineOpacity = useTransform(position, [1.6, 2, 2.6, 3], [0, 1, 1, .25]);
  const cardOpacity = useTransform(position, [2.4, 3], [0, 1]);
  const cardY = useTransform(position, [2.4, 3], [24, 0]);
  return (
    <div className="hikaye-sahne">
      {MESSAGES.map((_, at) => <Message key={at} index={at} position={position} />)}
      <motion.svg viewBox="0 0 200 80" className="hikaye-cizgi" style={{ opacity: lineOpacity }}>
        <motion.path d="M8 62 C40 58 60 30 92 36 S150 18 192 12" fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" style={{ pathLength: draw }} />
      </motion.svg>
      <motion.div className="hikaye-kart" style={{ opacity: cardOpacity, y: cardY }}>
        <b>Haftalık özet</b>
        <span>{money.fmtDecimalGrouped(1284, 0)} mesaj · fatura konusu {money.percent(12.5, 1, { sign: "always" })}</span>
      </motion.div>
    </div>
  );
}

export function ScrollStoryDemo() {
  return (
    <div className="col">
      <style>{`.hikaye-sahne{position:relative;width:100%;height:100%;padding:var(--space-3);box-sizing:border-box}.hikaye-mesaj{position:absolute;left:var(--space-3);right:var(--space-3);top:var(--space-3);display:flex;align-items:center;gap:var(--space-2);padding:2px var(--space-3) 2px 2px;border:1px solid var(--border-subtle);border-radius:var(--radius-pill);background:var(--surface);box-shadow:var(--shadow-resting);font-size:var(--text-sm);white-space:nowrap;overflow:hidden}.hikaye-mesaj b{font-weight:500}.hikaye-cizgi{position:absolute;left:var(--space-3);right:var(--space-3);bottom:5rem;width:calc(100% - 2 * var(--space-3))}.hikaye-kart{position:absolute;left:var(--space-3);right:var(--space-3);bottom:var(--space-3);display:grid;gap:2px;padding:var(--space-3) var(--space-4);border:1px solid var(--border);border-radius:var(--radius-control);background:var(--surface);box-shadow:var(--shadow-raised);font-size:var(--text-sm)}.hikaye-kart b{font-family:var(--font-display);font-size:var(--text-lg);font-weight:500}`}</style>
      <span className="etiket">Soldaki metni kaydırın: sekmeler dolar, mesajlar önce temaya göre ayrışır, sonra eğilim çizgisine katlanır, en son paylaşım kartı gelir. Sekmeye basın ya da sol/sağ ok kullanın. Son adımdaki düğmeler benzetimdir.</span>
      <ScrollStory label="Hafta özeti nasıl çalışır" renderStage={context => <Stage {...context} />}
        steps={[
          { id: "gelir", title: "Mesajlar gelir", text: "Müşteri mesajları tek gelen kutusunda toplanır.", status: "Gelen kutusunda yeni mesaj var" },
          { id: "ayrisir", title: "Temaya göre ayrışır", text: "Benzer mesajlar kendiliğinden gruplanır.", status: "Mesajlar iki temaya ayrıldı" },
          { id: "katlanir", title: "Eğilim çizgisine katlanır", text: "Her tema haftalık bir eğilime dönüşür.", status: "Eğilim çizgisi çizildi" },
          { id: "paylasim", title: "Paylaşılır", text: "Özeti bir bağlantıyla ekibe gönderin.", status: "Paylaşım kartı hazır" },
        ]}
        actions={{ onCopyLink: async () => { await new Promise(done => setTimeout(done, 300)); }, onSend: async () => { await new Promise(done => setTimeout(done, 500)); } }} />
    </div>
  );
}
