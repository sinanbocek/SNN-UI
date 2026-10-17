// Gruplu tablonun saf süzme mantığı: Türkçe harfe duyarsız arama, grup başına eşleşme sayısı. React içermez; test doğrudan bunu okur.
import { text } from "@snn/abacus-core";

export interface TableGroup<T> { key: string; title: string; rows: T[] }
export interface FilteredGroup<T> extends TableGroup<T> { total: number }

/**
 * Sorgudaki her kelime satır metninde geçiyorsa satır kalır ("istanbul" "İstanbul"u bulur).
 * Sorgu boşsa gruplar olduğu gibi döner. Sorgu varken eşleşmesi olmayan grup listeden düşer.
 */
export function filterGroups<T>(groups: TableGroup<T>[], query: string, searchText: (row: T) => string): { groups: FilteredGroup<T>[]; matches: number } {
  const words = text.searchKey(query.trim()).split(/\s+/).filter(Boolean);
  if (!words.length) return { groups: groups.map(group => ({ ...group, total: group.rows.length })), matches: groups.reduce((sum, group) => sum + group.rows.length, 0) };
  let matches = 0;
  const result: FilteredGroup<T>[] = [];
  for (const group of groups) {
    const rows = group.rows.filter(row => { const key = text.searchKey(searchText(row)); return words.every(word => key.includes(word)); });
    matches += rows.length;
    if (rows.length) result.push({ ...group, rows, total: group.rows.length });
  }
  return { groups: result, matches };
}
