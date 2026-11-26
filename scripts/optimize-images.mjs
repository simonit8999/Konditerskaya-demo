/**
 * Оптимизация фотографий тортов: JPG -> WebP (два размера для srcSet).
 *
 * Запуск: npm run images
 *
 * Что делает:
 *  1. Берёт исходники из корня репозитория или из assets-source/photos.
 *  2. Конвертирует в WebP: 800w (карточки/hero) и 400w (превью/миниатюры).
 *  3. Переносит использованные исходники в assets-source/photos,
 *     чтобы корень проекта оставался чистым.
 *
 * sharp — dev-зависимость, в бандл приложения не попадает.
 */
import sharp from 'sharp';
import { mkdir, rename, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const SOURCE_DIR = join(REPO_ROOT, 'assets-source', 'photos');
const OUT_DIR = join(REPO_ROOT, 'apps', 'extension', 'src', 'assets', 'gallery');

/** Исходные файлы, выданные заказчиком, и их «человеческие» имена. */
const PHOTOS = [
  { slug: 'cake-dota', file: 'de17ab4a58e4ac0facbe0719f6daca85.jpg' },
  { slug: 'cake-car', file: 'cb54522ed15aabdfa31b324712b6901e.jpg' },
  { slug: 'cake-mia-30', file: '4ad2fe7ed7ff699a7957b5472e6122f1.jpg' },
  { slug: 'cake-mercedes', file: 'f8ae901e549d192aecf6c662a31ea7a3.jpg' },
  { slug: 'cake-monster', file: '554d6bc864be9aef54f18b8528097b68.jpg' },
  { slug: 'cake-daily-bugle', file: '4e2b912df328d727e6d1382a30af08e8.jpg' },
  { slug: 'cake-corpse-bride', file: 'dffe4af63ba96f0bc179775a8ade00cb.jpg' },
  { slug: 'cake-16', file: '3c6230e1c27be771d48bc55f11fce40a.jpg' },
  { slug: 'cake-sushi', file: '5fb4a8bbdb009754aa7ab3ad41bba28d.jpg' },
];

const SIZES = [
  { suffix: '', width: 800, quality: 78 },
  { suffix: '-400', width: 400, quality: 74 },
];

async function findSource(file) {
  const inRoot = join(REPO_ROOT, file);
  if (existsSync(inRoot)) return inRoot;
  const inSource = join(SOURCE_DIR, file);
  if (existsSync(inSource)) return inSource;
  return null;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(SOURCE_DIR, { recursive: true });

  let converted = 0;
  let totalBytes = 0;
  const missing = [];

  for (const photo of PHOTOS) {
    const sourcePath = await findSource(photo.file);
    if (!sourcePath) {
      missing.push(photo.file);
      continue;
    }

    for (const size of SIZES) {
      const outFile = join(OUT_DIR, `${photo.slug}${size.suffix}.webp`);
      await sharp(sourcePath)
        .rotate() // учитываем EXIF-ориентацию
        .resize({ width: size.width, withoutEnlargement: true })
        .webp({ quality: size.quality, effort: 5 })
        .toFile(outFile);
      const info = await stat(outFile);
      totalBytes += info.size;
      console.log(`+ ${photo.slug}${size.suffix}.webp  ${size.width}w  ${(info.size / 1024).toFixed(0)} KB`);
    }

    // Переносим исходник, если он лежал в корне репозитория
    if (sourcePath === join(REPO_ROOT, photo.file)) {
      await rename(sourcePath, join(SOURCE_DIR, photo.file));
    }
    converted += 1;
  }

  console.log(`\nГотово: ${converted}/${PHOTOS.length} фото, ${(totalBytes / 1024).toFixed(0)} KB WebP суммарно`);
  if (missing.length > 0) {
    console.warn(`\nНе найдены исходники (пропущены):\n - ${missing.join('\n - ')}`);
    console.warn('Положите файлы в assets-source/photos/ и повторите npm run images.');
    process.exitCode = 0;
  }
}

main().catch((error) => {
  console.error('Ошибка оптимизации изображений:', error);
  process.exitCode = 1;
});
