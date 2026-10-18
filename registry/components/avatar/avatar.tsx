"use client";

import { useLayoutEffect, useRef, useState, type HTMLAttributes } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { motionTokens } from "../lib/motion-tokens";
import { avatarInitials } from "./avatar-initials";
import styles from "./avatar.module.css";
export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> { name: string; src?: string | undefined; size?: "sm" | "md" | "lg" | "xl" | undefined; status?: "online" | "offline" | undefined }
const statusLabel = { online: "çevrimiçi", offline: "çevrimdışı" } as const;
export function Avatar({ name, src, size = "md", status, className, ...props }: AvatarProps) {
  const initials = avatarInitials(name);
  const reduceMotion = !!useReducedMotion();
  const image = useRef<HTMLImageElement>(null);
  const [failedSrc, setFailedSrc] = useState<string>();
  // Zaten çözülmüş bir fotoğraf hemen görünür. Hâlâ yüklenen bekler, sonra yumuşak bulanıklıktan solarak gelir.
  useLayoutEffect(() => { const node = image.current; if (node && !node.complete) node.dataset.loading = ""; }, [src]);
  const showImage = src && failedSrc !== src;
  return <span {...props} className={[styles.avatar, styles[size], className].filter(Boolean).join(" ")} role="img" aria-label={`${name}${status ? `, ${statusLabel[status]}` : ""}`}>
    {showImage ? <img key={src} ref={image} src={src} alt="" onLoad={event => { delete event.currentTarget.dataset.loading; }} onError={() => setFailedSrc(src)} /> : <span className={src ? styles.fallback : undefined} aria-hidden="true">{initials}</span>}
    <AnimatePresence initial={false}>{status && <motion.i key={status} className={[styles.status, styles[status]].join(" ")} aria-hidden="true" initial={{ opacity: 0, scale: .6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .6, transition: { duration: reduceMotion ? 0 : motionTokens.duration.fast } }} transition={reduceMotion ? { duration: 0 } : motionTokens.spring.snappy} />}</AnimatePresence>
  </span>;
}
