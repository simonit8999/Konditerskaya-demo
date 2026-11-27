import type {
  NotificationAudience,
  NotificationType,
  Order,
  OrderNotification,
  OrderStatus,
} from '@/types';
import { formatPrice } from '@/utils/formatPrice';

export const NOTIFICATIONS_STORAGE_KEY = 'candys-paradise.notifications.v1';

type Listener = (items: OrderNotification[]) => void;

let cache: OrderNotification[] | null = null;
let initialized = false;
/** Первый синк на старте: старую историю не показываем как непрочитанную. */
let didInitialSync = false;
const listeners = new Set<Listener>();
let storageBound = false;

function isAudience(value: unknown): value is NotificationAudience {
  return value === 'customer' || value === 'owner';
}

function parse(value: unknown): OrderNotification[] {
  if (!Array.isArray(value)) return [];

  const items: OrderNotification[] = [];
  value.forEach((raw) => {
    if (!raw || typeof raw !== 'object') return;
    const record = raw as Record<string, unknown>;

    if (
      typeof record.id !== 'string' ||
      typeof record.orderId !== 'string' ||
      typeof record.orderNumber !== 'string' ||
      typeof record.title !== 'string' ||
      typeof record.body !== 'string' ||
      typeof record.createdAt !== 'string' ||
      !isAudience(record.audience)
    ) {
      return;
    }

    items.push({
      id: record.id,
      orderId: record.orderId,
      orderNumber: record.orderNumber,
      audience: record.audience,
      type: (typeof record.type === 'string' ? record.type : 'order_note') as NotificationType,
      title: record.title,
      body: record.body,
      createdAt: record.createdAt,
      readAt: typeof record.readAt === 'string' ? record.readAt : undefined,
    });
  });

  return items;
}

function readStorage(): OrderNotification[] {
  if (typeof window === 'undefined') {
    initialized = true;
    return [];
  }

  try {
    const raw = window.localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    // Ключа ещё нет: это первый запуск, историю не помечаем как непрочитанную.
    initialized = raw !== null;
    return raw ? parse(JSON.parse(raw) as unknown) : [];
  } catch {
    initialized = true;
    return [];
  }
}

function listSync(): OrderNotification[] {
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

  window.addEventListener('storage', (event) => {
    if (event.key !== NOTIFICATIONS_STORAGE_KEY) return;
    cache = null;
    notify();
  });
}

function persist(items: OrderNotification[]): void {
  cache = items;

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Приватный режим — уведомления живут только в памяти.
    }
  }

  notify();
}

interface NotificationTemplate {
  audience: NotificationAudience;
  type: NotificationType;
  title: string;
  body: string;
}

function buildTemplate(order: Order, status: OrderStatus): NotificationTemplate | null {
  switch (status) {
    case 'new':
      return {
        audience: 'owner',
        type: 'order_created',
        title: 'Новый заказ',
        body: `${order.number} · ${order.customer.name} · ${formatPrice(order.total)}`,
      };
    case 'confirmed':
      return {
        audience: 'customer',
        type: 'order_confirmed',
        title: 'Заказ подтверждён',
        body: `${order.number}: кондитер подтвердил заказ и уже готовит его.`,
      };
    case 'ready':
      return {
        audience: 'customer',
        type: 'order_ready',
        title: 'Торт готов',
        body: `${order.number}: можно забирать или ждать доставку.`,
      };
    case 'completed':
      return {
        audience: 'customer',
        type: 'order_completed',
        title: 'Спасибо за заказ!',
        body: `${order.number}: заказ завершён. Будем рады видеть вас снова.`,
      };
    case 'declined':
      return {
        audience: 'customer',
        type: 'order_declined',
        title: 'Заказ не подтверждён',
        body: `${order.number}: свяжитесь с нами — попробуем найти решение.`,
      };
    default:
      return null;
  }
}

/**
 * Пересобирает уведомления из истории статусов заказов.
 * Так уведомление появляется и в другой вкладке: она получает обновлённые
 * заказы через storage-событие и сама добавляет недостающие записи.
 */
export function syncNotificationsFromOrders(orders: Order[]): void {
  ensureStorageListener();

  const current = listSync();
  const existing = new Map(current.map((item) => [item.id, item]));
  const backfillReadAt =
    !initialized && !didInitialSync ? new Date().toISOString() : undefined;

  const next: OrderNotification[] = [];
  orders.forEach((order) => {
    order.statusHistory.forEach((event, index) => {
      const template = buildTemplate(order, event.status);
      if (!template) return;

      const id = `ntf_${order.id}_${index}_${event.status}`;
      const previous = existing.get(id);

      next.push({
        id,
        orderId: order.id,
        orderNumber: order.number,
        audience: template.audience,
        type: template.type,
        title: template.title,
        body: template.body,
        createdAt: event.at,
        readAt: previous?.readAt ?? backfillReadAt,
      });
    });
  });

  next.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  if (JSON.stringify(next) !== JSON.stringify(current)) {
    persist(next);
  }

  // Дальше новые события считаются непрочитанными, даже если ключа не было.
  didInitialSync = true;
}

export const notificationRepository = {
  listSync,

  subscribe(listener: Listener): () => void {
    ensureStorageListener();
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  syncFromOrders: syncNotificationsFromOrders,

  markRead(id: string): void {
    const items = listSync();
    if (!items.some((item) => item.id === id && !item.readAt)) return;

    const readAt = new Date().toISOString();
    persist(items.map((item) => (item.id === id && !item.readAt ? { ...item, readAt } : item)));
  },

  markAllRead(audience: NotificationAudience): void {
    const items = listSync();
    if (!items.some((item) => item.audience === audience && !item.readAt)) return;

    const readAt = new Date().toISOString();
    persist(
      items.map((item) =>
        item.audience === audience && !item.readAt ? { ...item, readAt } : item,
      ),
    );
  },

  markReadByOrder(orderId: string, audience?: NotificationAudience): void {
    const items = listSync();
    const readAt = new Date().toISOString();
    let changed = false;

    const next = items.map((item) => {
      const match =
        item.orderId === orderId && !item.readAt && (!audience || item.audience === audience);
      if (!match) return item;
      changed = true;
      return { ...item, readAt };
    });

    if (changed) persist(next);
  },
};
