import type { OrderStatus, SyncStatus } from '@/types';

/** Все статусы в порядке жизненного цикла. */
export const ORDER_STATUSES: OrderStatus[] = ['new', 'confirmed', 'ready', 'completed', 'declined'];

/** Подписи статусов заказа (видны и клиенту, и владельцу). */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'Новый',
  confirmed: 'Подтверждён · готовится',
  ready: 'Готов к выдаче',
  completed: 'Забран / доставлен',
  declined: 'Не подтверждён',
};

/** Что клиент видит в кабинете и уведомлении при этом статусе. */
export const ORDER_STATUS_CUSTOMER_TEXT: Record<OrderStatus, string> = {
  new: 'Заказ принят и ждёт подтверждения кондитера.',
  confirmed: 'Кондитер подтвердил заказ и уже готовит его.',
  ready: 'Торт готов — можно забирать или ждать доставку.',
  completed: 'Спасибо за заказ! Будем рады видеть вас снова.',
  declined: 'Не удалось подтвердить заказ. Свяжитесь с нами — попробуем найти решение.',
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
    primary: { status: 'confirmed', label: 'Подтвердить заказ', variant: 'primary' },
    decline: { status: 'declined', label: 'Клиент не подтвердил', variant: 'danger' },
  },
  confirmed: {
    primary: { status: 'ready', label: 'Готов к выдаче', variant: 'primary' },
    decline: { status: 'declined', label: 'Клиент не подтвердил', variant: 'danger' },
  },
  ready: {
    primary: { status: 'completed', label: 'Клиент забрал / доставлен', variant: 'primary' },
    decline: { status: 'declined', label: 'Клиент не подтвердил', variant: 'danger' },
  },
  completed: {
    reopen: { status: 'confirmed', label: 'Вернуть в работу', variant: 'outline' },
  },
  declined: {
    reopen: { status: 'confirmed', label: 'Вернуть в работу', variant: 'outline' },
  },
};

/** Активные заказы: ещё не завершены и не отклонены. */
export function isActiveStatus(status: OrderStatus): boolean {
  return status === 'new' || status === 'confirmed' || status === 'ready';
}

export const SYNC_STATUS_LABELS: Record<SyncStatus, string> = {
  sent: 'Заказ отправлен кондитеру в Telegram',
  demo: 'Демо-режим: заказ сохранён на устройстве (Telegram не подключён)',
  failed: 'Не удалось отправить заказ',
};
