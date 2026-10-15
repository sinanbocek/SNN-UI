"use client";

import { useId, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { motionTokens } from "../lib/motion-tokens";
import { Avatar } from "../avatar/avatar";
import { EmptyState } from "../empty-state/empty-state";
import { SaveBar } from "../save-bar/save-bar";
import type { SaveBarStatus } from "../save-bar/save-bar";
import { Skeleton } from "../skeleton/skeleton";
import styles from "./settings-page.module.css";

export interface SettingsSection {
  id: string;
  label: string;
  /** Bölüm listesinde adın yanındaki simge. Süstür; ekran okuyucu okumaz. */
  icon?: ReactNode;
  /** Bölüm başlığının altındaki bir cümlelik açıklama. */
  description?: string;
  /** Bu bölümde kaydedilmemiş kaç alan var. Sıfırdan büyükse satırda nokta çıkar; toplam, kaydetme çubuğuna gider. */
  changeCount?: number;
  /** Bölümün alanları. Boş bırakılırsa "boş durum" gösterilir. */
  content?: ReactNode;
}

export interface SettingsUser { name: string; subtitle?: string; src?: string }

export interface SettingsPageProps {
  sections: SettingsSection[];
  /** Seçili bölüm (denetimli kullanım). Verilmezse blok kendisi tutar. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  /** Bölüm listesinin altındaki kullanıcı kartı. */
  user?: SettingsUser;
  /** Kaydetme çubuğu: gerçek kaydetmeyi proje yapar, blok yalnız durumu gösterir. */
  status?: SaveBarStatus;
  onSave: () => void;
  onDiscard: () => void;
  /** Form verisi gelirken true: alanlar yerine iskelet çıkar, kaydetme kapalıdır. */
  loading?: boolean;
  title?: string;
  /** Bölgenin erişilebilir adı. */
  label?: string;
  loadingLabel?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

/** Bildirimler gibi bölümlerde satırları gruplayan başlıklı küme. */
export function SettingsGroup({ title, children }: { title: string; children: ReactNode }) {
  const id = useId();
  return <section className={styles.group} aria-labelledby={id}><h3 id={id} className={styles.groupTitle}>{title}</h3><div className={styles.groupRows}>{children}</div></section>;
}

/** Başlık, açıklama ve sağda bir denetim (çoğunlukla anahtar). */
export function SettingsRow({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return <div className={styles.row}><div className={styles.rowCopy}><span className={styles.rowTitle}>{title}</span>{description && <span className={styles.rowDescription}>{description}</span>}</div><div className={styles.rowControl}>{children}</div></div>;
}

/** Solda bölüm listesi, sağda seçili bölümün formu, altta yüzen kaydetme çubuğu olan ayar çerçevesi.
 *  Bölümler arası geçişte yarım kalan değişiklikler kaybolmaz: bütün bölümler bağlı kalır, yalnız seçili olan görünür. */
export function SettingsPage({
  sections, value, defaultValue, onValueChange, user, status = "idle", onSave, onDiscard, loading = false,
  title = "Ayarlar", label = "Ayarlar", loadingLabel = "Ayarlar yükleniyor",
  emptyTitle = "Bu bölümde ayar yok", emptyDescription = "Burada gösterilecek bir tercih bulunmuyor.", className,
}: SettingsPageProps) {
  const uid = useId();
  const reduced = useReducedMotion();
  const [inner, setInner] = useState(defaultValue ?? sections[0]?.id ?? "");
  const active = value ?? inner;
  const tabs = useRef<Record<string, HTMLButtonElement | null>>({});
  const total = sections.reduce((sum, section) => sum + (section.changeCount ?? 0), 0);

  function select(id: string) {
    if (value === undefined) setInner(id);
    onValueChange?.(id);
  }

  // Ok tuşları bölüm değiştirir; odak tek satırdadır (roving tabindex), Tab formun içine geçer.
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const index = sections.findIndex(section => section.id === active);
    let next = -1;
    if (event.key === "ArrowDown" || event.key === "ArrowRight") next = (index + 1) % sections.length;
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = (index - 1 + sections.length) % sections.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = sections.length - 1;
    const target = next >= 0 ? sections[next] : undefined;
    if (!target) return;
    event.preventDefault();
    select(target.id);
    tabs.current[target.id]?.focus();
  }

  return (
    <section className={[styles.root, className].filter(Boolean).join(" ")} aria-label={label}>
      <aside className={styles.side}>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.list} role="tablist" aria-orientation="vertical" aria-label={`${title} bölümleri`} onKeyDown={onKeyDown}>
          {sections.map(section => {
            const selected = section.id === active;
            const dirty = (section.changeCount ?? 0) > 0;
            return (
              <button
                key={section.id} ref={node => { tabs.current[section.id] = node; }} type="button" role="tab" id={`${uid}-tab-${section.id}`}
                aria-selected={selected} aria-controls={`${uid}-panel-${section.id}`} tabIndex={selected ? 0 : -1}
                className={styles.tab} onClick={() => select(section.id)}
              >
                {selected && <motion.span layoutId={`${uid}-marker`} className={styles.marker} transition={reduced ? { duration: 0 } : motionTokens.spring.smooth} aria-hidden="true" />}
                {section.icon && <span className={styles.icon} aria-hidden="true">{section.icon}</span>}
                <span className={styles.tabLabel}>{section.label}</span>
                {dirty && <><span className={styles.dot} aria-hidden="true" /><span className={styles.srOnly}>kaydedilmemiş değişiklik var</span></>}
              </button>
            );
          })}
        </div>
        {user && (
          <div className={styles.user}>
            <Avatar name={user.name} src={user.src} size="sm" />
            <span className={styles.userCopy}><span className={styles.userName}>{user.name}</span>{user.subtitle && <span className={styles.userSubtitle}>{user.subtitle}</span>}</span>
          </div>
        )}
      </aside>
      <div className={styles.scroller}>
        <div className={styles.form}>
          {sections.map(section => (
            <div
              key={section.id} id={`${uid}-panel-${section.id}`} role="tabpanel" aria-labelledby={`${uid}-tab-${section.id}`}
              hidden={section.id !== active} className={styles.panel} tabIndex={-1}
            >
              <header className={styles.head}>
                <h2 className={styles.sectionTitle}>{section.label}</h2>
                {section.description && <p className={styles.sectionDescription}>{section.description}</p>}
              </header>
              {loading ? <Skeleton label={loadingLabel} lines={4} />
                : section.content ? <div className={styles.fields}>{section.content}</div>
                : <EmptyState title={emptyTitle} description={emptyDescription} />}
            </div>
          ))}
        </div>
        <SaveBar changeCount={loading ? 0 : total} status={status} onSave={onSave} onDiscard={onDiscard} />
      </div>
    </section>
  );
}

export default SettingsPage;
