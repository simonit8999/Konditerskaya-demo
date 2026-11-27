import { Icon } from '@/components/ui/Icon';
import type { IconName } from '@/components/ui/Icon';
import type { Order } from '@/types';
import { buildPeriodStats, STATS_PERIOD_DAYS } from '@/utils/customerStats';
import { formatPrice, pluralize } from '@/utils/formatPrice';

interface StatCardsProps {
  orders: Order[];
  /** Окно аналитики в днях. Считаем по дате оформления (createdAt). */
  days?: number;
}

interface StatCard {
  label: string;
  value: string;
  hint: string;
  icon: IconName;
  /** Длинные значения (название торта) показываем компактнее. */
  compact?: boolean;
}

/**
 * KPI кабинета за период.
 *
 * Деньги считаются только по доставленным заказам (`completed`), поэтому
 * «выручка» и «средний чек» не завышаются за счёт заявок в работе.
 */
export function StatCards({ orders, days = STATS_PERIOD_DAYS }: StatCardsProps) {
  const stats = buildPeriodStats(orders, days);
  const popular = stats.popularCake;

  const cards: StatCard[] = [
    {
      label: `Заказов за ${days} ${pluralize(days, ['день', 'дня', 'дней'])}`,
      value: String(stats.ordersCount),
      hint: `в работе: ${stats.activeCount}`,
      icon: 'bell',
    },
    {
      label: 'Выручка',
      value: formatPrice(stats.revenue),
      hint: `доставлено: ${stats.completedCount}`,
      icon: 'wallet',
    },
    {
      label: 'Прибыль',
      value: formatPrice(stats.profit),
      hint: `маржа ${stats.marginPercent}%`,
      icon: 'chart',
    },
    {
      label: 'Средний чек',
      value: formatPrice(stats.averageCheck),
      hint: 'по доставленным',
      icon: 'calculator',
    },
    {
      label: 'Самый популярный торт',
      value: popular?.title ?? '—',
      hint: popular
        ? `${popular.count} ${pluralize(popular.count, ['раз', 'раза', 'раз'])} за период`
        : 'пока нет данных',
      icon: 'cake',
      compact: true,
    },
    {
      label: 'Потенциал',
      value: formatPrice(stats.potential),
      hint: 'новые + в работе',
      icon: 'sparkle',
    },
  ];

  return (
    <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((stat) => (
        <div
          key={stat.label}
          className="rounded-3xl border border-line bg-cream-50 p-4 shadow-card"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink/50">
              {stat.label}
            </p>
            <Icon name={stat.icon} className="size-4 shrink-0 text-caramel" />
          </div>
          <p
            className={
              stat.compact
                ? 'mt-2 line-clamp-2 font-display text-lg font-semibold leading-snug text-cocoa'
                : 'mt-2 font-display text-xl font-semibold tabular-nums text-cocoa'
            }
          >
            {stat.value}
          </p>
          <p className="mt-0.5 text-[11px] text-ink/50">{stat.hint}</p>
        </div>
      ))}
    </div>
  );
}

