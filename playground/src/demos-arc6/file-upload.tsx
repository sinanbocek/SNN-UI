// file-upload örneği: sahte yükleme ilerlemesi; "hata" içeren adlı dosya başarısız olur. Sunucu yoktur.
import { FileUpload } from "../../../registry/components/file-upload/file-upload";

/** Sahte yükleme: ilerlemeyi adım adım bildirir, iptal edilirse durur, adında "hata" geçen dosya reddedilir. */
function fakeUpload(file: File, { onProgress, signal }: { onProgress: (percent: number) => void; signal: AbortSignal }) {
  return new Promise<void>((resolve, reject) => {
    let percent = 0;
    const timer = window.setInterval(() => {
      percent += 12;
      onProgress(Math.min(percent, 100));
      if (percent >= 100) { window.clearInterval(timer); file.name.includes("hata") ? reject(new Error("yükleme hatası")) : resolve(); }
    }, 220);
    signal.addEventListener("abort", () => { window.clearInterval(timer); reject(new DOMException("iptal", "AbortError")); });
  });
}

export function FileUploadDemo() {
  return <div className="col">
    <span className="etiket">PDF, Excel ve görsel kabul eder; en çok 5 MB. Adında "hata" geçen dosya başarısız olur, yeniden denenebilir.</span>
    <div style={{ width: "min(100%, 480px)" }}>
      <FileUpload label="Teklif dosyalarını yükle" accept=".pdf,.xlsx,image/*" maxSize={5 * 1024 * 1024} onUpload={fakeUpload} />
    </div>
  </div>;
}
