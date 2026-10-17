import { useSyncExternalStore } from "react";
import { useReducedMotion } from "motion/react";
import type { Transition, Variants } from "motion/react";
import { motionTokens } from "../lib/motion-tokens";

export type Bezier = [number, number, number, number];
export const ease = {
  enter: [...motionTokens.ease.enter] as Bezier,
  standard: [...motionTokens.ease.standard] as Bezier,
  inOut: [...motionTokens.ease.inOut] as Bezier,
};

/** Hero'nun oynattığı tek giriş: çocuklar okuma sırasıyla, bir kez yükselir. */
export const heroGroup: Variants = { hidden: {}, shown: { transition: { staggerChildren: motionTokens.stagger.line, delayChildren: .04 } } };
export const heroRise: Variants = {
  hidden: { opacity: 0, y: 12, filter: `blur(${motionTokens.blur.subtle}px)` },
  shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: .64, ease: ease.enter } },
};
export const heroFade: Variants = { hidden: { opacity: 0 }, shown: { opacity: 1, transition: { duration: motionTokens.duration.standard } } };

export const instant: Transition = { duration: 0 };

const noop = () => () => {};
/**
 * Azaltılmış hareket, yalnız hidrasyondan sonra okunur. Sunucu tercihi bilemez; ilk istemci çizimi sunucunun tam hareketli
 * işaretlemesiyle eşleşir, azaltılmış dal bir sonraki çizimde, henüz hiçbir şey kıpırdamadan devreye girer.
 */
export function useHeroReducedMotion() {
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  return !!useReducedMotion() && hydrated;
}
