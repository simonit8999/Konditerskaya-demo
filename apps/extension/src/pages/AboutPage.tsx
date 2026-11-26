import { Link } from 'react-router-dom';
import { getGalleryAsset } from '@/assets/gallery';
import { buttonStyles } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Reveal } from '@/components/ui/Reveal';
import { siteContent } from '@/references';

/** О платформе: миссия, цифры, принципы и пара работ из витрины. */
export function AboutPage() {
  const { about, brand, gallery } = siteContent;
  const photos = gallery.items.filter((item) => item.featured).slice(0, 3);

  return (
    <div className="container-page py-10 lg:py-14">
      <header className="max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-caramel">
          {brand.latinName}
        </p>
        <h1 className="mt-2 font-display text-[clamp(1.9rem,4vw,2.75rem)] leading-tight text-cocoa">
          {about.title}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink/80">{about.lead}</p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <Reveal>
          <div className="space-y-4 text-sm leading-relaxed text-ink/75">
            {about.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <dl className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {about.numbers.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-line bg-cream-50 px-4 py-3 shadow-card"
              >
                <dd className="font-display text-2xl font-semibold text-caramel-dark">
                  {item.value}
                </dd>
                <dd className="mt-1 text-xs leading-snug text-ink/60">{item.label}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>

      <section className="mt-10">
        <h2 className="font-display text-xl text-cocoa">Наши принципы</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {about.values.map((value, index) => (
            <Reveal key={value.title} delay={index * 0.07} className="h-full">
              <article className="h-full rounded-3xl border border-line bg-cream-50 p-5 shadow-card">
                <span className="flex size-10 items-center justify-center rounded-full bg-blush-soft text-caramel">
                  <Icon name={index === 0 ? 'clock' : index === 1 ? 'palette' : 'leaf'} className="size-5" />
                </span>
                <h3 className="mt-3 font-display text-lg text-cocoa">{value.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/70">{value.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl text-cocoa">Как это выглядит на витрине</h2>
        <p className="mt-2 text-sm text-ink/65">
          Фотографии работ — реальный контент витрины, который вы замените на свой.
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {photos.map((photo) => {
            const asset = getGalleryAsset(photo.slug);
            return (
              <li key={photo.slug} className="overflow-hidden rounded-3xl border border-line bg-cream-100">
                <img
                  src={asset.src}
                  srcSet={asset.srcSet}
                  sizes="(min-width: 640px) 30vw, 90vw"
                  alt={photo.alt}
                  width={800}
                  height={1000}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/5] w-full object-cover"
                  style={{ objectPosition: photo.objectPosition }}
                />
              </li>
            );
          })}
        </ul>
      </section>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link to="/builder" className={buttonStyles('primary', 'lg')}>
          <Icon name="cake" className="size-5" />
          Попробовать конструктор
        </Link>
        <Link to="/contacts" className={buttonStyles('outline', 'lg')}>
          Связаться с нами
        </Link>
      </div>
    </div>
  );
}
