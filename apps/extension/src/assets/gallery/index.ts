/**
 * Оптимизированные фотографии работ (WebP, 800w + 400w).
 * Сгенерированы из исходников скриптом `npm run images`.
 */
import car400 from './cake-car-400.webp';
import car800 from './cake-car.webp';
import corpseBride400 from './cake-corpse-bride-400.webp';
import corpseBride800 from './cake-corpse-bride.webp';
import dailyBugle400 from './cake-daily-bugle-400.webp';
import dailyBugle800 from './cake-daily-bugle.webp';
import dota400 from './cake-dota-400.webp';
import dota800 from './cake-dota.webp';
import sixteen400 from './cake-16-400.webp';
import sixteen800 from './cake-16.webp';
import mercedes400 from './cake-mercedes-400.webp';
import mercedes800 from './cake-mercedes.webp';
import mia400 from './cake-mia-30-400.webp';
import mia800 from './cake-mia-30.webp';
import monster400 from './cake-monster-400.webp';
import monster800 from './cake-monster.webp';
import sushi400 from './cake-sushi-400.webp';
import sushi800 from './cake-sushi.webp';

export interface GalleryAsset {
  src: string;
  srcSet: string;
}

const asset = (large: string, small: string): GalleryAsset => ({
  src: large,
  srcSet: `${small} 400w, ${large} 800w`,
});

export const galleryAssets: Record<string, GalleryAsset> = {
  'cake-dota': asset(dota800, dota400),
  'cake-car': asset(car800, car400),
  'cake-mia-30': asset(mia800, mia400),
  'cake-mercedes': asset(mercedes800, mercedes400),
  'cake-monster': asset(monster800, monster400),
  'cake-daily-bugle': asset(dailyBugle800, dailyBugle400),
  'cake-corpse-bride': asset(corpseBride800, corpseBride400),
  'cake-16': asset(sixteen800, sixteen400),
  'cake-sushi': asset(sushi800, sushi400),
};

/** Фото для коллажа в hero: основной кадр + два акцента. */
export const HERO_SLUGS = ['cake-dota', 'cake-car', 'cake-mia-30'] as const;

export function getGalleryAsset(slug: string): GalleryAsset {
  return galleryAssets[slug] ?? { src: '', srcSet: '' };
}
