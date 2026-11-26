import { Icon } from '@/components/ui/Icon';
import { Reveal } from '@/components/ui/Reveal';
import { siteContent } from '@/references';

/** Контакты: плейсхолдеры демо-версии + карта-заглушка и мессенджеры. */
export function ContactsPage() {
  const { contacts } = siteContent;

  const cards = [
    { icon: 'mapPin' as const, title: 'Адрес', value: contacts.address, href: contacts.mapHref, external: true },
    { icon: 'phone' as const, title: 'Телефон', value: contacts.phone, href: contacts.phoneHref },
    { icon: 'mail' as const, title: 'Email', value: contacts.email, href: `mailto:${contacts.email}` },
    { icon: 'clock' as const, title: 'Часы работы', value: contacts.hours },
  ];

  return (
    <div className="container-page py-10 lg:py-14">
      <header className="max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-caramel">Связаться</p>
        <h1 className="mt-2 font-display text-[clamp(1.9rem,4vw,2.75rem)] leading-tight text-cocoa">
          Контакты
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink/70">
          Напишите в удобный мессенджер — ответим в рабочее время. {contacts.mapNote}
        </p>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          <div className="grid gap-3 sm:grid-cols-2">
            {cards.map((card) => {
              const content = (
                <>
                  <span className="flex size-10 items-center justify-center rounded-full bg-blush-soft text-caramel">
                    <Icon name={card.icon} className="size-5" />
                  </span>
                  <span className="mt-3 block text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/45">
                    {card.title}
                  </span>
                  <span className="mt-1 block text-sm font-semibold leading-snug text-cocoa">
                    {card.value}
                  </span>
                </>
              );

              return card.href ? (
                <a
                  key={card.title}
                  href={card.href}
                  target={card.external ? '_blank' : undefined}
                  rel={card.external ? 'noreferrer' : undefined}
                  className="rounded-3xl border border-line bg-cream-50 p-4 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-soft"
                >
                  {content}
                </a>
              ) : (
                <div key={card.title} className="rounded-3xl border border-line bg-cream-50 p-4 shadow-card">
                  {content}
                </div>
              );
            })}
          </div>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <a
              href={contacts.telegramHref}
              target="_blank"
              rel="noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-gold-gradient px-4 py-3 text-sm font-semibold text-cocoa-dark shadow-gold transition-transform hover:-translate-y-0.5"
            >
              <Icon name="telegram" className="size-4" />
              Telegram {contacts.telegram}
            </a>
            <a
              href={contacts.whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-full border border-caramel/40 px-4 py-3 text-sm font-semibold text-cocoa transition-colors hover:bg-cream-200/60"
            >
              <Icon name="whatsapp" className="size-4" />
              WhatsApp
            </a>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="relative flex h-full min-h-[280px] flex-col justify-between overflow-hidden rounded-4xl border border-line bg-mint-soft p-6">
            <div
              className="pointer-events-none absolute inset-0 opacity-60"
              aria-hidden="true"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(198,142,23,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(198,142,23,0.12) 1px, transparent 1px)',
                backgroundSize: '36px 36px',
              }}
            />
            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full bg-cream/85 px-3 py-1.5 text-xs font-semibold text-cocoa backdrop-blur">
                <Icon name="mapPin" className="size-4 text-caramel" />
                Мы на карте
              </span>
              <p className="mt-4 max-w-sm font-display text-xl leading-snug text-cocoa">
                {contacts.address}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-ink/60">{contacts.mapNote}</p>
            </div>

            <a
              href={contacts.mapHref}
              target="_blank"
              rel="noreferrer"
              className="relative mt-6 inline-flex items-center justify-center gap-2 self-start rounded-full border border-caramel/40 bg-cream-50 px-4 py-2.5 text-sm font-semibold text-cocoa transition-colors hover:border-caramel"
            >
              <Icon name="arrowRight" className="size-4" />
              Открыть в Яндекс.Картах
            </a>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
