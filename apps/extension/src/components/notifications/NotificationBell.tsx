import { useState } from 'react';
import { NotificationPanel } from '@/components/notifications/NotificationPanel';
import { Icon } from '@/components/ui/Icon';
import { useNotifications } from '@/hooks/useNotifications';

/** Колокольчик в шапке: бейдж непрочитанных и панель уведомлений. */
export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { unreadCount } = useNotifications('customer');

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={
          unreadCount > 0 ? `Уведомления, непрочитанных: ${unreadCount}` : 'Уведомления'
        }
        aria-expanded={open}
        className="relative flex size-10 items-center justify-center rounded-full text-cocoa transition-colors hover:bg-cream-200/70"
      >
        <Icon name="bell" className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-berry px-1 text-[10px] font-bold leading-4 text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationPanel open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
