import type { OrderStatus, SyncStatus } from '@/types';

/** Все статусы в порядке жизненного цикла. */
export const ORDER_STATUSES: OrderStatus[] = ['new', 'confirmed', 'ready', 'completed', 'declined'];

/** Подписи статусов заказа (видны и клиенту, и владельцу). */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'Новая заявка',
  confirmed: 'В работе',
  ready: 'Готов к выдаче',
  completed: 'Доставлен',
  declined: 'Отменён',
};

/** Что клиент видит в кабинете и уведомлении при этом статусе. */
export const ORDER_STATUS_CUSTOMER_TEXT: Record<OrderStatus, string> = {
  new: 'Заявка принята и ждёт подтверждения кондитера.',
  confirmed: 'Заказ в работе: кондитер уже готовит его.',
  ready: 'Торт готов — можно забирать или ждать доставку.',
  completed: 'Заказ доставлен. Спасибо за заказ — будем рады видеть вас снова!',
  declined: 'Заказ отменён. Свяжитесь с нами — попробуем найти решение.',
};

/** Классы для чипа статуса (Tailwind не умеет динамические классы — держим явно). */
export const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  new: 'border-gold/50 bg-gold/15 text-caramel-dark',
  confirmed: 'border-caramel/40 bg-cream-200 text-cocoa',
  ready: 'border-mint-deep bg-mint text-ink',
  completed: 'border-line bg-cream-100 text-ink/70',
  declined: 'border-berry/30 bg-berry/10 text-berry-dark',
};

export type OrderActionVariant = 'primary' | 'outline' | 'danger';

export interface OrderStatusAction {
  status: OrderStatus;
  label: string;
  variant: OrderActionVariant;
}

/** Действия владельца для каждого статуса. */
export const ORDER_STATUS_ACTIONS: Record<
  OrderStatus,
  { primary?: OrderStatusAction; decline?: OrderStatusAction; reopen?: OrderStatusAction }
> = {
  new: {
    primary: { status: 'confirmed', label: 'Взять в работу', variant: 'primary' },
    decline: { status: 'declined', label: 'Отменить заказ', variant: 'danger' },
  },
  confirmed: {
    primary: { status: 'ready', label: 'Готов к выдаче', variant: 'primary' },
    decline: { status: 'declined', label: 'Отменить заказ', variant: 'danger' },
  },
  ready: {
    primary: { status: 'completed', label: 'Заказ доставлен', variant: 'primary' },
    decline: { status: 'declined', label: 'Отменить заказ', variant: 'danger' },
  },
  completed: {
    reopen: { status: 'confirmed', label: 'Вернуть в работу', variant: 'outline' },
  },
  declined: {
    reopen: { status: 'confirmed', label: 'Вернуть в работу', variant: 'outline' },
  },
};

/**
 * Быстрые действия прямо в карточке заказа: одна кнопка — один переход.
 * Порядок фиксирован, чтобы кнопки не «прыгали» между карточками.
 */
export interface OrderQuickAction {
  status: OrderStatus;
  label: string;
  tone: 'work' | 'done' | 'cancel';
}

export const ORDER_STATUS_QUICK_ACTIONS: OrderQuickAction[] = [
  { status: 'confirmed', label: 'В работе', tone: 'work' },
  { status: 'completed', label: 'Доставлен', tone: 'done' },
  { status: 'declined', label: 'Отменён', tone: 'cancel' },
];

/** Активные заказы: ещё не завершены и не отклонены. */
export function isActiveStatus(status: OrderStatus): boolean {
  return status === 'new' || status === 'confirmed' || status === 'ready';
}

export const SYNC_STATUS_LABELS: Record<SyncStatus, string> = {
  sent: 'Заказ отправлен кондитеру в Telegram',
  demo: 'Демо-режим: заказ сохранён на устройстве (Telegram не подключён)',
  failed: 'Не удалось отправить заказ',
};
