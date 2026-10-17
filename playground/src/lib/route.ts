// Adres çubuğundaki kare işaretinden sonraki kısmı sayfaya çevirir. Saf mantık; test/galeri.test.mjs okur.
// "#line-chart" biçimi (eski galeri ve npm run shots) tek bileşen sayfasını açar.

export type Route =
  | { view: "home" }
  | { view: "category"; key: string }
  | { view: "component"; name: string }
  | { view: "color" }
  | { view: "type" }
  | { view: "share" };

export function parseRoute(hash: string, components: Set<string>, categories: Set<string>): Route {
  const path = hash.replace(/^#/, "").split("?")[0]!;
  if (path === "/renk") return { view: "color" };
  if (path === "/yazi") return { view: "type" };
  if (path === "/sepet") return { view: "share" };
  const category = path.match(/^\/kategori\/([a-z]+)$/);
  if (category && categories.has(category[1]!)) return { view: "category", key: category[1]! };
  const name = path.replace(/^\/bilesen\//, "");
  if (components.has(name)) return { view: "component", name };
  return { view: "home" };
}

export const routeHash = {
  home: "#/",
  category: (key: string) => `#/kategori/${key}`,
  component: (name: string) => `#/bilesen/${name}`,
  color: "#/renk",
  type: "#/yazi",
};
