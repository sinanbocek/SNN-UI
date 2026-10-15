"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { ClipboardEvent, KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Transition } from "motion/react";
import { text } from "@snn/abacus-core";
import { motionTokens } from "../lib/motion-tokens";
import { Avatar } from "../avatar/avatar";
import { Badge } from "../badge/badge";
import { Button } from "../button/button";
import { EmptyState } from "../empty-state/empty-state";
import { Pagination } from "../pagination/pagination";
import { SearchField } from "../search-field/search-field";
import { Select } from "../select/select";
import { Skeleton } from "../skeleton/skeleton";
import { Tooltip } from "../tooltip/tooltip";
import styles from "./team-members.module.css";

export interface TeamRole { value: string; label: string; /** Sahip rolü: satırda seçici değil düz yazı çıkar, davet rolü olarak sunulmaz. */ owner?: boolean }

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  /** `roles` içindeki bir değer. */
  role: string;
  /** Kendisi mi? "Sen" etiketi çıkar, çıkar düğmesi çıkmaz. */
  self?: boolean;
  /** Şu an çevrimiçi mi? Nokta yanında "Şu an çevrimiçi" yazısı da vardır (nokta tek başına renkten ibaret kalmaz). */
  online?: boolean;
  /** Çevrimdışıysa son görülme, hazır metin ("2 saat önce"; proje ABACUS `date.relativeTime` ile üretir). Satırda "{lastSeen} aktifti" yazılır. */
  lastSeen?: string;
  src?: string;
}

export interface TeamInvite {
  id: string;
  email: string;
  role: string;
  /** Davet tarihi, hazır metin (proje ABACUS `date.format` ile üretir). */
  sentAt: string;
}

export interface TeamMembersProps {
  members: TeamMember[];
  invites?: TeamInvite[];
  roles: TeamRole[];
  /** Toplam koltuk sayısı. Kullanılan koltuk = üyeler + bekleyen davetler. */
  seatLimit: number;
  /** Davet gönder. Reddedilirse etiketler kalır ve hata yazılır. */
  onInvite: (emails: string[], role: string) => void | Promise<void>;
  /** Rol değiştir. Reddedilirse eski role dönülür ve satırda hata yazılır. */
  onRoleChange: (memberId: string, role: string) => void | Promise<void>;
  onRemove: (memberId: string) => void | Promise<void>;
  onResend: (inviteId: string) => void | Promise<void>;
  onCancelInvite: (inviteId: string) => void | Promise<void>;
  /** Üye listesi gelirken true. */
  loading?: boolean;
  /** Liste yüklenemediyse true; "Yeniden dene" `onRetry` çağırır. */
  error?: boolean;
  onRetry?: () => void;
  /** Sayfa başına üye. Üye sayısı bunu aşarsa sayfalama çıkar. */
  pageSize?: number;
  className?: string;
}

const defaultInviteMessage = "Adresleri virgülle ayırın ya da Enter'a basın. Davetler 7 gün geçerlidir.";

