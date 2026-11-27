import { describe, expect, it } from 'vitest';
import { businessSettings } from '@/references';
import { calculateOrderFinance } from '@/utils/orderFinance';
import { migrateOrder, migrateOrderStatus, migrateOrders } from '@/utils/orderMigration';

const legacyOrder = {
  id: 'order_1',
  number: 'КР-100001',
  items: [
    {
      id: 'cake_1',
      config: {
        sizeId: '2kg',
        baseId: 'honey',
        fillingId: 'berry',
        creamId: 'cheese',
        decorationIds: ['berries'],
        inscription: 'Ане 30',
      },
      price: 7100,
      title: 'Торт 2 кг · Медовик',
      composition: ['Вес: 2 кг', 'Основа: Медовик'],
    },
  ],
  customer: {
    name: 'Анна',
    phone: '+7 (999) 123-45-67',
    email: 'anna@example.com',
  },
  delivery: {
    method: 'delivery',
    date: '2026-12-01',
    timeSlot: '12:00–14:00',
    address: 'ул. Примерная, 1',
    comment: 'без орехов',
  },
  subtotal: 7100,
  deliveryFee: 300,
  total: 7400,
  status: 'processing',
  createdAt: '2026-11-20T10:00:00.000Z',
  syncStatus: 'demo',
};

const expectedFinance = calculateOrderFinance({
  items: [{ price: 7100 }],
  deliveryMethod: 'delivery',
  total: 7400,
  settings: businessSettings.finance,
});

describe('migrateOrderStatus', () => {
  it('переводит старые статусы в новую модель', () => {
    expect(migrateOrderStatus('processing')).toBe('confirmed');
    expect(migrateOrderStatus('delivered')).toBe('completed');
    expect(migrateOrderStatus('new')).toBe('new');
    expect(migrateOrderStatus('ready')).toBe('ready');
    expect(migrateOrderStatus('declined')).toBe('declined');
    expect(migrateOrderStatus('unknown')).toBe('new');
  });
});

describe('migrateOrder', () => {
  it('поднимает комментарий из delivery и считает финансы', () => {
    const order = migrateOrder(legacyOrder);

    expect(order).not.toBeNull();
    expect(order?.status).toBe('confirmed');
    expect(order?.comment).toBe('без орехов');
    expect(order?.delivery.comment).toBe('без орехов');
    expect(order?.finance).toEqual(expectedFinance);
    expect(order?.statusHistory).toHaveLength(1);
    expect(order?.statusHistory[0]).toMatchObject({
      status: 'confirmed',
      at: legacyOrder.createdAt,
      actor: 'system',
    });
  });

  it('переводит delivered в completed и предпочитает новый комментарий', () => {
    const order = migrateOrder({ ...legacyOrder, status: 'delivered', comment: 'позвонить' });

    expect(order?.status).toBe('completed');
    expect(order?.comment).toBe('позвонить');
  });

  it('сохраняет мессенджер и отбрасывает неизвестный канал', () => {
    const withContact = migrateOrder({
      ...legacyOrder,
      customer: {
        ...legacyOrder.customer,
        contact: { channel: 'telegram', handle: '@anna' },
      },
    });
    expect(withContact?.customer.contact).toEqual({ channel: 'telegram', handle: '@anna' });

    const withBrokenContact = migrateOrder({
      ...legacyOrder,
      customer: {
        ...legacyOrder.customer,
        contact: { channel: 'fax', handle: '123' },
      },
    });
    expect(withBrokenContact?.customer.contact).toBeUndefined();
  });

  it('не пересчитывает уже сохранённый снимок финансов', () => {
    const finance = {
      itemsCost: 1,
      packagingCost: 2,
      deliveryCost: 3,
      costTotal: 6,
      profit: 7394,
      marginPercent: 99.9,
    };

    expect(migrateOrder({ ...legacyOrder, finance })?.finance).toEqual(finance);
  });

  it('возвращает null для повреждённых записей', () => {
    expect(migrateOrder(null)).toBeNull();
    expect(migrateOrder({ ...legacyOrder, items: [] })).toBeNull();
    expect(migrateOrder({ ...legacyOrder, customer: { name: '' } })).toBeNull();
    expect(migrateOrder({ ...legacyOrder, delivery: { method: 'pickup' } })).toBeNull();
    expect(migrateOrder({ ...legacyOrder, id: '' })).toBeNull();
  });

  it('фильтрует повреждённые записи в списке', () => {
    const orders = migrateOrders([legacyOrder, null, { id: 'broken' }]);

    expect(orders).toHaveLength(1);
    expect(orders[0].id).toBe('order_1');
    expect(migrateOrders('не массив')).toEqual([]);
  });
});
