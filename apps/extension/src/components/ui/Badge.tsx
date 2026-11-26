import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export type BadgeTone = 'gold' | 'berry' | 'mint' | 'neutral';

const TONES: Record<BadgeTone, string> = {
  gold: 'border-gold/50 bg-gold/15 text-caramel-dark',
  berry: 'border-berry/30 bg-berry/10 text-berry-dark',
  mint: 'border-mint-deep bg-mint text-ink',
  neutral: 'border-line bg-cream-100 text-ink/70',
};

export function Badge({
  tone = 'gold',
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.06em]',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
