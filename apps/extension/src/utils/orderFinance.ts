import { businessSettings } from '@/references';
import type { DeliveryMethod, OrderFinance } from '@/types';

export interface FinanceSettings {
  defaultCostRate: number;
  packagingCostPerItem: number;
  deliveryCost: number;
}

export interface OrderFinanceInput {
  items: { price: number }[];
  deliveryMethod: DeliveryMethod;
  /** Сумма, которую платит клиент (позиции + доставка). */
  total: number;
  settings?: FinanceSettings;
}

function nonNegative(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

/**
 * Демо-расчёт себестоимости и прибыли.
 *
 *   себестоимость позиции = round(цена × defaultCostRate)
 *   упаковка             = packagingCostPerItem × количество позиций
 *   доставка             = deliveryCost, если способ «доставка»
 *   прибыль              = сумма заказа − итого себестоимость
 *   маржа, %             = прибыль / сумма заказа × 100
 *
 * Ставки живут в references/business.json — владелец меняет их без правки кода.
 * Точный расчёт по ингредиентам появится вместе с БД.
 */
export function calculateOrderFinance({
  items,
  deliveryMethod,
  total,
  settings = businessSettings.finance,
}: OrderFinanceInput): OrderFinance {
  const rate = Math.min(1, Math.max(0, settings.defaultCostRate));

  const itemsCost = items.reduce(
    (sum, item) => sum + Math.round(nonNegative(item.price) * rate),
    0,
  );
  const packagingCost = Math.round(nonNegative(settings.packagingCostPerItem)) * items.length;
  const deliveryCost = deliveryMethod === 'delivery' ? Math.round(nonNegative(settings.deliveryCost)) : 0;
  const costTotal = itemsCost + packagingCost + deliveryCost;

  const revenue = nonNegative(total);
  const profit = revenue - costTotal;
  const marginPercent = revenue > 0 ? Math.round((profit / revenue) * 1000) / 10 : 0;

  return { itemsCost, packagingCost, deliveryCost, costTotal, profit, marginPercent };
}
