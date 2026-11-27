import type { Order } from '@/types';
import { STATS_PERIOD_DAYS } from '@/utils/customerStats';
import { addDays, formatDateShort, toISODate } from '@/utils/date';
import { formatPrice, pluralize } from '@/utils/formatPrice';

const BAR_HEIGHT = 112;
/** Примерно шесть подписей на графике: остальные даты скрываем, чтобы не слипались. */
const MAX_LABELS = 6;

interface RevenueChartProps {
  orders: Order[];
  /** Окно графика в днях. Считаем по дате оформления (createdAt). */
  days?: number;
}

/** Простые CSS-столбики за период: без внешних библиотек графиков. */
export function RevenueChart({ orders, days = STATS_PERIOD_DAYS }: RevenueChartProps) {
  const today = new Date();

  const period = Array.from({ length: days }, (_, index) => {
    const iso = toISODate(addDays(today, index - (days - 1)));
    const dayOrders = orders.filter((order) => toISODate(new Date(order.createdAt)) === iso);
    const delivered = dayOrders.filter((order) => order.status === 'completed');

    return {
      iso,
      label: formatDateShort(iso).slice(0, 5),
      revenue: delivered.reduce((sum, order) => sum + order.total, 0),
      profit: delivered.reduce((sum, order) => sum + order.finance.profit, 0),
      count: dayOrders.filter((order) => order.status !== 'declined').length,
    };
  });

  const max = Math.max(1, ...period.map((day) => day.revenue));
  const labelStep = Math.max(1, Math.ceil(days / MAX_LABELS));

  return (
    <section className="mt-4 rounded-3xl border border-line bg-cream-50 p-5 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-lg text-cocoa">
          Выручка и прибыль за {days} {pluralize(days, ['день', 'дня', 'дней'])}
        </h2>
        <div className="flex items-center gap-3 text-[11px] text-ink/60">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-gold" aria-hidden="true" /> Выручка
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-mint-deep" aria-hidden="true" /> Прибыль
          </span>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto pb-1">
        <div className="flex min-w-[560px] items-end gap-1.5">
          {period.map((day, index) => {
            const revenueHeight =
              day.revenue > 0 ? Math.max(3, Math.round((day.revenue / max) * BAR_HEIGHT)) : 0;
            const profitHeight =
              day.profit > 0 ? Math.max(2, Math.round((day.profit / max) * BAR_HEIGHT)) : 0;

            const showLabel = index % labelStep === 0 || index === period.length - 1;

            return (
              <div
                key={day.iso}
                className="flex min-w-0 flex-1 flex-col items-center gap-1"
                title={`${day.iso}: заказов ${day.count}, выручка ${formatPrice(
                  day.revenue,
                )}, прибыль ${formatPrice(day.profit)}`}
              >
                <div
                  className="flex w-full items-end justify-center gap-0.5"
                  style={{ height: BAR_HEIGHT }}
                >
                  <span
                    className="w-2/5 rounded-t bg-gold/80"
                    style={{ height: revenueHeight }}
                    aria-hidden="true"
                  />
                  <span
                    className="w-2/5 rounded-t bg-mint-deep"
                    style={{ height: profitHeight }}
                    aria-hidden="true"
                  />
                </div>
                <span className="h-3 w-full truncate text-center text-[9px] text-ink/45">
                  {showLabel ? day.label : ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-ink/50">
        Считаем по дате оформления и только по доставленным заказам. Наведите курсор на столбик,
        чтобы увидеть число заказов, выручку и прибыль.
      </p>
    </section>
  );
}

