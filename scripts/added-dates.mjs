// Galerinin "Yenilikler" listesi için her bileşenin main'e ilk girdiği an. Kaynak git geçmişidir; elle tarih tutulmaz.
// Galeri derlenirken (playground/vite.config.js) bir kez okunur. Son 24 saati süzmek sayfanın işidir (ziyaretçinin saatine göre).
import { execFileSync } from "node:child_process";

/**
 * `git log --first-parent -m --diff-filter=A --name-only --format=@%cI --reverse` çıktısını okur: "@tarih" satırı, ardından o
 * birleştirmede eklenen dosyalar. Her bileşen klasörünün ilk görüldüğü tarih döner. `lib` klasörü bileşen değildir, atlanır.
 */
export function parseAddedLog(log) {
  const dates = {};
  let current = null;
  for (const line of log.split(/\r?\n/)) {
    if (line.startsWith("@")) { current = line.slice(1).trim(); continue; }
    const match = /^registry\/components\/([^/]+)\//.exec(line.trim());
    if (!match || !current) continue;
    const name = match[1];
    if (name !== "lib" && !(name in dates)) dates[name] = current;
  }
  return dates;
}

/** Depodaki bileşen ekleme tarihleri. Sığ kopyada (CI'da fetch-depth 1) geçmiş eksiktir: her şeyi yeni sanmamak için boş döner. */
export function readAddedDates(root) {
  try {
    const git = (...args) => execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    if (git("rev-parse", "--is-shallow-repository").trim() === "true") return {};
    return parseAddedLog(git("log", "--first-parent", "-m", "--diff-filter=A", "--name-only", "--format=@%cI", "--reverse", "--", "registry/components"));
  } catch {
    return {};
  }
}
