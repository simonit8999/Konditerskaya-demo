import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, buttonStyles } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { Modal } from '@/components/ui/Modal';
import { useCart } from '@/hooks/useCart';
import { useOrders } from '@/hooks/useOrders';
import { useToast } from '@/hooks/useToast';
import { siteContent } from '@/references';
import type { Order } from '@/types';
import { formatDateRu, formatDateTimeRu } from '@/utils/date';
import { formatPrice } from '@/utils/formatPrice';
import {
  NEXT_STATUS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_STYLES,
  SYNC_STATUS_LABELS,
} from '@/utils/orderStatus';
import { cn } from '@/utils/cn';

type Tab = 'active' | 'done';

/** Кабинет заказчика: активные и завершённые заказы, детали, повтор заказа. */
export function DashboardPage() {
  const { orders, retrySend, updateStatus, removeOrder } = useOrders();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [tab, setTab] = useState<Tab>('active');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  const activeOrders = orders.filter((order) => order.status !== 'delivered');
  const doneOrders = orders.filter((order) => order.status === 'delivered');
  const list = tab === 'active' ? activeOrders : doneOrders;
  const selected = selectedId ? orders.find((order) => order.id === selectedId) : undefined;

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
          { id: 'done' as Tab, label: 'Завершённые' },
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

      {list.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon="gift"
          title={tab === 'active' ? 'Активных заказов нет' : 'Завершённых заказов нет'}
          text={
            tab === 'active'
              ? 'Оформите первый заказ — он появится здесь со статусом «Новый», даже если интернет пропадёт.'
              : 'Когда заказ будет доставлен, он переедет в этот список.'
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
                onClick={() => setSelectedId(order.id)}
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
              {selected.delivery.comment && (
                <div className="flex justify-between gap-3">
                  <dt className="text-ink/60">Комментарий</dt>
                  <dd className="max-w-[60%] text-right text-ink/80">{selected.delivery.comment}</dd>
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
                {NEXT_STATUS[selected.status] && siteContent.brand.isDemo && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => updateStatus(selected.id, NEXT_STATUS[selected.status]!)}
                  >
                    Демо-статус: {ORDER_STATUS_LABELS[NEXT_STATUS[selected.status]!]}
                  </Button>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                removeOrder(selected.id);
                setSelectedId(null);
                showToast('Заказ удалён из истории', 'info');
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
