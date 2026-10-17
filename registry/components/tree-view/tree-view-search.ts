// Ağaç görünümünün saf arama mantığı: eşleşmeler, açılacak üst düğümler, görünür düğümler. React içermez; test doğrudan bunu okur.
import { text } from "@snn/abacus-core";

export interface TreeNode {
  /** Kalıcı kimlik. */
  id: string;
  label: string;
  /** Adın yanında soluk yazılan ek bilgi, örneğin kod ya da ağırlık. Aramaya dahildir. */
  meta?: string;
  children?: TreeNode[];
}

export interface TreeSearch {
  /** Sorguya uyan düğümler. */
  matches: Set<string>;
  /** Eşleşmelerin bütün üstleri: arama sırasında açık durur. */
  expand: Set<string>;
  /** Eşleşmeler ve üstleri: arama sırasında yalnız bunlar görünür. */
  visible: Set<string>;
}

/**
 * Sorgudaki her kelime düğümün adında ya da ek bilgisinde geçiyorsa düğüm eşleşir (Türkçe harfe duyarsız: "sut" "Süt"ü bulur).
 * Sorgu boşsa null döner: ağaç kullanıcının açtığı gibi görünür.
 */
export function searchTree(nodes: TreeNode[], query: string): TreeSearch | null {
  const words = text.searchKey(query.trim()).split(/\s+/).filter(Boolean);
  if (!words.length) return null;
  const result: TreeSearch = { matches: new Set(), expand: new Set(), visible: new Set() };
  const walk = (node: TreeNode, path: string[]): boolean => {
    const key = text.searchKey(`${node.label} ${node.meta ?? ""}`);
    const own = words.every(word => key.includes(word));
    let below = false;
    for (const child of node.children ?? []) below = walk(child, [...path, node.id]) || below;
    if (own) result.matches.add(node.id);
    if (own || below) result.visible.add(node.id);
    if (below) result.expand.add(node.id);
    return own || below;
  };
  for (const node of nodes) walk(node, []);
  return result;
}

/** Bir düğümün üstlerinin kimlikleri, kökten başlayarak. Seçili düğümü açık göstermek için. */
export function ancestorsOf(nodes: TreeNode[], id: string): string[] {
  const find = (list: TreeNode[], path: string[]): string[] | null => {
    for (const node of list) {
      if (node.id === id) return path;
      const found = find(node.children ?? [], [...path, node.id]);
      if (found) return found;
    }
    return null;
  };
  return find(nodes, []) ?? [];
}

/** Adın sorguyla eşleşen ilk parçası [başlangıç, bitiş]; Türkçe harf dönüşümü uzunluğu değiştiriyorsa vurgulanmaz (null). */
export function matchRange(label: string, query: string): [number, number] | null {
  const word = text.searchKey(query.trim()).split(/\s+/).filter(Boolean)[0];
  if (!word) return null;
  const key = text.searchKey(label);
  if (key.length !== label.length) return null;
  const start = key.indexOf(word);
  return start === -1 ? null : [start, start + word.length];
}
