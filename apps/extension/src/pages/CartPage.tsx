import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CartItemCard } from '@/components/cart/CartItemCard';
import { CartSummary } from '@/components/cart/CartSummary';
import { Button } from '@/components/ui/Button';
import { buttonStyles } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { Modal } from '@/components/ui/Modal';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/useToast';
import { siteContent } from '@/references';

/** Корзина: список тортов, правка состава, удаление с подтверждением, итог. */
export function CartPage() {
  const { items, subtotal, removeItem } = useCart();
  const { showToast } = useToast();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const { delivery } = siteContent;

  const handleConfirmRemove = () => {
    if (!pendingId) return;
    removeItem(pendingId);
    setPendingId(null);
    showToast('Позиция удалена из корзины', 'info');
  };

  return (
    <div className="container-page py-8 lg:py-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[clamp(1.75rem,3.6vw,2.5rem)] leading-tight text-cocoa">
            Ваш заказ
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink/70">
            Проверьте состав и переходите к оформлению.
          </p>
        </div>
        {items.length > 0 && (
          <span className="chip">
            {items.length} {items.length === 1 ? 'торт' : 'торта'}
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon="cart"
          title="В корзине пока пусто"
          text="Соберите свой первый торт — это займёт около минуты: вес, основа, начинка, крем и декор."
          action={
            <Link to="/builder" className={buttonStyles('primary', 'md')}>
              <Icon name="cake" className="size-4" />
              Собрать торт
            </Link>
          }
        />
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-3">
            {items.map((item) => (
              <CartItemCard key={item.id} item={item} onRemove={setPendingId} />
            ))}

            <div className="flex flex-wrap gap-2 pt-1">
              <Link to="/builder" className={buttonStyles('outline', 'md')}>
                <Icon name="plus" className="size-4" />
                Добавить ещё торт
              </Link>
            </div>
          </div>

          <aside>
            <div className="sticky top-24">
              <CartSummary
                subtotal={subtotal}
                deliveryFee={delivery.fee}
                freeFrom={delivery.freeFrom}
              >
                <Link to="/checkout" className={buttonStyles('primary', 'lg', true)}>
                  <Icon name="arrowRight" className="size-5" />
                  Оформить заказ
                </Link>
                <p className="mt-2 text-center text-[11px] leading-relaxed text-ink/50">
                  Оплата при получении — без предоплаты
                </p>
              </CartSummary>
            </div>
          </aside>
        </div>
      )}

      <Modal
        open={Boolean(pendingId)}
        onClose={() => setPendingId(null)}
        title="Удалить торт из заказа?"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" fullWidth onClick={() => setPendingId(null)}>
              Оставить
            </Button>
            <Button variant="secondary" fullWidth onClick={handleConfirmRemove}>
              Удалить
            </Button>
          </div>
        }
      >
        <p className="text-sm leading-relaxed text-ink/70">
          Позиция исчезнет из корзины. Состав можно собрать заново в конструкторе в любой момент.
        </p>
      </Modal>
    </div>
  );
}
