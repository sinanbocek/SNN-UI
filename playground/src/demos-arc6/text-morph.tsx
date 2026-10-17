// text-morph örneği: durum sözcüğü birkaç harf değiştirerek bir sonrakine dönüşür.
import { useState } from "react";
import { TextMorph } from "../../../registry/components/text-morph/text-morph";
import { Button } from "../../../registry/components/button/button";

const STEPS = ["Yayınla", "Yayınlanıyor", "Yayınlandı"];
const FOLLOW = ["Takip et", "Takiptesin"];

export function TextMorphDemo() {
  const [step, setStep] = useState(0);
  const [following, setFollowing] = useState(0);
  return <div className="col">
    <span className="etiket">Ortak harfler süzülür, yeni harfler netleşir, genişlik yayla izler.</span>
    <div className="row" style={{ alignItems: "center" }}>
      <Button onClick={() => setStep(value => (value + 1) % STEPS.length)}><TextMorph>{STEPS[step]!}</TextMorph></Button>
      <Button variant="secondary" onClick={() => setFollowing(value => (value + 1) % FOLLOW.length)}><TextMorph>{FOLLOW[following]!}</TextMorph></Button>
    </div>
  </div>;
}
