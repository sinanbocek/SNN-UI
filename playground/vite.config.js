import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";
import { readAddedDates } from "../scripts/added-dates.mjs";

const entry = fileURLToPath(new URL("./src/main.tsx", import.meta.url));

/** Bileşenler ../registry altında durur; oradan gelen paket adlarını (react, motion, radix...) galerinin node_modules'ünden çözer. */
function resolveFromGallery() {
  return {
    name: "resolve-from-gallery",
    async resolveId(id, importer, options) {
      if (!importer || importer.includes("/playground/") || importer.includes("\\playground\\")) return null;
      if (id.startsWith(".") || id.startsWith("/") || id.includes(":")) return null;
      return this.resolve(id, entry, { ...options, skipSelf: true });
    },
  };
}

/** "virtual:added-dates": bileşen adı → main'e ilk girdiği an (ISO). Galeri sol alttaki "Yenilikler" listesini bundan süzer. */
function addedDates() {
  const id = "virtual:added-dates", resolved = "\0" + id;
  return {
    name: "added-dates",
    resolveId: source => (source === id ? resolved : null),
    load: source => (source === resolved ? `export default ${JSON.stringify(readAddedDates(fileURLToPath(new URL("..", import.meta.url))))};` : null),
  };
}

// `npm run build`: site için parçalı çıktı (snn-ui.web.app). Yazı tipleri ayrı dosya kalır; tarayıcı yalnız gereken alfabe parçasını indirir.
// `npm run build:single`: tek dosyalı çıktı; dist/index.html çift tıkla açılır (sunucu gerekmez).
export default defineConfig(({ mode }) => ({
  plugins: [resolveFromGallery(), addedDates(), react(), ...(mode === "single" ? [viteSingleFile()] : [])],
  server: { fs: { allow: [".."] }, port: 5311 },
}));
