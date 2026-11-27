import { describe, expect, it } from 'vitest';
import type { Order, OrderStatus } from '@/types';
import {
  aggregateCustomers,
  buildPeriodStats,
  findPopularCake,
  getPeriodOrders,
} from '@/utils/customerStats';
import { addDays, toISODate } from '@/utils/date';

/** Фиксированная «сегодня» — тесты не зависят от календаря. */
const NOW = new Date('2026-11-27T12:00:00');

let counter = 0;

function daysAgo(days: number): string {
  return addDays(NOW, -days).toISOString();
}

interface OrderOverrides {
  phone?: string;
  name?: string;
  status?: OrderStatus;
  createdDaysAgo?: number;
  total?: number;
  profit?: number;
  titles?: string[];
}

function makeOrder(overrides: OrderOverrides = {}): Order {
  const titles = overrides.titles ?? ['Торт «Ягодный»'];
  const total = overrides.total ?? 5000;
  counter += 1;

  return {
    id: `order-${counter}`,
    number: `З-10${counter}`,
    items: titles.map((title, index) => ({
      id: `item-${counter}-${index}`,
      config: {
        sizeId: '2kg',
        baseId: 'sponge',
        fillingId: 'berry',
        creamId: 'cream',
        decorationIds: [],
        inscription: '',
      },
      price: Math.round(total / titles.length),
      title,
      composition: [],
    })),
    customer: {
      name: overrides.name ?? 'Мария Соколова',
      phone: overrides.phone ?? '+7 (999) 111-22-33',
    },
    delivery: {
      method: 'pickup',
      date: toISODate(addDays(NOW, 2)),
      timeSlot: '12:00–14:00',
    },
    subtotal: total,
    deliveryFee: 0,
    total,
    status: overrides.status ?? 'completed',
    createdAt: daysAgo(overrides.createdDaysAgo ?? 1),
    syncStatus: 'demo',
    finance: {
      itemsCost: 0,
      packagingCost: 0,
      deliveryCost: 0,
      costTotal: 0,
      profit: overrides.profit ?? 0,
      marginPercent: 0,
    },
    statusHistory: [],
  };
}

describe('getPeriodOrders', () => {
  it('берёт заказы последних 30 дней по дате оформления', () => {
    const orders = [
      makeOrder({ createdDaysAgo: 0 }),
      makeOrder({ createdDaysAgo: 29 }),
      makeOrder({ createdDaysAgo: 30 }),
      makeOrder({ createdDaysAgo: 45 }),
    ];

    expect(getPeriodOrders(orders, 30, NOW)).toHaveLength(2);
  });

  it('не падает на некорректной дате оформления', () => {
    const broken = { ...makeOrder(), createdAt: 'не дата' } as Order;
    expect(getPeriodOrders([broken], 30, NOW)).toHaveLength(0);
  });
});

describe('buildPeriodStats', () => {
  it('считает выручку, прибыль, средний чек и заказы в работе', () => {
    const stats = buildPeriodStats(
      [
        makeOrder({ status: 'completed', total: 6000, profit: 3000 }),
        makeOrder({ status: 'completed', total: 4000, profit: 1000 }),
        makeOrder({ status: 'confirmed', total: 5000 }),
        makeOrder({ status: 'new', total: 3000 }),
        makeOrder({ status: 'declined', total: 9000 }),
      ],
      30,
      NOW,
    );

    expect(stats.periodDays).toBe(30);
    expect(stats.ordersCount).toBe(4);
    expect(stats.completedCount).toBe(2);
    expect(stats.activeCount).toBe(2);
    expect(stats.declinedCount).toBe(1);
    expect(stats.revenue).toBe(10000);
    expect(stats.profit).toBe(4000);
    expect(stats.marginPercent).toBe(40);
    expect(stats.averageCheck).toBe(5000);
    expect(stats.potential).toBe(8000);
  });

  it('не учитывает заказы старше периода', () => {
    const stats = buildPeriodStats(
      [
        makeOrder({ status: 'completed', total: 7000 }),
        makeOrder({ status: 'completed', total: 9000, createdDaysAgo: 60 }),
      ],
      30,
      NOW,
    );

    expect(stats.ordersCount).toBe(1);
    expect(stats.revenue).toBe(7000);
  });

  it('возвращает нули для пустого списка', () => {
    expect(buildPeriodStats([], 30, NOW)).toMatchObject({
      ordersCount: 0,
      completedCount: 0,
      activeCount: 0,
      revenue: 0,
      profit: 0,
      marginPercent: 0,
      averageCheck: 0,
      popularCake: null,
    });
  });

  it('находит самый популярный торт периода', () => {
    const stats = buildPeriodStats(
      [
        makeOrder({ titles: ['Медовик', 'Медовик'] }),
        makeOrder({ titles: ['Медовик', 'Прага'] }),
        makeOrder({ titles: ['Прага'], status: 'declined' }),
      ],
      30,
      NOW,
    );

    expect(stats.popularCake).toEqual({ title: 'Медовик', count: 3, revenue: 7500 });
  });
});

describe('findPopularCake', () => {
  it('при равенстве вхождений выбирает торт с большей суммой', () => {
    const orders = [
      makeOrder({ titles: ['Тортик'], total: 1000 }),
      makeOrder({ titles: ['Прага'], total: 3000 }),
    ];

    expect(findPopularCake(orders)?.title).toBe('Прага');
  });

  it('игнорирует отменённые заказы и пустые названия', () => {
    const orders = [
      makeOrder({ titles: ['Медовик'], status: 'declined' }),
      makeOrder({ titles: ['   '] }),
    ];

    expect(findPopularCake(orders)).toBeNull();
  });
});

describe('aggregateCustomers', () => {
  it('группирует повторных клиентов по нормализованному телефону', () => {
    const customers = aggregateCustomers([
      makeOrder({ phone: '+7 (999) 111-22-33', name: 'Мария', total: 5000, createdDaysAgo: 20 }),
      makeOrder({ phone: '89991112233', name: 'Мария Соколова', total: 7000, createdDaysAgo: 5 }),
      makeOrder({
        phone: '+7 (999) 111-22-33',
        name: 'Мария С.',
        total: 9000,
        status: 'declined',
        createdDaysAgo: 3,
      }),
      makeOrder({ phone: '+7 (999) 222-33-44', name: 'Игорь Петров', total: 3000, createdDaysAgo: 10 }),
    ]);

    expect(customers).toHaveLength(2);

    const [maria, igor] = customers;
    expect(maria.name).toBe('Мария С.');
    expect(maria.phone).toBe('+7 (999) 111-22-33');
    expect(maria.ordersCount).toBe(2);
    expect(maria.deliveredCount).toBe(2);
    expect(maria.spent).toBe(12000);

    expect(igor.name).toBe('Игорь Петров');
    expect(igor.spent).toBe(3000);
  });

  it('сортирует клиентов по потраченной сумме', () => {
    const customers = aggregateCustomers([
      makeOrder({ phone: '+7 (900) 000-00-01', total: 1000 }),
      makeOrder({ phone: '+7 (900) 000-00-02', total: 8000 }),
      makeOrder({ phone: '+7 (900) 000-00-03', total: 4000 }),
    ]);

    expect(customers.map((customer) => customer.spent)).toEqual([8000, 4000, 1000]);
  });

  it('не показывает клиентов только с отменёнными заказами', () => {
    expect(aggregateCustomers([makeOrder({ status: 'declined' })])).toHaveLength(0);
  });
});
