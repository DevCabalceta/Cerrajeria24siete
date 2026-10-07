// Generates the social preview image and the PNG/ICO icons into public/.
//
//   npm run build && npm run og
//
// It serves dist/ locally and opens it in headless Chrome with JavaScript off,
// so the keyring is the server-rendered SVG at rest and the type is the real,
// self-hosted Geist. Set CHROME_PATH if Chrome is not in a default location.
//
// Outputs (commit them; they are static):
//   public/og-image.jpg            1200×630, Open Graph / WhatsApp / X preview
//   public/apple-touch-icon.png    180×180, full-bleed (iOS rounds it)
//   public/icon-192.png            192×192, rounded (manifest "any")
//   public/icon-512.png            512×512, rounded (manifest "any")
//   public/icon-maskable-512.png   512×512, full-bleed with safe zone (manifest "maskable")
//   public/favicon.ico             16 + 32 px PNGs, for crawlers that ignore SVG icons
import { createReadStream, existsSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = join(root, 'dist');
const pub = join(root, 'public');

if (!existsSync(join(dist, 'index.html'))) {
  console.error('dist/ not found: run `npm run build` first.');
  process.exit(1);
}

const chrome =
  process.env.CHROME_PATH ??
  [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ].find((path) => existsSync(path));
if (!chrome) {
  console.error('Chrome not found: set CHROME_PATH.');
  process.exit(1);
}

/* Tiny static server for dist/ (absolute /_astro/ URLs need a real origin). */
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.webp': 'image/webp' };
const server = createServer((req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^([/\\])+/, '');
  const file = join(dist, path.endsWith('/') || path === '' ? join(path, 'index.html') : path);
  if (!file.startsWith(dist) || !existsSync(file)) return res.writeHead(404).end();
  res.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).pipe(res);
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

const browser = await puppeteer.launch({ executablePath: chrome, headless: true });
const page = await browser.newPage();
await page.setJavaScriptEnabled(false);

/* ── Open Graph image ─────────────────────────────────────────── */

await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
await page.goto(`${origin}/`, { waitUntil: 'networkidle0' });

await page.evaluate(() => {
  const keyring = document.querySelector('#inicio svg[role="img"]').outerHTML;
  const mark = document
    .querySelector('header a[href="#inicio"] svg')
    .outerHTML.replace('size-8', '')
    .replace('<svg', '<svg width="44" height="44"');
  document.body.innerHTML = `
    <div id="og" style="position:relative;width:1200px;height:630px;overflow:hidden;background:#f5f5f1;color:#0a0f1a;font-family:var(--font-sans)">
      <div style="position:absolute;inset:0 0 0 auto;width:560px;background:radial-gradient(circle,rgb(10 15 26/.13) 1px,transparent 1.3px) 0 0/22px 22px;-webkit-mask-image:radial-gradient(ellipse 62% 58% at 55% 46%,black,transparent)"></div>
      <div style="position:absolute;top:-6px;right:58px;width:440px;height:560px">${keyring}</div>

      <div style="position:absolute;left:72px;top:64px;display:flex;align-items:center;gap:14px">
        ${mark}
        <span style="font-size:23px;font-weight:500;letter-spacing:-0.03em">Cerrajería<span style="color:#5c6371">24siete</span></span>
      </div>

      <div style="position:absolute;left:72px;top:150px;display:inline-flex;align-items:center;gap:10px;height:38px;padding:0 16px;border-radius:999px;background:rgb(10 15 26/.045);font-size:16px;letter-spacing:-0.01em;color:#5c6371">
        <span style="width:8px;height:8px;border-radius:50%;background:#17a34a;box-shadow:0 0 0 4px rgb(23 163 74/.18)"></span>
        <span style="color:#0a0f1a;font-weight:500">Disponible ahora</span><span style="color:rgb(10 15 26/.25)">·</span>Emergencias 24/7
      </div>

      <h1 style="position:absolute;left:68px;top:212px;margin:0;font-size:76px;line-height:.95;font-weight:500;letter-spacing:-0.045em">
        <span style="display:block;padding-bottom:.06em">Su cerrajería</span>
        <span style="display:block;padding-bottom:.06em">de confianza,</span>
        <span style="display:block;padding-bottom:.06em;color:#5c6371">24 horas, 7 días.</span>
      </h1>

      <div style="position:absolute;left:72px;right:72px;bottom:56px;display:flex;align-items:flex-end;justify-content:space-between;border-top:1px solid #e2e2dc;padding-top:22px">
        <span style="display:flex;flex-direction:column;gap:6px">
          <span style="font-family:var(--font-mono);font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#5c6371">Llame o escriba por WhatsApp</span>
          <span style="font-size:34px;font-weight:500;letter-spacing:-0.03em;font-variant-numeric:tabular-nums">+506 8355 7575</span>
        </span>
        <span style="font-family:var(--font-mono);font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#5c6371;text-align:right;line-height:1.6">
          Heredia · San José · Alajuela<br/><span style="color:#0a0f1a">A domicilio en todo Costa Rica</span>
        </span>
      </div>
    </div>`;
  document.body.style.margin = '0';
});
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: join(pub, 'og-image.jpg'), type: 'jpeg', quality: 88, clip: { x: 0, y: 0, width: 1200, height: 630 } });

/* ── Icons ────────────────────────────────────────────────────── */

const MARK = `
  <circle cx="16" cy="16" r="9.25" fill="none" stroke="#f5f5f1" stroke-opacity=".25" stroke-width="1.25"/>
  <path d="M16 11.1a2.8 2.8 0 0 1 1.45 5.2l.75 4.2h-4.4l.75-4.2A2.8 2.8 0 0 1 16 11.1Z" fill="#f5f5f1"/>`;

/** rounded: favicon shape with transparent corners; scale < 1 shrinks the mark into a safe zone. */
const icon = (size, { rounded, scale = 1 }) => `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="${size}" height="${size}" style="display:block">
    <rect width="32" height="32" ${rounded ? 'rx="9"' : ''} fill="#0a0f1a"/>
    <g transform="translate(16 16) scale(${scale}) translate(-16 -16)">${MARK}</g>
  </svg>`;

async function png(size, options) {
  await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
  await page.setContent(`<body style="margin:0;background:transparent">${icon(size, options)}</body>`);
  return page.screenshot({ type: 'png', omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } });
}

writeFileSync(join(pub, 'apple-touch-icon.png'), await png(180, { rounded: false, scale: 1.15 }));
writeFileSync(join(pub, 'icon-192.png'), await png(192, { rounded: true }));
writeFileSync(join(pub, 'icon-512.png'), await png(512, { rounded: true }));
writeFileSync(join(pub, 'icon-maskable-512.png'), await png(512, { rounded: false, scale: 0.95 }));

/* favicon.ico: an ICO container holding PNG images (supported everywhere since Vista). */
const images = [await png(16, { rounded: true }), await png(32, { rounded: true })];
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(images.length, 4);
let offset = 6 + 16 * images.length;
const entries = images.map((data, i) => {
  const size = [16, 32][i];
  const entry = Buffer.alloc(16);
  entry.writeUInt8(size, 0);
  entry.writeUInt8(size, 1);
  entry.writeUInt16LE(1, 4); // colour planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(data.length, 8);
  entry.writeUInt32LE(offset, 12);
  offset += data.length;
  return entry;
});
writeFileSync(join(pub, 'favicon.ico'), Buffer.concat([header, ...entries, ...images]));

await browser.close();
server.close();
console.log('OG image and icons written to public/.');
