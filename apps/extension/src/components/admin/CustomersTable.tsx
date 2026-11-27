import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import type { Order } from '@/types';
import { aggregateCustomers } from '@/utils/customerStats';
import { formatDateShort } from '@/utils/date';
import { formatPrice, pluralize } from '@/utils/formatPrice';
import { buildMessengerLink } from '@/utils/messenger';

interface CustomersTableProps {
  orders: Order[];
}

/**
 * Клиенты кабинета: одна строка — один телефон.
 *
 * «Потратил» — сумма доставленных заказов, поэтому клиент с заявками
 * в работе может стоять ниже, чем ожидается по числу заказов.
 */
export function CustomersTable({ orders }: CustomersTableProps) {
  const customers = aggregateCustomers(orders);

  if (customers.length === 0) {
    return (
      <EmptyState
        className="mt-4"
        icon="user"
        title="Клиентов пока нет"
        text="Как только появятся заказы, здесь соберётся база: кто заказывал, сколько потратил и когда последний раз."
      />
    );
  }

  return (
    <div className="mt-4 overflow-hidden rounded-3xl border border-line bg-cream-50 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/70 px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink/45">
          {customers.length} {pluralize(customers.length, ['клиент', 'клиента', 'клиентов'])}
        </p>
        <p className="text-[11px] text-ink/45">сортировка по сумме доставленных заказов</p>
      </div>

      <ul className="divide-y divide-line/70">
        {customers.map((customer) => {
          const link = buildMessengerLink(customer.contact);

          return (
            <li
              key={customer.key}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-cocoa">{customer.name}</p>
                <p className="truncate text-xs text-ink/60">
                  {customer.phone} · {customer.ordersCount}{' '}
                  {pluralize(customer.ordersCount, ['заказ', 'заказа', 'заказов'])}
                  {customer.deliveredCount > 0 && ` · доставлено ${customer.deliveredCount}`}
                </p>
                <p className="text-[11px] text-ink/45">
                  Последний заказ: {formatDateShort(customer.lastOrderAt)}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <span className="font-display text-base font-semibold tabular-nums text-caramel-dark">
                  {formatPrice(customer.spent)}
                </span>
                {link && (
                  <a
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Написать ${customer.name}`}
                    title="Написать в мессенджер"
                    className="rounded-full border border-line bg-cream-50 p-2 text-caramel transition-colors hover:border-caramel hover:text-cocoa"
                  >
                    <Icon name="chat" className="size-4" />
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
