// otp-input örneği: tek kullanımlık kod girişi. Veriler uydurmadır.
import { useState } from "react";
import { OtpInput } from "../../../registry/components/otp-input/otp-input";

export function OtpInputDemo() {
  const [code, setCode] = useState("");
  const [filled, setFilled] = useState("4829");
  const wrong = code.length === 6 && code !== "482913";
  return <div className="col">
    <span className="etiket">Doğrulama kodu (doğru kod: 482913)</span>
    <OtpInput label="6 haneli doğrulama kodu" description="Kodu yapıştırabilirsiniz; haneler kendiliğinden dağılır." value={code} onChange={setCode} error={wrong ? "Kod eşleşmedi. Yeniden deneyin." : undefined} />
    <span className="etiket">Yarım dolu, 4 haneli</span>
    <OtpInput length={4} label="4 haneli PIN" value={filled} onChange={setFilled} />
    <span className="etiket">Devre dışı</span>
    <OtpInput label="Doğrulama kodu" value="123456" disabled />
  </div>;
}
