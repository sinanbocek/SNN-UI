// media-player örneği. Parçalar uydurmadır: ses dosyası yoktur, her parça tarayıcıda üretilen kısa bir sinüs tonudur (dosya indirilmez, telif içermez).
import { useMemo, useState } from "react";
import { MediaPlayer } from "../../../registry/components/media-player/media-player";
import type { Track } from "../../../registry/components/media-player/media-player";

/** 8 kHz, 16 bit tek kanallı WAV üretir ve nesne adresi döner. */
function tone(frequency: number, seconds: number): string {
  const rate = 8000, count = Math.floor(rate * seconds);
  const buffer = new ArrayBuffer(44 + count * 2), view = new DataView(buffer);
  const text = (offset: number, value: string) => { for (let at = 0; at < value.length; at++) view.setUint8(offset + at, value.charCodeAt(at)); };
  text(0, "RIFF"); view.setUint32(4, 36 + count * 2, true); text(8, "WAVE"); text(12, "fmt "); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, rate, true); view.setUint32(28, rate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true); text(36, "data"); view.setUint32(40, count * 2, true);
  for (let at = 0; at < count; at++) {
    const envelope = Math.min(1, at / 400, (count - at) / 400);
    view.setInt16(44 + at * 2, Math.round(Math.sin((2 * Math.PI * frequency * at) / rate) * 0.2 * envelope * 32767), true);
  }
  return URL.createObjectURL(new Blob([buffer], { type: "audio/wav" }));
}

const SPECS: [string, string, number, number][] = [["Sabah kahvesi", "Örnek paketi · 1", 262, 12], ["Tren penceresi", "Örnek paketi · 2", 330, 18], ["Gece yürüyüşü", "Örnek paketi · 3", 392, 24], ["Son sayfa", "Örnek paketi · 4", 440, 15]];

export function MediaPlayerDemo() {
  const tracks: Track[] = useMemo(() => SPECS.map(([title, subtitle, frequency, seconds], at) => ({ id: `p${at + 1}`, title, subtitle, src: tone(frequency, seconds), duration: seconds, tone: at })), []);
  const [bad, setBad] = useState(false);
  const [single, setSingle] = useState(false);
  const list = useMemo(() => (bad ? tracks.map((item, at) => at === 1 ? { ...item, src: "yok/olmayan.wav" } : item) : tracks), [bad, tracks]);
  return (
    <div className="col">
      <span className="etiket">Oynat'a basın: kısa tonlar çalar, parça bitince sıradakine geçer, son parçada durur. İlerleme ve ses çubuğu yerel aralık girdisidir (oklarla ayarlanır; değer metni "0:12 / 0:24" ve "%70"). Sessiz düğmesinin etiketi değişir. Listede satıra basınca o parça çalar; işaret satıra kayar. "Açılamayan parça" kutusu 2. parçada hata ve "Tekrar dene" gösterir.</span>
      <div className="row">
        <label><input type="checkbox" checked={bad} onChange={event => setBad(event.target.checked)} /> Açılamayan parça (2.)</label>
        <label><input type="checkbox" checked={single} onChange={event => setSingle(event.target.checked)} /> Tek parça</label>
      </div>
      <MediaPlayer key={`${bad}-${single}`} tracks={single ? list.slice(0, 1) : list} />
    </div>
  );
}
