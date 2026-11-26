/**
 * Формирование сообщения для Telegram (HTML parse mode).
 * Держим отдельным модулем, чтобы этот же формат можно было использовать
 * в serverless-функции без изменений.
 */

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatMoney(value) {
  return `${new Intl.NumberFormat('ru-RU').format(Math.round(Number(value) || 0))} ₽`;
}

/**
 * @param {object} order — заказ из PWA (см. src/types/index.ts -> Order)
 * @returns {string} текст сообщения не длиннее 4000 символов
 */
export function formatOrderMessage(order) {
  const lines = [];

  lines.push(`🍰 <b>Новый заказ ${escapeHtml(order.number)}</b>`);
  lines.push('');

  (order.items ?? []).forEach((item, index) => {
    lines.push(`${index + 1}. <b>${escapeHtml(item.title)}</b> — ${formatMoney(item.price)}`);
    (item.composition ?? []).forEach((row) => lines.push(`   • ${escapeHtml(row)}`));
    lines.push('');
  });

  const customer = order.customer ?? {};
  lines.push(`👤 ${escapeHtml(customer.name)}`);
  lines.push(`📞 ${escapeHtml(customer.phone)}`);
  if (customer.email) lines.push(`✉️ ${escapeHtml(customer.email)}`);

  const delivery = order.delivery ?? {};
  if (delivery.method === 'delivery') {
    lines.push(`🚚 ${escapeHtml(delivery.address)}`);
  } else {
    lines.push('🏪 Самовывоз');
  }
  lines.push(`🗓 ${escapeHtml(delivery.date)} · ${escapeHtml(delivery.timeSlot)}`);

  if (delivery.comment) lines.push(`💬 ${escapeHtml(delivery.comment)}`);

  lines.push('');
  lines.push(`Доставка: ${order.deliveryFee > 0 ? formatMoney(order.deliveryFee) : 'бесплатно'}`);
  lines.push(`<b>Итого: ${formatMoney(order.total)}</b>`);

  const message = lines.join('\n');
  return message.length > 4000 ? `${message.slice(0, 3990)}…` : message;
}

/** Проверка минимальной валидности payload из клиента. */
export function validateOrder(order) {
  if (!order || typeof order !== 'object') return 'Пустой заказ';
  if (!order.number) return 'Нет номера заказа';
  if (!Array.isArray(order.items) || order.items.length === 0) return 'Нет позиций заказа';
  if (!order.customer?.name) return 'Нет имени клиента';
  if (!order.customer?.phone) return 'Нет телефона клиента';
  if (!order.delivery?.date) return 'Нет даты получения';
  return null;
}
