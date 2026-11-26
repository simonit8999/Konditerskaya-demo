import { NavLink } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import type { IconName } from '@/components/ui/Icon';
import { useCart } from '@/hooks/useCart';
import { cn } from '@/utils/cn';

const ITEMS: { to: string; label: string; icon: IconName }[] = [
  { to: '/', label: 'Главная', icon: 'cake' },
  { to: '/builder', label: 'Собрать', icon: 'sparkle' },
  { to: '/cart', label: 'Корзина', icon: 'cart' },
  { to: '/orders', label: 'Заказы', icon: 'gift' },
];

/** Нижняя навигация для мобильных — привычный паттерн PWA. */
export function MobileNav() {
  const { count } = useCart();

  return (
    <nav
      aria-label="Навигация по приложению"
      className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line/70 bg-cream/95 backdrop-blur-md lg:hidden"
    >
      <ul className="container-page flex items-stretch justify-between gap-1 py-2">
        {ITEMS.map((item) => (
          <li key={item.to} className="flex-1">
            <NavLink
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'relative flex flex-col items-center gap-1 rounded-2xl px-1 py-1.5 text-[11px] font-semibold transition-colors',
                  isActive ? 'text-caramel-dark' : 'text-ink/55 hover:text-cocoa',
                )
              }
            >
              <span className="relative">
                <Icon name={item.icon} className="size-5" />
                {item.to === '/cart' && count > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex min-w-4 items-center justify-center rounded-full bg-berry px-1 text-[9px] font-bold leading-4 text-white">
                    {count}
                  </span>
                )}
              </span>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
