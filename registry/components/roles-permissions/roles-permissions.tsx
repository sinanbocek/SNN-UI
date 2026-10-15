"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronDown, Lock } from "lucide-react";
import { motionTokens } from "../lib/motion-tokens";
import { Avatar } from "../avatar/avatar";
import { Button } from "../button/button";
import { Checkbox } from "../checkbox/checkbox";
import { DropdownMenu } from "../dropdown-menu/dropdown-menu";
import type { DropdownItem } from "../dropdown-menu/dropdown-menu";
import { EmptyState } from "../empty-state/empty-state";
import { Skeleton } from "../skeleton/skeleton";
import { Tooltip } from "../tooltip/tooltip";
import styles from "./roles-permissions.module.css";

export interface PermissionRole {
  id: string;
  name: string;
  /** Bu roldeki kişi sayısı. */
  memberCount: number;
  /** Sahip rolü: her izne her zaman sahiptir, kutuları değiştirilemez. */
  owner?: boolean;
}

export interface PermissionItem { id: string; label: string }
export interface PermissionGroup { id: string; label: string; permissions: PermissionItem[] }

export interface PermissionChange { roleId: string; permissionId: string; granted: boolean }

export type PermissionSaveStatus = "idle" | "saving" | "saved" | "error";

export interface RolesPermissionsProps {
  roles: PermissionRole[];
  groups: PermissionGroup[];
  /** Kaydedilmiş izinler: rol kimliği → verilen izin kimlikleri. Sahip rolü için gerekmez. */
  values: Record<string, string[]>;
  /** Değişen her (rol, izin) çifti gelir. Reddedilirse çubukta hata ve "Yeniden dene" çıkar; değişiklikler korunur. */
  onSave: (changes: PermissionChange[]) => void | Promise<void>;
  /** Başlığın yanında gösterilen üyeler (avatar yığını). */
  members?: { name: string; src?: string }[];
  /** Rol sütunu menüsü ("Rolü çoğalt" gibi). Boş dizi döndürülürse menü çıkmaz. */
  roleMenu?: (role: PermissionRole) => DropdownItem[];
  /** Roller boşken "Rol oluştur" düğmesi. */
  onCreateRole?: () => void;
  /** Gruplar kapalı başlasın (çok sayıda izin için). */
  collapsedByDefault?: boolean;
  loading?: boolean;
  title?: string;
  className?: string;
}

type Row = { type: "group"; group: PermissionGroup } | { type: "permission"; group: PermissionGroup; permission: PermissionItem };

const OWNER_NOTE = "Sahip her zaman tüm izinlere sahiptir.";

