import { Icon } from '@/components/ui/Icon';
import type { IconName } from '@/components/ui/Icon';
import type { Order } from '@/types';
import { formatPrice } from '@/utils/formatPrice';

interface StatCardsProps {
  orders: Order[];
}

/** KPI кабинета: деньги считаем только по завершённым заказам. */
export function StatCards({ orders }: StatCardsProps) {
  const newCount = orders.filter((order) => order.status === 'new').length;
  const confirmedCount = orders.filter((order) => order.status === 'confirmed').length;
  const completed = orders.filter((order) => order.status === 'completed');

  const revenue = completed.reduce((sum, order) => sum + order.total, 0);
  const profit = completed.reduce((sum, order) => sum + order.finance.profit, 0);
  const averageCheck = completed.length > 0 ? Math.round(revenue / completed.length) : 0;
  const margin = revenue > 0 ? Math.round((profit / revenue) * 1000) / 10 : 0;
  const potential = orders
    .filter((order) => order.status === 'new' || order.status === 'confirmed' || order.status === 'ready')
    .reduce((sum, order) => sum + order.total, 0);

  const stats: { label: string; value: string; hint: string; icon: IconName }[] = [
    { label: 'Новые заказы', value: String(newCount), hint: 'ждут подтверждения', icon: 'bell' },
    { label: 'Подтверждены', value: String(confirmedCount), hint: 'уже в работе', icon: 'check' },
    { label: 'Выручка', value: formatPrice(revenue), hint: 'по завершённым', icon: 'wallet' },
    { label: 'Прибыль', value: formatPrice(profit), hint: `маржа ${margin}%`, icon: 'chart' },
    {
      label: 'Средний чек',
      value: formatPrice(averageCheck),
      hint: 'по завершённым',
      icon: 'calculator',
    },
    { label: 'Потенциал', value: formatPrice(potential), hint: 'новые + в работе', icon: 'sparkle' },
  ];

  return (
    <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-3xl border border-line bg-cream-50 p-4 shadow-card"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink/50">
              {stat.label}
            </p>
            <Icon name={stat.icon} className="size-4 text-caramel" />
          </div>
          <p className="mt-2 font-display text-xl font-semibold tabular-nums text-cocoa">
            {stat.value}
          </p>
          <p className="mt-0.5 text-[11px] text-ink/50">{stat.hint}</p>
        </div>
      ))}
    </div>
  );
}
