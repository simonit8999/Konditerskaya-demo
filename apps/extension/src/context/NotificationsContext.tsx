import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { notificationRepository } from '@/data/local/notificationRepository';
import { useOrders } from '@/hooks/useOrders';
import { useToast } from '@/hooks/useToast';
import type { NotificationAudience, OrderNotification } from '@/types';

interface NotificationsContextValue {
  notifications: OrderNotification[];
  markRead: (id: string) => void;
  markAllRead: (audience: NotificationAudience) => void;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

/**
 * Уведомления клиенту и владельцу.
 *
 * Сервера пока нет, поэтому уведомления живут в браузере и пересобираются
 * из истории статусов заказов. Вкладки синхронизируются через storage-событие.
 * Когда появится API, источником станет notificationsService (см. README).
 */
export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { orders } = useOrders();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<OrderNotification[]>(() =>
    notificationRepository.listSync(),
  );
  const knownIds = useRef(new Set(notifications.map((item) => item.id)));

  useEffect(() => notificationRepository.subscribe(setNotifications), []);

  useEffect(() => {
    notificationRepository.syncFromOrders(orders);
  }, [orders]);

  // Toast только для новых непрочитанных событий клиента (в т.ч. из другой вкладки).
  useEffect(() => {
    const added = notifications.filter(
      (item) =>
        !knownIds.current.has(item.id) && item.audience === 'customer' && !item.readAt,
    );
    knownIds.current = new Set(notifications.map((item) => item.id));

    added.forEach((item) => showToast(`${item.title} · ${item.body}`, 'info'));
  }, [notifications, showToast]);

  const markRead = useCallback((id: string) => notificationRepository.markRead(id), []);
  const markAllRead = useCallback(
    (audience: NotificationAudience) => notificationRepository.markAllRead(audience),
    [],
  );

  const value = useMemo(
    () => ({ notifications, markRead, markAllRead }),
    [notifications, markRead, markAllRead],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotificationsContext(): NotificationsContextValue {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotificationsContext должен использоваться внутри NotificationsProvider');
  }
  return context;
}
