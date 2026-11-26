import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface SectionTitleProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center';
  action?: ReactNode;
  className?: string;
}

export function SectionTitle({
  eyebrow,
  title,
  description,
  align = 'left',
  action,
  className,
}: SectionTitleProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3',
        align === 'center' && 'items-center text-center',
        Boolean(action) && 'sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      <div className={cn('max-w-2xl', align === 'center' && 'mx-auto')}>
        {eyebrow && (
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-caramel">
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-[clamp(1.6rem,3.2vw,2.25rem)] leading-tight text-cocoa">
          {title}
        </h2>
        {description && (
          <p className="mt-3 text-[15px] leading-relaxed text-ink/75">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
