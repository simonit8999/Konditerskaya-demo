import { Icon } from '@/components/ui/Icon';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/utils/cn';
import { formatDateTimeRu } from '@/utils/date';

interface NotificationPanelProps {
  open: boolean;
  onClose: () => void;
}

/** Панель уведомлений клиента: статусы заказов, отметки о прочтении. */
export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications('customer');

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Закрыть уведомления"
        onClick={onClose}
        className="fixed inset-0 z-40 cursor-default bg-cocoa-dark/10 backdrop-blur-[1px]"
      />

      <div
        role="dialog"
        aria-label="Уведомления"
        className="absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-line bg-cream-50 shadow-soft"
      >
        <div className="flex items-center justify-between gap-2 border-b border-line/70 px-4 py-3">
          <p className="font-display text-base text-cocoa">Уведомления</p>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="text-xs font-semibold text-caramel-dark transition-colors hover:underline"
            >
              Прочитать все
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm leading-relaxed text-ink/60">
            Пока нет уведомлений. Здесь появятся статусы ваших заказов.
          </p>
        ) : (
          <ul className="max-h-[min(60vh,26rem)] divide-y divide-line/60 overflow-y-auto">
            {notifications.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => markRead(item.id)}
                  className={cn(
                    'flex w-full items-start gap-2.5 px-4 py-3 text-left transition-colors hover:bg-cream-200/50',
                    !item.readAt && 'bg-gold/5',
                  )}
                >
                  <span
                    className={cn(
                      'mt-1.5 size-2 shrink-0 rounded-full',
                      item.readAt ? 'bg-line' : 'bg-berry',
                    )}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="text-sm font-semibold text-cocoa">{item.title}</span>
                      <span className="shrink-0 text-[10px] text-ink/45">
                        {formatDateTimeRu(item.createdAt)}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-ink/65">
                      {item.body}
                    </span>
                  </span>
                  {!item.readAt && <span className="sr-only">Непрочитано</span>}
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center gap-2 border-t border-line/70 px-4 py-2.5 text-[11px] leading-relaxed text-ink/50">
          <Icon name="info" className="size-3.5 shrink-0 text-caramel" />
          Уведомления приходят внутри приложения. Telegram и email — следующий этап.
        </div>
      </div>
    </>
  );
}
