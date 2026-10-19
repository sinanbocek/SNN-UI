// Bağlantı satırına basışın türü. Saf mantık: React içermez; test doğrudan bunu okur.

/** Basışın alanları; React ve DOM fare olayları ikisi de uyar. */
export interface ClickLike { button: number; metaKey: boolean; ctrlKey: boolean; shiftKey: boolean; altKey: boolean; defaultPrevented: boolean }

/**
 * Sayfa içinde gidilecek düz basış mı? Sol tuş, değiştirici tuş yok, önlenmemiş. Ctrl/⌘ (yeni sekme), Shift (yeni pencere),
 * Alt (indir) ve orta tuş tarayıcıya bırakılır; uygulama yönlendirmesi yalnız düz basışta yapılır.
 */
export function isPlainClick(event: ClickLike): boolean {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && !event.defaultPrevented;
}
