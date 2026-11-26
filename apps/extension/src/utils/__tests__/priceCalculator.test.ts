import { describe, expect, it } from 'vitest';
import { cakeData, createDefaultConfig } from '@/references';
import type { CakeConfig } from '@/types';
import { calculatePrice, roundTo } from '@/utils/priceCalculator';

const fullConfig: CakeConfig = {
  sizeId: '2kg',
  baseId: 'honey',
  fillingId: 'fruit',
  creamId: 'cheese',
  decorationIds: ['berries', 'creamDecor'],
  inscription: 'С днём рождения!',
};

describe('calculatePrice', () => {
  it('считает полный состав по формуле из спецификации (7 100 ₽)', () => {
    const price = calculatePrice(fullConfig, cakeData);

    expect(price.base).toBe(4200);
    // round((250 + 320 + 350) * 1.9) = 1748
    expect(price.extras).toBe(1748);
    expect(price.decorations).toBe(850);
    expect(price.inscription).toBe(300);
    expect(price.total).toBe(7100);
  });

  it('не добавляет стоимость надписи, если текст пустой', () => {
    const price = calculatePrice({ ...fullConfig, inscription: '   ' }, cakeData);

    expect(price.inscription).toBe(0);
    expect(price.total).toBe(6800);
  });

  it('считает базовый состав без декора', () => {
    const config = createDefaultConfig();
    const price = calculatePrice({ ...config, decorationIds: [], inscription: '' }, cakeData);

    // 2 кг (4200) + round(350 * 1.9) = 665 -> 4865 -> округление до 10 = 4870
    expect(price.total).toBe(4870);
  });

  it('подставляет первый вариант при неизвестных id', () => {
    const price = calculatePrice(
      {
        sizeId: 'unknown',
        baseId: 'unknown',
        fillingId: 'unknown',
        creamId: 'unknown',
        decorationIds: ['unknown'],
        inscription: '',
      },
      cakeData,
    );

    // 1 кг (2400) + round((0 + 300 + 0) * 1) = 2700
    expect(price.total).toBe(2700);
  });

  it('округляет до шага из прайсинга', () => {
    expect(roundTo(7098, 10)).toBe(7100);
    expect(roundTo(2704, 10)).toBe(2700);
    expect(roundTo(2704, 0)).toBe(2704);
  });
});
