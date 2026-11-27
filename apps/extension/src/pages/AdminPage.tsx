import { useState } from 'react';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { AdminOrderCard } from '@/components/admin/AdminOrderCard';
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
import { businessSettings } from '@/references';
import type { OrderStatus } from '@/types';
import { cn } from '@/utils/cn';
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from '@/utils/orderStatus';

type Filter = 'all' | OrderStatus;

/** Кабинет владельца: KPI, график, заказы, статусы и прибыль. Демо-режим. */
export function AdminPage() {
  const { isOwner, login, logout, owner } = useOwnerSession();
  const { orders, loading, updateStatus, updateNote, seedDemo } = useOrders();
  const { showToast } = useToast();

  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

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

  const handleStatusChange = async (status: OrderStatus) => {
    if (!selected) return;

    try {
      await updateStatus(selected.id, status);
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
            <Badge tone="gold">Демо-режим</Badge>
            <span className="text-xs text-ink/55">Заказы хранятся в этом браузере</span>
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
        <strong className="text-cocoa">Это демо-кабинет.</strong> Пока данные хранятся в этом
        браузере. Для заказов с других устройств нужен сервер и БД — архитектура и схема уже
        подготовлены (<code className="text-cocoa">docs/database-schema.md</code>).
      </div>

      {loading && orders.length === 0 && (
        <p className="mt-4 text-xs text-ink/50">Загружаем заказы…</p>
      )}

      <StatCards orders={orders} />
      <RevenueChart orders={orders} />

      <section className="mt-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl text-cocoa">Заказы</h2>
            <p className="mt-1 text-xs text-ink/55">Фильтры, поиск и действия по статусам.</p>
          </div>
          <div className="w-full sm:w-72">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Поиск: номер, имя или телефон"
              autoComplete="off"
            />
          </div>
        </div>

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
              />
            ))}
          </div>
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
