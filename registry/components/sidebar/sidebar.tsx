"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Transition } from "motion/react";
import { ChevronDown, Menu, PanelLeft, Pin, PinOff } from "lucide-react";
import { text } from "@snn/abacus-core";
import { motionTokens } from "../lib/motion-tokens";
import { Avatar } from "../avatar/avatar";
import { Badge } from "../badge/badge";
import { Breadcrumb } from "../breadcrumb/breadcrumb";
import { Button } from "../button/button";
import { Drawer, DrawerContent } from "../drawer/drawer";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "../popover/popover";
import { Skeleton } from "../skeleton/skeleton";
import { Tooltip } from "../tooltip/tooltip";
import styles from "./sidebar.module.css";

export interface SidebarItem {
  id: string;
  label: string;
  /** Satırın solundaki simge. Süstür; şeritte (daralmış menü) tek görünen şey budur, adı ipucunda çıkar. */
  icon?: ReactNode | undefined;
  /** Okunmamış gibi bir sayı. Ekran okuyucu "{n} okunmamış" okur. */
  badge?: number | undefined;
  /** Verilirse satır düz bağlantı (`<a>`) olarak çizilir; verilmezse düğme. Her iki durumda `onNavigate` çağrılır. */
  href?: string | undefined;
  /** Alt satırlar: satır katlanır gruba döner. Boş dizi verilirse grup hiç gösterilmez. */
  children?: SidebarItem[] | undefined;
  /** Pasif satır: görünür ve odaklanır ama gitmez; ekran okuyucu "kullanılamaz" okur. */
  disabled?: boolean | undefined;
  /** Satırın sağındaki kısa not, ör. "Yakında". Şeritte ipucuna eklenir. */
  note?: string | undefined;
}

export interface SidebarSection { id: string; title?: string | undefined; items: SidebarItem[] }

export interface SidebarMenuAction { id: string; label: string; onSelect: () => void }

export interface SidebarUser { name: string; subtitle?: string | undefined; src?: string | undefined; /** Kart açılınca listelenen eylemler (profil, çıkış yap gibi). */ menu?: SidebarMenuAction[] | undefined }

export interface SidebarProps {
  header: { name: string; subtitle?: string | undefined; logo?: ReactNode | undefined };
  sections: SidebarSection[];
  /** Etkin sayfanın `id`'si. Bulunamazsa hiçbir satır vurgulanmaz, yol izi yalnız ana bölümü gösterir. */
  activeId?: string | undefined;
  onNavigate: (id: string) => void;
  /** Alt alandaki Ayarlar satırı. */
  settingsItem?: SidebarItem | undefined;
  user?: SidebarUser | undefined;
  collapsed?: boolean | undefined;
  defaultCollapsed?: boolean | undefined;
  /** Katlama tercihini uygulama saklar; blok yalnız haber verir. */
  onCollapsedChange?: ((collapsed: boolean) => void) | undefined;
  /** Menü verisi geliyorsa true: satırlar yerine iskelet çıkar. */
  loading?: boolean | undefined;
  /** Menü verisi alınamadıysa true: kısa mesaj ve "Yeniden dene" çıkar; `sections` içinde gömülü yedek menü verilebilir. */
  error?: boolean | undefined;
  onRetry?: (() => void) | undefined;
  /** Bu genişliğin (px) altında menü çekmeceye dönüşür. Ölçü pencereye değil bloğun kendi genişliğine bakar. */
  breakpoint?: number | undefined;
  /** Şeritteyken üzerine gelince ya da klavye odağı girince menü içeriğin üstüne geçici genişler; raptiye düğmesi açık bırakır
   * (`onCollapsedChange(false)`), raptiyeyi kaldırmak yeniden şeride döndürür. */
  hoverExpand?: boolean | undefined;
  /** Sayfa içeriği; kendi içinde kayar, çerçeve sabit kalır. */
  children?: ReactNode | undefined;
  className?: string | undefined;
}

interface Found { item: SidebarItem; trail: SidebarItem[]; section: SidebarSection }

function findItem(sections: SidebarSection[], id: string | undefined): Found | null {
  if (!id) return null;
  for (const section of sections) {
    const walk = (items: SidebarItem[], trail: SidebarItem[]): Found | null => {
      for (const item of items) {
        if (item.id === id) return { item, trail, section };
        const inner = item.children ? walk(item.children, [...trail, item]) : null;
        if (inner) return inner;
      }
      return null;
    };
    const hit = walk(section.items, []);
    if (hit) return hit;
  }
  return null;
}

/** Çocuğu olmayan boş grup (`children: []`) gösterilmez. */
const visible = (items: SidebarItem[]) => items.filter(item => !(item.children && item.children.length === 0));
const badgeText = (count: number) => `${count} okunmamış`;