/** Roller ve izinler matrisi: satırlar izin, sütunlar rol. Grup kutuları, ok tuşlu gezinme ve değişiklik inceleme çubuğu vardır. */
export function RolesPermissions({
  roles, groups, values, onSave, members = [], roleMenu, onCreateRole, collapsedByDefault = false, loading = false,
  title = "Roller ve izinler", className,
}: RolesPermissionsProps) {
  const uid = useId();
  const reduced = useReducedMotion() ?? false;
  const tableRef = useRef<HTMLTableElement>(null);
  const timers = useRef<number[]>([]);
  const [saved, setSaved] = useState(values);
  const [draft, setDraft] = useState(values);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() => Object.fromEntries(groups.map(group => [group.id, collapsedByDefault])));
  const [active, setActive] = useState({ r: 0, c: 1 });
  const [hotCol, setHotCol] = useState<number | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [status, setStatus] = useState<PermissionSaveStatus>("idle");
  const [showSaved, setShowSaved] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => { setSaved(values); setDraft(values); }, [values]);
  useEffect(() => () => { timers.current.forEach(window.clearTimeout); }, []);

  const rows = useMemo<Row[]>(() => groups.flatMap(group => [
    { type: "group", group } as Row,
    ...(collapsed[group.id] ? [] : group.permissions.map(permission => ({ type: "permission", group, permission }) as Row)),
  ]), [groups, collapsed]);
  const permissionCount = useMemo(() => groups.reduce((sum, group) => sum + group.permissions.length, 0), [groups]);
  const memberTotal = roles.reduce((sum, role) => sum + role.memberCount, 0);

  const has = (map: Record<string, string[]>, role: PermissionRole, permissionId: string) => role.owner === true || (map[role.id] ?? []).includes(permissionId);

  const changes = useMemo<PermissionChange[]>(() => {
    const list: PermissionChange[] = [];
    for (const role of roles) {
      if (role.owner) continue;
      for (const group of groups) for (const permission of group.permissions) {
        const before = has(saved, role, permission.id);
        const after = has(draft, role, permission.id);
        if (before !== after) list.push({ roleId: role.id, permissionId: permission.id, granted: after });
      }
    }
    return list;
  }, [roles, groups, saved, draft]); // eslint-disable-line react-hooks/exhaustive-deps
  const changedRoles = new Set(changes.map(change => change.roleId));
  const permissionLabel = (id: string) => groups.flatMap(group => group.permissions).find(permission => permission.id === id)?.label ?? id;
  const roleName = (id: string) => roles.find(role => role.id === id)?.name ?? id;

  function setPermission(role: PermissionRole, permissionId: string, granted: boolean) {
    setDraft(current => {
      const list = new Set(current[role.id] ?? []);
      if (granted) list.add(permissionId); else list.delete(permissionId);
      return { ...current, [role.id]: [...list] };
    });
    if (status !== "idle") setStatus("idle");
  }

  function toggle(role: PermissionRole, permission: PermissionItem) {
    if (role.owner || loading) return;
    const next = !has(draft, role, permission.id);
    setPermission(role, permission.id, next);
    setNote(`${role.name} için ${permission.label} ${next ? "açıldı" : "kapatıldı"}`);
  }

  function groupState(role: PermissionRole, group: PermissionGroup): boolean | "indeterminate" {
    const on = group.permissions.filter(permission => has(draft, role, permission.id)).length;
    return on === 0 ? false : on === group.permissions.length ? true : "indeterminate";
  }

  // Grup kutusu: izinleri kısa gecikmelerle sırayla çevirir (dalga); "hareketi azalt" açıkken hepsi birden.
  function toggleGroup(role: PermissionRole, group: PermissionGroup) {
    if (role.owner || loading) return;
    const next = groupState(role, group) !== true;
    group.permissions.forEach((permission, index) => {
      if (has(draft, role, permission.id) === next) return;
      if (reduced) { setPermission(role, permission.id, next); return; }
      timers.current.push(window.setTimeout(() => setPermission(role, permission.id, next), index * 45));
    });
    setNote(`${role.name} için ${group.label} grubundaki tüm izinler ${next ? "açıldı" : "kapatıldı"}`);
  }

  function focusCell(r: number, c: number) {
    const row = Math.min(Math.max(r, 0), rows.length - 1);
    const isGroup = rows[row].type === "group";
    const col = Math.min(Math.max(c, isGroup ? 0 : 1), roles.length);
    setActive({ r: row, c: col });
    tableRef.current?.querySelector<HTMLElement>(`[data-r="${row}"][data-c="${col}"]`)?.focus();
  }

  function onGridKeyDown(event: KeyboardEvent<HTMLTableElement>) {
    const target = (event.target as HTMLElement).closest<HTMLElement>("[data-r]");
    if (!target) return;
    const r = Number(target.dataset.r);
    const c = Number(target.dataset.c);
    const first = rows[r]?.type === "group" ? 0 : 1;
    let handled = true;
    switch (event.key) {
      case "ArrowRight": focusCell(r, c + 1); break;
      case "ArrowLeft": focusCell(r, c - 1); break;
      case "ArrowDown": focusCell(r + 1, c); break;
      case "ArrowUp": focusCell(r - 1, c); break;
      case "Home": event.ctrlKey ? focusCell(0, 1) : focusCell(r, first); break;
      case "End": event.ctrlKey ? focusCell(rows.length - 1, roles.length) : focusCell(r, roles.length); break;
      default: handled = false;
    }
    if (handled) event.preventDefault();
  }

  async function save() {
    if (changes.length === 0 || status === "saving") return;
    setStatus("saving");
    try {
      await onSave(changes);
      setSaved(draft);
      setStatus("saved");
      setShowSaved(true);
      setReviewOpen(false);
      setNote("Değişiklikler kaydedildi.");
      timers.current.push(window.setTimeout(() => setShowSaved(false), 2200));
    } catch {
      setStatus("error");
      setNote("İzinler kaydedilemedi.");
    }
  }

  function discard() { setDraft(saved); setStatus("idle"); setReviewOpen(false); setNote("Değişiklikler geri alındı."); }

  const summary = useMemo(() => {
    const byRole = new Map<string, string[]>();
    for (const change of changes) byRole.set(change.roleId, [...(byRole.get(change.roleId) ?? []), `${permissionLabel(change.permissionId)} ${change.granted ? "eklendi" : "kaldırıldı"}`]);
    return [...byRole.entries()].map(([id, lines]) => `${roleName(id)}: ${lines.join(", ")}`);
  }, [changes]); // eslint-disable-line react-hooks/exhaustive-deps

  const barVisible = changes.length > 0 || (status === "saved" && showSaved);
  const barSpring = reduced ? { duration: motionTokens.duration.instant } : motionTokens.spring.smooth;

  return (
    <section className={[styles.root, className].filter(Boolean).join(" ")} data-reduced={reduced ? "true" : undefined} aria-labelledby={`${uid}-title`}>
      <div className={styles.srOnly} role="status" aria-live="polite">{note}</div>

      <header className={styles.header}>
        <div>
          <h2 id={`${uid}-title`} className={styles.title}>{title}</h2>
          <p className={styles.lead}>{`${memberTotal} üye, ${roles.length} rol`}</p>
        </div>
        {members.length > 0 && (
          <div className={styles.stack} role="group" aria-label="Üyeler">
            {members.slice(0, 4).map(member => <span key={member.name} className={styles.stackItem}><Avatar name={member.name} src={member.src} size="sm" /></span>)}
            {members.length > 4 && <span className={styles.more}>{`+${members.length - 4}`}</span>}
          </div>
        )}
      </header>

      {loading ? (
        <div className={styles.skeletons}><Skeleton lines={6} label="İzinler yükleniyor" /></div>
      ) : roles.length === 0 ? (
        <EmptyState title="Henüz rol yok" description="İzinleri düzenlemek için önce bir rol oluşturun." action={onCreateRole ? <Button variant="secondary" onClick={onCreateRole}>Rol oluştur</Button> : undefined} />
      ) : (
        <>
          <div className={styles.scroll}>
            <table ref={tableRef} className={styles.table} role="grid" aria-label="Rol izinleri" aria-describedby={`${uid}-hint`} aria-rowcount={rows.length + 1} onKeyDown={onGridKeyDown}>
              <thead>
                <tr>
                  <th scope="col" className={styles.corner}><span className={styles.srOnly}>İzin</span></th>
                  {roles.map((role, index) => {
                    const items = roleMenu?.(role) ?? [];
                    return (
                      <th key={role.id} scope="col" className={styles.roleHead} data-hot={hotCol === index + 1 ? "true" : undefined} onMouseEnter={() => setHotCol(index + 1)} onMouseLeave={() => setHotCol(null)}>
                        <div className={styles.roleHeadInner}>
                          <span className={styles.roleName}>
                            {role.owner && <Lock size={12} strokeWidth={2} aria-hidden="true" />}
                            {role.name}
                            {changedRoles.has(role.id) && <><motion.span className={styles.dot} initial={reduced ? false : { scale: 0 }} animate={{ scale: 1 }} transition={motionTokens.spring.snappy} aria-hidden="true" /><span className={styles.srOnly}> Düzenlendi</span></>}
                          </span>
                          <span className={styles.roleMeta}>{role.owner ? "İzinleri sabit" : `${role.memberCount} kişi`}</span>
                          {items.length > 0 && <DropdownMenu label={`${role.name} rol menüsü`} items={items} />}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, r) => (
                  row.type === "group" ? (
                    <tr key={`g-${row.group.id}`} className={styles.groupRow} aria-rowindex={r + 2}>
                      <th scope="row" className={styles.rowHead}>
                        <button
                          type="button" className={styles.groupToggle} data-r={r} data-c={0} tabIndex={active.r === r && active.c === 0 ? 0 : -1}
                          aria-expanded={!collapsed[row.group.id]} onFocus={() => setActive({ r, c: 0 })}
                          onClick={() => setCollapsed(current => ({ ...current, [row.group.id]: !current[row.group.id] }))}
                        >
                          <ChevronDown size={14} strokeWidth={2} className={styles.chevron} data-open={!collapsed[row.group.id] ? "true" : undefined} aria-hidden="true" />
                          <span>{row.group.label}</span>
                          <span className={styles.groupCount}>{`${row.group.permissions.length} izin`}</span>
                        </button>
                      </th>
                      {roles.map((role, index) => (
                        <td key={role.id} role="gridcell" className={styles.cell} data-hot={hotCol === index + 1 ? "true" : undefined} onMouseEnter={() => setHotCol(index + 1)} onMouseLeave={() => setHotCol(null)}>
                          <Cell locked={role.owner === true}>
                            <Checkbox
                              aria-label={`${role.name}: ${row.group.label} grubunun tüm izinleri`} aria-disabled={role.owner ? true : undefined}
                              checked={groupState(role, row.group)} onCheckedChange={() => toggleGroup(role, row.group)}
                              data-r={r} data-c={index + 1} tabIndex={active.r === r && active.c === index + 1 ? 0 : -1} onFocus={() => setActive({ r, c: index + 1 })}
                            />
                          </Cell>
                        </td>
                      ))}
                    </tr>
                  ) : (
                    <tr key={`p-${row.permission.id}`} aria-rowindex={r + 2}>
                      <th scope="row" className={styles.rowHead}><span className={styles.permissionLabel}>{row.permission.label}</span></th>
                      {roles.map((role, index) => (
                        <td key={role.id} role="gridcell" className={styles.cell} data-hot={hotCol === index + 1 ? "true" : undefined} onMouseEnter={() => setHotCol(index + 1)} onMouseLeave={() => setHotCol(null)}>
                          <Cell locked={role.owner === true}>
                            <Checkbox
                              aria-label={`${role.name}: ${row.permission.label}`} aria-disabled={role.owner ? true : undefined}
                              checked={has(draft, role, row.permission.id)} onCheckedChange={() => toggle(role, row.permission)}
                              data-r={r} data-c={index + 1} tabIndex={active.r === r && active.c === index + 1 ? 0 : -1} onFocus={() => setActive({ r, c: index + 1 })}
                            />
                          </Cell>
                        </td>
                      ))}
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>
          <p id={`${uid}-hint`} className={styles.footnote}>{`${permissionCount} izin. ${OWNER_NOTE} Hücreler arasında ok tuşlarıyla gezinin, Boşluk tuşuyla değiştirin.`}</p>
        </>
      )}

      <div className={styles.barRegion}>
        <AnimatePresence>
          {barVisible && (
            <motion.div
              key="bar" className={styles.bar} role="group" aria-label="Değişiklik çubuğu" data-status={status}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }} transition={barSpring}
            >
              {changes.length === 0 ? (
                <span className={styles.barText}>Değişiklikler kaydedildi.</span>
              ) : (
                <>
                  <div className={styles.barMain}>
                    <span className={styles.barText} data-tone={status === "error" ? "error" : undefined}>
                      {status === "error" ? "İzinler kaydedilemedi." : "Kaydedilmemiş değişiklik"}
                      <span className={styles.barCount}>{String(changes.length)}</span>
                    </span>
                    <span className={styles.barActions}>
                      <Button variant="ghost" size="sm" aria-expanded={reviewOpen} aria-controls={`${uid}-review`} onClick={() => setReviewOpen(open => !open)}>Gözden geçir</Button>
                      <Button variant="ghost" size="sm" onClick={discard} disabled={status === "saving"}>Vazgeç</Button>
                      <Button size="sm" onClick={() => void save()} loading={status === "saving"} disabled={summary.length === 0}>{status === "error" ? "Yeniden dene" : "Kaydet"}</Button>
                    </span>
                  </div>
                  <AnimatePresence initial={false}>
                    {reviewOpen && (
                      <motion.ul id={`${uid}-review`} className={styles.review} initial={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={reduced ? { opacity: 0 } : { opacity: 0, height: 0 }} transition={barSpring}>
                        {summary.map(line => <li key={line}>{line}</li>)}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

/** Kilitli (sahip) hücreler odaklanabilir kalır; basınca neden kapalı olduğunu ipucu söyler. */
function Cell({ locked, children }: { locked: boolean; children: React.ReactNode }) {
  if (!locked) return <span className={styles.cellInner}>{children}</span>;
  return <Tooltip content={OWNER_NOTE}><span className={styles.cellInner} data-locked="true">{children}</span></Tooltip>;
}

export default RolesPermissions;
