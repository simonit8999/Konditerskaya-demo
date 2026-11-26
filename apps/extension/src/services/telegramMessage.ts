import type { Order } from '@/types';
import { formatDateRu } from '@/utils/date';
import { formatPrice } from '@/utils/formatPrice';

/**
 * Текст заказа для ручной отправки/копирования (fallback, если API недоступен
 * или кондитер ещё не подключил бота).
 */
export function buildOrderText(order: Order): string {
  const lines: string[] = [];

  lines.push(`Заказ ${order.number} · ${formatDateRu(order.delivery.date)} ${order.delivery.timeSlot}`);
  lines.push('');

  order.items.forEach((item, index) => {
    lines.push(`${index + 1}) ${item.title} — ${formatPrice(item.price)}`);
    item.composition.forEach((row) => lines.push(`   • ${row}`));
    lines.push('');
  });

  const { customer, delivery } = order;
  lines.push(`Клиент: ${customer.name}`);
  lines.push(`Телефон: ${customer.phone}`);
  if (customer.email) lines.push(`Email: ${customer.email}`);
  lines.push(
    delivery.method === 'delivery'
      ? `Доставка: ${delivery.address ?? 'адрес не указан'}`
      : 'Самовывоз из кондитерской',
  );
  if (delivery.comment) lines.push(`Комментарий: ${delivery.comment}`);
  lines.push(`Доставка: ${order.deliveryFee > 0 ? formatPrice(order.deliveryFee) : 'бесплатно'}`);
  lines.push(`Итого: ${formatPrice(order.total)}`);

  return lines.join('\n');
}

/** Ссылка «Поделиться в Telegram» для ручной отправки заказа. */
export function buildTelegramShareLink(text: string): string {
  return `https://t.me/share/url?text=${encodeURIComponent(text)}`;
}