/** Çalışma alanı üyeleri: koltuk sayacı, e-posta etiketli davet kutusu, üye listesi (rol, çıkarma sorusu, arama) ve bekleyen davetler. */
export function TeamMembers({
  members, invites = [], roles, seatLimit, onInvite, onRoleChange, onRemove, onResend, onCancelInvite,
  loading = false, error = false, onRetry, pageSize = 8, className,
}: TeamMembersProps) {
  const uid = useId();
  const reduced = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [inviteRole, setInviteRole] = useState(() => roles.find(role => !role.owner)?.value ?? roles[0]?.value ?? "");
  const [inviteError, setInviteError] = useState("");
  const [sending, setSending] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [roleDraft, setRoleDraft] = useState<Record<string, string>>({});
  const [rowError, setRowError] = useState<Record<string, string>>({});
  const [note, setNote] = useState("");

  const used = members.length + invites.length;
  const free = Math.max(0, seatLimit - used);
  const full = used >= seatLimit;
  const roleLabel = (value: string) => roles.find(role => role.value === value)?.label ?? value;
  const inviteRoles = roles.filter(role => !role.owner);

  const filtered = useMemo(() => {
    const key = text.searchKey(query.trim());
    if (!key) return members;
    return members.filter(member => text.searchKey(`${member.name} ${member.email}`).includes(key));
  }, [members, query]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const shown = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  // Çıkarma sorusu açılınca odak güvenli seçeneğe ("Vazgeç") gider.
  const cancelRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (confirmId) cancelRef.current?.focus(); }, [confirmId]);

  function commit(raw: string): boolean {
    const token = raw.trim();
    if (!token) return true;
    const result = text.email(token);
    if (!result.valid) { setInviteError(`'${token}' geçerli bir e-posta adresi değil.`); return false; }
    setInviteError("");
    setTags(current => current.includes(result.stored) ? current : [...current, result.stored]);
    return true;
  }

  function onDraftChange(value: string) {
    if (!/[,;\s]/.test(value)) { setDraft(value); setInviteError(""); return; }
    const parts = value.split(/[,;\s]+/);
    const last = parts.pop() ?? "";
    // Geçersiz ilk adres kutuda kalır (düzeltilebilsin); sonrakiler denenir.
    let rest: string | null = null;
    for (const part of parts) if (!commit(part) && rest === null) rest = part;
    setDraft(rest ?? last);
  }

  function onPaste(event: ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData.getData("text");
    if (!/[,;\s]/.test(pasted.trim())) return;
    event.preventDefault();
    for (const part of pasted.split(/[,;\s]+/)) commit(part);
  }

  async function send() {
    if (sending || tags.length === 0) return;
    if (tags.length > free) {
      setInviteError(free === 0 ? "Koltuk kalmadı." : `Yalnız ${free} koltuk kaldı; fazla adresleri çıkarın.`);
      return;
    }
    setSending(true);
    try {
      await onInvite(tags, inviteRole);
      setNote(`${tags.length} davet gönderildi.`);
      setTags([]);
      setInviteError("");
    } catch {
      setInviteError("Davet gönderilemedi. Adresleriniz duruyor.");
    } finally { setSending(false); }
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      if (draft.trim()) { if (commit(draft)) setDraft(""); } else void send();
    } else if (event.key === "Backspace" && draft === "" && tags.length) {
      setTags(current => current.slice(0, -1));
    }
  }

  async function run(id: string, action: () => void | Promise<void>, done: string, undo?: () => void) {
    setRowError(current => { const { [id]: _, ...next } = current; return next; });
    try { await action(); setNote(done); }
    catch { undo?.(); setRowError(current => ({ ...current, [id]: "İşlem yapılamadı. Değişiklik geri alındı." })); }
  }

  function changeRole(member: TeamMember, role: string) {
    setRoleDraft(current => ({ ...current, [member.id]: role }));
    void run(member.id, () => onRoleChange(member.id, role), `${member.name} artık ${roleLabel(role)}.`)
      .finally(() => setRoleDraft(current => { const { [member.id]: _, ...next } = current; return next; }));
  }

  function remove(member: TeamMember) {
    setConfirmId(null);
    void run(member.id, () => onRemove(member.id), `${member.name} çıkarıldı.`);
  }

  // Satır eklenirken ve çıkarken yer açar/kapatır; "hareketi azalt" açıkken yalnız solar.
  const grow: Transition = { duration: motionTokens.duration.standard, ease: [...motionTokens.ease.enter] };
  const still: Transition = { duration: motionTokens.duration.instant };
  const rowMotion = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: still }
    : { layout: "position" as const, initial: { opacity: 0, height: 0 }, animate: { opacity: 1, height: "auto" }, exit: { opacity: 0, height: 0 }, transition: grow };

  return (
    <section className={[styles.root, className].filter(Boolean).join(" ")} aria-labelledby={`${uid}-title`}>
      <div className={styles.status} role="status" aria-live="polite">{note}</div>

      <header className={styles.header}>
        <div>
          <h2 id={`${uid}-title`} className={styles.title}>Üyeler</h2>
          <p className={styles.lead}>Çalışma alanına kimlerin erişebileceğini yönetin.</p>
        </div>
        <Badge tone={full ? "warning" : "neutral"}>{`${used} / ${seatLimit} koltuk`}</Badge>
      </header>

      <div className={styles.invite}>
        <label className={styles.inviteLabel} htmlFor={`${uid}-draft`}>Kişileri davet et</label>
        <div className={styles.inviteRow}>
          <div className={styles.tagBox} data-invalid={inviteError ? "true" : undefined} onClick={() => inputRef.current?.focus()}>
            {tags.map((tag, index) => (
              <span key={tag} className={styles.tag} data-over={index >= free ? "true" : undefined}>
                <span className={styles.tagText}>{tag}</span>
                <button type="button" className={styles.tagRemove} aria-label={`${tag} kaldır`} onClick={() => setTags(current => current.filter(item => item !== tag))}>×</button>
              </span>
            ))}
            <input
              ref={inputRef} id={`${uid}-draft`} className={styles.draft} value={draft} placeholder={tags.length ? "" : "E-posta adresleri"}
              disabled={loading || error} autoComplete="off" inputMode="email" aria-invalid={inviteError ? true : undefined} aria-describedby={`${uid}-hint`}
              onChange={event => onDraftChange(event.target.value)} onKeyDown={onKeyDown} onPaste={onPaste}
            />
          </div>
          <div className={styles.roleSelect}>
            <Select label="Davet rolü" value={inviteRole} onValueChange={setInviteRole} options={inviteRoles.map(role => ({ value: role.value, label: role.label }))} disabled={loading || error} />
          </div>
          <Button onClick={() => void send()} loading={sending} disabled={loading || error || full || tags.length === 0}>Davet gönder</Button>
        </div>
        <p id={`${uid}-hint`} className={styles.hint} data-tone={inviteError ? "error" : undefined} role={inviteError ? "alert" : undefined}>
          {inviteError || (full ? "Koltuk kalmadı. Yeni davet için bir üyeyi çıkarın ya da bir daveti iptal edin." : defaultInviteMessage)}
        </p>
      </div>

      <div className={styles.listHead}>
        <h3 className={styles.listTitle}>Üyeler <span className={styles.count}>{String(filtered.length)}</span></h3>
        <div className={styles.search}><SearchField label="Üyelerde ara" value={query} onValueChange={value => { setQuery(value); setPage(1); }} placeholder="Ad ya da e-posta" /></div>
      </div>

      {error ? (
        <EmptyState title="Üyeler yüklenemedi" description="Bağlantınızı kontrol edip yeniden deneyin." action={onRetry ? <Button variant="secondary" onClick={onRetry}>Yeniden dene</Button> : undefined} />
      ) : loading ? (
        <div className={styles.skeletons}>{[0, 1, 2].map(index => <Skeleton key={index} avatar lines={2} label="Üyeler yükleniyor" />)}</div>
      ) : (
        <>
          {shown.length === 0 ? (
            <EmptyState title="Eşleşen üye yok" description="Farklı bir ad ya da e-posta deneyin." />
          ) : (
            <ul className={styles.list}>
              <AnimatePresence initial={false}>
                {shown.map(member => {
                  const owner = roles.find(role => role.value === member.role)?.owner === true;
                  const asking = confirmId === member.id;
                  const role = roleDraft[member.id] ?? member.role;
                  return (
                    <motion.li key={member.id} className={styles.item} {...rowMotion}>
                      <div className={styles.member} data-asking={asking ? "true" : undefined} onKeyDown={asking ? (event => { if (event.key === "Escape") { event.stopPropagation(); setConfirmId(null); } }) : undefined}>
                        {asking ? (
                          <>
                            <div className={styles.ask}>
                              <span className={styles.askTitle}>{`${member.name} çıkarılsın mı?`}</span>
                              <span className={styles.askBody}>Çalışma alanına erişimi hemen kapanır.</span>
                            </div>
                            <div className={styles.actions}>
                              <Button ref={cancelRef} variant="secondary" size="sm" onClick={() => setConfirmId(null)}>Vazgeç</Button>
                              <Button variant="danger" size="sm" onClick={() => remove(member)}>Çıkar</Button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className={styles.identity}>
                              <Avatar name={member.name} src={member.src} status={member.online ? "online" : undefined} />
                              <div className={styles.who}>
                                <span className={styles.nameLine}>
                                  <Tooltip content={member.name}><span className={styles.name}>{member.name}</span></Tooltip>
                                  {member.self && <Badge size="sm">Sen</Badge>}
                                </span>
                                <Tooltip content={member.email}><span className={styles.email}>{member.email}</span></Tooltip>
                              </div>
                            </div>
                            <span className={styles.seen}>{member.online ? "Şu an çevrimiçi" : member.lastSeen ? `${member.lastSeen} aktifti` : ""}</span>
                            <div className={styles.roleCell}>
                              {owner ? <span className={styles.ownerRole}>{roleLabel(member.role)}</span> : (
                                <div className={styles.roleSelect}>
                                  <Select label={`Rol: ${member.name}`} value={role} onValueChange={value => changeRole(member, value)} options={inviteRoles.map(item => ({ value: item.value, label: item.label }))} />
                                </div>
                              )}
                            </div>
                            <div className={styles.actions}>
                              {!member.self && !owner && <Button variant="ghost" size="sm" aria-label={`${member.name} çıkar`} onClick={() => setConfirmId(member.id)}>Çıkar</Button>}
                            </div>
                          </>
                        )}
                      </div>
                      {rowError[member.id] && <p className={styles.rowError} role="alert">{rowError[member.id]}</p>}
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          )}
          {members.length <= 1 && invites.length === 0 && !query && (
            <EmptyState title="Henüz kimseyi davet etmediniz." description="Yukarıdaki kutuya e-posta adreslerini yazın." action={<Button variant="secondary" onClick={() => inputRef.current?.focus()}>Kişileri davet et</Button>} />
          )}
          {filtered.length > pageSize && <div className={styles.pager}><Pagination page={safePage} pageCount={pageCount} onPageChange={setPage} /></div>}

          {invites.length > 0 && (
            <section className={styles.pending} aria-labelledby={`${uid}-pending`}>
              <h3 id={`${uid}-pending`} className={styles.listTitle}>Bekleyen davetler <span className={styles.count}>{String(invites.length)}</span></h3>
              <ul className={styles.list}>
                <AnimatePresence initial={false}>
                  {invites.map(invite => (
                    <motion.li key={invite.id} className={styles.item} {...rowMotion}>
                      <div className={styles.member}>
                        <div className={styles.identity}>
                          <span className={styles.ghostAvatar} aria-hidden="true">{text.upper(invite.email.charAt(0))}</span>
                          <div className={styles.who}>
                            <Tooltip content={invite.email}><span className={styles.name}>{invite.email}</span></Tooltip>
                            <span className={styles.email}>{`${roleLabel(invite.role)} · Davet: ${invite.sentAt}`}</span>
                          </div>
                        </div>
                        <div className={styles.actions}>
                          <Button variant="ghost" size="sm" onClick={() => void run(invite.id, () => onResend(invite.id), `${invite.email} adresine davet yeniden gönderildi.`)}>Yeniden gönder</Button>
                          <Button variant="ghost" size="sm" onClick={() => void run(invite.id, () => onCancelInvite(invite.id), "Davet iptal edildi.")}>İptal et</Button>
                        </div>
                      </div>
                      {rowError[invite.id] && <p className={styles.rowError} role="alert">{rowError[invite.id]}</p>}
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            </section>
          )}
        </>
      )}
      <p className={styles.footnote}>Değişiklikler hemen uygulanır.</p>
    </section>
  );
}

export default TeamMembers;
