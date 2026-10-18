"use client";

import { forwardRef, useId, useLayoutEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, Check } from "lucide-react";
import { Button } from "../button/button";
import SegmentedControl from "../segmented-control/segmented-control";
import { motionTokens } from "../lib/motion-tokens";
import styles from "./site-footer.module.css";

export type SiteFooterVariant = "columns" | "minimal" | "logo";

export interface SiteFooterLink {
  label: string;
  href?: string | undefined;
  /** Yeni sekmede açar ve dışa bakan bir ok gösterir. */
  external?: boolean | undefined;
}

export interface SiteFooterColumn {
  title: string;
  links: SiteFooterLink[];
}

export interface SiteFooterNewsletter {
  title?: string | undefined;
  description?: string | undefined;
  placeholder?: string | undefined;
  /** Geçerli bir adresle çağrılır. Hata göstermek için fırlatın ya da reddedin; abone durumunu göstermek için çözün. */
  onSubscribe?: ((email: string) => void | Promise<void>) | undefined;
}

export interface SiteFooterProps {
  /** `columns` bülteni bağlantı sütunlarıyla eşler, `minimal` tek sakin satırdır, `logo` büyük, solan bir marka işaretiyle biter. */
  variant?: SiteFooterVariant | undefined;
  brand?: { name: string; href?: string | undefined; mark?: ReactNode | undefined } | undefined;
  /** Markanın altında tek kısa satır. */
  tagline?: string | undefined;
  columns?: SiteFooterColumn[] | undefined;
  /** Minimal çeşidin bağlantıları. Varsayılan: her sütunun ilk bağlantısı. */
  links?: SiteFooterLink[] | undefined;
  /** Telif satırının yanındaki küçük bağlantılar, örneğin Gizlilik ve Koşullar. */
  legal?: SiteFooterLink[] | undefined;
  socials?: SiteFooterLink[] | undefined;
  /** Bülten kaydı. Gizlemek için null verin. */
  newsletter?: SiteFooterNewsletter | null | undefined;
  /** Sistem durumu bağlantısı. Gizlemek için null verin. */
  status?: { label: string; tone?: "success" | "warning" | "danger" | undefined; href?: string | undefined } | null | undefined;
  /** Telif satırındaki yıl. */
  year?: number | undefined;
  /** Basılan her bağlantı için çağrılır. `href`'siz bağlantılar düğme olarak çizilir ve yalnız bunu çağırır. */
  onNavigate?: ((link: SiteFooterLink) => void) | undefined;
  className?: string | undefined;
}

type Bezier = [number, number, number, number];
const enter = [...motionTokens.ease.enter] as Bezier;

