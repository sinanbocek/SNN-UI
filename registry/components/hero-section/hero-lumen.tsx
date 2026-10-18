"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { MotionConfig, motion, useReducedMotion } from "motion/react";
import { BarChart3, BookOpen, ChevronsUpDown, Gauge, LineChart as LineIcon, Search, Settings, Sparkles, Users } from "lucide-react";
import { money } from "@snn/abacus-core";
import { LineChart } from "../line-chart/line-chart";
import { Sparkline } from "../sparkline/sparkline";
import SegmentedControl from "../segmented-control/segmented-control";
import { Avatar } from "../avatar/avatar";
import { avatarInitials } from "../avatar/avatar-initials";
import { motionTokens } from "../lib/motion-tokens";
import { ActionLink } from "./hero-content";
import type { HeroAction } from "./hero-content";
import { HeroMesh } from "./hero-mesh";
import type { HeroMeshPoint } from "./hero-mesh";
import { heroGroup, heroRise } from "./hero-motion";
import { lumenInsight, lumenKpis, lumenMovers, lumenRanges, lumenSeries } from "./hero-lumen-data";
import type { LumenRange } from "./hero-lumen-data";
import shell from "./hero-section.module.css";
import styles from "./hero-lumen.module.css";

/** Bütün ekranda yumuşak bir ağ: üstte serin tonlar, pencerenin arkasında alçakta bir ton; hepsi sayfadan birkaç basamak ayrı. */
const MESH: HeroMeshPoint[] = [
  { x: .1, y: .92, spread: .7 },
  { x: .92, y: .86, spread: .66 },
  { x: .14, y: .08, spread: .64 },
  { x: .86, y: .04, spread: .6 },
  { x: .5, y: .38, spread: .46 },
];

const NAV = [
  { label: "Genel bakış", icon: Gauge, active: true },
  { label: "Gelir", icon: LineIcon },
  { label: "Müşteriler", icon: Users },
  { label: "Kohortlar", icon: BarChart3 },
  { label: "Tahminler", icon: Sparkles },
  { label: "Raporlar", icon: BookOpen },
];
const VIEWS = [{ label: "Kurumsal genişleme", tone: "accent" }, { label: "Kayıp riski", tone: "danger" }, { label: "Avrupa müşterileri", tone: "neutral" }];

const formatMoney = (value: number) => money.formatMajor(value, { currency: "TRY", digits: 0 });
const compact = (value: number) => money.compactMajor(value, { currency: "TRY", style: "B/Mn/Mr", digits: 1 });

/** Panonun tasarlandığı genişlik, geniş ve dar. O boyutta çizilir ve ekran görüntüsü gibi sığacak kadar ölçeklenir. */
const WIDE = 1200, NARROW = 600;

export interface HeroLumenProps {
  primaryAction?: HeroAction | undefined;
  secondaryAction?: HeroAction | undefined;
  animateIn?: boolean | undefined;
  /** Panonun kenar çubuğundaki kişinin adı. */
  userName?: string | undefined;
  /** Kişinin unvanı. */
  userRole?: string | undefined;
  /** Kişinin fotoğrafı. Verilmezse Avatar baş harflere döner. */
  userAvatarSrc?: string | undefined;
  className?: string | undefined;
}

/**
 * Ortalı hero, tam ekran: akan bir ağın üstünde başlık ve alt kenardan yükselen canlı bir gelir panosu. Pencere eğimden
 * yerine oturarak girer ve ekranın altından solarak taşar. Gerçek işaretlemedir, grafik bileşenlerinden kurulmuştur;
 * aralık denetimi çalışır.
 */
