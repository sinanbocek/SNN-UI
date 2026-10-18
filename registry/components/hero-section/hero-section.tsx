"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import SegmentedControl from "../segmented-control/segmented-control";
import { HeroLumen } from "./hero-lumen";
import { HeroRelay } from "./hero-relay";
import { HeroCadence } from "./hero-cadence";
import { HeroMesh } from "./hero-mesh";
import type { HeroMeshPoint } from "./hero-mesh";
import { HeroContent } from "./hero-content";
import type { HeroAction, HeroInstallCommand } from "./hero-content";
import styles from "./hero-section.module.css";

export { HeroCadence, HeroContent, HeroLumen, HeroMesh, HeroRelay };
export type { HeroAction, HeroInstallCommand, HeroMeshPoint };

export type HeroSectionVariant = "centered" | "split" | "minimal";

export interface HeroSectionProps {
  /**
   * `centered`: akan bir ağın üstünde başlık ve alt kenardan yükselen canlı bir pano. `split`: yazının yanında örnek olayları
   * düğüm düğüm çalıştıran canlı bir iş akışı grafiği. `minimal`: ağ geçişli zemin üstünde büyük yazı.
   * Her tasarım tam bir ekranı doldurur.
   */
  variant?: HeroSectionVariant | undefined;
  /** Girişi açılışta bir kez oynatır. Varsayılan: true. */
  animateIn?: boolean | undefined;
  /** Ana çağrı. `doneLabel` varsa ve `href` yoksa düğme yerinde onaylar. */
  primaryAction?: HeroAction | null | undefined;
  /** İkinci çağrı. */
  secondaryAction?: HeroAction | null | undefined;
  /**
   * Kendi başlığınız. Verilirse hero, tasarlanmış örnek yerine sizin içeriğinizi seçilen yerleşimde (bkz. `HeroContent`)
   * aşağıdaki özelliklerle birlikte çizer.
   */
  title?: string | undefined;
  description?: string | undefined;
  announcement?: HeroAction | null | undefined;
  /** Kendi içeriğiniz için kurulum komutları; ilki kopyalama düğmesiyle gösterilir. */
  install?: HeroInstallCommand[] | null | undefined;
  /** Bölünmüş yerleşimde kendi içeriğinizin yanındaki görsel. */
  media?: ReactNode | undefined;
  /** Kendi içeriğinizin altındaki küçük bilgiler, örneğin sürüm ve lisans. */
  meta?: string[] | undefined;
  /** Uyumluluk için durur; vurgulu ifadeler düz metin olarak çizilir. */
  highlight?: string | undefined;
  className?: string | undefined;
}

/**
 * Tam ekran açılış sayfası hero'su, üç tasarımda: akan bir ağın üstünde perspektifli ürün ekran görüntüsü, örnek olayları
 * yönlendiren canlı bir iş akışı grafiği ve ağ geçişli zeminde editoryal yazı.
 */
export function HeroSection({ variant = "centered", animateIn = true, primaryAction, secondaryAction, title, description, announcement, install, media, meta, className }: HeroSectionProps) {
  if (title) return <HeroContent layout={variant} title={title} description={description} announcement={announcement} primaryAction={primaryAction} secondaryAction={secondaryAction} install={install} media={media} meta={meta} animateIn={animateIn} className={className} />;
  const actions = { primaryAction: primaryAction ?? undefined, secondaryAction: secondaryAction ?? undefined };
  if (variant === "split") return <HeroRelay animateIn={animateIn} className={className} {...actions} />;
  if (variant === "minimal") return <HeroCadence animateIn={animateIn} className={className} {...actions} />;
  return <HeroLumen animateIn={animateIn} className={className} {...actions} />;
}

const variantOptions = [
  { value: "centered", label: "Ekran görüntüsü" },
  { value: "split", label: "İş akışı" },
  { value: "minimal", label: "Ağ geçişi" },
];

/**
 * Önizleme: tam ekran hero ve üst kenarında yüzen küçük cam bir anahtar. Anahtar kendi başına yer kaplamaz, böylece her
 * tasarım ekranı tam doldurur. Geçiş, girişi yeniden oynatır.
 */
export function HeroSectionBlock({ variant: initial = "centered" }: { variant?: HeroSectionVariant | undefined }) {
  const [variant, setVariant] = useState<HeroSectionVariant>(initial);
  return <div className={styles.preview}>
    <HeroSection key={variant} variant={variant} />
    <div className={styles.switcher}>
      <SegmentedControl label="Hero tasarımı" options={variantOptions} value={variant} onValueChange={value => setVariant(value as HeroSectionVariant)} className={styles.switch} />
    </div>
  </div>;
}

export default HeroSectionBlock;
