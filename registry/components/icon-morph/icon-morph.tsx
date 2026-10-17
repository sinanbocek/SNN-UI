"use client";

import { useId, useState, useSyncExternalStore } from "react";
import type { ReactNode, SVGProps } from "react";
import { motion, useReducedMotion } from "motion/react";
import type { Transition } from "motion/react";
import { motionTokens } from "../lib/motion-tokens";
import styles from "./icon-morph.module.css";

export type IconMorphName = "menu" | "play" | "plus" | "copy" | "theme" | "chevron" | "bell" | "heart";

export interface IconMorphIconProps extends Omit<SVGProps<SVGSVGElement>, "ref" | "children"> {
  /**
   * Simgenin ikinci durumu. menu: kapat, play: duraklat, plus: tik, copy: tik,
   * theme: ay, chevron: dönmüş, bell: bildirimler açık, heart: beğenilmiş.
   */
  state?: boolean;
  /** Çizim boyutu (px). Varsayılan 24. */
  size?: number;
  /** 24 birimlik ızgarada çizgi kalınlığı. Varsayılan 1,75. */
  strokeWidth?: number;
}

/**
 * İki durum arasında yer değiştirmek yerine biçim değiştiren simge ailesi. Çizgiler döner ve yerine kayar, şekiller
 * ana hatlarını aradeğerler, birkaçının kendine özgü küçük bir anı da var: zil açılınca çalar, kalp beğenilince patlar.
 * Her dönüşüm kesilebilir bir yaya biner; hızlı basınca simge bulunduğu yerden geri döner. Simgeler süs amaçlıdır;
 * erişilebilir adı ve `aria-pressed` değerini taşıyan bir düğmenin içine koy.
 */
export interface IconMorphProps extends IconMorphIconProps {
  name: IconMorphName;
}

const { spring } = motionTokens;
const instant: Transition = { duration: 0 };
const subscribe = () => () => {};
function useReducedFlag() {
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
  return !!useReducedMotion() && hydrated;
}
function useIds() {
  return useId().replace(/[^a-zA-Z0-9-]/g, "");
}
/** `state` bağlandıktan sonra kaç kez true olduğunu sayar; tek seferlik anlar (çalma, patlama) her açılışta yeniden oynar. */
function useTurnOns(state: boolean) {
  const [previous, setPrevious] = useState(state);
  const [count, setCount] = useState(0);
  if (previous !== state) {
    setPrevious(state);
    if (state) setCount(value => value + 1);
  }
  return count;
}

function Frame({ size = 24, strokeWidth = 1.75, className, children, ...rest }: IconMorphIconProps & { children: ReactNode }) {
  return <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={strokeWidth}
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"
    className={[styles.icon, className].filter(Boolean).join(" ")} {...rest}>{children}</svg>;
}

/** Menüden kapatmaya: dış çizgiler X'e dönerken ortaya kayar, ortadaki çizgi katlanıp kaybolur. */
export function MenuIcon({ state = false, ...props }: IconMorphIconProps) {
  const reduced = useReducedFlag();
  const t = reduced ? instant : spring.morph;
  return <Frame {...props}>
    <motion.path d="M4 6h16" initial={false} animate={state ? { y: 6, rotate: 45 } : { y: 0, rotate: 0 }} transition={t} />
    <motion.path d="M4 12h16" initial={false} animate={state ? { opacity: 0, scaleX: .2 } : { opacity: 1, scaleX: 1 }}
      transition={reduced ? instant : { ...spring.snappy, opacity: { duration: motionTokens.duration.fast } }} />
    <motion.path d="M4 18h16" initial={false} animate={state ? { y: -6, rotate: -45 } : { y: 0, rotate: 0 }} transition={t} />
  </Frame>;
}

// Oynat üçgeni ortadan iki dörtgene bölünür; her yarı bir duraklat çubuğuna dönüşür.
const PLAY = ["M7 4.5 L12 7.42 L12 16.58 L7 19.5 Z", "M12 7.42 L19.5 11.8 L19.5 12.2 L12 16.58 Z"];
const PAUSE = ["M6.5 5 L10 5 L10 19 L6.5 19 Z", "M14 5 L17.5 5 L17.5 19 L14 19 Z"];

/** Oynattan duraklatmaya: üçgen iki yarıya ayrılır, yarılar doğrulup çubuk olur. */
export function PlayPauseIcon({ state = false, ...props }: IconMorphIconProps) {
  const reduced = useReducedFlag();
  const t = reduced ? instant : spring.morph;
  return <Frame {...props}>
    {PLAY.map((d, index) => <motion.path key={index} d={d} fill="currentColor" strokeWidth={1.5} initial={false}
      animate={{ d: state ? PAUSE[index] : d }} transition={t} />)}
  </Frame>;
}

