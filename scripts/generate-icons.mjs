/**
 * Генератор иконок PWA без сторонних зависимостей.
 *
 * Рисует знак «Кондитерский Рай» (торт со свечой в золотом кольце) попиксельно
 * со сглаживанием (4x supersampling) и кодирует результат в PNG вручную
 * (zlib deflate + CRC32 + чанки IHDR/IDAT/IEND).
 *
 * Запуск: npm run icons
 */
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, '../apps/extension/public/icons');

const CREAM = '#FFF8E1';
const GOLD = '#DAA520';
const CARAMEL = '#C68E17';
const BLUSH = '#FFD1DC';
const MINT = '#E0F2F1';
const BERRY = '#DC143C';
const CANDLE = '#E7C28A';

/* ------------------------------ PNG encoder ------------------------------ */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buffer) {
  let c = 0xffffffff;
  for (let i = 0; i < buffer.length; i += 1) c = CRC_TABLE[(c ^ buffer[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuffer, data]);
  const out = Buffer.alloc(body.length + 8);
  out.writeUInt32BE(data.length, 0);
  body.copy(out, 4);
  out.writeUInt32BE(crc32(body), body.length + 4);
  return out;
}

function encodePng(rgba, width, height) {
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0; // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* -------------------------------- Raster -------------------------------- */

function parseColor(hex) {
  const value = hex.replace('#', '');
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
}

class Raster {
  constructor(size) {
    this.size = size;
    this.data = Buffer.alloc(size * size * 4);
    this.scale = 1;
    this.ox = 0;
    this.oy = 0;
  }

  /** Задаёт систему координат: дизайн рисуется в 512x512. */
  setTransform(artScale, offsetX, offsetY) {
    this.scale = (this.size / 512) * artScale;
    this.ox = offsetX * (this.size / 512);
    this.oy = offsetY * (this.size / 512);
  }

  put(x, y, [r, g, b]) {
    const i = (y * this.size + x) * 4;
    this.data[i] = r;
    this.data[i + 1] = g;
    this.data[i + 2] = b;
    this.data[i + 3] = 255;
  }

  fillAll(color) {
    const [r, g, b] = parseColor(color);
    for (let i = 0; i < this.data.length; i += 4) {
      this.data[i] = r;
      this.data[i + 1] = g;
      this.data[i + 2] = b;
      this.data[i + 3] = 255;
    }
  }

  circle(cx, cy, radius, color) {
    const [r, g, b] = parseColor(color);
    const x0 = Math.floor(this.ox + (cx - radius) * this.scale);
    const x1 = Math.ceil(this.ox + (cx + radius) * this.scale);
    const y0 = Math.floor(this.oy + (cy - radius) * this.scale);
    const y1 = Math.ceil(this.oy + (cy + radius) * this.scale);
    const r2 = radius * radius * this.scale * this.scale;

    for (let y = Math.max(0, y0); y < Math.min(this.size, y1); y += 1) {
      const dy = y + 0.5 - (this.oy + cy * this.scale);
      for (let x = Math.max(0, x0); x < Math.min(this.size, x1); x += 1) {
        const dx = x + 0.5 - (this.ox + cx * this.scale);
        if (dx * dx + dy * dy <= r2) this.put(x, y, [r, g, b]);
      }
    }
  }

  ring(cx, cy, radius, thickness, color) {
    const outer = radius + thickness / 2;
    const inner = radius - thickness / 2;
    const [r, g, b] = parseColor(color);
    const x0 = Math.floor(this.ox + (cx - outer) * this.scale);
    const x1 = Math.ceil(this.ox + (cx + outer) * this.scale);
    const y0 = Math.floor(this.oy + (cy - outer) * this.scale);
    const y1 = Math.ceil(this.oy + (cy + outer) * this.scale);

    for (let y = Math.max(0, y0); y < Math.min(this.size, y1); y += 1) {
      const dy = (y + 0.5 - (this.oy + cy * this.scale)) / this.scale;
      for (let x = Math.max(0, x0); x < Math.min(this.size, x1); x += 1) {
        const dx = (x + 0.5 - (this.ox + cx * this.scale)) / this.scale;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d <= outer && d >= inner) this.put(x, y, [r, g, b]);
      }
    }
  }

  roundRect(x, y, width, height, radius, color) {
    const [r, g, b] = parseColor(color);
    const x0 = Math.floor(this.ox + x * this.scale);
    const x1 = Math.ceil(this.ox + (x + width) * this.scale);
    const y0 = Math.floor(this.oy + y * this.scale);
    const y1 = Math.ceil(this.oy + (y + height) * this.scale);

    for (let py = Math.max(0, y0); py < Math.min(this.size, y1); py += 1) {
      for (let px = Math.max(0, x0); px < Math.min(this.size, x1); px += 1) {
        const dx = (px + 0.5 - (this.ox + x * this.scale)) / this.scale;
        const dy = (py + 0.5 - (this.oy + y * this.scale)) / this.scale;
        const dxEdge = dx < radius ? radius - dx : dx > width - radius ? dx - (width - radius) : 0;
        const dyEdge = dy < radius ? radius - dy : dy > height - radius ? dy - (height - radius) : 0;
        if (dxEdge === 0 || dyEdge === 0) {
          if (dx >= 0 && dx <= width && dy >= 0 && dy <= height) this.put(px, py, [r, g, b]);
        } else if (dxEdge * dxEdge + dyEdge * dyEdge <= radius * radius) {
          this.put(px, py, [r, g, b]);
        }
      }
    }
  }

  ellipse(cx, cy, rx, ry, color) {
    const [r, g, b] = parseColor(color);
    const x0 = Math.floor(this.ox + (cx - rx) * this.scale);
    const x1 = Math.ceil(this.ox + (cx + rx) * this.scale);
    const y0 = Math.floor(this.oy + (cy - ry) * this.scale);
    const y1 = Math.ceil(this.oy + (cy + ry) * this.scale);

    for (let y = Math.max(0, y0); y < Math.min(this.size, y1); y += 1) {
      const dy = (y + 0.5 - (this.oy + cy * this.scale)) / (ry * this.scale);
      for (let x = Math.max(0, x0); x < Math.min(this.size, x1); x += 1) {
        const dx = (x + 0.5 - (this.ox + cx * this.scale)) / (rx * this.scale);
        if (dx * dx + dy * dy <= 1) this.put(x, y, [r, g, b]);
      }
    }
  }

  triangle(ax, ay, bx, by, cx, cy, color) {
    const [r, g, b] = parseColor(color);
    const xs = [ax, bx, cx];
    const ys = [ay, by, cy];
    const minX = Math.max(0, Math.floor(this.ox + Math.min(...xs) * this.scale));
    const maxX = Math.min(this.size - 1, Math.ceil(this.ox + Math.max(...xs) * this.scale));
    const minY = Math.max(0, Math.floor(this.oy + Math.min(...ys) * this.scale));
    const maxY = Math.min(this.size - 1, Math.ceil(this.oy + Math.max(...ys) * this.scale));

    const sign = (px, py, qx, qy, rx, ry) => (px - rx) * (qy - ry) - (qx - rx) * (py - ry);

    for (let y = minY; y <= maxY; y += 1) {
      for (let x = minX; x <= maxX; x += 1) {
        const px = (x + 0.5 - this.ox) / this.scale;
        const py = (y + 0.5 - this.oy) / this.scale;
        const d1 = sign(px, py, ax, ay, bx, by);
        const d2 = sign(px, py, bx, by, cx, cy);
        const d3 = sign(px, py, cx, cy, ax, ay);
        const hasNeg = d1 < 0 || d2 < 0 || d3 < 0;
        const hasPos = d1 > 0 || d2 > 0 || d3 > 0;
        if (!(hasNeg && hasPos)) this.put(x, y, [r, g, b]);
      }
    }
  }

  downscale(factor) {
    const outSize = this.size / factor;
    const out = Buffer.alloc(outSize * outSize * 4);
    for (let y = 0; y < outSize; y += 1) {
      for (let x = 0; x < outSize; x += 1) {
        let r = 0;
        let g = 0;
        let b = 0;
        for (let dy = 0; dy < factor; dy += 1) {
          for (let dx = 0; dx < factor; dx += 1) {
            const i = ((y * factor + dy) * this.size + (x * factor + dx)) * 4;
            r += this.data[i];
            g += this.data[i + 1];
            b += this.data[i + 2];
          }
        }
        const n = factor * factor;
        const o = (y * outSize + x) * 4;
        out[o] = Math.round(r / n);
        out[o + 1] = Math.round(g / n);
        out[o + 2] = Math.round(b / n);
        out[o + 3] = 255;
      }
    }
    return out;
  }
}

/* ------------------------------- Artwork -------------------------------- */

/** Рисует знак «торт со свечой» в координатах 512x512. */
function drawMark(raster, { withRing }) {
  if (withRing) raster.ring(256, 256, 232, 16, GOLD);

  // Подставка
  raster.roundRect(126, 372, 260, 20, 10, CARAMEL);

  // Нижний ярус: бисквит + крем
  raster.roundRect(152, 322, 208, 58, 14, CARAMEL);
  raster.roundRect(158, 328, 196, 52, 11, BLUSH);
  raster.ellipse(256, 330, 98, 22, CREAM);
  raster.circle(190, 344, 20, CREAM);
  raster.circle(256, 352, 22, CREAM);
  raster.circle(322, 344, 20, CREAM);

  // Верхний ярус
  raster.roundRect(182, 262, 148, 56, 12, CARAMEL);
  raster.roundRect(188, 268, 136, 50, 9, BLUSH);
  raster.ellipse(256, 270, 68, 16, CREAM);
  raster.circle(216, 282, 14, CREAM);
  raster.circle(296, 282, 14, CREAM);

  // Ягоды
  raster.circle(196, 264, 13, MINT);
  raster.ring(196, 264, 13, 4, CARAMEL);
  raster.circle(316, 264, 13, MINT);
  raster.ring(316, 264, 13, 4, CARAMEL);

  // Свеча и пламя
  raster.roundRect(246, 168, 20, 100, 8, CANDLE);
  raster.roundRect(246, 196, 20, 10, 4, CARAMEL);
  raster.ellipse(256, 146, 20, 24, BERRY);
  raster.triangle(256, 96, 238, 152, 274, 152, BERRY);
}

/* -------------------------------- Build --------------------------------- */

function buildIcon(size, { artScale = 1, withRing = true } = {}) {
  const supersample = 4;
  const raster = new Raster(size * supersample);
  raster.fillAll(CREAM);
  raster.setTransform(artScale, (512 * (1 - artScale)) / 2, (512 * (1 - artScale)) / 2);
  drawMark(raster, { withRing });
  return encodePng(raster.downscale(supersample), size, size);
}

const targets = [
  { file: 'icon-192.png', size: 192, options: { artScale: 1 } },
  { file: 'icon-512.png', size: 512, options: { artScale: 1 } },
  // maskable: рисунок в безопасной зоне ~62%, без внешнего кольца (его срежет маска ОС)
  { file: 'maskable-512.png', size: 512, options: { artScale: 0.62, withRing: false } },
  { file: 'apple-touch-icon.png', size: 180, options: { artScale: 0.92, withRing: false } },
  { file: 'favicon-32.png', size: 32, options: { artScale: 1.04, withRing: false } },
];

mkdirSync(OUT_DIR, { recursive: true });

for (const target of targets) {
  const png = buildIcon(target.size, target.options);
  writeFileSync(resolve(OUT_DIR, target.file), png);
  console.log(`+ ${target.file}  ${target.size}x${target.size}  ${(png.length / 1024).toFixed(1)} KB`);
}

console.log(`\nИконки готовы: ${OUT_DIR}`);
