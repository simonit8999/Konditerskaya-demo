import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';
import type { Order } from '@/types';
import { cn } from '@/utils/cn';
import { formatDateRu } from '@/utils/date';
import { formatPrice } from '@/utils/formatPrice';
import { getOrderComment } from '@/utils/orderComment';
import { ORDER_STATUS_LABELS, ORDER_STATUS_STYLES } from '@/utils/orderStatus';

interface AdminOrderCardProps {
  order: Order;
  onOpen: () => void;
}

/** Карточка заказа в списке кабинета владельца. */
export function AdminOrderCard({ order, onOpen }: AdminOrderCardProps) {
  const comment = getOrderComment(order);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full rounded-3xl border border-line bg-cream-50 p-4 text-left shadow-card transition-all duration-200 ease-silk hover:-translate-y-0.5 hover:shadow-soft"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-display text-base text-cocoa">Заказ {order.number}</p>
            {order.isDemo && <Badge tone="neutral">Демо</Badge>}
          </div>
          <p className="mt-0.5 text-xs text-ink/55">
            {order.customer.name} · {order.customer.phone}
          </p>
        </div>

        <span
          className={cn(
            'shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide',
            ORDER_STATUS_STYLES[order.status],
          )}
        >
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink/60">
        <span>
          {formatDateRu(order.delivery.date)}, {order.delivery.timeSlot}
        </span>
        <span aria-hidden="true">·</span>
        <span>{order.delivery.method === 'delivery' ? 'Доставка' : 'Самовывоз'}</span>
        <span aria-hidden="true">·</span>
        <span className="font-semibold text-cocoa">{formatPrice(order.total)}</span>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span
          className={cn(
            'font-semibold',
            order.finance.profit >= 0 ? 'text-caramel-dark' : 'text-berry-dark',
          )}
        >
          Прибыль: {formatPrice(order.finance.profit)} · {order.finance.marginPercent}%
        </span>

        {comment && (
          <span className="inline-flex items-center gap-1 text-ink/55">
            <Icon name="chat" className="size-3.5" />
            Комментарий
          </span>
        )}
      </div>
    </button>
  );
}
