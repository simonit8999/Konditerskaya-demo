import type { CakeConfig, CakeData, PriceBreakdown } from '@/types';

/**
 * Расчёт стоимости торта.
 *
 * Формула:
 *   size.basePrice
 * + round(size.multiplier × (основа + начинка + крем))
 * + Σ цена декора
 * + надпись (если текст не пустой)
 * и округление до шага из pricing.rounding (10 ₽).
 *
 * Пример: 2 кг + медовик(250) + фруктовая(320) + сырный(350)
 * + ягоды(450) + кремовый декор(400) + надпись(300) = 7 100 ₽.
 */
export function calculatePrice(config: CakeConfig, data: CakeData): PriceBreakdown {
  const size = data.sizes.find((item) => item.id === config.sizeId) ?? data.sizes[0];
  const base = data.bases.find((item) => item.id === config.baseId) ?? data.bases[0];
  const filling = data.fillings.find((item) => item.id === config.fillingId) ?? data.fillings[0];
  const cream = data.creams.find((item) => item.id === config.creamId) ?? data.creams[0];

  const decorations = data.decorations.filter((item) => config.decorationIds.includes(item.id));

  const extrasRaw = base.extraPrice + filling.extraPrice + cream.extraPrice;
  const extras = Math.round(extrasRaw * size.multiplier);
  const decorationsTotal = decorations.reduce((sum, item) => sum + item.price, 0);
  const inscription = config.inscription.trim().length > 0 ? data.pricing.inscriptionPrice : 0;

  const total = roundTo(
    size.basePrice + extras + decorationsTotal + inscription,
    data.pricing.rounding,
  );

  return {
    base: size.basePrice,
    extras,
    decorations: decorationsTotal,
    inscription,
    total,
  };
}

/** Округление до шага (например, до 10 ₽). */
export function roundTo(value: number, step: number): number {
  if (!Number.isFinite(step) || step <= 0) return Math.round(value);
  return Math.round(value / step) * step;
}
