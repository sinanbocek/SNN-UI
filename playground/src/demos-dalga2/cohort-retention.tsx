// cohort-retention örneği. Kayıt sayıları ve elde tutma yüzdeleri uydurmadır; kohort adları ABACUS ile yazılır.
import { useMemo, useState } from "react";
import { date } from "@snn/abacus-core";
import { CohortRetention } from "../../../registry/components/cohort-retention/cohort-retention";
import type { Cohort } from "../../../registry/components/cohort-retention/cohort-retention";

const SEGMENTS = [{ value: "all", label: "Tümü" }, { value: "web", label: "Web" }, { value: "mobil", label: "Mobil" }];

/** 12 kohort (Ekim 2025 – Eylül 2026); yeni kohortlar henüz tüm ayları yaşamadığı için alt üçgen boş kalır. */
function build(segment: string): Cohort[] {
  const base = segment === "web" ? 72 : segment === "mobil" ? 58 : 66;
  const drop = segment === "web" ? .09 : segment === "mobil" ? .15 : .12;
  return Array.from({ length: 12 }, (_, at) => {
    const year = 2025 + Math.floor((9 + at) / 12), month = ((9 + at) % 12) + 1;
    const measured = 12 - at;
    const lift = at * .6;
    return {
      key: `${year}-${String(month).padStart(2, "0")}`,
      size: Math.round((segment === "all" ? 420 : segment === "web" ? 260 : 160) + Math.sin(at * 1.4) * 40 + at * 9),
      retention: Array.from({ length: 12 }, (_, m) => m < measured ? Math.round(Math.max(8, (base + lift) * Math.exp(-drop * m * .55) * (1 - m * .004)) * 10) / 10 : null),
    };
  });
}

export function CohortRetentionDemo() {
  const [segment, setSegment] = useState("all");
  const [status, setStatus] = useState<"ready" | "loading" | "error" | "empty">("ready");
  const cohorts = useMemo(() => status === "empty" ? [] : build(segment), [segment, status]);
  return (
    <div className="col">
      <span className="etiket">Hücreye gelin ya da tabloya odaklanıp ok tuşlarını kullanın (Home/End kohort içinde uca atlar, Esc temizler). Segment değişince renkler hücre hücre yeniden boyanır. "Eğriler" görünümü her kohortu bir çizgi yapar. Alt üçgen henüz ölçülmemiş aylardır.</span>
      <div className="row">
        <label><input type="radio" name="kohort-durum" checked={status === "ready"} onChange={() => setStatus("ready")} /> Veri</label>
        <label><input type="radio" name="kohort-durum" checked={status === "loading"} onChange={() => setStatus("loading")} /> Yükleniyor</label>
        <label><input type="radio" name="kohort-durum" checked={status === "error"} onChange={() => setStatus("error")} /> Hata</label>
        <label><input type="radio" name="kohort-durum" checked={status === "empty"} onChange={() => setStatus("empty")} /> Boş</label>
      </div>
      <CohortRetention cohorts={cohorts} segments={SEGMENTS} segment={segment} onSegmentChange={setSegment} measuredAt={`Ölçüm: ${date.format("2026-10-18", "long")}`} status={status === "empty" ? "ready" : status} onRetry={() => setStatus("ready")} />
    </div>
  );
}
