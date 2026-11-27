import { useMemo } from 'react';
import { useNotificationsContext } from '@/context/NotificationsContext';
import type { NotificationAudience } from '@/types';

/**
 * Уведомления одной аудитории: клиент видит статусы своих заказов,
 * владелец — новые заказы и заметки.
 */
export function useNotifications(audience: NotificationAudience = 'customer') {
  const { notifications, markRead, markAllRead } = useNotificationsContext();

  return useMemo(() => {
    const list = notifications.filter((item) => item.audience === audience);

    return {
      notifications: list,
      unreadCount: list.filter((item) => !item.readAt).length,
      markRead,
      markAllRead: () => markAllRead(audience),
    };
  }, [notifications, audience, markRead, markAllRead]);
}
