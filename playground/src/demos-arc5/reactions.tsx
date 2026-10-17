// reactions örneği: tepki çubuğu. Sayılar Türkçe yazılır (1.234 → "1,2B"). Veriler uydurmadır.
import { Heart, Lightbulb, PartyPopper, Rocket, ThumbsUp } from "lucide-react";
import { Reactions, type ReactionOption } from "../../../registry/components/reactions/reactions";

const OPTIONS: ReactionOption[] = [
  { id: "like", label: "Beğendim", icon: ThumbsUp },
  { id: "love", label: "Bayıldım", icon: Heart },
  { id: "party", label: "Kutlarım", icon: PartyPopper },
  { id: "idea", label: "Güzel fikir", icon: Lightbulb },
  { id: "ship", label: "Hemen yayına", icon: Rocket },
];

export function ReactionsDemo() {
  return <div className="col">
    <span className="etiket">Bir hapa dokununca tepkin eklenir ya da kalkar; bin üstü sayılar kısaltılır.</span>
    <Reactions options={OPTIONS} defaultValue={[
      { id: "like", count: 1234, reacted: false },
      { id: "love", count: 12, reacted: true },
      { id: "party", count: 3, reacted: false },
    ]} />
  </div>;
}
