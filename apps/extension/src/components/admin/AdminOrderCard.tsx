import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';
import type { Order, OrderStatus } from '@/types';
import { cn } from '@/utils/cn';
import { formatDateRu, formatDateTimeRu } from '@/utils/date';
import { formatPrice } from '@/utils/formatPrice';
import { getOrderComment } from '@/utils/orderComment';
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_QUICK_ACTIONS,
  ORDER_STATUS_STYLES,
} from '@/utils/orderStatus';

interface AdminOrderCardProps {
  order: Order;
  onOpen: () => void;
  /** Быстрая смена статуса прямо из списка; без пропа кнопки не показываются. */
  onStatusChange?: (status: OrderStatus) => void;
}

const QUICK_ACTION_STYLES: Record<'work' | 'done' | 'cancel', string> = {
  work: 'border-caramel/45 bg-cream-50 text-cocoa hover:bg-cream-200/70',
  done: 'border-mint-deep bg-mint text-ink hover:bg-mint-deep/70',
  cancel: 'border-berry/30 bg-berry/10 text-berry-dark hover:bg-berry/15',
};

/**
 * Карточка заказа в списке кабинета владельца.
 *
 * Корень — `<div>`, а не `<button>`: внутри есть свои кнопки («Открыть» и
 * быстрые статусы), а вкладывать интерактивные элементы в кнопку нельзя.
 */
export function AdminOrderCard({ order, onOpen, onStatusChange }: AdminOrderCardProps) {
  const comment = getOrderComment(order);
  const quickActions = onStatusChange
    ? ORDER_STATUS_QUICK_ACTIONS.filter((action) => action.status !== order.status)
    : [];

  return (
    <div className="flex w-full flex-col rounded-3xl border border-line bg-cream-50 p-4 text-left shadow-card transition-all duration-200 ease-silk hover:-translate-y-0.5 hover:shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onOpen}
              className="text-left font-display text-base text-cocoa transition-colors hover:text-caramel-dark"
            >
              Заказ {order.number}
            </button>
            {order.isDemo && <Badge tone="neutral">Демо</Badge>}
          </div>
          <p className="mt-0.5 text-xs text-ink/55">
            {order.customer.name} · {order.customer.phone}
          </p>
          <p className="mt-0.5 text-[11px] text-ink/45">
            Оформлен {formatDateTimeRu(order.createdAt)}
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

      <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-3">
        {quickActions.map((action) => (
          <button
            key={action.status}
            type="button"
            onClick={() => onStatusChange?.(action.status)}
            className={cn(
              'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors',
              QUICK_ACTION_STYLES[action.tone],
            )}
          >
            <Icon name={action.tone === 'cancel' ? 'ban' : 'check'} className="size-3" />
            {action.label}
          </button>
        ))}

        <button
          type="button"
          onClick={onOpen}
          className="ml-auto inline-flex items-center gap-1 rounded-full border border-caramel/45 px-3 py-1 text-[11px] font-semibold text-cocoa transition-colors hover:bg-cream-200/70"
        >
          Открыть
          <Icon name="arrowRight" className="size-3.5" />
        </button>
      </div>
    </div>
  );
}

