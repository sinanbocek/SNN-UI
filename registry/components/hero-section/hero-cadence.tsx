"use client";

import { MotionConfig, motion } from "motion/react";
import { Circle, Diamond, Hexagon, Pentagon, Square, Star, Triangle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ActionLink } from "./hero-content";
import type { HeroAction } from "./hero-content";
import { HeroMesh } from "./hero-mesh";
import type { HeroMeshPoint } from "./hero-mesh";
import { heroGroup, heroRise } from "./hero-motion";
import shell from "./hero-section.module.css";
import styles from "./hero-cadence.module.css";

export interface HeroCadenceProps {
  primaryAction?: HeroAction;
  secondaryAction?: HeroAction;
  animateIn?: boolean;
  className?: string;
}

/** Altı nokta, Gradient mesh düzenleyicisinin kaydettiği biçimde yazılmış. Renkler CSS'te durur, her tema için bir palet. */
const MESH: HeroMeshPoint[] = [
  { x: .1, y: .88, spread: .72 },
  { x: .86, y: .12, spread: .66 },
  { x: .16, y: .14, spread: .56 },
  { x: .62, y: .62, spread: .5 },
  { x: .94, y: .92, spread: .48 },
  { x: .44, y: .3, spread: .34 },
];

/** Örnek müşteriler. Şirket adları uydurmadır; işaretler genel şekillerdir ve metin renginde çizilir. */
const BRANDS: { name: string; Icon: LucideIcon }[] = [
  { name: "Kuzey Lojistik", Icon: Hexagon },
  { name: "Marmara Gıda", Icon: Circle },
  { name: "Anadolu Yapı", Icon: Triangle },
  { name: "Ege Tekstil", Icon: Square },
  { name: "Toros Enerji", Icon: Diamond },
  { name: "Karadeniz Tarım", Icon: Pentagon },
  { name: "Trakya Medya", Icon: Star },
];

/** Sade hero, tam ekran: yavaşça akan, greni olan bir ağ geçişi üstünde büyük yazı ve alt kenarda ürünü kullanan ekipler. */
export function HeroCadence({ primaryAction = { label: "Mac için indir", doneLabel: "İndirme başladı" }, secondaryAction = { label: "Web'de dene", doneLabel: "Ritim açılıyor" }, animateIn = true, className }: HeroCadenceProps) {
  const item = heroRise;
  // Azaltılmış hareket: Motion her dönüşümü atlar (yükselme, yakınlaşma, eğim girişi); opaklık yine kısaca solar.
  return <MotionConfig reducedMotion="user"><section className={[shell.hero, shell.screen, styles.hero, className].filter(Boolean).join(" ")}>
    <HeroMesh className={styles.mesh} points={MESH} grain={.55} speed={.45} />
    <motion.div className={styles.inner} variants={heroGroup} initial={animateIn ? "hidden" : false} animate="shown">
      <motion.h1 variants={item} className={[shell.title, styles.title].join(" ")}>Haftanız, pazartesiden önce planlı</motion.h1>
      <div className={styles.row}>
        <motion.p variants={item} className={[shell.description, styles.description].join(" ")}>Ritim görevlerinizi, toplantılarınızı ve odak hedeflerinizi okur, sonra önemli işe zaman ayırır. Planlar değişince her şeyi sizin yerinize taşır.</motion.p>
        <motion.div variants={item} className={styles.cta}>
          <div className={styles.actions}>
            <ActionLink action={primaryAction} kind="primary" />
            <ActionLink action={secondaryAction} kind="secondary" />
          </div>
          <p className={styles.fine}>Kişisel kullanım ücretsiz. Ekipler için kişi başı aylık ₺290&apos;dan.</p>
        </motion.div>
      </div>
      <motion.div variants={item} className={styles.brands}>
        <p>Bu şirketlerin ekipleri Ritim ile planlıyor</p>
        <ul aria-label="Örnek müşteriler">
          {BRANDS.map(({ name, Icon }) => <li key={name}><Icon size={20} strokeWidth={1.75} aria-hidden="true" />{name}</li>)}
        </ul>
      </motion.div>
    </motion.div>
  </section></MotionConfig>;
}

export default HeroCadence;
