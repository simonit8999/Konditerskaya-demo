import { Link } from 'react-router-dom';
import { CakePreview } from '@/components/cake/CakePreview';
import { buttonStyles } from '@/components/ui/Button';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import type { CartItem } from '@/types';
import { describeCake, getDecorations } from '@/utils/cake';
import { formatPrice } from '@/utils/formatPrice';

interface CartItemCardProps {
  item: CartItem;
  onRemove: (id: string) => void;
}

/** Позиция корзины: превью, состав, цена и действия. */
export function CartItemCard({ item, onRemove }: CartItemCardProps) {
  const description = describeCake(item.config);
  const decorations = getDecorations(item.config.decorationIds);
  const editLink = `/builder?edit=${item.id}`;

  return (
    <article className="flex flex-col gap-4 rounded-3xl border border-line bg-cream-50 p-4 shadow-card sm:flex-row">
      <Link
        to={editLink}
        aria-label={`Изменить состав: ${description.title}`}
        className="mx-auto w-full max-w-[132px] shrink-0 rounded-2xl bg-cream-100 p-1 transition-transform hover:scale-[1.02]"
      >
        <CakePreview config={item.config} className="max-h-28" />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-lg leading-snug text-cocoa">{description.title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-ink/60">{description.shortLine}</p>
          </div>
          <p className="shrink-0 font-display text-lg font-semibold text-caramel-dark">
            {formatPrice(item.price)}
          </p>
        </div>

        <ul className="mt-2.5 flex flex-wrap gap-1.5">
          {decorations.map((decoration) => (
            <li key={decoration.id} className="chip">
              {decoration.label}
            </li>
          ))}
          {item.config.inscription && (
            <li className="chip">Надпись: «{item.config.inscription}»</li>
          )}
        </ul>

        <div className="mt-3.5 flex flex-wrap gap-2">
          <Link to={editLink} className={buttonStyles('outline', 'sm')}>
            <Icon name="edit" className="size-3.5" />
            Изменить
          </Link>
          <Button variant="danger" size="sm" onClick={() => onRemove(item.id)}>
            <Icon name="trash" className="size-3.5" />
            Удалить
          </Button>
        </div>
      </div>
    </article>
  );
}
