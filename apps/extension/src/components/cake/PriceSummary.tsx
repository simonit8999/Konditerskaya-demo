import type { ReactNode } from 'react';
import { PriceTag } from '@/components/ui/PriceTag';
import type { CakeConfig, PriceBreakdown } from '@/types';
import { getBase, getCream, getDecorations, getFilling, getSize } from '@/utils/cake';
import { cn } from '@/utils/cn';
import { formatPrice } from '@/utils/formatPrice';
import { roundTo } from '@/utils/priceCalculator';

interface PriceSummaryProps {
  config: CakeConfig;
  price: PriceBreakdown;
  children?: ReactNode;
  className?: string;
}

/**
 * Сводка состава и цены: показывает, из чего складывается стоимость,
 * — это ключевой аргумент B2B-оффера «прозрачная цена».
 */
export function PriceSummary({ config, price, children, className }: PriceSummaryProps) {
  const size = getSize(config.sizeId);
  const base = getBase(config.baseId);
  const filling = getFilling(config.fillingId);
  const cream = getCream(config.creamId);
  const decorations = getDecorations(config.decorationIds);

  const extraLabel = (value: number) =>
    value > 0 ? `+${formatPrice(roundTo(value * size.multiplier, 1))}` : 'включено';

  const rows = [
    { label: `Вес: ${size.label}`, value: formatPrice(price.base) },
    { label: `Основа: ${base.label}`, value: extraLabel(base.extraPrice) },
    { label: `Начинка: ${filling.label}`, value: extraLabel(filling.extraPrice) },
    { label: `Крем: ${cream.label}`, value: extraLabel(cream.extraPrice) },
    { label: 'Декор', value: decorations.length > 0 ? formatPrice(price.decorations) : '—' },
    { label: 'Надпись', value: price.inscription > 0 ? formatPrice(price.inscription) : '—' },
  ];

  return (
    <div className={cn('rounded-3xl border border-line bg-cream-50 p-5 shadow-card', className)}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-lg text-cocoa">Ваш торт</h3>
        <span className="chip">{size.servings}</span>
      </div>
      {size.hint && <p className="mt-1 text-xs text-ink/60">{size.hint}</p>}

      <dl className="mt-4 space-y-2 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex items-baseline justify-between gap-3">
            <dt className="text-ink/65">{row.label}</dt>
            <dd className="shrink-0 font-semibold tabular-nums text-cocoa">{row.value}</dd>
          </div>
        ))}
      </dl>

      {decorations.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {decorations.map((item) => (
            <li key={item.id} className="chip">
              {item.label}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex items-end justify-between gap-3 border-t border-line/70 pt-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.12em] text-ink/50">Итого</p>
          <PriceTag
            value={price.total}
            className="mt-1 font-display text-3xl font-semibold leading-none text-caramel-dark"
          />
        </div>
        <p className="max-w-[9.5rem] text-right text-[11px] leading-snug text-ink/50">
          Цена пересчитывается автоматически при каждом изменении
        </p>
      </div>

      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
