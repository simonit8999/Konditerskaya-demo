import { buildDemoOrders } from '@/data/local/demoOrders';
import type { OrderDraft, OrderFilter, OrderRepository } from '@/data/types';
import { isDemoMode } from '@/services/ordersService';
import type { ActorRole, Order, OrderStatus, SyncStatus } from '@/types';
import { createId, createOrderNumber } from '@/utils/id';
import { calculateOrderFinance } from '@/utils/orderFinance';
import { migrateOrders } from '@/utils/orderMigration';

export const ORDERS_STORAGE_KEY = 'candys-paradise.orders.v1';

type Listener = (orders: Order[]) => void;

let cache: Order[] | null = null;
const listeners = new Set<Listener>();
let storageBound = false;

function readStorage(): Order[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    const migrated = migrateOrders(parsed);

    // Первый запуск новой версии: сохраняем данные уже в актуальном формате.
    if (JSON.stringify(parsed) !== JSON.stringify(migrated)) {
      window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(migrated));
    }

    return migrated;
  } catch {
    return [];
  }
}

function listSync(): Order[] {
  if (cache === null) cache = readStorage();
  return cache;
}

function notify(): void {
  const snapshot = listSync();
  listeners.forEach((listener) => listener(snapshot));
}

function ensureStorageListener(): void {
  if (storageBound || typeof window === 'undefined') return;
  storageBound = true;

  // Владелец в одной вкладке, клиент в другой: обновляемся без перезагрузки.
  window.addEventListener('storage', (event) => {
    if (event.key !== ORDERS_STORAGE_KEY) return;
    cache = null;
    notify();
  });
}

function persist(orders: Order[]): void {
  cache = orders;

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch {
      // Приватный режим или переполнение квоты — работаем только в памяти.
    }
  }

  notify();
}

function updateOrder(id: string, updater: (order: Order) => Order): Order {
  const orders = listSync();
  const target = orders.find((order) => order.id === id);
  if (!target) throw new Error('Заказ не найден');

  const updated = updater(target);
  persist(orders.map((order) => (order.id === id ? updated : order)));
  return updated;
}

function statusTimestamp(status: OrderStatus, at: string): Partial<Order> {
  switch (status) {
    case 'confirmed':
      return { confirmedAt: at };
    case 'ready':
      return { readyAt: at };
    case 'completed':
      return { completedAt: at };
    case 'declined':
      return { declinedAt: at };
    default:
      return {};
  }
}

function matchesFilter(order: Order, filter: OrderFilter): boolean {
  if (filter.status && order.status !== filter.status) return false;

  const search = filter.search?.trim().toLowerCase();
  if (!search) return true;

  return [order.number, order.customer.name, order.customer.phone, order.customer.email ?? ''].some(
    (value) => value.toLowerCase().includes(search),
  );
}

export const localOrderRepository: OrderRepository = {
  listSync,

  subscribe(listener) {
    ensureStorageListener();
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  async list(filter) {
    const orders = listSync();
    return filter ? orders.filter((order) => matchesFilter(order, filter)) : orders;
  },

  async get(id) {
    return listSync().find((order) => order.id === id) ?? null;
  },

  async create(draft: OrderDraft) {
    const now = new Date().toISOString();
    const total = draft.subtotal + draft.deliveryFee;

    const order: Order = {
      id: createId('order'),
      number: createOrderNumber(),
      items: draft.items,
      customer: draft.customer,
      delivery: draft.delivery,
      subtotal: draft.subtotal,
      deliveryFee: draft.deliveryFee,
      total,
      status: 'new',
      createdAt: now,
      syncStatus: isDemoMode ? 'demo' : 'sent',
      comment: draft.comment,
      finance: calculateOrderFinance({
        items: draft.items,
        deliveryMethod: draft.delivery.method,
        total,
      }),
      statusHistory: [{ status: 'new', at: now, actor: 'customer' }],
    };

    persist([order, ...listSync()]);
    return order;
  },

  async updateStatus(id, status, actor: ActorRole, note?: string) {
    const at = new Date().toISOString();

    return updateOrder(id, (order) => ({
      ...order,
      status,
      statusHistory: [...order.statusHistory, { status, at, actor, note }],
      ...statusTimestamp(status, at),
    }));
  },

  async updateNote(id, note: string) {
    return updateOrder(id, (order) => ({
      ...order,
      ownerNote: note.trim() || undefined,
    }));
  },

  async updateSync(id, syncStatus: SyncStatus, syncError?: string) {
    return updateOrder(id, (order) => ({
      ...order,
      syncStatus,
      syncError: syncStatus === 'failed' ? syncError : undefined,
    }));
  },

  async remove(id) {
    persist(listSync().filter((order) => order.id !== id));
  },

  async seedDemo() {
    // Демо-заказы заменяют предыдущий набор, реальные заказы не трогаем.
    const real = listSync().filter((order) => !order.isDemo);
    const demo = buildDemoOrders();
    persist([...demo, ...real]);
    return demo;
  },
};
