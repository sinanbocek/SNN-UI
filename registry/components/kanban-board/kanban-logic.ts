// Kanban sıralama mantığı: saf fonksiyonlar, ekran yok. Kartlar tek düz dizidir; sütun içi sıra dizideki sıradır.

export interface PlaceableCard { id: string; column: string; assigneeId?: string | undefined }

/** Bir hücrenin kartları. `lane` undefined: durum görünümü (sütundaki tüm kartlar); null: atanmamışlar; metin: o kişi. */
export function cellCards<T extends PlaceableCard>(items: T[], column: string, lane?: string | null): T[] {
  return items.filter(card => card.column === column && (lane === undefined || (card.assigneeId ?? null) === lane));
}

/**
 * Kartı hedef sütuna (ve şeritte kişiye) yerleştirir. `beforeId` verilirse o kartın önüne, null ise hücrenin sonuna girer.
 * `assignee`: "keep" kişiyi korur; null atamayı kaldırır; metin o kişiye atar.
 */
export function placeCard<T extends PlaceableCard>(items: T[], id: string, column: string, assignee: string | null | "keep", beforeId: string | null): T[] {
  const moving = items.find(card => card.id === id);
  if (!moving) return items;
  const moved: T = { ...moving, column, ...(assignee === "keep" ? {} : { assigneeId: assignee ?? undefined }) };
  const rest = items.filter(card => card.id !== id);
  if (beforeId !== null) {
    const at = rest.findIndex(card => card.id === beforeId);
    if (at >= 0) return [...rest.slice(0, at), moved, ...rest.slice(at)];
  }
  // Hücrenin sonu: sütundaki son kartın ardına; sütun boşsa dizinin sonuna.
  let lastInColumn = -1;
  rest.forEach((card, index) => { if (card.column === column) lastInColumn = index; });
  return lastInColumn < 0 ? [...rest, moved] : [...rest.slice(0, lastInColumn + 1), moved, ...rest.slice(lastInColumn + 1)];
}

/** Kartın bulunduğu hücredeki 1 tabanlı sırası. */
export function positionOf<T extends PlaceableCard>(items: T[], id: string, lane?: string | null): number {
  const card = items.find(item => item.id === id);
  if (!card) return 0;
  return cellCards(items, card.column, lane === undefined ? undefined : card.assigneeId ?? null).findIndex(item => item.id === id) + 1;
}
