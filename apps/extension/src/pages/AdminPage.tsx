import { useEffect, useRef, useState } from 'react';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { AdminOrderCard } from '@/components/admin/AdminOrderCard';
import { CustomersTable } from '@/components/admin/CustomersTable';
import { OrderDetailModal } from '@/components/admin/OrderDetailModal';
import { RevenueChart } from '@/components/admin/RevenueChart';
import { StatCards } from '@/components/admin/StatCards';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { useOrders } from '@/hooks/useOrders';
import { useOwnerSession } from '@/hooks/useOwnerSession';
import { useToast } from '@/hooks/useToast';
import { businessSettings, siteContent } from '@/references';
import type { OrderStatus } from '@/types';
import { cn } from '@/utils/cn';
import { aggregateCustomers } from '@/utils/customerStats';
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from '@/utils/orderStatus';

type Filter = 'all' | OrderStatus;
type AdminTab = 'orders' | 'customers';

/** Окно KPI и графика: демо-данные покрывают последнюю неделю. */
const DASHBOARD_DAYS = 7;

/** Кабинет владельца: KPI, график, заказы, статусы и прибыль. Демо-режим. */
export function AdminPage() {
  const { isOwner, login, logout, owner } = useOwnerSession();
  const { orders, loading, updateStatus, updateNote, seedDemo, ensureDemo } = useOrders();
  const { showToast } = useToast();

  const [tab, setTab] = useState<AdminTab>('orders');
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const autoSeeded = useRef(false);

  // Демо-кабинет не должен открываться пустым: при входе подкладываем
  // примеры заказов, даже если в браузере уже есть заказ клиента.
  // ensureDemo сам решает, нужен ли набор: он не дублирует заказы
  // и не перезаписывает статусы, если демо-данные уже актуальны.
  useEffect(() => {
    if (!isOwner || autoSeeded.current || loading) return;
    if (!businessSettings.admin.demoSeed) return;

    autoSeeded.current = true;
    void ensureDemo().catch(() => {
      // Тихо: кнопка «Загрузить демо-заказы» остаётся на месте.
    });
  }, [isOwner, loading, ensureDemo]);

  if (!isOwner) return <AdminLogin onLogin={login} />;

  const selected = selectedId ? orders.find((order) => order.id === selectedId) : undefined;
  const query = search.trim().toLowerCase();

  const filtered = orders.filter((order) => {
    if (filter !== 'all' && order.status !== filter) return false;
    if (!query) return true;

    return [order.number, order.customer.name, order.customer.phone].some((value) =>
      value.toLowerCase().includes(query),
    );
  });

  const countFor = (value: Filter) =>
    value === 'all' ? orders.length : orders.filter((order) => order.status === value).length;

  const customerCount = aggregateCustomers(orders).length;

  const handleStatusChange = async (status: OrderStatus) => {
    if (!selected) return;

    try {
      await updateStatus(selected.id, status);
      showToast(`Статус заказа: ${ORDER_STATUS_LABELS[status]}`);
    } catch {
      showToast('Не удалось изменить статус', 'error');
    }
  };

  const handleQuickStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await updateStatus(orderId, status);
      showToast(`Статус заказа: ${ORDER_STATUS_LABELS[status]}`);
    } catch {
      showToast('Не удалось изменить статус', 'error');
    }
  };

  const handleSaveNote = async (note: string) => {
    if (!selected) return;

    try {
      await updateNote(selected.id, note);
      showToast('Заметка сохранена');
    } catch {
      showToast('Не удалось сохранить заметку', 'error');
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedDemo();
      showToast('Демо-заказы загружены');
    } catch {
      showToast('Не удалось загрузить демо-заказы', 'error');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="container-page py-8 lg:py-12">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-caramel-dark">
            {owner.title}
          </p>
          <h1 className="mt-1 font-display text-[clamp(1.75rem,3.6vw,2.5rem)] leading-tight text-cocoa">
            {owner.name}, добрый день
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge tone="gold">Демо-версия</Badge>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {businessSettings.admin.demoSeed && (
            <Button variant="outline" onClick={() => void handleSeed()} disabled={seeding}>
              <Icon name="sparkle" className="size-4" />
              {seeding ? 'Загружаем…' : 'Загрузить демо-заказы'}
            </Button>
          )}
          <Button variant="ghost" onClick={logout}>
            <Icon name="close" className="size-4" />
            Выйти
          </Button>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-caramel/30 bg-gold/10 px-4 py-3 text-xs leading-relaxed text-ink/70">
        <strong className="text-cocoa">Это демо-версия.</strong> Полноценная версия будет
        доступна после согласования с программистом — напишите в Telegram:{' '}
        <a
          href={siteContent.seller.telegramHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 font-semibold text-caramel-dark transition-colors hover:text-cocoa"
        >
          <Icon name="telegram" className="size-3.5" />
          {siteContent.seller.telegram}
        </a>
      </div>

      {loading && orders.length === 0 && (
        <p className="mt-4 text-xs text-ink/50">Загружаем заказы…</p>
      )}

      <StatCards orders={orders} days={DASHBOARD_DAYS} />
      <RevenueChart orders={orders} days={DASHBOARD_DAYS} />

      <section className="mt-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl text-cocoa">
              {tab === 'orders' ? 'Заказы' : 'Клиенты'}
            </h2>
            <p className="mt-1 text-xs text-ink/55">
              {tab === 'orders'
                ? 'Фильтры, поиск и действия по статусам.'
                : 'Кто заказывал, сколько потратил и когда последний раз.'}
            </p>
          </div>
          {tab === 'orders' && (
            <div className="w-full sm:w-72">
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Поиск: номер, имя или телефон"
                autoComplete="off"
              />
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5" role="tablist" aria-label="Разделы кабинета">
          {[
            { id: 'orders' as AdminTab, label: 'Заказы', count: orders.length },
            { id: 'customers' as AdminTab, label: 'Клиенты', count: customerCount },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => setTab(item.id)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                tab === item.id
                  ? 'border-caramel bg-gold/20 text-cocoa'
                  : 'border-line bg-cream-50 text-ink/70 hover:border-caramel/40',
              )}
            >
              {item.label}
              <span
                className={cn(
                  'rounded-full px-1.5 text-[10px]',
                  tab === item.id
                    ? 'bg-caramel/15 text-caramel-dark'
                    : 'bg-cream-200 text-ink/55',
                )}
              >
                {item.count}
              </span>
            </button>
          ))}
        </div>

        {tab === 'customers' ? (
          <CustomersTable orders={orders} />
        ) : (
          <>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {[
                { id: 'all' as Filter, label: 'Все' },
                ...ORDER_STATUSES.map((status) => ({
                  id: status as Filter,
                  label: ORDER_STATUS_LABELS[status],
                })),
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFilter(item.id)}
                  aria-pressed={filter === item.id}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                    filter === item.id
                      ? 'border-caramel bg-gold/20 text-cocoa'
                      : 'border-line bg-cream-50 text-ink/70 hover:border-caramel/40',
                  )}
                >
                  {item.label}
                  <span
                    className={cn(
                      'rounded-full px-1.5 text-[10px]',
                      filter === item.id
                        ? 'bg-caramel/15 text-caramel-dark'
                        : 'bg-cream-200 text-ink/55',
                    )}
                  >
                    {countFor(item.id)}
                  </span>
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <EmptyState
                className="mt-5"
                icon="gift"
                title={orders.length === 0 ? 'Заказов пока нет' : 'Ничего не найдено'}
                text={
                  orders.length === 0
                    ? 'Оформите заказ в конструкторе или загрузите демо-заказы, чтобы увидеть кабинет в работе.'
                    : 'Попробуйте изменить фильтр или поисковый запрос.'
                }
              />
            ) : (
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {filtered.map((order) => (
                  <AdminOrderCard
                    key={order.id}
                    order={order}
                    onOpen={() => setSelectedId(order.id)}
                    onStatusChange={(status) => void handleQuickStatus(order.id, status)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {selected && (
        <OrderDetailModal
          key={selected.id}
          order={selected}
          onClose={() => setSelectedId(null)}
          onStatusChange={(status) => void handleStatusChange(status)}
          onSaveNote={(note) => void handleSaveNote(note)}
        />
      )}
    </div>
  );
}
