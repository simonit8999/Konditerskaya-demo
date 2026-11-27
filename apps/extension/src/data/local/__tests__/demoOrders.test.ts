import { describe, expect, it } from 'vitest';
import { buildDemoOrders } from '@/data/local/demoOrders';
import { addDays, startOfDay } from '@/utils/date';
import { isActiveStatus } from '@/utils/orderStatus';

/** Начало дня в локальном времени: тест не зависит от часового пояса. */
function dayKey(iso: string): number {
  return startOfDay(new Date(iso)).getTime();
}

describe('buildDemoOrders', () => {
  const orders = buildDemoOrders();
  const now = new Date();
  const today = dayKey(now.toISOString());
  const todayOrders = orders.filter((order) => dayKey(order.createdAt) === today);

  it('даёт 15 заказов: 10 доставленных за 5 предыдущих дней и 5 за сегодня', () => {
    const fiveDaysAgo = dayKey(addDays(now, -5).toISOString());
    const pastOrders = orders.filter((order) => {
      const key = dayKey(order.createdAt);
      return key >= fiveDaysAgo && key < today;
    });

    expect(orders).toHaveLength(15);
    expect(todayOrders).toHaveLength(5);
    expect(pastOrders).toHaveLength(10);
    expect(pastOrders.every((order) => order.status === 'completed')).toBe(true);
  });

  it('считает выручку и прибыль по доставленным заказам', () => {
    const completed = orders.filter((order) => order.status === 'completed');

    expect(completed).toHaveLength(10);
    completed.forEach((order) => {
      expect(order.total).toBeGreaterThan(0);
      expect(order.finance.profit).toBeGreaterThan(0);
      expect(order.finance.marginPercent).toBeGreaterThan(0);
    });
  });

  it('оставляет сегодняшние заказы в работе — статусы и оплату можно менять', () => {
    expect(todayOrders).toHaveLength(5);
    expect(todayOrders.every((order) => isActiveStatus(order.status))).toBe(true);
  });

  it('не ставит события истории статусов в будущее', () => {
    const limit = Date.now();

    orders.forEach((order) => {
      order.statusHistory.forEach((event) => {
        expect(new Date(event.at).getTime()).toBeLessThanOrEqual(limit);
      });
    });
  });

  it('сортирует заказы по свежести и делает номера уникальными', () => {
    const created = orders.map((order) => new Date(order.createdAt).getTime());

    expect([...created].sort((a, b) => b - a)).toEqual(created);
    expect(new Set(orders.map((order) => order.number)).size).toBe(orders.length);
  });
});
