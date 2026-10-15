// Görsel denetim betiği: `npm run shots -- <bileşen-adı> [...]`
// Galeriyi açar, her bileşenin bölümünü 1400 px ve 390 px genişlikte shots/ klasörüne PNG olarak kaydeder.
// Yeni paket gerektirmez: makinedeki Chrome ya da Edge'i uzaktan hata ayıklama kapısıyla sürer (Node'un yerleşik WebSocket'i).
// Tarayıcı yolu bulunamazsa SNN_BROWSER ortam değişkeniyle verilir. Kaydedilen klasör git'e girmez (.gitignore).
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { components } from "./catalog.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const WIDTHS = [1400, 390];
const names = process.argv.slice(2).filter(arg => !arg.startsWith("-"));
const known = new Set(components.map(item => item.name));

if (!names.length) {
  console.error("Kullanım: npm run shots -- <bileşen-adı> [<bileşen-adı> ...]\nÖrnek: npm run shots -- usage-pricing bar-chart");
  process.exit(1);
}
const unknown = names.filter(name => !known.has(name));
if (unknown.length) {
  console.error(`Katalogda yok: ${unknown.join(", ")}. Adlar scripts/catalog.mjs içindedir.`);
  process.exit(1);
}

function findBrowser() {
  const candidates = [
    process.env.SNN_BROWSER,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ];
  return candidates.find(candidate => candidate && existsSync(candidate));
}

const browserPath = findBrowser();
if (!browserPath) {
  console.error("Chrome ya da Edge bulunamadı. SNN_BROWSER ortam değişkenine tarayıcının yolunu yaz.");
  process.exit(1);
}

const children = [];
function cleanup() {
  for (const child of children) {
    try { child.kill(); } catch { /* süreç zaten kapanmış */ }
  }
}
process.on("exit", cleanup);
process.on("SIGINT", () => process.exit(130));

/** Galeri sunucusunu ayrı bir kapıda açar (başka oturumların sunucusuna dokunmaz) ve adresini döndürür. */
function startGallery() {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(root, "playground", "node_modules", "vite", "bin", "vite.js"), "--host", "127.0.0.1", "--port", "5611"], { cwd: path.join(root, "playground") });
    children.push(child);
    let output = "";
    const onData = chunk => {
      output += chunk.toString();
      const match = output.replace(/\x1b\[[0-9;]*m/g, "").match(/Local:\s+(http:\/\/\S+?)\/?\s/);
      if (match) resolve(match[1]);
    };
    child.stdout.on("data", onData);
    child.stderr.on("data", onData);
    child.on("exit", code => reject(new Error(`Galeri sunucusu kapandı (kod ${code}):\n${output}`)));
    setTimeout(() => reject(new Error(`Galeri 30 sn içinde açılmadı:\n${output}`)), 30000);
  });
}

/** Tarayıcıyı başlatır, hata ayıklama kapısına bağlanır; basit bir komut gönderici döndürür. */
async function startBrowser() {
  const profile = mkdtempSync(path.join(tmpdir(), "snn-shots-"));
  const port = 9333;
  const child = spawn(browserPath, [`--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "--headless=new", "--hide-scrollbars", "--no-first-run", "--disable-gpu", "about:blank"], { stdio: "ignore" });
  children.push(child);
  let target;
  for (let attempt = 0; attempt < 60 && !target; attempt++) {
    await new Promise(resolve => setTimeout(resolve, 250));
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
      target = list.find(item => item.type === "page");
    } catch { /* tarayıcı henüz hazır değil */ }
  }
  if (!target) throw new Error("Tarayıcıya bağlanılamadı.");
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let counter = 0;
  const waiting = new Map();
  socket.onmessage = event => {
    const message = JSON.parse(event.data);
    const handler = waiting.get(message.id);
    if (!handler) return;
    waiting.delete(message.id);
    message.error ? handler.reject(new Error(message.error.message)) : handler.resolve(message.result);
  };
  return (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++counter;
    waiting.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const evaluate = async (send, expression) => (await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })).result.value;

try {
  const [baseUrl, send] = await Promise.all([startGallery(), startBrowser()]);
  const outDir = path.join(root, "shots");
  mkdirSync(outDir, { recursive: true });
  await send("Page.enable");
  for (const width of WIDTHS) {
    await send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: width < 600 });
    await send("Page.navigate", { url: `${baseUrl}/#${names[0]}` });
    await sleep(1500);
    await evaluate(send, "document.fonts.ready.then(() => true)");
    const fonts = await evaluate(send, "[...new Set([...document.fonts].filter(f => f.status === 'loaded').map(f => f.family))].join(', ')");
    for (const name of names) {
      // Bölüm kaydırılıp görünür yapılır ki geç yüklenen içerik ve görünüşe bağlı hareketler otursun.
      const box = await evaluate(send, `(async () => {
        const el = document.getElementById(${JSON.stringify(name)});
        el.scrollIntoView({ block: "start" });
        await new Promise(resolve => setTimeout(resolve, 1200));
        const rect = el.getBoundingClientRect();
        return { x: rect.left + scrollX, y: rect.top + scrollY, width: rect.width, height: rect.height };
      })()`);
      const { data } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { ...box, scale: 1 } });
      const file = path.join(outDir, `${name}-${width}.png`);
      writeFileSync(file, Buffer.from(data, "base64"));
      console.log(`${path.relative(root, file)}  (${Math.round(box.width)}x${Math.round(box.height)}; yüklü yazı tipleri: ${fonts || "YOK"})`);
    }
  }
} finally {
  cleanup();
}
process.exit(0);
