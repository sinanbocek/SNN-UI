// file-dropzone örneği. Yükleme uydurmadır: süre ve sonuç rastgele değil, dosya adına göre sabittir ("hata" geçen ad başarısız olur).
import { FileDropzone } from "../../../registry/components/file-dropzone/file-dropzone";
import type { FileDropzoneItem, FileDropzoneUpload } from "../../../registry/components/file-dropzone/file-dropzone";

const EARLIER: FileDropzoneItem[] = [
  { id: "e1", name: "Keşif özeti 2026-10.pdf", size: 1_572_864, status: "uploaded" },
  { id: "e2", name: "Birim fiyat analizi.xlsx", size: 38_912, status: "failed", error: "Sunucu yanıt vermedi", retryable: true },
];

const fakeUpload: FileDropzoneUpload = (item, { onProgress, signal }) => new Promise((resolve, reject) => {
  let percent = 0;
  const timer = window.setInterval(() => {
    percent += 12;
    onProgress(percent);
    if (percent >= 100) { window.clearInterval(timer); if (item.name.includes("hata")) reject(new Error("Dosya sunucuda reddedildi")); else resolve(); }
  }, 220);
  signal.addEventListener("abort", () => window.clearInterval(timer));
});

export function FileDropzoneDemo() {
  return (
    <div className="col" style={{ maxWidth: 520 }}>
      <span className="etiket">Dosya sürükleyin, seçin ya da yapıştırın. PDF ve Excel kabul edilir, en çok 10 MB ve 5 dosya. Adında "hata" geçen dosya yüklemede başarısız olur; Yeniden dene çıkar.</span>
      <FileDropzone accept=".pdf,.xlsx" maxSize={10 * 1024 * 1024} defaultItems={EARLIER} onUpload={fakeUpload} />
      <span className="etiket">Liste içeride, yükleme yok (yalnız seçim)</span>
      <FileDropzone listPlacement="inside" multiple={false} label="Sözleşmeyi ekle" description="Tek dosya; yenisi eskisinin yerine geçer" />
    </div>
  );
}
