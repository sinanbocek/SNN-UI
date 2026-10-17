import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

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

// `npm run build`: site için parçalı çıktı (snn-ui.web.app). Yazı tipleri ayrı dosya kalır; tarayıcı yalnız gereken alfabe parçasını indirir.
// `npm run build:single`: tek dosyalı çıktı; dist/index.html çift tıkla açılır (sunucu gerekmez).
export default defineConfig(({ mode }) => ({
  plugins: [resolveFromGallery(), react(), ...(mode === "single" ? [viteSingleFile()] : [])],
  server: { fs: { allow: [".."] }, port: 5311 },
}));
