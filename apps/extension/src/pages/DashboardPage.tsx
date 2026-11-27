import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, buttonStyles } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { Modal } from '@/components/ui/Modal';
import { useCart } from '@/hooks/useCart';
import { useNotifications } from '@/hooks/useNotifications';
import { useOrders } from '@/hooks/useOrders';
import { useToast } from '@/hooks/useToast';
import type { ContactHandle, Order } from '@/types';
import { formatDateRu, formatDateTimeRu } from '@/utils/date';
import { formatPrice } from '@/utils/formatPrice';
import { buildMessengerLink, describeContact } from '@/utils/messenger';
import { getOrderComment } from '@/utils/orderComment';
import {
  isActiveStatus,
  ORDER_STATUS_CUSTOMER_TEXT,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_STYLES,
  SYNC_STATUS_LABELS,
} from '@/utils/orderStatus';
import { cn } from '@/utils/cn';

type Tab = 'active' | 'completed' | 'declined';

function ContactLink({ contact }: { contact: ContactHandle }) {
  const label = describeContact(contact);
  const link = buildMessengerLink(contact);

  return link ? (
    <a href={link} target="_blank" rel="noreferrer" className="link-underline">
      {label}
    </a>
  ) : (
    <span>{label}</span>
  );
}

/** Кабинет заказчика: активные и завершённые заказы, детали, повтор заказа. */
export function DashboardPage() {
  const { orders, retrySend, removeOrder } = useOrders();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const { notifications, markRead, unreadCount } = useNotifications('customer');
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>('active');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  // Демо-заказы кабинета владельца — примеры для кондитера, клиенту их не показываем.
  const customerOrders = orders.filter((order) => !order.isDemo);
  const activeOrders = customerOrders.filter((order) => isActiveStatus(order.status));
  const completedOrders = customerOrders.filter((order) => order.status === 'completed');
  const declinedOrders = customerOrders.filter((order) => order.status === 'declined');
  const list =
    tab === 'active' ? activeOrders : tab === 'completed' ? completedOrders : declinedOrders;
  const selected = selectedId ? customerOrders.find((order) => order.id === selectedId) : undefined;
  const latestUnread = notifications.find((item) => !item.readAt);

  const handleRepeat = (order: Order) => {
    order.items.forEach((item) => addItem(item.config));
    setSelectedId(null);
    showToast('Состав добавлен в корзину');
    navigate('/cart');
  };

  const handleRetry = async (order: Order) => {
    setRetrying(true);
    const ok = await retrySend(order.id);
    setRetrying(false);
    showToast(
      ok ? 'Заказ отправлен повторно' : 'Отправить не удалось — проверьте соединение',
      ok ? 'success' : 'error',
    );
  };

  return (
    <div className="container-page py-8 lg:py-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[clamp(1.75rem,3.6vw,2.5rem)] leading-tight text-cocoa">
            Мои заказы
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink/70">
            Здесь хранятся заказы, оформленные в этом браузере. Данные доступны и офлайн.
          </p>
        </div>
        <Link to="/builder" className={buttonStyles('outline', 'md')}>
          <Icon name="cake" className="size-4" />
          Собрать торт
        </Link>
      </div>

      <div
        className="mt-5 inline-flex rounded-full border border-line bg-cream-50 p-1"
        role="tablist"
        aria-label="Фильтр заказов"
      >
        {[
          {
            id: 'active' as Tab,
            label: activeOrders.length > 0 ? `Активные · ${activeOrders.length}` : 'Активные',
          },
          { id: 'completed' as Tab, label: 'Завершённые' },
          { id: 'declined' as Tab, label: 'Отменённые' },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            onClick={() => setTab(item.id)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-semibold transition-colors',
              tab === item.id ? 'bg-gold/20 text-cocoa' : 'text-ink/60 hover:text-cocoa',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {latestUnread && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-gold/40 bg-gold/10 px-4 py-3">
          <Icon name="bell" className="mt-0.5 size-4 shrink-0 text-caramel-dark" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-cocoa">{latestUnread.title}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-ink/70">{latestUnread.body}</p>
            {unreadCount > 1 && (
              <p className="mt-1 text-[11px] text-ink/50">Ещё непрочитанных: {unreadCount - 1}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => markRead(latestUnread.id)}
            className="shrink-0 rounded-full border border-caramel/40 px-2.5 py-1 text-[11px] font-semibold text-caramel-dark transition-colors hover:bg-cream-200/70"
          >
            Прочитано
          </button>
        </div>
      )}

      {list.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon="gift"
          title={
            tab === 'active'
              ? 'Активных заказов нет'
              : tab === 'completed'
                ? 'Завершённых заказов нет'
                : 'Отменённых заказов нет'
          }
          text={
            tab === 'active'
              ? 'Оформите первый заказ — он появится здесь со статусом «Новый», даже если интернет пропадёт.'
              : tab === 'completed'
                ? 'Когда заказ будет готов и получен, он переедет в этот список.'
                : 'Здесь появятся заказы, которые не удалось подтвердить.'
          }
          action={
            <Link to="/builder" className={buttonStyles('primary', 'md')}>
              <Icon name="cake" className="size-4" />
              Собрать торт
            </Link>
          }
        />
      ) : (
        <ul className="mt-6 space-y-3">
          {list.map((order) => (
            <li key={order.id}>
              <button
                type="button"
                onClick={() => {
                  setSelectedId(order.id);
                  notifications
                    .filter((item) => item.orderId === order.id && !item.readAt)
                    .forEach((item) => markRead(item.id));
                }}
                className="w-full rounded-3xl border border-line bg-cream-50 p-4 text-left shadow-card transition-all duration-200 ease-silk hover:-translate-y-0.5 hover:shadow-soft"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display text-lg text-cocoa">Заказ {order.number}</p>
                    <p className="mt-1 text-xs text-ink/55">
                      {formatDateTimeRu(order.createdAt)} · {order.items.length} поз. ·{' '}
                      {formatDateRu(order.delivery.date)}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink/75">
                      {order.items.map((item) => item.title).join(', ')}
                    </p>
                    {getOrderComment(order) && (
                      <p className="mt-1.5 line-clamp-2 text-xs italic leading-relaxed text-ink/55">
                        «{getOrderComment(order)}»
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span
                      className={cn(
                        'inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide',
                        ORDER_STATUS_STYLES[order.status],
                      )}
                    >
                      {ORDER_STATUS_LABELS[order.status]}
                    </span>
                    <p className="mt-2 font-display text-lg font-semibold text-caramel-dark">
                      {formatPrice(order.total)}
                    </p>
                  </div>
                </div>

                <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-caramel-dark">
                  Подробнее о заказе
                  <Icon name="chevronDown" className="size-3.5" />
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected ? `Заказ ${selected.number}` : 'Заказ'}
        footer={
          selected ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" fullWidth onClick={() => handleRepeat(selected)}>
                <Icon name="copy" className="size-4" />
                Повторить заказ
              </Button>
              <Button
                fullWidth
                onClick={() => {
                  setSelectedId(null);
                  navigate('/builder');
                }}
              >
                <Icon name="cake" className="size-4" />
                Собрать новый
              </Button>
            </div>
          ) : null
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span
                className={cn(
                  'inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide',
                  ORDER_STATUS_STYLES[selected.status],
                )}
              >
                {ORDER_STATUS_LABELS[selected.status]}
              </span>
              <p className="text-xs text-ink/55">
                Оформлен {formatDateTimeRu(selected.createdAt)}
              </p>
            </div>

            <p className="rounded-2xl bg-cream-100 px-3.5 py-2.5 text-xs leading-relaxed text-ink/70">
              {ORDER_STATUS_CUSTOMER_TEXT[selected.status]}
            </p>

            <ul className="space-y-3">
              {selected.items.map((item) => (
                <li key={item.id} className="rounded-2xl border border-line bg-cream-100/60 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-cocoa">{item.title}</p>
                    <p className="shrink-0 text-sm font-semibold text-caramel-dark">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                  <ul className="mt-1.5 space-y-0.5 text-xs leading-relaxed text-ink/65">
                    {item.composition.map((row) => (
                      <li key={row}>· {row}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>

            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-ink/60">Клиент</dt>
                <dd className="text-right font-semibold text-cocoa">
                  {selected.customer.name}
                  <br />
                  <span className="font-normal text-ink/70">{selected.customer.phone}</span>
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink/60">Получение</dt>
                <dd className="max-w-[60%] text-right font-semibold text-cocoa">
                  {selected.delivery.method === 'delivery'
                    ? `Доставка · ${selected.delivery.address ?? ''}`
                    : 'Самовывоз'}
                  <br />
                  <span className="font-normal text-ink/70">
                    {formatDateRu(selected.delivery.date)}, {selected.delivery.timeSlot}
                  </span>
                </dd>
              </div>
              {getOrderComment(selected) && (
                <div className="flex justify-between gap-3">
                  <dt className="text-ink/60">Комментарий</dt>
                  <dd className="max-w-[60%] whitespace-pre-line text-right text-ink/80">
                    {getOrderComment(selected)}
                  </dd>
                </div>
              )}
              {selected.customer.contact && (
                <div className="flex justify-between gap-3">
                  <dt className="text-ink/60">Мессенджер</dt>
                  <dd className="max-w-[60%] text-right text-ink/80">
                    <ContactLink contact={selected.customer.contact} />
                  </dd>
                </div>
              )}
              <div className="flex justify-between gap-3">
                <dt className="text-ink/60">Доставка</dt>
                <dd className="font-semibold text-cocoa">
                  {selected.deliveryFee > 0 ? formatPrice(selected.deliveryFee) : 'бесплатно'}
                </dd>
              </div>
              <div className="flex justify-between gap-3 border-t border-line/70 pt-2">
                <dt className="font-semibold text-cocoa">Итого</dt>
                <dd className="font-display text-lg font-semibold text-caramel-dark">
                  {formatPrice(selected.total)}
                </dd>
              </div>
            </dl>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink/45">
                История статусов
              </p>
              <ol className="mt-2 space-y-1.5">
                {selected.statusHistory.map((event, index) => (
                  <li
                    key={`${event.at}-${index}`}
                    className="flex items-start justify-between gap-3 text-xs"
                  >
                    <span className="text-ink/75">{ORDER_STATUS_LABELS[event.status]}</span>
                    <span className="shrink-0 text-ink/45">{formatDateTimeRu(event.at)}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-2xl bg-cream-100 px-3.5 py-3 text-xs">
              <p className="flex items-center gap-1.5 font-semibold text-cocoa">
                <Icon name="telegram" className="size-3.5 text-caramel" />
                {SYNC_STATUS_LABELS[selected.syncStatus]}
              </p>
              {selected.syncError && <p className="mt-1 text-berry-dark">{selected.syncError}</p>}
              <div className="mt-2.5 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => void handleRetry(selected)}
                  disabled={retrying}
                >
                  <Icon name="telegram" className="size-3.5" />
                  {retrying ? 'Отправляем…' : 'Отправить повторно'}
                </Button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                void removeOrder(selected.id)
                  .then(() => {
                    setSelectedId(null);
                    showToast('Заказ удалён из истории', 'info');
                  })
                  .catch(() => showToast('Не удалось удалить заказ', 'error'));
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-berry-dark transition-colors hover:underline"
            >
              <Icon name="trash" className="size-3.5" />
              Удалить заказ из истории
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
