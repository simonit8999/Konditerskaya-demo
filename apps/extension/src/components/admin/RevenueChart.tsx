import type { Order } from '@/types';
import { addDays, formatDateShort, toISODate } from '@/utils/date';
import { formatPrice } from '@/utils/formatPrice';

const BAR_HEIGHT = 112;

interface RevenueChartProps {
  orders: Order[];
}

/** Простые CSS-столбики за 14 дней: без внешних библиотек графиков. */
export function RevenueChart({ orders }: RevenueChartProps) {
  const today = new Date();

  const days = Array.from({ length: 14 }, (_, index) => {
    const iso = toISODate(addDays(today, index - 13));
    const completed = orders.filter(
      (order) => order.status === 'completed' && order.delivery.date === iso,
    );

    return {
      iso,
      label: formatDateShort(iso).slice(0, 5),
      revenue: completed.reduce((sum, order) => sum + order.total, 0),
      profit: completed.reduce((sum, order) => sum + order.finance.profit, 0),
    };
  });

  const max = Math.max(1, ...days.map((day) => day.revenue));

  return (
    <section className="mt-4 rounded-3xl border border-line bg-cream-50 p-5 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-lg text-cocoa">Выручка и прибыль за 14 дней</h2>
        <div className="flex items-center gap-3 text-[11px] text-ink/60">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-gold" aria-hidden="true" /> Выручка
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-mint-deep" aria-hidden="true" /> Прибыль
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-end gap-1.5">
        {days.map((day) => {
          const revenueHeight =
            day.revenue > 0 ? Math.max(3, Math.round((day.revenue / max) * BAR_HEIGHT)) : 0;
          const profitHeight =
            day.profit > 0 ? Math.max(2, Math.round((day.profit / max) * BAR_HEIGHT)) : 0;

          return (
            <div
              key={day.iso}
              className="flex min-w-0 flex-1 flex-col items-center gap-1"
              title={`${day.iso}: выручка ${formatPrice(day.revenue)}, прибыль ${formatPrice(
                day.profit,
              )}`}
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
              <span className="w-full truncate text-center text-[9px] text-ink/45">{day.label}</span>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-ink/50">
        Считаем по дате получения и только по завершённым заказам. Наведите курсор на столбик,
        чтобы увидеть суммы.
      </p>
    </section>
  );
}
