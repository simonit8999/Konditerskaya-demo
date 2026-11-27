import { Link } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { Logo } from '@/components/ui/Logo';
import { siteContent } from '@/references';

const NAV_LINKS = [
  { to: '/builder', label: 'Конструктор торта' },
  { to: '/cart', label: 'Корзина' },
  { to: '/orders', label: 'Мои заказы' },
  { to: '/about', label: 'О платформе' },
  { to: '/contacts', label: 'Контакты' },
  { to: '/delivery', label: 'Доставка и оплата' },
];

export function Footer() {
  const { brand, contacts, footer } = siteContent;

  return (
    <footer className="mt-16 border-t border-line/70 bg-cream-100/70">
      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2 lg:col-span-1">
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink/70">
            {brand.tagline}: клиент собирает торт сам, цена считается автоматически,
            а заказ приходит вам в Telegram.
          </p>
          <div className="mt-5 flex gap-2">
            <a
              href={contacts.telegramHref}
              target="_blank"
              rel="noreferrer"
              aria-label="Написать в Telegram"
              className="flex size-10 items-center justify-center rounded-full border border-line bg-cream-50 text-caramel transition-colors hover:border-caramel hover:text-cocoa"
            >
              <Icon name="telegram" className="size-5" />
            </a>
            <a
              href={contacts.whatsappHref}
              target="_blank"
              rel="noreferrer"
              aria-label="Написать в WhatsApp"
              className="flex size-10 items-center justify-center rounded-full border border-line bg-cream-50 text-caramel transition-colors hover:border-caramel hover:text-cocoa"
            >
              <Icon name="whatsapp" className="size-5" />
            </a>
            <a
              href={contacts.phoneHref}
              aria-label="Позвонить"
              className="flex size-10 items-center justify-center rounded-full border border-line bg-cream-50 text-caramel transition-colors hover:border-caramel hover:text-cocoa"
            >
              <Icon name="phone" className="size-5" />
            </a>
          </div>
        </div>

        <nav aria-label="Навигация в подвале">
          <h2 className="font-display text-base text-cocoa">Витрина</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="text-ink/70 transition-colors hover:text-caramel-dark">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-display text-base text-cocoa">Контакты</h2>
          <ul className="mt-4 space-y-3 text-sm text-ink/70">
            <li className="flex gap-2.5">
              <Icon name="mapPin" className="mt-0.5 size-4 text-caramel" />
              <span>{contacts.address}</span>
            </li>
            <li className="flex gap-2.5">
              <Icon name="phone" className="mt-0.5 size-4 text-caramel" />
              <a href={contacts.phoneHref} className="transition-colors hover:text-caramel-dark">
                {contacts.phone}
              </a>
            </li>
            <li className="flex gap-2.5">
              <Icon name="mail" className="mt-0.5 size-4 text-caramel" />
              <a href={`mailto:${contacts.email}`} className="break-all transition-colors hover:text-caramel-dark">
                {contacts.email}
              </a>
            </li>
            <li className="flex gap-2.5">
              <Icon name="clock" className="mt-0.5 size-4 text-caramel" />
              <span>{contacts.hours}</span>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-display text-base text-cocoa">Документы</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>
              <Link to="/privacy" className="text-ink/70 transition-colors hover:text-caramel-dark">
                Политика конфиденциальности
              </Link>
            </li>
            <li>
              <Link to="/delivery" className="text-ink/70 transition-colors hover:text-caramel-dark">
                Условия доставки и оплаты
              </Link>
            </li>
            <li>
              <a
                href={contacts.mapHref}
                target="_blank"
                rel="noreferrer"
                className="text-ink/70 transition-colors hover:text-caramel-dark"
              >
                Мы на карте
              </a>
            </li>
            <li>
              <Link to="/admin" className="text-ink/70 transition-colors hover:text-caramel-dark">
                Кабинет владельца
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line/70">
        <div className="container-page flex flex-col gap-2 py-6 text-xs leading-relaxed text-ink/60 sm:flex-row sm:items-start sm:justify-between">
          <p>{footer.note}</p>
          <p className="max-w-xl sm:text-right">{footer.demoNote}</p>
        </div>
      </div>
    </footer>
  );
}
