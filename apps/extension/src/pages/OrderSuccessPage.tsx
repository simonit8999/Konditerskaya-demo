import { Link, useParams } from 'react-router-dom';
import { buttonStyles } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { useNotifications } from '@/hooks/useNotifications';
import { useOrders } from '@/hooks/useOrders';
import { formatDateRu } from '@/utils/date';
import { formatPrice } from '@/utils/formatPrice';
import { buildMessengerLink, describeContact } from '@/utils/messenger';
import { getOrderComment } from '@/utils/orderComment';
import {
  ORDER_STATUS_CUSTOMER_TEXT,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_STYLES,
} from '@/utils/orderStatus';
import { cn } from '@/utils/cn';

/** Экран успеха: номер заказа, детали и следующие шаги. */
export function OrderSuccessPage() {
  const { id } = useParams<{ id: string }>();
  const { getOrder } = useOrders();
  const { notifications, markRead } = useNotifications('customer');
  const order = id ? getOrder(id) : undefined;

  if (!order) {
    return (
      <div className="container-page py-12">
        <EmptyState
          icon="info"
          title="Заказ не найден"
          text="Возможно, он был оформлен в другом браузере или удалён из кабинета."
          action={
            <Link to="/orders" className={buttonStyles('primary', 'md')}>
              Перейти в мои заказы
            </Link>
          }
        />
      </div>
    );
  }

  const comment = getOrderComment(order);
  const contactLabel = describeContact(order.customer.contact);
  const contactLink = buildMessengerLink(order.customer.contact);
  const unreadNotification = notifications.find(
    (item) => item.orderId === order.id && !item.readAt,
  );

  const syncNote =
    order.syncStatus === 'sent'
      ? 'Заказ уже отправлен кондитеру в Telegram.'
      : order.syncStatus === 'demo'
        ? 'Демо-режим: заказ сохранён на этом устройстве. Подключите apps/api — и заявки начнут приходить в Telegram.'
        : 'Не удалось отправить заказ автоматически. Он сохранён в кабинете — попробуйте отправить повторно или свяжитесь с нами.';

  return (
    <div className="container-page py-10 lg:py-16">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-mint text-cocoa shadow-card">
            <Icon name="check" className="size-8" />
          </span>
          <h1 className="mt-5 font-display text-[clamp(1.6rem,3.4vw,2.25rem)] leading-tight text-cocoa">
            Спасибо за ваш заказ!
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink/70">
            Мы свяжемся с вами в ближайшее время, чтобы подтвердить детали.
          </p>
        </div>

        <div className="mt-7 rounded-3xl border border-line bg-cream-50 p-5 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-display text-lg text-cocoa">Заказ {order.number}</p>
            <span className="chip">{formatPrice(order.total)}</span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide',
                ORDER_STATUS_STYLES[order.status],
              )}
            >
              {ORDER_STATUS_LABELS[order.status]}
            </span>
            <span className="text-xs leading-relaxed text-ink/60">
              {ORDER_STATUS_CUSTOMER_TEXT[order.status]}
            </span>
          </div>

          <dl className="mt-4 space-y-2.5 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-ink/60">Дата получения</dt>
              <dd className="font-semibold text-cocoa">
                {formatDateRu(order.delivery.date)}, {order.delivery.timeSlot}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink/60">Способ получения</dt>
              <dd className="text-right font-semibold text-cocoa">
                {order.delivery.method === 'delivery'
                  ? `Доставка · ${order.delivery.address}`
                  : 'Самовывоз'}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-ink/60">Позиций</dt>
              <dd className="font-semibold text-cocoa">{order.items.length}</dd>
            </div>
          </dl>

          {comment && (
            <div className="mt-4 rounded-2xl bg-cream-100 px-3.5 py-3 text-xs leading-relaxed text-ink/70">
              <p className="font-semibold text-cocoa">Комментарий к заказу</p>
              <p className="mt-1 whitespace-pre-line">{comment}</p>
            </div>
          )}

          {contactLabel && (
            <p className="mt-2 text-xs text-ink/70">
              Связь:{' '}
              {contactLink ? (
                <a href={contactLink} target="_blank" rel="noreferrer" className="link-underline">
                  {contactLabel}
                </a>
              ) : (
                contactLabel
              )}
            </p>
          )}

          <ul className="mt-4 space-y-2 border-t border-line/70 pt-4">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-3 text-sm">
                <span className="text-cocoa">{item.title}</span>
                <span className="shrink-0 font-semibold tabular-nums text-cocoa">
                  {formatPrice(item.price)}
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-4 flex items-start gap-2 rounded-2xl bg-cream-100 px-3.5 py-3 text-xs leading-relaxed text-ink/70">
            <Icon name="telegram" className="mt-0.5 size-4 shrink-0 text-caramel" />
            {syncNote}
          </p>
        </div>

        {unreadNotification && (
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-gold/40 bg-gold/10 px-4 py-3">
            <Icon name="bell" className="mt-0.5 size-4 shrink-0 text-caramel-dark" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-cocoa">{unreadNotification.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-ink/70">
                {unreadNotification.body}
              </p>
            </div>
            <button
              type="button"
              onClick={() => markRead(unreadNotification.id)}
              className="shrink-0 rounded-full border border-caramel/40 px-2.5 py-1 text-[11px] font-semibold text-caramel-dark transition-colors hover:bg-cream-200/70"
            >
              Прочитано
            </button>
          </div>
        )}

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Link to="/orders" className={buttonStyles('primary', 'lg', true)}>
            <Icon name="gift" className="size-5" />
            Следить за заказом
          </Link>
          <Link to="/" className={buttonStyles('outline', 'lg', true)}>
            На главную
          </Link>
        </div>
      </div>
    </div>
  );
}
