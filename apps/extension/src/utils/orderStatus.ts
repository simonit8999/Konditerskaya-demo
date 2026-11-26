import type { OrderStatus, SyncStatus } from '@/types';

/** Подписи статусов заказа (клиентская часть). */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'Новый',
  processing: 'В обработке',
  ready: 'Готов к выдаче',
  delivered: 'Доставлен',
};

/** Классы для чипа статуса (Tailwind не умеет динамические классы — держим явно). */
export const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  new: 'border-gold/50 bg-gold/15 text-caramel-dark',
  processing: 'border-caramel/40 bg-cream-200 text-cocoa',
  ready: 'border-mint-deep bg-mint text-ink',
  delivered: 'border-line bg-cream-100 text-ink/70',
};

/** Порядок статусов для демо-переключения в кабинете. */
export const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  new: 'processing',
  processing: 'ready',
  ready: 'delivered',
  delivered: null,
};

export const SYNC_STATUS_LABELS: Record<SyncStatus, string> = {
  sent: 'Заказ отправлен кондитеру в Telegram',
  demo: 'Демо-режим: заказ сохранён на устройстве (Telegram не подключён)',
  failed: 'Не удалось отправить заказ',
};
