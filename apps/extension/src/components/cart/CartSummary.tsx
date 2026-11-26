import type { ReactNode } from 'react';
import { PriceTag } from '@/components/ui/PriceTag';
import { cn } from '@/utils/cn';
import { formatPrice } from '@/utils/formatPrice';

interface CartSummaryProps {
  subtotal: number;
  deliveryFee: number;
  freeFrom: number;
  children?: ReactNode;
  className?: string;
}

/** Итоги корзины: сумма, условия доставки, итог. */
export function CartSummary({
  subtotal,
  deliveryFee,
  freeFrom,
  children,
  className,
}: CartSummaryProps) {
  const deliveryFree = subtotal >= freeFrom;
  const remaining = Math.max(freeFrom - subtotal, 0);

  return (
    <div className={cn('rounded-3xl border border-line bg-cream-50 p-5 shadow-card', className)}>
      <h2 className="font-display text-lg text-cocoa">Итог</h2>

      <dl className="mt-4 space-y-2.5 text-sm">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-ink/65">Сумма заказа</dt>
          <dd className="font-semibold tabular-nums text-cocoa">{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-ink/65">Доставка</dt>
          <dd className="font-semibold text-cocoa">
            {deliveryFree ? 'бесплатно' : `от ${formatPrice(deliveryFee)}`}
          </dd>
        </div>
      </dl>

      {!deliveryFree && (
        <p className="mt-3 rounded-2xl bg-mint-soft px-3 py-2 text-xs leading-relaxed text-ink/70">
          До бесплатной доставки — {formatPrice(remaining)}. Или выберите самовывоз на следующем шаге.
        </p>
      )}

      <div className="mt-4 flex items-end justify-between gap-3 border-t border-line/70 pt-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.12em] text-ink/50">К оплате</p>
          <PriceTag
            value={subtotal}
            className="mt-1 font-display text-3xl font-semibold leading-none text-caramel-dark"
          />
        </div>
        <p className="max-w-[9.5rem] text-right text-[11px] leading-snug text-ink/50">
          Доставка рассчитывается при оформлении
        </p>
      </div>

      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
