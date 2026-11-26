import { Icon } from '@/components/ui/Icon';
import type { IconName } from '@/components/ui/Icon';
import { Reveal } from '@/components/ui/Reveal';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { siteContent } from '@/references';

const ICON_MAP: Record<string, IconName> = {
  cake: 'cake',
  cupcake: 'cupcake',
  calculator: 'calculator',
  telegram: 'telegram',
  whatsapp: 'whatsapp',
  clock: 'clock',
  palette: 'palette',
  truck: 'truck',
  gift: 'gift',
  sparkle: 'sparkle',
};

/** Блок преимуществ для кондитера: 4 карточки с контурными иконками. */
export function FeatureGrid() {
  const { features } = siteContent;

  return (
    <section className="container-page py-12 lg:py-16" aria-labelledby="features-title">
      <SectionTitle
        eyebrow="Почему кондитеры выбирают нас"
        title="Меньше рутины — больше заказов"
        description="Платформа берёт на себя расчёт цены, сбор состава и передачу заказа. Вы занимаетесь тортами, а не перепиской."
      />

      <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((feature, index) => (
          <Reveal key={feature.title} delay={index * 0.07} className="h-full">
            <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-cream-50 p-5 shadow-card transition-all duration-300 ease-silk hover:-translate-y-1 hover:shadow-soft">
              <span
                className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-blush/40 blur-2xl transition-opacity duration-300 group-hover:opacity-80"
                aria-hidden="true"
              />
              <span className="relative flex size-11 items-center justify-center rounded-2xl bg-gold/15 text-caramel transition-colors group-hover:bg-gold/25">
                <Icon name={ICON_MAP[feature.icon] ?? 'sparkle'} className="size-6" />
              </span>
              <h3 className="relative mt-4 font-display text-lg leading-snug text-cocoa">
                {feature.title}
              </h3>
              <p className="relative mt-2 text-sm leading-relaxed text-ink/70">{feature.text}</p>
            </article>
          </Reveal>
        ))}
      </div>
      <span id="features-title" className="sr-only">
        Преимущества платформы
      </span>
    </section>
  );
}
