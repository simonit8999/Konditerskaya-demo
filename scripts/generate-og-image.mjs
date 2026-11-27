/**
 * Генерирует картинку превью для OG-тегов: apps/extension/public/og-image.png
 *
 * Почему SVG-фигуры, а не текст: libvips/rsvg в `sharp` не гарантирует
 * кириллические шрифты на CI — вместо «квадратиков» рисуем композицию
 * без надписей. Тексты превью всё равно берутся из `og:title`/`og:description`.
 *
 * Запуск: npm run og:image
 */
import { mkdir, stat, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = resolve(__dirname, '..', 'apps', 'extension', 'public', 'og-image.png');

const WIDTH = 1200;
const HEIGHT = 630;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#E8BE55" />
      <stop offset="100%" stop-color="#C68E17" />
    </linearGradient>
    <radialGradient id="blushGlow" cx="0.12" cy="0.04" r="0.95">
      <stop offset="0%" stop-color="#FFD1DC" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#FFD1DC" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="mintGlow" cx="0.92" cy="0.06" r="0.85">
      <stop offset="0%" stop-color="#A9D6D2" stop-opacity="0.75" />
      <stop offset="100%" stop-color="#A9D6D2" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="goldGlow" cx="0.78" cy="0.55" r="0.55">
      <stop offset="0%" stop-color="#DAA520" stop-opacity="0.22" />
      <stop offset="100%" stop-color="#DAA520" stop-opacity="0" />
    </radialGradient>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="#FFF8E1" />
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#blushGlow)" />
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#mintGlow)" />
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#goldGlow)" />

  <circle cx="930" cy="330" r="232" fill="#FFFFFF" opacity="0.42" />
  <circle
    cx="930"
    cy="330"
    r="196"
    fill="none"
    stroke="#C68E17"
    stroke-opacity="0.32"
    stroke-width="3"
    stroke-dasharray="12 14"
  />

  <g fill="none" stroke="url(#gold)" stroke-width="11" stroke-linecap="round" stroke-linejoin="round">
    <path d="M790 478h280" />
    <path d="M828 478v-72a14 14 0 0 1 14-14h184a14 14 0 0 1 14 14v72" />
    <path d="M828 424c12 11 24 11 36 0s24-11 36 0 24 11 36 0 24-11 36 0 24 11 36 0 24-11 36 0" />
    <path d="M866 392v-60a14 14 0 0 1 14-14h100a14 14 0 0 1 14 14v60" />
    <path d="M866 352c10 9 20 9 30 0s20-9 30 0 20 9 30 0 20-9 30 0" />
    <path d="M930 318v-46" />
    <path d="M930 272c11 0 17-9 17-18 0-11-8-17-17-30-9 13-17 19-17 30 0 9 6 18 17 18Z" />
  </g>

  <g fill="#DC143C" opacity="0.5">
    <circle cx="812" cy="336" r="8" />
    <circle cx="1048" cy="352" r="6" />
  </g>
  <g fill="#C68E17" opacity="0.45">
    <circle cx="150" cy="520" r="10" />
    <circle cx="192" cy="556" r="6" />
    <circle cx="238" cy="512" r="4" />
  </g>
</svg>`;

await mkdir(dirname(OUTPUT), { recursive: true });

const buffer = await sharp(Buffer.from(svg, 'utf8'))
  .png({ compressionLevel: 9, effort: 7 })
  .toBuffer();

await writeFile(OUTPUT, buffer);

const { size } = await stat(OUTPUT);
console.log(`og-image.png: ${WIDTH}×${HEIGHT}, ${(size / 1024).toFixed(1)} КБ -> ${OUTPUT}`);
