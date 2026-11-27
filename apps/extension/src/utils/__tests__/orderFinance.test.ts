import { describe, expect, it } from 'vitest';
import { calculateOrderFinance } from '@/utils/orderFinance';

const settings = {
  defaultCostRate: 0.35,
  packagingCostPerItem: 60,
  deliveryCost: 150,
};

describe('calculateOrderFinance', () => {
  it('считает себестоимость, прибыль и маржу для доставки', () => {
    const finance = calculateOrderFinance({
      items: [{ price: 4200 }],
      deliveryMethod: 'delivery',
      total: 4500,
      settings,
    });

    expect(finance.itemsCost).toBe(1470);
    expect(finance.packagingCost).toBe(60);
    expect(finance.deliveryCost).toBe(150);
    expect(finance.costTotal).toBe(1680);
    expect(finance.profit).toBe(2820);
    expect(finance.marginPercent).toBe(62.7);
  });

  it('не добавляет себестоимость доставки при самовывозе', () => {
    const finance = calculateOrderFinance({
      items: [{ price: 4200 }],
      deliveryMethod: 'pickup',
      total: 4200,
      settings,
    });

    expect(finance.deliveryCost).toBe(0);
    expect(finance.costTotal).toBe(1530);
    expect(finance.profit).toBe(2670);
    expect(finance.marginPercent).toBe(63.6);
  });

  it('считает упаковку за каждую позицию заказа', () => {
    const finance = calculateOrderFinance({
      items: [{ price: 1000 }, { price: 2000 }],
      deliveryMethod: 'pickup',
      total: 3000,
      settings,
    });

    expect(finance.itemsCost).toBe(1050);
    expect(finance.packagingCost).toBe(120);
    expect(finance.profit).toBe(1830);
    expect(finance.marginPercent).toBe(61);
  });

  it('ограничивает ставку и не делит на ноль', () => {
    const finance = calculateOrderFinance({
      items: [{ price: 1000 }],
      deliveryMethod: 'pickup',
      total: 0,
      settings: { defaultCostRate: 2, packagingCostPerItem: -10, deliveryCost: 0 },
    });

    expect(finance.itemsCost).toBe(1000);
    expect(finance.packagingCost).toBe(0);
    expect(finance.deliveryCost).toBe(0);
    expect(finance.profit).toBe(-1000);
    expect(finance.marginPercent).toBe(0);
  });

  it('игнорирует некорректные цены позиций', () => {
    const finance = calculateOrderFinance({
      items: [{ price: -500 }, { price: Number.NaN }],
      deliveryMethod: 'delivery',
      total: 1000,
      settings,
    });

    expect(finance.itemsCost).toBe(0);
    expect(finance.packagingCost).toBe(120);
    expect(finance.deliveryCost).toBe(150);
  });
});