export function HeroLumen({ primaryAction = { label: "Ücretsiz denemeyi başlat", doneLabel: "Deneme başladı" }, secondaryAction = { label: "Demo planla", doneLabel: "Demo istendi" }, animateIn = true, userName = "Elif Yıldız", userRole = "Veri analisti", userAvatarSrc, className }: HeroLumenProps) {
  const calm = !!useReducedMotion();
  const item = heroRise;
  const stage = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ width: WIDE, scale: 1 });

  useLayoutEffect(() => {
    const node = stage.current;
    if (!node) return;
    const measure = () => {
      const css = getComputedStyle(node);
      const width = node.clientWidth - parseFloat(css.paddingLeft) - parseFloat(css.paddingRight);
      const design = width < 720 ? NARROW : WIDE;
      // Telefonda pencere okunur boyutta kalır ve sığmak için küçülmek yerine iki kenardan eşit kırpılır.
      setBox({ width: design, scale: design === NARROW ? Math.max(.6, Math.min(1, width / design)) : Math.min(1, width / design) });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const narrow = box.width === NARROW;
  const height = narrow ? 700 : 760;

  // Azaltılmış hareket: Motion her dönüşümü atlar (yükselme, yakınlaşma, eğim girişi); opaklık yine kısaca solar.
  return <MotionConfig reducedMotion="user"><section className={[shell.hero, shell.screen, styles.hero, className].filter(Boolean).join(" ")}>
    <HeroMesh className={styles.mesh} points={MESH} grain={.18} speed={.55} />
    <motion.div className={styles.copy} variants={heroGroup} initial={animateIn ? "hidden" : false} animate="shown">
      <motion.h1 variants={item} className={[shell.title, styles.title].join(" ")}>Her liranın nasıl hareket ettiğini görün</motion.h1>
      <motion.p variants={item} className={[shell.description, styles.description].join(" ")}>Parıltı ödeme sağlayıcınızı, CRM sisteminizi ve veri ambarınızı bağlar; aylık gelirdeki her değişimi olduğu anda açıklar. SQL yok, eskimiş tablo yok.</motion.p>
      <motion.div variants={item} className={styles.actions}>
        <ActionLink action={primaryAction} kind="primary" />
        <ActionLink action={secondaryAction} kind="secondary" />
      </motion.div>
      <motion.p variants={item} className={styles.fine}>14 gün ücretsiz. Yaklaşık dört dakikada bağlanır.</motion.p>
    </motion.div>

    <motion.div
      ref={stage}
      className={styles.stage}
      initial={animateIn ? { opacity: 0, y: 56 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={calm ? { duration: motionTokens.duration.standard } : { duration: 1.1, ease: [...motionTokens.ease.enter], delay: .32 }}
    >
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.perspective}>
        <motion.div
          className={styles.tilt}
          style={{ width: box.width * box.scale, height: height * box.scale }}
          initial={animateIn ? { rotateX: 22, scale: .94 } : false}
          animate={{ rotateX: 0, scale: 1 }}
          transition={{ duration: 1.5, ease: [...motionTokens.ease.enter], delay: .36 }}
        >
          {/* Ölçek bir CSS dönüşümü değil Motion değeridir; böylece içerideki yerleşim animasyonları (tarih aralığı vurgusu)
              onun içinden yansıtılır ve her ekran genişliğinde seçenekler arasında tam oturarak kayar. */}
          <motion.div className={styles.scaler} style={{ width: box.width, height, scale: box.scale, originX: 0, originY: 0 }}>
            <LumenDashboard narrow={narrow} userName={userName} userRole={userRole} userAvatarSrc={userAvatarSrc} />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  </section></MotionConfig>;
}

/** Parıltı uygulama penceresi. Aralık denetimi dışında her şey içeriktir; denetim bütün ekranın gösterdiği veriyi değiştirir. */
function LumenDashboard({ narrow, userName, userRole, userAvatarSrc }: { narrow: boolean; userName: string; userRole: string; userAvatarSrc?: string | undefined }) {
  const [range, setRange] = useState<LumenRange>("30d");
  const insight = lumenInsight[range];
  return <div className={styles.window} data-narrow={narrow || undefined} role="group" aria-label="Parıltı gelir panosu, örnek veri">
    <div className={styles.chrome} aria-hidden="true">
      <span className={styles.lights}><i /><i /><i /></span>
      <span className={styles.url}>panel.parilti.example/ornek/genel-bakis</span>
    </div>
    <div className={styles.app}>
      {!narrow && <aside className={styles.sidebar}>
        <div className={styles.workspace}>
          <span className={styles.wsMark}>Ö</span>
          <span className={styles.wsName}>Örnek Bulut</span>
          <ChevronsUpDown size={14} strokeWidth={1.75} className={styles.dim} />
        </div>
        <div className={styles.search}><Search size={14} strokeWidth={1.75} />Ara<kbd>⌘K</kbd></div>
        <div className={styles.nav}>
          {NAV.map(({ label, icon: Icon, active }) => <div key={label} className={styles.navItem} data-active={active || undefined}><Icon size={15} strokeWidth={1.75} />{label}</div>)}
        </div>
        <div className={styles.groupLabel}>Kayıtlı görünümler</div>
        <div className={styles.nav}>
          {VIEWS.map(view => <div key={view.label} className={styles.navItem}><i className={styles.dot} data-tone={view.tone} />{view.label}</div>)}
        </div>
        <div className={styles.me}>
          <Avatar name={userName} src={userAvatarSrc} size="sm" />
          <span><strong>{userName}</strong><small>{userRole}</small></span>
          <Settings size={15} strokeWidth={1.75} className={styles.dim} />
        </div>
      </aside>}
      <div className={styles.main}>
        <header className={styles.head}>
          <div>
            <h2 className={styles.h2}>Gelir genel bakışı</h2>
            <p className={styles.sub}>2 dakika önce senkronlandı</p>
          </div>
          <SegmentedControl label="Tarih aralığı" options={lumenRanges} value={range} onValueChange={value => setRange(value as LumenRange)} className={styles.range} />
        </header>

        <div className={styles.kpis}>
          {lumenKpis.map(kpi => {
            const now = kpi.byRange[range];
            return <div key={kpi.id} className={styles.kpi}>
              <Sparkline label={kpi.label} value={now.value} change={now.change} data={now.data} tone={kpi.tone} width={220} height={34} interactive={false} />
            </div>;
          })}
        </div>

        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <p className={styles.insight}><Sparkles size={15} strokeWidth={1.75} className={styles.insightIcon} /><span><strong>{insight.lead}</strong> {insight.rest}</span></p>
              <div className={styles.legend} aria-hidden="true"><span><i className={styles.swatch} />Bu dönem</span><span><i className={styles.swatch} data-last="" />Önceki dönem</span></div>
            </div>
            <LineChart
              label="Net yeni aylık gelir"
              data={lumenSeries[range]}
              series={[{ key: "mrr", label: "Bu dönem", area: true }, { key: "last", label: "Önceki dönem", dashed: true }]}
              height={narrow ? 210 : 232}
              legend={false}
              formatValue={value => formatMoney(value)}
              formatTick={compact}
            />
          </div>
          {!narrow && <div className={styles.card}>
            <div className={styles.cardTitle}>En çok değişenler<span>Aylık gelir farkı</span></div>
            <ul className={styles.movers}>
              {lumenMovers.map(mover => <li key={mover.name}>
                <span className={styles.mark} aria-hidden="true">{avatarInitials(mover.name).charAt(0)}</span>
                <span className={styles.who}><strong>{mover.name}</strong><small>{mover.change}</small></span>
                <span className={styles.amount} data-down={mover.amount < 0 || undefined}>{mover.amount < 0 ? "−" : "+"}{formatMoney(Math.abs(mover.amount))}</span>
              </li>)}
            </ul>
          </div>}
        </div>
      </div>
    </div>
  </div>;
}

export default HeroLumen;