/** Artıdan tike: her çubuk uçlarını savurup tikin bir kolu olur. */
export function PlusCheckIcon({ state = false, ...props }: IconMorphIconProps) {
  const reduced = useReducedFlag();
  const t = reduced ? instant : spring.morph;
  return <Frame {...props}>
    <motion.path d="M12 5 L12 19" initial={false} animate={{ d: state ? "M20 6.5 L9.5 17" : "M12 5 L12 19" }} transition={t} />
    <motion.path d="M5 12 L19 12" initial={false} animate={{ d: state ? "M4.5 12 L9.5 17" : "M5 12 L19 12" }} transition={t} />
  </Frame>;
}

/** Kopyadan tike: arkadaki sayfa öndekinin altına girer, öndeki çekilir, tik çizilir. */
export function CopyCheckIcon({ state = false, ...props }: IconMorphIconProps) {
  const reduced = useReducedFlag();
  const t = reduced ? instant : spring.smooth;
  const fade = reduced ? instant : { duration: motionTokens.duration.fast };
  return <Frame {...props}>
    <motion.path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" initial={false}
      animate={state ? { x: 4, y: 4, opacity: 0 } : { x: 0, y: 0, opacity: 1 }} transition={{ ...t, opacity: fade }} />
    <motion.rect x="8" y="8" width="14" height="14" rx="2" initial={false}
      animate={state ? { scale: .7, opacity: 0 } : { scale: 1, opacity: 1 }} transition={{ ...t, opacity: fade }} />
    <motion.path d="M5 12.5 L9.5 17 L19 7.5" initial={false}
      animate={state ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
      transition={reduced ? instant : { ...spring.smooth, delay: state ? .06 : 0, opacity: { duration: .08, delay: state ? .06 : 0 } }} />
  </Frame>;
}

const RAYS = Array.from({ length: 8 }, (_, index) => {
  const angle = index * Math.PI / 4, c = Math.cos(angle), s = Math.sin(angle);
  const r = (value: number) => Math.round(value * 100) / 100;
  return `M${r(12 + c * 7.5)} ${r(12 + s * 7.5)} L${r(12 + c * 10)} ${r(12 + s * 10)}`;
});

/**
 * Güneşten aya: disk büyürken köşeden bir gölge üstünden kayıp hilali oyar, ışınlar dönüp içeri katlanır.
 * Hilal ana hat olarak çizilir: diskin gölge dışındaki kenarı ve gölgenin disk içindeki kenarı.
 */
export function SunMoonIcon({ state = false, ...props }: IconMorphIconProps) {
  const reduced = useReducedFlag();
  const id = useIds();
  const t = reduced ? instant : spring.morph;
  const disc = { r: state ? 8.5 : 4.5 };
  const shadow = state ? { cx: 18, cy: 6, r: 6.5 } : { cx: 30, cy: -6, r: 6.5 };
  return <Frame {...props}>
    <defs>
      <mask id={`${id}-bite`} maskUnits="userSpaceOnUse" x="-8" y="-8" width="40" height="40">
        <rect x="-8" y="-8" width="40" height="40" fill="white" stroke="none" />
        <motion.circle cx={30} cy={-6} r={6.5} fill="black" stroke="none" initial={false} animate={shadow} transition={t} />
      </mask>
      <clipPath id={`${id}-disc`}>
        <motion.circle cx={12} cy={12} r={4.5} initial={false} animate={disc} transition={t} />
      </clipPath>
    </defs>
    <motion.circle cx={12} cy={12} r={4.5} mask={`url(#${id}-bite)`} initial={false} animate={disc} transition={t} />
    <motion.circle cx={30} cy={-6} r={6.5} clipPath={`url(#${id}-disc)`} initial={false} animate={shadow} transition={t} />
    <motion.g initial={false} animate={state ? { rotate: 90, scale: .4, opacity: 0 } : { rotate: 0, scale: 1, opacity: 1 }}
      transition={reduced ? instant : { ...spring.morph, opacity: { duration: motionTokens.duration.fast } }}>
      {RAYS.map(d => <path key={d} d={d} />)}
    </motion.g>
  </Frame>;
}

export interface ChevronIconProps extends IconMorphIconProps {
  /** `state` true iken ayracın döndüğü derece. 180 aşağıyı yukarı çevirir; 90 sağı aşağı çevirir. */
  turn?: number;
  /** Ayracın dinlenirken gösterdiği yön. */
  pointing?: "down" | "right";
}

/** Yayla dönen ayraç; açılır bölüm ve sıralama denetimleri için. */
export function ChevronIcon({ state = false, turn = 180, pointing = "down", ...props }: ChevronIconProps) {
  const reduced = useReducedFlag();
  return <Frame {...props}>
    <motion.path d={pointing === "down" ? "M6 9 L12 15 L18 9" : "M9 6 L15 12 L9 18"} initial={false}
      animate={{ rotate: state ? turn : 0 }} style={{ transformOrigin: "50% 50%" }} transition={reduced ? instant : spring.morph} />
  </Frame>;
}

const BELL = "M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9";
const CLAPPER = "M10.3 21a1.94 1.94 0 0 0 3.4 0";

/** Bildirim açık/kapalı: açılınca zil tepesinden çalar, dili geriden gelir; kapanınca üstü çizilir. */
export function BellIcon({ state = false, ...props }: IconMorphIconProps) {
  const reduced = useReducedFlag();
  const id = useIds();
  const rings = useTurnOns(state);
  const ring = rings > 0 && !reduced;
  const slash = reduced ? instant : { ...spring.smooth, opacity: { duration: .08 } };
  const slashOn = { pathLength: state ? 0 : 1, opacity: state ? 0 : 1 };
  return <Frame {...props}>
    <defs>
      <mask id={`${id}-cut`} maskUnits="userSpaceOnUse" x="-4" y="-4" width="32" height="32">
        <rect x="-4" y="-4" width="32" height="32" fill="white" stroke="none" />
        <motion.path d="M3 3 L21 21" stroke="black" strokeWidth={5} initial={false} animate={slashOn} transition={slash} />
      </mask>
    </defs>
    <g mask={`url(#${id}-cut)`}>
      <motion.g key={`bell-${rings}`} style={{ transformOrigin: "50% 0%" }}
        animate={ring ? { rotate: [0, 16, -13, 9, -6, 3, 0] } : { rotate: 0 }} transition={{ duration: .9, ease: "easeOut" }}>
        <path d={BELL} />
      </motion.g>
      <motion.path key={`clapper-${rings}`} d={CLAPPER}
        animate={ring ? { x: [0, -2.2, 2, -1.4, .9, -.4, 0] } : { x: 0 }} transition={{ duration: .9, ease: "easeOut", delay: .04 }} />
    </g>
    <motion.path d="M3 3 L21 21" initial={false} animate={slashOn} transition={slash} />
  </Frame>;
}

const HEART = "M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z";
const SPARKS = Array.from({ length: 7 }, (_, index) => {
  const angle = -Math.PI / 2 + index * 2 * Math.PI / 7;
  return { x: Math.cos(angle), y: Math.sin(angle), r: index % 2 ? 1 : 1.4 };
});

/** Beğeni: kalp pat diye dolar, bir halka ve birkaç kıvılcım bir kez patlar. Beğeniyi geri alınca kalp yalnızca boşalır. */
export function HeartIcon({ state = false, className, ...props }: IconMorphIconProps) {
  const reduced = useReducedFlag();
  const likes = useTurnOns(state);
  const burst = likes > 0 && state && !reduced;
  return <Frame {...props} className={[styles.heart, className].filter(Boolean).join(" ")} data-on={state ? "" : undefined} overflow="visible">
    {burst && <g key={`burst-${likes}`} stroke="none">
      <motion.circle cx={12} cy={12} fill="none" stroke="currentColor" initial={{ r: 4, strokeWidth: 3, opacity: .5 }}
        animate={{ r: 13, strokeWidth: 0, opacity: 0 }} transition={{ duration: .5, ease: [...motionTokens.ease.enter] }} />
      {SPARKS.map((spark, index) => <motion.circle key={index} cx={12} cy={12} r={spark.r} fill="currentColor"
        initial={{ x: spark.x * 7, y: spark.y * 7, opacity: 1, scale: 1 }}
        animate={{ x: spark.x * 14, y: spark.y * 14, opacity: 0, scale: .3 }}
        transition={{ duration: .55, delay: .05, ease: [...motionTokens.ease.enter] }} />)}
    </g>}
    <motion.g key={`heart-${likes}`} style={{ transformOrigin: "50% 50%" }}
      animate={burst ? { scale: [.72, 1.14, 1] } : { scale: 1 }} transition={{ duration: .45, ease: [...motionTokens.ease.enter] }}>
      <motion.path d={HEART} initial={{ fillOpacity: state && !burst ? 1 : 0 }} animate={{ fillOpacity: state ? 1 : 0 }} fill="currentColor"
        transition={reduced ? instant : { duration: motionTokens.duration.fast }} />
    </motion.g>
  </Frame>;
}

const ICONS: Record<IconMorphName, (props: IconMorphIconProps) => ReactNode> = {
  menu: MenuIcon,
  play: PlayPauseIcon,
  plus: PlusCheckIcon,
  copy: CopyCheckIcon,
  theme: SunMoonIcon,
  chevron: ChevronIcon,
  bell: BellIcon,
  heart: HeartIcon,
};

/** Dönüşen her simge için tek giriş: `name` ile seç, `state` ile sür. */
export function IconMorph({ name, ...props }: IconMorphProps) {
  const Icon = ICONS[name];
  return <Icon {...props} />;
}

export default IconMorph;
