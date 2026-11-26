import { describe, expect, it } from 'vitest';
import { cakeData } from '@/references';
import { configsEqual, describeCake, sanitizeInscription } from '@/utils/cake';
import type { CakeConfig } from '@/types';

const config: CakeConfig = {
  sizeId: '2kg',
  baseId: 'honey',
  fillingId: 'berry',
  creamId: 'cheese',
  decorationIds: ['berries', 'sprinkles'],
  inscription: 'Ане 30',
};

describe('cake helpers', () => {
  it('очищает надпись от недопустимых символов и ограничивает длину', () => {
    expect(sanitizeInscription('С днём рождения! <b>')).toBe('С днём рождения! b');
    expect(sanitizeInscription('я'.repeat(80))).toHaveLength(cakeData.pricing.maxInscriptionLength);
  });

  it('собирает описание состава для корзины и заказа', () => {
    const description = describeCake(config, cakeData);

    expect(description.title).toBe('Торт 2 кг · Медовик');
    expect(description.shortLine).toBe('2 кг · Медовик · Ягодная · Сырный');
    expect(description.composition).toHaveLength(6);
    expect(description.composition[4]).toBe('Декор: Свежие ягоды, Кондитерская посыпка');
    expect(description.composition[5]).toBe('Надпись: «Ане 30»');
  });

  it('пишет «без декора» и «без надписи», если они не выбраны', () => {
    const description = describeCake({ ...config, decorationIds: [], inscription: '' }, cakeData);

    expect(description.composition[4]).toBe('Декор: без декора');
    expect(description.composition[5]).toBe('Надпись: без надписи');
  });

  it('сравнивает составы независимо от порядка декора', () => {
    expect(configsEqual(config, { ...config, decorationIds: ['sprinkles', 'berries'] })).toBe(true);
    expect(configsEqual(config, { ...config, baseId: 'sponge' })).toBe(false);
  });
});
