import { Link } from 'react-router-dom';
import { buttonStyles } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Reveal } from '@/components/ui/Reveal';
import { siteContent } from '@/references';
import { formatPrice } from '@/utils/formatPrice';

/** Доставка и оплата: условия витрины (демо-данные из siteContent.json). */
export function DeliveryPage() {
  const { delivery, contacts } = siteContent;

  const blocks = [
    {
      icon: 'truck' as const,
      title: 'Доставка по городу',
      rows: [
        `Стоимость — от ${formatPrice(delivery.fee)}`,
        `Бесплатно при заказе от ${formatPrice(delivery.freeFrom)}`,
        `Интервал доставки — ${delivery.intervalHours} часа`,
      ],
    },
    {
      icon: 'mapPin' as const,
      title: 'Самовывоз',
      rows: [delivery.pickupAddress, delivery.pickupHours, 'Бесплатно, без ожидания курьера'],
    },
    {
      icon: 'clock' as const,
      title: 'Сроки',
      rows: [
        `Заказ минимум за ${delivery.minLeadHours} часа`,
        'Сложный декор — за 48 часов',
        'Срочные заказы — по согласованию',
      ],
    },
  ];

  return (
    <div className="container-page py-10 lg:py-14">
      <header className="max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-caramel">Условия</p>
        <h1 className="mt-2 font-display text-[clamp(1.9rem,4vw,2.75rem)] leading-tight text-cocoa">
          Доставка и оплата
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink/70">{delivery.lead}</p>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {blocks.map((block, index) => (
          <Reveal key={block.title} delay={index * 0.07} className="h-full">
            <article className="h-full rounded-3xl border border-line bg-cream-50 p-5 shadow-card">
              <span className="flex size-10 items-center justify-center rounded-full bg-mint text-caramel">
                <Icon name={block.icon} className="size-5" />
              </span>
              <h2 className="mt-3 font-display text-lg text-cocoa">{block.title}</h2>
              <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-ink/70">
                {block.rows.map((row) => (
                  <li key={row}>· {row}</li>
                ))}
              </ul>
            </article>
          </Reveal>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Reveal>
          <section className="rounded-3xl border border-line bg-cream-50 p-5 shadow-card">
            <h2 className="font-display text-lg text-cocoa">Оплата</h2>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink/75">
              {delivery.payment.map((option) => (
                <li key={option} className="flex items-start gap-2">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-gold/20 text-caramel-dark">
                    <Icon name="check" className="size-3" />
                  </span>
                  {option}
                </li>
              ))}
            </ul>
          </section>
        </Reveal>

        <Reveal delay={0.08}>
          <section className="rounded-3xl border border-mint-deep/60 bg-mint-soft p-5">
            <h2 className="font-display text-lg text-cocoa">Важно знать</h2>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink/75">
              {delivery.notes.map((note) => (
                <li key={note}>· {note}</li>
              ))}
              <li>· {delivery.storage}</li>
            </ul>
          </section>
        </Reveal>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link to="/builder" className={buttonStyles('primary', 'lg')}>
          <Icon name="cart" className="size-5" />
          Собрать торт
        </Link>
        <a
          href={contacts.telegramHref}
          target="_blank"
          rel="noreferrer"
          className={buttonStyles('outline', 'lg')}
        >
          <Icon name="telegram" className="size-4" />
          Уточнить условия
        </a>
      </div>
    </div>
  );
}