export const siteFooterExampleColumns: SiteFooterColumn[] = [
  { title: "Ürün", links: [{ label: "Özellikler" }, { label: "Entegrasyonlar" }, { label: "Şablonlar" }, { label: "Fiyatlandırma" }] },
  { title: "Kaynaklar", links: [{ label: "Belgeler" }, { label: "Sürüm notları" }, { label: "Rehberler" }, { label: "Tasarım seti", external: true }] },
  { title: "Şirket", links: [{ label: "Hakkımızda" }, { label: "Müşteriler" }, { label: "Kariyer" }, { label: "İletişim" }] },
  { title: "Destek", links: [{ label: "Yardım merkezi" }, { label: "İletişim" }, { label: "Sistem durumu" }, { label: "KVKK" }] },
];
const exampleLegal: SiteFooterLink[] = [{ label: "Gizlilik" }, { label: "Koşullar" }, { label: "Lisanslar" }];
const exampleSocials: SiteFooterLink[] = [{ label: "X", external: true }, { label: "YouTube", external: true }, { label: "LinkedIn", external: true }];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function FooterLink({ link, onNavigate, className }: { link: SiteFooterLink; onNavigate?: ((link: SiteFooterLink) => void) | undefined; className?: string | undefined }) {
  const content = <>{link.label}{link.external && <ArrowUpRight className={styles.external} size={13} strokeWidth={2} aria-hidden="true" />}</>;
  const onClick = () => onNavigate?.(link);
  if (link.href) return <a className={className ?? styles.link} href={link.href} onClick={onClick} {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{content}</a>;
  return <button type="button" className={className ?? styles.link} onClick={onClick}>{content}</button>;
}

function BrandMark({ className }: { className?: string | undefined }) {
  return <svg className={className} viewBox="0 14 64 38" fill="none" stroke="currentColor" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 48a28 28 0 0 1 56 0" />
    <path d="M14 48a18 18 0 0 1 36 0" />
    <path d="M24 48a8 8 0 0 1 16 0" />
  </svg>;
}

/** Yerinde doğrulayan, düğme biçim değiştirirken genişliğini koruyan ve bildirim çıkarmadan onaylayan e-posta kaydı. */
function Newsletter({ title, description, placeholder = "ad@ornek.com", onSubscribe }: SiteFooterNewsletter) {
  const id = useId();
  const reduced = !!useReducedMotion();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const validate = (value: string) => !value.trim() ? "E-posta adresinizi yazın" : EMAIL.test(value.trim()) ? null : "Bu e-posta adresi doğru görünmüyor";

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (state !== "idle") return;
    setTouched(true);
    const problem = validate(email);
    setError(problem);
    if (problem) return;
    setState("loading");
    try {
      await (onSubscribe ? onSubscribe(email.trim()) : new Promise(resolve => setTimeout(resolve, 900)));
      setState("done");
    } catch {
      setState("idle");
      setError("Kaydınız yapılamadı. Biraz sonra yeniden deneyin");
    }
  }

  const message = state === "done" ? `Onay için ${email.trim()} adresine bakın` : error ?? description;
  const tone = state === "done" ? "success" : error ? "error" : "hint";

  return <form className={styles.newsletter} onSubmit={submit} noValidate aria-labelledby={title ? `${id}-title` : undefined}>
    {title && <h2 id={`${id}-title`} className={styles.newsletterTitle}>{title}</h2>}
    <div className={styles.newsletterRow} data-invalid={error ? "" : undefined} data-done={state === "done" ? "" : undefined}>
      <label className={styles.srOnly} htmlFor={`${id}-email`}>E-posta adresi</label>
      <input
        id={`${id}-email`}
        className={styles.newsletterInput}
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder={placeholder}
        value={email}
        readOnly={state !== "idle"}
        aria-invalid={error ? true : undefined}
        aria-describedby={`${id}-message`}
        onChange={event => { setEmail(event.target.value); if (touched) setError(validate(event.target.value)); }}
        onBlur={() => { if (email) { setTouched(true); setError(validate(email)); } }}
      />
      <Button type="submit" size="sm" variant="primary" loading={state === "loading"} className={styles.newsletterButton} aria-disabled={state === "done" || undefined}>
        {state === "done" ? <><Check size={15} strokeWidth={2.25} aria-hidden="true" />Abone olundu</> : "Abone ol"}
      </Button>
    </div>
    <div className={styles.messageSlot} id={`${id}-message`} aria-live="polite">
      <AnimatePresence initial={false} mode="popLayout">
        {message && <motion.p key={message} className={styles.message} data-tone={tone} role={tone === "error" ? "alert" : undefined}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 4, filter: `blur(${motionTokens.blur.subtle}px)` }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: -4, filter: `blur(${motionTokens.blur.subtle}px)`, transition: { duration: motionTokens.duration.instant } }}
          transition={{ duration: reduced ? 0 : motionTokens.duration.standard, ease: enter }}>{message}</motion.p>}
      </AnimatePresence>
    </div>
  </form>;
}

/**
 * Üç yerleşimli bir site alt bilgisi: bülten kaydıyla bağlantı sütunları, tek sakin satır ve markanın işaretinin iri, alt kenardan
 * kırpılmış ve sayfaya solarak yükseldiği kapanış çeşidi.
 */
