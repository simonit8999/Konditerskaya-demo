import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HERO_SLUGS, getGalleryAsset } from '@/assets/gallery';
import { buttonStyles } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { siteContent } from '@/references';
import type { SiteGalleryItem } from '@/types';
import { cn } from '@/utils/cn';

const collagePositions = [
  'left-0 top-0 z-20 w-[72%] -rotate-2',
  'right-0 top-[16%] z-10 w-[46%] rotate-3',
  'bottom-0 left-[8%] z-30 w-[44%] -rotate-1',
];

/** Hero-блок лендинга: B2B-оффер + коллаж из реальных работ. */
export function Hero() {
  const reduceMotion = useReducedMotion();
  const { hero, gallery, brand } = siteContent;

  const photos = HERO_SLUGS.map((slug) => gallery.items.find((item) => item.slug === slug)).filter(
    (item): item is SiteGalleryItem => Boolean(item),
  );

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grain" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -left-24 top-10 size-72 rounded-full bg-blush/40 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-16 top-32 size-80 rounded-full bg-mint/50 blur-3xl"
        aria-hidden="true"
      />

      <div className="container-page relative grid items-center gap-12 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-20">
        <div>
          <motion.p
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 rounded-full border border-caramel/30 bg-cream-50/80 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-caramel-dark"
          >
            <Icon name="sparkle" className="size-3.5" />
            {hero.badge}
          </motion.p>

          <motion.h1
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 font-display text-[clamp(2rem,4.6vw,3.4rem)] font-semibold leading-[1.08] text-cocoa"
          >
            {hero.title}
          </motion.h1>

          <motion.p
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink/80 sm:text-base"
          >
            {hero.subtitle}
          </motion.p>

          <motion.div
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Link to="/builder" className={buttonStyles('primary', 'lg')}>
              <Icon name="cake" className="size-5" />
              {hero.ctaPrimary}
            </Link>
            {/*
              Не <a href="#gallery">: приложение живёт на HashRouter, и браузер
              воспринял бы такой хэш как маршрут /gallery (404). Скроллим секцию вручную.
            */}
            <button
              type="button"
              onClick={() => {
                document.getElementById('gallery')?.scrollIntoView({
                  behavior: reduceMotion ? 'auto' : 'smooth',
                  block: 'start',
                });
              }}
              className={buttonStyles('outline', 'lg')}
            >
              {hero.ctaSecondary}
              <Icon name="arrowRight" className="size-4" />
            </button>
          </motion.div>

          <motion.dl
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-line/70 pt-6"
          >
            {hero.stats.map((stat) => (
              <div key={stat.label}>
                <dd className="font-display text-2xl font-semibold text-caramel-dark">
                  {stat.value}
                </dd>
                <dd className="mt-1 text-xs leading-snug text-ink/60">{stat.label}</dd>
              </div>
            ))}
          </motion.dl>

          {brand.isDemo && (
            <p className="mt-6 flex items-start gap-2 text-xs leading-relaxed text-ink/55">
              <Icon name="info" className="mt-0.5 size-3.5 shrink-0" />
              Демо-режим: цены, контакты и фотографии — примеры, их легко заменить на ваши.
            </p>
          )}
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-lg">
          <div className="relative aspect-[4/5]">
            {photos.map((photo, index) => {
              const asset = getGalleryAsset(photo.slug);
              return (
                <motion.figure
                  key={photo.slug}
                  initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: 0.1 + index * 0.09,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={cn(
                    'absolute overflow-hidden rounded-[1.75rem] border border-white/70 bg-cream-50 p-1.5 shadow-soft',
                    collagePositions[index],
                  )}
                >
                  <img
                    src={asset.src}
                    srcSet={asset.srcSet}
                    sizes="(min-width: 1024px) 320px, 60vw"
                    alt={photo.alt}
                    width={800}
                    height={1000}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    className="w-full rounded-[1.4rem] object-cover"
                    style={{
                      objectPosition: photo.objectPosition,
                      aspectRatio: index === 0 ? '4 / 5' : '3 / 4',
                    }}
                  />
                  <figcaption className="absolute bottom-3 left-3 right-3 truncate rounded-full bg-cream/90 px-3 py-1 text-[11px] font-semibold text-cocoa backdrop-blur">
                    {photo.caption}
                  </figcaption>
                </motion.figure>
              );
            })}

            <span className="absolute -right-3 -top-4 z-40 animate-float text-gold" aria-hidden="true">
              <Icon name="sparkle" className="size-8" />
            </span>
            <span
              className="absolute -bottom-2 right-6 z-40 animate-float-slow text-blush-deep"
              aria-hidden="true"
            >
              <Icon name="sparkle" className="size-6" />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
