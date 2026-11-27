import { describe, expect, it } from 'vitest';
import { cakeData } from '@/references';
import type { CakeConfig } from '@/types';
import { recommendCakes, type AssistantAnswers } from '@/utils/cakeAssistant';
import { calculatePrice } from '@/utils/priceCalculator';

const baseAnswers: AssistantAnswers = {
  occasion: 'birthday',
  guests: 10,
  taste: 'berry',
  restrictions: [],
  style: 'classic',
  budget: 0,
};

function signature(config: CakeConfig): string {
  return [
    config.sizeId,
    config.baseId,
    config.fillingId,
    config.creamId,
    [...config.decorationIds].sort().join('+'),
    config.inscription,
  ].join('|');
}

describe('recommendCakes', () => {
  it('возвращает 2–3 варианта, первый — по количеству гостей', () => {
    const options = recommendCakes(baseAnswers);

    expect(options.length).toBeGreaterThanOrEqual(2);
    expect(options.length).toBeLessThanOrEqual(3);
    expect(options[0].config.sizeId).toBe('2kg');
    expect(options[0].price).toBe(calculatePrice(options[0].config, cakeData).total);
  });

  it('масштабирует вес: 1 кг для 6 гостей и 3 кг для 20', () => {
    expect(recommendCakes({ ...baseAnswers, guests: 6 })[0].config.sizeId).toBe('1kg');
    expect(recommendCakes({ ...baseAnswers, guests: 20 })[0].config.sizeId).toBe('3kg');
  });

  it('при глютене выбирает основу без глютена', () => {
    const options = recommendCakes({ ...baseAnswers, restrictions: ['gluten'] });

    options.forEach((option) => {
      const base = cakeData.bases.find((item) => item.id === option.config.baseId);
      expect(base?.allergens ?? []).not.toContain('gluten');
    });
    expect(options[0].config.baseId).toBe('mousse');
  });

  it('исключает мастику по ограничению', () => {
    const options = recommendCakes({
      ...baseAnswers,
      style: 'themed',
      restrictions: ['fondant'],
    });

    options.forEach((option) => {
      expect(option.config.decorationIds).not.toContain('fondant');
    });
    expect(options[0].config.decorationIds).toContain('figures');
  });

  it('заменяет ягодную начинку при ограничении по ягодам', () => {
    const options = recommendCakes({ ...baseAnswers, restrictions: ['berries'] });

    options.forEach((option) => {
      expect(option.config.fillingId).not.toBe('berry');
    });
  });

  it('помечает варианты выше бюджета и объясняет разницу', () => {
    const options = recommendCakes({ ...baseAnswers, budget: 1 });

    options.forEach((option) => {
      expect(option.withinBudget).toBe(false);
      expect(option.warnings.some((warning) => warning.startsWith('Выше бюджета'))).toBe(true);
    });
  });

  it('не предлагает два одинаковых состава', () => {
    const options = recommendCakes({ ...baseAnswers, style: 'minimal', guests: 6 });
    const signatures = options.map((option) => signature(option.config));

    expect(new Set(signatures).size).toBe(options.length);
  });
});