export const SiteFooter = forwardRef<HTMLElement, SiteFooterProps>(function SiteFooter({
  variant = "columns",
  brand = { name: "Örnek A.Ş." },
  tagline = "Ekiplerin işini sadeleştiren yazılım.",
  columns = siteFooterExampleColumns,
  links,
  legal = exampleLegal,
  socials = exampleSocials,
  newsletter = { title: "Aylık sürüm notlarını alın", description: "Ayda bir e-posta. İstediğiniz an aboneliği bırakın." },
  status = { label: "Tüm sistemler normal", tone: "success" },
  year = new Date().getFullYear(),
  onNavigate,
  className,
}, ref) {
  const reduced = !!useReducedMotion();
  const gradientId = useId().replace(/:/g, "");
  const brandNode = <FooterLink link={{ label: brand.name, href: brand.href }} onNavigate={onNavigate} className={styles.brand} />;
  const brandWithMark = <span className={styles.brandRow}>{brand.mark ?? <BrandMark className={styles.brandMark} />}{brandNode}</span>;
  const statusNode = status && (status.href
    ? <a className={styles.status} href={status.href} data-tone={status.tone ?? "success"} onClick={() => onNavigate?.({ label: status.label, href: status.href })}><span className={styles.statusDot} aria-hidden="true" />{status.label}</a>
    : <button type="button" className={styles.status} data-tone={status.tone ?? "success"} onClick={() => onNavigate?.({ label: status.label })}><span className={styles.statusDot} aria-hidden="true" />{status.label}</button>);
  const socialNode = socials.length > 0 && <ul className={styles.inline} aria-label="Sosyal medya">{socials.map(link => <li key={link.label}><FooterLink link={link} onNavigate={onNavigate} /></li>)}</ul>;
  const legalRow = <div className={styles.bottom}>
    <div className={styles.bottomStart}>
      <span className={styles.copyright}>© {year} {brand.name}</span>
      {legal.length > 0 && <ul className={styles.inline} aria-label="Yasal">{legal.map(link => <li key={link.label}><FooterLink link={link} onNavigate={onNavigate} /></li>)}</ul>}
    </div>
    <div className={styles.bottomEnd}>{statusNode}{socialNode}</div>
  </div>;
  const columnNav = <nav className={styles.columns} aria-label="Alt bilgi">
    {columns.map(column => <div key={column.title} className={styles.column}>
      <h2>{column.title}</h2>
      <ul>{column.links.map(link => <li key={link.label}><FooterLink link={link} onNavigate={onNavigate} /></li>)}</ul>
    </div>)}
  </nav>;

  if (variant === "minimal") {
    const rowLinks = links ?? columns.map(column => column.links[0]).filter((link): link is SiteFooterLink => Boolean(link)).concat(legal.slice(0, 2));
    return <footer ref={ref} className={[styles.footer, styles.minimal, className].filter(Boolean).join(" ")}>
      <div className={styles.minimalRow}>
        {brandWithMark}
        <nav aria-label="Alt bilgi"><ul className={styles.inline}>{rowLinks.map(link => <li key={link.label}><FooterLink link={link} onNavigate={onNavigate} /></li>)}</ul></nav>
      </div>
      <div className={styles.minimalRow}>
        <span className={styles.copyright}>© {year} {brand.name}. {tagline}</span>
        <div className={styles.bottomEnd}>{statusNode}{socialNode}</div>
      </div>
    </footer>;
  }

  return <footer ref={ref} className={[styles.footer, variant === "logo" ? styles.logo : "", className].filter(Boolean).join(" ")}>
    <div className={styles.top}>
      <div className={styles.intro}>
        {brandWithMark}
        {tagline && <p className={styles.tagline}>{tagline}</p>}
        {newsletter && variant === "columns" && <Newsletter {...newsletter} />}
      </div>
      {columnNav}
    </div>
    {legalRow}
    {variant === "logo" && <motion.div className={styles.markStage} aria-hidden="true"
      initial={reduced ? false : { opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: .3 }}
      transition={{ duration: reduced ? 0 : .9, ease: enter }}>
      {/* İşaretin üst kısmı, iri çizilmiş ve viewBox ile kırpılmış; marka geçişinde ve alt kenara doğru solar. */}
      <svg className={styles.bigMark} viewBox="0 14 64 22" fill="none" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" preserveAspectRatio="xMidYMin meet">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" style={{ stopColor: "var(--accent)" }} />
            <stop offset="1" style={{ stopColor: "color-mix(in oklab, var(--accent) 35%, var(--background))" }} />
          </linearGradient>
        </defs>
        <g stroke={`url(#${gradientId})`}>
          <path d="M4 48a28 28 0 0 1 56 0" />
          <path d="M14 48a18 18 0 0 1 36 0" />
          <path d="M24 48a8 8 0 0 1 16 0" />
        </g>
      </svg>
    </motion.div>}
  </footer>;
});

SiteFooter.displayName = "SiteFooter";

const variantOptions = [{ value: "columns", label: "Sütunlar" }, { value: "minimal", label: "Sade" }, { value: "logo", label: "Logo" }];

/** Önizleme: alt bilgi, üç yerleşimi arasında bir anahtar ve basılan son bağlantının notuyla. */
export function SiteFooterBlock({ variant: initial = "columns" }: { variant?: SiteFooterVariant | undefined }) {
  const [variant, setVariant] = useState<SiteFooterVariant>(initial);
  const [last, setLast] = useState<string | null>(null);
  const reduced = !!useReducedMotion();
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | null>(null);
  // Çerçeve yerleşim yükseklikleri arasında sıçramak yerine yaylanır; yeni yerleşim durduğu yerde solarak belirir.
  useLayoutEffect(() => {
    const node = contentRef.current;
    if (!node) return;
    setHeight(node.offsetHeight);
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => setHeight(node.offsetHeight));
    observer.observe(node);
    return () => observer.disconnect();
  }, [variant]);
  return <div className={styles.preview}>
    <SegmentedControl label="Alt bilgi yerleşimi" options={variantOptions} value={variant} onValueChange={value => setVariant(value as SiteFooterVariant)} />
    <div className={styles.frame}>
      <motion.div className={styles.frameBody} initial={false} animate={{ height: height ?? "auto" }} transition={reduced ? { duration: 0 } : motionTokens.spring.smooth}>
        <motion.div ref={contentRef} key={variant} initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: motionTokens.duration.standard, ease: enter }}>
          <SiteFooter variant={variant} onNavigate={link => setLast(link.label)} />
        </motion.div>
      </motion.div>
    </div>
    <p className={styles.srOnly} aria-live="polite">{last ? `${last} açıldı` : ""}</p>
  </div>;
}

export default SiteFooterBlock;
