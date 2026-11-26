import type { ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';
import type { IconName } from '@/components/ui/Icon';
import { cn } from '@/utils/cn';

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  text?: string;
  action?: ReactNode;
  className?: string;
}

/** Пустое состояние: корзина, заказы, поиск. */
export function EmptyState({ icon = 'cake', title, text, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-3xl border border-dashed border-line bg-cream-50/70 px-6 py-12 text-center',
        className,
      )}
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-blush-soft text-caramel">
        <Icon name={icon} className="size-7" />
      </span>
      <h3 className="mt-4 font-display text-xl text-cocoa">{title}</h3>
      {text && <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink/70">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
