import { describe, expect, it } from 'vitest';
import { buildDemoOrders } from '@/data/local/demoOrders';
import { localOrderRepository } from '@/data/local/orderRepository';
import type { OrderDraft } from '@/data/types';
import { cakeData } from '@/references';
import type { CakeConfig } from '@/types';
import { describeCake } from '@/utils/cake';
import { calculatePrice } from '@/utils/priceCalculator';

const TEST_CONFIG: CakeConfig = {
  sizeId: '1kg',
  baseId: 'sponge',
  fillingId: 'chocolate',
  creamId: 'cream',
  decorationIds: [],
  inscription: '',
};

/** Заказ, который «клиент» оформил в этом браузере до входа в кабинет. */
function buildDraft(): OrderDraft {
  const price = calculatePrice(TEST_CONFIG, cakeData).total;
  const description = describeCake(TEST_CONFIG, cakeData);

  return {
    items: [
      {
        id: 'cake_test',
        config: TEST_CONFIG,
        price,
        title: description.title,
        composition: description.composition,
      },
    ],
    customer: { name: 'Тестовый клиент', phone: '+7 (900) 123-45-67' },
    delivery: { method: 'pickup', date: '2026-12-01', timeSlot: '12:00–14:00' },
    subtotal: price,
    deliveryFee: 0,
    comment: 'Заказ клиента из браузера',
  };
}

describe('localOrderRepository: демо-набор кабинета', () => {
  it('подкладывает демо-заказы, сохраняет реальный заказ и не дублирует набор', async () => {
    const real = await localOrderRepository.create(buildDraft());
    const demoCount = buildDemoOrders().length;

    await localOrderRepository.ensureDemo?.();

    const afterSeed = localOrderRepository.listSync();
    expect(afterSeed.filter((order) => order.isDemo)).toHaveLength(demoCount);
    expect(afterSeed.find((order) => order.id === real.id)).toBeTruthy();
    expect(afterSeed).toHaveLength(demoCount + 1);

    // Список отсортирован по дате оформления: заказ клиента не уезжает в конец.
    const created = afterSeed.map((order) => new Date(order.createdAt).getTime());
    expect([...created].sort((a, b) => b - a)).toEqual(created);

    // Повторный ensureDemo не создаёт дубликаты и не сбрасывает статусы.
    const demoOrder = afterSeed.find((order) => order.isDemo);
    if (!demoOrder) throw new Error('Демо-заказы не загрузились');

    await localOrderRepository.updateStatus(demoOrder.id, 'ready', 'owner');
    await localOrderRepository.ensureDemo?.();

    const again = localOrderRepository.listSync();
    expect(again).toHaveLength(demoCount + 1);
    expect(again.find((order) => order.id === demoOrder.id)?.status).toBe('ready');
  });

  it('пересоздаёт набор по кнопке «Загрузить демо-заказы», не трогая реальные', async () => {
    const real = await localOrderRepository.create(buildDraft());
    const demoCount = buildDemoOrders().length;

    const seeded = await localOrderRepository.seedDemo?.();
    const after = localOrderRepository.listSync();

    expect(seeded).toHaveLength(demoCount);
    expect(after.filter((order) => order.isDemo)).toHaveLength(demoCount);
    expect(after.some((order) => order.id === real.id)).toBe(true);
  });
});
