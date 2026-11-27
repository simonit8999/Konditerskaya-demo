import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { Icon } from '@/components/ui/Icon';
import { Logo } from '@/components/ui/Logo';
import { Modal } from '@/components/ui/Modal';
import { useCart } from '@/hooks/useCart';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import { siteContent } from '@/references';
import { cn } from '@/utils/cn';

interface NavItem {
  to: string;
  label: string;
  /** Кабинет владельца — единственный раздел «для кондитера», поэтому с иконкой. */
  owner?: boolean;
}

const NAVIGATION: NavItem[] = [
  { to: '/admin', label: 'Кабинет', owner: true },
  { to: '/', label: 'Главная' },
  { to: '/builder', label: 'Конструктор' },
  { to: '/delivery', label: 'Доставка' },
  { to: '/about', label: 'О нас' },
  { to: '/contacts', label: 'Контакты' },
];

const OWNER_TITLE = 'Кабинет владельца: заказы, выручка и прибыль';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold transition-colors',
    isActive ? 'bg-cream-200 text-cocoa' : 'text-ink/70 hover:bg-cream-200/60 hover:text-cocoa',
  );

export function Header() {
  const { count } = useCart();
  const { canInstall, install } = useInstallPrompt();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line/60 bg-cream/85 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-3">
        <Link to="/" className="rounded-2xl py-1" aria-label="Кондитерский Рай — на главную">
          <Logo />
        </Link>

        <nav aria-label="Основная навигация" className="hidden items-center gap-0.5 lg:flex">
          {NAVIGATION.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              title={item.owner ? OWNER_TITLE : undefined}
              className={navLinkClass}
            >
              {item.owner ? (
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="wallet" className="size-4 text-caramel" />
                  {item.label}
                </span>
              ) : (
                item.label
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          {canInstall && (
            <button
              type="button"
              onClick={() => void install()}
              className="hidden items-center gap-1.5 rounded-full border border-caramel/40 px-3 py-2 text-xs font-semibold text-cocoa transition-colors hover:bg-cream-200/70 sm:inline-flex"
            >
              <Icon name="download" className="size-4" />
              Установить
            </button>
          )}

          <NotificationBell />

          <NavLink
            to="/orders"
            aria-label="Мои заказы"
            className="flex size-10 items-center justify-center rounded-full text-cocoa transition-colors hover:bg-cream-200/70"
          >
            <Icon name="gift" className="size-5" />
          </NavLink>

          <NavLink
            to="/cart"
            aria-label={`Корзина, позиций: ${count}`}
            className="relative flex size-10 items-center justify-center rounded-full text-cocoa transition-colors hover:bg-cream-200/70"
          >
            <Icon name="cart" className="size-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex min-w-5 items-center justify-center rounded-full bg-berry px-1 text-[10px] font-bold leading-5 text-white">
                {count}
              </span>
            )}
          </NavLink>

          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Открыть меню"
            className="flex size-10 items-center justify-center rounded-full text-cocoa transition-colors hover:bg-cream-200/70 lg:hidden"
          >
            <Icon name="menu" className="size-5" />
          </button>
        </div>
      </div>

      <Modal open={menuOpen} onClose={() => setMenuOpen(false)} title="Меню">
        <nav className="flex flex-col gap-1" aria-label="Мобильная навигация">
          {[...NAVIGATION, { to: '/orders', label: 'Мои заказы' }].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                cn(
                  'rounded-2xl px-4 py-3 text-[15px] font-semibold transition-colors',
                  isActive ? 'bg-cream-200 text-cocoa' : 'text-ink/80 hover:bg-cream-200/60',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-4 rounded-2xl bg-mint-soft px-4 py-3 text-xs leading-relaxed text-ink/70">
          {siteContent.hero.badge}
        </div>

        {canInstall && (
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              void install();
            }}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold-gradient px-4 py-3 text-sm font-semibold text-cocoa-dark"
          >
            <Icon name="download" className="size-4" />
            Установить приложение
          </button>
        )}
      </Modal>
    </header>
  );
}
