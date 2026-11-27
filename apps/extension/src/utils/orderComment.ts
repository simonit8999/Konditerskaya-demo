import type { Order } from '@/types';

export const COMMENT_MAX_LENGTH = 500;

/** Быстрые подсказки в оформлении заказа: текст добавляется в комментарий. */
export const COMMENT_PRESETS: { id: string; label: string; text: string }[] = [
  { id: 'nuts', label: 'Аллергия на орехи', text: 'аллергия на орехи' },
  { id: 'lactose', label: 'Без лактозы', text: 'без лактозы' },
  { id: 'gluten', label: 'Без глютена', text: 'без глютена' },
  { id: 'fondant', label: 'Без мастики', text: 'без мастики' },
  { id: 'candles', label: 'Нужны свечи', text: 'нужны свечи' },
  { id: 'call', label: 'Позвонить за час', text: 'позвонить за час до доставки' },
];

/** Комментарий заказа: новое поле с fallback на старые данные в delivery. */
export function getOrderComment(order: Pick<Order, 'comment' | 'delivery'>): string {
  return order.comment?.trim() || order.delivery.comment?.trim() || '';
}

const ALLERGY_PATTERN = /(аллерг|орех|лактоз|глютен|нельзя|без\s)/i;

/** Владельцу показываем отдельное предупреждение, если клиент пишет об ограничениях. */
export function hasAllergyWarning(comment: string): boolean {
  return ALLERGY_PATTERN.test(comment);
}