/** Solda daralabilen menü, üstte yol izi, ortada kayan içerik olan uygulama çerçevesi. Dar kolonda menü çekmeceye dönüşür. */
export function Sidebar({
  header, sections, activeId, onNavigate, settingsItem, user, collapsed: collapsedProp, defaultCollapsed = false, onCollapsedChange,
  loading = false, error = false, onRetry, breakpoint = 720, hoverExpand = false, children, className,
}: SidebarProps) {
  const uid = useId();
  const reduced = useReducedMotion();
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const [narrow, setNarrow] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsedState, setCollapsedState] = useState(defaultCollapsed);
  const collapsed = collapsedProp ?? collapsedState;
  /** Şerit üzerine gelince ya da odakla geçici açık. */
  const [peek, setPeek] = useState(false);
  const peekTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(peekTimer.current), []);
  useEffect(() => { if (!collapsed || !hoverExpand) setPeek(false); }, [collapsed, hoverExpand]);
  // Kısa bekleme: imleç şeridin üstünden geçip giderken menü açılıp kapanmaz.
  const schedulePeek = (next: boolean) => {
    window.clearTimeout(peekTimer.current);
    if (!hoverExpand || !collapsed) return;
    peekTimer.current = window.setTimeout(() => setPeek(next), next ? 120 : 200);
  };
  const found: Found | null = findItem(sections, activeId) ?? (settingsItem && activeId && settingsItem.id === activeId ? { item: settingsItem, trail: [], section: { id: "", items: [] } } : null);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const trail of findItem(sections, activeId)?.trail ?? []) initial[trail.id] = true;
    return initial;
  });
  const [note, setNote] = useState("");
  const firstRun = useRef(true);

  // Bloğun kendi genişliğini izler: çekmece kararı pencereye değil, bulunduğu kolona göre verilir.
  useEffect(() => {
    if (!root) return;
    const observer = new ResizeObserver(([entry]) => { if (entry) setNarrow(entry.contentRect.width < breakpoint); });
    observer.observe(root);
    return () => observer.disconnect();
  }, [root, breakpoint]);
  // İlk çizimde ve her yeniden çizimde de ölçülür: gözlemci gelene kadar menü yanlış kipte yanıp sönmez.
  useLayoutEffect(() => { if (root) setNarrow(root.clientWidth < breakpoint); });
  useEffect(() => { if (!narrow) setDrawerOpen(false); }, [narrow]);

  // Sayfa değişince ekran okuyucuya haber verilir (ilk çizimde değil).
  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return; }
    if (found) setNote(`${found.item.label} bölümü açıldı`);
  }, [activeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const setCollapsed = useCallback((next: boolean) => {
    if (collapsedProp === undefined) setCollapsedState(next);
    onCollapsedChange?.(next);
  }, [collapsedProp, onCollapsedChange]);

  // Ctrl+B menüyü katlar/açar; yazı alanında, menüde ya da pencerede odak varsa çalışmaz.
  const latest = useRef({ collapsed, narrow, setCollapsed });
  latest.current = { collapsed, narrow, setCollapsed };
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code !== "KeyB" || !(event.ctrlKey || event.metaKey) || event.altKey || event.shiftKey || latest.current.narrow) return;
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest("input, textarea, select, [contenteditable='true'], [role='dialog'], [role='menu'], [role='listbox']")) return;
      event.preventDefault();
      latest.current.setCollapsed(!latest.current.collapsed);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toggleGroup = (id: string) => setOpenGroups(current => ({ ...current, [id]: !current[id] }));

  function go(item: SidebarItem) {
    if (item.disabled) return;
    onNavigate(item.id);
    setDrawerOpen(false);
  }

  // Yukarı/aşağı ok satırlar arasında gezer; sağ ok grubu açar, sol ok kapatır. Tab ile de sırayla gezilir.
  function onNavKeyDown(event: ReactKeyboardEvent<HTMLElement>) {
    const target = event.target instanceof HTMLElement ? event.target : null;
    if (!target) return;
    if ((event.key === "ArrowRight" || event.key === "ArrowLeft") && target.dataset.groupId) {
      const open = target.getAttribute("aria-expanded") === "true";
      if ((event.key === "ArrowRight") !== open) { event.preventDefault(); toggleGroup(target.dataset.groupId); }
      return;
    }
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    const all = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("[data-nav-item]")).filter(node => node.offsetParent !== null);
    const index = all.indexOf(target);
    if (index < 0) return;
    event.preventDefault();
    all[(index + (event.key === "ArrowDown" ? 1 : -1) + all.length) % all.length]?.focus();
  }

  const grow: Transition = reduced ? { duration: 0 } : motionTokens.spring.smooth;

  function renderRow(item: SidebarItem, rail: boolean): ReactNode {
    const active = item.id === activeId;
    const hasChildren = !!item.children && item.children.length > 0;
    const open = !!openGroups[item.id];
    const contains = hasChildren && !!findItem([{ id: "", items: item.children! }], activeId);
    const content = (
      <>
        {item.icon ? <span className={styles.icon} aria-hidden="true">{item.icon}</span> : <span className={styles.icon} aria-hidden="true" />}
        <span className={styles.label}>{item.label}</span>
        {typeof item.badge === "number" && item.badge > 0 && !rail && <><Badge size="sm" tone="info" aria-hidden="true">{String(item.badge)}</Badge><span className={styles.srOnly}>{badgeText(item.badge)}</span></>}
        {item.note && !rail && <span className={styles.note}>{item.note}</span>}
        {hasChildren && !rail && <ChevronDown className={styles.chevron} data-open={open ? "true" : undefined} size={16} aria-hidden="true" />}
      </>
    );
    const tip = typeof item.badge === "number" && item.badge > 0 ? `${item.label} (${badgeText(item.badge)})` : item.note ? `${item.label} (${item.note})` : item.label;
    const off = item.disabled || undefined;

    if (hasChildren && rail) {
      // Şeritteyken grup simgesi menüyü açmaz; alt sayfalar küçük bir açılır kutuda listelenir.
      return (
        <li key={item.id}>
          <Popover>
            <Tooltip content={item.label} side="right">
              <PopoverTrigger asChild>
                <button type="button" className={styles.row} data-nav-item data-active={contains ? "true" : undefined} aria-label={item.label}>{content}</button>
              </PopoverTrigger>
            </Tooltip>
            <PopoverContent side="right" align="start" className={styles.flyout}>
              <span className={styles.flyoutTitle}>{item.label}</span>
              {item.children!.map(child => (
                <PopoverClose asChild key={child.id}>
                  <button type="button" className={styles.flyoutRow} aria-current={child.id === activeId ? "page" : undefined} onClick={() => go(child)}>{child.label}</button>
                </PopoverClose>
              ))}
            </PopoverContent>
          </Popover>
        </li>
      );
    }

    if (hasChildren) {
      return (
        <li key={item.id}>
          <button type="button" className={styles.row} data-nav-item data-group-id={item.id} data-active={contains && !open ? "true" : undefined} aria-expanded={open} aria-controls={`${uid}-${item.id}`} onClick={() => toggleGroup(item.id)}>{content}</button>
          <AnimatePresence initial={false}>
            {open && (
              <motion.ul
                key="children" id={`${uid}-${item.id}`} className={styles.children}
                initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={grow}
              >
                {visible(item.children!).map(child => renderRow(child, false))}
              </motion.ul>
            )}
          </AnimatePresence>
        </li>
      );
    }

    // Pasif satır bağlantı olmaz; aria-disabled odaklanabilir bırakır, böylece "Yakında" klavyeyle de okunur.
    const row = item.href && !off
      ? <a href={item.href} className={styles.row} data-nav-item data-active={active ? "true" : undefined} aria-current={active ? "page" : undefined} aria-label={rail ? tip : undefined} onClick={() => go(item)}>{content}</a>
      : <button type="button" className={styles.row} data-nav-item data-active={active && !off ? "true" : undefined} data-disabled={off} aria-disabled={off} aria-current={active && !off ? "page" : undefined} aria-label={rail ? tip : undefined} onClick={() => go(item)}>{content}</button>;
    return <li key={item.id}>{rail ? <Tooltip content={tip} side="right">{row}</Tooltip> : row}</li>;
  }

  function userTrigger(user: SidebarUser) {
    return (
      <PopoverTrigger asChild>
        <button type="button" className={styles.user} aria-label={`${user.name}, hesap menüsü`} disabled={!user.menu?.length}>
          <Avatar name={user.name} src={user.src} size="sm" />
          <span className={styles.userCopy}><span className={styles.userName}>{user.name}</span>{user.subtitle && <span className={styles.userSub}>{user.subtitle}</span>}</span>
        </button>
      </PopoverTrigger>
    );
  }

  function renderNav(rail: boolean) {
    return (
      <div className={styles.panel} data-rail={rail ? "true" : undefined}>
        <div className={styles.brand}>
          <span className={styles.logo} aria-hidden="true">{header.logo ?? text.upper(header.name.trim().charAt(0))}</span>
          <span className={styles.brandCopy}><span className={styles.brandName}>{header.name}</span>{header.subtitle && <span className={styles.brandSub}>{header.subtitle}</span>}</span>
          {hoverExpand && !rail && !narrow && (
            <Tooltip content={collapsed ? "Menüyü açık tut" : "Menüyü şeride döndür"}>
              <Button variant="ghost" size="sm" className={styles.pin} aria-label="Menüyü açık tut" aria-pressed={!collapsed} onClick={() => setCollapsed(!collapsed)}>
                {collapsed ? <Pin size={16} aria-hidden="true" /> : <PinOff size={16} aria-hidden="true" />}
              </Button>
            </Tooltip>
          )}
        </div>
        <nav className={styles.nav} aria-label="Ana menü" onKeyDown={onNavKeyDown}>
          {error && (
            <div className={styles.error} role="alert">
              <span>Menü yüklenemedi.</span>
              {onRetry && <Button variant="secondary" size="sm" onClick={onRetry}>Yeniden dene</Button>}
            </div>
          )}
          {loading ? <div className={styles.loading}><Skeleton label="Menü yükleniyor" lines={5} /></div> : sections.map(section => {
            const items = visible(section.items);
            if (items.length === 0) return null;
            return (
              <section key={section.id} className={styles.section} aria-label={section.title}>
                {section.title && !rail && <h2 className={styles.sectionTitle}>{section.title}</h2>}
                <ul className={styles.list}>{items.map(item => renderRow(item, rail))}</ul>
              </section>
            );
          })}
        </nav>
        <div className={styles.foot}>
          {settingsItem && <ul className={styles.list}>{renderRow(settingsItem, rail)}</ul>}
          {user && (
            <Popover>
              {rail ? <Tooltip content={user.name} side="right">{userTrigger(user)}</Tooltip> : userTrigger(user)}
              <PopoverContent side={rail ? "right" : "top"} align="start" className={styles.flyout}>
                {user.menu?.map(action => (
                  <PopoverClose asChild key={action.id}><button type="button" className={styles.flyoutRow} onClick={action.onSelect}>{action.label}</button></PopoverClose>
                ))}
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
    );
  }

  const crumbs = found
    ? [...(found.section.title ? [{ label: found.section.title }] : []), ...found.trail.map(item => ({ label: item.label })), { label: found.item.label }]
    : [{ label: sections[0]?.title ?? header.name }];

  return (
    <div ref={setRoot} className={[styles.root, className].filter(Boolean).join(" ")} data-narrow={narrow ? "true" : undefined}>
      <div className={styles.status} role="status" aria-live="polite">{note}</div>
      {!narrow && (
        // Yuva yerleşimde yer tutar (şerit ya da açık); geçici açılan menü yuvadan taşar ve içeriğin üstüne çizilir.
        <motion.div className={styles.asideSlot} initial={false} animate={{ width: collapsed ? "3.5rem" : "16rem" }} transition={grow}>
          <motion.aside className={styles.aside} data-peek={peek ? "true" : undefined} initial={false} animate={{ width: collapsed && !peek ? "3.5rem" : "16rem" }} transition={grow}
            onMouseEnter={() => schedulePeek(true)} onMouseLeave={() => schedulePeek(false)}
            onFocus={() => { if (hoverExpand && collapsed) { window.clearTimeout(peekTimer.current); setPeek(true); } }}
            onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) schedulePeek(false); }}
            onKeyDown={event => { if (event.key === "Escape" && peek) setPeek(false); }}>
            {renderNav(collapsed && !peek)}
          </motion.aside>
        </motion.div>
      )}
      <div className={styles.main}>
        <header className={styles.topbar}>
          {narrow
            ? <Button variant="ghost" size="sm" aria-label="Menüyü aç" onClick={() => setDrawerOpen(true)}><Menu size={18} aria-hidden="true" /></Button>
            : <Tooltip content={collapsed ? "Menüyü genişlet" : "Menüyü daralt"}><Button variant="ghost" size="sm" aria-label={collapsed ? "Menüyü genişlet" : "Menüyü daralt"} aria-keyshortcuts="Control+B" onClick={() => setCollapsed(!collapsed)}><PanelLeft size={18} aria-hidden="true" /></Button></Tooltip>}
          <Breadcrumb items={crumbs} />
        </header>
        <div className={styles.content}>{children}</div>
      </div>
      {narrow && (
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerContent
            title={header.name} side="left" container={root} className={styles.drawer}
            onOpenAutoFocus={event => {
              // Odak etkin satıra gider; yoksa ilk satıra.
              event.preventDefault();
              const panel = (root ?? document).querySelector<HTMLElement>(`.${styles.drawer}`);
              (panel?.querySelector<HTMLElement>("[aria-current='page']") ?? panel?.querySelector<HTMLElement>("[data-nav-item]"))?.focus();
            }}
          >
            {renderNav(false)}
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
}

export default Sidebar;
