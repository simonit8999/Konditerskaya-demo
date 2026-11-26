import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getGalleryAsset } from '@/assets/gallery';
import { buttonStyles } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { siteContent } from '@/references';
import type { SiteGalleryItem } from '@/types';
import { cn } from '@/utils/cn';

function GalleryCard({ item }: { item: SiteGalleryItem }) {
  const asset = getGalleryAsset(item.slug);

  return (
    <motion.li
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        to="/builder"
        className="group relative block overflow-hidden rounded-3xl border border-line bg-cream-100 shadow-card transition-shadow duration-300 hover:shadow-soft"
      >
        <div className="aspect-[4/5] overflow-hidden">
          <img
            src={asset.src}
            srcSet={asset.srcSet}
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 45vw, 90vw"
            alt={item.alt}
            width={800}
            height={1000}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-700 ease-silk group-hover:scale-[1.04]"
            style={{ objectPosition: item.objectPosition }}
          />
        </div>

        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-cocoa-dark/60 via-transparent to-transparent"
          aria-hidden="true"
        />

        <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white drop-shadow">{item.caption}</p>
            <p className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-white/85">
              <Icon name="sparkle" className="size-3" />
              Собрать похожий
            </p>
          </div>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-cream/90 text-cocoa transition-transform duration-300 group-hover:rotate-45">
            <Icon name="arrowRight" className="size-4" />
          </span>
        </div>
      </Link>
    </motion.li>
  );
}

/** Галерея работ с фильтрами — «витрина, которую видят клиенты». */
export function GallerySection() {
  const { gallery } = siteContent;
  const [filter, setFilter] = useState('all');

  const items =
    filter === 'all' ? gallery.items : gallery.items.filter((item) => item.tag === filter);

  return (
    <section id="gallery" className="container-page scroll-mt-24 py-12 lg:py-16">
      <SectionTitle
        eyebrow="Портфолио"
        title={gallery.title}
        description={gallery.subtitle}
        action={
          <Link to="/builder" className={buttonStyles('outline', 'md')}>
            <Icon name="cake" className="size-4" />
            Собрать свой торт
          </Link>
        }
      />

      <div
        className="no-scrollbar mt-7 flex gap-2 overflow-x-auto pb-1"
        role="tablist"
        aria-label="Фильтр работ"
      >
        {gallery.filters.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={filter === item.id}
            onClick={() => setFilter(item.id)}
            className={cn(
              'shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors',
              filter === item.id
                ? 'border-caramel bg-gold/20 text-cocoa'
                : 'border-line bg-cream-50 text-ink/70 hover:border-caramel/50 hover:text-cocoa',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <motion.ul layout className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <GalleryCard key={item.slug} item={item} />
          ))}
        </AnimatePresence>
      </motion.ul>

      <p className="mt-5 text-xs leading-relaxed text-ink/55">{gallery.note}</p>
    </section>
  );
}
