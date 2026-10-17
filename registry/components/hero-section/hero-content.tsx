"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { MotionConfig, motion } from "motion/react";
import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { Button } from "../button/button";
import { CopyButton } from "../copy-button/copy-button";
import { heroGroup, heroRise } from "./hero-motion";
import shell from "./hero-section.module.css";
import styles from "./hero-content.module.css";

export interface HeroAction {
  label: string;
  href?: string;
  onClick?: () => void;
  /** Yeni sekmede açar ve dışa bakan bir ok gösterir. */
  external?: boolean;
  /** Basıştan sonra bir an etiketin yerinde görünür, örneğin "Deneme başladı". Yalnız düğmelerde. */
  doneLabel?: string;
}

export interface HeroInstallCommand {
  /** Kısa etiket, örneğin npm ya da pnpm. İlk komut gösterilir. */
  label: string;
  command: string;
}

export interface HeroContentProps {
  layout: "centered" | "split" | "minimal";
  announcement?: HeroAction | null;
  title: string;
  description?: string;
  primaryAction?: HeroAction | null;
  secondaryAction?: HeroAction | null;
  install?: HeroInstallCommand[] | null;
  media?: ReactNode;
  meta?: string[];
  animateIn?: boolean;
  className?: string;
}

/** Düğme görünümlü bir bağlantı ya da düğme. Bağlantılar yerel gezinmeyi korur; `doneLabel` taşıyan düğme yerinde onaylar. */
export function ActionLink({ action, kind, className }: { action: HeroAction; kind: "primary" | "secondary"; className?: string }) {
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!done) return;
    const timer = window.setTimeout(() => setDone(false), 2400);
    return () => window.clearTimeout(timer);
  }, [done]);
  const cls = [styles.action, styles[kind], className].filter(Boolean).join(" ");
  const icon = action.external ? <ArrowUpRight size={16} strokeWidth={1.75} aria-hidden="true" /> : kind === "primary" ? <ArrowRight className={styles.arrow} size={16} strokeWidth={1.75} aria-hidden="true" /> : null;
  if (action.href) return <a className={cls} href={action.href} onClick={action.onClick} {...(action.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{action.label}{icon}</a>;
  return <Button variant={kind} size="lg" className={[styles.button, className].filter(Boolean).join(" ")} onClick={() => { action.onClick?.(); if (action.doneLabel) setDone(true); }}>
    {done ? <><Check size={16} strokeWidth={1.75} aria-hidden="true" />{action.doneLabel}</> : <>{action.label}{icon}</>}
  </Button>;
}

/**
 * Kendi içeriğinizle hero: duyuru, başlık, açıklama, çağrılar, isteğe bağlı kurulum satırı ve yazının yanında isteğe bağlı bir
 * görsel. Tasarlanmış üç çeşitten hiçbiri ürüne uymuyorsa kullanın.
 */
export function HeroContent({ layout, announcement, title, description, primaryAction, secondaryAction, install, media, meta, animateIn = true, className }: HeroContentProps) {
  const item = heroRise;
  const command = install?.[0];
  // Azaltılmış hareket: Motion her dönüşümü atlar (yükselme, yakınlaşma, eğim girişi); opaklık yine kısaca solar.
  return <MotionConfig reducedMotion="user"><section className={[shell.hero, styles.hero, styles[layout], className].filter(Boolean).join(" ")}>
    <div className={styles.inner}>
      <motion.div className={styles.copy} variants={heroGroup} initial={animateIn ? "hidden" : false} animate="shown">
        {announcement && <motion.div variants={item}>
          {announcement.href
            ? <a className={styles.announcement} href={announcement.href} onClick={announcement.onClick}>{announcement.label}<ArrowRight className={styles.arrow} size={14} strokeWidth={1.75} aria-hidden="true" /></a>
            : <button type="button" className={styles.announcement} onClick={announcement.onClick}>{announcement.label}<ArrowRight className={styles.arrow} size={14} strokeWidth={1.75} aria-hidden="true" /></button>}
        </motion.div>}
        <motion.h1 variants={item} className={[shell.title, styles.title].join(" ")}>{title}</motion.h1>
        {description && <motion.p variants={item} className={[shell.description, styles.description].join(" ")}>{description}</motion.p>}
        {(primaryAction || secondaryAction) && <motion.div variants={item} className={styles.actions}>
          {primaryAction && <ActionLink action={primaryAction} kind="primary" />}
          {secondaryAction && <ActionLink action={secondaryAction} kind="secondary" />}
        </motion.div>}
        {command && <motion.div variants={item} className={styles.install}>
          <span className={styles.prompt} aria-hidden="true">$</span>
          <code className={styles.command}>{command.command}</code>
          <CopyButton value={command.command} label="Kurulum komutunu kopyala" iconOnly variant="plain" />
        </motion.div>}
        {meta && meta.length > 0 && <motion.ul variants={item} className={styles.meta}>{meta.map(entry => <li key={entry}>{entry}</li>)}</motion.ul>}
      </motion.div>
      {media && <motion.div className={styles.media} variants={item} initial={animateIn ? "hidden" : false} animate="shown">{media}</motion.div>}
    </div>
  </section></MotionConfig>;
}

export default HeroContent;
