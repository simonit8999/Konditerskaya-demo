import { Link, useParams } from 'react-router-dom';
import { buttonStyles } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { useOrders } from '@/hooks/useOrders';
import { formatDateRu } from '@/utils/date';
import { formatPrice } from '@/utils/formatPrice';

/** Экран успеха: номер заказа, детали и следующие шаги. */
export function OrderSuccessPage() {
  const { id } = useParams<{ id: string }>();
  const { getOrder } = useOrders();
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
