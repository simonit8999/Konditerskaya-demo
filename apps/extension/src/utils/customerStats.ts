import type { ContactHandle, Order } from '@/types';
import { addDays, startOfDay } from '@/utils/date';
import { isActiveStatus } from '@/utils/orderStatus';
import { normalizePhone } from '@/utils/phone';

/**
 * Аналитика кабинета владельца.
 *
 * Метрики считаются за последние 30 дней по дате оформления (`createdAt`),
 * а не по дате получения — так видно, сколько заказов пришло за период.
 *
 * Определения:
 *  - выручка — сумма `total` у заказов со статусом `completed` (доставлен);
 *  - число заказов — все, кроме отменённых;
 *  - «в работе» — `new` + `confirmed` + `ready`;
 *  - средний чек — выручка ÷ число доставленных;
 *  - популярный торт — по названиям `items[].title`: больше вхождений,
 *    при равенстве — больше сумма.
 */

export const STATS_PERIOD_DAYS = 30;

/** Заказы, оформленные за последние `days` дней (включая сегодняшний). */
export function getPeriodOrders(
  orders: Order[],
  days: number = STATS_PERIOD_DAYS,
  now: Date = new Date(),
): Order[] {
  const from = startOfDay(addDays(now, -(Math.max(1, days) - 1))).getTime();

  return orders.filter((order) => {
    const createdAt = new Date(order.createdAt).getTime();
    return Number.isFinite(createdAt) && createdAt >= from;
  });
}

export interface PopularCake {
  title: string;
  /** Сколько раз торт попал в заказы периода. */
  count: number;
  /** Сумма позиций с этим названием. */
  revenue: number;
}

/** Самый популярный торт периода: по вхождениям, затем по сумме. */
export function findPopularCake(orders: Order[]): PopularCake | null {
  const byTitle = new Map<string, PopularCake>();

  orders.forEach((order) => {
    if (order.status === 'declined') return;

    order.items.forEach((item) => {
      const title = item.title.trim();
      if (!title) return;

      const entry = byTitle.get(title) ?? { title, count: 0, revenue: 0 };
      entry.count += 1;
      entry.revenue += Number.isFinite(item.price) ? item.price : 0;
      byTitle.set(title, entry);
    });
  });

  const sorted = [...byTitle.values()].sort(
    (a, b) => b.count - a.count || b.revenue - a.revenue || a.title.localeCompare(b.title),
  );

  return sorted[0] ?? null;
}

export interface PeriodStats {
  periodDays: number;
  /** Заказы периода без отменённых. */
  ordersCount: number;
  completedCount: number;
  activeCount: number;
  declinedCount: number;
  revenue: number;
  profit: number;
  marginPercent: number;
  averageCheck: number;
  /** Сумма заказов в работе — деньги, которые ещё не получены. */
  potential: number;
  popularCake: PopularCake | null;
}

export function buildPeriodStats(
  orders: Order[],
  days: number = STATS_PERIOD_DAYS,
  now: Date = new Date(),
): PeriodStats {
  const period = getPeriodOrders(orders, days, now);
  const completed = period.filter((order) => order.status === 'completed');
  const active = period.filter((order) => isActiveStatus(order.status));

  const revenue = completed.reduce((sum, order) => sum + order.total, 0);
  const profit = completed.reduce((sum, order) => sum + order.finance.profit, 0);
  const potential = active.reduce((sum, order) => sum + order.total, 0);
  const declinedCount = period.filter((order) => order.status === 'declined').length;

  return {
    periodDays: days,
    ordersCount: period.length - declinedCount,
    completedCount: completed.length,
    activeCount: active.length,
    declinedCount,
    revenue,
    profit,
    marginPercent: revenue > 0 ? Math.round((profit / revenue) * 1000) / 10 : 0,
    averageCheck: completed.length > 0 ? Math.round(revenue / completed.length) : 0,
    potential,
    popularCake: findPopularCake(period),
  };
}

export interface CustomerSummary {
  /** Ключ группировки — нормализованный телефон. */
  key: string;
  /** Имя из последнего заказа. */
  name: string;
  /** Телефон в том виде, как его указали в последнем заказе. */
  phone: string;
  /** Заказы без отменённых. */
  ordersCount: number;
  deliveredCount: number;
  /** Сумма доставленных заказов. */
  spent: number;
  lastOrderAt: string;
  contact?: ContactHandle;
}

/**
 * Клиенты по номеру телефона: `+7 (999) 111-22-33` и `89991112233` — один человек.
 * Сортировка — по потраченной сумме, затем по свежести заказа.
 */
export function aggregateCustomers(orders: Order[]): CustomerSummary[] {
  const byPhone = new Map<string, CustomerSummary>();

  orders.forEach((order) => {
    const key = normalizePhone(order.customer.phone).trim() || order.customer.name.trim().toLowerCase();
    if (!key) return;

    const createdAt = new Date(order.createdAt).getTime();
    const entry = byPhone.get(key) ?? {
      key,
      name: order.customer.name,
      phone: order.customer.phone,
      ordersCount: 0,
      deliveredCount: 0,
      spent: 0,
      lastOrderAt: order.createdAt,
      contact: order.customer.contact,
    };

    if (order.status !== 'declined') entry.ordersCount += 1;

    if (order.status === 'completed') {
      entry.deliveredCount += 1;
      entry.spent += Number.isFinite(order.total) ? order.total : 0;
    }

    const lastAt = new Date(entry.lastOrderAt).getTime();
    if (Number.isFinite(createdAt) && (!Number.isFinite(lastAt) || createdAt > lastAt)) {
      entry.lastOrderAt = order.createdAt;
      entry.name = order.customer.name;
      entry.phone = order.customer.phone;
      entry.contact = order.customer.contact ?? entry.contact;
    }

    byPhone.set(key, entry);
  });

  return [...byPhone.values()]
    .filter((customer) => customer.ordersCount > 0)
    .sort((a, b) => b.spent - a.spent || b.lastOrderAt.localeCompare(a.lastOrderAt));
}
