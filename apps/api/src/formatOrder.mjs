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

function escapeAttr(value) {
  return escapeHtml(value).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

const CONTACT_LABELS = {
  telegram: 'Telegram',
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  vk: 'VK',
  other: 'Другое',
};

/** Кликабельная ссылка на мессенджер из необязательного contact клиента. */
export function buildMessengerLink(contact) {
  if (!contact || typeof contact.handle !== 'string') return null;

  const raw = contact.handle.trim();
  if (!raw) return null;

  const nick = raw.replace(/^@+/, '');

  switch (contact.channel) {
    case 'telegram':
      return nick ? `https://t.me/${encodeURIComponent(nick)}` : null;
    case 'whatsapp': {
      let digits = raw.replace(/\D/g, '');
      if (digits.length === 11 && digits.startsWith('8')) digits = `7${digits.slice(1)}`;
      return digits.length >= 10 ? `https://wa.me/${digits}` : null;
    }
    case 'instagram':
      return nick ? `https://instagram.com/${encodeURIComponent(nick)}` : null;
    case 'vk': {
      const vkNick = nick.replace(/^https?:\/\/(www\.)?vk\.com\//i, '');
      return vkNick ? `https://vk.com/${encodeURIComponent(vkNick)}` : null;
    }
    default:
      return null;
  }
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

  if (customer.contact?.handle) {
    const label = `${CONTACT_LABELS[customer.contact.channel] ?? 'Связь'}: ${customer.contact.handle}`;
    const link = buildMessengerLink(customer.contact);
    lines.push(
      link
        ? `📱 <a href="${escapeAttr(link)}">${escapeHtml(label)}</a>`
        : `📱 ${escapeHtml(label)}`,
    );
  }

  const delivery = order.delivery ?? {};
  if (delivery.method === 'delivery') {
    lines.push(`🚚 ${escapeHtml(delivery.address)}`);
  } else {
    lines.push('🏪 Самовывоз');
  }
  lines.push(`🗓 ${escapeHtml(delivery.date)} · ${escapeHtml(delivery.timeSlot)}`);

  // Новые заказы хранят комментарий на уровне заказа, старые — в delivery.
  const comment = order.comment || delivery.comment;
  if (comment) lines.push(`💬 ${escapeHtml(comment)}`);

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
